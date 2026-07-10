import { useQuery } from '@tanstack/react-query';
import { CheckCircle, Timer, Flame, AlertCircle, Award, Target, ExternalLink } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';

import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { apiRequest } from '@/lib/api';
import { useApp } from '@/contexts/AppContext';

interface Task {
  id: number;
  title: string;
  description?: string;
  is_completed: boolean;
  goal_id?: number | null;
  estimated_minutes?: number | null;
  actual_minutes?: number | null;
  created_at: string;
  updated_at: string;
}

interface ExecutionSession {
  id: number;
  task_id: number;
  user_id: number;
  started_at: string;
  ended_at?: string | null;
  duration_seconds?: number | null;
  status: string;
}

interface Goal {
  id: number;
  title: string;
  status: string;
  priority: string;
  deadline?: string;
}

interface ScheduleBlock {
  id: number;
  task_id: number;
  scheduled_start: string;
  scheduled_end: string;
  status: string;
}

function formatRelativeTime(dateStr: string): string {
  try {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    if (diffMs < 0) return 'Just now';
    
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
      if (diffHours === 0) {
        const diffMins = Math.floor(diffMs / (1000 * 60));
        return diffMins <= 1 ? 'Just now' : `${diffMins} mins ago`;
      }
      return diffHours === 1 ? '1 hour ago' : `${diffHours} hours ago`;
    }
    if (diffDays === 1) return 'Yesterday';
    return `${diffDays} days ago`;
  } catch {
    return 'Recently';
  }
}

export default function Insights() {
  const { user } = useApp();
  const navigate = useNavigate();

  // Query all data
  const {
    data: tasks,
    isLoading: tasksLoading,
    isError: tasksError,
    refetch: refetchTasks,
  } = useQuery<Task[]>({
    queryKey: ['tasks', 'all'],
    queryFn: () => apiRequest('/tasks/'),
  });

  const {
    data: sessions,
    isLoading: sessionsLoading,
    isError: sessionsError,
    refetch: refetchSessions,
  } = useQuery<ExecutionSession[]>({
    queryKey: ['sessions', 'all'],
    queryFn: () => apiRequest('/sessions'),
  });

  const {
    data: goals,
    isLoading: goalsLoading,
    isError: goalsError,
    refetch: refetchGoals,
  } = useQuery<Goal[]>({
    queryKey: ['goals', 'all'],
    queryFn: () => apiRequest('/goals'),
  });

  const {
    data: blocks,
    isLoading: blocksLoading,
    isError: blocksError,
    refetch: refetchBlocks,
  } = useQuery<ScheduleBlock[]>({
    queryKey: ['schedule', 'blocks'],
    queryFn: () => apiRequest('/schedule/blocks'),
  });

  const handleRetry = () => {
    refetchTasks();
    refetchSessions();
    refetchGoals();
    refetchBlocks();
  };

  const isLoading = tasksLoading || sessionsLoading || goalsLoading || blocksLoading;
  const isError = tasksError || sessionsError || goalsError || blocksError;

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex-1 p-6 md:p-8 bg-[#FAF9F7] font-sans min-h-screen">
          <div className="max-w-7xl mx-auto space-y-8">
            <div>
              <h1 className="text-[28px] font-semibold text-[#1A1A1A] tracking-tight mb-2 animate-pulse">
                Insights
              </h1>
              <div className="h-4 bg-[#E8E6E1] rounded w-1/3 animate-pulse" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="h-32 bg-[#E8E6E1] rounded-xl animate-pulse" />
              <div className="h-32 bg-[#E8E6E1] rounded-xl animate-pulse" />
              <div className="h-32 bg-[#E8E6E1] rounded-xl animate-pulse" />
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              <div className="lg:col-span-8 space-y-8">
                <div className="h-80 bg-[#E8E6E1] rounded-xl animate-pulse" />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="h-64 bg-[#E8E6E1] rounded-xl animate-pulse" />
                  <div className="h-64 bg-[#E8E6E1] rounded-xl animate-pulse" />
                </div>
              </div>
              <div className="lg:col-span-4 h-96 bg-[#E8E6E1] rounded-xl animate-pulse" />
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (isError) {
    return (
      <DashboardLayout>
        <div className="flex-1 p-6 md:p-8 bg-[#FAF9F7] font-sans min-h-screen flex items-center justify-center">
          <div className="max-w-md w-full bg-white border border-[#E8E6E1] rounded-2xl p-8 text-center shadow-sm">
            <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-[#D97706]/10 flex items-center justify-center text-[#D97706]">
              <AlertCircle className="w-8 h-8" />
            </div>
            <h2 className="text-[20px] font-semibold text-[#1A1A1A] mb-3">
              Couldn't load insights
            </h2>
            <p className="text-[14px] text-[#6B6660] leading-relaxed mb-6">
              There was a problem communicating with the server. Please check your connection and try again.
            </p>
            <button
              onClick={handleRetry}
              className="px-6 py-2.5 bg-[#4F46E5] hover:bg-[#4338ca] text-white rounded-lg text-[14px] font-medium transition-colors"
            >
              Retry
            </button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // --- Calculations ---
  const completedTasks = tasks?.filter((t) => t.is_completed) || [];
  const completedTasksCount = completedTasks.length;

  const completedSessions = sessions?.filter((s) => s.status === 'COMPLETED') || [];
  const totalSeconds = completedSessions.reduce((acc, curr) => acc + (curr.duration_seconds || 0), 0);
  const totalHours = Math.floor(totalSeconds / 3600);
  const totalMins = Math.floor((totalSeconds % 3600) / 60);
  const focusTimeStr = totalHours > 0 ? `${totalHours}h ${totalMins}m` : `${totalMins}m`;

  // Streak placeholder
  const currentStreak = 5;

  const taskMap = new Map(tasks?.map((t) => [t.id, t]) || []);
  const goalMap = new Map(goals?.map((g) => [g.id, g]) || []);

  // 1. Weekly Completion Chart Data
  const last7DaysData = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - i);
    return {
      dateStr: d.toISOString().split('T')[0],
      dayName: d.toLocaleDateString(undefined, { weekday: 'short' }),
      count: 0,
    };
  }).reverse();

  completedTasks.forEach((task) => {
    const compDate = task.updated_at ? task.updated_at.split('T')[0] : '';
    const matchedDay = last7DaysData.find((day) => day.dateStr === compDate);
    if (matchedDay) {
      matchedDay.count += 1;
    }
  });

  // 2. Focus Time Distribution Data
  const goalFocusMap = new Map<number | string, { name: string; value: number }>();
  let totalSessionSeconds = 0;

  completedSessions.forEach((session) => {
    totalSessionSeconds += session.duration_seconds || 0;
    const task = taskMap.get(session.task_id);
    const goalId = task?.goal_id || 'standalone';
    const goalName = task?.goal_id ? (goalMap.get(task.goal_id)?.title || `Goal #${task.goal_id}`) : 'Standalone Tasks';

    const current = goalFocusMap.get(goalId) || { name: goalName, value: 0 };
    current.value += (session.duration_seconds || 0) / 3600; // hours
    goalFocusMap.set(goalId, current);
  });

  const focusDistributionData = Array.from(goalFocusMap.values()).map((item) => ({
    name: item.name,
    value: parseFloat(item.value.toFixed(2)),
  }));

  const totalFocusHours = parseFloat((totalSessionSeconds / 3600).toFixed(1));

  // 3. Estimation Accuracy
  let totalAcc = 0;
  let taskAccCount = 0;

  completedTasks.forEach((task) => {
    const estimated = task.estimated_minutes || 0;
    const taskSessions = completedSessions.filter((s) => s.task_id === task.id);
    const actual = taskSessions.reduce((sum, s) => sum + (s.duration_seconds || 0), 0) / 60;

    if (estimated > 0 && actual > 0) {
      const accuracy = actual <= estimated ? actual / estimated : estimated / actual;
      totalAcc += accuracy;
      taskAccCount++;
    }
  });

  const avgAccuracy = taskAccCount > 0 ? Math.round((totalAcc / taskAccCount) * 100) : 0;

  const accuracyColor = avgAccuracy > 90 ? '#059669' : avgAccuracy >= 70 ? '#4F46E5' : '#D97706';
  const accuracyBg = avgAccuracy > 90 ? 'rgba(5, 150, 105, 0.1)' : avgAccuracy >= 70 ? 'rgba(79, 70, 229, 0.1)' : 'rgba(217, 119, 6, 0.1)';

  const accuracyFeedback = (() => {
    if (taskAccCount === 0) return 'Complete estimated tasks to see accuracy';
    if (avgAccuracy > 90) return 'Exceptional! Your time predictions are highly accurate';
    if (avgAccuracy >= 70) return 'Great! Your focus matches your planned duration';
    return 'Your tasks usually take longer than estimated';
  })();

  // 4. Recent Activity Data (Last 5 completed sessions)
  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

  const sortedCompletedSessions = [...completedSessions].sort((a, b) => {
    return new Date(b.started_at).getTime() - new Date(a.started_at).getTime();
  });

  const recentActivities = sortedCompletedSessions.slice(0, 5).map((session) => {
    const task = taskMap.get(session.task_id);
    const goal = task?.goal_id ? goalMap.get(task.goal_id) : null;
    const durationMins = session.duration_seconds ? Math.round(session.duration_seconds / 60) : 0;
    return {
      id: session.id,
      taskId: session.task_id,
      title: task?.title || `Task #${session.task_id}`,
      goalName: goal?.title || null,
      duration: durationMins > 0 ? `${durationMins} min` : 'Under 1 min',
      completedAt: session.started_at ? formatRelativeTime(session.started_at) : 'Recently',
    };
  });

  const hasInsightsData = completedTasksCount > 0 || completedSessions.length > 0;

  const PIE_COLORS = ['#4F46E5', '#7C6FEE', '#A99EF7', '#C8C0FB', '#E0DBFC'];

  return (
    <DashboardLayout>
      <div className="flex-1 p-6 md:p-8 bg-[#FAF9F7] font-sans min-h-screen">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Page Header */}
          <div>
            <h1 data-testid="insights-title" className="text-[28px] font-semibold text-[#1A1A1A] tracking-tight">
              Insights
            </h1>
            <p className="text-[14px] text-[#6B6660] mt-1">
              Your productivity overview and statistics
            </p>
          </div>

          {!hasInsightsData ? (
            /* Friendly Empty State */
            <div className="bg-white border border-[#E8E6E1] rounded-2xl p-12 text-center shadow-sm max-w-md mx-auto">
              <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-[#f0ecf9] flex items-center justify-center text-[#4F46E5]">
                <Target className="w-8 h-8" />
              </div>
              <h2 className="text-[22px] font-semibold text-[#1A1A1A] mb-3">
                Start your journey!
              </h2>
              <p className="text-[14px] text-[#6B6660] leading-relaxed mb-6">
                Insights will appear here once you complete a task or log a focus session. Keep up the good work!
              </p>
              <button
                onClick={() => navigate('/dashboard')}
                className="px-6 py-2.5 bg-[#4F46E5] hover:bg-[#4338ca] text-white rounded-lg text-[14px] font-medium transition-colors"
              >
                Go to Dashboard
              </button>
            </div>
          ) : (
            <>
              {/* SECTION 1: Hero Stats Row */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Completed Tasks */}
                <div className="bg-white border border-[#E8E6E1] rounded-xl p-5 flex items-center gap-4 shadow-sm">
                  <div className="w-12 h-12 rounded-full bg-[#059669]/10 flex items-center justify-center text-[#059669] shrink-0">
                    <CheckCircle className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-[28px] font-bold text-[#1A1A1A] leading-none">
                      {completedTasksCount}
                    </h3>
                    <p className="text-[13px] font-medium text-[#6B6660] mt-1.5 uppercase tracking-wide">
                      tasks completed
                    </p>
                  </div>
                </div>

                {/* Focus Time */}
                <div className="bg-white border border-[#E8E6E1] rounded-xl p-5 flex items-center gap-4 shadow-sm">
                  <div className="w-12 h-12 rounded-full bg-[#4F46E5]/10 flex items-center justify-center text-[#4F46E5] shrink-0">
                    <Timer className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-[28px] font-bold text-[#1A1A1A] leading-none">
                      {focusTimeStr}
                    </h3>
                    <p className="text-[13px] font-medium text-[#6B6660] mt-1.5 uppercase tracking-wide">
                      total focus time
                    </p>
                  </div>
                </div>

                {/* Day Streak */}
                <div className="bg-white border border-[#E8E6E1] rounded-xl p-5 flex items-center gap-4 shadow-sm">
                  <div className="w-12 h-12 rounded-full bg-[#D97706]/10 flex items-center justify-center text-[#D97706] shrink-0">
                    <Flame className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-[28px] font-bold text-[#1A1A1A] leading-none">
                      {currentStreak}
                    </h3>
                    <p className="text-[13px] font-medium text-[#6B6660] mt-1.5 uppercase tracking-wide">
                      day streak
                    </p>
                  </div>
                </div>
              </div>

              {/* Two Column Layout */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                {/* Main Column (2/3) */}
                <div className="lg:col-span-8 space-y-8">
                  {/* SECTION 2: Weekly Completion Chart */}
                  <div className="bg-white border border-[#E8E6E1] rounded-xl p-6 shadow-sm">
                    <div className="mb-4">
                      <h3 className="text-[18px] font-semibold text-[#1A1A1A]">
                        This Week
                      </h3>
                      <p className="text-[12px] text-[#6B6660]">
                        Tasks completed per day
                      </p>
                    </div>

                    <div className="h-64 w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={last7DaysData}
                          margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" stroke="#E8E6E1" vertical={false} />
                          <XAxis
                            dataKey="dayName"
                            stroke="#9E988E"
                            fontSize={12}
                            tickLine={false}
                            axisLine={false}
                          />
                          <YAxis
                            stroke="#9E988E"
                            fontSize={12}
                            tickLine={false}
                            axisLine={false}
                            allowDecimals={false}
                          />
                          <Tooltip
                            cursor={{ fill: 'rgba(79, 70, 229, 0.04)' }}
                            contentStyle={{
                              background: '#white',
                              border: '1px solid #E8E6E1',
                              borderRadius: '8px',
                              fontSize: '12px',
                              fontFamily: 'sans-serif',
                            }}
                          />
                          <Bar
                            dataKey="count"
                            fill="#4F46E5"
                            radius={[4, 4, 0, 0]}
                            maxBarSize={40}
                          />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* SECTION 3 & 4: Side by Side (Focus Distribution & Accuracy) */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* SECTION 3: Focus Distribution (Donut Chart) */}
                    <div className="bg-white border border-[#E8E6E1] rounded-xl p-6 shadow-sm flex flex-col">
                      <div className="mb-4">
                        <h3 className="text-[18px] font-semibold text-[#1A1A1A]">
                          Focus Distribution
                        </h3>
                        <p className="text-[12px] text-[#6B6660]">
                          By goal (in hours)
                        </p>
                      </div>

                      {focusDistributionData.length > 0 ? (
                        <div className="flex-1 flex flex-col items-center justify-center relative min-h-[220px]">
                          <div className="w-full h-44">
                            <ResponsiveContainer width="100%" height="100%">
                              <PieChart>
                                <Pie
                                  data={focusDistributionData}
                                  cx="50%"
                                  cy="50%"
                                  innerRadius={60}
                                  outerRadius={80}
                                  paddingAngle={3}
                                  dataKey="value"
                                >
                                  {focusDistributionData.map((_, index) => (
                                    <Cell
                                      key={`cell-${index}`}
                                      fill={PIE_COLORS[index % PIE_COLORS.length]}
                                    />
                                  ))}
                                </Pie>
                                <Tooltip
                                  formatter={(value) => [`${value} hrs`]}
                                  contentStyle={{
                                    background: '#white',
                                    border: '1px solid #E8E6E1',
                                    borderRadius: '8px',
                                    fontSize: '12px',
                                  }}
                                />
                              </PieChart>
                            </ResponsiveContainer>
                          </div>
                          
                          {/* Total Hours Center Label */}
                          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center pointer-events-none mt-2">
                            <span className="text-[22px] font-bold text-[#1A1A1A] leading-none">
                              {totalFocusHours}h
                            </span>
                            <span className="text-[10px] text-[#9E988E] font-medium uppercase tracking-wider mt-1">
                              total focus
                            </span>
                          </div>

                          {/* Legend / Goal list list */}
                          <div className="w-full mt-4 flex flex-wrap gap-x-3 gap-y-1.5 justify-center">
                            {focusDistributionData.map((item, index) => (
                              <div key={item.name} className="flex items-center gap-1.5 text-[11px] font-medium text-[#6B6660]">
                                <div
                                  className="w-2.5 h-2.5 rounded-full shrink-0"
                                  style={{ backgroundColor: PIE_COLORS[index % PIE_COLORS.length] }}
                                />
                                <span className="truncate max-w-[100px]">{item.name}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      ) : (
                        <div className="flex-1 flex items-center justify-center text-[13px] text-[#9E988E] italic min-h-[220px]">
                          Complete some sessions to see distribution.
                        </div>
                      )}
                    </div>

                    {/* SECTION 4: Estimation Accuracy (Gauge/Progress) */}
                    <div className="bg-white border border-[#E8E6E1] rounded-xl p-6 shadow-sm flex flex-col">
                      <div className="mb-4">
                        <h3 className="text-[18px] font-semibold text-[#1A1A1A]">
                          Estimation Accuracy
                        </h3>
                        <p className="text-[12px] text-[#6B6660]">
                          Predictive estimation score
                        </p>
                      </div>

                      {taskAccCount > 0 ? (
                        <div className="flex-1 flex flex-col items-center justify-center gap-4 py-2">
                          {/* Circular Gauge */}
                          <div className="relative w-36 h-36 flex items-center justify-center">
                            <svg className="w-36 h-36 transform -rotate-90">
                              <circle
                                cx="72"
                                cy="72"
                                r="50"
                                stroke={accuracyBg}
                                strokeWidth="10"
                                fill="transparent"
                              />
                              <circle
                                cx="72"
                                cy="72"
                                r="50"
                                stroke={accuracyColor}
                                strokeWidth="10"
                                fill="transparent"
                                strokeDasharray={2 * Math.PI * 50}
                                strokeDashoffset={2 * Math.PI * 50 - (avgAccuracy / 100) * 2 * Math.PI * 50}
                                strokeLinecap="round"
                                className="transition-all duration-700 ease-out"
                              />
                            </svg>
                            
                            {/* Text inside the ring */}
                            <div className="absolute flex flex-col items-center">
                              <span className="text-[28px] font-extrabold text-[#1A1A1A] leading-none">
                                {avgAccuracy}%
                              </span>
                              <span className="text-[9px] text-[#9E988E] font-semibold uppercase tracking-wider mt-1">
                                score
                              </span>
                            </div>
                          </div>

                          <div className="text-center space-y-1">
                            <p className="text-[13px] font-semibold text-[#1A1A1A]">
                              {accuracyFeedback}
                            </p>
                            <p className="text-[11px] text-[#9E988E]">
                              Based on {taskAccCount} tasks with recorded sessions
                            </p>
                          </div>
                        </div>
                      ) : (
                        <div className="flex-1 flex items-center justify-center text-[13px] text-[#9E988E] italic min-h-[220px]">
                          Log tasks with estimated focus times to unlock accuracy metrics!
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Sidebar Column (1/3) */}
                {/* SECTION 5: Recent Activity */}
                <div className="lg:col-span-4 bg-white border border-[#E8E6E1] rounded-xl p-5 shadow-sm space-y-4">
                  <div>
                    <h3 className="text-[18px] font-semibold text-[#1A1A1A]">
                      Recent Activity
                    </h3>
                    <p className="text-[12px] text-[#6B6660]">
                      Your completed sessions
                    </p>
                  </div>

                  {recentActivities.length === 0 ? (
                    <div className="text-[13px] text-[#9E988E] italic py-4">
                      No recent activity found.
                    </div>
                  ) : (
                    <div className="space-y-4 pt-2">
                      {recentActivities.map((act) => (
                        <div key={act.id} className="flex gap-3 items-start border-l-2 border-[#E8E6E1] pl-3 py-0.5">
                          <div className="flex-1 min-w-0">
                            <h4
                              className="text-[13px] font-semibold text-[#1A1A1A] truncate cursor-pointer hover:text-[#4F46E5] hover:underline flex items-center gap-1"
                              onClick={() => navigate(`/focus/${act.taskId}`)}
                            >
                              {act.title}
                              <ExternalLink className="w-3 h-3 text-[#9E988E]" />
                            </h4>
                            
                            <div className="flex items-center gap-1.5 text-[11px] text-[#9E988E] font-medium mt-0.5">
                              {act.goalName && (
                                <>
                                  <span className="truncate max-w-[80px]">{act.goalName}</span>
                                  <span>•</span>
                                </>
                              )}
                              <span>{act.duration} focus</span>
                              <span>•</span>
                              <span>{act.completedAt}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
