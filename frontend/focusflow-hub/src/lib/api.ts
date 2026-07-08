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

  if (response.status === 401) {
    localStorage.removeItem("token");
    window.location.href = "/login";
    throw new Error("Session expired. Redirecting to login.");
  }

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || "Something went wrong");
  }

  return response.json();
}
export interface APIStep {
  id?: number;
  content: string;
  is_completed: boolean;
  order: number;
  [key: string]: unknown;
}

export interface APITask {
  id: number;
  title: string;
  description: string;
  is_completed: boolean;
  order?: number;
  steps?: APIStep[];
  [key: string]: unknown;
}

export function normalizeTasks(data: APITask[]) {
  return data.map((task) => ({
    ...task,
    completed: task.is_completed,
    steps: task.steps?.map((step: APIStep) => ({
      ...step,
      completed: step.is_completed,
    })) || [],
  }));
}
