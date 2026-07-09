import { useNavigate } from 'react-router-dom';
import { Clock, Check, Database, Code, BookOpen, GraduationCap, ClipboardList } from 'lucide-react';
import { motion } from 'framer-motion';

export interface ScoredTask {
  task_id: number;
  title: string;
  total_score: number;
  estimated_minutes?: number;
  priority?: string;
  reasons: string[];
  score_components?: Record<string, { score: number; reason: string }>;
}

interface NextBestActionCardProps {
  task: ScoredTask;
}

function getTaskIcon(title: string) {
  const t = title.toLowerCase();
  if (t.includes('sql') || t.includes('database') || t.includes('db') || t.includes('query')) {
    return Database;
  }
  if (t.includes('code') || t.includes('programming') || t.includes('dev') || t.includes('pr') || t.includes('react')) {
    return Code;
  }
  if (t.includes('read') || t.includes('book') || t.includes('study') || t.includes('system design')) {
    return BookOpen;
  }
  if (t.includes('exam') || t.includes('test') || t.includes('preparation') || t.includes('school')) {
    return GraduationCap;
  }
  return ClipboardList;
}

export function NextBestActionCard({ task }: NextBestActionCardProps) {
  const navigate = useNavigate();
  const priority = task.priority ?? 'medium';
  const reasons = task.reasons?.slice(0, 3) ?? [];
  const TaskIcon = getTaskIcon(task.title);

  return (
    <section>
      <h3 className="text-[12px] font-medium text-[#9E988E] uppercase tracking-wider mb-4 font-sans">
        Next Best Action
      </h3>

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2, ease: 'easeOut' }}
        className="bg-white rounded-xl border border-[#E8E6E1] overflow-hidden flex shadow-[0_0_0_2px_rgba(79,70,229,0.15)] hover:scale-[1.01] transition-transform duration-200"
      >
        {/* Status Strip */}
        <div className="w-[4px] bg-[#4F46E5] shrink-0" />

        <div className="p-5 flex-1 flex flex-col gap-4">
          <div className="flex justify-between items-start">
            <div>
              <h4 className="text-[20px] font-medium text-[#1A1A1A] mb-1 tracking-tight leading-tight font-sans">
                {task.title}
              </h4>
              <div className="flex items-center gap-2 text-[14px] text-[#6B6660] font-sans">
                <Clock className="w-4 h-4 text-[#6B6660]" />
                <span>{task.estimated_minutes ?? 45} min</span>
                <span className="text-[#E8E6E1] mx-1">•</span>
                <span className="text-[#4F46E5] font-medium capitalize">
                  {priority} Priority
                </span>
              </div>
            </div>
            <div className="w-12 h-12 rounded-full bg-[#FAF9F7] border border-[#E8E6E1]/20 flex items-center justify-center text-[#4F46E5] shrink-0">
              <TaskIcon className="w-[24px] h-[24px]" />
            </div>
          </div>

          {reasons.length > 0 && (
            <div className="bg-[#FAF9F7] rounded-lg p-4 mt-2">
              <p className="text-[12px] font-medium text-[#6B6660] mb-2 font-sans">
                Recommended because:
              </p>
              <ul className="space-y-2">
                {reasons.map((reason, i) => (
                  <li key={i} className="flex items-start gap-3 text-[14px] text-[#1A1A1A] font-sans">
                    <Check className="w-4 h-4 text-[#4F46E5] mt-0.5 shrink-0" />
                    <span>{reason}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <button
            onClick={() => navigate('/focus')}
            className="mt-2 w-full bg-[#4F46E5] hover:bg-[#4338ca] text-white font-medium py-4 rounded-lg transition-colors shadow-[0_4px_14px_0_rgba(79,70,229,0.39)] text-[18px] font-sans"
          >
            Start Focus
          </button>
        </div>
      </motion.div>
    </section>
  );
}
