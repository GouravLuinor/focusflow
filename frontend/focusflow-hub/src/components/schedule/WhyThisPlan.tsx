import { Lightbulb, Clock, Flower2, type LucideIcon } from 'lucide-react';
import { daysUntilDeadline, describeDeadline } from '@/lib/deadline';

interface PlannedTask {
  title: string;
  deadline?: string | null;
}

interface WhyThisPlanProps {
  sessionCount: number;
  scheduledMinutes: number;
  availableMinutes: number;
  plannedTasks: PlannedTask[];
}

interface Reason {
  icon: LucideIcon;
  text: string;
}

/** Explains the saved plan using only facts that are true of it. */
export function WhyThisPlan({ sessionCount, scheduledMinutes, availableMinutes, plannedTasks }: WhyThisPlanProps) {
  if (sessionCount === 0) return null;

  const reasons: Reason[] = [];

  const nearest = plannedTasks
    .map((task) => ({ task, days: daysUntilDeadline(task.deadline) }))
    .filter((t): t is { task: PlannedTask; days: number } => t.days !== null && t.days >= 0)
    .sort((a, b) => a.days - b.days)[0];
  if (nearest) {
    reasons.push({
      icon: Lightbulb,
      text: `${nearest.task.title}: ${describeDeadline(nearest.task.deadline).toLowerCase()}`,
    });
  }

  const sessions = `${sessionCount} ${sessionCount === 1 ? 'session' : 'sessions'}`;
  reasons.push({
    icon: Clock,
    text:
      scheduledMinutes <= availableMinutes
        ? `${sessions}, ${scheduledMinutes} min, within your ${availableMinutes} min for today`
        : `${sessions}, ${scheduledMinutes} min, more than your ${availableMinutes} min. Trimming one is fine.`,
  });

  const remaining = availableMinutes - scheduledMinutes;
  if (remaining > 0) {
    reasons.push({
      icon: Flower2,
      text: `${remaining} min left open as breathing room`,
    });
  }

  return (
    <div className="mt-8 font-sans">
      <h3 className="text-[20px] font-medium text-foreground mb-4">
        Why this plan?
      </h3>
      <ul className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {reasons.map(({ icon: Icon, text }) => (
          <li key={text} className="bg-card border border-border p-4 rounded-xl flex items-start gap-3">
            <Icon className="w-5 h-5 text-primary mt-1 shrink-0" aria-hidden />
            <p className="text-[14px] text-muted-foreground leading-relaxed">{text}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
