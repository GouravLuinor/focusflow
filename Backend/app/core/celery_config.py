import os
from pathlib import Path
from celery import Celery
from dotenv import load_dotenv

env_path = Path(__file__).resolve().parent.parent.parent / ".env"
load_dotenv(env_path)

# Redis URL for broker and result backend
REDIS_URL = os.getenv("REDIS_URL", "redis://localhost:6379/0")

celery_app = Celery(
    "focusflow",
    broker=REDIS_URL,
    backend=REDIS_URL,
    include=["app.worker.tasks"],  # We'll create this next
)

# Celery configuration
celery_app.conf.update(
    task_serializer="json",
    accept_content=["json"],
    result_serializer="json",
    timezone="UTC",
    enable_utc=True,
    task_track_started=True,
    task_acks_late=True,  # Re-deliver on worker crash
    worker_prefetch_multiplier=1,  # Fair distribution
    broker_connection_retry_on_startup=True,
)
