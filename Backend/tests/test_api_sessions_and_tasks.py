"""
API-level regression tests for execution sessions and task ownership.
"""
from datetime import datetime, timedelta

from app.models.execution_session import ExecutionSession


def _create_task(client, headers, **extra):
    res = client.post("/tasks/", json={"title": "Write report", **extra}, headers=headers)
    assert res.status_code == 201, res.text
    return res.json()


def _start(client, headers, task_id):
    res = client.post("/sessions", json={"task_id": task_id}, headers=headers)
    assert res.status_code == 201, res.text
    return res.json()


def _shift_session(db, session_id, **deltas):
    """Move session timestamps into the past to simulate elapsed time."""
    s = db.get(ExecutionSession, session_id)
    for field, seconds in deltas.items():
        setattr(s, field, getattr(s, field) - timedelta(seconds=seconds))
    db.commit()


# ------------------------------------------------------------------
# Session timing
# ------------------------------------------------------------------

def test_paused_time_is_not_counted_as_work(client, auth_headers, db_session):
    task = _create_task(client, auth_headers)
    session = _start(client, auth_headers, task["id"])

    # Work for 100s, then pause.
    _shift_session(db_session, session["id"], started_at=100)
    res = client.post(f"/sessions/{session['id']}/pause", headers=auth_headers)
    assert res.status_code == 200
    assert 99 <= res.json()["duration_seconds"] <= 102

    # Stay paused for 600s, then resume and complete immediately.
    _shift_session(db_session, session["id"], ended_at=600, started_at=600)
    res = client.post(f"/sessions/{session['id']}/resume", headers=auth_headers)
    assert res.status_code == 200
    res = client.post(f"/sessions/{session['id']}/complete", headers=auth_headers)
    assert res.status_code == 200, res.text

    duration = res.json()["duration_seconds"]
    assert 99 <= duration <= 105, f"paused time leaked into duration: {duration}s"


def test_focus_view_reports_paused_session_elapsed(client, auth_headers, db_session):
    task = _create_task(client, auth_headers)
    session = _start(client, auth_headers, task["id"])
    _shift_session(db_session, session["id"], started_at=50)
    client.post(f"/sessions/{session['id']}/pause", headers=auth_headers)

    focus = client.get(f"/tasks/{task['id']}/focus", headers=auth_headers).json()
    assert focus["active_session"]["status"] == "PAUSED"
    assert 49 <= focus["active_session"]["elapsed_seconds"] <= 52


def test_can_complete_a_paused_session(client, auth_headers):
    task = _create_task(client, auth_headers)
    session = _start(client, auth_headers, task["id"])
    client.post(f"/sessions/{session['id']}/pause", headers=auth_headers)

    res = client.post(f"/sessions/{session['id']}/complete", headers=auth_headers)
    assert res.status_code == 200, res.text
    assert res.json()["status"] == "COMPLETED"

    tasks = client.get("/tasks/", headers=auth_headers).json()
    assert tasks[0]["status"] == "COMPLETED"


def test_complete_session_when_task_already_completed(client, auth_headers):
    task = _create_task(client, auth_headers)
    session = _start(client, auth_headers, task["id"])
    # User ticks the task off from the dashboard while the timer is open.
    res = client.put(f"/tasks/{task['id']}", json={"is_completed": True}, headers=auth_headers)
    assert res.status_code == 200

    res = client.post(f"/sessions/{session['id']}/complete", headers=auth_headers)
    assert res.status_code == 200, res.text
    assert res.json()["status"] == "COMPLETED"


def test_cannot_resume_a_completed_session(client, auth_headers):
    task = _create_task(client, auth_headers)
    session = _start(client, auth_headers, task["id"])
    client.post(f"/sessions/{session['id']}/complete", headers=auth_headers)

    res = client.post(f"/sessions/{session['id']}/resume", headers=auth_headers)
    assert res.status_code == 422


def test_cannot_pause_a_paused_session(client, auth_headers):
    task = _create_task(client, auth_headers)
    session = _start(client, auth_headers, task["id"])
    client.post(f"/sessions/{session['id']}/pause", headers=auth_headers)

    res = client.post(f"/sessions/{session['id']}/pause", headers=auth_headers)
    assert res.status_code == 422


def test_cannot_start_second_session_while_one_is_paused(client, auth_headers):
    task = _create_task(client, auth_headers)
    session = _start(client, auth_headers, task["id"])
    client.post(f"/sessions/{session['id']}/pause", headers=auth_headers)

    res = client.post("/sessions", json={"task_id": task["id"]}, headers=auth_headers)
    assert res.status_code == 409


# ------------------------------------------------------------------
# Ownership
# ------------------------------------------------------------------

def test_cannot_attach_task_to_another_users_goal(client, auth_headers, other_auth_headers):
    goal = client.post("/goals/", json={"title": "Bob's goal"}, headers=other_auth_headers).json()
    task = _create_task(client, auth_headers)

    res = client.put(f"/tasks/{task['id']}", json={"goal_id": goal["id"]}, headers=auth_headers)
    assert res.status_code == 404

    # And Bob's goal must not have gained Alice's task.
    bob_goal = client.get(f"/goals/{goal['id']}", headers=other_auth_headers).json()
    assert bob_goal["tasks"] == []


def test_can_attach_task_to_own_goal(client, auth_headers):
    goal = client.post("/goals/", json={"title": "My goal"}, headers=auth_headers).json()
    task = _create_task(client, auth_headers)

    res = client.put(f"/tasks/{task['id']}", json={"goal_id": goal["id"]}, headers=auth_headers)
    assert res.status_code == 200
    assert res.json()["goal_id"] == goal["id"]


def test_cannot_set_parent_task_owned_by_another_user(client, auth_headers, other_auth_headers):
    bobs_task = _create_task(client, other_auth_headers)
    task = _create_task(client, auth_headers)

    res = client.put(
        f"/tasks/{task['id']}", json={"parent_task_id": bobs_task["id"]}, headers=auth_headers
    )
    assert res.status_code == 404


def test_wrong_password_returns_401(client, auth_headers):
    res = client.post("/auth/login", json={"email": "alice@example.com", "password": "nope"})
    assert res.status_code == 401
    assert res.json()["detail"] == "Invalid email or password"
