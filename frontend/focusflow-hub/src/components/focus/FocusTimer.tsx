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
      <section className="flex flex-col items-center justify-center gap-4 py-6">
        <button
          onClick={onStart}
          data-testid="focus-start-btn"
          className="bg-[#4F46E5] hover:bg-[#4338ca] text-white font-semibold py-4 px-8 rounded-lg transition-all shadow-[0_4px_14px_0_rgba(79,70,229,0.39)] text-[18px] font-sans hover:scale-[1.02] active:scale-[0.98] duration-150"
        >
          Start Focus
        </button>
        {estimatedMinutes !== undefined && estimatedMinutes !== null && (
          <div className="text-[14px] text-[#9E988E] font-sans">
            Estimated: {estimatedMinutes} min
          </div>
        )}
      </section>
    );
  }

  return (
    <section aria-live="polite" className="flex flex-col items-center justify-center gap-2">
      <style>{`
        .pulse-ring-anim {
          animation: pulse-ring 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
        @keyframes pulse-ring {
          0% { transform: scale(0.8); opacity: 0.8; }
          50% { transform: scale(1.2); opacity: 0.4; }
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
            <div className="absolute inset-0 rounded-full bg-[#4F46E5] pulse-ring-anim"></div>
          )}
          <div className="relative w-2 h-2 rounded-full bg-[#4F46E5]"></div>
        </div>
        <div className="text-[40px] font-semibold text-[#1A1A1A] tabular-nums tracking-tight font-sans">
          {formatTime(seconds)}
        </div>
      </div>
      <div className="text-[14px] text-[#9E988E] uppercase tracking-wider font-sans">
        elapsed
      </div>
    </section>
  );
}
