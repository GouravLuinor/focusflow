from sqlalchemy import Column, Integer, String, Boolean, ForeignKey
from sqlalchemy.orm import relationship

from app.db.base import Base


class Step(Base):
    __tablename__ = "steps"

    id = Column(Integer, primary_key=True, index=True)

    content = Column(String, nullable=False)
    order = Column(Integer, nullable=False)

    is_completed = Column(Boolean, default=False)

    task_id = Column(Integer, ForeignKey("tasks.id"))

    task = relationship("Task", back_populates="steps")

