import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useQueryClient } from '@tanstack/react-query';
import { ScheduleBlockCard, type ScheduleBlock } from './ScheduleBlockCard';
import { PostponementNudge } from './PostponementNudge';
import { useApp } from '@/contexts/AppContext';
import { apiRequest } from '@/lib/api';

interface TodaysPlanSectionProps {
  blocks: ScheduleBlock[];
  tasks?: any[];
  availableMinutes?: number;
}

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 300, damping: 24 } },
};

export function TodaysPlanSection({ blocks, tasks = [], availableMinutes }: TodaysPlanSectionProps) {
  const { supportMode } = useApp();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [dismissedTaskIds, setDismissedTaskIds] = useState<number[]>([]);
  const [showAll, setShowAll] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGeneratePlan = async () => {
    setIsGenerating(true);
    try {
      const minutes = availableMinutes || 90;
      await apiRequest('/schedule/generate', {
        method: 'POST',
        body: JSON.stringify({
          available_minutes: minutes,
          save_plan: true,
          start_time: new Date().toISOString(),
        }),
      });
      queryClient.invalidateQueries({ queryKey: ['schedule'] });
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to generate plan');
    } finally {
      setIsGenerating(false);
    }
  };

  // ADHD mode limits visible tasks to 3 to reduce cognitive load
  const displayBlocks = supportMode === 'adhd' 
    ? blocks.slice(0, 3) 
    : (showAll ? blocks : blocks.slice(0, 5));

  // Find most postponed task
  const nudgeTask = tasks
    .filter((t) => t.postponement_count >= 2 && !dismissedTaskIds.includes(t.id))
    .sort((a, b) => b.postponement_count - a.postponement_count)[0];

  return (
    <section>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-[20px] font-medium text-[#1A1A1A] dark:text-dark-text-primary font-sans">
          Today
        </h3>
        <div className="flex items-center gap-3">
          {blocks.length > 0 && (
            <button
              onClick={handleGeneratePlan}
              disabled={isGenerating}
              className="text-[12px] font-medium text-[#4F46E5] hover:underline font-sans disabled:opacity-50"
            >
              {isGenerating ? 'Regenerating...' : 'Regenerate Plan'}
            </button>
          )}
          <button 
            onClick={() => navigate('/schedule')}
            className="text-[12px] font-medium text-[#4F46E5] hover:underline font-sans"
          >
            Edit plan
          </button>
        </div>
      </div>

      {nudgeTask && (
        <PostponementNudge
          task={nudgeTask}
          onDismiss={() => setDismissedTaskIds((prev) => [...prev, nudgeTask.id])}
        />
      )}

      {blocks.length === 0 ? (
        <div className="bg-white dark:bg-dark-surface border border-[#E8E6E1] dark:border-dark-border rounded-xl p-8 text-center flex flex-col items-center gap-4 shadow-sm">
          <p className="text-[14px] text-[#9E988E] dark:text-dark-text-secondary font-sans">
            No sessions planned yet — generate a plan to get started.
          </p>
          <button
            onClick={handleGeneratePlan}
            disabled={isGenerating}
            className="bg-[#4F46E5] hover:bg-[#4338ca] text-white text-[14px] font-medium py-2.5 px-6 rounded-lg transition-colors flex items-center gap-2 shadow-[0_4px_14px_0_rgba(79,70,229,0.3)] disabled:opacity-50"
          >
            {isGenerating ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Generating...
              </>
            ) : (
              "Generate Today's Plan"
            )}
          </button>
        </div>
      ) : (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="flex flex-col gap-4"
        >
          {displayBlocks.map((block) => (
            <motion.div key={block.id} variants={itemVariants}>
              <ScheduleBlockCard block={block} />
            </motion.div>
          ))}
        </motion.div>
      )}

      {blocks.length > 5 && supportMode !== 'adhd' && (
        <div className="flex justify-center mt-4">
          <button
            onClick={() => setShowAll(!showAll)}
            className="text-[12px] font-medium text-[#4F46E5] hover:underline transition-opacity font-sans"
          >
            {showAll ? 'Show less' : `View all tasks (${blocks.length})`}
          </button>
        </div>
      )}
    </section>
  );
}
