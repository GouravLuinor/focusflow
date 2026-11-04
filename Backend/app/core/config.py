from pathlib import Path
from dotenv import load_dotenv

env_path = Path(__file__).resolve().parent.parent.parent / ".env"
load_dotenv(env_path)

import os

# Gemini model used for all AI features (step generation, task parsing,
# goal decomposition). Override with GEMINI_MODEL in .env if needed.
GEMINI_MODEL = os.getenv("GEMINI_MODEL", "gemini-3.5-flash-lite")
