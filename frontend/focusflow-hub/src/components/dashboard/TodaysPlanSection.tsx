import { motion } from 'framer-motion';
import { ScheduleBlockCard, type ScheduleBlock } from './ScheduleBlockCard';

interface TodaysPlanSectionProps {
  blocks: ScheduleBlock[];
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
  show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } },
};

export function TodaysPlanSection({ blocks }: TodaysPlanSectionProps) {
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
          {blocks.map((block) => (
            <motion.div key={block.id} variants={itemVariants}>
              <ScheduleBlockCard block={block} />
            </motion.div>
          ))}
        </motion.div>
      )}
    </section>
  );
}
