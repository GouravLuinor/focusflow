import { useState, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { CheckCircle2, Lock, Check, Plus, X, Edit3, Trash2, Play, Pause } from 'lucide-react';
import { cn } from '@/lib/utils';
import { apiRequest } from '@/lib/api';
import { AddDependencyDialog } from './AddDependencyDialog';
import { EditTaskDialog } from '@/components/dashboard/EditTaskDialog';
import { DeleteTaskDialog } from '@/components/dashboard/DeleteTaskDialog';

export interface TaskItem {
  id: number;
  title: string;
  description?: string | null;
  estimated_minutes?: number | null;
  priority?: string | null;
  goal_id?: number | null;
  status: 'completed' | 'active' | 'ready' | 'blocked' | 'paused' | 'cancelled';
  subtasks?: string[];
  blockedBy?: string[];
  unlocks?: string[];
  waitingFor?: string[];
}

interface WorkflowTaskCardProps {
  task: TaskItem;
  allGoalTasks: any[];
  goalId: number;
}

export function WorkflowTaskCard({ task, allGoalTasks, goalId }: WorkflowTaskCardProps) {
  const queryClient = useQueryClient();

  const [localStatus, setLocalStatus] = useState<TaskItem['status']>(task.status);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [showAddDep, setShowAddDep] = useState(false);
  const [showEditTask, setShowEditTask] = useState(false);
  const [showDeleteTask, setShowDeleteTask] = useState(false);

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

  const dependencies = depsData?.map((d) => {
    const matched = allGoalTasks.find((gt) => gt.id === d.depends_on_task_id);
    return {
      id: d.depends_on_task_id,
      title: matched ? matched.title : `Task #${d.depends_on_task_id}`,
    };
  }) || [];

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

      if (newStatus === 'COMPLETED') {
        setLocalStatus('completed');
      } else if (newStatus === 'PAUSED') {
        setLocalStatus('paused');
      } else if (newStatus === 'IN_PROGRESS') {
        setLocalStatus('active');
      }

      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['tasks', 'executable'] });
      queryClient.invalidateQueries({ queryKey: ['tasks', 'goal', goalId.toString()] });
      queryClient.invalidateQueries({ queryKey: ['schedule'] });
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
      queryClient.invalidateQueries({ queryKey: ['task', task.id, 'dependencies'] });
      queryClient.invalidateQueries({ queryKey: ['tasks', 'goal', goalId.toString()] });
      queryClient.invalidateQueries({ queryKey: ['tasks', 'executable'] });
      queryClient.invalidateQueries({ queryKey: ['schedule'] });
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to remove dependency');
    }
  };

  const existingDepIds = dependencies.map((d) => d.id);

  // Status strip styling
  const statusStripColors = {
    completed: 'bg-success',
    active: 'bg-primary shadow-glow-vermilion',
    ready: 'bg-primary',
    blocked: 'bg-accent',
    paused: 'bg-muted-foreground',
    cancelled: 'bg-muted-foreground',
  };

  const stripColor = statusStripColors[localStatus] || 'bg-border';

  return (
    <div
      className={cn(
        "bg-card rounded-2xl border border-border overflow-hidden transition-all duration-200 flex font-sans shadow-soft group",
        localStatus === 'completed' && "opacity-70",
        localStatus === 'blocked' && "opacity-60",
        localStatus === 'active' && "scale-[1.01] border-primary/40"
      )}
    >
      {/* 3px Status Strip */}
      <div className={cn("w-1.5 shrink-0 transition-colors", stripColor)} />

      <div className="p-5 flex-1 flex flex-col gap-3">
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h3
                className={cn(
                  "text-base font-semibold leading-tight font-sans text-foreground",
                  localStatus === 'completed' && "text-muted-foreground line-through"
                )}
              >
                {task.title}
              </h3>
              {task.estimated_minutes && (
                <span className="text-[11px] text-muted-foreground font-medium bg-secondary px-2 py-0.5 rounded-md">
                  {task.estimated_minutes}m
                </span>
              )}
            </div>

            {/* Dependency management tags */}
            <div className="flex flex-wrap gap-1.5 items-center mt-2.5">
              {dependencies.map((dep) => (
                <span
                  key={dep.id}
                  className="bg-accent/10 text-accent text-xs font-medium px-2 py-0.5 rounded-lg flex items-center gap-1 border border-accent/20"
                >
                  Blocked by: {dep.title}
                  <button
                    type="button"
                    onClick={() => handleRemoveDependency(dep.id)}
                    className="hover:text-destructive shrink-0 ml-0.5"
                    title="Remove dependency"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}

              {dependents.map((dep) => (
                <span
                  key={dep.id}
                  className="bg-secondary text-foreground text-xs font-medium px-2 py-0.5 rounded-lg border border-border"
                >
                  Unlocks: {dep.title}
                </span>
              ))}

              {localStatus !== 'completed' && localStatus !== 'cancelled' && (
                <button
                  type="button"
                  onClick={() => setShowAddDep(true)}
                  className="text-xs font-medium text-primary hover:underline inline-flex items-center gap-0.5 ml-1"
                >
                  <Plus className="w-3 h-3" />
                  Add dependency
                </button>
              )}
            </div>
          </div>

          {/* Right Action Icons & Status */}
          <div className="flex items-center gap-1.5 shrink-0 ml-3">
            <button
              onClick={() => setShowEditTask(true)}
              className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
              title="Edit Task"
            >
              <Edit3 className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setShowDeleteTask(true)}
              className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
              title="Delete Task"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>

            {localStatus === 'completed' && (
              <CheckCircle2 className="w-5 h-5 text-success ml-1" />
            )}
            {localStatus === 'blocked' && (
              <Lock className="w-4 h-4 text-accent ml-1" />
            )}
          </div>
        </div>

        {/* Subtasks */}
        {task.subtasks && task.subtasks.length > 0 && (
          <div className="flex flex-wrap gap-3 text-xs text-muted-foreground mt-1">
            {task.subtasks.map((sub, i) => (
              <span key={i} className="flex items-center gap-1">
                <Check className="w-3.5 h-3.5 text-success" />
                {sub}
              </span>
            ))}
          </div>
        )}

        {/* Action button bar */}
        <div className="flex gap-2 justify-end mt-1 pt-2 border-t border-border/40">
          {localStatus === 'ready' && (
            <button
              onClick={() => handleStatusTransition('IN_PROGRESS')}
              disabled={isTransitioning}
              className="bg-primary hover:bg-primary/90 text-primary-foreground px-3.5 py-1.5 rounded-xl text-xs font-medium transition-all shadow-glow-vermilion flex items-center gap-1"
            >
              <Play className="w-3 h-3 fill-current" />
              {isTransitioning ? 'Starting...' : 'Start'}
            </button>
          )}

          {localStatus === 'active' && (
            <>
              <button
                onClick={() => handleStatusTransition('PAUSED')}
                disabled={isTransitioning}
                className="border border-border text-foreground hover:bg-secondary px-3 py-1.5 rounded-xl text-xs font-medium transition-colors flex items-center gap-1"
              >
                <Pause className="w-3 h-3" />
                {isTransitioning ? 'Pausing...' : 'Pause'}
              </button>
              <button
                onClick={() => handleStatusTransition('COMPLETED')}
                disabled={isTransitioning}
                className="bg-success hover:bg-success/90 text-success-foreground px-3.5 py-1.5 rounded-xl text-xs font-medium transition-colors flex items-center gap-1"
              >
                <Check className="w-3 h-3" />
                {isTransitioning ? 'Completing...' : 'Complete'}
              </button>
            </>
          )}

          {localStatus === 'paused' && (
            <button
              onClick={() => handleStatusTransition('IN_PROGRESS')}
              disabled={isTransitioning}
              className="bg-primary hover:bg-primary/90 text-primary-foreground px-3.5 py-1.5 rounded-xl text-xs font-medium transition-all shadow-glow-vermilion flex items-center gap-1"
            >
              <Play className="w-3 h-3 fill-current" />
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

      <EditTaskDialog
        open={showEditTask}
        onClose={() => setShowEditTask(false)}
        task={task}
        onDeleteRequest={() => {
          setShowEditTask(false);
          setShowDeleteTask(true);
        }}
      />

      <DeleteTaskDialog
        open={showDeleteTask}
        onClose={() => setShowDeleteTask(false)}
        taskId={task.id}
        taskTitle={task.title}
        goalId={goalId}
      />
    </div>
  );
}
