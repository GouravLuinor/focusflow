import { Calendar } from 'lucide-react';

interface GoalScheduleProps {
  nextSession: string;
}

export function GoalSchedule({ nextSession }: GoalScheduleProps) {
  return (
    <div className="bg-white rounded-xl border border-[#E8E6E1] p-5 font-sans">
      <h2 className="text-[20px] font-medium text-[#1A1A1A] mb-4">Schedule</h2>
      <div className="bg-[#f0ecf9] p-3 rounded-lg border border-[#E8E6E1] flex items-start gap-3">
        <Calendar className="w-5 h-5 text-[#4F46E5] mt-0.5 shrink-0" />
        <div>
          <div className="text-[14px] font-medium text-[#1A1A1A]">Next Session</div>
          <div className="text-[12px] text-[#6B6660]">{nextSession}</div>
        </div>
      </div>
    </div>
  );
}
