from pydantic import BaseModel
from typing import List, Optional


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
    description: str
    is_completed: bool
    steps: List[StepResponse] = []

    class Config:
        from_attributes = True

# -------------------------
# CREATE SCHEMA
# -------------------------

class TaskCreate(BaseModel):
    title: str
    description: Optional[str] = None


# -------------------------
# UPDATE SCHEMA
# -------------------------

class TaskUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    is_completed: Optional[bool] = None
