import { Flame, Timer, CheckCircle, Award } from "lucide-react";
import { motion } from "framer-motion";

interface StreakHeroCardProps {
  streakDays: number;
  totalFocusHours: string;
  completionRate: number;
  totalCompletedTasks: number;
}

export function StreakHeroCard({
  streakDays,
  totalFocusHours,
  completionRate,
  totalCompletedTasks,
}: StreakHeroCardProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Streak */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
        className="bg-card border border-border rounded-2xl p-5 shadow-soft flex items-center gap-4"
      >
        <div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shrink-0">
          <Flame className="w-6 h-6 fill-primary" />
        </div>
        <div>
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Current Streak
          </p>
          <div className="flex items-baseline gap-1.5 mt-0.5">
            <span className="text-2xl font-bold text-foreground font-sans">
              {streakDays}
            </span>
            <span className="text-xs text-muted-foreground">{streakDays === 1 ? 'day' : 'days'} in flow</span>
          </div>
        </div>
      </motion.div>

      {/* Focus Time */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2, delay: 0.05 }}
        className="bg-card border border-border rounded-2xl p-5 shadow-soft flex items-center gap-4"
      >
        <div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shrink-0">
          <Timer className="w-6 h-6" />
        </div>
        <div>
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Total Focus Time
          </p>
          <div className="flex items-baseline gap-1.5 mt-0.5">
            <span className="text-2xl font-bold text-foreground font-sans">
              {totalFocusHours}
            </span>
            <span className="text-xs text-muted-foreground">hours logged</span>
          </div>
        </div>
      </motion.div>

      {/* Completion Rate */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2, delay: 0.1 }}
        className="bg-card border border-border rounded-2xl p-5 shadow-soft flex items-center gap-4"
      >
        <div className="w-12 h-12 rounded-xl bg-success/10 border border-success/20 flex items-center justify-center text-success shrink-0">
          <CheckCircle className="w-6 h-6" />
        </div>
        <div>
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Completion Rate
          </p>
          <div className="flex items-baseline gap-1.5 mt-0.5">
            <span className="text-2xl font-bold text-foreground font-sans">
              {completionRate}%
            </span>
            <span className="text-xs text-muted-foreground">success rate</span>
          </div>
        </div>
      </motion.div>

      {/* Tasks Shipped */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2, delay: 0.15 }}
        className="bg-card border border-border rounded-2xl p-5 shadow-soft flex items-center gap-4"
      >
        <div className="w-12 h-12 rounded-xl bg-accent/10 border border-accent/20 flex items-center justify-center text-accent shrink-0">
          <Award className="w-6 h-6" />
        </div>
        <div>
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Tasks Shipped
          </p>
          <div className="flex items-baseline gap-1.5 mt-0.5">
            <span className="text-2xl font-bold text-foreground font-sans">
              {totalCompletedTasks}
            </span>
            <span className="text-xs text-muted-foreground">completed</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
