import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { apiRequest, ApiError } from "./api";

function mockFetch(status: number, body?: unknown) {
  const text = body === undefined ? "" : typeof body === "string" ? body : JSON.stringify(body);
  const fetchMock = vi.fn().mockResolvedValue(
    new Response(status === 204 ? null : text, { status })
  );
  vi.stubGlobal("fetch", fetchMock);
  return fetchMock;
}

describe("apiRequest", () => {
  const originalLocation = window.location;

  beforeEach(() => {
    localStorage.clear();
    // Allow assertions on redirects without jsdom navigation errors.
    Object.defineProperty(window, "location", {
      configurable: true,
      value: { ...originalLocation, href: "http://localhost/dashboard", pathname: "/dashboard" },
    });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    Object.defineProperty(window, "location", { configurable: true, value: originalLocation });
  });

  it("returns null for 204 No Content instead of throwing", async () => {
    mockFetch(204);
    await expect(apiRequest("/goals/1", { method: "DELETE" })).resolves.toBeNull();
  });

  it("parses JSON bodies", async () => {
    mockFetch(200, { id: 1 });
    await expect(apiRequest("/goals/1")).resolves.toEqual({ id: 1 });
  });

  it("shows the server message for a failed login without redirecting", async () => {
    mockFetch(401, { detail: "Invalid email or password" });
    const err = await apiRequest("/auth/login", { method: "POST" }).catch((e) => e);
    expect(err).toBeInstanceOf(ApiError);
    expect(err.message).toBe("Invalid email or password");
    expect(err.status).toBe(401);
    expect(window.location.href).toBe("http://localhost/dashboard");
  });

  it("clears the token and redirects when an authenticated request gets 401", async () => {
    localStorage.setItem("token", "expired");
    mockFetch(401, { detail: "Could not validate credentials" });
    await expect(apiRequest("/tasks")).rejects.toThrow(/session expired/i);
    expect(localStorage.getItem("token")).toBeNull();
    expect(window.location.href).toBe("/login");
  });

  it("redirects to login when a protected request is made without a token", async () => {
    mockFetch(401, { detail: "Not authenticated" });
    await expect(apiRequest("/tasks/1/focus")).rejects.toThrow(/session expired/i);
    expect(window.location.href).toBe("/login");
  });

  it("formats pydantic validation errors into readable text", async () => {
    mockFetch(422, {
      detail: [{ loc: ["body", "title"], msg: "String should have at least 1 character" }],
    });
    await expect(apiRequest("/goals/", { method: "POST" })).rejects.toThrow(
      "title: String should have at least 1 character"
    );
  });

  it("handles non-JSON error bodies", async () => {
    mockFetch(500, "Internal Server Error");
    await expect(apiRequest("/tasks")).rejects.toBeInstanceOf(ApiError);
  });

  it("reports network failures clearly", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new TypeError("Failed to fetch")));
    await expect(apiRequest("/tasks")).rejects.toThrow(/can't reach the server/i);
  });

  it("does not force a JSON content type on FormData uploads", async () => {
    const fetchMock = mockFetch(200, { text: "hi" });
    await apiRequest("/voice/transcribe", { method: "POST", body: new FormData() });
    const headers = fetchMock.mock.calls[0][1].headers as Record<string, string>;
    expect(headers["Content-Type"]).toBeUndefined();
  });
});
