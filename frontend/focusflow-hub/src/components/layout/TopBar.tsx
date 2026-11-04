import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { User as UserIcon, Settings, LogOut } from 'lucide-react';
import { useApp } from '@/contexts/AppContext';
import { Logo } from '@/components/shared/Logo';

export function TopBar() {
  const { user, logout } = useApp();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const initial = user?.name ? user.name.charAt(0).toUpperCase() : null;
  const email = user?.email || '';
  const name = user?.name || 'User';

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    setIsOpen(false);
    navigate('/login');
  };

  const handleSettingsClick = () => {
    setIsOpen(false);
    navigate('/settings');
  };

  const renderAvatar = () => (
    <button
      onClick={() => setIsOpen(!isOpen)}
      className="w-8 h-8 rounded-full bg-primary/10 text-primary border border-primary/20 flex items-center justify-center font-semibold text-xs focus:outline-none hover:bg-primary/20 transition-colors"
      aria-label="User menu"
    >
      {initial ? initial : <UserIcon className="w-4 h-4" />}
    </button>
  );

  return (
    <>
      {/* TopAppBar (Mobile) */}
      <header className="md:hidden flex justify-between items-center px-4 py-3 w-full h-14 bg-background z-40 sticky top-0 border-b border-border">
        <div className="flex items-center gap-2">
          <Logo size={28} />
          <span className="text-base font-semibold text-foreground tracking-tight">
            FocusFlow
          </span>
        </div>
        <div className="flex gap-4 items-center relative" ref={dropdownRef}>
          {renderAvatar()}
          {isOpen && (
            <div className="absolute right-0 top-10 w-52 bg-card border border-border rounded-xl shadow-medium py-1.5 z-50 animate-fade-in">
              <div className="px-3.5 py-2 border-b border-border/50">
                <p className="text-xs font-semibold text-foreground truncate">{name}</p>
                <p className="text-[11px] text-muted-foreground truncate">{email}</p>
              </div>
              <button
                onClick={handleSettingsClick}
                className="w-full flex items-center gap-2 px-3.5 py-2 text-xs text-muted-foreground hover:text-foreground hover:bg-secondary text-left transition-colors"
              >
                <Settings className="w-3.5 h-3.5" />
                Settings
              </button>
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-2 px-3.5 py-2 text-xs text-destructive hover:bg-destructive/10 text-left transition-colors"
              >
                <LogOut className="w-3.5 h-3.5" />
                Logout
              </button>
            </div>
          )}
        </div>
      </header>

      {/* Desktop Header Avatar */}
      <div className="hidden md:flex justify-end pt-6 px-8 absolute top-0 right-0 z-30 gap-4 items-center" ref={dropdownRef}>
        <div className="relative">
          {renderAvatar()}
          {isOpen && (
            <div className="absolute right-0 top-10 w-52 bg-card border border-border rounded-xl shadow-medium py-1.5 z-50 animate-fade-in">
              <div className="px-3.5 py-2 border-b border-border/50">
                <p className="text-xs font-semibold text-foreground truncate">{name}</p>
                <p className="text-[11px] text-muted-foreground truncate">{email}</p>
              </div>
              <button
                onClick={handleSettingsClick}
                className="w-full flex items-center gap-2 px-3.5 py-2 text-xs text-muted-foreground hover:text-foreground hover:bg-secondary text-left transition-colors"
              >
                <Settings className="w-3.5 h-3.5" />
                Settings
              </button>
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-2 px-3.5 py-2 text-xs text-destructive hover:bg-destructive/10 text-left transition-colors"
              >
                <LogOut className="w-3.5 h-3.5" />
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
