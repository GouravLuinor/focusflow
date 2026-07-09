import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { AlertCircle } from 'lucide-react';

import { FocusBreadcrumb } from '@/components/focus/FocusBreadcrumb';
import { FocusTaskHeader } from '@/components/focus/FocusTaskHeader';
import { FocusTimer } from '@/components/focus/FocusTimer';
import { FocusCheckpoint } from '@/components/focus/FocusCheckpoint';
import { FocusActions } from '@/components/focus/FocusActions';
import { apiRequest } from '@/lib/api';

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

export default function FocusMode() {
  const navigate = useNavigate();
  const { taskId } = useParams<{ taskId?: string }>();
  const queryClient = useQueryClient();
  const [isPausing, setIsPausing] = useState(false);
  const [isCompleting, setIsCompleting] = useState(false);

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

  // Redirect to first executable task if taskId is missing
  useEffect(() => {
    if (!taskId && executableTasks && executableTasks.length > 0) {
      navigate(`/focus/${executableTasks[0].id}`, { replace: true });
    }
  }, [taskId, executableTasks, navigate]);

  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  // Sync elapsed seconds when focusData is loaded or updated
  useEffect(() => {
    if (focusData?.active_session) {
      setElapsedSeconds(focusData.active_session.elapsed_seconds);
    } else {
      setElapsedSeconds(0);
    }
  }, [focusData]);

  // Tick the timer up every second if not paused
  useEffect(() => {
    if (isPaused) return;

    const interval = setInterval(() => {
      setElapsedSeconds((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [isPaused]);

  const sessionId = focusData?.active_session?.session_id;

  const handlePauseToggle = async () => {
    if (!sessionId) {
      setIsPaused((prev) => !prev);
      return;
    }
    setIsPausing(true);
    try {
      await apiRequest(`/sessions/${sessionId}/abandon`, { method: 'POST' });
      queryClient.invalidateQueries({ queryKey: ['focus', taskId] });
      navigate('/dashboard');
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to pause session');
    } finally {
      setIsPausing(false);
    }
  };

  const handleComplete = async () => {
    if (!sessionId) {
      alert("No active session to complete!");
      return;
    }
    setIsCompleting(true);
    try {
      await apiRequest(`/sessions/${sessionId}/complete`, { method: 'POST' });
      queryClient.invalidateQueries({ queryKey: ['focus', taskId] });
      queryClient.invalidateQueries({ queryKey: ['tasks', 'executable'] });
      navigate('/dashboard');
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to complete session');
    } finally {
      setIsCompleting(false);
    }
  };

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
        className="w-full max-w-[560px] px-6 flex flex-col items-center text-center gap-8 relative z-20"
      >
        {/* Task Header & Context */}
        <FocusTaskHeader
          title={focusData.title}
          goalTitle={goalTitle}
          priority={priorityLabel}
        />

        {/* Timer display */}
        <FocusTimer seconds={elapsedSeconds} isPaused={isPaused} />

        {/* Current Checkpoint Card */}
        <FocusCheckpoint
          checkpoint={checkpointStr}
          completedCount={focusData.progress?.subtasks_completed || 0}
          totalCount={focusData.progress?.subtasks_total || 0}
        />

        {/* Actions Grid */}
        <FocusActions
          onPauseToggle={handlePauseToggle}
          isPaused={isPaused}
          onComplete={handleComplete}
          isPausing={isPausing}
          isCompleting={isCompleting}
          disabled={!sessionId}
        />

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
