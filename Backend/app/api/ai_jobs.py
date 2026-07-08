from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from typing import Optional
from app.core.auth import get_current_user
from app.db.deps import get_db
from app.models.user import User
from app.schemas.ai_job import AIJobCreate, AIJobResponse, AIJobListResponse
from app.services import ai_job_service

router = APIRouter(prefix="/ai-jobs", tags=["ai-jobs"])


@router.post("/", response_model=AIJobResponse, status_code=201)
def create_job(
    data: AIJobCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Create a new AI decomposition job.
    Returns immediately with PENDING status.
    """
    return ai_job_service.create_ai_job(db, current_user.id, data)


@router.get("/{job_id}", response_model=AIJobResponse)
def get_job(
    job_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Get AI job status by ID."""
    return ai_job_service.get_ai_job(db, job_id, current_user.id)


@router.get("/", response_model=AIJobListResponse)
def list_jobs(
    status: Optional[str] = Query(None),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """List AI jobs, optionally filtered by status."""
    jobs = ai_job_service.get_ai_jobs(db, current_user.id, status)
    return {"jobs": jobs, "total": len(jobs)}
