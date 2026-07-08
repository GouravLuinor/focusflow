"""
Celery task definitions for FocusFlow background jobs.
"""
from app.core.celery_config import celery_app
import time


@celery_app.task(bind=True, name="ping")
def ping_task(self):
    """Simple health check task to verify worker is running."""
    return {"status": "ok", "worker": self.request.hostname}


@celery_app.task(bind=True, name="placeholder_task")
def placeholder_task(self, message: str):
    """Placeholder to verify async execution works."""
    time.sleep(2)  # Simulate work
    return {"status": "done", "message": message, "worker": self.request.hostname}
