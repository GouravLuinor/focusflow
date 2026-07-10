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
        className="p-2 rounded-lg bg-[#D97706]/10 text-[#D97706] border border-[#D97706]/20"
        title="Transcribing..."
      >
        <Loader2 className="h-5 w-5 animate-spin" />
      </button>
    );
  }

  if (isRecording) {
    return (
      <button
        type="button"
        onClick={onStop}
        className="p-2 rounded-lg bg-red-50 text-red-500 border border-red-200 animate-pulse"
        title="Stop recording"
      >
        <MicOff className="h-5 w-5" />
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={onStart}
      disabled={disabled}
      className="p-2 rounded-lg bg-[#FAF9F7] hover:bg-[#4F46E5]/10 text-[#6B6660] hover:text-[#4F46E5] border border-[#E8E6E1] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      title="Record voice input"
    >
      <Mic className="h-5 w-5" />
    </button>
  );
}
