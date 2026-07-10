import { useState, useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { AlertCircle, Plus } from 'lucide-react';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { apiRequest } from '@/lib/api';

interface AddDependencyDialogProps {
  open: boolean;
  onClose: () => void;
  taskId: number;
  goalId: number;
  allGoalTasks: any[];
  existingDependencies: number[];
}

export function AddDependencyDialog({
  open,
  onClose,
  taskId,
  goalId,
  allGoalTasks,
  existingDependencies,
}: AddDependencyDialogProps) {
  const queryClient = useQueryClient();
  const [selectedTaskId, setSelectedTaskId] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Filter tasks to show candidates
  const candidates = allGoalTasks.filter(
    (t) => t.id !== taskId && !existingDependencies.includes(t.id)
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTaskId) {
      setError('Please select a task');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      await apiRequest(`/tasks/${taskId}/dependencies`, {
        method: 'POST',
        body: JSON.stringify({
          depends_on_task_id: parseInt(selectedTaskId, 10),
        }),
      });

      setSelectedTaskId('');
      // Invalidate the task's own dependency list so the "Blocked by" badge appears immediately
      queryClient.invalidateQueries({ queryKey: ['task', taskId, 'dependencies'] });
      // Invalidate active goals and goal details tasks list queries
      queryClient.invalidateQueries({ queryKey: ['tasks', 'goal', goalId.toString()] });
      queryClient.invalidateQueries({ queryKey: ['tasks', 'executable'] });
      queryClient.invalidateQueries({ queryKey: ['schedule'] });

      onClose();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Failed to add dependency (possible circular dependency detected)'
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Reset form and error states when the dialog is closed
  useEffect(() => {
    if (!open) {
      setSelectedTaskId('');
      setError(null);
    }
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={(val) => { if (!val) onClose(); }}>
      <DialogContent className="max-w-md bg-white border border-[#E8E6E1] p-6 rounded-2xl font-sans text-[#1A1A1A]">
        <DialogHeader className="mb-4">
          <DialogTitle className="text-[20px] font-semibold text-[#1A1A1A]">
            Add Task Dependency
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {error && (
            <div className="flex items-center gap-2 p-3 bg-[#D97706]/10 text-[#D97706] rounded-lg text-[14px]">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="flex flex-col gap-2">
            <label className="text-[12px] font-medium text-[#6B6660]" htmlFor="dep-select">
              This task depends on:
            </label>
            {candidates.length === 0 ? (
              <p className="text-[14px] text-[#9E988E] italic py-2">
                No other valid tasks available to select as dependency.
              </p>
            ) : (
              <select
                id="dep-select"
                disabled={isLoading}
                value={selectedTaskId}
                onChange={(e) => setSelectedTaskId(e.target.value)}
                className="w-full bg-white border border-[#E8E6E1] focus:border-[#4F46E5] focus:ring-[#4F46E5] rounded-lg p-3 text-[14px] outline-none transition-all focus:ring-1"
              >
                <option value="">-- Select a Task --</option>
                {candidates.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.title}
                  </option>
                ))}
              </select>
            )}
          </div>

          <div className="flex gap-3 justify-end mt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="px-4 py-2.5 border border-[#E8E6E1] text-[#6B6660] hover:bg-[#FAF9F7] rounded-lg text-[14px] font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading || candidates.length === 0}
              className="px-5 py-2.5 bg-[#4F46E5] hover:bg-[#4338ca] text-white rounded-lg text-[14px] font-medium flex items-center justify-center gap-1.5 transition-colors disabled:opacity-50"
            >
              {isLoading ? (
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <Plus className="w-4 h-4" />
                  Add Dependency
                </>
              )}
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
