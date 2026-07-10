from typing import Optional
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session, joinedload

from app.models.user import User
from app.services.task_service import create_task_with_ai
from app.services import dependency_service
from app.db.deps import get_db
from app.core.auth import get_current_user
from app.models.task import Task
from app.schemas.task import TaskCreate, TaskUpdate, TaskResponse
from app.models.execution_session import ExecutionSession
from app.models.schedule_block import ScheduleBlock
from app.engine.adaptation import calculate_adjusted_estimate

router = APIRouter(prefix="/tasks", tags=["tasks"])


# 🔹 Create Task
@router.post("/", response_model=TaskResponse)
def create_task(
    data: TaskCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    support_mode = current_user.profile.support_mode

    return create_task_with_ai(
        db=db,
        user_id=current_user.id,
        title=data.title,
        description=data.description,
        support_mode=support_mode,
        goal_id=data.goal_id,
        parent_task_id=data.parent_task_id,
    )


# 🔹 Get All Tasks (handles BOTH /tasks and /tasks/)
@router.get("/", response_model=list[TaskResponse])
@router.get("", response_model=list[TaskResponse])
def get_tasks(
    goal_id: Optional[int] = None,
    db: Session = Depends(get_db),
    user=Depends(get_current_user),
):
    query = (
        db.query(Task)
        .options(joinedload(Task.steps))
        .filter(Task.user_id == user.id)
    )
    if goal_id is not None:
        query = query.filter(Task.goal_id == goal_id)
        
    tasks = query.all()
    return tasks


# 🔹 Get Executable Tasks
@router.get("/executable", response_model=list[TaskResponse])
def get_executable_tasks(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get all tasks that are currently executable (dependencies met)."""
    return dependency_service.get_executable_tasks_for_user(db, current_user.id)


# 🔹 Update Task
@router.put("/{task_id}", response_model=TaskResponse)
def update_task(
    task_id: int,
    data: TaskUpdate,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    task = db.query(Task).filter(
        Task.id == task_id,
        Task.user_id == user.id
    ).first()

    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    if data.title is not None:
        task.title = data.title

    if data.description is not None:
        task.description = data.description

    if data.is_completed is not None:
        if task.is_completed != data.is_completed:
            new_status = "COMPLETED" if data.is_completed else "TODO"
            from app.engine.state_machine import transition_task_status
            success, msg = transition_task_status(task, new_status)
            if not success:
                raise HTTPException(status_code=422, detail=msg)

    db.commit()
    db.refresh(task)

    return task


# 🔹 Delete Task
@router.delete("/{task_id}")
def delete_task(
    task_id: int,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    task = db.query(Task).filter(
        Task.id == task_id,
        Task.user_id == user.id
    ).first()

    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    db.delete(task)
    db.commit()

    return {"message": "Task deleted"}


# 🔹 Get Blocking Tasks
@router.get("/{task_id}/blocking", response_model=list[TaskResponse])
def get_blocking_tasks(
    task_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get tasks that are blocking this task from being executable."""
    return dependency_service.get_blocking_tasks_for_task(db, task_id, current_user.id)


# 🔹 Get Task Estimate
@router.get("/{task_id}/estimate")
def get_task_estimate(
    task_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Get original and adjusted duration estimate for a task."""
    task = db.query(Task).filter(Task.id == task_id, Task.user_id == current_user.id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    
    # Get completed sessions for this task
    completed = db.query(ExecutionSession).filter(
        ExecutionSession.task_id == task_id,
        ExecutionSession.status == "COMPLETED",
    ).order_by(ExecutionSession.ended_at.desc()).all()
    
    user_estimate_minutes = task.estimated_minutes
    return calculate_adjusted_estimate(user_estimate_minutes, completed)


# 🔹 Get Focus Mode
@router.get("/{task_id}/focus")
def get_focus_mode(
    task_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Get a single-task focus view with progress, session, and available actions.
    Designed for neuro-inclusive UX: minimal, actionable, single-task display.
    """
    task = db.query(Task).filter(Task.id == task_id, Task.user_id == current_user.id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    
    # Get active session
    active_session = db.query(ExecutionSession).filter(
        ExecutionSession.task_id == task_id,
        ExecutionSession.status == "ACTIVE",
    ).first()
    
    # Get completed sessions for estimate
    completed_sessions = db.query(ExecutionSession).filter(
        ExecutionSession.task_id == task_id,
        ExecutionSession.status == "COMPLETED",
    ).order_by(ExecutionSession.ended_at.desc()).all()
    
    # Get adaptive estimate
    user_estimate_minutes = task.estimated_minutes
    estimate = calculate_adjusted_estimate(user_estimate_minutes, completed_sessions)
    
    # Get subtask progress
    subtasks = db.query(Task).filter(Task.parent_task_id == task_id).all()
    subtasks_total = len(subtasks)
    subtasks_completed = sum(1 for s in subtasks if s.is_completed)
    
    # Get blocking tasks
    blocking = dependency_service.get_blocking_tasks_for_task(db, task_id, current_user.id)
    
    # Get tasks this unlocks
    from app.models.task_dependency import TaskDependency
    dependent_edges = db.query(TaskDependency).filter(
        TaskDependency.depends_on_task_id == task_id
    ).all()
    dependent_ids = [d.task_id for d in dependent_edges]
    unlocks = db.query(Task).filter(Task.id.in_(dependent_ids)).all() if dependent_ids else []
    
    # Get today's schedule
    from datetime import datetime, timezone
    now = datetime.now(timezone.utc)
    today_start = now.replace(hour=0, minute=0, second=0, microsecond=0)
    today_end = today_start.replace(hour=23, minute=59, second=59)
    
    schedule_today = db.query(ScheduleBlock).filter(
        ScheduleBlock.task_id == task_id,
        ScheduleBlock.scheduled_start >= today_start,
        ScheduleBlock.scheduled_start <= today_end,
    ).first()
    
    # Determine available actions based on current status
    actions = []
    status = task.status.upper() if task.status else "TODO"
    
    from app.engine.state_machine import VALID_TRANSITIONS
    valid_next = VALID_TRANSITIONS.get(status, [])
    
    # Map transitions to user-friendly actions
    action_map = {
        "IN_PROGRESS": "START",
        "COMPLETED": "COMPLETE",
        "PAUSED": "PAUSE",
        "CANCELLED": "SKIP",
    }
    for transition in valid_next:
        if transition in action_map:
            actions.append(action_map[transition])
    
    # Add RESCHEDULE if scheduled today
    if schedule_today:
        actions.append("RESCHEDULE")
    
    # Build response
    response = {
        "task_id": task.id,
        "title": task.title,
        "description": task.description,
        "status": status,
        "priority": task.priority or "MEDIUM",
        "estimated_minutes": user_estimate_minutes,
        "adjusted_estimate_minutes": estimate["adjusted_minutes"],
        "estimate_confidence": estimate["confidence"],
        "progress": {
            "subtasks_total": subtasks_total,
            "subtasks_completed": subtasks_completed,
        },
        "blocking_tasks": [
            {"id": b.id, "title": b.title} for b in blocking
        ],
        "unlocks_tasks": [
            {"id": u.id, "title": u.title} for u in unlocks
        ],
        "available_actions": actions,
        "schedule_today": None,
    }
    
    # Active session info
    if active_session:
        elapsed = int((now - active_session.started_at).total_seconds())
        response["active_session"] = {
            "session_id": active_session.id,
            "started_at": active_session.started_at.isoformat(),
            "elapsed_seconds": elapsed,
        }
    else:
        response["active_session"] = None
    
    # Schedule info
    if schedule_today:
        response["schedule_today"] = {
            "scheduled_start": schedule_today.scheduled_start.isoformat(),
            "scheduled_end": schedule_today.scheduled_end.isoformat(),
        }
    
    return response
