from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from typing import Optional
from app.core.auth import get_current_user
from app.db.deps import get_db
from app.models.user import User
from app.schemas.schedule import (
    ScheduleBlockCreate,
    ScheduleBlockUpdate,
    ScheduleBlockResponse,
    ScheduleGenerateRequest,
    SchedulePlanResponse,
)
from app.services import schedule_service, scheduler_service

router = APIRouter(prefix="/schedule", tags=["schedule"])


@router.post("/blocks", response_model=ScheduleBlockResponse, status_code=201)
def create_block(
    data: ScheduleBlockCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Schedule a task for a specific time block."""
    return schedule_service.create_schedule_block(db, current_user.id, data)


@router.get("/blocks", response_model=list[ScheduleBlockResponse])
def list_blocks(
    status: Optional[str] = Query(None),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """List schedule blocks, optionally filtered by status."""
    return schedule_service.get_schedule_blocks(db, current_user.id, status)


@router.get("/blocks/{block_id}", response_model=ScheduleBlockResponse)
def get_block(
    block_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Get a specific schedule block."""
    return schedule_service.get_schedule_block(db, block_id, current_user.id)


@router.put("/blocks/{block_id}", response_model=ScheduleBlockResponse)
def update_block(
    block_id: int,
    data: ScheduleBlockUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Update a schedule block (status, times)."""
    return schedule_service.update_schedule_block(db, block_id, current_user.id, data)


@router.delete("/blocks/{block_id}")
def delete_block(
    block_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Delete a schedule block."""
    return schedule_service.delete_schedule_block(db, block_id, current_user.id)


@router.post("/generate", response_model=SchedulePlanResponse)
def generate_schedule(
    request: ScheduleGenerateRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Generate a priority-scored, dependency-aware schedule plan.
    
    Returns ranked executable tasks with score breakdowns and explanations.
    Optionally persists the plan as schedule blocks.
    """
    return scheduler_service.generate_schedule(db, current_user.id, request)
