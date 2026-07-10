from fastapi import APIRouter, UploadFile, File, Depends
from app.core.auth import get_current_user
from app.models.user import User
from app.services.voice_service import transcribe_audio

router = APIRouter(prefix="/voice", tags=["voice"])


@router.post("/transcribe")
async def transcribe(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
):
    """Transcribe audio to text. Returns the transcribed text."""
    audio_bytes = await file.read()
    text = transcribe_audio(audio_bytes)
    return {"text": text}
