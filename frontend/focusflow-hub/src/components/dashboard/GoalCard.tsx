import { motion } from 'framer-motion';
import { GraduationCap, Globe, Briefcase, Trophy } from 'lucide-react';
import { differenceInDays, parseISO } from 'date-fns';

export interface Goal {
  id: number;
  title: string;
  status: string;
  deadline?: string;
  progress?: number;
  completed_tasks?: number;
  total_tasks?: number;
}

interface GoalCardProps {
  goal: Goal;
  index: number;
}

function getGoalIcon(title: string) {
  const t = title.toLowerCase();
  if (t.includes('exam') || t.includes('preparation') || t.includes('dbms') || t.includes('study') || t.includes('school')) {
    return GraduationCap;
  }
  if (t.includes('portfolio') || t.includes('redesign') || t.includes('web') || t.includes('site')) {
    return Globe;
  }
  if (t.includes('career') || t.includes('job') || t.includes('resume') || t.includes('interview')) {
    return Briefcase;
  }
  return Trophy;
}

function computeProgress(goal: Goal): number {
  if (goal.progress !== undefined) return Math.min(100, Math.max(0, goal.progress));
  if (goal.total_tasks && goal.total_tasks > 0) {
    return Math.round(((goal.completed_tasks ?? 0) / goal.total_tasks) * 100);
  }
  return 0;
}

function daysRemaining(deadline?: string): string {
  if (!deadline) return 'No strict deadline';
  try {
    const days = differenceInDays(parseISO(deadline), new Date());
    if (days < 0) return 'Overdue';
    if (days === 0) return 'Due today';
    return `${days} day${days === 1 ? '' : 's'} remaining`;
  } catch {
    return 'No strict deadline';
  }
}

export function GoalCard({ goal, index }: GoalCardProps) {
  const progress = computeProgress(goal);
  const daysLeft = daysRemaining(goal.deadline);
  const GoalIcon = getGoalIcon(goal.title);

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, delay: 0.05 * index, ease: 'easeOut' }}
      className="bg-white rounded-xl border border-[#E8E6E1] p-5 hover:scale-[1.01] transition-transform duration-200"
    >
      <div className="flex justify-between items-start mb-4">
        <div>
          <h4 className="text-[18px] font-medium text-[#1A1A1A] mb-1 font-sans leading-tight">
            {goal.title}
          </h4>
          <p className="text-[14px] text-[#6B6660] font-sans">
            {daysLeft}
          </p>
        </div>
        <GoalIcon className="w-5 h-5 text-[#9E988E] shrink-0" />
      </div>

      <div className="space-y-2">
        <div className="flex justify-between text-[12px] font-medium font-sans">
          <span className="text-[#6B6660]">Progress</span>
          <span className="text-[#4F46E5] font-semibold">{progress}%</span>
        </div>
        <div className="w-full bg-[#f0ecf9] rounded-full h-[6px] overflow-hidden">
          <motion.div
            className="bg-[#4F46E5] h-full rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.5, delay: 0.1 + 0.05 * index }}
          />
        </div>
      </div>
    </motion.div>
  );
}
