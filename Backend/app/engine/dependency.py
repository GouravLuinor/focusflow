from typing import List, Set

def has_cycle(graph: dict, new_edge: tuple) -> bool:
    """
    Check if adding new_edge to graph creates a cycle using DFS.
    
    Args:
        graph: adjacency list {node_id: [dependent_node_ids]}
        new_edge: (task_id, depends_on_task_id) — task_id depends on depends_on_task_id
    
    Returns:
        True if adding edge creates a cycle
    """
    # The edge means: task_id depends on depends_on_task_id
    # So direction in graph is: depends_on_task_id → task_id
    task_id, depends_on_id = new_edge
    
    # Temporarily add edge
    if depends_on_id not in graph:
        graph[depends_on_id] = []
    graph[depends_on_id].append(task_id)
    
    # Check if task_id can reach depends_on_id (would form cycle)
    has_cycle_result = dfs_reachable(graph, task_id, depends_on_id, set())
    
    # Remove temporary edge
    graph[depends_on_id].remove(task_id)
    if not graph[depends_on_id]:
        del graph[depends_on_id]
    
    return has_cycle_result


def dfs_reachable(graph: dict, current: int, target: int, visited: set) -> bool:
    """DFS to check if target is reachable from current."""
    if current == target:
        return True
    if current in visited:
        return False
    
    visited.add(current)
    for neighbor in graph.get(current, []):
        if dfs_reachable(graph, neighbor, target, visited):
            return True
    return False


def build_adjacency_list(dependencies: list) -> dict:
    """
    Build adjacency list from dependency edges.
    Edge (task_id, depends_on_id) means depends_on_id → task_id.
    """
    graph = {}
    for dep in dependencies:
        from_node = dep[1]  # depends_on_task_id
        to_node = dep[0]    # task_id
        if from_node not in graph:
            graph[from_node] = []
        graph[from_node].append(to_node)
    return graph


def validate_dependency(
    task_id: int,
    depends_on_task_id: int,
    user_id: int,
    db
) -> tuple[bool, str]:
    """
    Validate a dependency edge. Returns (is_valid, error_message).
    
    Checks:
    1. Not self-dependency
    2. Both tasks exist and belong to user
    3. Not duplicate edge
    4. No cycle created
    """
    from app.models.task import Task
    from app.models.task_dependency import TaskDependency
    
    # 1. Self-dependency
    if task_id == depends_on_task_id:
        return False, "A task cannot depend on itself."
    
    # 2. Both tasks exist and belong to user
    task = db.query(Task).filter(Task.id == task_id, Task.user_id == user_id).first()
    if not task:
        return False, f"Task {task_id} not found."
    
    depends_on = db.query(Task).filter(Task.id == depends_on_task_id, Task.user_id == user_id).first()
    if not depends_on:
        return False, f"Task {depends_on_task_id} not found."
    
    # 3. Duplicate edge
    existing = db.query(TaskDependency).filter(
        TaskDependency.task_id == task_id,
        TaskDependency.depends_on_task_id == depends_on_task_id
    ).first()
    if existing:
        return False, "This dependency already exists."
    
    # 4. Cycle detection
    # Get all existing dependencies
    all_deps = db.query(TaskDependency).filter(
        TaskDependency.task_id.in_(
            db.query(Task.id).filter(Task.user_id == user_id)
        )
    ).all()
    
    edges = [(d.task_id, d.depends_on_task_id) for d in all_deps]
    graph = build_adjacency_list(edges)
    
    if has_cycle(graph, (task_id, depends_on_task_id)):
        return False, "Adding this dependency would create a cycle."
    
    return True, None


def get_executable_tasks(task_ids: List[int], completed_task_ids: Set[int], dependencies: List[tuple]) -> List[int]:
    """
    Return task IDs that are executable (all dependencies completed).
    
    Args:
        task_ids: all task IDs to consider
        completed_task_ids: set of task IDs that are completed
        dependencies: list of (task_id, depends_on_task_id) edges
    
    Returns:
        list of executable task IDs
    """
    executable = []
    
    for task_id in task_ids:
        # Find all dependencies for this task
        task_deps = [dep[1] for dep in dependencies if dep[0] == task_id]
        
        # Task is executable if all its dependencies are completed
        if all(dep_id in completed_task_ids for dep_id in task_deps):
            executable.append(task_id)
    
    return executable


def get_blocking_tasks(task_id: int, completed_task_ids: Set[int], dependencies: List[tuple]) -> List[int]:
    """
    Return list of dependency IDs that are blocking this task (not yet completed).
    """
    task_deps = [dep[1] for dep in dependencies if dep[0] == task_id]
    return [dep_id for dep_id in task_deps if dep_id not in completed_task_ids]


def topological_sort(task_ids: List[int], dependencies: List[tuple]) -> List[int]:
    """
    Compute topological ordering using Kahn's algorithm.
    
    Args:
        task_ids: all task IDs in the graph
        dependencies: list of (task_id, depends_on_task_id) edges
                      meaning task_id depends on depends_on_task_id
                      direction: depends_on_task_id → task_id
    
    Returns:
        list of task IDs in topological order
        
    Raises:
        ValueError: if a cycle is detected (shouldn't happen if validated)
    """
    # Build adjacency list: node → [nodes that depend on it]
    # Edge (task_id, depends_on_id) means depends_on_id → task_id
    graph = {tid: [] for tid in task_ids}
    in_degree = {tid: 0 for tid in task_ids}
    
    for task_id, depends_on_id in dependencies:
        if depends_on_id in graph and task_id in graph:
            graph[depends_on_id].append(task_id)
            in_degree[task_id] = in_degree.get(task_id, 0) + 1
    
    # Initialize queue with nodes having in-degree 0
    queue = [tid for tid in task_ids if in_degree.get(tid, 0) == 0]
    result = []
    
    while queue:
        # Remove first node (could use priority here later)
        node = queue.pop(0)
        result.append(node)
        
        # Reduce in-degree of dependent nodes
        for dependent in graph.get(node, []):
            in_degree[dependent] -= 1
            if in_degree[dependent] == 0:
                queue.append(dependent)
    
    if len(result) != len(task_ids):
        raise ValueError("Cycle detected in task graph. Cannot compute topological order.")
    
    return result
