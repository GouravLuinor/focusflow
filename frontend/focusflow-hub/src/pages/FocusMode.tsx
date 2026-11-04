import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { AlertCircle, Play, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';

import { FocusBreadcrumb } from '@/components/focus/FocusBreadcrumb';
import { FocusTaskHeader } from '@/components/focus/FocusTaskHeader';
import { FocusTimer } from '@/components/focus/FocusTimer';
import { FocusCheckpoint, type FocusStep } from '@/components/focus/FocusCheckpoint';
import { FocusActions } from '@/components/focus/FocusActions';
import { apiRequest } from '@/lib/api';
import { useApp } from '@/contexts/AppContext';
import { cn } from '@/lib/utils';

interface BlockingTask {
  id: number;
  title: string;
}

interface UnlocksTask {
  id: number;
  title: string;
}

interface FocusTaskResponse {
  task_id: number;
  title: string;
  description: string;
  status: string;
  priority: string;
  estimated_minutes: number;
  adjusted_estimate_minutes: number;
  estimate_confidence: string;
  progress: {
    subtasks_total: number;
    subtasks_completed: number;
  };
  active_session?: {
    session_id: number;
    started_at: string;
    elapsed_seconds: number;
    status: 'ACTIVE' | 'PAUSED';
  } | null;
  blocking_tasks: BlockingTask[];
  unlocks_tasks: UnlocksTask[];
  available_actions: string[];
  steps?: FocusStep[];
}

interface TaskEstimate {
  original_minutes: number | null;
  adjusted_minutes: number | null;
  sample_count: number;
  confidence: string;
}

function formatTime(totalSeconds: number): string {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  
  const pad = (num: number) => String(num).padStart(2, '0');
  
  if (hours > 0) {
    return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
  }
  return `${pad(minutes)}:${pad(seconds)}`;
}

export default function FocusMode() {
  const navigate = useNavigate();
  const { taskId } = useParams<{ taskId?: string }>();
  const queryClient = useQueryClient();
  const { supportMode, accessibility } = useApp();
  const [isPausing, setIsPausing] = useState(false);
  const [isCompleting, setIsCompleting] = useState(false);

  const [isCompletedState, setIsCompletedState] = useState(false);
  const [isPausedState, setIsPausedState] = useState(false);

  // Fetch executable tasks ONLY if there is no taskId in URL params
  const { data: executableTasks, isLoading: execLoading, error: execError } = useQuery<{ id: number }[]>({
    queryKey: ['tasks', 'executable'],
    queryFn: () => apiRequest('/tasks/executable'),
    enabled: !taskId,
  });

  // Fetch Focus Data via TanStack Query (if taskId exists)
  const { data: focusData, isLoading: focusLoading, error: focusError } = useQuery<FocusTaskResponse>({
    queryKey: ['focus', taskId],
    queryFn: () => apiRequest(`/tasks/${taskId}/focus`),
    enabled: !!taskId,
  });

  // Fetch Estimate Data via TanStack Query (if taskId exists)
  const { data: estimateData } = useQuery<TaskEstimate>({
    queryKey: ['estimate', taskId],
    queryFn: () => apiRequest(`/tasks/${taskId}/estimate`),
    enabled: !!taskId,
  });

  // Redirect to first executable task if taskId is missing
  useEffect(() => {
    if (!taskId) {
      if (executableTasks && executableTasks.length > 0) {
        navigate(`/focus/${executableTasks[0].id}`, { replace: true });
      }
    }
  }, [taskId, executableTasks, navigate]);

  // Session and Timer local state
  const [sessionId, setSessionId] = useState<number | null>(null);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(0);

  // Sync state from server on mount / focusData change
  useEffect(() => {
    const session = focusData?.active_session;
    if (session) {
      const paused = session.status === 'PAUSED';
      setSessionId(session.session_id);
      setElapsedSeconds(session.elapsed_seconds || 0);
      setIsRunning(!paused);
      setIsPaused(paused);
      setIsPausedState(paused);
    } else if (focusData?.status === 'PAUSED') {
      // Task was paused but its session was closed (e.g. abandoned):
      // resuming starts a fresh session.
      setSessionId(null);
      setElapsedSeconds(0);
      setIsPausedState(true);
      setIsPaused(true);
      setIsRunning(false);
    } else {
      setSessionId(null);
      setIsRunning(false);
      setIsPaused(false);
      setElapsedSeconds(0);
      setIsPausedState(false);
    }
  }, [focusData]);

  // Timer Tick Hook
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isRunning && !isPaused) {
      interval = setInterval(() => {
        setElapsedSeconds((prev) => prev + 1);
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRunning, isPaused]);

  // Start Session Action
  const handleStart = async () => {
    if (!taskId) return;
    try {
      const res = await apiRequest('/sessions', {
        method: 'POST',
        body: JSON.stringify({ task_id: parseInt(taskId, 10) }),
      });
      setSessionId(res.id);
      setIsRunning(true);
      setIsPaused(false);
      setIsPausedState(false);
      queryClient.invalidateQueries({ queryKey: ['focus', taskId] });
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to start session');
    }
  };

  // Toggle a step's completion (optimistic, rolled back on failure)
  const [pendingStepId, setPendingStepId] = useState<number | null>(null);
  const handleToggleStep = async (step: FocusStep) => {
    if (!taskId) return;
    const key = ['focus', taskId];
    const previous = queryClient.getQueryData<FocusTaskResponse>(key);
    const nextCompleted = !step.is_completed;

    queryClient.setQueryData<FocusTaskResponse>(key, (old) =>
      old
        ? {
            ...old,
            steps: old.steps?.map((st) => (st.id === step.id ? { ...st, is_completed: nextCompleted } : st)),
          }
        : old
    );
    setPendingStepId(step.id);
    try {
      await apiRequest(`/tasks/${taskId}/steps/${step.id}`, {
        method: 'PUT',
        body: JSON.stringify({ is_completed: nextCompleted }),
      });
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    } catch (err) {
      queryClient.setQueryData(key, previous);
      toast.error(err instanceof Error ? err.message : 'Could not update step');
    } finally {
      setPendingStepId(null);
    }
  };

  // Pause/Resume Session Action
  const handlePauseToggle = async () => {
    if (!sessionId) {
      // No open session to resume — start a new one.
      if (isPaused || isPausedState) await handleStart();
      return;
    }
    setIsPausing(true);
    try {
      if (isPaused || isPausedState) {
        // Resume
        await apiRequest(`/sessions/${sessionId}/resume`, { method: 'POST' });
        setIsPaused(false);
        setIsPausedState(false);
        setIsRunning(true);
      } else {
        // Pause
        await apiRequest(`/sessions/${sessionId}/pause`, { method: 'POST' });
        setIsPaused(true);
        setIsPausedState(true);
        setIsRunning(false);
      }
      queryClient.invalidateQueries({ queryKey: ['focus', taskId] });
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to toggle pause');
    } finally {
      setIsPausing(false);
    }
  };

  // Complete Session Action
  const handleComplete = async () => {
    if (!sessionId || !taskId) return;
    setIsCompleting(true);
    try {
      await apiRequest(`/sessions/${sessionId}/complete`, { method: 'POST' });
      setIsRunning(false);
      setIsPaused(false);
      setIsCompletedState(true);
      queryClient.invalidateQueries({ queryKey: ['focus', taskId] });
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['schedule'] });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to complete session');
    } finally {
      setIsCompleting(false);
    }
  };

  // Task Completion Celebration Screen
  if (isCompletedState) {
    return (
      <div className="h-screen w-screen flex flex-col items-center justify-center bg-background text-foreground p-6 text-center font-sans">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full bg-card border border-border rounded-3xl p-8 shadow-medium flex flex-col items-center"
        >
          <div className="w-16 h-16 rounded-2xl bg-success/10 border border-success/20 flex items-center justify-center text-success mb-6">
            <span className="text-3xl">🎋</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight mb-2">Focus Session Complete!</h1>
          <p className="text-xs text-muted-foreground mb-6">
            Splendid flow session logged. Your adaptive timeline is adjusted.
          </p>
          <button
            onClick={() => navigate('/dashboard')}
            className="w-full py-3 bg-primary hover:bg-primary/90 text-primary-foreground font-medium rounded-xl text-sm transition-all shadow-glow-vermilion"
          >
            Return to Dashboard
          </button>
        </motion.div>
      </div>
    );
  }

  // Loading State
  if (focusLoading || (execLoading && !taskId)) {
    return (
      <div className="h-screen w-screen flex flex-col items-center justify-center bg-background text-foreground">
        <div className="w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-xs text-muted-foreground font-medium font-sans animate-pulse">
          Entering calm focus sanctuary...
        </p>
      </div>
    );
  }

  // Error State
  if (focusError || !focusData) {
    return (
      <div className="h-screen w-screen flex flex-col items-center justify-center bg-background text-foreground p-6 text-center font-sans">
        <div className="w-14 h-14 rounded-2xl bg-accent/10 border border-accent/20 flex items-center justify-center text-accent mb-4">
          <AlertCircle className="w-7 h-7" />
        </div>
        <h1 className="text-xl font-semibold mb-2 text-foreground">No Active Task Available</h1>
        <p className="text-xs text-muted-foreground max-w-sm mb-6">
          There are currently no tasks queued for focus. Create or select a task from your dashboard.
        </p>
        <button
          onClick={() => navigate('/dashboard')}
          className="px-6 py-2.5 bg-primary hover:bg-primary/90 text-primary-foreground font-medium rounded-xl text-xs transition-all inline-flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </button>
      </div>
    );
  }

  const goalTitle = focusData.unlocks_tasks?.length > 0
    ? `Unlocks: ${focusData.unlocks_tasks.map((t) => t.title).join(', ')}`
    : undefined;

  const priorityLabel = (() => {
    if (!focusData.priority) return "Medium Priority";
    const p = focusData.priority.toLowerCase();
    return p.charAt(0).toUpperCase() + p.slice(1) + " Priority";
  })();

  return (
    <div className="h-screen w-screen flex flex-col items-center justify-center relative overflow-hidden bg-background text-foreground font-sans">
      {/* Top Navigation */}
      <FocusBreadcrumb />

      {/* Centered Content Container */}
      <motion.main
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
        className={cn(
          "w-full max-w-[560px] flex flex-col items-center text-center relative z-20",
          supportMode === 'dyslexia' ? 'px-10 gap-8' : 'px-6 gap-6'
        )}
      >
        {/* Task Header & Context */}
        <FocusTaskHeader
          title={focusData.title}
          goalTitle={goalTitle}
          priority={priorityLabel}
          originalMinutes={estimateData?.original_minutes}
          adjustedMinutes={estimateData?.adjusted_minutes}
          sampleCount={estimateData?.sample_count}
          confidence={estimateData?.confidence}
        />

        {/* Timer display */}
        {isPausedState ? (
          <div className="flex flex-col items-center gap-3">
            <div className="text-5xl md:text-6xl font-bold text-accent tracking-tight tabular-nums font-sans">
              {formatTime(elapsedSeconds)}
            </div>
            <span className="text-xs font-semibold text-accent bg-accent/10 border border-accent/20 px-3 py-1 rounded-full uppercase tracking-wider font-sans">
              Focus Paused
            </span>
          </div>
        ) : (
          <FocusTimer
            seconds={elapsedSeconds}
            isPaused={isPaused}
            isRunning={isRunning}
            onStart={handleStart}
            estimatedMinutes={estimateData?.original_minutes || accessibility.sessionDefaultMinutes}
          />
        )}

        {/* Current step & checklist */}
        <FocusCheckpoint
          steps={focusData.steps ?? []}
          onToggleStep={handleToggleStep}
          pendingStepId={pendingStepId}
          subtasksCompleted={focusData.progress?.subtasks_completed || 0}
          subtasksTotal={focusData.progress?.subtasks_total || 0}
        />

        {/* Actions Grid */}
        {isPausedState ? (
          <div className="flex flex-col gap-2.5 w-full max-w-[320px] font-sans">
            <button
              onClick={handlePauseToggle}
              disabled={isPausing || isCompleting}
              className="w-full py-3.5 bg-primary hover:bg-primary/90 text-primary-foreground font-medium rounded-xl text-base transition-colors shadow-glow-vermilion flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Play className="w-4 h-4 fill-current" />
              {isPausing ? 'Resuming...' : 'Resume Focus'}
            </button>
            {sessionId && (
              <button
                onClick={handleComplete}
                disabled={isPausing || isCompleting}
                className="w-full py-3 border border-border hover:bg-muted text-foreground font-medium rounded-xl text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isCompleting ? 'Completing...' : 'Mark Task Complete'}
              </button>
            )}
            <button
              onClick={() => navigate('/dashboard')}
              className="w-full py-2.5 bg-transparent text-muted-foreground hover:text-foreground font-medium rounded-xl text-xs transition-colors"
            >
              Back to Dashboard
            </button>
          </div>
        ) : (
          <FocusActions
            onPauseToggle={handlePauseToggle}
            isPaused={isPaused}
            onComplete={handleComplete}
            isPausing={isPausing}
            isCompleting={isCompleting}
            disabled={!sessionId}
            sessionId={sessionId}
          />
        )}

        {/* Subtle Bottom Meta */}
        {focusData.blocking_tasks?.length > 0 && (
          <footer className="mt-4 text-center opacity-70">
            <p className="text-[11px] font-medium text-muted-foreground tracking-widest uppercase font-sans">
              Blocks: {focusData.blocking_tasks.map((t) => t.title).join(', ')}
            </p>
          </footer>
        )}
      </motion.main>
    </div>
  );
}
