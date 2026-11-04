"""
POST /tasks/{task_id}/steps/generate — AI micro-steps for an existing task
(e.g. tasks created by goal decomposition, which have no steps).
"""
from app.models.step import Step
from app.models.task import Task


def _me(client, headers) -> int:
    return client.get("/auth/me", headers=headers).json()["id"]


def _stepless_task(db, user_id: int, title: str = "Design site layout") -> Task:
    """Insert a task directly, the way the decomposition worker does (no steps)."""
    task = Task(title=title, user_id=user_id, is_completed=False)
    db.add(task)
    db.commit()
    db.refresh(task)
    return task


def test_generates_and_persists_ordered_steps(client, auth_headers, db_session):
    task = _stepless_task(db_session, _me(client, auth_headers))

    res = client.post(f"/tasks/{task.id}/steps/generate", headers=auth_headers)

    assert res.status_code == 201, res.text
    body = res.json()
    assert [s["content"] for s in body] == ["Step one", "Step two"]
    assert [s["order"] for s in body] == [1, 2]
    assert all(s["is_completed"] is False for s in body)

    listed = client.get(f"/tasks/{task.id}/steps", headers=auth_headers).json()
    assert [s["id"] for s in listed] == [s["id"] for s in body]


def test_uses_the_users_support_mode(client, auth_headers, db_session, monkeypatch):
    client.post("/profile", json={"support_mode": "autism"}, headers=auth_headers)
    task = _stepless_task(db_session, _me(client, auth_headers), title="Plan the week")
    seen = {}

    def fake_generate(title, support_mode="adhd"):
        seen.update(title=title, support_mode=support_mode)
        return ["Only step"]

    monkeypatch.setattr("app.services.task_service.generate_ai_steps", fake_generate)
    res = client.post(f"/tasks/{task.id}/steps/generate", headers=auth_headers)

    assert res.status_code == 201, res.text
    assert seen == {"title": "Plan the week", "support_mode": "autism"}


def test_refuses_when_task_already_has_steps(client, auth_headers, db_session):
    task = _stepless_task(db_session, _me(client, auth_headers))
    db_session.add(Step(task_id=task.id, content="Existing", order=1, is_completed=False))
    db_session.commit()

    res = client.post(f"/tasks/{task.id}/steps/generate", headers=auth_headers)

    assert res.status_code == 409
    assert db_session.query(Step).filter(Step.task_id == task.id).count() == 1


def test_cannot_generate_steps_for_another_users_task(client, auth_headers, other_auth_headers, db_session):
    task = _stepless_task(db_session, _me(client, auth_headers))

    res = client.post(f"/tasks/{task.id}/steps/generate", headers=other_auth_headers)

    assert res.status_code == 404
    assert db_session.query(Step).filter(Step.task_id == task.id).count() == 0


def test_missing_task_returns_404(client, auth_headers):
    res = client.post("/tasks/999999/steps/generate", headers=auth_headers)
    assert res.status_code == 404


def test_requires_authentication(client, auth_headers, db_session):
    task = _stepless_task(db_session, _me(client, auth_headers))
    res = client.post(f"/tasks/{task.id}/steps/generate")
    assert res.status_code == 401
