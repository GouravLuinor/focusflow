import { Calendar } from 'lucide-react';

interface GoalScheduleProps {
  nextSession: string;
}

export function GoalSchedule({ nextSession }: GoalScheduleProps) {
  return (
    <div className="bg-card rounded-xl border border-border p-5 font-sans">
      <h2 className="text-[20px] font-medium text-foreground mb-4">Schedule</h2>
      <div className="bg-muted p-3 rounded-lg border border-border flex items-start gap-3">
        <Calendar className="w-5 h-5 text-primary mt-0.5 shrink-0" />
        <div>
          <div className="text-[14px] font-medium text-foreground">Next Session</div>
          <div className="text-[12px] text-muted-foreground">{nextSession}</div>
        </div>
      </div>
    </div>
  );
}
