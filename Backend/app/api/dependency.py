from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.auth import get_current_user
from app.db.deps import get_db
from app.models.user import User
from app.schemas.dependency import DependencyCreate, DependencyResponse
from app.services import dependency_service

router = APIRouter(prefix="/tasks", tags=["dependencies"])


@router.post("/{task_id}/dependencies", response_model=DependencyResponse, status_code=201)
def add_dependency(
    task_id: int,
    dep_data: DependencyCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Make task_id depend on depends_on_task_id."""
    return dependency_service.add_dependency(
        db, task_id, dep_data.depends_on_task_id, current_user.id
    )


@router.delete("/{task_id}/dependencies/{depends_on_task_id}")
def remove_dependency(
    task_id: int,
    depends_on_task_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return dependency_service.remove_dependency(
        db, task_id, depends_on_task_id, current_user.id
    )


@router.get("/{task_id}/dependencies", response_model=list[DependencyResponse])
def get_dependencies(
    task_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return dependency_service.get_dependencies(db, task_id, current_user.id)


@router.get("/{task_id}/dependents", response_model=list[DependencyResponse])
def get_dependents(
    task_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return dependency_service.get_dependents(db, task_id, current_user.id)
