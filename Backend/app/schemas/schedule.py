from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime
from enum import Enum


class ScheduleStatus(str, Enum):
    PLANNED = "PLANNED"
    ACTIVE = "ACTIVE"
    COMPLETED = "COMPLETED"
    MISSED = "MISSED"
    CANCELLED = "CANCELLED"
    RESCHEDULED = "RESCHEDULED"


class ScheduleBlockCreate(BaseModel):
    task_id: int
    scheduled_start: datetime
    scheduled_end: datetime
    
    @property
    def is_valid_times(self) -> bool:
        return self.scheduled_end > self.scheduled_start


class ScheduleBlockUpdate(BaseModel):
    scheduled_start: Optional[datetime] = None
    scheduled_end: Optional[datetime] = None
    status: Optional[ScheduleStatus] = None


class ScheduleBlockResponse(BaseModel):
    id: int
    user_id: int
    task_id: int
    scheduled_start: datetime
    scheduled_end: datetime
    status: ScheduleStatus
    actual_start: Optional[datetime] = None
    actual_end: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True


class ScheduleGenerateRequest(BaseModel):
    available_minutes: int = Field(..., gt=0, le=1440, description="Available time in minutes (max 24 hours)")
    save_plan: bool = Field(default=False, description="Whether to persist plan as schedule blocks")
    start_time: Optional[datetime] = Field(default=None, description="When the available window starts (defaults to now)")
    goal_id: Optional[int] = Field(default=None, description="Optionally scope to a specific goal")


class ScoreComponent(BaseModel):
    raw: float
    weighted: float
    reason: str


class ScoredTaskResponse(BaseModel):
    task_id: int
    title: str
    total_score: float
    components: dict[str, ScoreComponent]
    reasons: list[str]
    estimated_minutes: Optional[int] = None
    priority: str
    deadline: Optional[datetime] = None
    overflow: bool = False


class SchedulePlanResponse(BaseModel):
    plan: list[ScoredTaskResponse]
    total_estimated_minutes: int
    total_available_minutes: int
    overflow_tasks: int
    schedule_blocks_created: int = 0
    generated_at: datetime
