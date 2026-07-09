interface AvailableTimeSummaryProps {
  scheduledMinutes: number;
  availableMinutes: number;
}

export function AvailableTimeSummary({
  scheduledMinutes,
  availableMinutes,
}: AvailableTimeSummaryProps) {
  const percentage = Math.min(100, Math.round((scheduledMinutes / availableMinutes) * 100));
  const remainingMinutes = Math.max(0, availableMinutes - scheduledMinutes);

  return (
    <div className="pt-4 border-t border-[#E8E6E1] font-sans">
      <div className="flex justify-between text-[14px] text-[#6B6660] mb-2 font-medium">
        <span>Available today: {availableMinutes} min</span>
      </div>
      <div className="w-full h-[6px] bg-[#eae6f4] rounded-full overflow-hidden mb-3">
        <div
          className="h-full bg-[#4F46E5] rounded-full transition-all duration-500"
          style={{ width: `${percentage}%` }}
        ></div>
      </div>
      <div className="flex justify-between text-[12px] text-[#9E988E] font-medium">
        <span>Scheduled: {scheduledMinutes} min</span>
        <span>Remaining: {remainingMinutes} min</span>
      </div>
    </div>
  );
}
