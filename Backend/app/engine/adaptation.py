"""
Adaptive duration estimation using execution history.
"""
from typing import Optional


# Default alpha: weight given to most recent actual duration
DEFAULT_ALPHA = 0.6


def calculate_adjusted_estimate(
    user_estimate_minutes: Optional[int],
    completed_sessions: list,
    alpha: float = DEFAULT_ALPHA,
) -> dict:
    """
    Calculate adjusted duration estimate based on execution history.
    
    Uses weighted moving average:
        adjusted = (alpha × latest_actual) + ((1 - alpha) × user_estimate)
    
    Args:
        user_estimate_minutes: the user's original estimate in minutes
        completed_sessions: list of completed execution sessions with duration_seconds
        alpha: weight for recent actual vs original estimate (0-1)
    
    Returns:
        dict with: original_minutes, adjusted_minutes, confidence, sample_count
    """
    if not completed_sessions:
        return {
            "original_minutes": user_estimate_minutes,
            "adjusted_minutes": user_estimate_minutes,
            "confidence": "low",
            "sample_count": 0,
        }
    
    # Get latest completed session duration in minutes
    latest_duration_seconds = completed_sessions[0].duration_seconds
    if latest_duration_seconds is None:
        return {
            "original_minutes": user_estimate_minutes,
            "adjusted_minutes": user_estimate_minutes,
            "confidence": "low",
            "sample_count": len(completed_sessions),
        }
    
    latest_actual_minutes = latest_duration_seconds / 60.0
    
    # If no user estimate, just use actual
    if user_estimate_minutes is None:
        adjusted = latest_actual_minutes
    else:
        adjusted = (alpha * latest_actual_minutes) + ((1 - alpha) * user_estimate_minutes)
    
    # Confidence based on sample count
    count = len(completed_sessions)
    if count == 1:
        confidence = "low"
    elif count <= 3:
        confidence = "medium"
    else:
        confidence = "high"
    
    return {
        "original_minutes": user_estimate_minutes,
        "adjusted_minutes": round(adjusted, 1),
        "confidence": confidence,
        "sample_count": count,
    }


def get_average_actual_duration(completed_sessions: list) -> Optional[float]:
    """Calculate simple average of all completed session durations in minutes."""
    if not completed_sessions:
        return None
    
    durations = [s.duration_seconds for s in completed_sessions if s.duration_seconds is not None]
    if not durations:
        return None
    
    return round(sum(durations) / len(durations) / 60.0, 1)
