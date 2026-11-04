interface FocusTimerProps {
  seconds: number;
  isPaused: boolean;
  isRunning: boolean;
  onStart: () => void;
  estimatedMinutes?: number | null;
}

function formatTime(totalSeconds: number): string {
  const mins = Math.floor(totalSeconds / 60);
  const secs = totalSeconds % 60;
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

export function FocusTimer({
  seconds,
  isPaused,
  isRunning,
  onStart,
  estimatedMinutes,
}: FocusTimerProps) {
  if (!isRunning) {
    return (
      <section className="flex flex-col items-center justify-center gap-3 py-6">
        <button
          onClick={onStart}
          data-testid="focus-start-btn"
          className="bg-primary hover:bg-primary/90 text-primary-foreground font-medium py-3.5 px-8 rounded-xl transition-all shadow-glow-vermilion text-base font-sans hover:scale-[1.02] active:scale-[0.98] duration-150"
        >
          Start Focus
        </button>
        {estimatedMinutes !== undefined && estimatedMinutes !== null && (
          <div className="text-xs text-muted-foreground font-sans">
            Target: ~{estimatedMinutes} min
          </div>
        )}
      </section>
    );
  }

  return (
    <section aria-live="polite" className="flex flex-col items-center justify-center gap-2 py-4">
      <style>{`
        .pulse-ring-anim {
          animation: pulse-ring 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
        @keyframes pulse-ring {
          0% { transform: scale(0.8); opacity: 0.8; }
          50% { transform: scale(1.2); opacity: 0.3; }
          100% { transform: scale(0.8); opacity: 0.8; }
        }
        @media (prefers-reduced-motion: reduce) {
          .pulse-ring-anim {
            animation: none;
          }
        }
      `}</style>
      
      <div className="flex items-center gap-3 relative justify-center">
        {/* Pulsing indicator for active focus (only pulse if not paused) */}
        <div className="relative flex items-center justify-center w-4 h-4 shrink-0">
          {!isPaused && (
            <div className="absolute inset-0 rounded-full bg-primary pulse-ring-anim"></div>
          )}
          <div className="relative w-2.5 h-2.5 rounded-full bg-primary"></div>
        </div>
        <div className="text-4xl font-semibold text-foreground tabular-nums tracking-tight font-sans">
          {formatTime(seconds)}
        </div>
      </div>
      <div className="text-xs text-muted-foreground uppercase tracking-widest font-sans font-medium">
        {isPaused ? 'Paused' : 'Elapsed'}
      </div>
    </section>
  );
}
