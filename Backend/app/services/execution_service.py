from sqlalchemy.orm import Session
from datetime import datetime
from fastapi import HTTPException
from app.models.execution_session import ExecutionSession
from app.models.task import Task
from app.schemas.execution import ExecutionSessionCreate, ExecutionSessionUpdate
from app.services.event_service import log_event
from app.engine.state_machine import transition_task_status


def _worked_seconds(session: ExecutionSession, now: datetime) -> int:
    """
    Seconds actually worked in a session, excluding pauses.

    While ACTIVE, started_at is kept shifted forward by all paused time
    (see resume_session), so worked time is simply now - started_at.
    While PAUSED, the worked total is frozen in duration_seconds.
    """
    if session.status == "PAUSED" and session.duration_seconds is not None:
        return session.duration_seconds
    return max(0, int((now - session.started_at).total_seconds()))


def start_session(db: Session, user_id: int, data: ExecutionSessionCreate):
    """Start a new execution session for a task."""
    # Verify task ownership
    task = db.query(Task).filter(Task.id == data.task_id, Task.user_id == user_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    
    # Check for an existing open (active or paused) session
    open_session = db.query(ExecutionSession).filter(
        ExecutionSession.task_id == data.task_id,
        ExecutionSession.user_id == user_id,
        ExecutionSession.status.in_(["ACTIVE", "PAUSED"]),
    ).first()
    if open_session:
        detail = (
            "Task already has a paused session. Resume it instead."
            if open_session.status == "PAUSED"
            else "Task already has an active session"
        )
        raise HTTPException(status_code=409, detail=detail)
    
    # Enforce task status transition to IN_PROGRESS
    if task.status in ["TODO", "PAUSED"]:
        success, msg = transition_task_status(task, "IN_PROGRESS")
        if not success:
            raise HTTPException(status_code=422, detail=msg)
    
    session = ExecutionSession(
        task_id=data.task_id,
        user_id=user_id,
        started_at=datetime.utcnow(),
        status="ACTIVE",
    )
    db.add(session)
    
    # Log event
    log_event(db, data.task_id, user_id, "TASK_STARTED")
    
    db.commit()
    db.refresh(session)
    return session


def complete_session(db: Session, session_id: int, user_id: int):
    """Complete an execution session and calculate duration."""
    session = db.query(ExecutionSession).filter(
        ExecutionSession.id == session_id,
        ExecutionSession.user_id == user_id,
    ).first()
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    
    if session.status not in ("ACTIVE", "PAUSED"):
        raise HTTPException(status_code=422, detail="Only active or paused sessions can be completed")
    
    # Enforce task status transition to COMPLETED (no-op if already completed)
    task = db.query(Task).filter(Task.id == session.task_id).first()
    if task and task.status != "COMPLETED":
        success, msg = transition_task_status(task, "COMPLETED")
        if not success:
            raise HTTPException(status_code=422, detail=msg)
            
    now = datetime.utcnow()
    session.duration_seconds = _worked_seconds(session, now)
    session.ended_at = now
    session.status = "COMPLETED"
    
    log_event(db, session.task_id, user_id, "TASK_COMPLETED",
              metadata={"session_id": session_id, "duration_seconds": session.duration_seconds})
    
    db.commit()
    db.refresh(session)
    return session


def abandon_session(db: Session, session_id: int, user_id: int):
    """Abandon an execution session without completing."""
    session = db.query(ExecutionSession).filter(
        ExecutionSession.id == session_id,
        ExecutionSession.user_id == user_id,
    ).first()
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    
    if session.status not in ("ACTIVE", "PAUSED"):
        raise HTTPException(status_code=422, detail="Only active or paused sessions can be abandoned")
    
    # Enforce task status transition to PAUSED
    task = db.query(Task).filter(Task.id == session.task_id).first()
    if task and task.status != "PAUSED":
        success, msg = transition_task_status(task, "PAUSED")
        if not success:
            raise HTTPException(status_code=422, detail=msg)
            
    now = datetime.utcnow()
    session.duration_seconds = _worked_seconds(session, now)
    session.ended_at = now
    session.status = "ABANDONED"
    
    log_event(db, session.task_id, user_id, "TASK_PAUSED",
              metadata={"session_id": session_id, "reason": "abandoned"})
    
    db.commit()
    db.refresh(session)
    return session


def pause_session(db: Session, session_id: int, user_id: int):
    """Pause an active execution session."""
    session = db.query(ExecutionSession).filter(
        ExecutionSession.id == session_id,
        ExecutionSession.user_id == user_id,
    ).first()
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    
    if session.status != "ACTIVE":
        raise HTTPException(status_code=422, detail="Only active sessions can be paused")
    
    task = db.query(Task).filter(Task.id == session.task_id).first()
    if task and task.status != "PAUSED":
        success, msg = transition_task_status(task, "PAUSED")
        if not success:
            raise HTTPException(status_code=422, detail=msg)
            
    now = datetime.utcnow()
    session.duration_seconds = _worked_seconds(session, now)
    # While paused, ended_at marks when the pause began.
    session.ended_at = now
    session.status = "PAUSED"
    
    log_event(db, session.task_id, user_id, "TASK_PAUSED",
              metadata={"session_id": session_id, "reason": "user_paused"})
    
    db.commit()
    db.refresh(session)
    return session


def resume_session(db: Session, session_id: int, user_id: int):
    """Resume a paused execution session."""
    session = db.query(ExecutionSession).filter(
        ExecutionSession.id == session_id,
        ExecutionSession.user_id == user_id,
    ).first()
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    
    if session.status != "PAUSED":
        raise HTTPException(status_code=422, detail="Only paused sessions can be resumed")
    
    task = db.query(Task).filter(Task.id == session.task_id).first()
    if task and task.status != "IN_PROGRESS":
        success, msg = transition_task_status(task, "IN_PROGRESS")
        if not success:
            raise HTTPException(status_code=422, detail=msg)
    
    # Shift started_at forward by the length of the pause so that
    # (now - started_at) keeps measuring only time actually worked.
    now = datetime.utcnow()
    if session.ended_at is not None:
        session.started_at = session.started_at + (now - session.ended_at)
    session.status = "ACTIVE"
    session.ended_at = None
    
    log_event(db, session.task_id, user_id, "TASK_STARTED",
              metadata={"session_id": session_id, "reason": "user_resumed"})
    
    db.commit()
    db.refresh(session)
    return session


def get_sessions(db: Session, user_id: int, task_id: int = None) -> list:
    """Get execution sessions, optionally filtered by task."""
    query = db.query(ExecutionSession).filter(ExecutionSession.user_id == user_id)
    if task_id:
        task = db.query(Task).filter(Task.id == task_id, Task.user_id == user_id).first()
        if not task:
            raise HTTPException(status_code=404, detail="Task not found")
        query = query.filter(ExecutionSession.task_id == task_id)
    return query.order_by(ExecutionSession.started_at.desc()).all()


def get_active_session(db: Session, user_id: int) -> list:
    """Get all active sessions for user."""
    return db.query(ExecutionSession).filter(
        ExecutionSession.user_id == user_id,
        ExecutionSession.status == "ACTIVE",
    ).all()
