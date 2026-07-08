"""
Unit tests for the priority scoring engine.
Tests each scoring factor independently and combined ranking/selection.
"""
import pytest
from datetime import datetime, timezone, timedelta
from app.engine.priority import (
    calculate_deadline_urgency,
    calculate_user_priority,
    calculate_dependency_unlock,
    calculate_overdue_penalty,
    calculate_postponement_penalty,
    calculate_effort_fit,
    score_task,
    rank_tasks,
    select_plan,
    DEFAULT_WEIGHTS,
    PRIORITY_VALUES,
)


# ============================================================
# calculate_deadline_urgency tests
# ============================================================

class TestDeadlineUrgency:
    def test_no_deadline(self):
        """No deadline returns neutral score."""
        score, reason = calculate_deadline_urgency(None)
        assert score == 0.0
        assert "no deadline" in reason
    
    def test_overdue_by_days(self):
        """Overdue task gets high urgency score."""
        now = datetime(2026, 7, 15, 12, 0, 0, tzinfo=timezone.utc)
        deadline = datetime(2026, 7, 10, 12, 0, 0, tzinfo=timezone.utc)  # 5 days ago
        score, reason = calculate_deadline_urgency(deadline, now)
        assert score > 5.0  # Should be high
        assert "overdue" in reason
    
    def test_due_within_hours(self):
        """Task due within hours gets high score."""
        now = datetime(2026, 7, 15, 12, 0, 0, tzinfo=timezone.utc)
        deadline = datetime(2026, 7, 15, 20, 0, 0, tzinfo=timezone.utc)  # 8 hours
        score, reason = calculate_deadline_urgency(deadline, now)
        assert score == 4.0
        assert "hours" in reason
    
    def test_due_within_3_days(self):
        """Task due within 3 days gets moderate score."""
        now = datetime(2026, 7, 15, 12, 0, 0, tzinfo=timezone.utc)
        deadline = datetime(2026, 7, 17, 12, 0, 0, tzinfo=timezone.utc)  # 2 days
        score, reason = calculate_deadline_urgency(deadline, now)
        assert score == 3.0
        assert "days" in reason
    
    def test_due_within_7_days(self):
        """Task due within 7 days gets low score."""
        now = datetime(2026, 7, 15, 12, 0, 0, tzinfo=timezone.utc)
        deadline = datetime(2026, 7, 20, 12, 0, 0, tzinfo=timezone.utc)  # 5 days
        score, reason = calculate_deadline_urgency(deadline, now)
        assert score == 2.0
    
    def test_due_far_future(self):
        """Task due far in future gets minimal score."""
        now = datetime(2026, 7, 15, 12, 0, 0, tzinfo=timezone.utc)
        deadline = datetime(2026, 8, 15, 12, 0, 0, tzinfo=timezone.utc)  # 31 days
        score, reason = calculate_deadline_urgency(deadline, now)
        assert score == 1.0
    
    def test_overdue_score_capped(self):
        """Overdue score should be capped at 10.0."""
        now = datetime(2026, 7, 15, 12, 0, 0, tzinfo=timezone.utc)
        deadline = datetime(2025, 7, 15, 12, 0, 0, tzinfo=timezone.utc)  # 1 year ago
        score, reason = calculate_deadline_urgency(deadline, now)
        assert score <= 10.0


# ============================================================
# calculate_user_priority tests
# ============================================================

class TestUserPriority:
    def test_urgent(self):
        score, reason = calculate_user_priority("URGENT")
        assert score == 4.0
        assert "urgent" in reason
    
    def test_high(self):
        score, reason = calculate_user_priority("HIGH")
        assert score == 3.0
    
    def test_medium(self):
        score, reason = calculate_user_priority("MEDIUM")
        assert score == 2.0
    
    def test_low(self):
        score, reason = calculate_user_priority("LOW")
        assert score == 1.0
    
    def test_case_insensitive(self):
        """Priority lookup is case-insensitive."""
        score, _ = calculate_user_priority("high")
        assert score == 3.0
    
    def test_unknown_defaults_to_medium(self):
        """Unknown priority values default to MEDIUM (2.0)."""
        score, _ = calculate_user_priority("UNKNOWN")
        assert score == 2.0


# ============================================================
# calculate_dependency_unlock tests
# ============================================================

class TestDependencyUnlock:
    def test_unlocks_nothing(self):
        """Task that no other tasks depend on."""
        score, reason = calculate_dependency_unlock(1, [(2, 3), (3, 4)])
        assert score == 0.0
        assert "unlocks no tasks" in reason
    
    def test_unlocks_one_task(self):
        """Task unlocks exactly one downstream task."""
        score, reason = calculate_dependency_unlock(1, [(2, 1)])
        assert score == 1.5
        assert "unlocks 1 task" in reason
    
    def test_unlocks_multiple_tasks(self):
        """Task unlocks several downstream tasks."""
        deps = [(2, 1), (3, 1), (4, 1)]
        score, reason = calculate_dependency_unlock(1, deps)
        assert score == 3.0
        assert "unlocks 3 tasks" in reason
    
    def test_unlocks_many_tasks(self):
        """Task unlocks many downstream tasks — higher score."""
        deps = [(2, 1), (3, 1), (4, 1), (5, 1)]
        score, reason = calculate_dependency_unlock(1, deps)
        assert score == 5.0
        assert "unlocks 4 tasks" in reason
    
    def test_empty_dependencies(self):
        """Empty dependency list returns zero."""
        score, reason = calculate_dependency_unlock(1, [])
        assert score == 0.0


# ============================================================
# calculate_overdue_penalty tests
# ============================================================

class TestOverduePenalty:
    def test_no_deadline(self):
        """No deadline means no overdue penalty."""
        score, reason = calculate_overdue_penalty(None)
        assert score == 0.0
        assert reason == ""
    
    def test_not_overdue(self):
        """Future deadline means no penalty."""
        now = datetime(2026, 7, 15, 12, 0, 0, tzinfo=timezone.utc)
        deadline = datetime(2026, 7, 20, 12, 0, 0, tzinfo=timezone.utc)
        score, reason = calculate_overdue_penalty(deadline, now)
        assert score == 0.0
    
    def test_overdue(self):
        """Past deadline incurs penalty."""
        now = datetime(2026, 7, 15, 12, 0, 0, tzinfo=timezone.utc)
        deadline = datetime(2026, 7, 10, 12, 0, 0, tzinfo=timezone.utc)  # 5 days
        score, reason = calculate_overdue_penalty(deadline, now)
        assert score > 0
        assert "overdue" in reason
    
    def test_overdue_penalty_capped(self):
        """Very overdue penalty capped at 10.0."""
        now = datetime(2026, 7, 15, 12, 0, 0, tzinfo=timezone.utc)
        deadline = datetime(2025, 7, 15, 12, 0, 0, tzinfo=timezone.utc)
        score, _ = calculate_overdue_penalty(deadline, now)
        assert score <= 10.0


# ============================================================
# calculate_postponement_penalty tests
# ============================================================

class TestPostponementPenalty:
    def test_no_postponements(self):
        """No postponements means no penalty."""
        score, reason = calculate_postponement_penalty(0)
        assert score == 0.0
        assert reason == ""
    
    def test_one_postponement(self):
        score, reason = calculate_postponement_penalty(1)
        assert score == 1.0
        assert "once" in reason
    
    def test_few_postponements(self):
        score, reason = calculate_postponement_penalty(2)
        assert score == 2.0
        assert "2 times" in reason
    
    def test_many_postponements(self):
        """Repeatedly postponed tasks get higher penalty."""
        score, reason = calculate_postponement_penalty(5)
        assert score == 4.0
        assert "5 times" in reason


# ============================================================
# calculate_effort_fit tests
# ============================================================

class TestEffortFit:
    def test_fits_available_time(self):
        """Task fits comfortably — no penalty."""
        score, reason = calculate_effort_fit(30, 60)
        assert score == 0.0
        assert "fits" in reason
    
    def test_exact_fit(self):
        """Task exactly fills available time — no penalty."""
        score, reason = calculate_effort_fit(60, 60)
        assert score == 0.0
    
    def test_exceeds_time(self):
        """Task exceeds available time — penalty applied."""
        score, reason = calculate_effort_fit(90, 60)
        assert score < 0  # Negative = penalty
        assert "exceeds" in reason
    
    def test_penalty_proportional(self):
        """Larger overflow = larger penalty."""
        score_small, _ = calculate_effort_fit(75, 60)   # 15 min over
        score_large, _ = calculate_effort_fit(120, 60)  # 60 min over
        assert score_large < score_small  # More overflow = more negative
    
    def test_no_estimate(self):
        """No duration estimate means neutral score."""
        score, reason = calculate_effort_fit(None, 60)
        assert score == 0.0
        assert "no duration" in reason.lower()
    
    def test_penalty_capped(self):
        """Effort mismatch penalty capped at -5.0."""
        score, _ = calculate_effort_fit(500, 60)  # 440 min over
        assert score >= -5.0


# ============================================================
# score_task integration tests
# ============================================================

class TestScoreTask:
    def setup_method(self):
        self.now = datetime(2026, 7, 15, 12, 0, 0, tzinfo=timezone.utc)
    
    def make_task(self, **overrides):
        task = {
            "id": 1,
            "title": "Test task",
            "priority": "MEDIUM",
            "deadline": None,
            "estimated_minutes": 30,
            "postponement_count": 0,
        }
        task.update(overrides)
        return task
    
    def test_returns_all_components(self):
        """Score result includes all six components."""
        result = score_task(self.make_task(), available_minutes=120, now=self.now)
        assert "deadline_urgency" in result["components"]
        assert "user_priority" in result["components"]
        assert "dependency_unlock" in result["components"]
        assert "overdue_penalty" in result["components"]
        assert "postponement_penalty" in result["components"]
        assert "effort_fit" in result["components"]
    
    def test_returns_task_id_and_title(self):
        result = score_task(self.make_task(), available_minutes=120, now=self.now)
        assert result["task_id"] == 1
        assert result["title"] == "Test task"
    
    def test_returns_reasons(self):
        """Reasons list contains non-empty strings for each active component."""
        result = score_task(
            self.make_task(
                priority="URGENT",
                deadline=self.now - timedelta(days=1),
                postponement_count=2,
            ),
            available_minutes=120,
            all_dependencies=[(2, 1), (3, 1)],
            now=self.now,
        )
        assert len(result["reasons"]) > 0
        assert all(isinstance(r, str) and len(r) > 0 for r in result["reasons"])
    
    def test_total_score_is_sum_of_weighted_components(self):
        """Total score equals sum of all weighted component scores."""
        result = score_task(
            self.make_task(priority="HIGH"),
            available_minutes=120,
            now=self.now,
        )
        component_sum = sum(
            c["weighted"] for c in result["components"].values()
        )
        assert abs(result["total_score"] - component_sum) < 0.01
    
    def test_high_priority_overdue_scores_higher_than_low_priority(self):
        """Urgent overdue task outscores low priority far-future task."""
        high_task = self.make_task(
            id=1,
            priority="URGENT",
            deadline=self.now - timedelta(days=1),
            postponement_count=3,
        )
        low_task = self.make_task(
            id=2,
            priority="LOW",
            deadline=self.now + timedelta(days=30),
            postponement_count=0,
        )
        high_result = score_task(high_task, available_minutes=120, now=self.now)
        low_result = score_task(low_task, available_minutes=120, now=self.now)
        assert high_result["total_score"] > low_result["total_score"]


# ============================================================
# rank_tasks tests
# ============================================================

class TestRankTasks:
    def setup_method(self):
        self.now = datetime(2026, 7, 15, 12, 0, 0, tzinfo=timezone.utc)
    
    def test_sorted_descending(self):
        """Tasks are sorted by score, highest first."""
        tasks = [
            {"id": 1, "title": "Low", "priority": "LOW", "deadline": None, "estimated_minutes": 30, "postponement_count": 0},
            {"id": 2, "title": "Urgent", "priority": "URGENT", "deadline": self.now - timedelta(days=1), "estimated_minutes": 30, "postponement_count": 3},
            {"id": 3, "title": "Medium", "priority": "MEDIUM", "deadline": None, "estimated_minutes": 30, "postponement_count": 0},
        ]
        ranked = rank_tasks(tasks, available_minutes=120, now=self.now)
        scores = [t["total_score"] for t in ranked]
        assert scores == sorted(scores, reverse=True)
    
    def test_empty_list(self):
        """Empty task list returns empty list."""
        result = rank_tasks([], now=self.now)
        assert result == []
    
    def test_single_task(self):
        """Single task returns single result."""
        tasks = [
            {"id": 1, "title": "Only", "priority": "MEDIUM", "deadline": None, "estimated_minutes": 30, "postponement_count": 0},
        ]
        result = rank_tasks(tasks, now=self.now)
        assert len(result) == 1
        assert result[0]["task_id"] == 1


# ============================================================
# select_plan tests
# ============================================================

class TestSelectPlan:
    def setup_method(self):
        self.now = datetime(2026, 7, 15, 12, 0, 0, tzinfo=timezone.utc)
    
    def test_all_tasks_fit(self):
        """When all tasks fit within time, all are in plan."""
        tasks = [
            {"id": 1, "title": "Task 1", "priority": "HIGH", "deadline": None, "estimated_minutes": 20, "postponement_count": 0},
            {"id": 2, "title": "Task 2", "priority": "MEDIUM", "deadline": None, "estimated_minutes": 30, "postponement_count": 0},
        ]
        result = select_plan(tasks, available_minutes=120, now=self.now)
        assert len(result["plan"]) == 2
        assert result["overflow_tasks"] == 0
        assert result["total_estimated_minutes"] == 50
    
    def test_some_tasks_overflow(self):
        """Tasks that don't fit are excluded from the plan."""
        tasks = [
            {"id": 1, "title": "Fits", "priority": "HIGH", "deadline": None, "estimated_minutes": 30, "postponement_count": 0},
            {"id": 2, "title": "Overflows", "priority": "LOW", "deadline": None, "estimated_minutes": 60, "postponement_count": 0},
        ]
        result = select_plan(tasks, available_minutes=45, now=self.now)
        assert len(result["plan"]) == 1  # Only the fitting task is included
        assert result["overflow_tasks"] == 1
        assert result["plan"][0]["task_id"] == 1
    
    def test_no_tasks_fit(self):
        """When no single task fits, plan contains no tasks."""
        tasks = [
            {"id": 1, "title": "Big task", "priority": "URGENT", "deadline": None, "estimated_minutes": 120, "postponement_count": 0},
        ]
        result = select_plan(tasks, available_minutes=30, now=self.now)
        assert len(result["plan"]) == 0
        assert result["overflow_tasks"] == 1
    
    def test_empty_tasks(self):
        """Empty task list returns empty plan."""
        result = select_plan([], now=self.now)
        assert result["plan"] == []
        assert result["total_estimated_minutes"] == 0
    
    def test_dependency_unlock_increases_priority(self):
        """Task that unlocks other tasks gets higher score within plan."""
        tasks = [
            {"id": 1, "title": "Unlocks tasks", "priority": "MEDIUM", "deadline": None, "estimated_minutes": 20, "postponement_count": 0},
            {"id": 2, "title": "No unlocks", "priority": "MEDIUM", "deadline": None, "estimated_minutes": 20, "postponement_count": 0},
        ]
        deps = [(3, 1), (4, 1)]  # Task 1 unlocks 2 tasks
        plan = select_plan(tasks, available_minutes=120, all_dependencies=deps, now=self.now)
        scores = {t["task_id"]: t["total_score"] for t in plan["plan"]}
        assert scores[1] > scores[2]  # Task 1 scores higher despite same priority
