from typing import Optional
from datetime import datetime
from sqlalchemy.orm import Session
from fastapi import HTTPException
from app.models.task import Task
from app.models.step import Step
from app.models.goal import Goal
from app.models.profile import NeuroProfile
from app.services.ai_service import generate_ai_steps


def create_task_with_ai(
    db: Session,
    user_id: int,
    title: str,
    description: Optional[str] = None,
    support_mode: str = "adhd",
    goal_id: Optional[int] = None,
    parent_task_id: Optional[int] = None,
    estimated_minutes: Optional[int] = None,
    priority: str = "MEDIUM",
    deadline: Optional[datetime] = None,
):
    if goal_id:
        goal = db.query(Goal).filter(Goal.id == goal_id, Goal.user_id == user_id).first()
        if not goal:
            raise HTTPException(status_code=404, detail="Goal not found")
        
    if parent_task_id:
        parent = db.query(Task).filter(Task.id == parent_task_id, Task.user_id == user_id).first()
        if not parent:
            raise HTTPException(status_code=404, detail="Parent task not found")

    # 1️⃣ Create task with all metadata preserved
    task = Task(
        title=title,
        description=description,
        user_id=user_id,
        goal_id=goal_id,
        parent_task_id=parent_task_id,
        estimated_minutes=estimated_minutes,
        priority=priority or "MEDIUM",
        deadline=deadline,
        status="TODO",
        is_completed=False,
    )

    db.add(task)
    db.commit()
    db.refresh(task)

    # 2️⃣ Generate steps
    try:
        steps_text = generate_ai_steps(title, support_mode or "adhd")
    except Exception as e:
        print("AI step generation fallback:", e)
        steps_text = []

    # 3️⃣ Save steps
    _add_steps(db, task.id, steps_text)

    db.commit()
    db.refresh(task)

    return task


def _add_steps(db: Session, task_id: int, steps_text: list[str]) -> list[Step]:
    steps = [
        Step(task_id=task_id, content=text, order=index + 1, is_completed=False)
        for index, text in enumerate(steps_text)
    ]
    db.add_all(steps)
    return steps


def generate_steps_for_task(db: Session, user_id: int, task_id: int) -> list[Step]:
    """
    Generate AI micro-steps for an existing task that has none
    (e.g. tasks created by goal decomposition).

    Blocking (Gemini call) — call from a sync route, which FastAPI runs in a threadpool.
    Falls back to support-mode templates when AI is unavailable (see generate_ai_steps).
    """
    task = db.query(Task).filter(Task.id == task_id, Task.user_id == user_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    if db.query(Step).filter(Step.task_id == task.id).first():
        raise HTTPException(status_code=409, detail="Task already has steps")

    profile = db.query(NeuroProfile).filter(NeuroProfile.user_id == user_id).first()
    support_mode = profile.support_mode if profile else "adhd"

    steps = _add_steps(db, task.id, generate_ai_steps(task.title, support_mode))
    db.commit()
    for step in steps:
        db.refresh(step)
    return steps
