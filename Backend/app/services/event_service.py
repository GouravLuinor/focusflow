from sqlalchemy.orm import Session
from app.models.task_event import TaskEvent
import json


def log_event(
    db: Session,
    task_id: int,
    user_id: int,
    event_type: str,
    metadata: dict = None,
    commit: bool = False,
):
    """
    Log a task event. By default does NOT commit (caller handles transaction).
    Set commit=True for standalone event logging.
    """
    event = TaskEvent(
        task_id=task_id,
        user_id=user_id,
        event_type=event_type,
        metadata_json=json.dumps(metadata) if metadata else None,
    )
    db.add(event)
    if commit:
        db.commit()
    return event


def get_task_events(db: Session, task_id: int, user_id: int) -> list:
    """Get all events for a task with ownership check."""
    from app.models.task import Task
    from fastapi import HTTPException
    
    task = db.query(Task).filter(Task.id == task_id, Task.user_id == user_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    
    return db.query(TaskEvent).filter(
        TaskEvent.task_id == task_id
    ).order_by(TaskEvent.created_at.desc()).all()
