from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime


# -------------------------
# STEP RESPONSE
# -------------------------

class StepResponse(BaseModel):
    id: int
    content: str
    order: int
    is_completed: bool

    class Config:
        from_attributes = True


# -------------------------
# TASK RESPONSE
# -------------------------

class TaskResponse(BaseModel):
    id: int
    title: str
    description: Optional[str] = None
    is_completed: bool
    status: str = "TODO"
    estimated_minutes: Optional[int] = None
    actual_minutes: Optional[int] = None
    priority: str = "MEDIUM"
    deadline: Optional[datetime] = None
    steps: List[StepResponse] = []
    goal_id: Optional[int] = None
    parent_task_id: Optional[int] = None
    subtasks: List["TaskResponse"] = []
    postponement_count: int = 0
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


# -------------------------
# CREATE SCHEMA
# -------------------------

class TaskCreate(BaseModel):
    title: str
    description: Optional[str] = None
    estimated_minutes: Optional[int] = None
    priority: Optional[str] = "MEDIUM"
    deadline: Optional[datetime] = None
    goal_id: Optional[int] = None
    parent_task_id: Optional[int] = None


# -------------------------
# UPDATE SCHEMA
# -------------------------

class TaskUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    is_completed: Optional[bool] = None
    status: Optional[str] = None
    estimated_minutes: Optional[int] = None
    priority: Optional[str] = None
    deadline: Optional[datetime] = None
    goal_id: Optional[int] = None
    parent_task_id: Optional[int] = None
    postponement_count: Optional[int] = None
