import { Target, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

interface GoalEmptyStateProps {
  /** Callback to trigger AI decomposition */
  onDecompose: () => void;
  /** Callback to trigger manual task creation modal */
  onAddManual: () => void;
}

export function GoalEmptyState({ onDecompose, onAddManual }: GoalEmptyStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="flex-1 flex flex-col items-center justify-center text-center max-w-md mx-auto font-sans"
    >
      {/* Illustration Placeholder */}
      <div className="w-48 h-48 mb-8 rounded-full bg-white border border-[#E8E6E1] flex items-center justify-center shadow-[0_0_40px_rgba(79,70,229,0.05)] shrink-0">
        <Target className="w-16 h-16 text-[#4F46E5] opacity-55" />
      </div>

      <h3 className="text-[24px] font-medium text-[#1A1A1A] mb-3">
        No tasks yet
      </h3>
      <p className="text-[16px] text-[#6B6660] mb-10 leading-relaxed">
        Break down your goal into actionable steps to get started. You can do this manually or let AI help you structure it.
      </p>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-4 w-full">
        <button
          onClick={onDecompose}
          className="flex-1 bg-[#4F46E5] hover:bg-[#4338ca] text-white py-4 px-6 rounded-lg text-[18px] font-medium flex items-center justify-center gap-2 hover:scale-[1.01] transition-all duration-200 shadow-[0_4px_14px_0_rgba(79,70,229,0.39)]"
        >
          <Sparkles className="w-5 h-5 shrink-0" />
          Decompose with AI
        </button>
        <button
          onClick={onAddManual}
          className="flex-1 bg-transparent text-[#4F46E5] border-2 border-[#4F46E5] py-4 px-6 rounded-lg text-[18px] font-medium flex items-center justify-center hover:bg-[#4F46E5]/5 transition-colors duration-200"
        >
          Add task manually
        </button>
      </div>
    </motion.div>
  );
}
