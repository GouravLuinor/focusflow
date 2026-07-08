from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from datetime import datetime
from app.db.base import Base

class TaskEvent(Base):
    __tablename__ = "task_events"
    
    id = Column(Integer, primary_key=True, index=True)
    task_id = Column(Integer, ForeignKey("tasks.id"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    event_type = Column(String, nullable=False)  # TASK_CREATED, TASK_STARTED, TASK_PAUSED, etc.
    metadata_json = Column(Text, nullable=True)   # Optional JSON string for extra context
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    task = relationship("Task", back_populates="events")
    user = relationship("User", back_populates="task_events")
