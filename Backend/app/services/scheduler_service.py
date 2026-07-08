from sqlalchemy.orm import Session
from datetime import datetime, timezone, timedelta
from typing import Optional
from app.engine.dependency import get_executable_tasks
from app.engine.priority import rank_tasks, select_plan
from app.models.task import Task
from app.models.task_dependency import TaskDependency
from app.models.goal import Goal
from app.services.schedule_service import create_schedule_block
from app.schemas.schedule import ScheduleBlockCreate, ScheduleGenerateRequest


def generate_schedule(
    db: Session,
    user_id: int,
    request: ScheduleGenerateRequest,
) -> dict:
    """
    Generate a ranked, explainable schedule plan.
    """
    now = request.start_time or datetime.now(timezone.utc)
    available_minutes = request.available_minutes
    
    # 1. Get eligible tasks (not completed)
    task_query = db.query(Task).filter(
        Task.user_id == user_id,
        Task.is_completed == False,
    )
    
    if request.goal_id:
        # Verify goal ownership
        goal = db.query(Goal).filter(
            Goal.id == request.goal_id,
            Goal.user_id == user_id
        ).first()
        if not goal:
            from fastapi import HTTPException
            raise HTTPException(status_code=404, detail="Goal not found")
        task_query = task_query.filter(Task.goal_id == request.goal_id)
    
    tasks = task_query.all()
    
    if not tasks:
        return {
            "plan": [],
            "total_estimated_minutes": 0,
            "total_available_minutes": available_minutes,
            "overflow_tasks": 0,
            "schedule_blocks_created": 0,
            "generated_at": now,
        }
    
    # 2. Get all task IDs
    task_ids = [t.id for t in tasks]
    
    # 3. Get completed task IDs (for executable computation)
    completed_ids = set(
        t[0] for t in db.query(Task.id).filter(
            Task.user_id == user_id,
            Task.is_completed == True,
        ).all()
    )
    
    # 4. Get all dependencies for these tasks
    all_deps = db.query(TaskDependency).filter(
        TaskDependency.task_id.in_(task_ids)
    ).all()
    dep_edges = [(d.task_id, d.depends_on_task_id) for d in all_deps]
    
    # 5. Compute executable tasks
    executable_ids = get_executable_tasks(task_ids, completed_ids, dep_edges)
    
    # Filter to only executable tasks
    executable_tasks = [t for t in tasks if t.id in executable_ids]
    
    if not executable_tasks:
        return {
            "plan": [],
            "total_estimated_minutes": 0,
            "total_available_minutes": available_minutes,
            "overflow_tasks": 0,
            "schedule_blocks_created": 0,
            "generated_at": now,
            "message": "No executable tasks available. Some tasks may be blocked by dependencies.",
        }
    
    # 6. Enrich tasks with metadata for scoring (safely fallback via getattr)
    task_dicts = []
    for task in executable_tasks:
        task_dicts.append({
            "id": task.id,
            "title": task.title,
            "priority": getattr(task, "priority", "MEDIUM") or "MEDIUM",
            "deadline": getattr(task, "deadline", None),
            "estimated_minutes": getattr(task, "estimated_minutes", None),
            "postponement_count": getattr(task, "postponement_count", 0) or 0,
        })
    
    # 7. Score and select plan
    plan_result = select_plan(
        task_dicts,
        available_minutes=available_minutes,
        all_dependencies=dep_edges,
        now=now,
    )
    
    # 8. Optionally persist as schedule blocks
    blocks_created = 0
    if request.save_plan and request.start_time:
        current_time = request.start_time
        for scored_task in plan_result["plan"]:
            # Only schedule non-overflow tasks
            if scored_task.get("overflow"):
                continue
                
            task_dict = next(
                (t for t in task_dicts if t["id"] == scored_task["task_id"]),
                None
            )
            if task_dict:
                duration = task_dict.get("estimated_minutes") or 30  # Default duration if not specified
                try:
                    create_schedule_block(
                        db,
                        user_id,
                        ScheduleBlockCreate(
                            task_id=scored_task["task_id"],
                            scheduled_start=current_time,
                            scheduled_end=current_time + timedelta(minutes=duration),
                        ),
                    )
                    blocks_created += 1
                    current_time += timedelta(minutes=duration)
                except Exception:
                    # Don't fail the whole plan if one block fails
                    pass
    
    # 9. Build response with enriched task data
    task_map = {t.id: t for t in executable_tasks}
    enriched_plan = []
    
    for scored in plan_result["plan"]:
        task = task_map.get(scored["task_id"])
        enriched_plan.append({
            "task_id": scored["task_id"],
            "title": scored.get("title", task.title if task else ""),
            "total_score": scored["total_score"],
            "components": scored.get("components", {}),
            "reasons": scored.get("reasons", []),
            "estimated_minutes": getattr(task, "estimated_minutes", None) if task else None,
            "priority": getattr(task, "priority", "MEDIUM") if task else "MEDIUM",
            "deadline": getattr(task, "deadline", None) if task else None,
            "overflow": scored.get("overflow", False),
        })
    
    return {
        "plan": enriched_plan,
        "total_estimated_minutes": plan_result["total_estimated_minutes"],
        "total_available_minutes": available_minutes,
        "overflow_tasks": plan_result.get("overflow_tasks", 0),
        "schedule_blocks_created": blocks_created,
        "generated_at": now,
    }
