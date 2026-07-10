interface FocusTaskHeaderProps {
  title: string;
  goalTitle?: string;
  priority: string;
  originalMinutes?: number | null;
  adjustedMinutes?: number | null;
  sampleCount?: number | null;
  confidence?: string | null;
}

export function FocusTaskHeader({
  title,
  goalTitle,
  priority,
  originalMinutes,
  adjustedMinutes,
  sampleCount,
  confidence,
}: FocusTaskHeaderProps) {
  const showAdjusted =
    sampleCount && sampleCount > 0 && adjustedMinutes !== originalMinutes;

  return (
    <header className="flex flex-col items-center gap-3">
      <div className="inline-flex items-center px-2.5 py-1 rounded-full bg-[#eae6f4] border border-[#E8E6E1] gap-1.5 mb-2 font-sans">
        <span className="w-2 h-2 rounded-full bg-[#D97706]"></span>
        <span className="text-[12px] font-medium text-[#6B6660] tracking-wide">
          {priority}
        </span>
      </div>
      <h1 className="text-[32px] font-semibold text-[#1A1A1A] leading-tight font-sans text-center">
        {title}
      </h1>
      {goalTitle && (
        <p className="text-[16px] text-[#9E988E] font-sans text-center">
          {goalTitle}
        </p>
      )}
      {((originalMinutes !== undefined && originalMinutes !== null) || showAdjusted) && (
        <div className="flex flex-wrap items-center justify-center gap-2 mt-1 text-[14px] font-sans">
          {originalMinutes !== undefined && originalMinutes !== null && (
            <span className="text-[#6B6660]">
              Your estimate: <span className="font-semibold">{originalMinutes} min</span>
            </span>
          )}
          {showAdjusted && adjustedMinutes !== undefined && adjustedMinutes !== null && (
            <>
              <span className="text-[#E8E6E1] mx-1">•</span>
              <span className="text-[#4F46E5] font-semibold">
                Adjusted: ~{adjustedMinutes} min
              </span>
              <span className="text-[#9E988E] text-[12px]">
                (Based on {sampleCount} sessions, {confidence} confidence)
              </span>
            </>
          )}
        </div>
      )}
    </header>
  );
}
