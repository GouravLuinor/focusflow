from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from typing import Optional
from app.core.auth import get_current_user
from app.db.deps import get_db
from app.models.user import User
from app.schemas.execution import (
    ExecutionSessionCreate,
    ExecutionSessionUpdate,
    ExecutionSessionResponse,
    TaskEventResponse,
)
from app.services import execution_service, event_service

router = APIRouter(tags=["execution"])


# Session endpoints
@router.post("/sessions", response_model=ExecutionSessionResponse, status_code=201)
def start_session(
    data: ExecutionSessionCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Start tracking time on a task."""
    return execution_service.start_session(db, current_user.id, data)


@router.post("/sessions/{session_id}/complete", response_model=ExecutionSessionResponse)
def complete_session(
    session_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Complete an active execution session."""
    return execution_service.complete_session(db, session_id, current_user.id)


@router.post("/sessions/{session_id}/abandon", response_model=ExecutionSessionResponse)
def abandon_session(
    session_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Abandon an active execution session."""
    return execution_service.abandon_session(db, session_id, current_user.id)


@router.get("/sessions", response_model=list[ExecutionSessionResponse])
def list_sessions(
    task_id: Optional[int] = Query(None),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """List execution sessions, optionally filtered by task."""
    return execution_service.get_sessions(db, current_user.id, task_id)


@router.get("/sessions/active", response_model=list[ExecutionSessionResponse])
def active_sessions(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Get all currently active sessions."""
    return execution_service.get_active_session(db, current_user.id)


# Event endpoints
@router.get("/tasks/{task_id}/events", response_model=list[TaskEventResponse])
def get_task_events(
    task_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Get all events for a task."""
    return event_service.get_task_events(db, task_id, current_user.id)
