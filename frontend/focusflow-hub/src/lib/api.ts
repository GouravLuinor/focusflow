// This tells the frontend: "Talk to the same server that gave you these files"
// If we are in development mode (npm run dev), use localhost:8000
// If we are in the built version (Docker/HuggingFace), use the current window origin
const API_BASE_URL = import.meta.env.DEV
  ? "http://localhost:8000"
  : window.location.origin;

export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

interface ValidationIssue {
  msg?: string;
  loc?: (string | number)[];
}

/** Turn a FastAPI error body into a human-readable message. */
function extractErrorMessage(body: unknown, fallback: string): string {
  if (!body || typeof body !== "object" || !("detail" in body)) return fallback;
  const detail = (body as { detail: unknown }).detail;

  if (typeof detail === "string") return detail;

  // Pydantic validation errors: [{ loc: [...], msg: "..." }, ...]
  if (Array.isArray(detail)) {
    const messages = (detail as ValidationIssue[])
      .map((issue) => {
        const field = issue.loc?.filter((p) => p !== "body").join(".");
        return field ? `${field}: ${issue.msg}` : issue.msg;
      })
      .filter(Boolean);
    if (messages.length > 0) return messages.join("; ");
  }

  return fallback;
}

async function parseBody(response: Response): Promise<unknown> {
  if (response.status === 204) return null;
  const text = await response.text();
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

// Defaults to `any` to stay compatible with existing untyped call sites;
// new code should pass an explicit type, e.g. apiRequest<Goal[]>("/goals").
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function apiRequest<T = any>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = localStorage.getItem("token");
  const isFormData = options.body instanceof FormData;

  const headers: HeadersInit = {
    ...(isFormData ? {} : { "Content-Type": "application/json" }),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });
  } catch {
    throw new ApiError("Can't reach the server. Check your connection and try again.", 0);
  }

  const body = await parseBody(response);

  // A 401 on an authenticated request means the session expired.
  // A 401 on login itself just means bad credentials — let the caller show it.
  const isAuthEndpoint = endpoint.startsWith("/auth/login") || endpoint.startsWith("/auth/signup");
  if (response.status === 401 && !isAuthEndpoint) {
    localStorage.removeItem("token");
    if (window.location.pathname !== "/login") {
      window.location.href = "/login";
    }
    throw new ApiError("Your session expired. Please sign in again.", 401);
  }

  if (!response.ok) {
    throw new ApiError(
      extractErrorMessage(body, response.statusText || "Something went wrong"),
      response.status
    );
  }

  return body as T;
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
