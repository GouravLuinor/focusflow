from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
from app.db.base import Base

class ScheduleBlock(Base):
    __tablename__ = "schedule_blocks"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    task_id = Column(Integer, ForeignKey("tasks.id"), nullable=False)
    scheduled_start = Column(DateTime, nullable=False)
    scheduled_end = Column(DateTime, nullable=False)
    status = Column(String, default="PLANNED")  # PLANNED, ACTIVE, COMPLETED, MISSED, CANCELLED, RESCHEDULED
    actual_start = Column(DateTime, nullable=True)
    actual_end = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    user = relationship("User", back_populates="schedule_blocks")
    task = relationship("Task", back_populates="schedule_blocks")
