from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.db.deps import get_db
from app.core.auth import get_current_user
from app.models.user import User
from app.schemas.goal import GoalCreate, GoalUpdate, GoalResponse
from app.services import goal_service, dependency_service
from typing import List
from app.schemas.task import TaskResponse
from app.schemas.ai_job import AIJobCreate, AIJobResponse
from app.services import ai_job_service
from app.worker.tasks import process_ai_decomposition

router = APIRouter(prefix="/goals", tags=["goals"])

@router.post("/", response_model=GoalResponse, status_code=status.HTTP_201_CREATED)
def create_goal(
    data: GoalCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return goal_service.create_goal(db=db, user_id=current_user.id, goal_data=data)

@router.get("/", response_model=List[GoalResponse])
@router.get("", response_model=List[GoalResponse])
def get_goals(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return goal_service.get_goals(db=db, user_id=current_user.id)

@router.get("/{goal_id}", response_model=GoalResponse)
def get_goal(
    goal_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    goal = goal_service.get_goal(db=db, goal_id=goal_id, user_id=current_user.id)
    if not goal:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Goal not found"
        )
    return goal

@router.put("/{goal_id}", response_model=GoalResponse)
def update_goal(
    goal_id: int,
    data: GoalUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    goal = goal_service.update_goal(db=db, goal_id=goal_id, user_id=current_user.id, goal_data=data)
    if not goal:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Goal not found"
        )
    return goal

@router.delete("/{goal_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_goal(
    goal_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    success = goal_service.delete_goal(db=db, goal_id=goal_id, user_id=current_user.id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Goal not found"
        )
    return


@router.get("/{goal_id}/workflow-order", response_model=List[TaskResponse])
def get_workflow_order(
    goal_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get topologically sorted tasks for a goal."""
    return dependency_service.get_workflow_order_for_goal(db, goal_id, current_user.id)


@router.post("/{goal_id}/ai-decompose", response_model=AIJobResponse, status_code=202)
def decompose_goal(
    goal_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Trigger AI decomposition for a goal.
    
    Creates a background job and returns immediately with 202 Accepted.
    Poll GET /ai-jobs/{job_id} for status and results.
    """
    # Create job (verifies goal ownership)
    job_data = AIJobCreate(goal_id=goal_id)
    job = ai_job_service.create_ai_job(db, current_user.id, job_data)
    
    # Enqueue background task (non-blocking)
    process_ai_decomposition.delay(job.id)
    
    return job
