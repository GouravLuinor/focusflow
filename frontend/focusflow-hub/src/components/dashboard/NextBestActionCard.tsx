import { useNavigate } from 'react-router-dom';
import { Clock, Check, Database, Code, BookOpen, GraduationCap, ClipboardList, Play } from 'lucide-react';
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
  const priority = (task.priority ?? 'medium').toLowerCase();
  const rawReasons = task.reasons?.slice(0, 3) ?? [];
  const reasons = rawReasons.length > 0 ? rawReasons : ["Optimized based on dependencies, energy & timeline"];
  const TaskIcon = getTaskIcon(task.title);

  return (
    <section>
      <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 font-sans">
        Next Best Action
      </h3>

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2, ease: 'easeOut' }}
        className="bg-card rounded-2xl border border-border overflow-hidden flex shadow-soft hover:shadow-medium transition-all duration-200"
      >
        {/* 3px Vermilion Accent Strip */}
        <div className="w-1.5 bg-primary shrink-0" />

        <div className="p-6 flex-1 flex flex-col gap-4">
          <div className="flex justify-between items-start">
            <div>
              <h4 className="text-xl font-semibold text-foreground mb-1 tracking-tight leading-tight font-sans">
                {task.title}
              </h4>
              <div className="flex items-center gap-2 text-xs text-muted-foreground font-sans">
                <Clock className="w-3.5 h-3.5" />
                <span>{task.estimated_minutes ? `~${task.estimated_minutes} min` : 'Estimated: 25 min'}</span>
                <span>•</span>
                <span className="text-primary font-medium capitalize">
                  {priority} Priority
                </span>
              </div>
            </div>
            <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shrink-0">
              <TaskIcon className="w-5 h-5" />
            </div>
          </div>

          {reasons.length > 0 && (
            <div className="bg-secondary/60 rounded-xl p-3.5 border border-border/60">
              <p className="text-[11px] font-semibold text-primary uppercase tracking-wider mb-1.5 font-sans">
                Recommended because:
              </p>
              <ul className="space-y-1">
                {reasons.map((reason, i) => (
                  <li key={i} className="flex items-center gap-2 text-xs text-foreground font-sans">
                    <Check className="w-3.5 h-3.5 text-success shrink-0" />
                    <span>{reason}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <button
            onClick={() => navigate('/focus')}
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-medium py-3 rounded-xl transition-all duration-150 shadow-glow-vermilion text-sm font-sans flex items-center justify-center gap-2 hover:scale-[1.01] active:scale-[0.99]"
          >
            <Play className="w-4 h-4 fill-current" />
            Start Focus
          </button>
        </div>
      </motion.div>
    </section>
  );
}
