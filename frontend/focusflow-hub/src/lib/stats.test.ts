import { describe, expect, it } from "vitest";
import {
  computePatternInsights,
  computeDayStreak,
  computeTodayStats,
  localDayKey,
  parseServerDate,
  type StatsSession,
  type StatsTask,
} from "./stats";

// Fixed "now": local noon avoids day-boundary flakiness in any timezone.
const NOW = new Date(2026, 10, 4, 12, 0, 0);

/** A naive-UTC server timestamp for local noon `daysAgo` days before NOW. */
function serverStamp(daysAgo: number): string {
  const d = new Date(NOW);
  d.setDate(d.getDate() - daysAgo);
  return d.toISOString().replace("Z", "");
}

const doneTask = (daysAgo: number): StatsTask => ({ is_completed: true, updated_at: serverStamp(daysAgo) });
const session = (daysAgo: number, seconds: number, status = "COMPLETED"): StatsSession => ({
  status,
  started_at: serverStamp(daysAgo),
  ended_at: serverStamp(daysAgo),
  duration_seconds: seconds,
});

describe("parseServerDate", () => {
  it("treats timestamps without a zone as UTC", () => {
    expect(parseServerDate("2026-11-04T18:30:00")?.toISOString()).toBe("2026-11-04T18:30:00.000Z");
  });

  it("respects explicit zones", () => {
    expect(parseServerDate("2026-11-04T18:30:00+05:30")?.toISOString()).toBe("2026-11-04T13:00:00.000Z");
    expect(parseServerDate("2026-11-04T18:30:00Z")?.toISOString()).toBe("2026-11-04T18:30:00.000Z");
  });

  it("returns null for missing or invalid values", () => {
    expect(parseServerDate(null)).toBeNull();
    expect(parseServerDate("not a date")).toBeNull();
  });
});

describe("computeDayStreak", () => {
  it("is 0 with no activity", () => {
    expect(computeDayStreak([], [], NOW)).toBe(0);
  });

  it("counts consecutive days ending today", () => {
    expect(computeDayStreak([doneTask(0), doneTask(1)], [session(2, 600)], NOW)).toBe(3);
  });

  it("keeps yesterday's streak alive when nothing is done yet today", () => {
    expect(computeDayStreak([doneTask(1), doneTask(2)], [], NOW)).toBe(2);
  });

  it("stops at a gap", () => {
    expect(computeDayStreak([doneTask(0), doneTask(2), doneTask(3)], [], NOW)).toBe(1);
  });

  it("ignores incomplete tasks and non-worked sessions", () => {
    const openTask: StatsTask = { is_completed: false, updated_at: serverStamp(0) };
    expect(computeDayStreak([openTask], [session(0, 600, "ACTIVE")], NOW)).toBe(0);
  });
});

describe("computeTodayStats", () => {
  it("only counts today's completions and focus time", () => {
    const stats = computeTodayStats(
      [doneTask(0), doneTask(0), doneTask(1)],
      [session(0, 25 * 60), session(0, 5 * 60, "ABANDONED"), session(1, 3600)],
      NOW
    );
    expect(stats).toEqual({ completedToday: 2, focusMinutesToday: 30, dayStreak: 2 });
  });
});

describe("localDayKey", () => {
  it("formats in local time", () => {
    expect(localDayKey(new Date(2026, 0, 5, 23, 59))).toBe("2026-01-05");
  });
});

describe("computePatternInsights", () => {
  it("states nothing without enough data", () => {
    expect(computePatternInsights([], [])).toEqual([]);
  });

  it("reports the part of day with the most focus time", () => {
    const at = (h: number) => new Date(2026, 10, 3, h, 0).toISOString();
    const sessions = [
      { status: "COMPLETED", started_at: at(9), duration_seconds: 1800 },
      { status: "COMPLETED", started_at: at(10), duration_seconds: 1800 },
      { status: "ABANDONED", started_at: at(20), duration_seconds: 1200 },
    ];
    expect(computePatternInsights([], sessions)).toEqual([
      { title: "When you focus", body: "75% of your focus time happens in the morning." },
    ]);
  });

  it("compares completion of stepped vs unstepped tasks", () => {
    const steps = [1, 2, 3];
    const tasks = [
      { is_completed: true, steps },
      { is_completed: true, steps },
      { is_completed: true, steps: [] },
      { is_completed: false, steps: [] },
    ];
    expect(computePatternInsights(tasks, [])[0].body).toBe(
      "Tasks with 3+ steps: 100% done. Tasks with fewer steps: 50% done.",
    );
  });
});
