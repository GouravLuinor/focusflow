from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime
from enum import Enum


class AIJobStatus(str, Enum):
    PENDING = "PENDING"
    RUNNING = "RUNNING"
    SUCCEEDED = "SUCCEEDED"
    FAILED = "FAILED"


class AIJobCreate(BaseModel):
    goal_id: int
    provider: str = "gemini"
    model: str = "gemini-3.1-flash-lite-preview"


class AIJobResponse(BaseModel):
    id: int
    user_id: int
    goal_id: Optional[int] = None
    status: AIJobStatus
    provider: str
    model: str
    prompt_tokens: Optional[int] = None
    completion_tokens: Optional[int] = None
    latency_ms: Optional[int] = None
    error_code: Optional[str] = None
    error_message: Optional[str] = None
    result_metadata: Optional[str] = None
    created_at: datetime
    started_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True


class AIJobListResponse(BaseModel):
    jobs: list[AIJobResponse]
    total: int
