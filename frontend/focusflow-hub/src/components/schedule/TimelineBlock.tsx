import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { AlertCircle, Folder, Coffee, Minus, MoreVertical } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/api';

export interface BlockItem {
  id: number;
  time: string;
  title: string;
  duration: string;
  priority: string;
  goal: string | null;
  status: string;
  scheduled_start?: string;
  scheduled_end?: string;
}

interface TimelineBlockProps {
  block: BlockItem;
}

export function TimelineBlock({ block }: TimelineBlockProps) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const [showMenu, setShowMenu] = useState(false);
  const [isRescheduling, setIsRescheduling] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Form states for reschedule
  const todayStr = new Date().toISOString().split('T')[0];
  const nowPlusOne = new Date(Date.now() + 60 * 60 * 1000);
  const hourStr = String(nowPlusOne.getHours()).padStart(2, '0');
  const minStr = String(nowPlusOne.getMinutes()).padStart(2, '0');
  const defaultTimeStr = `${hourStr}:${minStr}`;

  const [rescheduleDate, setRescheduleDate] = useState(todayStr);
  const [rescheduleTime, setRescheduleTime] = useState(defaultTimeStr);

  const isActive = block.status === 'ACTIVE' || block.status === 'active';
  const isCompleted = block.status === 'COMPLETED' || block.status === 'completed';
  const isMissedOrRescheduled =
    block.status === 'MISSED' ||
    block.status === 'RESCHEDULED' ||
    block.status === 'rescheduled' ||
    block.status === 'missed';

  // Styles based on status
  const stripColorClass = isCompleted
    ? 'bg-[#059669]'
    : isActive
    ? 'bg-[#4F46E5]'
    : isMissedOrRescheduled
    ? 'bg-[#D97706]'
    : 'bg-[#e3e2e0]';

  const dotColorClass = isCompleted
    ? 'bg-[#059669]'
    : isActive
    ? 'bg-[#4F46E5]'
    : isMissedOrRescheduled
    ? 'bg-[#D97706]'
    : 'bg-[#E8E6E1]';

  const cardShadowClass = isActive
    ? 'shadow-[0_0_15px_rgba(79,70,229,0.15)] border-[#4F46E5]/20'
    : 'border-[#E8E6E1]';

  const opacityClass = isCompleted
    ? 'opacity-70 hover:opacity-100 transition-opacity'
    : block.status === 'upcoming' && block.title.includes('Buffer')
    ? 'opacity-70'
    : 'opacity-100';

  const priorityColorClass = block.priority.toLowerCase().includes('high')
    ? 'text-[#ba1a1a] bg-[#ffdad6]/30'
    : block.priority.toLowerCase().includes('medium')
    ? 'text-[#D97706] bg-[#D97706]/10'
    : 'text-[#6B6660] bg-[#f0ecf9]';

  const handleSaveReschedule = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      // Calculate datetime with timezone info using local constructor
      const startDateTime = new Date(`${rescheduleDate}T${rescheduleTime}:00`);

      let originalStart = block.scheduled_start ? new Date(block.scheduled_start) : new Date();
      let originalEnd = block.scheduled_end ? new Date(block.scheduled_end) : new Date(Date.now() + 45 * 60 * 1000);
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

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to remove this block?')) return;
    setIsLoading(true);
    try {
      await apiRequest(`/schedule/blocks/${block.id}`, {
        method: 'DELETE',
      });
      queryClient.invalidateQueries({ queryKey: ['schedule'] });
      toast({
        title: 'Block removed',
        description: 'The schedule block has been deleted.',
      });
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to remove block');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={`relative z-10 flex gap-4 mb-4 font-sans ${opacityClass}`}>
      {/* Dot on Timeline */}
      <div className={`w-2.5 h-2.5 rounded-full ${dotColorClass} mt-6 shrink-0 -ml-[24px] outline outline-4 outline-[#FAF9F7]`} />

      {/* Time Label */}
      <div className="text-[#6B6660] text-[12px] font-medium mt-5 shrink-0 w-12">
        {block.time}
      </div>

      {/* Card Detail */}
      <div
        className={`flex-1 bg-white border rounded-xl relative overflow-hidden transition-all duration-200 hover:scale-[1.01] ${cardShadowClass}`}
      >
        <div className={`absolute left-0 top-0 bottom-0 w-[3px] ${stripColorClass}`}></div>
        <div className="p-5 flex flex-col gap-2">
          <div className="flex justify-between items-start gap-4">
            <h4 className={`text-[18px] font-medium text-[#1A1A1A] leading-tight flex-1 ${isCompleted ? 'line-through text-[#6B6660]' : ''}`}>
              {block.title}
            </h4>
            <div className="flex items-center gap-2 shrink-0">
              <span className="text-[12px] text-[#6B6660] bg-[#FAF9F7] px-2 py-1 rounded border border-[#E8E6E1]/50 font-medium">
                {block.duration}
              </span>

              {/* Action Dropdown Menu Button */}
              {!isCompleted && !isRescheduling && (
                <div className="relative">
                  <button
                    onClick={() => setShowMenu(!showMenu)}
                    disabled={isLoading}
                    className="text-[#9E988E] hover:text-[#1A1A1A] p-1 rounded-lg hover:bg-[#FAF9F7] transition-all"
                  >
                    <MoreVertical className="w-4 h-4" />
                  </button>

                  {showMenu && (
                    <>
                      <div className="fixed inset-0 z-20" onClick={() => setShowMenu(false)} />
                      <div className="absolute right-0 mt-1 bg-white border border-[#E8E6E1] rounded-xl shadow-lg p-1.5 z-30 min-w-[120px] font-sans flex flex-col gap-0.5">
                        <button
                          onClick={() => {
                            setShowMenu(false);
                            setIsRescheduling(true);
                          }}
                          className="text-left text-[13px] font-medium text-[#1A1A1A] hover:bg-[#FAF9F7] px-2.5 py-1.5 rounded-lg transition-colors"
                        >
                          Reschedule
                        </button>
                        <button
                          onClick={() => {
                            setShowMenu(false);
                            handleSkip();
                          }}
                          className="text-left text-[13px] font-medium text-[#D97706] hover:bg-[#D97706]/10 px-2.5 py-1.5 rounded-lg transition-colors"
                        >
                          Skip
                        </button>
                        <button
                          onClick={() => {
                            setShowMenu(false);
                            handleDelete();
                          }}
                          className="text-left text-[13px] font-medium text-[#ba1a1a] hover:bg-[#ffdad6]/30 px-2.5 py-1.5 rounded-lg transition-colors"
                        >
                          Remove
                        </button>
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-wrap gap-3 mt-1">
            {block.priority !== 'Flexible' ? (
              <span className={`flex items-center gap-1 text-[12px] font-medium px-2 py-1 rounded ${priorityColorClass}`}>
                {block.priority.toLowerCase().includes('high') ? (
                  <AlertCircle className="w-3.5 h-3.5" />
                ) : (
                  <Minus className="w-3.5 h-3.5" />
                )}
                {block.priority}
              </span>
            ) : (
              <span className="flex items-center gap-1 text-[12px] font-medium text-[#6B6660] bg-[#f0ecf9] px-2 py-1 rounded">
                <Coffee className="w-3.5 h-3.5" />
                Flexible
              </span>
            )}

            {block.goal && (
              <span className="flex items-center gap-1 text-[12px] font-medium text-[#6B6660] bg-[#f0ecf9] px-2 py-1 rounded">
                <Folder className="w-3.5 h-3.5 text-[#9E988E]" />
                {block.goal}
              </span>
            )}
          </div>

          {/* Inline Reschedule Form */}
          {isRescheduling && (
            <form onSubmit={handleSaveReschedule} className="mt-3 pt-3 border-t border-[#E8E6E1] flex flex-col gap-3">
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="flex-1 flex flex-col gap-1">
                  <label className="text-[12px] font-medium text-[#6B6660]">Date</label>
                  <input
                    type="date"
                    required
                    value={rescheduleDate}
                    onChange={(e) => setRescheduleDate(e.target.value)}
                    className="bg-white border border-[#E8E6E1] focus:border-[#4F46E5] rounded-lg p-2 text-[13px] outline-none transition-colors"
                  />
                </div>
                <div className="flex-1 flex flex-col gap-1">
                  <label className="text-[12px] font-medium text-[#6B6660]">Time</label>
                  <input
                    type="time"
                    required
                    value={rescheduleTime}
                    onChange={(e) => setRescheduleTime(e.target.value)}
                    className="bg-white border border-[#E8E6E1] focus:border-[#4F46E5] rounded-lg p-2 text-[13px] outline-none transition-colors"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 mt-1">
                <button
                  type="button"
                  onClick={() => setIsRescheduling(false)}
                  className="px-3 py-1.5 border border-[#E8E6E1] text-[#6B6660] text-[12px] font-medium rounded-lg hover:bg-[#FAF9F7] transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="px-4 py-1.5 bg-[#4F46E5] hover:bg-[#4338ca] text-white text-[12px] font-medium rounded-lg disabled:opacity-50 transition-colors"
                >
                  {isLoading ? 'Saving...' : 'Save'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
