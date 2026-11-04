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
    <div className="pt-4 border-t border-border font-sans">
      <div className="flex justify-between text-[14px] text-muted-foreground mb-2 font-medium">
        <span>Available today: {availableMinutes} min</span>
      </div>
      <div className="w-full h-[6px] bg-muted rounded-full overflow-hidden mb-3">
        <div
          className="h-full bg-primary rounded-full transition-all duration-500"
          style={{ width: `${percentage}%` }}
        ></div>
      </div>
      <div className="flex justify-between text-[12px] text-muted-foreground font-medium">
        <span>Scheduled: {scheduledMinutes} min</span>
        <span>Remaining: {remainingMinutes} min</span>
      </div>
    </div>
  );
}
