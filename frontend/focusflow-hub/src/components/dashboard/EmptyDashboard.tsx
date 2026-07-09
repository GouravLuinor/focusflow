import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ClipboardList, BarChart3, Trophy, Plus } from 'lucide-react';
import { CreateGoalDialog } from './CreateGoalDialog';
import { CreateTaskDialog } from './CreateTaskDialog';

interface EmptyDashboardProps {
  name: string;
}

function getTimeOfDay(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'morning';
  if (hour < 17) return 'afternoon';
  return 'evening';
}

export function EmptyDashboard({ name }: EmptyDashboardProps) {
  const navigate = useNavigate();
  const [showCreateGoal, setShowCreateGoal] = useState(false);
  const [showCreateTask, setShowCreateTask] = useState(false);
  const timeOfDay = getTimeOfDay();
  const firstName = name?.split(' ')[0] ?? 'there';

  return (
    <div className="p-6 md:p-8 flex flex-col lg:flex-row gap-8 w-full h-full pb-32 md:pb-8 mt-4 md:mt-0">
      {/* LEFT COLUMN: Greeting & Tasks */}
      <div className="flex-1 flex flex-col gap-8 animate-fade-in">
        {/* Header Section */}
        <header className="flex flex-col gap-2">
          <h1 className="text-[40px] font-semibold text-[#1b1b24] tracking-tight leading-none font-sans">
            Good {timeOfDay}, {firstName}
          </h1>
          <p className="text-[16px] text-[#9E988E] font-sans">
            Here's your empty slate. Let's get things organized.
          </p>
        </header>

        {/* Tasks Empty State */}
        <section className="flex-1 flex flex-col">
          <div className="flex justify-between items-end mb-6">
            <h2 className="text-[20px] font-medium text-[#1b1b24] font-sans">
              Your Tasks
            </h2>
          </div>

          {/* Empty State Container */}
          <div className="flex-1 bg-white border border-[#E8E6E1] rounded-xl p-8 flex flex-col items-center justify-center text-center min-h-[400px] transition-all duration-300 hover:shadow-[0_4px_20px_rgba(79,70,229,0.05)] relative overflow-hidden group">
            {/* Subtle Background Pattern */}
            <div
              className="absolute inset-0 opacity-[0.03] pointer-events-none group-hover:opacity-[0.05] transition-opacity duration-500"
              style={{
                backgroundImage: 'radial-gradient(#4f46e5 1px, transparent 1px)',
                backgroundSize: '24px 24px',
              }}
            />

            <div className="w-20 h-20 bg-[#4F46E5]/10 rounded-full flex items-center justify-center mb-6 text-[#4F46E5] border border-[#4F46E5]/20 shrink-0">
              <ClipboardList className="w-10 h-10 opacity-80" />
            </div>

            <h3 className="text-[18px] font-medium text-[#1b1b24] mb-3 font-sans">
              No tasks yet
            </h3>
            <p className="text-[14px] text-[#9E988E] max-w-sm mb-8 font-sans leading-relaxed">
              Ready to start? Add your first task to see your personalized recommendations here.
            </p>

            <button
              onClick={() => setShowCreateTask(true)}
              className="bg-[#4F46E5] hover:bg-[#4338ca] text-white font-medium py-3 px-6 rounded-lg flex items-center justify-center gap-2 hover:scale-105 active:scale-95 duration-200 transition-all shadow-sm hover:shadow-md relative overflow-hidden text-[12px] font-sans"
            >
              <Plus className="w-[18px] h-[18px]" />
              Create New Task
            </button>
          </div>
        </section>
      </div>

      {/* RIGHT COLUMN: Goals & Stats */}
      <div className="w-full lg:w-[400px] xl:w-[480px] flex flex-col gap-8 animate-fade-in">
        {/* Quick Stats Empty State */}
        <section className="bg-white rounded-xl border border-[#E8E6E1] p-6 flex flex-col gap-6 relative overflow-hidden group hover:border-[#4F46E5]/30 transition-colors duration-300">
          <h2 className="text-[20px] font-medium text-[#1b1b24] flex items-center gap-2 font-sans">
            <BarChart3 className="w-5 h-5 text-[#9E988E]" />
            Quick Stats
          </h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-[#FAF9F7] rounded-lg p-4 flex flex-col items-center justify-center text-center border border-[#E8E6E1]/50">
              <span className="text-[40px] font-semibold text-[#9E988E]/50 mb-1 font-sans leading-none">
                0
              </span>
              <span className="text-[12px] font-medium text-[#9E988E] uppercase tracking-wider font-sans">
                Tasks Done
              </span>
            </div>
            <div className="bg-[#FAF9F7] rounded-lg p-4 flex flex-col items-center justify-center text-center border border-[#E8E6E1]/50">
              <span className="text-[40px] font-semibold text-[#9E988E]/50 mb-1 font-sans leading-none">
                0h
              </span>
              <span className="text-[12px] font-medium text-[#9E988E] uppercase tracking-wider font-sans">
                Focus Time
              </span>
            </div>
          </div>
        </section>

        {/* Goals Empty State */}
        <section className="flex-1 flex flex-col">
          <h2 className="text-[20px] font-medium text-[#1b1b24] mb-4 font-sans">
            Current Goals
          </h2>
          <div
            onClick={() => setShowCreateGoal(true)}
            className="flex-1 bg-white border border-[#E8E6E1] border-dashed rounded-xl p-8 flex flex-col items-center justify-center text-center min-h-[300px] hover:border-[#4F46E5]/40 hover:bg-[#4F46E5]/5 transition-all duration-300 group cursor-pointer"
          >
            <div className="w-16 h-16 bg-[#FAF9F7] rounded-full flex items-center justify-center mb-4 text-[#9E988E] group-hover:text-[#4F46E5] group-hover:scale-110 transition-all duration-300 shrink-0">
              <Trophy className="w-8 h-8" />
            </div>
            <h3 className="text-[18px] font-medium text-[#1b1b24] mb-2 group-hover:text-[#4F46E5] transition-colors font-sans">
              Create your first goal
            </h3>
            <p className="text-[14px] text-[#9E988E] mb-6 font-sans">
              Set a milestone to track your progress.
            </p>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowCreateGoal(true);
              }}
              className="border-2 border-[#4F46E5] text-[#4F46E5] font-medium py-2.5 px-5 rounded-lg flex items-center justify-center gap-2 hover:bg-[#4F46E5]/10 transition-colors duration-200 text-[12px] font-sans"
            >
              <Plus className="w-[18px] h-[18px]" />
              Set Goal
            </button>
          </div>
        </section>
      </div>

      <CreateGoalDialog
        open={showCreateGoal}
        onClose={() => setShowCreateGoal(false)}
      />

      <CreateTaskDialog
        open={showCreateTask}
        onClose={() => setShowCreateTask(false)}
      />
    </div>
  );
}
