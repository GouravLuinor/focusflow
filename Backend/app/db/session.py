import os
from pathlib import Path
from dotenv import load_dotenv
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

env_path = Path(__file__).resolve().parent.parent.parent / ".env"
load_dotenv(env_path)

# 1. Get the URL from env, default to SQLite only if unset
DATABASE_URL = os.getenv("DATABASE_URL") or "sqlite:///./dev.db"

# 2. Configure connect args (only check_same_thread for SQLite)
connect_args = {"check_same_thread": False} if "sqlite" in DATABASE_URL else {}

engine = create_engine(
    DATABASE_URL, 
    connect_args=connect_args
)
SessionLocal = sessionmaker(bind=engine)