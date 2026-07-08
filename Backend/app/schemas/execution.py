from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime
from enum import Enum


class SessionStatus(str, Enum):
    ACTIVE = "ACTIVE"
    COMPLETED = "COMPLETED"
    ABANDONED = "ABANDONED"
    INTERRUPTED = "INTERRUPTED"


class ExecutionSessionCreate(BaseModel):
    task_id: int


class ExecutionSessionUpdate(BaseModel):
    status: Optional[SessionStatus] = None


class ExecutionSessionResponse(BaseModel):
    id: int
    task_id: int
    user_id: int
    started_at: datetime
    ended_at: Optional[datetime] = None
    duration_seconds: Optional[int] = None
    status: SessionStatus
    created_at: datetime
    
    class Config:
        from_attributes = True


# Task Event schemas
class TaskEventResponse(BaseModel):
    id: int
    task_id: int
    user_id: int
    event_type: str
    metadata_json: Optional[str] = None
    created_at: datetime
    
    class Config:
        from_attributes = True
