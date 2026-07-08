from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from datetime import datetime
from app.db.base import Base


class AIJob(Base):
    __tablename__ = "ai_jobs"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    goal_id = Column(Integer, ForeignKey("goals.id"), nullable=True)
    status = Column(String, default="PENDING")  # PENDING, RUNNING, SUCCEEDED, FAILED
    provider = Column(String, default="gemini")  # AI provider name
    model = Column(String, default="gemini-3.1-flash-lite-preview")
    prompt_tokens = Column(Integer, nullable=True)
    completion_tokens = Column(Integer, nullable=True)
    latency_ms = Column(Integer, nullable=True)
    error_code = Column(String, nullable=True)
    error_message = Column(Text, nullable=True)
    result_metadata = Column(Text, nullable=True)  # JSON string for structured results
    created_at = Column(DateTime, default=datetime.utcnow)
    started_at = Column(DateTime, nullable=True)
    completed_at = Column(DateTime, nullable=True)
    
    # Relationships
    user = relationship("User", back_populates="ai_jobs")
    goal = relationship("Goal", back_populates="ai_jobs")
