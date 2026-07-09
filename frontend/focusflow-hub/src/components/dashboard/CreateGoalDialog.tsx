import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { AlertCircle, Calendar, Plus } from 'lucide-react';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { apiRequest } from '@/lib/api';

interface CreateGoalDialogProps {
  open: boolean;
  onClose: () => void;
}

type Priority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';

export function CreateGoalDialog({ open, onClose }: CreateGoalDialogProps) {
  const queryClient = useQueryClient();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<Priority>('MEDIUM');
  const [deadline, setDeadline] = useState('');
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
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

      await apiRequest('/goals/', {
        method: 'POST',
        body: JSON.stringify(payload),
      });

      // Reset form states
      setTitle('');
      setDescription('');
      setPriority('MEDIUM');
      setDeadline('');
      
      // Invalidate queries to refresh dashboard
      queryClient.invalidateQueries({ queryKey: ['goals', 'active'] });
      
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create goal');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(val) => { if (!val) onClose(); }}>
      <DialogContent className="max-w-md bg-white border border-[#E8E6E1] p-6 rounded-2xl font-sans text-[#1A1A1A]">
        <DialogHeader className="mb-4">
          <DialogTitle className="text-[24px] font-semibold text-[#1A1A1A]">
            Create New Goal
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {/* Error Message */}
          {error && (
            <div className="flex items-center gap-2 p-3 bg-[#D97706]/10 text-[#D97706] rounded-lg text-[14px]">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Goal Title */}
          <div className="flex flex-col gap-2">
            <label className="text-[12px] font-medium text-[#6B6660]" htmlFor="goal-title">
              Goal Title <span className="text-[#D97706]">*</span>
            </label>
            <input
              id="goal-title"
              type="text"
              required
              disabled={isLoading}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Prepare for DBMS exam"
              className="w-full border border-[#E8E6E1] focus:border-[#4F46E5] focus:ring-[#4F46E5] rounded-lg p-3 text-[14px] outline-none transition-all focus:ring-1"
            />
          </div>

          {/* Goal Description */}
          <div className="flex flex-col gap-2">
            <label className="text-[12px] font-medium text-[#6B6660]" htmlFor="goal-description">
              Description
            </label>
            <textarea
              id="goal-description"
              disabled={isLoading}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What's this goal about?"
              rows={3}
              className="w-full border border-[#E8E6E1] focus:border-[#4F46E5] focus:ring-[#4F46E5] rounded-lg p-3 text-[14px] outline-none resize-none transition-all focus:ring-1"
            />
          </div>

          {/* Priority */}
          <div className="flex flex-col gap-2">
            <label className="text-[12px] font-medium text-[#6B6660]" htmlFor="goal-priority">
              Priority
            </label>
            <select
              id="goal-priority"
              disabled={isLoading}
              value={priority}
              onChange={(e) => setPriority(e.target.value as Priority)}
              className="w-full bg-white border border-[#E8E6E1] focus:border-[#4F46E5] focus:ring-[#4F46E5] rounded-lg p-3 text-[14px] outline-none transition-all focus:ring-1"
            >
              <option value="LOW">Low</option>
              <option value="MEDIUM">Medium</option>
              <option value="HIGH">High</option>
              <option value="URGENT">Urgent</option>
            </select>
          </div>

          {/* Deadline */}
          <div className="flex flex-col gap-2">
            <label className="text-[12px] font-medium text-[#6B6660]" htmlFor="goal-deadline">
              Deadline (Optional)
            </label>
            <div className="relative">
              <input
                id="goal-deadline"
                type="date"
                disabled={isLoading}
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                className="w-full border border-[#E8E6E1] focus:border-[#4F46E5] focus:ring-[#4F46E5] rounded-lg p-3 text-[14px] outline-none transition-all focus:ring-1"
              />
            </div>
          </div>

          {/* Footer Actions */}
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
              disabled={isLoading}
              className="px-5 py-2.5 bg-[#4F46E5] hover:bg-[#4338ca] text-white rounded-lg text-[14px] font-medium flex items-center justify-center gap-1.5 transition-colors disabled:opacity-50"
            >
              {isLoading ? (
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <Plus className="w-4 h-4" />
                  Create Goal
                </>
              )}
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
