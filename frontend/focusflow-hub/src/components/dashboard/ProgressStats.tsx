import { motion } from 'framer-motion';

interface ProgressStatsProps {
  completed: number;
  total: number;
}

export function ProgressStats({ completed, total }: ProgressStatsProps) {
  const percentage = Math.round((completed / total) * 100);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="bg-gradient-to-br from-adhd-secondary/10 to-adhd-primary/5 rounded-3xl p-6 border border-adhd-secondary/20"
    >
      <h3 className="text-lg font-semibold text-foreground mb-4">Today's Progress</h3>

      {/* Circular progress */}
      <div className="flex items-center gap-6">
        <div className="relative w-24 h-24">
          <svg className="w-24 h-24 -rotate-90" viewBox="0 0 100 100">
            <circle
              cx="50"
              cy="50"
              r="45"
              fill="none"
              stroke="hsl(var(--muted))"
              strokeWidth="8"
            />
            <motion.circle
              cx="50"
              cy="50"
              r="45"
              fill="none"
              stroke="url(#adhd-gradient)"
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={283}
              initial={{ strokeDashoffset: 283 }}
              animate={{ strokeDashoffset: 283 - (283 * percentage) / 100 }}
              transition={{ duration: 1, ease: 'easeOut' }}
            />
            <defs>
              <linearGradient id="adhd-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="hsl(var(--adhd-primary))" />
                <stop offset="100%" stopColor="hsl(var(--adhd-secondary))" />
              </linearGradient>
            </defs>
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-2xl font-bold text-foreground">{percentage}%</span>
          </div>
        </div>

        <div>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-3xl font-bold text-adhd-primary"
          >
            {completed}/{total}
          </motion.p>
          <p className="text-muted-foreground">tasks complete</p>
        </div>
      </div>

      {/* Encouragement */}
      {percentage > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mt-4 p-3 bg-adhd-primary/10 rounded-xl"
        >
          <p className="text-sm font-medium text-adhd-primary">
            {percentage >= 100
              ? "🎉 Amazing! You did it!"
              : percentage >= 60
              ? "🔥 You're on fire! Keep going!"
              : percentage >= 20
              ? "💪 Great start! You've got this!"
              : "✨ Every step counts!"}
          </p>
        </motion.div>
      )}
    </motion.div>
  );
}
