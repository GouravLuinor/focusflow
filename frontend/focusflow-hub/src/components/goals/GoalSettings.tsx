import { useState } from 'react';
import { Edit3, Trash2 } from 'lucide-react';
import { EditGoalDialog } from './EditGoalDialog';
import { DeleteGoalDialog } from './DeleteGoalDialog';

interface GoalSettingsProps {
  goal: {
    id: number;
    title: string;
    description?: string | null;
    priority?: string | null;
    deadline?: string | null;
  } | null;
  status: string;
  priority: string;
  deadline: string;
}

export function GoalSettings({ goal, status, priority, deadline }: GoalSettingsProps) {
  const [showEdit, setShowEdit] = useState(false);
  const [showDelete, setShowDelete] = useState(false);

  return (
    <div className="bg-card rounded-2xl border border-border p-5 font-sans shadow-soft">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-base font-semibold text-foreground">Goal Settings</h2>
        {goal && (
          <div className="flex items-center gap-1">
            <button
              onClick={() => setShowEdit(true)}
              className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
              title="Edit Goal Details"
            >
              <Edit3 className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setShowDelete(true)}
              className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
              title="Delete Goal"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>

      <div className="space-y-3 text-xs">
        {/* Status */}
        <div className="flex justify-between items-center border-b border-border/50 pb-2">
          <span className="text-muted-foreground font-medium">Status</span>
          <span className="bg-primary/10 text-primary px-2 py-0.5 rounded-md font-medium">
            {status}
          </span>
        </div>

        {/* Priority */}
        <div className="flex justify-between items-center border-b border-border/50 pb-2">
          <span className="text-muted-foreground font-medium">Priority</span>
          <span className="text-foreground font-medium">{priority}</span>
        </div>

        {/* Deadline */}
        <div className="flex justify-between items-center">
          <span className="text-muted-foreground font-medium">Deadline</span>
          <span className="text-foreground">{deadline}</span>
        </div>
      </div>

      {goal && (
        <>
          <EditGoalDialog
            open={showEdit}
            onClose={() => setShowEdit(false)}
            goal={goal}
          />
          <DeleteGoalDialog
            open={showDelete}
            onClose={() => setShowDelete(false)}
            goalId={goal.id}
            goalTitle={goal.title}
          />
        </>
      )}
    </div>
  );
}
