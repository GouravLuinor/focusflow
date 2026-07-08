"""
Celery task definitions for FocusFlow background jobs.
"""
import json
import os
import time
from datetime import datetime
from app.core.celery_config import celery_app
from app.models.ai_job import AIJob
from app.models.task import Task
from app.models.task_dependency import TaskDependency
from app.models.goal import Goal
from app.schemas.ai_decomposition import AIDecompositionResponse
from sqlalchemy.orm import Session


@celery_app.task(bind=True, name="ping")
def ping_task(self):
    """Simple health check task to verify worker is running."""
    return {"status": "ok", "worker": self.request.hostname}


@celery_app.task(bind=True, name="placeholder_task")
def placeholder_task(self, message: str):
    """Placeholder to verify async execution works."""
    time.sleep(2)  # Simulate work
    return {"status": "done", "message": message, "worker": self.request.hostname}


@celery_app.task(bind=True, name="process_ai_decomposition")
def process_ai_decomposition(self, job_id: int):
    """
    Process an AI decomposition job.
    
    1. Load job from database
    2. Mark as RUNNING
    3. Call Gemini with structured prompt
    4. Validate response with Pydantic
    5. Persist tasks and dependencies in transaction
    6. Update job status
    """
    from app.db.session import SessionLocal
    from app.services.ai_job_service import update_job_status
    
    db = SessionLocal()
    
    try:
        # 1. Load job
        job = db.query(AIJob).filter(AIJob.id == job_id).first()
        if not job:
            return {"error": f"Job {job_id} not found"}
        
        if job.status != "PENDING":
            return {"error": f"Job {job_id} is not PENDING (current: {job.status})"}
        
        # 2. Mark as RUNNING
        update_job_status(db, job_id, "RUNNING")
        
        # 3. Load goal
        goal = db.query(Goal).filter(Goal.id == job.goal_id).first()
        if not goal:
            update_job_status(
                db, job_id, "FAILED",
                error_code="GOAL_NOT_FOUND",
                error_message=f"Goal {job.goal_id} not found"
            )
            return {"error": "Goal not found"}
        
        # 4. Build structured prompt
        prompt = _build_decomposition_prompt(goal.title, goal.description)
        
        # 5. Call Gemini
        start_time = time.time()
        try:
            response_text = _call_gemini(prompt)
            latency = int((time.time() - start_time) * 1000)
        except Exception as e:
            update_job_status(
                db, job_id, "FAILED",
                error_code="AI_PROVIDER_ERROR",
                error_message=str(e)[:500],
                latency_ms=int((time.time() - start_time) * 1000)
            )
            return {"error": str(e)}
        
        # 6. Parse and validate response
        try:
            # Try to extract JSON from response
            parsed = _extract_json(response_text)
            decomposition = AIDecompositionResponse(**parsed)
            is_valid, error_msg = decomposition.validate_internal()
            if not is_valid:
                update_job_status(
                    db, job_id, "FAILED",
                    error_code="VALIDATION_ERROR",
                    error_message=error_msg,
                    latency_ms=latency
                )
                return {"error": error_msg}
        except Exception as e:
            update_job_status(
                db, job_id, "FAILED",
                error_code="PARSE_ERROR",
                error_message=f"Failed to parse AI response: {str(e)[:500]}",
                latency_ms=latency
            )
            return {"error": str(e)}
        
        # 7. Persist tasks and dependencies in transaction
        try:
            task_id_map = {}  # client_id → real task_id
            created_tasks = []
            
            for suggestion in decomposition.tasks:
                task = Task(
                    title=suggestion.title,
                    goal_id=goal.id,
                    user_id=job.user_id,
                    estimated_minutes=suggestion.estimated_minutes,
                    is_completed=False,
                )
                db.add(task)
                db.flush()  # Get the real ID
                task_id_map[suggestion.client_id] = task.id
                created_tasks.append(task)
            
            # Create dependency edges
            for suggestion in decomposition.tasks:
                real_task_id = task_id_map[suggestion.client_id]
                for dep_client_id in suggestion.depends_on:
                    real_dep_id = task_id_map[dep_client_id]
                    dep = TaskDependency(
                        task_id=real_task_id,
                        depends_on_task_id=real_dep_id,
                    )
                    db.add(dep)
            
            db.commit()
            
            # Build result metadata
            result_metadata = {
                "tasks_created": len(created_tasks),
                "task_ids": [t.id for t in created_tasks],
                "dependencies_created": sum(
                    len(s.depends_on) for s in decomposition.tasks
                ),
            }
            
            update_job_status(
                db, job_id, "SUCCEEDED",
                latency_ms=latency,
                result_metadata=json.dumps(result_metadata)
            )
            
            return {
                "status": "SUCCEEDED",
                "tasks_created": len(created_tasks),
                "task_ids": result_metadata["task_ids"],
            }
            
        except Exception as e:
            db.rollback()
            update_job_status(
                db, job_id, "FAILED",
                error_code="PERSISTENCE_ERROR",
                error_message=f"Failed to persist workflow: {str(e)[:500]}"
            )
            return {"error": str(e)}
    
    except Exception as e:
        try:
            update_job_status(
                db, job_id, "FAILED",
                error_code="INTERNAL_ERROR",
                error_message=str(e)[:500]
            )
        except:
            pass
        return {"error": str(e)}
    
    finally:
        db.close()


def _build_decomposition_prompt(title: str, description: str = None) -> str:
    """Build a structured prompt for Gemini that requests JSON output."""
    desc_text = f"\nDescription: {description}" if description else ""
    
    return f"""Break down the goal "{title}"{desc_text} into actionable tasks.

Return ONLY a JSON object with this exact structure:
{{
  "tasks": [
    {{
      "client_id": "t1",
      "title": "Specific actionable task",
      "estimated_minutes": 30,
      "depends_on": []
    }},
    {{
      "client_id": "t2",
      "title": "Another task",
      "estimated_minutes": 45,
      "depends_on": ["t1"]
    }}
  ]
}}

Rules:
- Use client_id values like "t1", "t2", "t3"
- depends_on lists client_ids that must be completed first
- estimated_minutes between 15 and 240
- Maximum 15 tasks
- Return ONLY valid JSON, no markdown, no explanations
- Ensure no dependency cycles
"""


def _call_gemini(prompt: str) -> str:
    """Call Gemini API and return text response."""
    from google import genai
    
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        raise RuntimeError("GEMINI_API_KEY not configured")
    
    client = genai.Client(api_key=api_key)
    
    response = client.models.generate_content(
        model="gemini-3.1-flash-lite-preview",
        contents=prompt,
    )
    
    return response.text.strip()


def _extract_json(text: str) -> dict:
    """Extract JSON from AI response, handling markdown code blocks."""
    import re
    
    # Try to extract from ```json ... ``` block
    json_match = re.search(r'```(?:json)?\s*(\{.*?\})\s*```', text, re.DOTALL)
    if json_match:
        text = json_match.group(1)
    
    # Try to find raw JSON object
    json_match = re.search(r'\{.*\}', text, re.DOTALL)
    if json_match:
        text = json_match.group(0)
    
    return json.loads(text)
