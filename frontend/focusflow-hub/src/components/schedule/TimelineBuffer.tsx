import { Clock } from 'lucide-react';

interface TimelineBufferProps {
  fromTime: string;
  toTime: string;
  minutes: number;
}

export function TimelineBuffer({ fromTime, toTime, minutes }: TimelineBufferProps) {
  return (
    <div className="relative z-10 flex gap-4 mb-4 pl-16 font-sans">
      <div className="flex-1 flex items-center gap-2 text-[#9E988E] text-[14px] py-2">
        <Clock className="w-4 h-4 text-[#9E988E]" />
        <span>
          {fromTime} &rarr; {toTime} &middot; {minutes} min buffer
        </span>
      </div>
    </div>
  );
}
