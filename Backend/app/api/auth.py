from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.models.user import User
from app.core.auth import get_current_user
from app.schemas.auth import (
    SignupRequest,
    LoginRequest,
    TokenResponse,
    UserResponse
)
from app.services.auth_service import signup_user, authenticate_user
from app.db.deps import get_db

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/signup", response_model=UserResponse, status_code=201)
def signup(data: SignupRequest, db: Session = Depends(get_db)):
    user = signup_user(db, data.email, data.password, data.name)
    return user


@router.post("/login", response_model=TokenResponse)
def login(data: LoginRequest, db: Session = Depends(get_db)):
    token, _ = authenticate_user(db, data.email, data.password)
    return {"access_token": token}


@router.get("/me", response_model=UserResponse)
def get_me(current_user: User = Depends(get_current_user)):
    return current_user