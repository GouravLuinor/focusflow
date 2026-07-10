import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { CheckSquare, Crosshair, BarChart3, Settings, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useApp } from '@/contexts/AppContext';
import { CreateTaskDialog } from '../dashboard/CreateTaskDialog';

const navItems = [
  { to: '/dashboard', label: 'Tasks', icon: CheckSquare },
  { to: '/focus', label: 'Focus', icon: Crosshair },
  { to: '/insights', label: 'Insights', icon: BarChart3 },
  { to: '/settings', label: 'Settings', icon: Settings },
];

export function Sidebar() {
  const navigate = useNavigate();
  const { supportMode } = useApp();
  const [showCreateTask, setShowCreateTask] = useState(false);

  return (
    <aside className="hidden md:flex flex-col h-screen w-64 fixed left-0 top-0 z-40 bg-transparent border-r border-[#E8E6E1]/50 dark:bg-dark-background dark:border-dark-border py-8">
      {/* Brand */}
      <div className="px-8 mb-12">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-[#4F46E5] flex items-center justify-center text-white font-bold text-xl">
            FF
          </div>
          <div>
            <h1 className="text-xl font-medium text-[#1A1A1A] dark:text-dark-text-primary tracking-tight leading-tight">
              FocusFlow
            </h1>
            <p className="text-[12px] font-medium text-[#9E988E] dark:text-dark-text-muted mt-0.5">
              One task at a time
            </p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 space-y-2">
        {navItems.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-4 px-4 py-3 rounded-lg text-[12px] font-medium transition-all duration-200',
                isActive
                  ? 'text-[#4F46E5] border-l-4 border-[#4F46E5] bg-white dark:bg-dark-surface shadow-[0_0_0_2px_rgba(79,70,229,0.15)]'
                  : 'text-[#6B6660] hover:bg-[#eae6f4] hover:text-[#1A1A1A] dark:text-dark-text-secondary dark:hover:text-dark-text-primary dark:hover:bg-dark-surface'
              )
            }
          >
            {({ isActive }) => (
              <>
                <Icon
                  className={cn(
                    'w-[20px] h-[20px] shrink-0',
                    isActive ? 'text-[#4F46E5]' : 'text-[#6B6660] dark:text-dark-text-secondary'
                  )}
                />
                <span className="font-medium text-[12px]">{label}</span>
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* New Task & ADHD Focus CTA */}
      <div className="px-8 mt-auto flex flex-col gap-2">
        {supportMode === 'adhd' && (
          <button
            onClick={() => navigate('/focus')}
            className="w-full bg-[#f97316] hover:bg-[#ea580c] text-white text-[12px] font-semibold py-3 px-4 rounded-lg flex items-center justify-center gap-2 transition-all duration-200 shadow-md hover:shadow-lg hover:scale-[1.02]"
          >
            <Crosshair className="w-[18px] h-[18px]" />
            Start Focus (25m)
          </button>
        )}
        <button
          onClick={() => setShowCreateTask(true)}
          data-testid="create-task-btn"
          className="w-full bg-[#4F46E5] hover:bg-[#4338ca] text-white text-[12px] font-medium py-3 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors duration-200"
        >
          <Plus className="w-[18px] h-[18px]" />
          New Task
        </button>
      </div>

      <CreateTaskDialog
        open={showCreateTask}
        onClose={() => setShowCreateTask(false)}
      />
    </aside>
  );
}
