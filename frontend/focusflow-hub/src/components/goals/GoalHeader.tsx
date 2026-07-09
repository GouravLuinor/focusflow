import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

interface GoalHeaderProps {
  title: string;
  progress: number;
  daysRemaining: number;
  tasksCompleted: number;
  tasksTotal: number;
}

export function GoalHeader({
  title,
  progress,
  daysRemaining,
  tasksCompleted,
  tasksTotal,
}: GoalHeaderProps) {
  return (
    <section className="mb-8 font-sans">
      {/* Breadcrumb */}
      <div className="mb-6">
        <Link
          to="/dashboard"
          className="inline-flex items-center gap-2 text-[14px] text-[#6B6660] hover:text-[#1A1A1A] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Dashboard</span>
        </Link>
      </div>

      {/* Title */}
      <h1 className="text-[40px] font-semibold text-[#1A1A1A] leading-tight mb-4 tracking-tight">
        {title}
      </h1>

      {/* Metadata Row */}
      <div className="flex flex-wrap items-center gap-2 text-[14px] text-[#6B6660] mb-6">
        <span>{progress}% complete</span>
        <span className="w-1 h-1 rounded-full bg-[#E8E6E1]" />
        <span>{daysRemaining} days remaining</span>
        <span className="w-1 h-1 rounded-full bg-[#E8E6E1]" />
        <span>
          {tasksCompleted} of {tasksTotal} tasks done
        </span>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-[#eae6f4] rounded-full h-1.5 overflow-hidden">
        <div
          className="bg-[#4F46E5] h-1.5 rounded-full transition-all duration-500"
          style={{ width: `${progress}%` }}
        ></div>
      </div>
    </section>
  );
}
