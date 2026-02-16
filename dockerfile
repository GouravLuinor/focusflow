# STAGE 1: Build the React Frontend
FROM node:20-alpine AS builder
WORKDIR /app/frontend
# Path to your specific frontend folder
COPY frontend/focusflow-hub/package*.json ./
RUN npm install
COPY frontend/focusflow-hub/ .
RUN npm run build

# STAGE 2: Final Image
FROM python:3.11-slim
WORKDIR /app

# Install deps
RUN apt-get update && apt-get install -y gcc && rm -rf /var/lib/apt/lists/*
COPY Backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# --- THE SMART CONFIG ---
# This matches your Python logic to switch the path
ENV DOCKER_RUNNING=true
ENV DATABASE_URL=sqlite:////app/dev.db

# Copy backend code
COPY Backend/app ./app
# Copy the built frontend into 'frontend_dist'
COPY --from=builder /app/frontend/dist ./frontend_dist

# Create/Copy the DB and ensure permissions for signup
# We put it in /app/dev.db to match your DATABASE_URL above
COPY Backend/dev.db ./dev.db
RUN chmod 777 ./dev.db

# Ensure the app can find the 'app' module
ENV PYTHONPATH=/app

EXPOSE 7860
# Run uvicorn - it will find app/main.py and run the 'app' object
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "7860"]