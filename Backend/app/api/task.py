from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session, joinedload

from app.models.user import User
from app.services.task_service import create_task_with_ai
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
    )


# 🔹 Get All Tasks (handles BOTH /tasks and /tasks/)
@router.get("/", response_model=list[TaskResponse])
@router.get("", response_model=list[TaskResponse])
def get_tasks(
    db: Session = Depends(get_db),
    user=Depends(get_current_user),
):
    tasks = (
        db.query(Task)
        .options(joinedload(Task.steps))
        .filter(Task.user_id == user.id)
        .all()
    )
    return tasks


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
