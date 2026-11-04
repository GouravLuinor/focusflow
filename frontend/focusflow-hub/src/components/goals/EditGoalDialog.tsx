import { useState, useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { AlertCircle, Save } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { apiRequest } from '@/lib/api';

interface EditGoalDialogProps {
  open: boolean;
  onClose: () => void;
  goal: {
    id: number;
    title: string;
    description?: string | null;
    priority?: string | null;
    deadline?: string | null;
  } | null;
}

type Priority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';

export function EditGoalDialog({ open, onClose, goal }: EditGoalDialogProps) {
  const queryClient = useQueryClient();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<Priority>('MEDIUM');
  const [deadline, setDeadline] = useState('');

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (goal && open) {
      setTitle(goal.title || '');
      setDescription(goal.description || '');
      setPriority((goal.priority as Priority) || 'MEDIUM');
      setDeadline(goal.deadline ? goal.deadline.split('T')[0] : '');
      setError(null);
    }
  }, [goal, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!goal) return;
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
        priority,
        deadline: deadline ? `${deadline}T00:00:00Z` : null,
      };

      await apiRequest(`/goals/${goal.id}`, {
        method: 'PUT',
        body: JSON.stringify(payload),
      });

      queryClient.invalidateQueries({ queryKey: ['goals'] });
      queryClient.invalidateQueries({ queryKey: ['goal', goal.id.toString()] });

      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update goal');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(val) => { if (!val) onClose(); }}>
      <DialogContent className="max-w-md bg-card border border-border p-6 rounded-2xl font-sans text-foreground">
        <DialogHeader className="mb-4">
          <DialogTitle className="text-xl font-semibold text-foreground">
            Edit Goal
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {error && (
            <div className="flex items-center gap-2 p-3 bg-destructive/10 text-destructive rounded-lg text-sm">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-muted-foreground" htmlFor="edit-goal-title">
              Goal Title <span className="text-primary">*</span>
            </label>
            <input
              id="edit-goal-title"
              type="text"
              required
              disabled={isLoading}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-background border border-border focus:border-primary focus:ring-1 focus:ring-primary rounded-xl p-3 text-sm outline-none transition-colors"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-muted-foreground" htmlFor="edit-goal-desc">
              Description
            </label>
            <textarea
              id="edit-goal-desc"
              disabled={isLoading}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full bg-background border border-border focus:border-primary focus:ring-1 focus:ring-primary rounded-xl p-3 text-sm outline-none resize-none transition-colors"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-muted-foreground" htmlFor="edit-goal-priority">
              Priority
            </label>
            <select
              id="edit-goal-priority"
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

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-muted-foreground" htmlFor="edit-goal-deadline">
              Deadline (Optional)
            </label>
            <input
              id="edit-goal-deadline"
              type="date"
              disabled={isLoading}
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
              className="w-full bg-background border border-border focus:border-primary focus:ring-1 focus:ring-primary rounded-xl p-3 text-sm outline-none transition-colors"
            />
          </div>

          <div className="flex gap-2 justify-end mt-4 pt-3 border-t border-border/50">
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
        </form>
      </DialogContent>
    </Dialog>
  );
}
