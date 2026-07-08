from sqlalchemy import Column, Integer, ForeignKey, DateTime, UniqueConstraint, CheckConstraint
from sqlalchemy.orm import relationship
from datetime import datetime
from app.db.base import Base

class TaskDependency(Base):
    __tablename__ = "task_dependencies"
    
    id = Column(Integer, primary_key=True, index=True)
    task_id = Column(Integer, ForeignKey("tasks.id"), nullable=False)
    depends_on_task_id = Column(Integer, ForeignKey("tasks.id"), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    task = relationship("Task", foreign_keys=[task_id], back_populates="dependencies")
    depends_on_task = relationship("Task", foreign_keys=[depends_on_task_id], back_populates="dependent_tasks")
    
    __table_args__ = (
        # Prevent duplicate edges
        UniqueConstraint("task_id", "depends_on_task_id", name="uq_task_dependency"),
        # Prevent self-dependency
        CheckConstraint("task_id != depends_on_task_id", name="ck_no_self_dependency"),
    )
