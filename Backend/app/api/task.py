from typing import Optional
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session, joinedload

from app.models.user import User
from app.services.task_service import create_task_with_ai
from app.services import dependency_service
from app.db.deps import get_db
from app.core.auth import get_current_user
from app.models.task import Task
from app.schemas.task import TaskCreate, TaskUpdate, TaskResponse

router = APIRouter(prefix="/tasks", tags=["tasks"])


# 🔹 Create Task
@router.post("/", response_model=TaskResponse)
def create_task(
    data: TaskCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    support_mode = current_user.profile.support_mode

    return create_task_with_ai(
        db=db,
        user_id=current_user.id,
        title=data.title,
        description=data.description,
        support_mode=support_mode,
        goal_id=data.goal_id,
        parent_task_id=data.parent_task_id,
    )


# 🔹 Get All Tasks (handles BOTH /tasks and /tasks/)
@router.get("/", response_model=list[TaskResponse])
@router.get("", response_model=list[TaskResponse])
def get_tasks(
    goal_id: Optional[int] = None,
    db: Session = Depends(get_db),
    user=Depends(get_current_user),
):
    query = (
        db.query(Task)
        .options(joinedload(Task.steps))
        .filter(Task.user_id == user.id)
    )
    if goal_id is not None:
        query = query.filter(Task.goal_id == goal_id)
        
    tasks = query.all()
    return tasks


# 🔹 Get Executable Tasks
@router.get("/executable", response_model=list[TaskResponse])
def get_executable_tasks(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get all tasks that are currently executable (dependencies met)."""
    return dependency_service.get_executable_tasks_for_user(db, current_user.id)


# 🔹 Update Task
@router.put("/{task_id}", response_model=TaskResponse)
def update_task(
    task_id: int,
    data: TaskUpdate,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    task = db.query(Task).filter(
        Task.id == task_id,
        Task.user_id == user.id
    ).first()

    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    if data.title is not None:
        task.title = data.title

    if data.description is not None:
        task.description = data.description

    if data.is_completed is not None:
        task.is_completed = data.is_completed

    db.commit()
    db.refresh(task)

    return task


# 🔹 Delete Task
@router.delete("/{task_id}")
def delete_task(
    task_id: int,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    task = db.query(Task).filter(
        Task.id == task_id,
        Task.user_id == user.id
    ).first()

    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    db.delete(task)
    db.commit()

    return {"message": "Task deleted"}


# 🔹 Get Blocking Tasks
@router.get("/{task_id}/blocking", response_model=list[TaskResponse])
def get_blocking_tasks(
    task_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get tasks that are blocking this task from being executable."""
    return dependency_service.get_blocking_tasks_for_task(db, task_id, current_user.id)
