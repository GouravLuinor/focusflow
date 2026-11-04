import os
import json
from pathlib import Path
from dotenv import load_dotenv
from google import genai
import redis

env_path = Path(__file__).resolve().parent.parent.parent / ".env"
load_dotenv(env_path)

_redis_client = None

def _get_redis():
    global _redis_client
    if _redis_client is None:
        try:
            redis_url = os.getenv("REDIS_URL", "redis://localhost:6379/0")
            _redis_client = redis.from_url(redis_url, socket_connect_timeout=1, socket_timeout=1)
            _redis_client.ping()
        except Exception:
            _redis_client = False
    return _redis_client if _redis_client is not False else None


def _get_ai_client():
    """Lazily initialize Gemini client. Returns None if not configured."""
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key or api_key == "mock" or api_key.startswith("ci-"):
        return None
    try:
        return genai.Client(api_key=api_key)
    except Exception:
        return None


def _get_fallback_steps(title: str, support_mode: str = "adhd") -> list[str]:
    """Return tailored cognitive fallback steps based on support mode."""
    mode = (support_mode or "adhd").lower()
    
    if mode == "adhd":
        return [
            f"Spend 2 minutes setting up your workspace for '{title}'",
            "Write down the single most obvious first sentence or line",
            "Work with zero distractions for 15 minutes of momentum",
            "Take a quick breath and review what was completed",
            "Wrap up the remaining items and mark complete"
        ]
    elif mode == "autism":
        return [
            f"Define explicit starting requirements and criteria for '{title}'",
            "Gather all necessary files, links, and background references",
            "Execute the core implementation step-by-step in sequence",
            "Check finished work against the initial requirements",
            "Document completion status and unblock subsequent tasks"
        ]
    elif mode == "dyslexia":
        return [
            f"Review the primary goal of '{title}'",
            "Draft a simple 3-point bullet outline",
            "Complete the main section without worrying about formatting",
            "Format and refine the content with high clarity",
            "Final verification and sign-off"
        ]
    
    return [
        f"Define the objective for '{title}'",
        "Break into 3 small achievable actions",
        "Start with the first action",
        "Execute in a focused time block",
        "Review and mark complete"
    ]


def generate_ai_steps(title: str, support_mode: str = "adhd") -> list[str]:
    cache_key = f"ai_steps:{support_mode}:{title.strip().lower()}"
    r = _get_redis()

    if r:
        try:
            cached = r.get(cache_key)
            if cached:
                return json.loads(cached.decode("utf-8"))
        except Exception:
            pass

    client = _get_ai_client()
    
    if client is None:
        steps = _get_fallback_steps(title, support_mode)
        if r:
            try:
                r.setex(cache_key, 3600, json.dumps(steps))
            except Exception:
                pass
        return steps
    
    decomposition_prompt = f"""
    Break the task "{title}" into exactly 5 short actionable steps.

    Rules:
    - Each step must be 1 short sentence.
    - No introductions or explanations.
    - No markdown or asterisks.
    - Only return 5 lines numbered 1 to 5.

    Support tone for: {support_mode}
    """

    try:
        response = client.models.generate_content(
            model="gemini-2.0-flash",
            contents=decomposition_prompt,
        )

        text = response.text.strip()
        lines = text.split("\n")
        steps = []

        for line in lines:
            cleaned = line.strip()
            if cleaned:
                cleaned = cleaned.lstrip("0123456789. -").strip()
                if cleaned:
                    steps.append(cleaned)

        final_steps = steps[:5] if len(steps) >= 3 else _get_fallback_steps(title, support_mode)
        if r:
            try:
                r.setex(cache_key, 3600, json.dumps(final_steps))
            except Exception:
                pass
        return final_steps

    except Exception as e:
        print(f"Gemini AI step generation fallback for '{title}': {e}")
        steps = _get_fallback_steps(title, support_mode)
        if r:
            try:
                r.setex(cache_key, 3600, json.dumps(steps))
            except Exception:
                pass
        return steps


_VALID_PRIORITIES = {"LOW", "MEDIUM", "HIGH", "URGENT"}


def _sanitize_parsed_task(raw: dict, original_text: str) -> dict:
    """Coerce LLM output into the shape the frontend expects; drop anything invalid."""
    from datetime import date

    title = raw.get("title")
    title = title.strip()[:200] if isinstance(title, str) and title.strip() else original_text.strip()[:200]

    minutes = raw.get("estimated_minutes")
    if isinstance(minutes, bool) or not isinstance(minutes, (int, float)) or not (0 < minutes <= 24 * 60):
        minutes = None
    else:
        minutes = int(minutes)

    priority = raw.get("priority")
    priority = priority.upper() if isinstance(priority, str) and priority.upper() in _VALID_PRIORITIES else None

    deadline = raw.get("deadline")
    try:
        deadline = date.fromisoformat(deadline).isoformat() if isinstance(deadline, str) else None
    except ValueError:
        deadline = None

    return {"title": title, "estimated_minutes": minutes, "priority": priority, "deadline": deadline}


def parse_task_text(text: str) -> dict:
    """
    Parse natural language into structured task fields using Gemini.

    Blocking (network call) — call from a worker thread, not the event loop.
    Raises AIUnavailableError if AI is not configured, AIRequestError on failure.
    """
    import re
    from datetime import datetime, timedelta

    client = _get_ai_client()
    if client is None:
        raise AIUnavailableError("AI service not available")

    tomorrow_date = (datetime.now() + timedelta(days=1)).strftime("%Y-%m-%d")
    prompt = f"""Parse this task description into structured fields.

User said: {json.dumps(text)}

Return ONLY a JSON object with these fields:
{{
  "title": "clean task title without time/priority/deadline words",
  "estimated_minutes": number or null,
  "priority": "LOW" | "MEDIUM" | "HIGH" | "URGENT" | null,
  "deadline": "YYYY-MM-DD" or null
}}

Rules:
- Extract the core task, remove filler words like "I need to", "maybe", "should"
- For time: "half an hour" = 30, "an hour" = 60, "2 hours" = 120
- For priority: "urgent" = URGENT, "important" = HIGH, "whenever" = LOW
- For deadline: "tomorrow" = {tomorrow_date}, "next Friday" = next occurrence
- If unsure about any field, set it to null
- Return ONLY the JSON, no markdown, no explanation"""

    try:
        response = client.models.generate_content(model="gemini-2.0-flash", contents=prompt)
        match = re.search(r"\{.*\}", (response.text or "").strip(), re.DOTALL)
        raw = json.loads(match.group(0)) if match else {}
    except Exception as e:
        print(f"Gemini API error during task parsing: {e}")
        raise AIRequestError("AI parsing failed") from e

    return _sanitize_parsed_task(raw if isinstance(raw, dict) else {}, text)


class AIUnavailableError(Exception):
    pass


class AIRequestError(Exception):
    pass
