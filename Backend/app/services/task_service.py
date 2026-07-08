from typing import Optional
from sqlalchemy.orm import Session
from fastapi import HTTPException
from app.models.task import Task
from app.models.step import Step
from app.models.goal import Goal
from app.services.ai_service import generate_ai_steps


def create_task_with_ai(
    db: Session,
    user_id: int,
    title: str,
    description: str,
    support_mode: str,
    goal_id: Optional[int] = None,
    parent_task_id: Optional[int] = None,
):
    if goal_id:
        goal = db.query(Goal).filter(Goal.id == goal_id, Goal.user_id == user_id).first()
        if not goal:
            raise HTTPException(status_code=404, detail="Goal not found")
        
    if parent_task_id:
        parent = db.query(Task).filter(Task.id == parent_task_id, Task.user_id == user_id).first()
        if not parent:
            raise HTTPException(status_code=404, detail="Parent task not found")

    # 1️⃣ Create task
    task = Task(
        title=title,
        description=description,
        user_id=user_id,
        goal_id=goal_id,
        parent_task_id=parent_task_id
    )

    db.add(task)
    db.commit()
    db.refresh(task)

    # 2️⃣ Generate AI steps
    try:
        steps_text = generate_ai_steps(title, support_mode)
    except Exception as e:
        print("AI failed:", e)
        steps_text = []

    # 3️⃣ Save steps (IMPORTANT FIX HERE)
    for index, text in enumerate(steps_text):
        step = Step(
            task_id=task.id,
            content=text,        # ✅ correct column
            order=index + 1,     # ✅ required column
            is_completed=False
        )
        db.add(step)

    db.commit()
    db.refresh(task)

    return task

