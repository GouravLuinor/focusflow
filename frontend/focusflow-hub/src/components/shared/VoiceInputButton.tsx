import { Mic, MicOff, Loader2 } from 'lucide-react';

interface VoiceInputButtonProps {
  isRecording: boolean;
  isProcessing: boolean;
  onStart: () => void;
  onStop: () => void;
  disabled?: boolean;
}

export function VoiceInputButton({
  isRecording,
  isProcessing,
  onStart,
  onStop,
  disabled = false,
}: VoiceInputButtonProps) {
  if (isProcessing) {
    return (
      <button
        type="button"
        disabled
        className="p-2 rounded-xl bg-accent/10 text-accent border border-accent/20 flex items-center justify-center font-sans"
        title="Transcribing your recording..."
        aria-label="Transcribing your recording"
        aria-busy="true"
      >
        <Loader2 className="h-4 w-4 animate-spin" />
      </button>
    );
  }

  if (isRecording) {
    return (
      <button
        type="button"
        onClick={onStop}
        className="p-2 rounded-xl bg-destructive/10 text-destructive border border-destructive/30 animate-pulse flex items-center justify-center font-sans shadow-glow-vermilion"
        title="Stop recording"
        aria-label="Stop recording"
      >
        <MicOff className="h-4 w-4" />
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={onStart}
      disabled={disabled}
      className="p-2 rounded-xl bg-secondary hover:bg-primary/10 text-muted-foreground hover:text-primary border border-border hover:border-primary/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center font-sans"
      title="Speak instead of typing"
      aria-label="Speak instead of typing"
    >
      <Mic className="h-4 w-4" />
    </button>
  );
}
