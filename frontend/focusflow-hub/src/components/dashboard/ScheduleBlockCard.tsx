import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Check, BookOpen, Database, Code, ClipboardList } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format, parseISO } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/api';
import { useApp } from '@/contexts/AppContext';

export type BlockStatus = 'PLANNED' | 'ACTIVE' | 'COMPLETED' | 'MISSED' | 'RESCHEDULED';

export interface ScheduleBlock {
  id: number;
  task_id: number;
  task_title?: string;
  scheduled_start: string;
  scheduled_end: string;
  status: BlockStatus;
  estimated_minutes?: number;
}

interface ScheduleBlockCardProps {
  block: ScheduleBlock;
}

function getTaskIcon(title: string) {
  const t = title.toLowerCase();
  if (t.includes('sql') || t.includes('database') || t.includes('db') || t.includes('query')) {
    return Database;
  }
  if (t.includes('code') || t.includes('programming') || t.includes('dev') || t.includes('pr') || t.includes('react')) {
    return Code;
  }
  if (t.includes('read') || t.includes('book') || t.includes('study') || t.includes('system design')) {
    return BookOpen;
  }
  return ClipboardList;
}

function formatTime(iso: string): string {
  try {
    return format(parseISO(iso), 'HH:mm');
  } catch {
    return '00:00';
  }
}

export function ScheduleBlockCard({ block }: ScheduleBlockCardProps) {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { accessibility } = useApp();

  const { data: depsData } = useQuery<any>({
    queryKey: ['task', block.task_id, 'dependencies'],
    queryFn: () => apiRequest(`/tasks/${block.task_id}/dependencies`),
    enabled: !!accessibility?.showExplicitDependencies,
  });

  const blocking = depsData?.blocking ?? [];
  const unlocks = depsData?.unlocks ?? [];

  const [isRescheduling, setIsRescheduling] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Form states
  const todayStr = new Date().toISOString().split('T')[0];
  const nowPlusOne = new Date(Date.now() + 60 * 60 * 1000);
  const hourStr = String(nowPlusOne.getHours()).padStart(2, '0');
  const minStr = String(nowPlusOne.getMinutes()).padStart(2, '0');
  const defaultTimeStr = `${hourStr}:${minStr}`;

  const [rescheduleDate, setRescheduleDate] = useState(todayStr);
  const [rescheduleTime, setRescheduleTime] = useState(defaultTimeStr);

  const isCompleted = block.status === 'COMPLETED';
  const isActive = block.status === 'ACTIVE';

  const timeLabel = formatTime(block.scheduled_start);
  const taskTitle = block.task_title ?? `Task #${block.task_id}`;
  const duration = block.estimated_minutes ?? 45;
  const TaskIcon = getTaskIcon(taskTitle);

  const handleSkip = async () => {
    setIsLoading(true);
    try {
      await apiRequest(`/schedule/blocks/${block.id}`, {
        method: 'PUT',
        body: JSON.stringify({
          status: 'MISSED',
        }),
      });

      queryClient.invalidateQueries({ queryKey: ['schedule'] });
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['tasks', 'executable'] });

      toast({
        title: 'Task skipped',
        description: 'Task skipped — will be reprioritized tomorrow',
      });
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to skip task');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveReschedule = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const startDateTime = new Date(`${rescheduleDate}T${rescheduleTime}:00`);

      const originalStart = new Date(block.scheduled_start);
      const originalEnd = new Date(block.scheduled_end);
      const durationMs = originalEnd.getTime() - originalStart.getTime();

      const endDateTime = new Date(startDateTime.getTime() + durationMs);

      await apiRequest(`/schedule/blocks/${block.id}`, {
        method: 'PUT',
        body: JSON.stringify({
          scheduled_start: startDateTime.toISOString(),
          scheduled_end: endDateTime.toISOString(),
          status: 'RESCHEDULED',
        }),
      });

      queryClient.invalidateQueries({ queryKey: ['schedule'] });
      setIsRescheduling(false);
      toast({
        title: 'Task rescheduled',
        description: 'The schedule block times have been successfully updated.',
      });
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to reschedule');
    } finally {
      setIsLoading(false);
    }
  };

  if (isCompleted) {
    return (
      <div className="bg-white rounded-xl border border-[#E8E6E1] flex opacity-70 hover:opacity-100 transition-opacity">
        <div className="w-[3px] bg-[#059669] shrink-0 rounded-l-xl" />
        <div className="p-4 flex-1 flex items-center gap-4">
          <div className="w-16 text-[14px] text-[#6B6660] text-right shrink-0 font-sans">
            {timeLabel}
          </div>
          <div className="w-8 h-8 rounded-full bg-[#f0ecf9] flex items-center justify-center text-[#059669] shrink-0">
            <Check className="w-[18px] h-[18px]" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[18px] font-medium text-[#6B6660] line-through truncate font-sans">
              {taskTitle}
            </p>
          </div>
          <div className="text-[14px] text-[#6B6660] shrink-0 font-sans">
            {duration}m
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={cn(
      "bg-white rounded-xl border border-[#E8E6E1] flex flex-col transition-all",
      isActive && "shadow-[0_0_0_2px_rgba(79,70,229,0.15)] hover:scale-[1.01]"
    )}>
      <div className="flex items-center">
        <div className={cn(
          "w-[3px] self-stretch shrink-0 rounded-l-xl",
          isActive ? "bg-[#4F46E5]" : "bg-[#c7c4d8]"
        )} />
        <div className="p-4 flex-1 flex items-center gap-4">
          <div className={cn(
            "w-16 text-[14px] text-right shrink-0 font-sans",
            isActive ? "text-[#4F46E5] font-medium" : "text-[#6B6660]"
          )}>
            {timeLabel}
          </div>
          <div className={cn(
            "w-8 h-8 rounded-full flex items-center justify-center shrink-0",
            isActive ? "border-2 border-[#4F46E5] text-[#4F46E5]" : "border border-[#c7c4d8] text-[#9E988E]"
          )}>
            {isActive ? (
              <span className="w-2 h-2 rounded-full bg-[#4F46E5]" />
            ) : (
              <TaskIcon className="w-[18px] h-[18px]" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[18px] font-medium text-[#1A1A1A] truncate font-sans">
              {taskTitle}
            </p>
            {accessibility?.showExplicitDependencies && (blocking.length > 0 || unlocks.length > 0) && (
              <div className="flex flex-wrap gap-2 mt-1.5 mb-1.5">
                {blocking.map((dep: any) => (
                  <span key={dep.id} className="bg-[#D97706]/10 text-[#D97706] text-[11px] font-medium px-2 py-0.5 rounded">
                    Blocked by: {dep.title}
                  </span>
                ))}
                {unlocks.map((dep: any) => (
                  <span key={dep.id} className="bg-[#e2dfff] text-[#3323cc] text-[11px] font-medium px-2 py-0.5 rounded">
                    Unlocks: {dep.title}
                  </span>
                ))}
              </div>
            )}
            {!isRescheduling && (
              <div className="flex gap-3 mt-1 text-[12px] font-medium text-[#6B6660] font-sans">
                <button
                  onClick={() => setIsRescheduling(true)}
                  disabled={isLoading}
                  className="text-[#4F46E5] hover:underline"
                >
                  Reschedule
                </button>
                <button
                  onClick={handleSkip}
                  disabled={isLoading}
                  className="text-[#D97706] hover:underline"
                >
                  Skip
                </button>
              </div>
            )}
          </div>
          <div className={cn(
            "text-[14px] shrink-0 font-sans",
            isActive ? "text-[#4F46E5] font-medium" : "text-[#6B6660]"
          )}>
            {duration}m
          </div>
        </div>
      </div>

      {isRescheduling && (
        <form onSubmit={handleSaveReschedule} className="px-4 pb-4 flex flex-col gap-3 font-sans border-t border-[#E8E6E1]/50 pt-3">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1 flex flex-col gap-1">
              <label className="text-[11px] font-medium text-[#6B6660]">Date</label>
              <input
                type="date"
                required
                value={rescheduleDate}
                onChange={(e) => setRescheduleDate(e.target.value)}
                className="bg-white border border-[#E8E6E1] focus:border-[#4F46E5] rounded-lg p-2 text-[12px] outline-none"
              />
            </div>
            <div className="flex-1 flex flex-col gap-1">
              <label className="text-[11px] font-medium text-[#6B6660]">Time</label>
              <input
                type="time"
                required
                value={rescheduleTime}
                onChange={(e) => setRescheduleTime(e.target.value)}
                className="bg-white border border-[#E8E6E1] focus:border-[#4F46E5] rounded-lg p-2 text-[12px] outline-none"
              />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsRescheduling(false)}
              className="px-2.5 py-1.5 border border-[#E8E6E1] text-[#6B6660] text-[11px] font-medium rounded-lg hover:bg-[#FAF9F7]"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-3.5 py-1.5 bg-[#4F46E5] hover:bg-[#4338ca] text-white text-[11px] font-medium rounded-lg disabled:opacity-50"
            >
              {isLoading ? 'Saving...' : 'Save'}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
