from fastapi import APIRouter, UploadFile, File, Depends, HTTPException
from fastapi.concurrency import run_in_threadpool
from app.core.auth import get_current_user
from app.models.user import User
from app.services.voice_service import transcribe_audio

router = APIRouter(prefix="/voice", tags=["voice"])

# ~10 MB is several minutes of compressed speech — far more than a task description needs.
MAX_AUDIO_BYTES = 10 * 1024 * 1024
_READ_CHUNK = 1024 * 1024


async def _read_limited(file: UploadFile, limit: int) -> bytes:
    """Read an upload without ever holding more than `limit` bytes in memory."""
    chunks: list[bytes] = []
    total = 0
    while chunk := await file.read(_READ_CHUNK):
        total += len(chunk)
        if total > limit:
            raise HTTPException(status_code=413, detail="Recording is too long. Please keep it under a few minutes.")
        chunks.append(chunk)
    return b"".join(chunks)


@router.post("/transcribe")
async def transcribe(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
):
    """Transcribe audio to text. Returns the transcribed text."""
    content_type = (file.content_type or "").lower()
    if content_type and not (
        content_type.startswith("audio/")
        or content_type in ("video/webm", "application/octet-stream")
    ):
        raise HTTPException(status_code=415, detail="Unsupported file type. Please upload audio.")

    audio_bytes = await _read_limited(file, MAX_AUDIO_BYTES)
    if not audio_bytes:
        raise HTTPException(status_code=400, detail="No audio received.")

    # Whisper inference is CPU-bound and takes seconds; run it in a worker
    # thread so other requests are not blocked while it runs.
    try:
        text = await run_in_threadpool(transcribe_audio, audio_bytes)
    except Exception as e:
        print(f"Voice transcription failed: {e}")
        raise HTTPException(status_code=422, detail="Couldn't understand that recording. Please try again.")
    return {"text": text}
