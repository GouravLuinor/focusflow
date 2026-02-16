from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db.deps import get_db
from app.core.auth import get_current_user
from app.models.profile import NeuroProfile
from app.schemas.profile import ProfileCreate, ProfileResponse

router = APIRouter(prefix="/profile", tags=["profile"])


@router.post("", response_model=ProfileResponse)
def create_or_update_profile(
    data: ProfileCreate,
    db: Session = Depends(get_db),
    user=Depends(get_current_user),
):
    profile = db.query(NeuroProfile).filter_by(user_id=user.id).first()

    if not profile:
        profile = NeuroProfile(
            user_id=user.id,
            support_mode=data.support_mode,
            onboarding_completed=True,
        )
        db.add(profile)
    else:
        profile.support_mode = data.support_mode
        profile.onboarding_completed = True

    db.commit()
    db.refresh(profile)

    return profile


@router.get("/me", response_model=ProfileResponse)
def get_my_profile(
    db: Session = Depends(get_db),
    user=Depends(get_current_user),
):
    profile = db.query(NeuroProfile).filter_by(user_id=user.id).first()

    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")

    return profile
