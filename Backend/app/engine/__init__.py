# FocusFlow Engine Package

from .dependency import (
    has_cycle,
    dfs_reachable,
    build_adjacency_list,
    get_executable_tasks,
    get_blocking_tasks,
    topological_sort,
    validate_dependency,
)
from .priority import (
    score_task,
    rank_tasks,
    select_plan,
    DEFAULT_WEIGHTS,
    PRIORITY_VALUES,
)
from .state_machine import (
    VALID_TRANSITIONS,
    is_valid_transition,
    transition_task_status,
)
from .adaptation import (
    calculate_adjusted_estimate,
    get_average_actual_duration,
    DEFAULT_ALPHA,
)

