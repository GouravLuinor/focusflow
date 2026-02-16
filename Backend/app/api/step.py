from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db.deps import get_db
from app.core.auth import get_current_user
from app.models.step import Step
from app.models.task import Task
from app.schemas.step import StepCreate, StepUpdate, StepResponse

router = APIRouter(prefix="/tasks/{task_id}/steps", tags=["steps"])


# 🔹 Create Step
@router.post("", response_model=StepResponse)
def create_step(
    task_id: int,
    data: StepCreate,
    db: Session = Depends(get_db),
    user=Depends(get_current_user),
):
    task = db.query(Task).filter(
        Task.id == task_id,
        Task.user_id == user.id
    ).first()

    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    step = Step(
        content=data.content,
        order=data.order,
        task_id=task.id,
        is_completed=False
    )

    db.add(step)
    db.commit()
    db.refresh(step)

    return step


# 🔹 Get Steps for Task
@router.get("", response_model=list[StepResponse])
def get_steps(
    task_id: int,
    db: Session = Depends(get_db),
    user=Depends(get_current_user),
):
    task = db.query(Task).filter(
        Task.id == task_id,
        Task.user_id == user.id
    ).first()

    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    return (
        db.query(Step)
        .filter(Step.task_id == task.id)
        .order_by(Step.order)
        .all()
    )


# 🔹 Update Step (FIXED ROUTE)
@router.put("/{step_id}", response_model=StepResponse)
def update_step(
    task_id: int,
    step_id: int,
    data: StepUpdate,
    db: Session = Depends(get_db),
    user=Depends(get_current_user),
):
    step = (
        db.query(Step)
        .join(Task)
        .filter(
            Step.id == step_id,
            Step.task_id == task_id,
            Task.user_id == user.id
        )
        .first()
    )

    if not step:
        raise HTTPException(status_code=404, detail="Step not found")

    if data.content is not None:
        step.content = data.content

    if data.is_completed is not None:
        step.is_completed = data.is_completed

    db.commit()
    db.refresh(step)

    return step


# 🔹 Delete Step (FIXED ROUTE)
@router.delete("/{step_id}")
def delete_step(
    task_id: int,
    step_id: int,
    db: Session = Depends(get_db),
    user=Depends(get_current_user),
):
    step = (
        db.query(Step)
        .join(Task)
        .filter(
            Step.id == step_id,
            Step.task_id == task_id,
            Task.user_id == user.id
        )
        .first()
    )

    if not step:
        raise HTTPException(status_code=404, detail="Step not found")

    db.delete(step)
    db.commit()

    return {"message": "Step deleted"}
