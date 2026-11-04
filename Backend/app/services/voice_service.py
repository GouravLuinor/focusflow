from faster_whisper import WhisperModel
import tempfile
import os

# Load model once at module level (lazy)
_model = None


def get_model():
    global _model
    if _model is None:
        print("Loading Whisper model from cache...")
        _model = WhisperModel("tiny", device="cpu", compute_type="int8")
        print("Whisper model ready.")
    return _model


def transcribe_audio(audio_bytes: bytes) -> str:
    """Transcribe audio bytes to text using Faster-Whisper."""
    model = get_model()

    # Save bytes to temp file
    with tempfile.NamedTemporaryFile(suffix=".wav", delete=False) as f:
        f.write(audio_bytes)
        temp_path = f.name

    try:
        segments, _ = model.transcribe(temp_path, beam_size=5)
        text = " ".join(segment.text for segment in segments)
        return text.strip()
    finally:
        os.unlink(temp_path)
