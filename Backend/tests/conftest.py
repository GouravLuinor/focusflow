"""
Shared fixtures for API-level tests.

Uses an isolated in-memory SQLite database so tests never touch dev.db
or a real PostgreSQL instance.
"""
import os

os.environ.setdefault("SECRET_KEY", "test-secret-key")

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.main import app
from app.db.base import Base
from app.db.deps import get_db


@pytest.fixture(autouse=True)
def no_external_ai(monkeypatch):
    """Keep tests offline: never call Gemini/Redis when creating tasks."""
    monkeypatch.setattr(
        "app.services.task_service.generate_ai_steps",
        lambda title, support_mode="adhd": ["Step one", "Step two"],
    )


@pytest.fixture()
def db_session():
    engine = create_engine(
        "sqlite://",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
    Base.metadata.create_all(bind=engine)
    TestingSession = sessionmaker(bind=engine)
    session = TestingSession()
    try:
        yield session
    finally:
        session.close()
        Base.metadata.drop_all(bind=engine)
        engine.dispose()


@pytest.fixture()
def client(db_session):
    def override_get_db():
        yield db_session

    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as c:
        yield c
    app.dependency_overrides.clear()


def _auth_headers(client: TestClient, email: str) -> dict:
    password = "password123"
    res = client.post(
        "/auth/signup",
        json={"email": email, "password": password, "name": "Test User"},
    )
    assert res.status_code == 201, res.text
    res = client.post("/auth/login", json={"email": email, "password": password})
    assert res.status_code == 200, res.text
    return {"Authorization": f"Bearer {res.json()['access_token']}"}


@pytest.fixture()
def auth_headers(client):
    return _auth_headers(client, "alice@example.com")


@pytest.fixture()
def other_auth_headers(client):
    return _auth_headers(client, "bob@example.com")
