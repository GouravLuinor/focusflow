from sqlalchemy.orm import Session
from datetime import datetime
from fastapi import HTTPException
from app.models.execution_session import ExecutionSession
from app.models.task import Task
from app.schemas.execution import ExecutionSessionCreate, ExecutionSessionUpdate
from app.services.event_service import log_event
from app.engine.state_machine import transition_task_status


def start_session(db: Session, user_id: int, data: ExecutionSessionCreate):
    """Start a new execution session for a task."""
    # Verify task ownership
    task = db.query(Task).filter(Task.id == data.task_id, Task.user_id == user_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    
    # Check for existing active session
    active = db.query(ExecutionSession).filter(
        ExecutionSession.task_id == data.task_id,
        ExecutionSession.user_id == user_id,
        ExecutionSession.status == "ACTIVE",
    ).first()
    if active:
        raise HTTPException(status_code=409, detail="Task already has an active session")
    
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
    
    if session.status != "ACTIVE":
        raise HTTPException(status_code=422, detail="Only active sessions can be completed")
    
    # Enforce task status transition to COMPLETED
    task = db.query(Task).filter(Task.id == session.task_id).first()
    if task:
        success, msg = transition_task_status(task, "COMPLETED")
        if not success:
            raise HTTPException(status_code=422, detail=msg)
            
    now = datetime.utcnow()
    session.ended_at = now
    session.duration_seconds = int((now - session.started_at).total_seconds())
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
    
    if session.status != "ACTIVE":
        raise HTTPException(status_code=422, detail="Only active sessions can be abandoned")
    
    # Enforce task status transition to PAUSED
    task = db.query(Task).filter(Task.id == session.task_id).first()
    if task:
        success, msg = transition_task_status(task, "PAUSED")
        if not success:
            raise HTTPException(status_code=422, detail=msg)
            
    now = datetime.utcnow()
    session.ended_at = now
    session.duration_seconds = int((now - session.started_at).total_seconds())
    session.status = "ABANDONED"
    
    log_event(db, session.task_id, user_id, "TASK_PAUSED",
              metadata={"session_id": session_id, "reason": "abandoned"})
    
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
