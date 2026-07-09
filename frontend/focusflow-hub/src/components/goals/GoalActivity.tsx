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
    <div className="bg-white rounded-xl border border-[#E8E6E1] p-5 font-sans">
      <h2 className="text-[20px] font-medium text-[#1A1A1A] mb-4">Activity</h2>
      <div className="space-y-4 relative before:absolute before:inset-y-0 before:left-[9px] before:w-px before:bg-[#E8E6E1]">
        {activities.map((act, i) => (
          <div key={i} className="flex gap-3 relative z-10">
            {/* Timeline dot */}
            {act.type === 'active' ? (
              <div className="w-[19px] h-[19px] rounded-full bg-[#4F46E5] flex items-center justify-center shrink-0 mt-0.5 border-2 border-white">
                <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
              </div>
            ) : (
              <div className="w-[19px] h-[19px] rounded-full bg-[#059669] flex items-center justify-center shrink-0 mt-0.5 border-2 border-white">
                <Check className="w-3 h-3 text-white stroke-[3px]" />
              </div>
            )}

            <div>
              <p className="text-[14px] text-[#1A1A1A] leading-tight">
                {act.text}
              </p>
              <p className="text-[12px] text-[#6B6660] mt-0.5">
                {act.time}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
