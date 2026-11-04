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
      <div className="bg-card rounded-2xl border border-border flex opacity-70 hover:opacity-100 transition-opacity font-sans shadow-soft">
        <div className="w-1.5 bg-success shrink-0" />
        <div className="p-4 flex-1 flex items-center gap-3">
          <div className="w-12 text-xs text-muted-foreground text-right shrink-0 font-sans">
            {timeLabel}
          </div>
          <div className="w-7 h-7 rounded-lg bg-success/10 flex items-center justify-center text-success shrink-0">
            <Check className="w-4 h-4" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-muted-foreground line-through truncate font-sans">
              {taskTitle}
            </p>
          </div>
          <div className="text-xs text-muted-foreground shrink-0 font-sans">
            {duration}m
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={cn(
      "bg-card rounded-2xl border border-border flex flex-col transition-all font-sans shadow-soft",
      isActive && "border-primary/50 shadow-medium"
    )}>
      <div className="flex items-center">
        <div className={cn(
          "w-1.5 self-stretch shrink-0",
          isActive ? "bg-primary" : "bg-border"
        )} />
        <div className="p-4 flex-1 flex items-center gap-3">
          <div className={cn(
            "w-12 text-xs text-right shrink-0 font-sans",
            isActive ? "text-primary font-medium" : "text-muted-foreground"
          )}>
            {timeLabel}
          </div>
          <div className={cn(
            "w-7 h-7 rounded-lg flex items-center justify-center shrink-0",
            isActive ? "bg-primary/10 text-primary border border-primary/20" : "bg-secondary text-muted-foreground"
          )}>
            {isActive ? (
              <span className="w-2 h-2 rounded-full bg-primary" />
            ) : (
              <TaskIcon className="w-3.5 h-3.5" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-foreground truncate font-sans">
              {taskTitle}
            </p>
            {accessibility?.showExplicitDependencies && (blocking.length > 0 || unlocks.length > 0) && (
              <div className="flex flex-wrap gap-1 mt-1 mb-1">
                {blocking.map((dep: any) => (
                  <span key={dep.id} className="bg-accent/10 text-accent text-[10px] font-medium px-1.5 py-0.5 rounded">
                    Blocked: {dep.title}
                  </span>
                ))}
                {unlocks.map((dep: any) => (
                  <span key={dep.id} className="bg-secondary text-foreground text-[10px] font-medium px-1.5 py-0.5 rounded">
                    Unlocks: {dep.title}
                  </span>
                ))}
              </div>
            )}
            {!isRescheduling && (
              <div className="flex gap-2.5 mt-1 text-[11px] font-medium text-muted-foreground font-sans">
                <button
                  onClick={() => setIsRescheduling(true)}
                  disabled={isLoading}
                  className="text-primary hover:underline"
                >
                  Reschedule
                </button>
                <button
                  onClick={handleSkip}
                  disabled={isLoading}
                  className="text-accent hover:underline"
                >
                  Skip
                </button>
              </div>
            )}
          </div>
          <div className={cn(
            "text-xs shrink-0 font-sans",
            isActive ? "text-primary font-medium" : "text-muted-foreground"
          )}>
            {duration}m
          </div>
        </div>
      </div>

      {isRescheduling && (
        <form onSubmit={handleSaveReschedule} className="px-4 pb-4 flex flex-col gap-2.5 font-sans border-t border-border/50 pt-3">
          <div className="flex flex-col sm:flex-row gap-2.5">
            <div className="flex-1 flex flex-col gap-1">
              <label className="text-[10px] font-medium text-muted-foreground">Date</label>
              <input
                type="date"
                required
                value={rescheduleDate}
                onChange={(e) => setRescheduleDate(e.target.value)}
                className="bg-background border border-border focus:border-primary rounded-xl p-2 text-xs outline-none"
              />
            </div>
            <div className="flex-1 flex flex-col gap-1">
              <label className="text-[10px] font-medium text-muted-foreground">Time</label>
              <input
                type="time"
                required
                value={rescheduleTime}
                onChange={(e) => setRescheduleTime(e.target.value)}
                className="bg-background border border-border focus:border-primary rounded-xl p-2 text-xs outline-none"
              />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsRescheduling(false)}
              className="px-2.5 py-1 border border-border text-muted-foreground text-xs font-medium rounded-xl hover:bg-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-3.5 py-1 bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-medium rounded-xl disabled:opacity-50"
            >
              {isLoading ? 'Saving...' : 'Save'}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
