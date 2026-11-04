import { beforeEach, describe, expect, it } from "vitest";
import { getAccessibilityDefaults, getStoredAccessibility } from "./AppContext";

describe("getStoredAccessibility", () => {
  beforeEach(() => localStorage.clear());

  it("falls back to mode defaults when nothing is stored", () => {
    expect(getStoredAccessibility("dyslexia")).toEqual(getAccessibilityDefaults("dyslexia"));
  });

  it("restores saved settings over the mode defaults", () => {
    localStorage.setItem("accessibility", JSON.stringify({ fontSize: "2xl", highContrast: true }));
    const result = getStoredAccessibility("adhd");
    expect(result.fontSize).toBe("2xl");
    expect(result.highContrast).toBe(true);
    // Untouched fields keep the mode default.
    expect(result.sessionDefaultMinutes).toBe(25);
  });

  it("ignores corrupted or wrongly-typed stored values", () => {
    localStorage.setItem("accessibility", JSON.stringify({ fontSize: 42, unknownKey: "x" }));
    expect(getStoredAccessibility(null)).toEqual(getAccessibilityDefaults(null));

    localStorage.setItem("accessibility", "{not json");
    expect(getStoredAccessibility(null)).toEqual(getAccessibilityDefaults(null));
  });
});
