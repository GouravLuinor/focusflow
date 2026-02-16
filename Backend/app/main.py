from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from app.api.profile import router as profile_router
from app.db.session import engine
from app.db.base import Base
from app.api.auth import router as auth_router
from app.api.task import router as task_router
from app.api.step import router as step_router
from app.api.ai import router as ai_router
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from pathlib import Path

@asynccontextmanager
async def lifespan(app: FastAPI):
    # This ensures your tables are created in dev.db on startup
    Base.metadata.create_all(bind=engine)
    yield

app = FastAPI(title="FocusFlow Backend", lifespan=lifespan)

# 1. ADD MIDDLEWARE FIRST
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # Change to specific domain for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 2. INCLUDE API ROUTERS BEFORE FRONTEND
# If a request starts with /auth or /tasks, these will catch it first
# main.py
app.include_router(auth_router)
app.include_router(profile_router)
app.include_router(task_router)
app.include_router(step_router)
app.include_router(ai_router)

# DO NOT put /api/ prefixes here if they are already in the auth.py file!

# 3. MOUNT STATIC ASSETS
# This handles CSS/JS files inside frontend_dist/assets
frontend_path = Path("frontend_dist")
if frontend_path.exists():
    app.mount("/assets", StaticFiles(directory=frontend_path / "assets"), name="assets")

# 4. CATCH-ALL FOR FRONTEND (Must be at the very bottom)
@app.get("/{rest_of_path:path}")
async def serve_frontend(rest_of_path: str):
    index_file = frontend_path / "index.html"
    if index_file.exists():
        return FileResponse(index_file)
    return {"status": "backend is running", "error": "frontend not found"}