import { Star } from 'lucide-react';
import { AvailableTimeSummary } from './AvailableTimeSummary';
import { cn } from '@/lib/utils';

export interface WeekDay {
  day: string;
  hasTasks: boolean;
  isToday?: boolean;
}

interface WeekOverviewProps {
  weekDays: WeekDay[];
  scheduledMinutes: number;
  availableMinutes: number;
}

export function WeekOverview({ weekDays, scheduledMinutes, availableMinutes }: WeekOverviewProps) {
  return (
    <div className="bg-white border border-[#E8E6E1] rounded-xl p-5 font-sans shadow-sm">
      <h3 className="text-[18px] font-medium text-[#1A1A1A] mb-4">Week Overview</h3>
      <div className="flex justify-between items-center mb-6">
        {weekDays.map((dayObj, i) => {
          const isWeekend = i === 5 || i === 6;
          const isToday = dayObj.isToday;

          return (
            <div
              key={i}
              className={cn(
                "flex flex-col items-center gap-1",
                isToday ? "text-[#4F46E5]" : "text-[#6B6660]",
                isWeekend && !isToday ? "opacity-30" : "",
                !isToday && !isWeekend ? "opacity-50" : ""
              )}
            >
              <span className={cn("text-[12px] font-medium", isToday && "font-bold text-[#4F46E5]")}>
                {dayObj.day}
              </span>

              {isToday ? (
                <div className="w-8 h-8 rounded-full bg-[#4F46E5] text-white flex items-center justify-center font-bold text-sm shadow-[0_0_10px_rgba(79,70,229,0.3)] shrink-0">
                  <Star className="w-3.5 h-3.5 fill-white text-white" />
                </div>
              ) : isWeekend ? (
                <div className="w-6 h-6 rounded-full bg-transparent flex items-center justify-center shrink-0"></div>
              ) : (
                <div className="w-6 h-6 rounded-full bg-[#E8E6E1] flex items-center justify-center shrink-0">
                  {dayObj.hasTasks && (
                    <div className="w-1.5 h-1.5 bg-[#9E988E] rounded-full"></div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Available Time Summary section */}
      <AvailableTimeSummary
        scheduledMinutes={scheduledMinutes}
        availableMinutes={availableMinutes}
      />
    </div>
  );
}
