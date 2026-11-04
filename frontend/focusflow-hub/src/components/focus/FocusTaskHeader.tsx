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
    !!sampleCount && sampleCount > 0 && adjustedMinutes !== originalMinutes;

  return (
    <header className="flex flex-col items-center gap-3">
      <div className="inline-flex items-center px-2.5 py-1 rounded-full bg-muted border border-border gap-1.5 mb-2 font-sans">
        <span className="w-2 h-2 rounded-full bg-accent"></span>
        <span className="text-[12px] font-medium text-muted-foreground tracking-wide">
          {priority}
        </span>
      </div>
      <h1 className="text-[32px] font-semibold text-foreground leading-tight font-sans text-center">
        {title}
      </h1>
      {goalTitle && (
        <p className="text-[16px] text-muted-foreground font-sans text-center">
          {goalTitle}
        </p>
      )}
      {((originalMinutes !== undefined && originalMinutes !== null) || showAdjusted) && (
        <div className="flex flex-wrap items-center justify-center gap-2 mt-1 text-[14px] font-sans">
          {originalMinutes !== undefined && originalMinutes !== null && (
            <span className="text-muted-foreground">
              Your estimate: <span className="font-semibold">{originalMinutes} min</span>
            </span>
          )}
          {showAdjusted && adjustedMinutes !== undefined && adjustedMinutes !== null && (
            <>
              <span className="text-border mx-1">•</span>
              <span className="text-primary font-semibold">
                Adjusted: ~{adjustedMinutes} min
              </span>
              <span className="text-muted-foreground text-[12px]">
                (Based on {sampleCount} sessions, {confidence} confidence)
              </span>
            </>
          )}
        </div>
      )}
    </header>
  );
}
