import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

import { useApp } from '@/contexts/AppContext';
import { cn } from '@/lib/utils';

export function FocusBreadcrumb() {
  const navigate = useNavigate();
  const { supportMode } = useApp();

  return (
    <nav aria-label="Global" className="absolute top-0 left-0 w-full p-6 md:p-8 bg-transparent flex items-center justify-start z-10">
      <button
        onClick={() => navigate('/dashboard')}
        className={cn(
          "flex items-center gap-2 transition-colors focus:outline-none focus:ring-2 focus:ring-[#4F46E5]/20 rounded font-sans",
          supportMode === 'autism' 
            ? "text-[#4F46E5] hover:text-[#4338ca] font-semibold text-[15px] border border-[#4F46E5]/30 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-lg shadow-sm"
            : "text-[#9E988E] hover:text-[#1A1A1A] text-[14px]"
        )}
      >
        <ArrowLeft className={supportMode === 'autism' ? "w-[20px] h-[20px]" : "w-[18px] h-[18px]"} />
        <span>Back to Dashboard</span>
      </button>
    </nav>
  );
}
