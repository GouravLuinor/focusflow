import { useState, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { AlertCircle, Plus, Loader2 } from 'lucide-react';
import { useVoiceInput } from '@/hooks/useVoiceInput';
import { VoiceInputButton } from '@/components/shared/VoiceInputButton';
import { quickParse, aiParse } from '@/lib/voiceParser';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { apiRequest } from '@/lib/api';
import { useApp } from '@/contexts/AppContext';

interface CreateTaskDialogProps {
  open: boolean;
  onClose: () => void;
  defaultGoalId?: number;
  defaultParentTaskId?: number;
  defaultTitle?: string;
}

type Priority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';

export function CreateTaskDialog({
  open,
  onClose,
  defaultGoalId,
  defaultParentTaskId,
  defaultTitle,
}: CreateTaskDialogProps) {
  const { supportMode } = useApp();
  const queryClient = useQueryClient();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [estimatedMinutes, setEstimatedMinutes] = useState('');
  const [priority, setPriority] = useState<Priority>('MEDIUM');
  const [goalId, setGoalId] = useState<string>('');

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    isRecording,
    isProcessing,
    error: voiceError,
    startRecording,
    stopRecording,
  } = useVoiceInput();

  const [rawTranscript, setRawTranscript] = useState<string | null>(null);
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [enhancedStatus, setEnhancedStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [aiError, setAiError] = useState<string | null>(null);

  const handleAIEnhance = async () => {
    if (!rawTranscript) return;
    setIsEnhancing(true);
    setAiError(null);
    setEnhancedStatus('idle');
    try {
      const parsed = await aiParse(rawTranscript);
      if (parsed.title) setTitle(parsed.title);
      if (parsed.estimatedMinutes !== null) {
        setEstimatedMinutes(parsed.estimatedMinutes.toString());
      }
      if (parsed.priority) {
        setPriority(parsed.priority as Priority);
      }
      setEnhancedStatus('success');
      setTimeout(() => {
        setRawTranscript(null);
        setEnhancedStatus('idle');
      }, 1500);
    } catch {
      setEnhancedStatus('error');
      setAiError('AI enhancement unavailable');
    } finally {
      setIsEnhancing(false);
    }
  };

  // Fetch active goals for dropdown selection
  const { data: goals } = useQuery<any[]>({
    queryKey: ['goals', 'active'],
    queryFn: () => apiRequest('/goals?status=ACTIVE'),
    enabled: open,
  });

  // Pre-fill fields if defaults change or dialog opens
  useEffect(() => {
    if (open) {
      if (defaultGoalId) {
        setGoalId(defaultGoalId.toString());
      } else {
        setGoalId('');
      }
      if (defaultTitle) {
        setTitle(defaultTitle);
      } else {
        setTitle('');
      }
      
      // Default estimated time is 25m in ADHD mode
      if (supportMode === 'adhd') {
        setEstimatedMinutes('25');
      } else {
        setEstimatedMinutes('');
      }
    }
  }, [open, defaultGoalId, defaultTitle, supportMode]);

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
        description: description.trim() || '',
        estimated_minutes: estimatedMinutes ? parseInt(estimatedMinutes, 10) : null,
        priority,
        goal_id: goalId ? parseInt(goalId, 10) : null,
        parent_task_id: defaultParentTaskId || null,
      };

      await apiRequest('/tasks/', {
        method: 'POST',
        body: JSON.stringify(payload),
      });

      // Reset form states
      setTitle('');
      setDescription('');
      setEstimatedMinutes('');
      setPriority('MEDIUM');
      setGoalId('');

      // Invalidate queries to refresh lists and timeline
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['tasks', 'executable'] });
      queryClient.invalidateQueries({ queryKey: ['schedule'] });

      // Invalidate the goal detail tasks list if goal_id was specified
      if (payload.goal_id) {
        queryClient.invalidateQueries({ queryKey: ['tasks', 'goal', payload.goal_id.toString()] });
      }

      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create task');
    } finally {
      setIsLoading(false);
    }
  };

  // Reset form and error states when the dialog is closed
  useEffect(() => {
    if (!open) {
      setTitle('');
      setDescription('');
      setEstimatedMinutes('');
      setPriority('MEDIUM');
      setGoalId('');
      setError(null);
      setRawTranscript(null);
      setIsEnhancing(false);
      setEnhancedStatus('idle');
      setAiError(null);
    }
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={(val) => { if (!val) onClose(); }}>
      <DialogContent className="max-w-md bg-white border border-[#E8E6E1] p-6 rounded-2xl font-sans text-[#1A1A1A]">
        <DialogHeader className="mb-4">
          <DialogTitle className="text-[24px] font-semibold text-[#1A1A1A]">
            Create New Task
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {/* Error Alert */}
          {error && (
            <div className="flex items-center gap-2 p-3 bg-[#D97706]/10 text-[#D97706] rounded-lg text-[14px]">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Task Title */}
          <div className="flex flex-col gap-2">
            <label className="text-[12px] font-medium text-[#6B6660]" htmlFor="task-title">
              Task Title <span className="text-[#D97706]">*</span>
            </label>
            <div className="relative">
              <input
                id="task-title"
                data-testid="task-title-input"
                type="text"
                required
                disabled={isLoading || isProcessing}
                value={title}
                onChange={(e) => {
                  setTitle(e.target.value);
                  setRawTranscript(null); // Manual typing clears raw transcript and hides AI button
                }}
                placeholder="e.g., Relational Model Revision"
                className="w-full border border-[#E8E6E1] focus:border-[#4F46E5] focus:ring-[#4F46E5] rounded-lg p-3 pr-12 text-[14px] outline-none transition-all focus:ring-1"
              />
              <div className="absolute right-2 top-1/2 -translate-y-1/2">
                <VoiceInputButton
                  isRecording={isRecording}
                  isProcessing={isProcessing}
                  disabled={isLoading}
                  onStart={startRecording}
                  onStop={async () => {
                    const text = await stopRecording();
                    if (text) {
                      setRawTranscript(text);
                      const parsed = quickParse(text);
                      setTitle(parsed.title);
                      if (parsed.estimatedMinutes !== null) {
                        setEstimatedMinutes(parsed.estimatedMinutes.toString());
                      }
                      if (parsed.priority) {
                        setPriority(parsed.priority as Priority);
                      }
                    }
                  }}
                />
              </div>
            </div>
            {rawTranscript && (
              <div className="flex items-center gap-2 mt-1">
                {isEnhancing ? (
                  <span className="text-[12px] font-medium text-[#D97706] flex items-center gap-1">
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    Enhancing...
                  </span>
                ) : enhancedStatus === 'success' ? (
                  <span className="text-[12px] font-medium text-emerald-600 flex items-center gap-1">
                    ✓ Enhanced
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={handleAIEnhance}
                    className="text-[12px] font-medium text-[#4F46E5] hover:text-[#4338ca] hover:underline flex items-center gap-1"
                  >
                    ✨ Enhance with AI
                  </button>
                )}
                {aiError && (
                  <span className="text-[12px] text-[#D97706]">({aiError})</span>
                )}
              </div>
            )}
            {voiceError && (
              <p className="text-[12px] text-[#D97706]">{voiceError}</p>
            )}
          </div>

          {/* Task Description */}
          <div className="flex flex-col gap-2">
            <label className="text-[12px] font-medium text-[#6B6660]" htmlFor="task-description">
              Description
            </label>
            <textarea
              id="task-description"
              disabled={isLoading}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What's this task about?"
              rows={3}
              className="w-full border border-[#E8E6E1] focus:border-[#4F46E5] focus:ring-[#4F46E5] rounded-lg p-3 text-[14px] outline-none resize-none transition-all focus:ring-1"
            />
          </div>

          {/* Estimated Minutes */}
          <div className="flex flex-col gap-2">
            <label className="text-[12px] font-medium text-[#6B6660]" htmlFor="task-estimate">
              Estimated Time (Minutes)
            </label>
            <input
              id="task-estimate"
              type="number"
              min="1"
              disabled={isLoading}
              value={estimatedMinutes}
              onChange={(e) => setEstimatedMinutes(e.target.value)}
              placeholder="e.g., 30"
              className="w-full border border-[#E8E6E1] focus:border-[#4F46E5] focus:ring-[#4F46E5] rounded-lg p-3 text-[14px] outline-none transition-all focus:ring-1"
            />
          </div>

          {/* Priority */}
          <div className="flex flex-col gap-2">
            <label className="text-[12px] font-medium text-[#6B6660]" htmlFor="task-priority">
              Priority
            </label>
            <select
              id="task-priority"
              data-testid="task-priority-select"
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

          {/* Goal selection dropdown */}
          <div className="flex flex-col gap-2">
            <label className="text-[12px] font-medium text-[#6B6660]" htmlFor="task-goal">
              Associated Goal
            </label>
            <select
              id="task-goal"
              disabled={isLoading || !!defaultGoalId}
              value={goalId}
              onChange={(e) => setGoalId(e.target.value)}
              className="w-full bg-white border border-[#E8E6E1] focus:border-[#4F46E5] focus:ring-[#4F46E5] rounded-lg p-3 text-[14px] outline-none transition-all focus:ring-1 disabled:opacity-60 disabled:cursor-not-allowed"
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
              data-testid="task-submit-btn"
              disabled={isLoading}
              className="px-5 py-2.5 bg-[#4F46E5] hover:bg-[#4338ca] text-white rounded-lg text-[14px] font-medium flex items-center justify-center gap-1.5 transition-colors disabled:opacity-50"
            >
              {isLoading ? (
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <Plus className="w-4 h-4" />
                  Create Task
                </>
              )}
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
