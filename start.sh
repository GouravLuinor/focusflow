#!/bin/bash

echo "============================================"
echo "  FocusFlow — Starting All Services"
echo "============================================"

# Kill any existing processes on our ports
echo "[1/4] Cleaning up old processes..."
lsof -ti:8000 | xargs kill -9 2>/dev/null
lsof -ti:8080 | xargs kill -9 2>/dev/null
lsof -ti:8081 | xargs kill -9 2>/dev/null

# Start Docker services
echo "[2/4] Starting PostgreSQL + Redis..."
docker compose up -d db redis
sleep 3

# Start backend
echo "[3/4] Starting backend (port 8000)..."
cd Backend
source ../.venv/bin/activate
uvicorn app.main:app --reload --host 127.0.0.1 --port 8000 &
BACKEND_PID=$!
cd ..

# Start Celery worker
echo "[4/4] Starting Celery worker..."
cd Backend
celery -A app.core.celery_config worker --loglevel=info &
CELERY_PID=$!
cd ..

# Start frontend
echo "Starting frontend (port 8080)..."
cd frontend/focusflow-hub
npm run dev &
FRONTEND_PID=$!
cd ../..

echo ""
echo "============================================"
echo "  FocusFlow is starting up!"
echo ""
echo "  Frontend: http://localhost:8080"
echo "  Backend:  http://localhost:8000"
echo "  API docs: http://localhost:8000/docs"
echo ""
echo "  Press Ctrl+C to stop all services"
echo "============================================"

# Trap Ctrl+C to kill all processes
trap "echo 'Shutting down...'; kill $BACKEND_PID $CELERY_PID $FRONTEND_PID 2>/dev/null; docker compose down; exit 0" INT TERM

# Wait for any process to exit
wait
