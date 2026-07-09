import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { AlertCircle, Plus } from 'lucide-react';

import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { GoalHeader } from '@/components/goals/GoalHeader';
import { WorkflowTaskCard } from '@/components/goals/WorkflowTaskCard';
import { WorkflowConnector } from '@/components/goals/WorkflowConnector';
import { GoalSettings } from '@/components/goals/GoalSettings';
import { GoalSchedule } from '@/components/goals/GoalSchedule';
import { GoalActivity } from '@/components/goals/GoalActivity';
import { GoalEmptyState } from '@/components/goals/GoalEmptyState';
import { AIDecomposeButton } from '@/components/goals/AIDecomposeButton';
import { CreateTaskDialog } from '@/components/dashboard/CreateTaskDialog';
import { apiRequest } from '@/lib/api';

interface Step {
  id: number;
  content: string;
  order: number;
  is_completed: boolean;
}

interface Task {
  id: number;
  title: string;
  description: string;
  is_completed: boolean;
  steps?: Step[];
  goal_id?: number | null;
  parent_task_id?: number | null;
}

interface Goal {
  id: number;
  user_id: number;
  title: string;
  description?: string | null;
  status: string;
  priority: string;
  deadline?: string | null;
  created_at: string;
  updated_at: string;
}

export default function GoalDetail() {
  const { goalId } = useParams<{ goalId: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const isNew = goalId === "new";

  // 1. Fetch Goal Details
  const { data: goal, isLoading: goalLoading, error: goalError } = useQuery<Goal>({
    queryKey: ['goal', goalId],
    queryFn: () => apiRequest(`/goals/${goalId}`),
    enabled: !!goalId && !isNew,
  });

  // 2. Fetch Goal Tasks (using topologically sorted workflow order)
  const { data: tasks, isLoading: tasksLoading } = useQuery<Task[]>({
    queryKey: ['tasks', 'goal', goalId],
    queryFn: () => apiRequest(`/goals/${goalId}/workflow-order`),
    enabled: !!goalId && !isNew,
  });

  // 3. Fetch Executable Tasks to determine ready/blocked states
  const { data: executableTasks } = useQuery<Task[]>({
    queryKey: ['tasks', 'executable'],
    queryFn: () => apiRequest('/tasks/executable'),
    enabled: !!goalId && !isNew,
  });

  const [showCreateTask, setShowCreateTask] = useState(false);

  const handleDecompose = async () => {
    if (isNew) {
      alert("Manual goal creation is coming soon! Please create the goal first or decompose an existing goal.");
      return;
    }
    try {
      await apiRequest(`/goals/${goalId}/ai-decompose`, { method: 'POST' });
      alert("AI decomposition started in background. Refreshing in a few seconds...");
      setTimeout(() => {
        queryClient.invalidateQueries({ queryKey: ['tasks', 'goal', goalId] });
        queryClient.invalidateQueries({ queryKey: ['goal', goalId] });
      }, 3000);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to trigger AI decomposition.");
    }
  };

  const handleAddManual = () => {
    setShowCreateTask(true);
  };

  // Loading spinner fallback
  if (!isNew && (goalLoading || tasksLoading)) {
    return (
      <DashboardLayout>
        <div className="max-w-7xl mx-auto px-6 md:px-8 py-8 font-sans flex flex-col items-center justify-center min-h-[50vh]">
          <div className="w-8 h-8 border-4 border-[#4F46E5] border-t-transparent rounded-full animate-spin mb-4" />
          <p className="text-sm text-[#9E988E] font-medium font-sans">Loading goal details...</p>
        </div>
      </DashboardLayout>
    );
  }

  // Error boundary fallback
  if (!goalId || (!isNew && (goalError || !goal))) {
    return (
      <DashboardLayout>
        <div className="max-w-7xl mx-auto px-6 md:px-8 py-8 font-sans flex flex-col items-center justify-center min-h-[50vh] text-center">
          <div className="w-16 h-16 rounded-full bg-[#f0ecf9] flex items-center justify-center text-[#4F46E5] mb-6">
            <AlertCircle className="w-8 h-8 text-[#D97706]" />
          </div>
          <h1 className="text-2xl font-semibold mb-2 text-[#1A1A1A]">Goal Not Found</h1>
          <p className="text-[#6B6660] max-w-sm mb-6">
            {!goalId ? "No goal ID was specified." : "There was a problem loading this goal."}
          </p>
          <button
            onClick={() => navigate('/dashboard')}
            className="px-6 py-3 bg-[#4F46E5] hover:bg-[#4F46E5]/90 text-white font-medium rounded-lg transition-all"
          >
            Back to Dashboard
          </button>
        </div>
      </DashboardLayout>
    );
  }

  // Client-side calculations for Goal Stats
  const goalTitle = isNew ? "New Goal" : goal.title;
  const tasksTotal = isNew ? 0 : (tasks?.length || 0);
  const tasksCompleted = isNew ? 0 : (tasks?.filter((t) => t.is_completed).length || 0);
  const progress = tasksTotal > 0 ? Math.round((tasksCompleted / tasksTotal) * 100) : 0;

  const daysRemaining = (() => {
    if (isNew || !goal?.deadline) return 0;
    const deadlineDate = new Date(goal.deadline);
    const today = new Date();
    const diffTime = deadlineDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  })();

  // Formatting strings for Settings
  const statusLabel = isNew ? "Draft" : (goal.status.charAt(0).toUpperCase() + goal.status.slice(1).toLowerCase());
  const priorityLabel = isNew ? "Medium" : (goal.priority.charAt(0).toUpperCase() + goal.priority.slice(1).toLowerCase());
  const deadlineLabel = !isNew && goal?.deadline
    ? new Date(goal.deadline).toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
    : 'No deadline';

  // Map and determine status of each task in the Goal workflow
  const tasksWithStatus = tasks?.map((task, index, self) => {
    if (task.is_completed) {
      return {
        id: task.id,
        title: task.title,
        status: 'completed' as const,
        subtasks: task.steps?.map((s) => s.content) || [],
      };
    }

    const isExecutable = executableTasks?.some((et) => et.id === task.id);

    if (isExecutable) {
      const isFirstActive = !self.slice(0, index).some(
        (prevTask) => !prevTask.is_completed && executableTasks?.some((et) => et.id === prevTask.id)
      );
      return {
        id: task.id,
        title: task.title,
        status: isFirstActive ? ('active' as const) : ('ready' as const),
        subtasks: task.steps?.map((s) => s.content) || [],
      };
    }

    return {
      id: task.id,
      title: task.title,
      status: 'blocked' as const,
      subtasks: task.steps?.map((s) => s.content) || [],
      waitingFor: ['Uncompleted dependencies'],
    };
  }) || [];

  // Derive simple activity items based on non-TODO task events
  const activities = tasks
    ?.filter((t) => t.is_completed)
    ?.map((t) => ({
      text: `${t.title} completed`,
      time: "Recently completed",
      type: "completed" as const,
    }))
    .slice(0, 5) || [];

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto px-6 md:px-8 py-8 font-sans">
        {/* Goal Header */}
        <GoalHeader
          title={goalTitle}
          progress={progress}
          daysRemaining={daysRemaining}
          tasksCompleted={tasksCompleted}
          tasksTotal={tasksTotal}
        />

        {tasksWithStatus.length === 0 ? (
          <div className="py-12">
            <GoalEmptyState
              onDecompose={handleDecompose}
              onAddManual={handleAddManual}
            />
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            {/* Main Content (Left 2/3): Workflow Column */}
            <section className="lg:col-span-2 flex flex-col gap-6">
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-[12px] font-medium text-[#9E988E] uppercase tracking-wider font-sans">
                  Workflow
                </h3>
                <button
                  onClick={handleAddManual}
                  className="inline-flex items-center gap-1.5 text-[12px] font-medium text-[#4F46E5] hover:underline font-sans"
                >
                  <Plus className="w-4 h-4" />
                  Add Task
                </button>
              </div>
              {tasksWithStatus.map((task, idx) => (
                <div key={task.id} className="w-full">
                  <WorkflowTaskCard task={task} />
                  {idx < tasksWithStatus.length - 1 && (
                    <WorkflowConnector hasChevron={idx > 0} />
                  )}
                </div>
              ))}
            </section>

            {/* Right Sidebar (1/3): Meta & Settings */}
            <aside className="lg:col-span-1 flex flex-col gap-6">
              {/* AI Decompose button */}
              <AIDecomposeButton onClick={handleDecompose} />

              {/* Goal Settings */}
              <GoalSettings
                status={statusLabel}
                priority={priorityLabel}
                deadline={deadlineLabel}
              />

              {/* Schedule */}
              <GoalSchedule nextSession="Flexible / Self-paced" />

              {/* Activity Feed */}
              <GoalActivity activities={activities} />
            </aside>
          </div>
        )}
      </div>

      <CreateTaskDialog
        open={showCreateTask}
        onClose={() => setShowCreateTask(false)}
        defaultGoalId={!isNew && goalId ? parseInt(goalId, 10) : undefined}
      />
    </DashboardLayout>
  );
}
