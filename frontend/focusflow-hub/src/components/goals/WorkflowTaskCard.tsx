import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { CheckCircle2, Lock, Check, Plus, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { apiRequest } from '@/lib/api';
import { AddDependencyDialog } from './AddDependencyDialog';

export interface TaskItem {
  id: number;
  title: string;
  status: 'completed' | 'active' | 'ready' | 'blocked' | 'paused' | 'cancelled';
  subtasks?: string[];
  blockedBy?: string;
  unlocks?: string;
  waitingFor?: string[];
}

interface WorkflowTaskCardProps {
  task: TaskItem;
  allGoalTasks: any[];
  goalId: number;
}

export function WorkflowTaskCard({ task, allGoalTasks, goalId }: WorkflowTaskCardProps) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [localStatus, setLocalStatus] = useState<TaskItem['status']>(task.status);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [showAddDep, setShowAddDep] = useState(false);

  // Sync state with prop updates
  useEffect(() => {
    setLocalStatus(task.status);
  }, [task.status]);

  // Fetch dependencies and dependents
  const { data: depsData } = useQuery<any[]>({
    queryKey: ['task', task.id, 'dependencies'],
    queryFn: () => apiRequest(`/tasks/${task.id}/dependencies`),
  });

  const { data: dependentsData } = useQuery<any[]>({
    queryKey: ['task', task.id, 'dependents'],
    queryFn: () => apiRequest(`/tasks/${task.id}/dependents`),
  });

  // Map dependencies to their titles using allGoalTasks
  const dependencies = depsData?.map((d) => {
    const matched = allGoalTasks.find((gt) => gt.id === d.depends_on_task_id);
    return {
      id: d.depends_on_task_id,
      title: matched ? matched.title : `Task #${d.depends_on_task_id}`,
    };
  }) || [];

  // Map dependents to their titles using allGoalTasks
  const dependents = dependentsData?.map((d) => {
    const matched = allGoalTasks.find((gt) => gt.id === d.task_id);
    return {
      id: d.task_id,
      title: matched ? matched.title : `Task #${d.task_id}`,
    };
  }) || [];

  const handleStatusTransition = async (newStatus: 'IN_PROGRESS' | 'COMPLETED' | 'PAUSED') => {
    setIsTransitioning(true);
    try {
      const payload: Record<string, any> = {
        status: newStatus,
        is_completed: newStatus === 'COMPLETED',
      };

      await apiRequest(`/tasks/${task.id}`, {
        method: 'PUT',
        body: JSON.stringify(payload),
      });

      // Update local view status
      if (newStatus === 'COMPLETED') {
        setLocalStatus('completed');
      } else if (newStatus === 'PAUSED') {
        setLocalStatus('paused');
      } else if (newStatus === 'IN_PROGRESS') {
        setLocalStatus('active');
      }

      // Invalidate queries to trigger global updates
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['tasks', 'executable'] });
      queryClient.invalidateQueries({ queryKey: ['tasks', 'goal', goalId.toString()] });
      queryClient.invalidateQueries({ queryKey: ['schedule'] });
      queryClient.invalidateQueries({ queryKey: ['sessions'] });
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to update status');
    } finally {
      setIsTransitioning(false);
    }
  };

  const handleRemoveDependency = async (depId: number) => {
    try {
      await apiRequest(`/tasks/${task.id}/dependencies/${depId}`, {
        method: 'DELETE',
      });
      // Invalidate dependencies, execution schedule, and goal detail tasks queries
      queryClient.invalidateQueries({ queryKey: ['task', task.id, 'dependencies'] });
      queryClient.invalidateQueries({ queryKey: ['tasks', 'goal', goalId.toString()] });
      queryClient.invalidateQueries({ queryKey: ['tasks', 'executable'] });
      queryClient.invalidateQueries({ queryKey: ['schedule'] });
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to remove dependency');
    }
  };

  const existingDepIds = dependencies.map((d) => d.id);

  // Status-specific layout colors
  const statusColors = {
    completed: 'bg-[#059669]',
    active: 'bg-[#4F46E5]',
    ready: 'bg-[#4F46E5]',
    blocked: 'bg-[#D97706]',
    paused: 'bg-[#9E988E]',
    cancelled: 'bg-[#9E988E]',
  };

  const stripColor = statusColors[localStatus] || 'bg-[#E8E6E1]';

  return (
    <div
      className={cn(
        "bg-white rounded-xl border border-[#E8E6E1] overflow-hidden transition-all duration-200 flex font-sans",
        localStatus === 'completed' && "opacity-75",
        localStatus === 'blocked' && "opacity-60",
        localStatus === 'active' && "scale-[1.01] shadow-[0_0_0_2px_rgba(79,70,229,0.15)]"
      )}
    >
      <div className={cn("w-1 shrink-0", stripColor)} />

      <div className="p-5 flex-1 flex flex-col gap-3">
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <h3
              className={cn(
                "text-[18px] font-medium leading-tight mb-1",
                localStatus === 'completed' ? "text-[#6B6660] line-through" : "text-[#1A1A1A]"
              )}
            >
              {task.title}
            </h3>

            {/* Dependency management items list */}
            <div className="flex flex-wrap gap-2 items-center mt-2">
              {dependencies.map((dep) => (
                <span
                  key={dep.id}
                  className="bg-[#D97706]/10 text-[#D97706] text-[12px] font-medium px-2 py-0.5 rounded flex items-center gap-1"
                >
                  Blocked by: {dep.title}
                  <button
                    type="button"
                    onClick={() => handleRemoveDependency(dep.id)}
                    className="hover:text-[#b45309] shrink-0"
                    title="Remove dependency"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}

              {dependents.map((dep) => (
                <span
                  key={dep.id}
                  className="bg-[#e2dfff] text-[#3323cc] text-[12px] font-medium px-2 py-0.5 rounded"
                >
                  Unlocks: {dep.title}
                </span>
              ))}

              {localStatus !== 'completed' && localStatus !== 'cancelled' && (
                <button
                  type="button"
                  onClick={() => setShowAddDep(true)}
                  className="text-[12px] font-medium text-[#4F46E5] hover:underline inline-flex items-center gap-0.5"
                >
                  <Plus className="w-3 h-3" />
                  Add dependency
                </button>
              )}
            </div>
          </div>

          {/* Icon Badge Indicator */}
          <div className="shrink-0 ml-4">
            {localStatus === 'completed' && (
              <CheckCircle2 className="w-5 h-5 text-[#059669] fill-[#059669] text-white" />
            )}
            {localStatus === 'blocked' && (
              <Lock className="w-5 h-5 text-[#D97706]" />
            )}
          </div>
        </div>

        {/* Subtasks view */}
        {task.subtasks && task.subtasks.length > 0 && (
          <div className="flex gap-4 text-[12px] font-medium text-[#9E988E] mt-1">
            {task.subtasks.map((sub, i) => (
              <span key={i} className="flex items-center gap-1">
                <Check className="w-4 h-4 text-[#9E988E]" />
                {sub}
              </span>
            ))}
          </div>
        )}

        {/* Transition actions actions button bar */}
        <div className="flex gap-2 justify-end mt-2">
          {localStatus === 'ready' && (
            <button
              onClick={() => handleStatusTransition('IN_PROGRESS')}
              disabled={isTransitioning}
              className="bg-[#4F46E5] hover:bg-[#4338ca] text-white px-4 py-1.5 rounded-lg text-[12px] font-medium transition-colors"
            >
              {isTransitioning ? 'Starting...' : 'Start'}
            </button>
          )}

          {localStatus === 'active' && (
            <>
              <button
                onClick={() => handleStatusTransition('PAUSED')}
                disabled={isTransitioning}
                className="border border-[#c7c4d8] text-[#4F46E5] hover:bg-[#f5f2ff] px-4 py-1.5 rounded-lg text-[12px] font-medium transition-colors"
              >
                {isTransitioning ? 'Pausing...' : 'Pause'}
              </button>
              <button
                onClick={() => handleStatusTransition('COMPLETED')}
                disabled={isTransitioning}
                className="bg-[#059669] hover:bg-[#047857] text-white px-4 py-1.5 rounded-lg text-[12px] font-medium transition-colors"
              >
                {isTransitioning ? 'Completing...' : 'Complete'}
              </button>
            </>
          )}

          {localStatus === 'paused' && (
            <button
              onClick={() => handleStatusTransition('IN_PROGRESS')}
              disabled={isTransitioning}
              className="bg-[#4F46E5] hover:bg-[#4338ca] text-white px-4 py-1.5 rounded-lg text-[12px] font-medium transition-colors"
            >
              {isTransitioning ? 'Resuming...' : 'Resume'}
            </button>
          )}
        </div>
      </div>

      <AddDependencyDialog
        open={showAddDep}
        onClose={() => setShowAddDep(false)}
        taskId={task.id}
        goalId={goalId}
        allGoalTasks={allGoalTasks}
        existingDependencies={existingDepIds}
      />
    </div>
  );
}
