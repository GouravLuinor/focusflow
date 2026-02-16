// This tells the frontend: "Talk to the same server that gave you these files"
// If we are in development mode (npm run dev), use localhost:8000
// If we are in the built version (Docker/HuggingFace), use the current window origin
const API_BASE_URL = import.meta.env.DEV 
  ? "http://localhost:8000" 
  : window.location.origin;
  
export async function apiRequest(
  endpoint: string,
  options: RequestInit = {}
) {
  const token = localStorage.getItem("token");

  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || "Something went wrong");
  }

  return response.json();
}
export function normalizeTasks(data: any[]) {
  return data.map((task) => ({
    ...task,
    completed: task.is_completed,
    steps: task.steps?.map((step: any) => ({
      ...step,
      completed: step.is_completed,
    })) || [],
  }));
}
