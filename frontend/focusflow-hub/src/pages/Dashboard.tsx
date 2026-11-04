import { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';

import { useApp } from '@/contexts/AppContext';
import { apiRequest } from '@/lib/api';
import { cn } from '@/lib/utils';
import { computeTodayStats, type StatsSession, type StatsTask } from '@/lib/stats';

import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { GreetingHeader } from '@/components/dashboard/GreetingHeader';
import { NextBestActionCard, type ScoredTask } from '@/components/dashboard/NextBestActionCard';
import { TodaysPlanSection } from '@/components/dashboard/TodaysPlanSection';
import { ActiveGoalsSection, type Goal } from '@/components/dashboard/ActiveGoalsSection';
import { QuickStats } from '@/components/dashboard/QuickStats';
import { EmptyDashboard } from '@/components/dashboard/EmptyDashboard';
import { type ScheduleBlock } from '@/components/dashboard/ScheduleBlockCard';

/* ─── Types ────────────────────────────────────────────────────── */

interface Profile {
  onboarding_completed: boolean;
  support_mode: 'adhd' | 'autism' | 'dyslexia' | 'none' | null;
  available_minutes?: number;
}

interface ScheduleResponse {
  plan: ScoredTask[];
  total_minutes: number;
}

interface ExecutableTask {
  id: number;
  status: string;
  is_completed: boolean;
}

/* ─── Skeleton ─────────────────────────────────────────────────── */

function CardSkeleton({ className = '' }: { className?: string }) {
  return (
    <div className={`bg-white rounded-xl border border-[#E8E6E1] animate-pulse ${className}`}>
      <div className="p-5 space-y-3">
        <div className="h-4 bg-[#f0ecf9] rounded w-2/3" />
        <div className="h-3 bg-[#f0ecf9] rounded w-1/2" />
        <div className="h-3 bg-[#f0ecf9] rounded w-3/4" />
      </div>
    </div>
  );
}

/* ─── Dashboard ─────────────────────────────────────────────────── */

const AVAILABLE_MINUTES = 90;

export default function Dashboard() {
  const { isAuthenticated, user, supportMode } = useApp();

  const [availableMinutes, setAvailableMinutes] = useState(() => {
    const saved = localStorage.getItem('preferred_daily_minutes');
    return saved ? parseInt(saved, 10) : AVAILABLE_MINUTES;
  });

  /* ── All hooks unconditionally up-front ──────────────────── */

  const { data: profile, isLoading: profileLoading } = useQuery<Profile>({
    queryKey: ['profile'],
    queryFn: () => apiRequest('/profile/me'),
    retry: 1,
    enabled: isAuthenticated,
  });

  useEffect(() => {
    if (profile?.available_minutes !== undefined) {
      setAvailableMinutes(profile.available_minutes);
    }
  }, [profile]);

  const { data: scheduleData, isLoading: scheduleLoading } = useQuery<ScheduleResponse>({
    queryKey: ['schedule', 'recommended', availableMinutes],
    queryFn: () =>
      apiRequest('/schedule/generate', {
        method: 'POST',
        body: JSON.stringify({ available_minutes: availableMinutes, save_plan: false }),
      }),
    retry: 1,
    staleTime: 5 * 60 * 1000,
    enabled: isAuthenticated && !!profile,
  });

  const { data: blocksData, isLoading: blocksLoading } = useQuery<ScheduleBlock[]>({
    queryKey: ['schedule', 'blocks'],
    queryFn: async () => {
      const allBlocks: ScheduleBlock[] = await apiRequest('/schedule/blocks');
      return allBlocks.filter((b) => ['PLANNED', 'ACTIVE', 'COMPLETED'].includes(b.status));
    },
    retry: 1,
    staleTime: 60 * 1000,
    enabled: isAuthenticated && !!profile,
  });

  const { data: goalsData, isLoading: goalsLoading } = useQuery<Goal[]>({
    queryKey: ['goals', 'active'],
    queryFn: () => apiRequest('/goals?status=ACTIVE'),
    retry: 1,
    staleTime: 2 * 60 * 1000,
    enabled: isAuthenticated && !!profile,
  });

  const { data: executableTasks, isLoading: tasksLoading } = useQuery<ExecutableTask[]>({
    queryKey: ['tasks', 'executable'],
    queryFn: () => apiRequest('/tasks/executable'),
    retry: 1,
    staleTime: 60 * 1000,
    enabled: isAuthenticated && !!profile,
  });

  const { data: allTasks } = useQuery<(StatsTask & { id: number })[]>({
    queryKey: ['tasks', 'all'],
    queryFn: () => apiRequest('/tasks/'),
    retry: 1,
    staleTime: 60 * 1000,
    enabled: isAuthenticated && !!profile,
  });

  const { data: sessionsData } = useQuery<StatsSession[]>({
    queryKey: ['sessions', 'all'],
    queryFn: () => apiRequest('/sessions'),
    retry: 1,
    staleTime: 60 * 1000,
    enabled: isAuthenticated && !!profile,
  });

  /* ── Conditional guards (after all hooks) ────────────────── */

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  /* ── Derived state ───────────────────────────────────────── */
  const { completedToday, focusMinutesToday, dayStreak } = computeTodayStats(
    allTasks ?? [],
    sessionsData ?? []
  );

  const isLoading = profileLoading || scheduleLoading || blocksLoading || goalsLoading || tasksLoading;
  const bestTask = scheduleData?.plan?.[0] ?? null;
  const blocks = blocksData ?? [];
  const goals = goalsData ?? [];

  const isEmpty =
    !isLoading &&
    (executableTasks ?? []).length === 0 &&
    goals.length === 0;

  const displayName = user?.name ?? 'Alex';

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="pt-8 pb-12 px-8 max-w-[1600px] mx-auto min-h-screen">
          <div className="max-w-[1080px] mx-auto mb-8">
            <div className="h-10 bg-[#f0ecf9] animate-pulse rounded w-1/4 mb-2" />
            <div className="h-6 bg-[#f0ecf9] animate-pulse rounded w-1/3" />
          </div>
          <div className="max-w-[1080px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-7 flex flex-col gap-8">
              <CardSkeleton className="h-64" />
              <CardSkeleton className="h-48" />
            </div>
            <div className="lg:col-span-5 flex flex-col gap-8">
              <CardSkeleton className="h-48" />
              <CardSkeleton className="h-32" />
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (isEmpty) {
    return (
      <DashboardLayout>
        <EmptyDashboard name={displayName} />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="pt-8 pb-12 px-8 max-w-[1600px] mx-auto min-h-screen font-sans"
      >
        {/* Header Section */}
        <div className="max-w-[1080px] mx-auto mb-8 flex justify-between items-end">
          <GreetingHeader
            name={displayName}
            availableMinutes={availableMinutes}
            isEmpty={false}
            onMinutesChange={(mins) => {
              setAvailableMinutes(mins);
              localStorage.setItem('preferred_daily_minutes', mins.toString());
            }}
          />
        </div>

        {/* Two Column Layout */}
        <div className="max-w-[1080px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* LEFT COLUMN (55% or 100% in ADHD mode) */}
          <div className={cn(supportMode === 'adhd' ? "lg:col-span-12" : "lg:col-span-7", "flex flex-col gap-8")}>
            {/* Next Best Action Card */}
            {bestTask ? (
              <NextBestActionCard task={bestTask} />
            ) : (
              <div className="bg-white rounded-xl border border-[#E8E6E1] p-6 text-center text-[14px] text-[#9E988E] font-sans">
                All caught up! No tasks ready to start right now.
              </div>
            )}

            {/* Today's Plan Section */}
            <TodaysPlanSection blocks={blocks} tasks={allTasks || []} availableMinutes={availableMinutes} />

            {/* ADHD mode keeps a single column, but goals must stay reachable */}
            {supportMode === 'adhd' && <ActiveGoalsSection goals={goals} />}
          </div>

          {/* RIGHT COLUMN (45% - Hidden in ADHD mode) */}
          {supportMode !== 'adhd' && (
            <div className="lg:col-span-5 flex flex-col gap-8">
              {/* Active Goals */}
              <ActiveGoalsSection goals={goals} />

              {/* Quick Stats */}
              <QuickStats
                completedCount={completedToday}
                focusMinutes={focusMinutesToday}
                dayStreak={dayStreak}
              />
            </div>
          )}
        </div>
      </motion.div>
    </DashboardLayout>
  );
}
