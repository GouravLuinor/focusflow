import { Check } from 'lucide-react';

export interface ActivityItem {
  text: string;
  time: string;
  type: 'active' | 'completed';
}

interface GoalActivityProps {
  activities: ActivityItem[];
}

export function GoalActivity({ activities }: GoalActivityProps) {
  return (
    <div className="bg-card rounded-xl border border-border p-5 font-sans">
      <h2 className="text-[20px] font-medium text-foreground mb-4">Activity</h2>
      {activities.length === 0 && (
        <p className="text-[14px] text-muted-foreground">
          Nothing yet. Starting or finishing a task will show up here.
        </p>
      )}
      <div className="space-y-4 relative before:absolute before:inset-y-0 before:left-[9px] before:w-px before:bg-border">
        {activities.map((act, i) => (
          <div key={i} className="flex gap-3 relative z-10">
            {/* Timeline dot */}
            {act.type === 'active' ? (
              <div className="w-[19px] h-[19px] rounded-full bg-primary flex items-center justify-center shrink-0 mt-0.5 border-2 border-card">
                <div className="w-1.5 h-1.5 bg-primary-foreground rounded-full"></div>
              </div>
            ) : (
              <div className="w-[19px] h-[19px] rounded-full bg-success flex items-center justify-center shrink-0 mt-0.5 border-2 border-card">
                <Check className="w-3 h-3 text-success-foreground stroke-[3px]" />
              </div>
            )}

            <div>
              <p className="text-[14px] text-foreground leading-tight">
                {act.text}
              </p>
              <p className="text-[12px] text-muted-foreground mt-0.5">
                {act.time}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
