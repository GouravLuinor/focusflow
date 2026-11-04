import { useState, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { AlertCircle, Plus, Loader2, Sparkles } from 'lucide-react';
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
      setDescription('');
      setEstimatedMinutes('');
      setPriority('MEDIUM');
      setError(null);
    }
  }, [open, defaultGoalId, defaultTitle]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Task title is required');
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

  return (
    <Dialog open={open} onOpenChange={(val) => { if (!val) onClose(); }}>
      <DialogContent className="max-w-md bg-card border border-border p-6 rounded-2xl font-sans text-foreground shadow-medium">
        <DialogHeader className="mb-4">
          <DialogTitle className="text-xl font-bold tracking-tight text-foreground">
            Create New Task
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {/* Error Alert */}
          {error && (
            <div className="flex items-center gap-2 p-3 bg-accent/10 text-accent rounded-xl text-xs border border-accent/20">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Task Title */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-muted-foreground" htmlFor="task-title">
              Task Title <span className="text-primary">*</span>
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
                  setRawTranscript(null);
                }}
                placeholder="e.g., Read Distributed Consensus Paper"
                className="w-full bg-background border border-border focus:border-primary rounded-xl p-3 pr-12 text-xs text-foreground outline-none transition-all"
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
                  <span className="text-xs font-medium text-accent flex items-center gap-1">
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    Structuring...
                  </span>
                ) : enhancedStatus === 'success' ? (
                  <span className="text-xs font-medium text-success flex items-center gap-1">
                    ✓ Enhanced
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={handleAIEnhance}
                    className="text-xs font-medium text-primary hover:underline flex items-center gap-1"
                  >
                    <Sparkles className="w-3.5 h-3.5" /> Structure with AI
                  </button>
                )}
                {aiError && (
                  <span className="text-xs text-accent">({aiError})</span>
                )}
              </div>
            )}
            {voiceError && (
              <p className="text-xs text-accent">{voiceError}</p>
            )}
          </div>

          {/* Task Description */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-muted-foreground" htmlFor="task-description">
              Description & Context
            </label>
            <textarea
              id="task-description"
              disabled={isLoading}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What's this task about?"
              rows={3}
              className="w-full bg-background border border-border focus:border-primary rounded-xl p-3 text-xs text-foreground outline-none resize-none transition-all"
            />
          </div>

          {/* Estimated Minutes & Priority Grid */}
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-muted-foreground" htmlFor="task-estimate">
                Estimated Minutes
              </label>
              <input
                id="task-estimate"
                type="number"
                min="1"
                disabled={isLoading}
                value={estimatedMinutes}
                onChange={(e) => setEstimatedMinutes(e.target.value)}
                placeholder="e.g., 25"
                className="w-full bg-background border border-border focus:border-primary rounded-xl p-2.5 text-xs text-foreground outline-none transition-all"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-muted-foreground" htmlFor="task-priority">
                Priority
              </label>
              <select
                id="task-priority"
                data-testid="task-priority-select"
                disabled={isLoading}
                value={priority}
                onChange={(e) => setPriority(e.target.value as Priority)}
                className="w-full bg-background border border-border focus:border-primary rounded-xl p-2.5 text-xs text-foreground outline-none transition-all"
              >
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
                <option value="URGENT">Urgent</option>
              </select>
            </div>
          </div>

          {/* Goal selection dropdown */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-muted-foreground" htmlFor="task-goal">
              Associated Goal
            </label>
            <select
              id="task-goal"
              disabled={isLoading || !!defaultGoalId}
              value={goalId}
              onChange={(e) => setGoalId(e.target.value)}
              className="w-full bg-background border border-border focus:border-primary rounded-xl p-2.5 text-xs text-foreground outline-none transition-all disabled:opacity-60"
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
          <div className="flex gap-2.5 justify-end mt-2 pt-3 border-t border-border/50">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="px-4 py-2 border border-border text-muted-foreground hover:bg-secondary rounded-xl text-xs font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              data-testid="task-submit-btn"
              disabled={isLoading}
              className="px-5 py-2 bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl text-xs font-medium flex items-center justify-center gap-1.5 transition-all shadow-glow-vermilion disabled:opacity-50"
            >
              {isLoading ? (
                <span className="w-3.5 h-3.5 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <Plus className="w-3.5 h-3.5" />
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
