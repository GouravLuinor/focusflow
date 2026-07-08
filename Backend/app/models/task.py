from sqlalchemy import Column, Integer, String, Boolean, ForeignKey
from sqlalchemy.orm import relationship

from app.db.base import Base


class Task(Base):
    __tablename__ = "tasks"

    id = Column(Integer, primary_key=True, index=True)

    title = Column(String, nullable=False)
    description = Column(String, nullable=True)

    is_completed = Column(Boolean, default=False)

    user_id = Column(Integer, ForeignKey("users.id"))
    goal_id = Column(Integer, ForeignKey("goals.id"), nullable=True)
    parent_task_id = Column(Integer, ForeignKey("tasks.id"), nullable=True)

    user = relationship("User", backref="tasks")
    goal = relationship("Goal", back_populates="tasks")
    parent_task = relationship("Task", remote_side=[id], back_populates="subtasks")
    subtasks = relationship("Task", back_populates="parent_task", cascade="all, delete-orphan")

    steps = relationship(
        "Step",
        back_populates="task",
        cascade="all, delete-orphan"
    )

    # Dependencies where this task depends on others
    dependencies = relationship(
        "TaskDependency",
        foreign_keys="TaskDependency.task_id",
        back_populates="task",
        cascade="all, delete-orphan"
    )

    # Dependencies where other tasks depend on this one
    dependent_tasks = relationship(
        "TaskDependency",
        foreign_keys="TaskDependency.depends_on_task_id",
        back_populates="depends_on_task",
        cascade="all, delete-orphan"
    )

    postponement_count = Column(Integer, default=0)
    schedule_blocks = relationship("ScheduleBlock", back_populates="task", cascade="all, delete-orphan")
    execution_sessions = relationship("ExecutionSession", back_populates="task", cascade="all, delete-orphan")
    events = relationship("TaskEvent", back_populates="task", cascade="all, delete-orphan")


