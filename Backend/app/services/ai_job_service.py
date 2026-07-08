from sqlalchemy.orm import Session
from datetime import datetime
from app.models.ai_job import AIJob
from app.models.goal import Goal
from app.schemas.ai_job import AIJobCreate


def create_ai_job(db: Session, user_id: int, data: AIJobCreate) -> AIJob:
    """Create a new AI job for goal decomposition."""
    # Verify goal ownership
    goal = db.query(Goal).filter(
        Goal.id == data.goal_id,
        Goal.user_id == user_id
    ).first()
    if not goal:
        from fastapi import HTTPException
        raise HTTPException(status_code=404, detail="Goal not found")
    
    job = AIJob(
        user_id=user_id,
        goal_id=data.goal_id,
        status="PENDING",
        provider=data.provider,
        model=data.model,
    )
    db.add(job)
    db.commit()
    db.refresh(job)
    return job


def get_ai_job(db: Session, job_id: int, user_id: int) -> AIJob:
    """Get a single AI job with ownership check."""
    job = db.query(AIJob).filter(
        AIJob.id == job_id,
        AIJob.user_id == user_id
    ).first()
    if not job:
        from fastapi import HTTPException
        raise HTTPException(status_code=404, detail="AI job not found")
    return job


def get_ai_jobs(db: Session, user_id: int, status: str = None) -> list:
    """List AI jobs for user, optionally filtered by status."""
    query = db.query(AIJob).filter(AIJob.user_id == user_id)
    if status:
        query = query.filter(AIJob.status == status)
    return query.order_by(AIJob.created_at.desc()).all()


def update_job_status(
    db: Session,
    job_id: int,
    status: str,
    **kwargs
) -> AIJob:
    """Update job status and optional fields."""
    job = db.query(AIJob).filter(AIJob.id == job_id).first()
    if not job:
        from fastapi import HTTPException
        raise HTTPException(status_code=404, detail="AI job not found")
    
    job.status = status
    
    if status == "RUNNING" and job.started_at is None:
        job.started_at = datetime.utcnow()
    
    if status in ["SUCCEEDED", "FAILED"]:
        job.completed_at = datetime.utcnow()
        if job.started_at:
            job.latency_ms = int(
                (job.completed_at - job.started_at).total_seconds() * 1000
            )
    
    # Set optional fields
    for key, value in kwargs.items():
        if hasattr(job, key) and value is not None:
            setattr(job, key, value)
    
    db.commit()
    db.refresh(job)
    return job
