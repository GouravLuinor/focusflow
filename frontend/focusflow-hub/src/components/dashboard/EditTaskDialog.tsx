import { useState, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { AlertCircle, Save, Trash2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { apiRequest } from '@/lib/api';

interface EditTaskDialogProps {
  open: boolean;
  onClose: () => void;
  task: {
    id: number;
    title: string;
    description?: string | null;
    estimated_minutes?: number | null;
    priority?: string | null;
    goal_id?: number | null;
    is_completed?: boolean;
  } | null;
  onDeleteRequest?: (taskId: number) => void;
}

type Priority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';

export function EditTaskDialog({ open, onClose, task, onDeleteRequest }: EditTaskDialogProps) {
  const queryClient = useQueryClient();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [estimatedMinutes, setEstimatedMinutes] = useState('');
  const [priority, setPriority] = useState<Priority>('MEDIUM');
  const [goalId, setGoalId] = useState<string>('');

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch active goals for dropdown
  const { data: goals } = useQuery<any[]>({
    queryKey: ['goals', 'all'],
    queryFn: () => apiRequest('/goals'),
    enabled: open,
  });

  useEffect(() => {
    if (task && open) {
      setTitle(task.title || '');
      setDescription(task.description || '');
      setEstimatedMinutes(task.estimated_minutes ? task.estimated_minutes.toString() : '');
      setPriority((task.priority as Priority) || 'MEDIUM');
      setGoalId(task.goal_id ? task.goal_id.toString() : '');
      setError(null);
    }
  }, [task, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!task) return;
    if (!title.trim()) {
      setError('Title is required');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const payload = {
        title: title.trim(),
        description: description.trim() || null,
        estimated_minutes: estimatedMinutes ? parseInt(estimatedMinutes, 10) : null,
        priority,
        goal_id: goalId ? parseInt(goalId, 10) : null,
      };

      await apiRequest(`/tasks/${task.id}`, {
        method: 'PUT',
        body: JSON.stringify(payload),
      });

      // Invalidate queries to refresh lists
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['schedule'] });
      queryClient.invalidateQueries({ queryKey: ['focus'] });
      if (task.goal_id) {
        queryClient.invalidateQueries({ queryKey: ['tasks', 'goal', task.goal_id.toString()] });
      }
      if (payload.goal_id && payload.goal_id !== task.goal_id) {
        queryClient.invalidateQueries({ queryKey: ['tasks', 'goal', payload.goal_id.toString()] });
      }

      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update task');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(val) => { if (!val) onClose(); }}>
      <DialogContent className="max-w-md bg-card border border-border p-6 rounded-2xl font-sans text-foreground">
        <DialogHeader className="mb-4">
          <DialogTitle className="text-xl font-semibold text-foreground">
            Edit Task
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {error && (
            <div className="flex items-center gap-2 p-3 bg-destructive/10 text-destructive rounded-lg text-sm">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Task Title */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-muted-foreground" htmlFor="edit-task-title">
              Task Title <span className="text-primary">*</span>
            </label>
            <input
              id="edit-task-title"
              type="text"
              required
              disabled={isLoading}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-background border border-border focus:border-primary focus:ring-1 focus:ring-primary rounded-xl p-3 text-sm outline-none transition-colors"
            />
          </div>

          {/* Description */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-muted-foreground" htmlFor="edit-task-desc">
              Description
            </label>
            <textarea
              id="edit-task-desc"
              disabled={isLoading}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full bg-background border border-border focus:border-primary focus:ring-1 focus:ring-primary rounded-xl p-3 text-sm outline-none resize-none transition-colors"
            />
          </div>

          {/* Estimated Time */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-muted-foreground" htmlFor="edit-task-est">
              Estimated Time (Minutes)
            </label>
            <input
              id="edit-task-est"
              type="number"
              min="1"
              disabled={isLoading}
              value={estimatedMinutes}
              onChange={(e) => setEstimatedMinutes(e.target.value)}
              className="w-full bg-background border border-border focus:border-primary focus:ring-1 focus:ring-primary rounded-xl p-3 text-sm outline-none transition-colors"
            />
          </div>

          {/* Priority */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-muted-foreground" htmlFor="edit-task-priority">
              Priority
            </label>
            <select
              id="edit-task-priority"
              disabled={isLoading}
              value={priority}
              onChange={(e) => setPriority(e.target.value as Priority)}
              className="w-full bg-background border border-border focus:border-primary focus:ring-1 focus:ring-primary rounded-xl p-3 text-sm outline-none transition-colors"
            >
              <option value="LOW">Low Priority</option>
              <option value="MEDIUM">Medium Priority</option>
              <option value="HIGH">High Priority</option>
              <option value="URGENT">Urgent Priority</option>
            </select>
          </div>

          {/* Goal Assignment */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-muted-foreground" htmlFor="edit-task-goal">
              Associated Goal
            </label>
            <select
              id="edit-task-goal"
              disabled={isLoading}
              value={goalId}
              onChange={(e) => setGoalId(e.target.value)}
              className="w-full bg-background border border-border focus:border-primary focus:ring-1 focus:ring-primary rounded-xl p-3 text-sm outline-none transition-colors"
            >
              <option value="">None (Standalone Task)</option>
              {goals?.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.title}
                </option>
              ))}
            </select>
          </div>

          {/* Footer Actions */}
          <div className="flex justify-between items-center mt-4 pt-3 border-t border-border/50">
            {onDeleteRequest && task ? (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onDeleteRequest(task.id);
                }}
                className="text-destructive hover:bg-destructive/10 px-3 py-2 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Delete Task
              </button>
            ) : <div />}

            <div className="flex gap-2">
              <button
                type="button"
                onClick={onClose}
                disabled={isLoading}
                className="px-4 py-2 border border-border text-muted-foreground hover:bg-secondary rounded-xl text-sm font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="px-5 py-2 bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl text-sm font-medium flex items-center gap-1.5 transition-colors disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                {isLoading ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
