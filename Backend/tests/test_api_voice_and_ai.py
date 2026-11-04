"""
Voice transcription and AI parsing must not block the event loop, and must
reject oversized / invalid input.
"""
import asyncio

import pytest

from app.api import voice as voice_api
from app.services import ai_service


def _running_on_event_loop() -> bool:
    try:
        asyncio.get_running_loop()
        return True
    except RuntimeError:
        return False


# ------------------------------------------------------------------
# Voice
# ------------------------------------------------------------------

def test_transcription_runs_off_the_event_loop(client, auth_headers, monkeypatch):
    seen = {}

    def fake_transcribe(audio: bytes) -> str:
        seen["on_loop"] = _running_on_event_loop()
        return "buy milk"

    monkeypatch.setattr(voice_api, "transcribe_audio", fake_transcribe)
    res = client.post(
        "/voice/transcribe",
        files={"file": ("r.webm", b"\x1a\x45\xdf\xa3fake", "audio/webm")},
        headers=auth_headers,
    )
    assert res.status_code == 200, res.text
    assert res.json() == {"text": "buy milk"}
    assert seen["on_loop"] is False, "Whisper ran on the event loop and would block all requests"


def test_oversized_audio_is_rejected(client, auth_headers, monkeypatch):
    monkeypatch.setattr(voice_api, "MAX_AUDIO_BYTES", 1024)
    monkeypatch.setattr(voice_api, "transcribe_audio", lambda b: pytest.fail("should not transcribe"))
    res = client.post(
        "/voice/transcribe",
        files={"file": ("r.webm", b"x" * 2048, "audio/webm")},
        headers=auth_headers,
    )
    assert res.status_code == 413


def test_empty_audio_is_rejected(client, auth_headers):
    res = client.post(
        "/voice/transcribe",
        files={"file": ("r.webm", b"", "audio/webm")},
        headers=auth_headers,
    )
    assert res.status_code == 400


def test_non_audio_upload_is_rejected(client, auth_headers):
    res = client.post(
        "/voice/transcribe",
        files={"file": ("evil.html", b"<script>", "text/html")},
        headers=auth_headers,
    )
    assert res.status_code == 415


def test_transcription_failure_returns_friendly_error(client, auth_headers, monkeypatch):
    def boom(audio):
        raise RuntimeError("ffmpeg exploded at /secret/path")

    monkeypatch.setattr(voice_api, "transcribe_audio", boom)
    res = client.post(
        "/voice/transcribe",
        files={"file": ("r.webm", b"data", "audio/webm")},
        headers=auth_headers,
    )
    assert res.status_code == 422
    assert "secret" not in res.text


def test_voice_requires_auth(client):
    res = client.post("/voice/transcribe", files={"file": ("r.webm", b"data", "audio/webm")})
    assert res.status_code == 401


# ------------------------------------------------------------------
# AI parse-task
# ------------------------------------------------------------------

def test_parse_task_runs_off_the_event_loop(client, auth_headers, monkeypatch):
    seen = {}

    def fake_parse(text):
        seen["on_loop"] = _running_on_event_loop()
        return {"title": text, "estimated_minutes": None, "priority": None, "deadline": None}

    monkeypatch.setattr("app.api.ai.parse_task_text", fake_parse)
    res = client.post("/ai/parse-task", json={"text": "call mom"}, headers=auth_headers)
    assert res.status_code == 200
    assert seen["on_loop"] is False


def test_parse_task_without_ai_configured_returns_503(client, auth_headers, monkeypatch):
    monkeypatch.setattr(ai_service, "_get_ai_client", lambda: None)
    res = client.post("/ai/parse-task", json={"text": "call mom"}, headers=auth_headers)
    assert res.status_code == 503


def test_parse_task_does_not_leak_internal_errors(client, auth_headers, monkeypatch):
    class BrokenModels:
        def generate_content(self, **kwargs):
            raise RuntimeError("API key AIzaSECRET invalid")

    class BrokenClient:
        models = BrokenModels()

    monkeypatch.setattr(ai_service, "_get_ai_client", lambda: BrokenClient())
    res = client.post("/ai/parse-task", json={"text": "call mom"}, headers=auth_headers)
    assert res.status_code == 502
    assert "AIza" not in res.text


def test_parse_task_rejects_huge_input(client, auth_headers):
    res = client.post("/ai/parse-task", json={"text": "x" * 5000}, headers=auth_headers)
    assert res.status_code == 422


def test_sanitize_parsed_task_drops_invalid_fields():
    out = ai_service._sanitize_parsed_task(
        {"title": "  Write essay ", "estimated_minutes": "lots", "priority": "super", "deadline": "next week"},
        "original",
    )
    assert out == {"title": "Write essay", "estimated_minutes": None, "priority": None, "deadline": None}


def test_sanitize_parsed_task_keeps_valid_fields():
    out = ai_service._sanitize_parsed_task(
        {"title": "Essay", "estimated_minutes": 45, "priority": "high", "deadline": "2026-12-01"},
        "original",
    )
    assert out == {"title": "Essay", "estimated_minutes": 45, "priority": "HIGH", "deadline": "2026-12-01"}


def test_sanitize_parsed_task_falls_back_to_original_text():
    out = ai_service._sanitize_parsed_task({}, "buy milk")
    assert out["title"] == "buy milk"
