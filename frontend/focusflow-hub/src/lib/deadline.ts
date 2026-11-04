import { differenceInCalendarDays } from "date-fns";

/**
 * A goal/task deadline is a calendar date. The API sends it as a naive
 * datetime ("2026-12-01T00:00:00"); read only the date part as a *local*
 * date so it never shifts a day across timezones.
 */
export function parseDeadline(value: string | null | undefined): Date | null {
  if (!value) return null;
  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(value);
  if (!match) return null;
  const [, y, m, d] = match;
  const date = new Date(Number(y), Number(m) - 1, Number(d));
  return Number.isNaN(date.getTime()) ? null : date;
}

/** Days until the deadline (negative once passed), or null with no deadline. */
export function daysUntilDeadline(value: string | null | undefined, now: Date = new Date()): number | null {
  const deadline = parseDeadline(value);
  return deadline ? differenceInCalendarDays(deadline, now) : null;
}

/**
 * Calm, human label for a deadline. Neuro-inclusive copy: no alarm words,
 * a passed deadline is stated plainly rather than as a warning.
 */
export function describeDeadline(value: string | null | undefined, now: Date = new Date()): string {
  const days = daysUntilDeadline(value, now);
  if (days === null) return "No deadline";
  if (days < 0) return "Past deadline";
  if (days === 0) return "Due today";
  if (days === 1) return "Due tomorrow";
  return `${days} days remaining`;
}
