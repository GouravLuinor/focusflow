import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { AlertCircle, Check } from 'lucide-react';

import { FocusBreadcrumb } from '@/components/focus/FocusBreadcrumb';
import { FocusTaskHeader } from '@/components/focus/FocusTaskHeader';
import { FocusTimer } from '@/components/focus/FocusTimer';
import { FocusCheckpoint } from '@/components/focus/FocusCheckpoint';
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
  };
  blocking_tasks: BlockingTask[];
  unlocks_tasks: UnlocksTask[];
  available_actions: string[];
  schedule_today?: {
    scheduled_start: string;
    scheduled_end: string;
  };
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
  const { data: executableTasks, isLoading: execLoading, error: execError } = useQuery<any[]>({
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
  const { data: estimateData } = useQuery<any>({
    queryKey: ['estimate', taskId],
    queryFn: () => apiRequest(`/tasks/${taskId}/estimate`),
    enabled: !!taskId,
  });

  // Redirect to first executable task if taskId is missing
  useEffect(() => {
    if (!taskId) {
      const lastTaskId = localStorage.getItem('last_focus_task_id');
      if (lastTaskId) {
        navigate(`/focus/${lastTaskId}`, { replace: true });
      } else if (executableTasks && executableTasks.length > 0) {
        navigate(`/focus/${executableTasks[0].id}`, { replace: true });
      }
    } else {
      localStorage.setItem('last_focus_task_id', taskId);
    }
  }, [taskId, executableTasks, navigate]);

  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [sessionId, setSessionId] = useState<number | string | null>(null);

  // Sync elapsed seconds when focusData is loaded or updated, or local storage has active session
  useEffect(() => {
    if (!taskId) return;

    const savedStart = localStorage.getItem(`focus_session_start_${taskId}`);
    const savedSessionId = localStorage.getItem(`focus_session_id_${taskId}`);

    if (savedStart && savedSessionId) {
      const elapsed = Math.floor((new Date().getTime() - new Date(savedStart).getTime()) / 1000);
      setElapsedSeconds(elapsed > 0 ? elapsed : 0);
      setSessionId(parseInt(savedSessionId, 10));
      setIsRunning(true);
      setIsPausedState(false);
      setIsCompletedState(false);
    } else if (focusData?.active_session) {
      setElapsedSeconds(focusData.active_session.elapsed_seconds);
      setSessionId(focusData.active_session.session_id);
      setIsRunning(true);
      setIsPausedState(false);
      setIsCompletedState(false);

      // Populate local storage so it persists if they reload
      const inferredStart = new Date(Date.now() - focusData.active_session.elapsed_seconds * 1000);
      localStorage.setItem(`focus_session_start_${taskId}`, inferredStart.toISOString());
      localStorage.setItem(`focus_session_id_${taskId}`, focusData.active_session.session_id.toString());
    } else {
      // If no local storage and no active session from API, clear states (unless we are showing completed/paused view)
      if (!isCompletedState && !isPausedState) {
        setElapsedSeconds(0);
        setSessionId(null);
        setIsRunning(false);
      }
    }
  }, [taskId, focusData, isCompletedState, isPausedState]);

  // Tick the timer up every second if running and not paused
  useEffect(() => {
    if (!isRunning || isPaused || isPausedState || isCompletedState) return;

    const interval = setInterval(() => {
      setElapsedSeconds((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [isRunning, isPaused, isPausedState, isCompletedState]);

  const handleStart = async () => {
    if (!taskId) return;
    try {
      const response = await apiRequest('/sessions', {
        method: 'POST',
        body: JSON.stringify({ task_id: parseInt(taskId, 10) }),
      });
      setSessionId(response.id);
      setElapsedSeconds(0);
      setIsRunning(true);
      setIsPausedState(false);
      setIsCompletedState(false);

      // Store in local storage to prevent timer reset
      localStorage.setItem(`focus_session_start_${taskId}`, new Date().toISOString());
      localStorage.setItem(`focus_session_id_${taskId}`, response.id.toString());

      queryClient.invalidateQueries({ queryKey: ['focus', taskId] });
      queryClient.invalidateQueries({ queryKey: ['schedule'] });
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to start session');
    }
  };

  const handlePauseToggle = async () => {
    if (!sessionId) return;
    setIsPausing(true);
    try {
      await apiRequest(`/sessions/${sessionId}/abandon`, { method: 'POST' });
      
      // Clean up local storage
      localStorage.removeItem(`focus_session_start_${taskId}`);
      localStorage.removeItem(`focus_session_id_${taskId}`);

      // Invalidate queries to trigger global updates
      queryClient.invalidateQueries({ queryKey: ['focus', taskId] });
      queryClient.invalidateQueries({ queryKey: ['schedule'] });
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['sessions'] });

      // Update UI to show paused state instead of redirecting
      setIsRunning(false);
      setSessionId(null);
      setIsPausedState(true);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to abandon session');
    } finally {
      setIsPausing(false);
    }
  };

  const handleComplete = async () => {
    if (!sessionId) return;
    setIsCompleting(true);
    try {
      await apiRequest(`/sessions/${sessionId}/complete`, { method: 'POST' });

      // Clean up local storage
      localStorage.removeItem(`focus_session_start_${taskId}`);
      localStorage.removeItem(`focus_session_id_${taskId}`);

      // Invalidate queries to trigger global updates
      queryClient.invalidateQueries({ queryKey: ['focus', taskId] });
      queryClient.invalidateQueries({ queryKey: ['tasks', 'executable'] });
      queryClient.invalidateQueries({ queryKey: ['schedule'] });
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['sessions'] });

      // Update UI to show completed state instead of redirecting
      setIsRunning(false);
      setSessionId(null);
      setIsCompletedState(true);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to complete session');
    } finally {
      setIsCompleting(false);
    }
  };

  // Completed State View
  if (isCompletedState) {
    return (
      <div className="h-screen w-screen flex flex-col items-center justify-center bg-[#FAF9F7] text-[#1A1A1A] p-6 text-center font-sans">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full bg-white border border-[#E8E6E1] p-8 rounded-2xl shadow-sm flex flex-col items-center"
        >
          <div className="w-16 h-16 rounded-full bg-[#059669]/10 flex items-center justify-center text-[#059669] mb-6">
            <Check className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-semibold mb-3">Task completed ✓</h1>
          <p className="text-[#6B6660] text-[14px] leading-relaxed mb-8">
            Excellent focus! "{focusData?.title}" is completed and your focus time has been recorded.
          </p>
          <button
            onClick={() => navigate('/dashboard')}
            className="w-full py-3 bg-[#4F46E5] hover:bg-[#4338ca] text-white font-medium rounded-lg transition-colors"
          >
            Back to Dashboard
          </button>
        </motion.div>
      </div>
    );
  }

  // Loading state for missing taskId
  if (!taskId) {
    if (execLoading) {
      return (
        <div className="h-screen w-screen flex flex-col items-center justify-center bg-[#FAF9F7] text-[#1A1A1A]">
          <div className="w-8 h-8 border-4 border-[#4F46E5] border-t-transparent rounded-full animate-spin mb-4" />
          <p className="text-sm text-[#9E988E] font-medium font-sans animate-pulse">Finding focus task...</p>
        </div>
      );
    }

    if (execError || !executableTasks || executableTasks.length === 0) {
      return (
        <div className="h-screen w-screen flex flex-col items-center justify-center bg-[#FAF9F7] text-[#1A1A1A] p-6 text-center">
          <div className="w-16 h-16 rounded-full bg-[#f0ecf9] flex items-center justify-center text-[#4F46E5] mb-6">
            <AlertCircle className="w-8 h-8 text-[#D97706]" />
          </div>
          <h1 className="text-2xl font-semibold mb-2 font-sans text-[#1A1A1A]">No Tasks Available</h1>
          <p className="text-[#6B6660] max-w-sm mb-6 font-sans">
            There are no executable tasks currently scheduled or ready for focus mode.
          </p>
          <button
            onClick={() => navigate('/dashboard')}
            className="px-6 py-3 bg-[#4F46E5] hover:bg-[#4F46E5]/90 text-white font-medium rounded-lg transition-all"
          >
            Back to Dashboard
          </button>
        </div>
      );
    }
  }

  // Loading State for focus session details
  if (focusLoading) {
    return (
      <div className="h-screen w-screen flex flex-col items-center justify-center bg-[#FAF9F7] text-[#1A1A1A]">
        <div className="w-8 h-8 border-4 border-[#4F46E5] border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-sm text-[#9E988E] font-medium font-sans animate-pulse">Loading focus session...</p>
      </div>
    );
  }

  // Error State
  if (focusError || !focusData) {
    return (
      <div className="h-screen w-screen flex flex-col items-center justify-center bg-[#FAF9F7] text-[#1A1A1A] p-6 text-center">
        <div className="w-16 h-16 rounded-full bg-[#f0ecf9] flex items-center justify-center text-[#4F46E5] mb-6">
          <AlertCircle className="w-8 h-8 text-[#D97706]" />
        </div>
        <h1 className="text-2xl font-semibold mb-2 font-sans text-[#1A1A1A]">Unable to Load Focus Task</h1>
        <p className="text-[#6B6660] max-w-sm mb-6 font-sans">
          There was an error loading the focus task details.
        </p>
        <button
          onClick={() => navigate('/dashboard')}
          className="px-6 py-3 bg-[#4F46E5] hover:bg-[#4F46E5]/90 text-white font-medium rounded-lg transition-all"
        >
          Back to Dashboard
        </button>
      </div>
    );
  }

  // Derive goal title / unlocks label
  const goalTitle = focusData.unlocks_tasks?.length > 0
    ? `Unlocks: ${focusData.unlocks_tasks.map((t) => t.title).join(', ')}`
    : undefined;

  // Format priority label
  const priorityLabel = (() => {
    if (!focusData.priority) return "Medium Priority";
    const p = focusData.priority.toLowerCase();
    return p.charAt(0).toUpperCase() + p.slice(1) + " Priority";
  })();

  // Construct subtasks checkpoint string representation
  const checkpointStr = focusData.progress
    ? `${focusData.progress.subtasks_completed}/${focusData.progress.subtasks_total}`
    : "0/0";

  return (
    <div className="h-screen w-screen flex flex-col items-center justify-center relative overflow-hidden bg-[#FAF9F7] text-[#1A1A1A]">
      {/* Background visual detail */}
      <div 
        className="absolute inset-0 opacity-[0.02] pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(#4f46e5 1px, transparent 1px)',
          backgroundSize: '32px 32px',
        }}
      />

      {/* Top Navigation */}
      <FocusBreadcrumb />

      {/* Centered Content Container */}
      <motion.main
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className={cn(
          "w-full max-w-[560px] flex flex-col items-center text-center relative z-20",
          supportMode === 'dyslexia' ? 'px-10 gap-10' : 'px-6 gap-8'
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
          <div className="flex flex-col items-center gap-4">
            <div className="text-[64px] font-bold text-[#D97706] tracking-tight tabular-nums font-sans">
              {formatTime(elapsedSeconds)}
            </div>
            <span className="text-sm font-semibold text-[#D97706] bg-[#D97706]/10 px-4 py-1.5 rounded-full uppercase tracking-wider font-sans">
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

        {/* Current Checkpoint Card */}
        <FocusCheckpoint
          checkpoint={checkpointStr}
          completedCount={focusData.progress?.subtasks_completed || 0}
          totalCount={focusData.progress?.subtasks_total || 0}
        />

        {/* Actions Grid */}
        {isPausedState ? (
          <div className="flex flex-col gap-3 w-full max-w-[320px] font-sans">
            <button
              onClick={handleStart}
              className="w-full py-4 bg-[#4F46E5] hover:bg-[#4338ca] text-white font-medium rounded-lg text-[18px] transition-colors hover:scale-[1.01]"
            >
              Resume Focus
            </button>
            <button
              onClick={() => navigate('/dashboard')}
              className="w-full py-3 bg-transparent text-[#6B6660] hover:text-[#1A1A1A] font-medium rounded-lg text-[14px] transition-colors"
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
          <footer className="mt-8 text-center opacity-70">
            <p className="text-[12px] font-medium text-[#9E988E] tracking-widest uppercase font-sans">
              Blocks: {focusData.blocking_tasks.map((t) => t.title).join(', ')}
            </p>
          </footer>
        )}
      </motion.main>
    </div>
  );
}
