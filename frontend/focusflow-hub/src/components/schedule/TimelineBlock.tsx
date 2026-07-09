import { AlertCircle, Folder, Coffee, Minus } from 'lucide-react';
import { motion } from 'framer-motion';

export interface BlockItem {
  id: number;
  time: string;
  title: string;
  duration: string;
  priority: string;
  goal: string | null;
  status: string;
}

interface TimelineBlockProps {
  block: BlockItem;
}

export function TimelineBlock({ block }: TimelineBlockProps) {
  const isActive = block.status === 'ACTIVE' || block.status === 'active';
  const isCompleted = block.status === 'COMPLETED' || block.status === 'completed';
  const isMissedOrRescheduled = block.status === 'MISSED' || block.status === 'RESCHEDULED' || block.status === 'rescheduled' || block.status === 'missed';

  // Styles based on status
  const stripColorClass = isCompleted
    ? 'bg-[#059669]'
    : isActive
    ? 'bg-[#4F46E5]'
    : isMissedOrRescheduled
    ? 'bg-[#D97706]'
    : 'bg-[#e3e2e0]';

  const dotColorClass = isCompleted
    ? 'bg-[#059669]'
    : isActive
    ? 'bg-[#4F46E5]'
    : isMissedOrRescheduled
    ? 'bg-[#D97706]'
    : 'bg-[#E8E6E1]';

  const cardShadowClass = isActive
    ? 'shadow-[0_0_15px_rgba(79,70,229,0.15)] border-[#4F46E5]/20'
    : 'border-[#E8E6E1]';

  const opacityClass = isCompleted
    ? 'opacity-70 hover:opacity-100 transition-opacity'
    : block.status === 'upcoming' && block.title.includes('Buffer')
    ? 'opacity-70'
    : 'opacity-100';

  const priorityColorClass = block.priority.toLowerCase().includes('high')
    ? 'text-[#ba1a1a] bg-[#ffdad6]/30'
    : block.priority.toLowerCase().includes('medium')
    ? 'text-[#D97706] bg-[#D97706]/10'
    : 'text-[#6B6660] bg-[#f0ecf9]';

  return (
    <div className={`relative z-10 flex gap-4 mb-4 font-sans ${opacityClass}`}>
      {/* Dot on Timeline */}
      <div className={`w-2.5 h-2.5 rounded-full ${dotColorClass} mt-6 shrink-0 -ml-[24px] outline outline-4 outline-[#FAF9F7]`} />

      {/* Time Label */}
      <div className="text-[#6B6660] text-[12px] font-medium mt-5 shrink-0 w-12">
        {block.time}
      </div>

      {/* Card Detail */}
      <div
        className={`flex-1 bg-white border rounded-xl relative overflow-hidden transition-all duration-200 hover:scale-[1.01] ${cardShadowClass}`}
      >
        <div className={`absolute left-0 top-0 bottom-0 w-[3px] ${stripColorClass}`}></div>
        <div className="p-5 flex flex-col gap-2">
          <div className="flex justify-between items-start">
            <h4 className={`text-[18px] font-medium text-[#1A1A1A] leading-tight ${isCompleted ? 'line-through text-[#6B6660]' : ''}`}>
              {block.title}
            </h4>
            <span className="text-[12px] text-[#6B6660] bg-[#FAF9F7] px-2 py-1 rounded border border-[#E8E6E1]/50 font-medium">
              {block.duration}
            </span>
          </div>

          <div className="flex flex-wrap gap-3 mt-2">
            {block.priority !== 'Flexible' ? (
              <span className={`flex items-center gap-1 text-[12px] font-medium px-2 py-1 rounded ${priorityColorClass}`}>
                {block.priority.toLowerCase().includes('high') ? (
                  <AlertCircle className="w-3.5 h-3.5" />
                ) : (
                  <Minus className="w-3.5 h-3.5" />
                )}
                {block.priority}
              </span>
            ) : (
              <span className="flex items-center gap-1 text-[12px] font-medium text-[#6B6660] bg-[#f0ecf9] px-2 py-1 rounded">
                <Coffee className="w-3.5 h-3.5" />
                Flexible
              </span>
            )}

            {block.goal && (
              <span className="flex items-center gap-1 text-[12px] font-medium text-[#6B6660] bg-[#f0ecf9] px-2 py-1 rounded">
                <Folder className="w-3.5 h-3.5 text-[#9E988E]" />
                {block.goal}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
