import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

import { useApp } from '@/contexts/AppContext';
import { cn } from '@/lib/utils';
import { AmbientSoundPlayer } from './AmbientSoundPlayer';

export function FocusBreadcrumb() {
  const navigate = useNavigate();
  const { supportMode } = useApp();

  return (
    <nav aria-label="Focus Navigation" className="absolute top-0 left-0 w-full p-6 md:p-8 bg-transparent flex items-center justify-between z-30 font-sans">
      <button
        onClick={() => navigate('/dashboard')}
        className={cn(
          "flex items-center gap-2 transition-colors focus:outline-none rounded-xl px-3 py-1.5",
          supportMode === 'autism' 
            ? "text-primary font-semibold text-xs border border-primary/30 bg-card/80 backdrop-blur-sm shadow-soft"
            : "text-muted-foreground hover:text-foreground text-xs hover:bg-secondary/60"
        )}
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Dashboard</span>
      </button>

      {/* Sensory Audio Controls */}
      <AmbientSoundPlayer />
    </nav>
  );
}
