import { Clock, CheckCircle, Search } from 'lucide-react';
import { useApp } from '@/contexts/AppContext';

export function TopBar() {
  const { user } = useApp();

  const initials = user?.name
    ? user.name
        .split(' ')
        .map((w) => w[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : 'A';

  return (
    <>
      {/* TopAppBar (Mobile) */}
      <header className="md:hidden flex justify-between items-center px-6 py-4 w-full h-16 bg-[#FAF9F7] dark:bg-dark-background z-40 sticky top-0 border-b border-[#E8E6E1]/50 dark:border-dark-border">
        <div className="text-[20px] font-medium text-[#4F46E5] tracking-tight">
          FocusFlow
        </div>
        <div className="flex gap-4 items-center">
          <div className="w-[36px] h-[36px] rounded-full bg-[#4F46E5]/20 flex items-center justify-center text-[#4F46E5] font-bold">
            {initials}
          </div>
        </div>
      </header>

      {/* Desktop Header Avatar (Hidden on mobile, absolute top-8 right-8) */}
      <div className="hidden md:flex justify-end pt-8 px-8 absolute top-0 right-0 z-30 gap-4 items-center">
        <div className="w-[36px] h-[36px] rounded-full bg-[#4F46E5]/20 flex items-center justify-center text-[#4F46E5] font-bold">
          {initials}
        </div>
      </div>
    </>
  );
}
