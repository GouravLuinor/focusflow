import { Sparkles } from 'lucide-react';

interface AIDecomposeButtonProps {
  onClick: () => void;
  isLoading?: boolean;
}

export function AIDecomposeButton({ onClick, isLoading = false }: AIDecomposeButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={isLoading}
      className="w-full bg-primary/15 text-primary flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-[20px] font-medium hover:scale-[1.02] transition-transform duration-200 border border-primary/30 font-sans disabled:opacity-50"
    >
      {isLoading ? (
        <span className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin shrink-0" />
      ) : (
        <Sparkles className="w-5 h-5 shrink-0" />
      )}
      {isLoading ? 'Decomposing...' : 'AI Decompose'}
    </button>
  );
}
