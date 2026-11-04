/**
 * Productivity stats derived from real task and session data.
 * Shared by the Dashboard quick stats and the Insights page.
 */

export interface StatsTask {
  is_completed: boolean;
  status?: string;
  updated_at?: string | null;
}

export interface StatsSession {
  status: string;
  started_at: string;
  ended_at?: string | null;
  duration_seconds?: number | null;
}

/** Sessions whose duration represents real worked time. */
const WORKED_SESSION_STATUSES = new Set(["COMPLETED", "ABANDONED"]);

/**
 * The backend stores naive UTC datetimes and serializes them without a
 * timezone suffix ("2026-11-04T18:30:00"). JS would parse those as *local*
 * time, so treat suffix-less timestamps as UTC.
 */
export function parseServerDate(value: string | null | undefined): Date | null {
  if (!value) return null;
  const hasZone = /([zZ]|[+-]\d{2}:?\d{2})$/.test(value);
  const date = new Date(hasZone ? value : `${value}Z`);
  return Number.isNaN(date.getTime()) ? null : date;
}

/** YYYY-MM-DD in the viewer's local timezone. */
export function localDayKey(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function shiftDays(date: Date, days: number): Date {
  const copy = new Date(date);
  copy.setDate(copy.getDate() + days);
  return copy;
}

function sessionDay(session: StatsSession): string | null {
  const when = parseServerDate(session.ended_at) ?? parseServerDate(session.started_at);
  return when ? localDayKey(when) : null;
}

/**
 * Day a task was completed. The API has no completed_at, so updated_at is
 * the best available signal (it is set when the task is marked done).
 */
function taskCompletionDay(task: StatsTask): string | null {
  if (!task.is_completed) return null;
  const when = parseServerDate(task.updated_at);
  return when ? localDayKey(when) : null;
}

/** Focus seconds worked per local day. */
export function focusSecondsByDay(sessions: StatsSession[]): Map<string, number> {
  const byDay = new Map<string, number>();
  for (const s of sessions) {
    if (!WORKED_SESSION_STATUSES.has(s.status) || !s.duration_seconds) continue;
    const day = sessionDay(s);
    if (!day) continue;
    byDay.set(day, (byDay.get(day) ?? 0) + s.duration_seconds);
  }
  return byDay;
}

/** Tasks completed per local day. */
export function completedTasksByDay(tasks: StatsTask[]): Map<string, number> {
  const byDay = new Map<string, number>();
  for (const t of tasks) {
    const day = taskCompletionDay(t);
    if (day) byDay.set(day, (byDay.get(day) ?? 0) + 1);
  }
  return byDay;
}

/**
 * Consecutive days (ending today) with at least one completed task or worked
 * session. If nothing has happened yet today, a streak running through
 * yesterday still counts — it isn't broken until the day is over.
 */
export function computeDayStreak(
  tasks: StatsTask[],
  sessions: StatsSession[],
  now: Date = new Date()
): number {
  const activeDays = new Set<string>([
    ...completedTasksByDay(tasks).keys(),
    ...focusSecondsByDay(sessions).keys(),
  ]);

  let cursor = activeDays.has(localDayKey(now)) ? now : shiftDays(now, -1);
  let streak = 0;
  while (activeDays.has(localDayKey(cursor))) {
    streak++;
    cursor = shiftDays(cursor, -1);
  }
  return streak;
}

export interface TodayStats {
  completedToday: number;
  focusMinutesToday: number;
  dayStreak: number;
}

export function computeTodayStats(
  tasks: StatsTask[],
  sessions: StatsSession[],
  now: Date = new Date()
): TodayStats {
  const today = localDayKey(now);
  return {
    completedToday: completedTasksByDay(tasks).get(today) ?? 0,
    focusMinutesToday: Math.round((focusSecondsByDay(sessions).get(today) ?? 0) / 60),
    dayStreak: computeDayStreak(tasks, sessions, now),
  };
}
