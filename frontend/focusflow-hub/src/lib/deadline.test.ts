import { describe, expect, it } from "vitest";
import { describeDeadline, parseDeadline } from "./deadline";

const NOW = new Date(2026, 10, 4, 21, 30); // Nov 4, late evening local

describe("describeDeadline", () => {
  it("says 'No deadline' instead of '0 days remaining' when unset", () => {
    expect(describeDeadline(null, NOW)).toBe("No deadline");
    expect(describeDeadline(undefined, NOW)).toBe("No deadline");
    expect(describeDeadline("", NOW)).toBe("No deadline");
  });

  it("handles today, tomorrow and later by calendar day", () => {
    expect(describeDeadline("2026-11-04T00:00:00", NOW)).toBe("Due today");
    expect(describeDeadline("2026-11-05T00:00:00", NOW)).toBe("Due tomorrow");
    expect(describeDeadline("2026-11-14", NOW)).toBe("10 days remaining");
  });

  it("states a passed deadline plainly rather than '0 days remaining'", () => {
    expect(describeDeadline("2026-11-01T00:00:00", NOW)).toBe("Past deadline");
  });
});

describe("parseDeadline", () => {
  it("reads the date part as a local calendar date", () => {
    const d = parseDeadline("2026-12-01T00:00:00");
    expect([d?.getFullYear(), d?.getMonth(), d?.getDate()]).toEqual([2026, 11, 1]);
  });

  it("rejects garbage", () => {
    expect(parseDeadline("soon")).toBeNull();
  });
});
