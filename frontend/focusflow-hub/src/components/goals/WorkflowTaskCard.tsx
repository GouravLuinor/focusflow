import { CheckCircle2, Lock, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';

export interface TaskItem {
  id: number;
  title: string;
  status: 'completed' | 'active' | 'ready' | 'blocked';
  subtasks?: string[];
  blockedBy?: string;
  unlocks?: string;
  waitingFor?: string[];
}

interface WorkflowTaskCardProps {
  task: TaskItem;
}

export function WorkflowTaskCard({ task }: WorkflowTaskCardProps) {
  const navigate = useNavigate();

  const handleStart = () => {
    navigate(`/focus/${task.id}`);
  };

  if (task.status === 'completed') {
    return (
      <div className="bg-white rounded-xl border border-[#E8E6E1] overflow-hidden opacity-70 hover:scale-[1.01] transition-transform duration-200 flex font-sans">
        <div className="w-1 bg-[#059669] shrink-0"></div>
        <div className="p-5 flex-1">
          <div className="flex justify-between items-start mb-2">
            <h3 className="text-[18px] font-medium text-[#6B6660] line-through leading-tight">
              {task.title}
            </h3>
            <CheckCircle2 className="w-5 h-5 text-[#059669] fill-[#059669] text-white shrink-0" />
          </div>
          {task.subtasks && task.subtasks.length > 0 && (
            <div className="flex gap-4 text-[12px] font-medium text-[#9E988E]">
              {task.subtasks.map((sub, i) => (
                <span key={i} className="flex items-center gap-1">
                  <Check className="w-4 h-4 text-[#9E988E]" />
                  {sub}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  if (task.status === 'active') {
    return (
      <div className="bg-white rounded-xl border border-[#E8E6E1] active-shadow overflow-hidden scale-[1.02] transition-transform duration-200 flex relative z-10 font-sans shadow-[0_0_0_2px_rgba(79,70,229,0.15)]">
        <div className="w-1 bg-[#4F46E5] shrink-0"></div>
        <div className="p-5 flex-1">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h3 className="text-[18px] font-medium text-[#1A1A1A] mb-2 leading-tight">
                {task.title}
              </h3>
              <div className="text-[12px] font-medium text-[#6B6660] flex flex-wrap gap-2">
                {task.blockedBy && (
                  <span className="bg-[#f0ecf9] px-2 py-1 rounded">
                    Blocked by: {task.blockedBy}
                  </span>
                )}
                {task.unlocks && (
                  <span className="bg-[#e2dfff] text-[#3323cc] px-2 py-1 rounded">
                    Unlocks: {task.unlocks}
                  </span>
                )}
              </div>
            </div>
            <button
              onClick={handleStart}
              className="bg-[#4F46E5] hover:bg-[#4338ca] text-white px-6 py-2.5 rounded-lg text-[12px] font-medium transition-colors duration-200 whitespace-nowrap"
            >
              Start Focus
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (task.status === 'ready') {
    return (
      <div className="bg-white rounded-xl border border-[#E8E6E1] overflow-hidden hover:scale-[1.01] transition-transform duration-200 flex font-sans">
        <div className="w-1 bg-[#4F46E5] shrink-0"></div>
        <div className="p-5 flex-1 flex justify-between items-center">
          <h3 className="text-[18px] font-medium text-[#1A1A1A] leading-tight">
            {task.title}
          </h3>
          <button
            onClick={handleStart}
            className="border border-[#c7c4d8] text-[#4F46E5] px-4 py-1.5 rounded-lg text-[12px] font-medium hover:bg-[#f5f2ff] transition-colors duration-200"
          >
            Start
          </button>
        </div>
      </div>
    );
  }

  // Blocked
  return (
    <div className="bg-white rounded-xl border border-[#E8E6E1] overflow-hidden opacity-60 flex font-sans">
      <div className="w-1 bg-[#D97706] shrink-0"></div>
      <div className="p-5 flex-1">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-[18px] font-medium text-[#9E988E] leading-tight">
            {task.title}
          </h3>
          <Lock className="w-5 h-5 text-[#D97706] shrink-0" />
        </div>
        {task.waitingFor && task.waitingFor.length > 0 && (
          <div className="text-[12px] font-medium text-[#D97706] bg-[#D97706]/10 inline-block px-2 py-1 rounded">
            Waiting for: {task.waitingFor.join(', ')}
          </div>
        )}
      </div>
    </div>
  );
}
