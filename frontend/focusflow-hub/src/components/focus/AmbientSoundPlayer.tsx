import { useState, useEffect } from 'react';
import { Volume2, VolumeX, Sparkles, Sliders } from 'lucide-react';
import { ambientSound, type AmbientSoundType } from '@/lib/audio-synthesizer';
import { cn } from '@/lib/utils';

export function AmbientSoundPlayer() {
  const [isOpen, setIsOpen] = useState(false);
  const [currentSound, setCurrentSound] = useState<AmbientSoundType>('none');
  const [volume, setVolume] = useState(50);

  useEffect(() => {
    return () => {
      ambientSound.stop();
    };
  }, []);

  const handleSelectSound = (type: AmbientSoundType) => {
    setCurrentSound(type);
    ambientSound.play(type);
  };

  const handleVolumeChange = (newVol: number) => {
    setVolume(newVol);
    ambientSound.setVolume(newVol / 100);
  };

  const sounds: { type: AmbientSoundType; label: string; icon: string; desc: string }[] = [
    { type: 'none', label: 'Off', icon: '🔇', desc: 'Silence' },
    { type: 'stream', label: 'Bamboo Stream', icon: '🎋', desc: 'Soft water flow & resonance' },
    { type: 'rain', label: 'Washi Rain', icon: '🌧️', desc: 'Pink noise audio shield' },
    { type: 'brown', label: 'Deep Brown Noise', icon: '🤎', desc: 'ADHD speech masking' },
    { type: 'binaural', label: '40Hz Binaural', icon: '🎧', desc: 'Gamma focus frequencies' },
  ];

  return (
    <div className="relative font-sans">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          'flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-medium transition-all',
          currentSound !== 'none'
            ? 'border-primary/50 bg-primary/10 text-primary'
            : 'border-border bg-card text-muted-foreground hover:text-foreground'
        )}
        title="Sensory Focus Audio"
      >
        {currentSound === 'none' ? (
          <VolumeX className="w-3.5 h-3.5" />
        ) : (
          <Volume2 className="w-3.5 h-3.5 text-primary animate-pulse" />
        )}
        <span className="hidden sm:inline">
          {currentSound === 'none' ? 'Ambient Sound' : sounds.find((s) => s.type === currentSound)?.label}
        </span>
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute right-0 top-10 w-64 bg-card border border-border rounded-2xl p-4 shadow-medium z-50 text-left">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-primary" />
                Sensory Soundscapes
              </span>
              <span className="text-[10px] text-muted-foreground">Procedural Audio</span>
            </div>

            <div className="space-y-1.5 mb-4">
              {sounds.map((s) => {
                const isActive = currentSound === s.type;
                return (
                  <button
                    key={s.type}
                    onClick={() => handleSelectSound(s.type)}
                    className={cn(
                      'w-full flex items-center justify-between p-2 rounded-xl text-left transition-all text-xs',
                      isActive
                        ? 'bg-primary/10 border border-primary/30 text-primary font-medium'
                        : 'hover:bg-secondary/80 text-foreground border border-transparent'
                    )}
                  >
                    <div className="flex items-center gap-2">
                      <span>{s.icon}</span>
                      <div>
                        <p className="font-semibold leading-tight">{s.label}</p>
                        <p className="text-[10px] text-muted-foreground">{s.desc}</p>
                      </div>
                    </div>
                    {isActive && (
                      <span className="w-2 h-2 rounded-full bg-primary shrink-0" />
                    )}
                  </button>
                );
              })}
            </div>

            {currentSound !== 'none' && (
              <div className="pt-3 border-t border-border/50">
                <div className="flex items-center justify-between text-[10px] text-muted-foreground mb-1.5">
                  <span className="flex items-center gap-1">
                    <Sliders className="w-3 h-3" /> Volume
                  </span>
                  <span>{volume}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={volume}
                  onChange={(e) => handleVolumeChange(Number(e.target.value))}
                  className="w-full h-1.5 bg-secondary rounded-lg appearance-none cursor-pointer accent-primary"
                />
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
