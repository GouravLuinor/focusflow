import { useState } from 'react';
import { motion } from 'framer-motion';
import { ScheduleBlockCard, type ScheduleBlock } from './ScheduleBlockCard';
import { PostponementNudge } from './PostponementNudge';
import { useApp } from '@/contexts/AppContext';

interface TodaysPlanSectionProps {
  blocks: ScheduleBlock[];
  tasks?: any[];
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

export function TodaysPlanSection({ blocks, tasks = [] }: TodaysPlanSectionProps) {
  const { supportMode } = useApp();
  const [dismissedTaskIds, setDismissedTaskIds] = useState<number[]>([]);

  // ADHD mode limits visible tasks to 3 to reduce cognitive load
  const displayBlocks = supportMode === 'adhd' ? blocks.slice(0, 3) : blocks;

  // Find most postponed task
  const nudgeTask = tasks
    .filter((t) => t.postponement_count >= 2 && !dismissedTaskIds.includes(t.id))
    .sort((a, b) => b.postponement_count - a.postponement_count)[0];

  return (
    <section>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-[20px] font-medium text-[#1A1A1A] font-sans">
          Today
        </h3>
        <button className="text-[12px] font-medium text-[#4F46E5] hover:underline font-sans">
          Edit plan
        </button>
      </div>

      {nudgeTask && (
        <PostponementNudge
          task={nudgeTask}
          onDismiss={() => setDismissedTaskIds((prev) => [...prev, nudgeTask.id])}
        />
      )}

      {blocks.length === 0 ? (
        <div className="bg-white rounded-xl border border-[#E8E6E1] p-8 text-center text-[14px] text-[#9E988E] font-sans">
          No sessions planned yet — generate a plan to get started.
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
    </section>
  );
}
