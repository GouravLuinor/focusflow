import { useState, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Calendar, Clock, AlertCircle, Plus } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { apiRequest } from '@/lib/api';

interface CreateScheduleBlockDialogProps {
  open: boolean;
  onClose: () => void;
  defaultDate?: string;
  defaultTaskId?: number;
}

export function CreateScheduleBlockDialog({
  open,
  onClose,
  defaultDate,
  defaultTaskId,
}: CreateScheduleBlockDialogProps) {
  const queryClient = useQueryClient();
  const [taskId, setTaskId] = useState<string>('');
  const [date, setDate] = useState<string>('');
  const [startTime, setStartTime] = useState<string>('09:00');
  const [durationMinutes, setDurationMinutes] = useState<string>('30');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch executable/uncompleted tasks
  const { data: tasks } = useQuery<any[]>({
    queryKey: ['tasks', 'schedulable'],
    queryFn: () => apiRequest('/tasks'),
    enabled: open,
  });

  useEffect(() => {
    if (open) {
      if (defaultTaskId) {
        setTaskId(defaultTaskId.toString());
      } else {
        setTaskId('');
      }
      const today = defaultDate || new Date().toISOString().split('T')[0];
      setDate(today);
      setError(null);
    }
  }, [open, defaultDate, defaultTaskId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskId) {
      setError('Please select a task to schedule');
      return;
    }
    if (!date || !startTime) {
      setError('Date and start time are required');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const startDateTime = new Date(`${date}T${startTime}:00`);
      const duration = parseInt(durationMinutes, 10) || 30;
      const endDateTime = new Date(startDateTime.getTime() + duration * 60000);

      const payload = {
        task_id: parseInt(taskId, 10),
        scheduled_start: startDateTime.toISOString(),
        scheduled_end: endDateTime.toISOString(),
      };

      await apiRequest('/schedule/blocks', {
        method: 'POST',
        body: JSON.stringify(payload),
      });

      queryClient.invalidateQueries({ queryKey: ['schedule'] });
      queryClient.invalidateQueries({ queryKey: ['schedule', 'today'] });
      queryClient.invalidateQueries({ queryKey: ['schedule', 'week'] });

      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to schedule task');
    } finally {
      setIsLoading(false);
    }
  };

  const uncompletedTasks = tasks?.filter((t) => !t.is_completed) || [];

  return (
    <Dialog open={open} onOpenChange={(val) => { if (!val) onClose(); }}>
      <DialogContent className="max-w-md bg-card border border-border p-6 rounded-2xl font-sans text-foreground">
        <DialogHeader className="mb-4">
          <DialogTitle className="text-xl font-semibold text-foreground flex items-center gap-2">
            <Calendar className="w-5 h-5 text-primary" />
            Schedule Time Block
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {error && (
            <div className="flex items-center gap-2 p-3 bg-destructive/10 text-destructive rounded-lg text-sm">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Select Task */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-muted-foreground" htmlFor="block-task">
              Task to Schedule <span className="text-primary">*</span>
            </label>
            <select
              id="block-task"
              required
              disabled={isLoading}
              value={taskId}
              onChange={(e) => setTaskId(e.target.value)}
              className="w-full bg-background border border-border focus:border-primary focus:ring-1 focus:ring-primary rounded-xl p-3 text-sm outline-none transition-colors"
            >
              <option value="">Select a task...</option>
              {uncompletedTasks.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.title} {t.estimated_minutes ? `(${t.estimated_minutes}m)` : ''}
                </option>
              ))}
            </select>
          </div>

          {/* Date */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-muted-foreground" htmlFor="block-date">
              Date
            </label>
            <input
              id="block-date"
              type="date"
              required
              disabled={isLoading}
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full bg-background border border-border focus:border-primary focus:ring-1 focus:ring-primary rounded-xl p-3 text-sm outline-none transition-colors"
            />
          </div>

          {/* Start Time and Duration */}
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-muted-foreground" htmlFor="block-start">
                Start Time
              </label>
              <input
                id="block-start"
                type="time"
                required
                disabled={isLoading}
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full bg-background border border-border focus:border-primary focus:ring-1 focus:ring-primary rounded-xl p-3 text-sm outline-none transition-colors"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-muted-foreground" htmlFor="block-duration">
                Duration (Minutes)
              </label>
              <select
                id="block-duration"
                disabled={isLoading}
                value={durationMinutes}
                onChange={(e) => setDurationMinutes(e.target.value)}
                className="w-full bg-background border border-border focus:border-primary focus:ring-1 focus:ring-primary rounded-xl p-3 text-sm outline-none transition-colors"
              >
                <option value="15">15 min</option>
                <option value="25">25 min (Focus block)</option>
                <option value="30">30 min</option>
                <option value="45">45 min</option>
                <option value="60">60 min (1 hr)</option>
                <option value="90">90 min</option>
              </select>
            </div>
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
              <Plus className="w-4 h-4" />
              {isLoading ? 'Scheduling...' : 'Add to Schedule'}
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
