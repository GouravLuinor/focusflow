from sqlalchemy.orm import Session
from app.models.goal import Goal
from app.schemas.goal import GoalCreate, GoalUpdate
from typing import List, Optional

def create_goal(db: Session, user_id: int, goal_data: GoalCreate) -> Goal:
    db_goal = Goal(
        user_id=user_id,
        title=goal_data.title,
        description=goal_data.description,
        status=goal_data.status.value if hasattr(goal_data.status, "value") else goal_data.status,
        priority=goal_data.priority.value if hasattr(goal_data.priority, "value") else goal_data.priority,
        deadline=goal_data.deadline
    )
    db.add(db_goal)
    db.commit()
    db.refresh(db_goal)
    return db_goal

def get_goals(db: Session, user_id: int) -> List[Goal]:
    return db.query(Goal).filter(Goal.user_id == user_id).all()

def get_goal(db: Session, goal_id: int, user_id: int) -> Optional[Goal]:
    return db.query(Goal).filter(Goal.id == goal_id, Goal.user_id == user_id).first()

def update_goal(db: Session, goal_id: int, user_id: int, goal_data: GoalUpdate) -> Optional[Goal]:
    db_goal = get_goal(db, goal_id, user_id)
    if not db_goal:
        return None
    
    update_data = goal_data.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        if key in ("status", "priority") and value is not None:
            setattr(db_goal, key, value.value if hasattr(value, "value") else value)
        else:
            setattr(db_goal, key, value)
            
    db.commit()
    db.refresh(db_goal)
    return db_goal

def delete_goal(db: Session, goal_id: int, user_id: int) -> bool:
    db_goal = get_goal(db, goal_id, user_id)
    if not db_goal:
        return False
    db.delete(db_goal)
    db.commit()
    return True
