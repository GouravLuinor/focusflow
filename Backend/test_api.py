import requests
import time
import json
import sys

BASE_URL = "http://127.0.0.1:8000"
RESULTS_PATH = "/home/gourav/coding/VScode/Projects/focusflow/test-results.md"

# Clear/overwrite existing file
with open(RESULTS_PATH, "w") as f:
    f.write("# FocusFlow API Test Results\n\n")

passed_count = 0
failed_count = 0
skipped_count = 0

def test(test_num, name, method, url, expected_status, data=None, headers=None):
    global passed_count, failed_count
    print(f"Running TEST {test_num:02d}: {name}...", end="")
    sys.stdout.flush()
    
    try:
        if method == "POST":
            res = requests.post(f"{BASE_URL}{url}", json=data, headers=headers)
        elif method == "GET":
            res = requests.get(f"{BASE_URL}{url}", headers=headers)
        elif method == "PUT":
            res = requests.put(f"{BASE_URL}{url}", json=data, headers=headers)
        elif method == "DELETE":
            res = requests.delete(f"{BASE_URL}{url}", headers=headers)
        else:
            raise ValueError(f"Unknown HTTP method: {method}")
        
        status_ok = False
        if isinstance(expected_status, list):
            status_ok = res.status_code in expected_status
            expected_str = "/".join(map(str, expected_status))
        else:
            status_ok = res.status_code == expected_status
            expected_str = str(expected_status)
            
        status_str = "PASSED" if status_ok else "FAILED"
        if status_ok:
            passed_count += 1
        else:
            failed_count += 1
            
        # Parse output snippet
        try:
            resp_body = res.json()
            resp_str = json.dumps(resp_body)[:200]
        except:
            resp_str = res.text[:200]
            
        with open(RESULTS_PATH, "a") as f:
            f.write(f"TEST {test_num}: {name}\n")
            f.write(f"Status: {status_str}\n\n")
            f.write(f"Expected: {expected_str}\n\n")
            f.write(f"Got: {res.status_code}\n\n")
            f.write(f"Response: {resp_str}\n\n")
            f.write(f"Notes: -\n\n")
            f.write("---\n\n")
            
        print(f" {status_str} (Got {res.status_code}, Expected {expected_str})")
        return status_ok, res
    except Exception as e:
        failed_count += 1
        with open(RESULTS_PATH, "a") as f:
            f.write(f"TEST {test_num}: {name}\n")
            f.write(f"Status: FAILED\n\n")
            f.write(f"Expected: {expected_status}\n\n")
            f.write(f"Got: Error\n\n")
            f.write(f"Response: {str(e)}\n\n")
            f.write(f"Notes: Exception raised during execution\n\n")
            f.write("---\n\n")
        print(f" ERROR: {e}")
        return False, None

def main():
    global skipped_count
    timestamp = int(time.time())
    
    print("--- Starting FocusFlow Backend Test Suite ---")
    
    # TEST 1: Signup
    signup_data = {
        "name": "Test User",
        "email": f"test-{timestamp}@example.com",
        "password": "testpass123"
    }
    ok, res = test(1, "Signup", "POST", "/auth/signup", [200, 201], data=signup_data)
    
    # TEST 2: Login
    login_data = {
        "email": f"test-{timestamp}@example.com",
        "password": "testpass123"
    }
    ok, res = test(2, "Login", "POST", "/auth/login", 200, data=login_data)
    token = res.json()["access_token"] if ok else None
    headers = {"Authorization": f"Bearer {token}"} if token else {}
    
    # TEST 3: Get Current User
    ok, _ = test(3, "Get Current User", "GET", "/auth/me", 200, headers=headers)
    
    # TEST 4: Login with wrong password
    login_wrong_data = {
        "email": f"test-{timestamp}@example.com",
        "password": "wrong"
    }
    test(4, "Login with wrong password", "POST", "/auth/login", [401, 422], data=login_wrong_data)
    
    # TEST 5: Create Profile
    profile_data = {"support_mode": "adhd"}
    test(5, "Create Profile", "POST", "/profile", [200, 201], data=profile_data, headers=headers)
    
    # TEST 6: Get Profile
    test(6, "Get Profile", "GET", "/profile/me", 200, headers=headers)
    
    # TEST 7: Create Goal
    goal_data = {
        "title": "Test DBMS Exam",
        "priority": "HIGH",
        "deadline": "2026-07-20T00:00:00Z"
    }
    ok, res = test(7, "Create Goal", "POST", "/goals/", [200, 201], data=goal_data, headers=headers)
    goal_id = res.json()["id"] if ok else 9999
    
    # TEST 8: List Goals
    test(8, "List Goals", "GET", "/goals/", 200, headers=headers)
    
    # TEST 9: Get Single Goal
    test(9, "Get Single Goal", "GET", f"/goals/{goal_id}", 200, headers=headers)
    
    # TEST 10: Get Goal Workflow Order
    test(10, "Get Goal Workflow Order", "GET", f"/goals/{goal_id}/workflow-order", 200, headers=headers)
    
    # TEST 11: Get Non-existent Goal
    test(11, "Get Non-existent Goal", "GET", "/goals/99999", 404, headers=headers)
    
    # TEST 12: Create Task
    task_data = {
        "title": "Practice SQL Joins",
        "description": "Test description for task 1",
        "estimated_minutes": 45,
        "priority": "HIGH",
        "goal_id": goal_id
    }
    ok, res = test(12, "Create Task", "POST", "/tasks/", [200, 201], data=task_data, headers=headers)
    task_id = res.json()["id"] if ok else 9999
    
    # TEST 13: Create Second Task
    task2_data = {
        "title": "Learn SQL Basics",
        "description": "Test description for task 2",
        "estimated_minutes": 30,
        "priority": "MEDIUM",
        "goal_id": goal_id
    }
    ok, res = test(13, "Create Second Task", "POST", "/tasks/", [200, 201], data=task2_data, headers=headers)
    task2_id = res.json()["id"] if ok else 9999
    
    # TEST 14: List Tasks
    test(14, "List Tasks", "GET", "/tasks/", 200, headers=headers)
    
    # TEST 15: Get Executable Tasks
    test(15, "Get Executable Tasks", "GET", "/tasks/executable", 200, headers=headers)
    
    # TEST 16: Update Task Status
    update_data = {"status": "IN_PROGRESS"}
    test(16, "Update Task Status", "PUT", f"/tasks/{task_id}", 200, data=update_data, headers=headers)
    
    # TEST 17: Get Task Estimate
    test(17, "Get Task Estimate", "GET", f"/tasks/{task_id}/estimate", 200, headers=headers)
    
    # TEST 18: Get Task Focus View
    test(18, "Get Task Focus View", "GET", f"/tasks/{task_id}/focus", 200, headers=headers)
    
    # TEST 19: Add Dependency
    dep_data = {"depends_on_task_id": task2_id}
    test(19, "Add Dependency", "POST", f"/tasks/{task_id}/dependencies", [200, 201], data=dep_data, headers=headers)
    
    # TEST 20: Get Dependencies
    test(20, "Get Dependencies", "GET", f"/tasks/{task_id}/dependencies", 200, headers=headers)
    
    # TEST 21: Self-Dependency Rejected
    self_dep_data = {"depends_on_task_id": task_id}
    test(21, "Self-Dependency Rejected", "POST", f"/tasks/{task_id}/dependencies", 422, data=self_dep_data, headers=headers)
    
    # TEST 22: Remove Dependency
    test(22, "Remove Dependency", "DELETE", f"/tasks/{task_id}/dependencies/{task2_id}", 200, headers=headers)
    
    # TEST 23: Start Session
    session_data = {"task_id": task_id}
    ok, res = test(23, "Start Session", "POST", "/sessions", [200, 201], data=session_data, headers=headers)
    session_id = res.json()["id"] if ok else 9999
    
    # TEST 24: Complete Session
    test(24, "Complete Session", "POST", f"/sessions/{session_id}/complete", 200, headers=headers)
    
    # TEST 25: Generate Schedule
    sched_data = {"available_minutes": 90, "save_plan": True}
    test(25, "Generate Schedule", "POST", "/schedule/generate", 200, data=sched_data, headers=headers)
    
    # TEST 26: List Schedule Blocks
    test(26, "List Schedule Blocks", "GET", "/schedule/blocks", 200, headers=headers)
    
    # TEST 27: Create AI Job
    ai_job_data = {"goal_id": goal_id}
    ok, res = test(27, "Create AI Job", "POST", "/ai-jobs/", [200, 201], data=ai_job_data, headers=headers)
    job_id = res.json()["id"] if ok else 9999
    
    # TEST 28: Get AI Job Status
    test(28, "Get AI Job Status", "GET", f"/ai-jobs/{job_id}", 200, headers=headers)
    
    # TEST 29: Unauthorized Access
    test(29, "Unauthorized Access", "GET", "/goals/", [401, 403])
    
    # TEST 30: Cross-User Access
    # Setup second user
    second_signup = {
        "name": "Second User",
        "email": f"second-{timestamp}@example.com",
        "password": "testpass123"
    }
    s_ok, s_res = test(30, "Cross-User Access (Signup)", "POST", "/auth/signup", [200, 201], data=second_signup)
    
    second_login = {
        "email": f"second-{timestamp}@example.com",
        "password": "testpass123"
    }
    s_ok, s_res = test(30, "Cross-User Access (Login)", "POST", "/auth/login", 200, data=second_login)
    
    second_token = s_res.json()["access_token"] if s_ok else None
    second_headers = {"Authorization": f"Bearer {second_token}"} if second_token else {}
    
    # Create goal for second user
    s_ok, s_res = test(30, "Cross-User Access (Create Goal)", "POST", "/goals/", [200, 201], data=goal_data, headers=second_headers)
    second_goal_id = s_res.json()["id"] if s_ok else 9999
    
    # Try to access second user's goal with first user's token
    ok, _ = test(30, "Cross-User Access (Attempt)", "GET", f"/goals/{second_goal_id}", 404, headers=headers)
    
    # Append summary to file
    with open(RESULTS_PATH, "a") as f:
        f.write("\n## SUMMARY\n")
        f.write(f"- Total tests: 30\n")
        f.write(f"- Passed: {passed_count}\n")
        f.write(f"- Failed: {failed_count}\n")
        f.write(f"- Skipped: {skipped_count}\n")
        
    print("\n--- Summary ---")
    print(f"Total: 30")
    print(f"Passed: {passed_count}")
    print(f"Failed: {failed_count}")
    print(f"Skipped: {skipped_count}")

if __name__ == "__main__":
    main()
