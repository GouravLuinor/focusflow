from sqlalchemy.orm import Session
from app.models.task_dependency import TaskDependency
from app.engine.dependency import (
    validate_dependency,
    get_executable_tasks,
    get_blocking_tasks,
    topological_sort
)
from app.models.task import Task


def add_dependency(db: Session, task_id: int, depends_on_task_id: int, user_id: int):
    """Add a dependency edge after validation."""
    is_valid, error = validate_dependency(task_id, depends_on_task_id, user_id, db)
    if not is_valid:
        from fastapi import HTTPException
        raise HTTPException(status_code=422, detail=error)
    
    dep = TaskDependency(task_id=task_id, depends_on_task_id=depends_on_task_id)
    db.add(dep)
    db.commit()
    db.refresh(dep)
    return dep


def remove_dependency(db: Session, task_id: int, depends_on_task_id: int, user_id: int):
    """Remove a dependency edge with ownership check."""
    from fastapi import HTTPException
    
    # Verify ownership of both tasks
    task = db.query(Task).filter(Task.id == task_id, Task.user_id == user_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    
    dep = db.query(TaskDependency).filter(
        TaskDependency.task_id == task_id,
        TaskDependency.depends_on_task_id == depends_on_task_id
    ).first()
    
    if not dep:
        raise HTTPException(status_code=404, detail="Dependency not found")
    
    db.delete(dep)
    db.commit()
    return {"message": "Dependency removed"}


def get_dependencies(db: Session, task_id: int, user_id: int):
    """Get all dependencies for a task with ownership check."""
    from fastapi import HTTPException
    
    task = db.query(Task).filter(Task.id == task_id, Task.user_id == user_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    
    return task.dependencies


def get_dependents(db: Session, task_id: int, user_id: int):
    """Get all tasks that depend on this task."""
    from fastapi import HTTPException
    
    task = db.query(Task).filter(Task.id == task_id, Task.user_id == user_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    
    return task.dependent_tasks


def get_executable_tasks_for_user(db: Session, user_id: int) -> list:
    """Return all executable tasks for a user (not completed, dependencies met)."""
    # Get all non-completed tasks for user
    tasks = db.query(Task).filter(
        Task.user_id == user_id,
        Task.is_completed == False
    ).all()
    
    if not tasks:
        return []
    
    task_ids = [t.id for t in tasks]
    completed_ids = set(
        t[0] for t in db.query(Task.id).filter(
            Task.user_id == user_id,
            Task.is_completed == True
        ).all()
    )
    
    # Get all dependencies for these tasks
    all_deps = db.query(TaskDependency).filter(
        TaskDependency.task_id.in_(task_ids)
    ).all()
    dep_edges = [(d.task_id, d.depends_on_task_id) for d in all_deps]
    
    executable_ids = get_executable_tasks(task_ids, completed_ids, dep_edges)
    
    # Return full task objects
    return db.query(Task).filter(Task.id.in_(executable_ids)).all()


def get_blocking_tasks_for_task(db: Session, task_id: int, user_id: int) -> list:
    """Return list of tasks blocking this task (dependencies not yet completed)."""
    task = db.query(Task).filter(Task.id == task_id, Task.user_id == user_id).first()
    if not task:
        from fastapi import HTTPException
        raise HTTPException(status_code=404, detail="Task not found")
    
    # Get dependencies
    deps = db.query(TaskDependency).filter(TaskDependency.task_id == task_id).all()
    if not deps:
        return []
    
    dep_edges = [(d.task_id, d.depends_on_task_id) for d in deps]
    completed_ids = set(
        t[0] for t in db.query(Task.id).filter(
            Task.user_id == user_id,
            Task.is_completed == True
        ).all()
    )
    
    blocking_ids = get_blocking_tasks(task_id, completed_ids, dep_edges)
    
    return db.query(Task).filter(Task.id.in_(blocking_ids)).all()


def get_workflow_order_for_goal(db: Session, goal_id: int, user_id: int) -> list:
    """Return topologically sorted tasks for a goal."""
    from app.models.goal import Goal
    from fastapi import HTTPException
    
    goal = db.query(Goal).filter(Goal.id == goal_id, Goal.user_id == user_id).first()
    if not goal:
        raise HTTPException(status_code=404, detail="Goal not found")
    
    tasks = db.query(Task).filter(Task.goal_id == goal_id).all()
    if not tasks:
        return []
    
    task_ids = [t.id for t in tasks]
    
    all_deps = db.query(TaskDependency).filter(
        TaskDependency.task_id.in_(task_ids)
    ).all()
    dep_edges = [(d.task_id, d.depends_on_task_id) for d in all_deps]
    
    try:
        ordered_ids = topological_sort(task_ids, dep_edges)
    except ValueError as e:
        raise HTTPException(status_code=422, detail=str(e))
    
    # Return tasks in topological order
    task_map = {t.id: t for t in tasks}
    return [task_map[tid] for tid in ordered_ids]
