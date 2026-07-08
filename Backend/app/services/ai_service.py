import os
from dotenv import load_dotenv
from google import genai

load_dotenv()


def _get_ai_client():
    """Lazily initialize Gemini client. Returns None if not configured."""
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        return None
    return genai.Client(api_key=api_key)


def _get_fallback_steps(title: str) -> list[str]:
    """Return generic fallback steps when AI is unavailable."""
    return [
        f"Define the goal of '{title}' clearly",
        "Identify 3 small achievable actions",
        "Start with the simplest one",
        "Work in a focused time block",
        "Review and adjust progress"
    ]


def generate_ai_steps(title: str, support_mode: str = "adhd") -> list[str]:
    client = _get_ai_client()
    
    if client is None:
        print(f"Gemini not configured. Using fallback steps for task '{title}'.")
        return _get_fallback_steps(title)
    
    decomposition_prompt = f"""
    Break the task "{title}" into exactly 5 short actionable steps.

    Rules:
    - Each step must be 1 short sentence.
    - No introductions.
    - No explanations.
    - No markdown.
    - No bold text.
    - No extra text.
    - Only return 5 lines.
    - Each line should start with a number and a period.

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
                cleaned = cleaned.lstrip("0123456789. ").strip()
                steps.append(cleaned)

        return steps[:5]

    except Exception as e:
        error_str = str(e)
        if "429" in error_str:
            print(f"Gemini API quota exceeded for task '{title}'. Using fallback.")
        else:
            print(f"Gemini API error for task '{title}': {error_str[:200]}. Using fallback.")
        return _get_fallback_steps(title)
