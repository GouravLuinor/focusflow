import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { AlertCircle } from 'lucide-react';

import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { ScheduleHeader } from '@/components/schedule/ScheduleHeader';
import { TimelineBlock, type BlockItem } from '@/components/schedule/TimelineBlock';
import { TimelineBuffer } from '@/components/schedule/TimelineBuffer';
import { WhyThisPlan } from '@/components/schedule/WhyThisPlan';
import { WeekOverview } from '@/components/schedule/WeekOverview';
import { QuickActions } from '@/components/schedule/QuickActions';
import { ScheduleEmptyState } from '@/components/schedule/ScheduleEmptyState';
import { CreateScheduleBlockDialog } from '@/components/schedule/CreateScheduleBlockDialog';
import { apiRequest } from '@/lib/api';
import { parseServerDate } from '@/lib/stats';
import { useApp } from '@/contexts/AppContext';
import { cn } from '@/lib/utils';

interface ScheduleBlock {
  id: number;
  task_id: number | null;
  user_id: number;
  scheduled_start: string;
  scheduled_end: string;
  status: string;
  actual_start?: string | null;
  actual_end?: string | null;
}

interface Task {
  id: number;
  title: string;
  priority: string;
  estimated_minutes: number;
  goal_id?: number | null;
  deadline?: string | null;
}

interface Goal {
  id: number;
  title: string;
}

/** Server timestamps are naive UTC; parse them as UTC so times show in local time. */
const serverDate = (value: string) => parseServerDate(value) ?? new Date(NaN);

export default function ScheduleView() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { supportMode } = useApp();
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeTab, setActiveTab] = useState<'today' | 'week'>(supportMode === 'autism' ? 'week' : 'today');

  // 1. Fetch Schedule Blocks
  const { data: rawBlocks, isLoading: blocksLoading, error: blocksError } = useQuery<ScheduleBlock[]>({
    queryKey: ['schedule', 'blocks'],
    queryFn: () => apiRequest('/schedule/blocks'),
  });

  // 2. Fetch Tasks (to lookup titles and priorities)
  const { data: allTasks, isLoading: tasksLoading } = useQuery<Task[]>({
    queryKey: ['tasks', 'all'],
    queryFn: () => apiRequest('/tasks'),
  });

  // 3. Fetch Goals (to lookup goal names)
  const { data: allGoals, isLoading: goalsLoading } = useQuery<Goal[]>({
    queryKey: ['goals', 'all'],
    queryFn: () => apiRequest('/goals'),
  });

  // 4. The user's daily focus budget (shared cache with the Dashboard)
  const { data: profile } = useQuery<{ available_minutes?: number }>({
    queryKey: ['profile'],
    queryFn: () => apiRequest('/profile/me'),
    retry: 1,
  });

  const [showCreateBlock, setShowCreateBlock] = useState(false);

  // Action handlers
  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      await apiRequest('/schedule/generate', {
        method: 'POST',
        body: JSON.stringify({
          available_minutes: 90,
          save_plan: true,
          start_time: new Date().toISOString(),
        }),
      });
      // Invalidate queries to refresh the schedule timeline
      queryClient.invalidateQueries({ queryKey: ['schedule'] });
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to generate schedule.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleAddManual = () => {
    setShowCreateBlock(true);
  };

  // Loading spinner fallback
  const isLoading = blocksLoading || tasksLoading || goalsLoading;
  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="max-w-7xl mx-auto px-6 md:px-8 py-8 font-sans flex flex-col items-center justify-center min-h-[50vh]">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4" />
          <p className="text-sm text-muted-foreground font-medium font-sans">Loading schedule timeline...</p>
        </div>
      </DashboardLayout>
    );
  }

  // Error boundary fallback
  if (blocksError) {
    return (
      <DashboardLayout>
        <div className="max-w-7xl mx-auto px-6 md:px-8 py-8 font-sans flex flex-col items-center justify-center min-h-[50vh] text-center">
          <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center text-primary mb-6">
            <AlertCircle className="w-8 h-8 text-accent" />
          </div>
          <h1 className="text-2xl font-semibold mb-2 text-foreground">Unable to Load Schedule</h1>
          <p className="text-muted-foreground max-w-sm mb-6">
            There was a problem communicating with the scheduler backend API.
          </p>
          <button
            onClick={() => navigate('/dashboard')}
            className="px-6 py-3 bg-primary hover:bg-primary/90 text-white font-medium rounded-lg transition-all"
          >
            Back to Dashboard
          </button>
        </div>
      </DashboardLayout>
    );
  }

  // Task & Goal Quick Lookups
  const taskMap = new Map(allTasks?.map((t) => [t.id, t]) || []);
  const goalMap = new Map(allGoals?.map((g) => [g.id, g]) || []);

  // Sort schedule blocks by scheduled_start time
  const sortedBlocks = (rawBlocks ?? []).slice().sort((a, b) => {
    return serverDate(a.scheduled_start).getTime() - serverDate(b.scheduled_start).getTime();
  });

  const formatStartTime = (isoString: string) => {
    if (!isoString) return "00:00";
    const date = serverDate(isoString);
    return date.toLocaleTimeString(undefined, {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });
  };

  const calculateDuration = (startIso: string, endIso: string) => {
    if (!startIso || !endIso) return "0 min";
    const start = serverDate(startIso);
    const end = serverDate(endIso);
    const diffMs = end.getTime() - start.getTime();
    const diffMins = Math.round(diffMs / (1000 * 60));
    return `${diffMins} min`;
  };

  // Map backend blocks into BlockItem layout parameters
  const blockItems: BlockItem[] = sortedBlocks.map((block) => {
    const task = block.task_id ? taskMap.get(block.task_id) : null;
    const goal = task?.goal_id ? goalMap.get(task.goal_id) : null;

    const time = formatStartTime(block.scheduled_start);
    const duration = calculateDuration(block.scheduled_start, block.scheduled_end);
    const title = task?.title || `Scheduled Task #${block.task_id || block.id}`;
    const priority = (() => {
      if (!task?.priority) return "Medium Priority";
      const p = task.priority.toLowerCase();
      return p.charAt(0).toUpperCase() + p.slice(1) + " Priority";
    })();
    const goalTitle = goal?.title || "FocusFlow Goal";

    return {
      id: block.id,
      time,
      title,
      duration,
      priority,
      goal: goalTitle,
      status: block.status,
      scheduled_start: block.scheduled_start,
      scheduled_end: block.scheduled_end,
    };
  });

  const blocksByDay = Array.from({ length: 7 }, () => [] as BlockItem[]);
  blockItems.forEach(item => {
    const date = serverDate(item.scheduled_start);
    const dayIndex = (date.getDay() + 6) % 7; // Monday is 0, Sunday is 6
    blocksByDay[dayIndex].push(item);
  });

  // Interleave and compute buffers between consecutive blocks
  const buffers = sortedBlocks.map((block, idx) => {
    if (idx === sortedBlocks.length - 1) return null;
    const nextBlock = sortedBlocks[idx + 1];
    const currentEnd = serverDate(block.scheduled_end).getTime();
    const nextStart = serverDate(nextBlock.scheduled_start).getTime();
    const gapMs = nextStart - currentEnd;
    const gapMins = Math.round(gapMs / (1000 * 60));
    if (gapMins > 0) {
      return {
        from: formatStartTime(block.scheduled_end),
        to: formatStartTime(nextBlock.scheduled_start),
        minutes: gapMins,
      };
    }
    return null;
  });

  // Calculate scheduler availability metrics
  const availableMinutes =
    profile?.available_minutes ?? (Number(localStorage.getItem('preferred_daily_minutes')) || 90);
  const scheduledMinutes = sortedBlocks.reduce((acc, block) => {
    const start = serverDate(block.scheduled_start);
    const end = serverDate(block.scheduled_end);
    const durationMins = Math.round((end.getTime() - start.getTime()) / (1000 * 60));
    return acc + durationMins;
  }, 0);

  // Group and dynamically update current week overview days
  const weekDays = (() => {
    const days = ["M", "T", "W", "T", "F", "S", "S"];
    const todayIndex = (new Date().getDay() + 6) % 7; // Monday is 0, Sunday is 6
    return days.map((day, idx) => {
      const isToday = idx === todayIndex;
      const hasTasks = isToday ? sortedBlocks.length > 0 : false;
      return {
        day,
        hasTasks,
        isToday,
      };
    });
  })();

  const isEmpty = blockItems.length === 0;

  return (
    <DashboardLayout>
      {isEmpty ? (
        <div className="flex-1 flex items-center justify-center p-6 md:p-8 min-h-[calc(100vh-4rem)]">
          <ScheduleEmptyState
            onGenerate={handleGenerate}
            onAddManual={handleAddManual}
          />
        </div>
      ) : (
        <div className="flex-1 p-6 md:p-8 max-w-[1440px] mx-auto w-full font-sans">
          {/* Schedule Header */}
          <ScheduleHeader />

          {/* View Toggle */}
          <div className="flex justify-start mb-6 bg-muted p-1.5 rounded-lg w-fit">
            <button
              onClick={() => setActiveTab('today')}
              className={cn(
                "px-4 py-2 rounded-md text-[13px] font-medium transition-all font-sans",
                activeTab === 'today' ? "bg-card text-primary shadow-sm" : "text-muted-foreground hover:text-foreground"
              )}
            >
              Today's Plan
            </button>
            <button
              onClick={() => setActiveTab('week')}
              className={cn(
                "px-4 py-2 rounded-md text-[13px] font-medium transition-all font-sans",
                activeTab === 'week' ? "bg-card text-primary shadow-sm" : "text-muted-foreground hover:text-foreground"
              )}
            >
              Week View
            </button>
          </div>

          {activeTab === 'today' ? (
            // Grid Columns
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            {/* Left Column (2/3): Timeline + Why This Plan */}
            <div className="lg:col-span-2 flex flex-col gap-8">
              {/* Timeline Container */}
              <div className="flex flex-col gap-4">
                <h3 className="text-[20px] font-medium text-foreground">
                  Today's Timeline
                </h3>
                <div className="flex flex-col relative pl-6">
                  {/* Vertical Timeline Line */}
                  <div className="absolute left-[11px] top-4 bottom-4 w-px bg-border z-0"></div>

                  {blockItems.map((block, i) => (
                    <div key={block.id}>
                      <TimelineBlock block={block} />
                      {/* Interleaved Buffer block if not the last block */}
                      {i < blockItems.length - 1 && buffers[i] && (
                        <TimelineBuffer
                          fromTime={buffers[i]!.from}
                          toTime={buffers[i]!.to}
                          minutes={buffers[i]!.minutes}
                        />
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Why This Plan Explainer Grid */}
              <WhyThisPlan
                sessionCount={sortedBlocks.length}
                scheduledMinutes={scheduledMinutes}
                availableMinutes={availableMinutes}
                plannedTasks={sortedBlocks.flatMap((b) => {
                  const task = b.task_id ? taskMap.get(b.task_id) : undefined;
                  return task ? [task] : [];
                })}
              />
            </div>

            {/* Right Column (1/3): WeekOverview + QuickActions */}
            <div className="lg:col-span-1 flex flex-col gap-8">
              {/* Week Overview (Includes AvailableTimeSummary) */}
              <WeekOverview
                weekDays={weekDays}
                scheduledMinutes={scheduledMinutes}
                availableMinutes={availableMinutes}
              />

              {/* Quick Actions (Plan Adjustments) */}
              <QuickActions
                onGenerate={handleGenerate}
                onAddManual={handleAddManual}
                isGenerating={isGenerating}
              />
            </div>
          </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 font-sans">
              {["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"].map((dayName, idx) => {
                const dayBlocks = blocksByDay[idx];
                const isToday = idx === (new Date().getDay() + 6) % 7;
                
                return (
                  <div 
                    key={dayName} 
                    className={cn(
                      "bg-card border rounded-xl p-5 flex flex-col gap-4 shadow-sm transition-all duration-200",
                      isToday ? "border-primary ring-2 ring-primary/10" : "border-border"
                    )}
                  >
                    <div className="flex justify-between items-center pb-2 border-b border-border/50">
                      <h4 className={cn("text-[16px] font-semibold", isToday ? "text-primary" : "text-foreground")}>
                        {dayName}
                      </h4>
                      {isToday && (
                        <span className="bg-primary/10 text-primary text-[10px] font-bold px-2 py-0.5 rounded-full">
                          Today
                        </span>
                      )}
                    </div>
                    
                    <div className="flex flex-col gap-3 flex-1">
                      {dayBlocks.length === 0 ? (
                        <div className="text-[12px] text-muted-foreground py-4 text-center">
                          No tasks scheduled
                        </div>
                      ) : (
                        dayBlocks.map(block => (
                          <div 
                            key={block.id} 
                            className="p-3 border border-border rounded-lg bg-card flex flex-col gap-1 hover:border-primary/50 transition-colors"
                          >
                            <div className="flex justify-between items-start gap-2">
                              <span className="text-[13px] font-semibold text-foreground line-clamp-2">
                                {block.title}
                              </span>
                              <span className="text-[10px] text-muted-foreground bg-card border border-border px-1.5 py-0.5 rounded shrink-0">
                                {block.time}
                              </span>
                            </div>
                            <div className="flex justify-between items-center text-[11px] text-muted-foreground mt-1">
                              <span>{block.goal}</span>
                              <span>{block.duration}</span>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      <CreateScheduleBlockDialog
        open={showCreateBlock}
        onClose={() => setShowCreateBlock(false)}
      />
    </DashboardLayout>
  );
}
