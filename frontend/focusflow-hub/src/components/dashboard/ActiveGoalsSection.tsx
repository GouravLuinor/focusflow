import { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { GoalCard, type Goal } from './GoalCard';
export type { Goal };
import { CreateGoalDialog } from './CreateGoalDialog';

interface ActiveGoalsSectionProps {
  goals: Goal[];
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

export function ActiveGoalsSection({ goals }: ActiveGoalsSectionProps) {
  const navigate = useNavigate();
  const [showCreateGoal, setShowCreateGoal] = useState(false);
  const [showAll, setShowAll] = useState(false);

  const displayGoals = showAll ? goals : goals.slice(0, 3);

  return (
    <section>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-[12px] font-medium text-muted-foreground uppercase tracking-wider font-sans">
          Active Goals
        </h3>
        <button
          data-testid="create-goal-btn"
          onClick={() => setShowCreateGoal(true)}
          className="w-6 h-6 rounded-full bg-primary/10 hover:bg-primary/20 text-primary flex items-center justify-center transition-colors"
          title="Create New Goal"
              aria-label="Create New Goal"
        >
          <Plus className="w-3.5 h-3.5" />
        </button>
      </div>

      {goals.length === 0 ? (
        <div className="bg-card rounded-xl border border-border p-6 text-center text-[14px] text-muted-foreground font-sans">
          No active goals yet.
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="flex flex-col gap-4"
          >
            {displayGoals.map((goal, i) => (
              <GoalCard key={goal.id} goal={goal} index={i} />
            ))}
          </motion.div>

          {goals.length > 3 && (
            <div className="flex justify-center mt-2">
              <button
                onClick={() => setShowAll(!showAll)}
                className="text-[12px] font-medium text-primary hover:underline opacity-80 hover:opacity-100 transition-opacity font-sans"
              >
                {showAll ? 'Show less' : 'View all goals'}
              </button>
            </div>
          )}
        </div>
      )}

      <CreateGoalDialog
        open={showCreateGoal}
        onClose={() => setShowCreateGoal(false)}
      />
    </section>
  );
}
