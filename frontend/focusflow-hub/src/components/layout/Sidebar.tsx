import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { CheckSquare, Crosshair, BarChart3, Settings, Plus, LogOut } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useApp } from '@/contexts/AppContext';
import { Logo } from '@/components/shared/Logo';
import { CreateTaskDialog } from '../dashboard/CreateTaskDialog';

const navItems = [
  { to: '/dashboard', label: 'Tasks', icon: CheckSquare },
  { to: '/focus', label: 'Focus', icon: Crosshair },
  { to: '/insights', label: 'Insights', icon: BarChart3 },
  { to: '/settings', label: 'Settings', icon: Settings },
];

export function Sidebar() {
  const navigate = useNavigate();
  const { supportMode, logout } = useApp();
  const [showCreateTask, setShowCreateTask] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <aside className="hidden md:flex flex-col h-screen w-64 fixed left-0 top-0 z-40 bg-sidebar border-r border-sidebar-border py-6 px-4">
      {/* Brand Header */}
      <div className="px-3 mb-8">
        <div className="flex items-center gap-3">
          <Logo size={36} />
          <div>
            <h1 className="text-base font-semibold text-foreground tracking-tight leading-tight font-sans">
              FocusFlow
            </h1>
            <p className="text-[11px] font-medium text-muted-foreground">
              One thing at a time
            </p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1">
        {navItems.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all duration-150',
                isActive
                  ? 'text-primary bg-card border border-border shadow-soft font-semibold'
                  : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
              )
            }
          >
            {({ isActive }) => (
              <>
                <Icon
                  className={cn(
                    'w-4 h-4 shrink-0',
                    isActive ? 'text-primary' : 'text-muted-foreground'
                  )}
                />
                <span>{label}</span>
              </>
            )}
          </NavLink>
        ))}

        {/* Logout Button */}
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-medium text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors mt-4"
        >
          <LogOut className="w-4 h-4 shrink-0" />
          <span>Logout</span>
        </button>
      </nav>

      {/* Action Buttons */}
      <div className="mt-auto flex flex-col gap-2 pt-4 border-t border-border/50">
        {supportMode === 'adhd' && (
          <button
            onClick={() => navigate('/focus')}
            className="w-full bg-secondary hover:bg-secondary/80 text-foreground border border-border text-xs font-medium py-2.5 px-3 rounded-xl flex items-center justify-center gap-2 transition-all"
          >
            <Crosshair className="w-4 h-4 text-primary" />
            Start Focus Flow
          </button>
        )}
        <button
          onClick={() => setShowCreateTask(true)}
          data-testid="create-task-btn"
          className="w-full bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-medium py-2.5 px-3 rounded-xl flex items-center justify-center gap-2 transition-all shadow-glow-vermilion"
        >
          <Plus className="w-4 h-4" />
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
