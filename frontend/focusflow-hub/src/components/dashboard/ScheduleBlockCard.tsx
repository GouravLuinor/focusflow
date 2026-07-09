import { Check, BookOpen, Database, Code, ClipboardList } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format, parseISO } from 'date-fns';

export type BlockStatus = 'PLANNED' | 'ACTIVE' | 'COMPLETED' | 'MISSED';

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
  const isCompleted = block.status === 'COMPLETED';
  const isActive = block.status === 'ACTIVE';
  const isPlanned = block.status === 'PLANNED';
  const isMissed = block.status === 'MISSED';

  const timeLabel = formatTime(block.scheduled_start);
  const taskTitle = block.task_title ?? `Task #${block.task_id}`;
  const duration = block.estimated_minutes ?? 45;
  const TaskIcon = getTaskIcon(taskTitle);

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

  if (isActive) {
    return (
      <div className="bg-white rounded-xl border border-[#E8E6E1] flex shadow-[0_0_0_2px_rgba(79,70,229,0.15)] hover:scale-[1.01] transition-transform">
        <div className="w-[3px] bg-[#4F46E5] shrink-0 rounded-l-xl" />
        <div className="p-4 flex-1 flex items-center gap-4">
          <div className="w-16 text-[14px] text-[#4F46E5] font-medium text-right shrink-0 font-sans">
            {timeLabel}
          </div>
          <div className="w-8 h-8 rounded-full border-2 border-[#4F46E5] flex items-center justify-center text-[#4F46E5] shrink-0">
            <span className="w-2 h-2 rounded-full bg-[#4F46E5]" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[18px] font-medium text-[#1A1A1A] truncate font-sans">
              {taskTitle}
            </p>
          </div>
          <div className="text-[14px] text-[#4F46E5] shrink-0 font-medium font-sans">
            {duration}m
          </div>
        </div>
      </div>
    );
  }

  // Planned / Upcoming or Missed
  return (
    <div className="bg-white rounded-xl border border-[#E8E6E1] flex hover:bg-[#f5f2ff] transition-colors">
      <div className="w-[3px] bg-[#c7c4d8] shrink-0 rounded-l-xl" />
      <div className="p-4 flex-1 flex items-center gap-4">
        <div className="w-16 text-[14px] text-[#6B6660] text-right shrink-0 font-sans">
          {timeLabel}
        </div>
        <div className="w-8 h-8 rounded-full border border-[#c7c4d8] flex items-center justify-center text-[#9E988E] shrink-0">
          <TaskIcon className="w-[18px] h-[18px]" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[18px] font-medium text-[#1A1A1A] truncate font-sans">
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
