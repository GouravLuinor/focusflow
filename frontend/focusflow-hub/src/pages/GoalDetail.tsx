import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useQuery, useQueries, useQueryClient } from '@tanstack/react-query';
import { AlertCircle, Plus, LayoutGrid, Network } from 'lucide-react';

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
import { AddDependencyDialog } from '@/components/goals/AddDependencyDialog';
import { WorkflowGraph } from '@/components/goals/WorkflowGraph';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
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

  // 4. Fetch dependencies for each task to reconstruct the graph
  const dependencyQueries = useQueries({
    queries: (tasks || []).map((task) => ({
      queryKey: ['task', task.id, 'dependencies'],
      queryFn: () => apiRequest(`/tasks/${task.id}/dependencies`),
      enabled: !!tasks && tasks.length > 0,
    })),
  });

  const [viewMode, setViewMode] = useState<'list' | 'graph'>('list');
  const [showCreateTask, setShowCreateTask] = useState(false);
  const [showAddDep, setShowAddDep] = useState(false);
  const [selectedTaskIdForDep, setSelectedTaskIdForDep] = useState<number | null>(null);
  const [activeJobId, setActiveJobId] = useState<number | null>(null);
  const [isDecomposing, setIsDecomposing] = useState(false);
  const { toast } = useToast();

  // Poll AI decomposition job status
  useEffect(() => {
    if (!activeJobId || !goalId) return;

    const interval = setInterval(async () => {
      try {
        const job = await apiRequest(`/ai-jobs/${activeJobId}`);
        if (job.status === 'SUCCEEDED') {
          toast({
            title: "✓ Workflow ready",
            description: "Refreshing goal detail workflow view.",
          });
          queryClient.invalidateQueries({ queryKey: ['tasks', 'goal', goalId] });
          queryClient.invalidateQueries({ queryKey: ['goal', goalId] });
          setActiveJobId(null);
          setIsDecomposing(false);
          clearInterval(interval);
        } else if (job.status === 'FAILED') {
          toast({
            title: "✗ Workflow generation failed",
            description: "Please try again or build the workflow manually.",
          });
          setActiveJobId(null);
          setIsDecomposing(false);
          clearInterval(interval);
        }
      } catch (err) {
        console.error("Failed to poll AI job status:", err);
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [activeJobId, goalId, queryClient, toast]);

  const handleDecompose = async () => {
    if (isNew || !goalId) {
      alert("Manual goal creation is coming soon! Please create the goal first or decompose an existing goal.");
      return;
    }
    setIsDecomposing(true);
    try {
      toast({
        title: "Generating workflow...",
        description: "AI is starting to analyze and decompose the goal.",
      });

      const response = await apiRequest(`/goals/${goalId}/ai-decompose`, { method: 'POST' });
      const jobId = response.id;
      setActiveJobId(jobId);
    } catch (err) {
      setIsDecomposing(false);
      toast({
        title: "✗ Decomposition failed",
        description: err instanceof Error ? err.message : "Failed to trigger AI decomposition.",
      });
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
    const baseInfo = {
      id: task.id,
      title: task.title,
      estimated_minutes: (task as any).estimated_minutes,
      priority: (task as any).priority,
      subtasks: task.steps?.map((s) => s.content) || [],
    };

    if (task.is_completed) {
      return {
        ...baseInfo,
        status: 'completed' as const,
      };
    }

    const isExecutable = executableTasks?.some((et) => et.id === task.id);

    if (isExecutable) {
      const isFirstActive = !self.slice(0, index).some(
        (prevTask) => !prevTask.is_completed && executableTasks?.some((et) => et.id === prevTask.id)
      );
      return {
        ...baseInfo,
        status: isFirstActive ? ('active' as const) : ('ready' as const),
      };
    }

    return {
      ...baseInfo,
      status: 'blocked' as const,
      waitingFor: ['Uncompleted dependencies'],
    };
  }) || [];

  // Extract all dependency relationships
  const allDependencies = dependencyQueries.flatMap((q, idx) => {
    const task = tasks?.[idx];
    if (!task || !q.data) return [];
    return (q.data as any[]).map((d) => ({
      task_id: task.id,
      depends_on_task_id: d.depends_on_task_id,
    }));
  });

  // Selected task existing dependencies for AddDependencyDialog
  const selectedTaskDeps = allDependencies
    .filter((d) => d.task_id === selectedTaskIdForDep)
    .map((d) => d.depends_on_task_id);

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

        {isDecomposing ? (
          <div className="py-24 flex flex-col items-center justify-center text-center">
            <div className="w-12 h-12 border-4 border-[#4F46E5] border-t-transparent rounded-full animate-spin mb-4" />
            <p className="text-sm text-[#9E988E] font-medium font-sans">AI is decomposing your goal... please wait</p>
          </div>
        ) : tasksWithStatus.length === 0 ? (
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
                <div className="flex items-center gap-4">
                  <h3 className="text-[12px] font-medium text-[#9E988E] uppercase tracking-wider font-sans">
                    Workflow
                  </h3>
                  
                  {/* View Mode Toggle Buttons */}
                  <div className="flex items-center bg-[#FAF9F7] border border-[#E8E6E1] p-0.5 rounded-lg shadow-sm">
                    <button
                      type="button"
                      onClick={() => setViewMode('list')}
                      className={cn(
                        "flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold rounded-md transition-all font-sans",
                        viewMode === 'list'
                          ? "bg-white text-[#4F46E5] shadow-sm border border-[#E8E6E1]/50"
                          : "text-[#6B6660] hover:text-[#4F46E5]"
                      )}
                    >
                      <LayoutGrid className="w-3.5 h-3.5" />
                      List
                    </button>
                    <button
                      type="button"
                      onClick={() => setViewMode('graph')}
                      className={cn(
                        "flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold rounded-md transition-all font-sans",
                        viewMode === 'graph'
                          ? "bg-white text-[#4F46E5] shadow-sm border border-[#E8E6E1]/50"
                          : "text-[#6B6660] hover:text-[#4F46E5]"
                      )}
                    >
                      <Network className="w-3.5 h-3.5" />
                      Graph
                    </button>
                  </div>
                </div>

                <button
                  onClick={handleAddManual}
                  className="inline-flex items-center gap-1.5 text-[12px] font-medium text-[#4F46E5] hover:underline font-sans"
                >
                  <Plus className="w-4 h-4" />
                  Add Task
                </button>
              </div>

              {viewMode === 'list' ? (
                tasksWithStatus.map((task, idx) => (
                  <div key={task.id} className="w-full">
                    <WorkflowTaskCard
                      task={task}
                      allGoalTasks={tasks || []}
                      goalId={parseInt(goalId || '0', 10)}
                    />
                    {idx < tasksWithStatus.length - 1 && (
                      <WorkflowConnector hasChevron={idx > 0} />
                    )}
                  </div>
                ))
              ) : (
                <WorkflowGraph
                  tasks={tasksWithStatus}
                  dependencies={allDependencies}
                  onTaskClick={(taskId) => {
                    navigate(`/focus/${taskId}`);
                  }}
                  onAddDependency={(taskId) => {
                    setSelectedTaskIdForDep(taskId);
                    setShowAddDep(true);
                  }}
                />
              )}
            </section>

            {/* Right Sidebar (1/3): Meta & Settings */}
            <aside className="lg:col-span-1 flex flex-col gap-6">
              {/* AI Decompose button */}
              <AIDecomposeButton onClick={handleDecompose} isLoading={isDecomposing} />

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

      {showAddDep && selectedTaskIdForDep !== null && (
        <AddDependencyDialog
          open={showAddDep}
          onClose={() => {
            setShowAddDep(false);
            setSelectedTaskIdForDep(null);
          }}
          taskId={selectedTaskIdForDep}
          goalId={parseInt(goalId || '0', 10)}
          allGoalTasks={tasks || []}
          existingDependencies={selectedTaskDeps}
        />
      )}
    </DashboardLayout>
  );
}
