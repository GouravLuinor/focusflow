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
      className="w-full bg-[#e2dfff] text-[#0f0069] flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-[20px] font-medium hover:scale-[1.02] transition-transform duration-200 border border-[#c3c0ff] font-sans disabled:opacity-50"
    >
      <Sparkles className="w-5 h-5 shrink-0" />
      {isLoading ? 'Decomposing...' : 'AI Decompose'}
    </button>
  );
}
