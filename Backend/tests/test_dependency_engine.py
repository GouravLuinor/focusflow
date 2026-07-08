"""
Unit tests for the dependency graph engine.
Tests all algorithms independently of database and API.
"""
import pytest
from app.engine.dependency import (
    has_cycle,
    dfs_reachable,
    build_adjacency_list,
    get_executable_tasks,
    get_blocking_tasks,
    topological_sort,
)


# ============================================================
# build_adjacency_list tests
# ============================================================

class TestBuildAdjacencyList:
    def test_empty_dependencies(self):
        """Empty dependency list returns empty graph."""
        graph = build_adjacency_list([])
        assert graph == {}
    
    def test_single_edge(self):
        """Single edge: (task_id, depends_on_id) → depends_on_id → task_id."""
        # Task 2 depends on Task 1: edge (2, 1) means 1 → 2
        graph = build_adjacency_list([(2, 1)])
        assert graph == {1: [2]}
    
    def test_multiple_edges(self):
        """Multiple edges build correct adjacency list."""
        # 2→3, 1→2, 1→3
        edges = [(2, 1), (3, 1), (3, 2)]
        graph = build_adjacency_list(edges)
        assert 1 in graph
        assert 2 in graph
        assert set(graph[1]) == {2, 3}  # Task 1 unlocks both
        assert graph[2] == [3]          # Task 2 unlocks 3


# ============================================================
# dfs_reachable tests
# ============================================================

class TestDFSReachable:
    def test_direct_neighbor(self):
        """Node can reach its direct neighbor."""
        graph = {1: [2]}
        assert dfs_reachable(graph, 1, 2, set()) is True
    
    def test_transitive_path(self):
        """Node can reach through multiple hops."""
        graph = {1: [2], 2: [3], 3: [4]}
        assert dfs_reachable(graph, 1, 4, set()) is True
    
    def test_no_path(self):
        """Node cannot reach disconnected node."""
        graph = {1: [2], 3: [4]}
        assert dfs_reachable(graph, 1, 4, set()) is False
    
    def test_self_reachable_due_to_reflexivity(self):
        """Node is reachable from itself in 0 steps (reflexive reachability)."""
        graph = {1: [2], 2: [3]}
        # dfs_reachable immediately returns True when current == target
        assert dfs_reachable(graph, 1, 1, set()) is True
    
    def test_visited_nodes_not_revisited(self):
        """DFS terminates on visited nodes."""
        graph = {1: [2, 3], 2: [4], 3: [4]}
        assert dfs_reachable(graph, 1, 4, set()) is True


# ============================================================
# has_cycle tests
# ============================================================

class TestHasCycle:
    def test_simple_cycle(self):
        """Adding an edge that creates A→B→A detects cycle."""
        # Existing: A→B (edge (B, A): B depends on A)
        graph = build_adjacency_list([(2, 1)])
        # Try to add B→A (edge (1, 2): A depends on B)
        assert has_cycle(graph, (1, 2)) is True
    
    def test_transitive_cycle(self):
        """A→B→C→A creates cycle."""
        # Existing: 1→2, 2→3
        graph = build_adjacency_list([(2, 1), (3, 2)])
        # Try to add 3→1
        assert has_cycle(graph, (1, 3)) is True
    
    def test_no_cycle_linear(self):
        """A→B→C, adding C→D does not create cycle."""
        graph = build_adjacency_list([(2, 1), (3, 2)])
        # Try to add 3→4 (D depends on C)
        assert has_cycle(graph, (4, 3)) is False
    
    def test_no_cycle_diamond(self):
        """A→B, A→C, B→D, C→D — no cycle."""
        edges = [(2, 1), (3, 1), (4, 2), (4, 3)]
        graph = build_adjacency_list(edges)
        # Try to add D→E
        assert has_cycle(graph, (5, 4)) is False
    
    def test_self_loop_always_cycle(self):
        """A→A is always a cycle."""
        graph = {}
        assert has_cycle(graph, (1, 1)) is True
    
    def test_empty_graph_no_cycle(self):
        """Adding first edge to empty graph never creates cycle."""
        graph = {}
        assert has_cycle(graph, (2, 1)) is False


# ============================================================
# get_executable_tasks tests
# ============================================================

class TestGetExecutableTasks:
    def test_no_dependencies_all_executable(self):
        """Tasks with no dependencies are all executable."""
        executable = get_executable_tasks([1, 2, 3], set(), [])
        assert set(executable) == {1, 2, 3}
    
    def test_dependency_met(self):
        """Task with completed dependency is executable."""
        # Task 2 depends on Task 1; Task 1 is completed
        executable = get_executable_tasks([1, 2], {1}, [(2, 1)])
        assert 1 in executable  # No deps, always executable
        assert 2 in executable  # Dep met
    
    def test_dependency_not_met(self):
        """Task with uncompleted dependency is NOT executable."""
        # Task 2 depends on Task 1; Task 1 is NOT completed
        executable = get_executable_tasks([1, 2], set(), [(2, 1)])
        assert 1 in executable      # No deps
        assert 2 not in executable  # Blocked
    
    def test_multiple_dependencies_all_met(self):
        """Task with multiple dependencies, all met → executable."""
        # Task 3 depends on 1 and 2; both completed
        executable = get_executable_tasks([1, 2, 3], {1, 2}, [(3, 1), (3, 2)])
        assert 3 in executable
    
    def test_multiple_dependencies_partially_met(self):
        """Task with multiple dependencies, only some met → NOT executable."""
        # Task 3 depends on 1 and 2; only 1 completed
        executable = get_executable_tasks([1, 2, 3], {1}, [(3, 1), (3, 2)])
        assert 3 not in executable
    
    def test_completed_tasks_are_computed_normally(self):
        """Already completed tasks are computed normally by the engine; caller filters them from input."""
        # The engine lists any task whose dependencies are met. It is the service/caller's responsibility
        # to filter out completed tasks from the input task_ids list.
        executable = get_executable_tasks([1, 2], {1}, [])
        assert 1 in executable
        assert 2 in executable
    
    def test_chain_unlocks_sequentially(self):
        """A→B→C: completing A makes B executable, C still blocked."""
        deps = [(2, 1), (3, 2)]
        # Only A completed
        executable = get_executable_tasks([1, 2, 3], {1}, deps)
        assert 2 in executable      # A done, B unlocked
        assert 3 not in executable  # B not done


# ============================================================
# get_blocking_tasks tests
# ============================================================

class TestGetBlockingTasks:
    def test_no_dependencies(self):
        """Task with no dependencies has no blocking tasks."""
        blocking = get_blocking_tasks(1, set(), [])
        assert blocking == []
    
    def test_all_dependencies_completed(self):
        """All dependencies completed → nothing blocking."""
        blocking = get_blocking_tasks(2, {1}, [(2, 1)])
        assert blocking == []
    
    def test_some_dependencies_uncompleted(self):
        """Only uncompleted dependencies are blocking."""
        # Task 3 depends on 1 and 2; only 1 completed
        blocking = get_blocking_tasks(3, {1}, [(3, 1), (3, 2)])
        assert blocking == [2]
    
    def test_all_dependencies_uncompleted(self):
        """All dependencies are blocking."""
        blocking = get_blocking_tasks(3, set(), [(3, 1), (3, 2)])
        assert set(blocking) == {1, 2}
    
    def test_completed_dependency_not_in_blocking(self):
        """Completed dependency does not appear as blocking."""
        blocking = get_blocking_tasks(2, {1}, [(2, 1)])
        assert 1 not in blocking


# ============================================================
# topological_sort tests
# ============================================================

class TestTopologicalSort:
    def test_linear_chain(self):
        """A→B→C should return [A, B, C]."""
        result = topological_sort([1, 2, 3], [(2, 1), (3, 2)])
        assert result == [1, 2, 3]
    
    def test_diamond(self):
        """A→B, A→C, B→D, C→D. A first, D last, B/C in middle."""
        deps = [(2, 1), (3, 1), (4, 2), (4, 3)]
        result = topological_sort([1, 2, 3, 4], deps)
        assert result[0] == 1  # A must be first
        assert result[-1] == 4  # D must be last
        assert set(result[1:3]) == {2, 3}  # B and C in middle
    
    def test_independent_tasks(self):
        """Tasks with no dependencies can be in any order."""
        result = topological_sort([1, 2, 3], [])
        assert set(result) == {1, 2, 3}
    
    def test_two_chains_parallel(self):
        """A→B and C→D in parallel."""
        deps = [(2, 1), (4, 3)]
        result = topological_sort([1, 2, 3, 4], deps)
        # A before B, C before D
        assert result.index(1) < result.index(2)
        assert result.index(3) < result.index(4)
    
    def test_single_task(self):
        """Single task graph works."""
        result = topological_sort([1], [])
        assert result == [1]
    
    def test_empty_graph(self):
        """Empty task list returns empty list."""
        result = topological_sort([], [])
        assert result == []
    
    def test_cycle_raises_error(self):
        """Graph with cycle raises ValueError."""
        # A→B, B→A
        with pytest.raises(ValueError, match="Cycle detected"):
            topological_sort([1, 2], [(2, 1), (1, 2)])
    
    def test_disconnected_with_shared_dependency(self):
        """A→C and B→C. A and B independent, both before C."""
        deps = [(3, 1), (3, 2)]
        result = topological_sort([1, 2, 3], deps)
        assert result.index(1) < result.index(3)
        assert result.index(2) < result.index(3)
