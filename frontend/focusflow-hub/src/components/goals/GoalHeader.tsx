import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

interface GoalHeaderProps {
  title: string;
  progress: number;
  /** Human deadline label, e.g. "12 days remaining" or "No deadline". */
  deadlineStatus: string;
  tasksCompleted: number;
  tasksTotal: number;
}

export function GoalHeader({
  title,
  progress,
  deadlineStatus,
  tasksCompleted,
  tasksTotal,
}: GoalHeaderProps) {
  return (
    <section className="mb-8 font-sans">
      {/* Breadcrumb */}
      <div className="mb-6">
        <Link
          to="/dashboard"
          className="inline-flex items-center gap-2 text-[14px] text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Dashboard</span>
        </Link>
      </div>

      {/* Title */}
      <h1 className="text-[40px] font-semibold text-foreground leading-tight mb-4 tracking-tight">
        {title}
      </h1>

      {/* Metadata Row */}
      <div className="flex flex-wrap items-center gap-2 text-[14px] text-muted-foreground mb-6">
        <span>{progress}% complete</span>
        <span className="w-1 h-1 rounded-full bg-border" aria-hidden />
        <span>{deadlineStatus}</span>
        <span className="w-1 h-1 rounded-full bg-border" aria-hidden />
        <span>
          {tasksCompleted} of {tasksTotal} tasks done
        </span>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-muted rounded-full h-1.5 overflow-hidden">
        <div
          className="bg-primary h-1.5 rounded-full transition-all duration-500"
          style={{ width: `${progress}%` }}
        ></div>
      </div>
    </section>
  );
}
