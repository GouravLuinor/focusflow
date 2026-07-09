import { ReactNode } from 'react';
import { NavLink } from 'react-router-dom';
import { CheckSquare, Crosshair, BarChart3, Settings } from 'lucide-react';
import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';
import { cn } from '@/lib/utils';

interface DashboardLayoutProps {
  children: ReactNode;
}

const mobileNavItems = [
  { to: '/dashboard', label: 'Tasks', icon: CheckSquare },
  { to: '/focus', label: 'Focus', icon: Crosshair },
  { to: '/insights', label: 'Insights', icon: BarChart3 },
  { to: '/settings', label: 'Settings', icon: Settings },
];

export function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <div className="bg-[#FAF9F7] text-[#1A1A1A] antialiased min-h-screen flex flex-col md:flex-row overflow-x-hidden font-sans">
      {/* Desktop Sidebar */}
      <Sidebar />

      {/* TopBar (includes mobile top bar and absolute desktop avatar) */}
      <TopBar />

      {/* Main Content Area */}
      <main className="flex-1 w-full md:pl-64 max-w-[1600px] mx-auto min-h-screen relative">
        {children}
      </main>

      {/* Bottom Nav (Mobile Only) */}
      <nav className="md:hidden fixed bottom-0 w-full h-16 bg-white border-t border-[#E8E6E1] flex justify-around items-center px-4 pb-safe z-50 shadow-[0_-4px_20px_rgba(0,0,0,0.03)]">
        {mobileNavItems.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              cn(
                'flex flex-col items-center justify-center w-16 h-full transition-colors relative',
                isActive ? 'text-[#4F46E5]' : 'text-[#9E988E]'
              )
            }
          >
            {({ isActive }) => (
              <>
                {isActive && (
                  <div className="absolute -top-1 w-8 h-1 bg-[#4F46E5] rounded-b-full"></div>
                )}
                <Icon className="w-6 h-6 mb-0.5" />
                <span className="text-[10px] font-medium">{label}</span>
              </>
            )}
          </NavLink>
        ))}
      </nav>
    </div>
  );
}
