from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime
from enum import Enum
from app.schemas.task import TaskResponse

class GoalStatus(str, Enum):
    DRAFT = "DRAFT"
    ACTIVE = "ACTIVE"
    PAUSED = "PAUSED"
    COMPLETED = "COMPLETED"
    ARCHIVED = "ARCHIVED"

class GoalPriority(str, Enum):
    LOW = "LOW"
    MEDIUM = "MEDIUM"
    HIGH = "HIGH"
    URGENT = "URGENT"

class GoalCreate(BaseModel):
    title: str = Field(..., min_length=1, max_length=200)
    description: Optional[str] = None
    status: GoalStatus = GoalStatus.ACTIVE
    priority: GoalPriority = GoalPriority.MEDIUM
    deadline: Optional[datetime] = None

class GoalUpdate(BaseModel):
    title: Optional[str] = Field(None, min_length=1, max_length=200)
    description: Optional[str] = None
    status: Optional[GoalStatus] = None
    priority: Optional[GoalPriority] = None
    deadline: Optional[datetime] = None

class GoalResponse(BaseModel):
    id: int
    user_id: int
    title: str
    description: Optional[str]
    status: GoalStatus
    priority: GoalPriority
    deadline: Optional[datetime]
    created_at: datetime
    updated_at: datetime
    tasks: List[TaskResponse] = []
    
    class Config:
        from_attributes = True
