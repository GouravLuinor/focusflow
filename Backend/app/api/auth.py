from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from fastapi import Header, HTTPException, status
from app.core.security import decode_access_token
from app.models.user import User

from app.schemas.auth import (
    SignupRequest,
    LoginRequest,
    TokenResponse,
    UserResponse
)
from app.services.auth_service import signup_user, authenticate_user
from app.db.deps import get_db

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/signup", response_model=UserResponse)
def signup(data: SignupRequest, db: Session = Depends(get_db)):
    user = signup_user(db, data.email, data.password, data.name)
    return user


@router.post("/login", response_model=TokenResponse)
def login(data: LoginRequest, db: Session = Depends(get_db)):
    token, _ = authenticate_user(db, data.email, data.password)
    return {"access_token": token}


@router.get("/me", response_model=UserResponse)
def get_me(
    authorization: str = Header(...),
    db: Session = Depends(get_db)
):
    if not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Invalid token")

    token = authorization.split(" ")[1]
    payload = decode_access_token(token)

    if not payload or "sub" not in payload:
        raise HTTPException(status_code=401, detail="Invalid token")

    user = db.query(User).get(int(payload["sub"]))
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    return user