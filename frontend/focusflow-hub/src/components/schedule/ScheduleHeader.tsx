import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

export function ScheduleHeader() {
  return (
    <div className="mb-8 font-sans">
      <div className="mb-4">
        <Link
          to="/dashboard"
          className="inline-flex items-center gap-2 text-[14px] text-[#6B6660] hover:text-[#1A1A1A] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Dashboard</span>
        </Link>
      </div>
      <h2 className="text-[32px] font-semibold text-[#1A1A1A] mb-1 tracking-tight">
        Schedule
      </h2>
      <p className="text-[16px] text-[#6B6660]">
        Your planned focus sessions
      </p>
    </div>
  );
}
