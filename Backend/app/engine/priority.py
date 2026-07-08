"""
Priority scoring engine for task scheduling.
Deterministic, testable, and explainable scoring using weighted factors.
"""
from datetime import datetime, timezone
from typing import Optional


# Default weights for scoring components
DEFAULT_WEIGHTS = {
    "deadline_urgency": 3.0,
    "user_priority": 2.0,
    "dependency_unlock": 2.5,
    "overdue_penalty": 5.0,
    "postponement_penalty": 1.5,
    "effort_mismatch": 1.0,
}

# Priority values for ranking
PRIORITY_VALUES = {
    "URGENT": 4,
    "HIGH": 3,
    "MEDIUM": 2,
    "LOW": 1,
}


def calculate_deadline_urgency(deadline: Optional[datetime], now: Optional[datetime] = None) -> tuple[float, str]:
    """
    Calculate urgency based on deadline proximity.
    
    Returns (score, reason).
    - Overdue: high urgency
    - Within 24h: very urgent
    - Within 3 days: moderately urgent
    - Within 7 days: somewhat urgent
    - Beyond 7 days or no deadline: neutral
    """
    if now is None:
        now = datetime.now(timezone.utc)
    
    if deadline is None:
        return 0.0, "no deadline set"
    
    # Ensure deadline is timezone-aware for comparison
    if deadline.tzinfo is None:
        from datetime import timezone as tz
        deadline = deadline.replace(tzinfo=tz.utc)
    if now.tzinfo is None:
        now = now.replace(tzinfo=timezone.utc)
    
    hours_remaining = (deadline - now).total_seconds() / 3600
    
    if hours_remaining < 0:
        # Overdue — score increases with how overdue it is
        days_overdue = abs(hours_remaining) / 24
        score = min(10.0, 5.0 + days_overdue)  # Cap at 10
        return score, f"overdue by {days_overdue:.1f} days"
    elif hours_remaining <= 24:
        return 4.0, f"due within {hours_remaining:.0f} hours"
    elif hours_remaining <= 72:
        return 3.0, f"due in {hours_remaining / 24:.1f} days"
    elif hours_remaining <= 168:  # 7 days
        return 2.0, f"due in {hours_remaining / 24:.1f} days"
    else:
        return 1.0, f"due in {hours_remaining / 24:.1f} days"


def calculate_user_priority(priority: str) -> tuple[float, str]:
    """
    Map user priority to numeric score.
    """
    value = PRIORITY_VALUES.get(priority.upper(), 2)
    return float(value), f"priority: {priority.lower()}"


def calculate_dependency_unlock(task_id: int, all_dependencies: list[tuple]) -> tuple[float, str]:
    """
    Calculate how many downstream tasks this task unlocks.
    
    Args:
        task_id: the task being scored
        all_dependencies: list of (task_id, depends_on_task_id) edges
    
    Returns (score, reason).
    """
    # Count how many tasks depend on this task
    unlock_count = sum(1 for dep in all_dependencies if dep[1] == task_id)
    
    if unlock_count == 0:
        return 0.0, "unlocks no tasks"
    elif unlock_count == 1:
        return 1.5, "unlocks 1 task"
    elif unlock_count <= 3:
        return 3.0, f"unlocks {unlock_count} tasks"
    else:
        return 5.0, f"unlocks {unlock_count} tasks"


def calculate_overdue_penalty(deadline: Optional[datetime], now: Optional[datetime] = None) -> tuple[float, str]:
    """
    Additional penalty for overdue tasks (separate from urgency).
    """
    if deadline is None:
        return 0.0, ""
    
    if now is None:
        now = datetime.now(timezone.utc)
    
    if deadline.tzinfo is None:
        from datetime import timezone as tz
        deadline = deadline.replace(tzinfo=tz.utc)
    if now.tzinfo is None:
        now = now.replace(tzinfo=timezone.utc)
    
    if deadline < now:
        days_overdue = (now - deadline).days
        return min(10.0, float(days_overdue)), f"overdue by {days_overdue} days"
    
    return 0.0, ""


def calculate_postponement_penalty(postponement_count: int) -> tuple[float, str]:
    """
    Penalty for tasks that have been repeatedly postponed.
    """
    if postponement_count == 0:
        return 0.0, ""
    elif postponement_count == 1:
        return 1.0, "postponed once"
    elif postponement_count <= 3:
        return 2.0, f"postponed {postponement_count} times"
    else:
        return 4.0, f"postponed {postponement_count} times"


def calculate_effort_fit(estimated_minutes: Optional[int], available_minutes: int) -> tuple[float, str]:
    """
    Penalty for tasks that don't fit available time.
    Returns negative score (penalty) for tasks exceeding available time.
    """
    if estimated_minutes is None:
        return 0.0, "no duration estimate"
    
    if estimated_minutes <= available_minutes:
        return 0.0, f"fits in {available_minutes}min window"
    
    # Penalty proportional to how much it exceeds available time
    overflow = estimated_minutes - available_minutes
    penalty = min(5.0, overflow / 15.0)  # -1 per 15 minutes over, max -5
    return -penalty, f"exceeds available time by {overflow}min"


def score_task(
    task: dict,
    available_minutes: int = 120,
    all_dependencies: list[tuple] = None,
    weights: dict = None,
    now: datetime = None,
) -> dict:
    """
    Score a single task and return score with component breakdown.
    
    Args:
        task: dict with keys:
            id, title, priority, deadline, estimated_minutes,
            postponement_count (optional, default 0)
        available_minutes: user's available time window
        all_dependencies: list of all (task_id, depends_on_task_id) edges
        weights: scoring weights (uses DEFAULT_WEIGHTS if not provided)
        now: current time for urgency calculation
    
    Returns:
        dict with: task_id, title, total_score, components, reasons
    """
    if all_dependencies is None:
        all_dependencies = []
    if weights is None:
        weights = DEFAULT_WEIGHTS
    if now is None:
        now = datetime.now(timezone.utc)
    
    task_id = task["id"]
    components = {}
    reasons = []
    total = 0.0
    
    # 1. Deadline urgency
    urgency_score, urgency_reason = calculate_deadline_urgency(
        task.get("deadline"), now
    )
    weighted_urgency = urgency_score * weights["deadline_urgency"]
    components["deadline_urgency"] = {
        "raw": round(urgency_score, 2),
        "weighted": round(weighted_urgency, 2),
        "reason": urgency_reason,
    }
    total += weighted_urgency
    if urgency_reason:
        reasons.append(urgency_reason)
    
    # 2. User priority
    priority_score, priority_reason = calculate_user_priority(
        task.get("priority", "MEDIUM")
    )
    weighted_priority = priority_score * weights["user_priority"]
    components["user_priority"] = {
        "raw": round(priority_score, 2),
        "weighted": round(weighted_priority, 2),
        "reason": priority_reason,
    }
    total += weighted_priority
    reasons.append(priority_reason)
    
    # 3. Dependency unlock value
    unlock_score, unlock_reason = calculate_dependency_unlock(task_id, all_dependencies)
    weighted_unlock = unlock_score * weights["dependency_unlock"]
    components["dependency_unlock"] = {
        "raw": round(unlock_score, 2),
        "weighted": round(weighted_unlock, 2),
        "reason": unlock_reason,
    }
    total += weighted_unlock
    if unlock_score > 0:
        reasons.append(unlock_reason)
    
    # 4. Overdue penalty
    overdue_score, overdue_reason = calculate_overdue_penalty(
        task.get("deadline"), now
    )
    weighted_overdue = overdue_score * weights["overdue_penalty"]
    components["overdue_penalty"] = {
        "raw": round(overdue_score, 2),
        "weighted": round(weighted_overdue, 2),
        "reason": overdue_reason,
    }
    total += weighted_overdue
    if overdue_score > 0:
        reasons.append(overdue_reason)
    
    # 5. Postponement penalty
    postponement_score, postponement_reason = calculate_postponement_penalty(
        task.get("postponement_count", 0)
    )
    weighted_postponement = postponement_score * weights["postponement_penalty"]
    components["postponement_penalty"] = {
        "raw": round(postponement_score, 2),
        "weighted": round(weighted_postponement, 2),
        "reason": postponement_reason,
    }
    total += weighted_postponement
    if postponement_score > 0:
        reasons.append(postponement_reason)
    
    # 6. Effort fit (penalty)
    effort_score, effort_reason = calculate_effort_fit(
        task.get("estimated_minutes"), available_minutes
    )
    weighted_effort = effort_score * weights["effort_mismatch"]
    components["effort_fit"] = {
        "raw": round(effort_score, 2),
        "weighted": round(weighted_effort, 2),
        "reason": effort_reason,
    }
    total += weighted_effort
    if effort_score < 0:
        reasons.append(effort_reason)
    
    return {
        "task_id": task_id,
        "title": task.get("title", ""),
        "total_score": round(total, 2),
        "components": components,
        "reasons": reasons,
    }


def rank_tasks(
    tasks: list[dict],
    available_minutes: int = 120,
    all_dependencies: list[tuple] = None,
    weights: dict = None,
    now: datetime = None,
) -> list[dict]:
    """
    Score and rank a list of tasks by priority score (descending).
    
    Returns tasks sorted by total_score, highest first.
    """
    scored = [
        score_task(task, available_minutes, all_dependencies, weights, now)
        for task in tasks
    ]
    scored.sort(key=lambda t: t["total_score"], reverse=True)
    return scored


def select_plan(
    tasks: list[dict],
    available_minutes: int = 120,
    all_dependencies: list[tuple] = None,
    weights: dict = None,
    now: datetime = None,
) -> dict:
    """
    Select the best plan: highest-scoring tasks that fit available time.
    
    Returns:
        dict with: plan (list of scored tasks), total_estimated_minutes,
                   total_available_minutes, overflow_tasks (int)
    """
    ranked = rank_tasks(tasks, available_minutes, all_dependencies, weights, now)
    
    plan = []
    total_estimated = 0
    
    for task in ranked:
        estimated = task.get("task_id") and next(
            (t.get("estimated_minutes") for t in tasks if t["id"] == task["task_id"]), None
        )
        # Include task if it fits or if we're still under time
        if estimated is None or total_estimated + estimated <= available_minutes:
            plan.append(task)
            if estimated:
                total_estimated += estimated
        else:
            # Mark as overflow but still show in results
            task["overflow"] = True
    
    return {
        "plan": plan,
        "total_estimated_minutes": total_estimated,
        "total_available_minutes": available_minutes,
        "overflow_tasks": len(ranked) - len(plan),
    }
