import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

# 1. Get the URL from env
RAW_URL = os.getenv("DATABASE_URL")

# 2. Logic to "Smart-Fix" the path
if RAW_URL and "project(neurothon)" in RAW_URL:
    # If we are in Docker, the /home/gourav... path is wrong.
    # We force it to the Docker-friendly path.
    if os.path.exists("/.dockerenv") or os.environ.get("DOCKER_RUNNING"):
        DATABASE_URL = "sqlite:////app/dev.db"
    else:
        DATABASE_URL = RAW_URL
else:
    # Fallback for local development
    DATABASE_URL = RAW_URL or "sqlite:///./dev.db"

engine = create_engine(
    DATABASE_URL, 
    connect_args={"check_same_thread": False} if "sqlite" in DATABASE_URL else {}
)
SessionLocal = sessionmaker(bind=engine)