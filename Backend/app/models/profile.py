from sqlalchemy import Column, Integer, String, Boolean, ForeignKey
from sqlalchemy.orm import relationship
from app.db.base import Base


class NeuroProfile(Base):
    __tablename__ = "neuro_profiles"

    id = Column(Integer, primary_key=True, index=True)

    user_id = Column(Integer, ForeignKey("users.id"), unique=True)

    support_mode = Column(String, nullable=False)
    onboarding_completed = Column(Boolean, default=False)

    user = relationship(
        "User",
        back_populates="profile"
    )
