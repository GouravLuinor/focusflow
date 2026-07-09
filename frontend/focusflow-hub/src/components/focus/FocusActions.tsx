interface FocusActionsProps {
  onPauseToggle: () => void;
  isPaused: boolean;
  onComplete: () => void;
  isPausing?: boolean;
  isCompleting?: boolean;
  disabled?: boolean;
}

export function FocusActions({
  onPauseToggle,
  isPaused,
  onComplete,
  isPausing = false,
  isCompleting = false,
  disabled = false,
}: FocusActionsProps) {
  return (
    <section className="w-full grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
      {/* Pause/Resume Action (Secondary/Outline) */}
      <button
        onClick={onPauseToggle}
        disabled={disabled || isPausing || isCompleting}
        className="flex flex-col items-center justify-center gap-1 w-full border-2 border-[#4F46E5] rounded-lg p-4 bg-transparent text-[#4F46E5] hover:bg-[#f5f2ff] hover:scale-[1.01] transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-[rgba(79,70,229,0.15)] disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <span className="text-[18px] font-medium font-sans">
          {isPausing ? 'Pausing...' : (isPaused ? 'Resume' : 'Pause')}
        </span>
        <span className="text-[12px] text-[#9E988E] font-normal text-center font-sans leading-tight">
          {isPaused ? 'Jump back in and continue focus' : 'Take a break, resume anytime'}
        </span>
      </button>

      {/* Complete Action (Primary/Solid) */}
      <button
        onClick={onComplete}
        disabled={disabled || isPausing || isCompleting}
        className="flex flex-col items-center justify-center gap-1 w-full bg-[#4F46E5] hover:bg-[#4338ca] rounded-lg p-4 text-white shadow-sm hover:scale-[1.01] hover:shadow-md transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-[rgba(79,70,229,0.15)] disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <span className="text-[18px] font-medium font-sans">
          {isCompleting ? 'Completing...' : 'Complete Task'}
        </span>
        <span className="text-[12px] text-white/80 font-normal text-center font-sans leading-tight">
          Mark as done &amp; unlock next tasks
        </span>
      </button>
    </section>
  );
}
