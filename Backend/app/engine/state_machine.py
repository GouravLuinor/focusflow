# Valid state transitions
VALID_TRANSITIONS = {
    "TODO": ["IN_PROGRESS", "CANCELLED"],
    "IN_PROGRESS": ["COMPLETED", "PAUSED", "CANCELLED"],
    "PAUSED": ["IN_PROGRESS", "CANCELLED"],
    "COMPLETED": [],  # Terminal
    "CANCELLED": [],  # Terminal
}


def is_valid_transition(current_status: str, new_status: str) -> bool:
    """Check if a status transition is valid."""
    if current_status not in VALID_TRANSITIONS:
        return False
    return new_status in VALID_TRANSITIONS[current_status]


def transition_task_status(task, new_status: str) -> tuple[bool, str]:
    """
    Attempt to transition a task to a new status.
    Returns (success, error_message).
    """
    current = task.status.upper() if task.status else "TODO"
    new = new_status.upper()
    
    if not is_valid_transition(current, new):
        return False, f"Invalid transition: {current} → {new}. Valid transitions: {VALID_TRANSITIONS.get(current, [])}"
    
    task.status = new
    return True, ""
