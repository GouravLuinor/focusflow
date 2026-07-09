import { Sparkles, PlusSquare } from 'lucide-react';

interface QuickActionsProps {
  onGenerate: () => void;
  onAddManual: () => void;
  isGenerating?: boolean;
}

export function QuickActions({ onGenerate, onAddManual, isGenerating = false }: QuickActionsProps) {
  return (
    <div className="bg-white border border-[#E8E6E1] rounded-xl p-5 flex flex-col gap-4 font-sans shadow-sm">
      <h3 className="text-[18px] font-medium text-[#1A1A1A]">Plan Adjustments</h3>
      
      {/* Generate Today's Plan */}
      <button
        onClick={onGenerate}
        disabled={isGenerating}
        className="w-full bg-[#4F46E5] hover:bg-[#4338ca] text-white py-4 rounded-xl flex flex-col items-center justify-center gap-1 transition-transform duration-200 hover:scale-[1.01] shadow-sm disabled:opacity-50"
      >
        <div className="flex items-center gap-2 font-bold text-[16px]">
          <Sparkles className="w-5 h-5 shrink-0" />
          {isGenerating ? 'Generating...' : "Generate Today's Plan"}
        </div>
        <span className="text-[12px] opacity-80 font-normal">
          Let FocusFlow recommend what to work on...
        </span>
      </button>

      {/* Add Manual Block */}
      <button
        onClick={onAddManual}
        className="w-full bg-transparent border-2 border-[#4F46E5] text-[#4F46E5] hover:bg-[#4F46E5]/5 py-3 rounded-xl flex items-center justify-center gap-2 transition-transform duration-200 hover:scale-[1.01] text-[14px] font-medium"
      >
        <PlusSquare className="w-4 h-4 shrink-0" />
        Add Manual Block
      </button>
    </div>
  );
}
