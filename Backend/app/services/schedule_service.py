from sqlalchemy.orm import Session
from datetime import datetime
from app.models.schedule_block import ScheduleBlock
from app.models.task import Task
from app.schemas.schedule import ScheduleBlockCreate, ScheduleBlockUpdate


def create_schedule_block(db: Session, user_id: int, data: ScheduleBlockCreate):
    """Create a schedule block with ownership validation."""
    # Verify task belongs to user
    task = db.query(Task).filter(Task.id == data.task_id, Task.user_id == user_id).first()
    if not task:
        from fastapi import HTTPException
        raise HTTPException(status_code=404, detail="Task not found")
    
    # Validate times
    if data.scheduled_end <= data.scheduled_start:
        from fastapi import HTTPException
        raise HTTPException(status_code=422, detail="scheduled_end must be after scheduled_start")
    
    block = ScheduleBlock(
        user_id=user_id,
        task_id=data.task_id,
        scheduled_start=data.scheduled_start,
        scheduled_end=data.scheduled_end,
        status="PLANNED",
    )
    db.add(block)
    db.commit()
    db.refresh(block)
    return block


def get_schedule_blocks(db: Session, user_id: int, status: str = None):
    """Get schedule blocks for user, optionally filtered by status."""
    query = db.query(ScheduleBlock).filter(ScheduleBlock.user_id == user_id)
    if status:
        query = query.filter(ScheduleBlock.status == status)
    return query.order_by(ScheduleBlock.scheduled_start).all()


def get_schedule_block(db: Session, block_id: int, user_id: int):
    """Get a single schedule block with ownership check."""
    block = db.query(ScheduleBlock).filter(
        ScheduleBlock.id == block_id,
        ScheduleBlock.user_id == user_id
    ).first()
    if not block:
        from fastapi import HTTPException
        raise HTTPException(status_code=404, detail="Schedule block not found")
    return block


def update_schedule_block(db: Session, block_id: int, user_id: int, data: ScheduleBlockUpdate):
    """Update a schedule block with status transition handling."""
    block = get_schedule_block(db, block_id, user_id)
    
    if data.scheduled_start is not None:
        block.scheduled_start = data.scheduled_start
    if data.scheduled_end is not None:
        block.scheduled_end = data.scheduled_end
    
    if data.status is not None:
        old_status = block.status
        new_status = data.status.value if hasattr(data.status, 'value') else data.status
        
        # Track postponement when rescheduling
        if new_status == "RESCHEDULED" and old_status != "RESCHEDULED":
            task = db.query(Task).filter(Task.id == block.task_id).first()
            if task:
                task.postponement_count = (task.postponement_count or 0) + 1
        
        # Set actual times on state transitions
        now = datetime.utcnow()
        if new_status == "ACTIVE" and old_status != "ACTIVE":
            block.actual_start = now
        elif new_status in ["COMPLETED", "MISSED", "CANCELLED"]:
            block.actual_end = now
        
        block.status = new_status
    
    block.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(block)
    return block


def delete_schedule_block(db: Session, block_id: int, user_id: int):
    """Delete a schedule block."""
    block = get_schedule_block(db, block_id, user_id)
    db.delete(block)
    db.commit()
    return {"message": "Schedule block deleted"}
