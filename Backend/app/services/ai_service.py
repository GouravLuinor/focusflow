from dotenv import load_dotenv
import os
import time
from google import genai
from typer import prompt   #
from typer import prompt   #

load_dotenv() 

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

if not GEMINI_API_KEY:
    raise RuntimeError("❌ GEMINI_API_KEY is not set in environment variables")

client = genai.Client(api_key=GEMINI_API_KEY)

def generate_ai_steps(title: str, support_mode: str = "adhd"):

    prompt = f"""
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
                    contents=prompt,       
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
        if "429" in str(e):
            print("Quota hit! Waiting 60s...")
            time.sleep(60)

        return [
            f"Define the goal of '{title}' clearly",
            "Identify 3 small achievable actions",
            "Start with the simplest one",
            "Work in a focused time block",
            "Review and adjust progress"
        ]


