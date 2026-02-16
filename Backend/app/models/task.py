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

    user = relationship("User", backref="tasks")

    steps = relationship(
    "Step",
    back_populates="task",
    cascade="all, delete-orphan"
    )


