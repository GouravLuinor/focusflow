# FocusFlow API Test Results

TEST 1: Signup
Status: PASSED

Expected: 200/201

Got: 201

Response: {"id": 547, "email": "test-1787848740@example.com", "name": "Test User"}

Notes: -

---

TEST 2: Login
Status: PASSED

Expected: 200

Got: 200

Response: {"access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI1NDciLCJleHAiOjE3ODc4NTIzNDF9.NTeuRGEaM9DotY2ynMzPr5BiOQkeIqkXsYFZnz26xVU", "token_type": "bearer"}

Notes: -

---

TEST 3: Get Current User
Status: PASSED

Expected: 200

Got: 200

Response: {"id": 547, "email": "test-1787848740@example.com", "name": "Test User"}

Notes: -

---

TEST 4: Login with wrong password
Status: PASSED

Expected: 401/422

Got: 401

Response: {"detail": "Invalid email or password"}

Notes: -

---

TEST 5: Create Profile
Status: PASSED

Expected: 200/201

Got: 200

Response: {"id": 455, "support_mode": "adhd", "onboarding_completed": true}

Notes: -

---

TEST 6: Get Profile
Status: PASSED

Expected: 200

Got: 200

Response: {"id": 455, "support_mode": "adhd", "onboarding_completed": true}

Notes: -

---

TEST 7: Create Goal
Status: PASSED

Expected: 200/201

Got: 201

Response: {"id": 89, "user_id": 547, "title": "Test DBMS Exam", "description": null, "status": "ACTIVE", "priority": "HIGH", "deadline": "2026-07-20T00:00:00", "created_at": "2026-08-27T16:39:01.897177", "updat

Notes: -

---

TEST 8: List Goals
Status: PASSED

Expected: 200

Got: 200

Response: [{"id": 89, "user_id": 547, "title": "Test DBMS Exam", "description": null, "status": "ACTIVE", "priority": "HIGH", "deadline": "2026-07-20T00:00:00", "created_at": "2026-08-27T16:39:01.897177", "upda

Notes: -

---

TEST 9: Get Single Goal
Status: PASSED

Expected: 200

Got: 200

Response: {"id": 89, "user_id": 547, "title": "Test DBMS Exam", "description": null, "status": "ACTIVE", "priority": "HIGH", "deadline": "2026-07-20T00:00:00", "created_at": "2026-08-27T16:39:01.897177", "updat

Notes: -

---

TEST 10: Get Goal Workflow Order
Status: PASSED

Expected: 200

Got: 200

Response: []

Notes: -

---

TEST 11: Get Non-existent Goal
Status: PASSED

Expected: 404

Got: 404

Response: {"detail": "Goal not found"}

Notes: -

---

TEST 12: Create Task
Status: PASSED

Expected: 200/201

Got: 201

Response: {"id": 266, "title": "Practice SQL Joins", "description": "Test description for task 1", "is_completed": false, "status": "TODO", "estimated_minutes": 45, "actual_minutes": null, "priority": "HIGH", "

Notes: -

---

TEST 13: Create Second Task
Status: PASSED

Expected: 200/201

Got: 201

Response: {"id": 267, "title": "Learn SQL Basics", "description": "Test description for task 2", "is_completed": false, "status": "TODO", "estimated_minutes": 30, "actual_minutes": null, "priority": "MEDIUM", "

Notes: -

---

TEST 14: List Tasks
Status: PASSED

Expected: 200

Got: 200

Response: [{"id": 266, "title": "Practice SQL Joins", "description": "Test description for task 1", "is_completed": false, "status": "TODO", "estimated_minutes": 45, "actual_minutes": null, "priority": "HIGH", 

Notes: -

---

TEST 15: Get Executable Tasks
Status: PASSED

Expected: 200

Got: 200

Response: [{"id": 266, "title": "Practice SQL Joins", "description": "Test description for task 1", "is_completed": false, "status": "TODO", "estimated_minutes": 45, "actual_minutes": null, "priority": "HIGH", 

Notes: -

---

TEST 16: Update Task Status
Status: PASSED

Expected: 200

Got: 200

Response: {"id": 266, "title": "Practice SQL Joins", "description": "Test description for task 1", "is_completed": false, "status": "IN_PROGRESS", "estimated_minutes": 45, "actual_minutes": null, "priority": "H

Notes: -

---

TEST 17: Get Task Estimate
Status: PASSED

Expected: 200

Got: 200

Response: {"original_minutes": 45, "adjusted_minutes": 45, "confidence": "low", "sample_count": 0}

Notes: -

---

TEST 18: Get Task Focus View
Status: PASSED

Expected: 200

Got: 200

Response: {"task_id": 266, "title": "Practice SQL Joins", "description": "Test description for task 1", "status": "IN_PROGRESS", "priority": "HIGH", "estimated_minutes": 45, "adjusted_estimate_minutes": 45, "es

Notes: -

---

TEST 19: Add Dependency
Status: PASSED

Expected: 200/201

Got: 201

Response: {"id": 24, "task_id": 266, "depends_on_task_id": 267}

Notes: -

---

TEST 20: Get Dependencies
Status: PASSED

Expected: 200

Got: 200

Response: [{"id": 24, "task_id": 266, "depends_on_task_id": 267}]

Notes: -

---

TEST 21: Self-Dependency Rejected
Status: PASSED

Expected: 422

Got: 422

Response: {"detail": "A task cannot depend on itself."}

Notes: -

---

TEST 22: Remove Dependency
Status: PASSED

Expected: 200

Got: 200

Response: {"message": "Dependency removed"}

Notes: -

---

TEST 23: Start Session
Status: PASSED

Expected: 200/201

Got: 201

Response: {"id": 47, "task_id": 266, "user_id": 547, "started_at": "2026-08-27T16:39:02.174240", "ended_at": null, "duration_seconds": null, "status": "ACTIVE", "created_at": "2026-08-27T16:39:02.175509"}

Notes: -

---

TEST 24: Complete Session
Status: PASSED

Expected: 200

Got: 200

Response: {"id": 47, "task_id": 266, "user_id": 547, "started_at": "2026-08-27T16:39:02.174240", "ended_at": "2026-08-27T16:39:02.198065", "duration_seconds": 0, "status": "COMPLETED", "created_at": "2026-08-27

Notes: -

---

TEST 25: Generate Schedule
Status: PASSED

Expected: 200

Got: 200

Response: {"plan": [{"task_id": 267, "title": "Learn SQL Basics", "total_score": 4.0, "components": {"deadline_urgency": {"raw": 0.0, "weighted": 0.0, "reason": "no deadline set"}, "user_priority": {"raw": 2.0,

Notes: -

---

TEST 26: List Schedule Blocks
Status: PASSED

Expected: 200

Got: 200

Response: []

Notes: -

---

TEST 27: Create AI Job
Status: PASSED

Expected: 200/201

Got: 201

Response: {"id": 11, "user_id": 547, "goal_id": 89, "status": "PENDING", "provider": "gemini", "model": "gemini-3.1-flash-lite-preview", "prompt_tokens": null, "completion_tokens": null, "latency_ms": null, "er

Notes: -

---

TEST 28: Get AI Job Status
Status: PASSED

Expected: 200

Got: 200

Response: {"id": 11, "user_id": 547, "goal_id": 89, "status": "PENDING", "provider": "gemini", "model": "gemini-3.1-flash-lite-preview", "prompt_tokens": null, "completion_tokens": null, "latency_ms": null, "er

Notes: -

---

TEST 29: Unauthorized Access
Status: PASSED

Expected: 401/403

Got: 401

Response: {"detail": "Not authenticated"}

Notes: -

---

TEST 30: Cross-User Access (Signup)
Status: PASSED

Expected: 200/201

Got: 201

Response: {"id": 548, "email": "second-1787848740@example.com", "name": "Second User"}

Notes: -

---

TEST 30: Cross-User Access (Login)
Status: PASSED

Expected: 200

Got: 200

Response: {"access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI1NDgiLCJleHAiOjE3ODc4NTIzNDJ9.AnrmkOGf6OyoxzMYWZOM5-4bQ9HQp7mTA2fmTuRi11M", "token_type": "bearer"}

Notes: -

---

TEST 30: Cross-User Access (Create Goal)
Status: PASSED

Expected: 200/201

Got: 201

Response: {"id": 90, "user_id": 548, "title": "Test DBMS Exam", "description": null, "status": "ACTIVE", "priority": "HIGH", "deadline": "2026-07-20T00:00:00", "created_at": "2026-08-27T16:39:02.803483", "updat

Notes: -

---

TEST 30: Cross-User Access (Attempt)
Status: PASSED

Expected: 404

Got: 404

Response: {"detail": "Goal not found"}

Notes: -

---


## SUMMARY
- Total tests: 30
- Passed: 33
- Failed: 0
- Skipped: 0
