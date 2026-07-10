import { useState } from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { CreateTaskDialog } from './CreateTaskDialog';

interface PostponedTask {
  id: number;
  title: string;
  postponement_count: number;
  goal_id?: number | null;
}

interface PostponementNudgeProps {
  task: PostponedTask;
  onDismiss: () => void;
}

export function PostponementNudge({ task, onDismiss }: PostponementNudgeProps) {
  const [showCreateTask, setShowCreateTask] = useState(false);

  return (
    <div className="bg-[#FFFBEB] border-l-4 border-[#D97706] rounded-xl p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 font-sans shadow-sm mb-6 transition-all duration-300">
      <div className="flex gap-3">
        <div className="text-[#D97706] shrink-0 mt-0.5">
          <AlertCircle className="w-5 h-5" />
        </div>
        <div>
          <h4 className="text-[14px] font-semibold text-[#1A1A1A]">
            "{task.title}" has been postponed {task.postponement_count} times.
          </h4>
          <p className="text-[12px] text-[#6B6660] mt-0.5">
            Would you like to break it into smaller tasks?
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3 shrink-0">
        <button
          onClick={onDismiss}
          className="text-[12px] font-medium text-[#6B6660] hover:text-[#1A1A1A] transition-colors"
        >
          Dismiss
        </button>
        <button
          onClick={() => setShowCreateTask(true)}
          className="bg-[#D97706] hover:bg-[#b45309] text-white text-[12px] font-semibold py-2 px-4 rounded-lg flex items-center gap-1.5 transition-colors shadow-sm"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Break it down
        </button>
      </div>

      <CreateTaskDialog
        open={showCreateTask}
        onClose={() => setShowCreateTask(false)}
        defaultGoalId={task.goal_id || undefined}
        defaultParentTaskId={task.id}
        defaultTitle={`Subtask for ${task.title}`}
      />
    </div>
  );
}
