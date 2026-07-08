from pydantic import BaseModel, Field
from typing import List, Optional


class AIStepSuggestion(BaseModel):
    """A single task suggested by AI decomposition."""
    client_id: str = Field(..., description="Temporary ID for dependency references")
    title: str = Field(..., min_length=1, max_length=200)
    estimated_minutes: Optional[int] = Field(default=None, ge=1, le=480)
    depends_on: List[str] = Field(default_factory=list, description="client_ids this task depends on")


class AIDecompositionResponse(BaseModel):
    """Structured response expected from Gemini."""
    tasks: List[AIStepSuggestion] = Field(..., min_length=1, max_length=20)
    
    def validate_internal(self) -> tuple[bool, str]:
        """
        Validate the decomposition response.
        Returns (is_valid, error_message).
        """
        # Check for duplicate client_ids
        client_ids = [t.client_id for t in self.tasks]
        if len(client_ids) != len(set(client_ids)):
            return False, "Duplicate client_ids in AI response"
        
        # Check all dependency references are valid
        for task in self.tasks:
            for dep_id in task.depends_on:
                if dep_id not in client_ids:
                    return False, f"Task '{task.client_id}' references unknown dependency '{dep_id}'"
                if dep_id == task.client_id:
                    return False, f"Task '{task.client_id}' cannot depend on itself"
        
        # Check for cycles
        graph = {}
        for task in self.tasks:
            graph[task.client_id] = task.depends_on.copy()
        
        if self._has_any_cycle(graph):
            return False, "AI suggested tasks contain a dependency cycle"
        
        return True, ""
    
    def _has_any_cycle(self, graph: dict) -> bool:
        """Check if graph has any cycles using DFS."""
        visited = set()
        rec_stack = set()
        
        def dfs(node):
            visited.add(node)
            rec_stack.add(node)
            for neighbor in graph.get(node, []):
                if neighbor not in visited:
                    if dfs(neighbor):
                        return True
                elif neighbor in rec_stack:
                    return True
            rec_stack.discard(node)
            return False
        
        for node in graph:
            if node not in visited:
                if dfs(node):
                    return True
        return False
