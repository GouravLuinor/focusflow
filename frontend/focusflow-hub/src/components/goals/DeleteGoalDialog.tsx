import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { AlertTriangle } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { apiRequest } from '@/lib/api';

interface DeleteGoalDialogProps {
  open: boolean;
  onClose: () => void;
  goalId: number | null;
  goalTitle?: string;
}

export function DeleteGoalDialog({ open, onClose, goalId, goalTitle }: DeleteGoalDialogProps) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDelete = async () => {
    if (!goalId) return;
    setIsLoading(true);
    setError(null);

    try {
      await apiRequest(`/goals/${goalId}`, {
        method: 'DELETE',
      });

      queryClient.invalidateQueries({ queryKey: ['goals'] });
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['schedule'] });

      onClose();
      navigate('/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete goal');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(val) => { if (!val) onClose(); }}>
      <DialogContent className="max-w-sm bg-card border border-border p-6 rounded-2xl font-sans text-foreground">
        <DialogHeader className="flex flex-col items-center text-center gap-2">
          <div className="w-12 h-12 rounded-full bg-destructive/10 text-destructive flex items-center justify-center">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <DialogTitle className="text-lg font-semibold text-foreground">
            Delete Goal?
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            Are you sure you want to delete <span className="font-medium text-foreground">"{goalTitle || 'this goal'}"</span>? All associated task progress and workflow dependencies will be removed.
          </DialogDescription>
        </DialogHeader>

        {error && (
          <p className="text-xs text-destructive text-center">{error}</p>
        )}

        <div className="flex gap-2 justify-end mt-4">
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="flex-1 py-2.5 border border-border text-muted-foreground hover:bg-secondary rounded-xl text-xs font-medium transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleDelete}
            disabled={isLoading}
            className="flex-1 py-2.5 bg-destructive hover:bg-destructive/90 text-destructive-foreground rounded-xl text-xs font-medium transition-colors disabled:opacity-50"
          >
            {isLoading ? 'Deleting...' : 'Delete Goal'}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
