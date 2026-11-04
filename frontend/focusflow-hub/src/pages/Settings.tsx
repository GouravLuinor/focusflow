import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { Brain, Calendar, Type, Sliders, Check, Sparkles, Sun, Moon } from 'lucide-react';
import { useApp, SupportMode, getAccessibilityDefaults } from '@/contexts/AppContext';
import { apiRequest } from '@/lib/api';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

interface ProfileResponse {
  id: number;
  support_mode: string;
  onboarding_completed: boolean;
}

export default function Settings() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { supportMode, setSupportMode, accessibility, setAccessibility } = useApp();

  const [activeMode, setActiveMode] = useState<SupportMode>(supportMode);
  
  // Accessibility states
  const [fontSize, setFontSize] = useState(accessibility.fontSize);
  const [dyslexiaFont, setDyslexiaFont] = useState(accessibility.dyslexiaFont);
  const [lineSpacing, setLineSpacing] = useState(accessibility.lineSpacing);
  const [letterSpacing, setLetterSpacing] = useState(accessibility.letterSpacing);
  const [zenMode, setZenMode] = useState(accessibility.zenMode);
  const [highContrast, setHighContrast] = useState(accessibility.highContrast);
  const [darkMode, setDarkMode] = useState(accessibility.darkMode);
  
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setActiveMode(supportMode);
    setFontSize(accessibility.fontSize);
    setDyslexiaFont(accessibility.dyslexiaFont);
    setLineSpacing(accessibility.lineSpacing);
    setLetterSpacing(accessibility.letterSpacing);
    setZenMode(accessibility.zenMode);
    setHighContrast(accessibility.highContrast);
    setDarkMode(accessibility.darkMode);
  }, [supportMode, accessibility]);

  const handleModeChange = (mode: SupportMode) => {
    setActiveMode(mode);
    const defaults = getAccessibilityDefaults(mode);
    setFontSize(defaults.fontSize);
    setDyslexiaFont(defaults.dyslexiaFont);
    setLineSpacing(defaults.lineSpacing);
    setLetterSpacing(defaults.letterSpacing);
    setZenMode(defaults.zenMode);
    setHighContrast(defaults.highContrast);
    setDarkMode(defaults.darkMode);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      const profile: ProfileResponse = await apiRequest('/profile', {
        method: 'POST',
        body: JSON.stringify({
          support_mode: activeMode || 'none',
        }),
      });

      const parsedMode = profile.support_mode === 'none' ? null : (profile.support_mode as SupportMode);
      setSupportMode(parsedMode);

      setAccessibility({
        fontSize,
        dyslexiaFont,
        lineSpacing,
        letterSpacing,
        zenMode,
        highContrast,
        darkMode,
        sessionDefaultMinutes: activeMode === 'adhd' ? 25 : 45,
        showExplicitDependencies: activeMode === 'autism',
        reducedTextDensity: activeMode === 'adhd' || activeMode === 'dyslexia',
      });

      queryClient.invalidateQueries({ queryKey: ['profile'] });

      toast({
        title: 'Settings Saved',
        description: 'Your neuro-inclusive preferences and appearance have been updated.',
      });
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to save settings');
    } finally {
      setIsSaving(false);
    }
  };

  const supportModesList = [
    {
      id: null,
      title: 'Standard Mode',
      description: 'Clean default interface with focus timers and daily timelines',
      icon: Sliders,
    },
    {
      id: 'adhd' as const,
      title: 'ADHD Support',
      description: 'Single-task prioritization, 25m momentum blocks, zero visual clutter',
      icon: Brain,
    },
    {
      id: 'autism' as const,
      title: 'Autism Support',
      description: 'Structured micro-steps, explicit dependency locks, predictable timelines',
      icon: Calendar,
    },
    {
      id: 'dyslexia' as const,
      title: 'Dyslexia Support',
      description: 'OpenDyslexic typography, relaxed line-height, high distinction styling',
      icon: Type,
    },
  ];

  return (
    <DashboardLayout>
      <div className="flex-1 p-6 md:p-8 max-w-[1100px] mx-auto w-full font-sans text-foreground">
        {/* Title Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold tracking-tight">Personalization & Ergonomics</h1>
          <p className="text-xs text-muted-foreground mt-1">
            Configure FocusFlow to match your unique cognitive rhythms and sensory preferences.
          </p>
        </div>

        <form onSubmit={handleSave} className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Support Mode selection (7 cols) */}
          <div className="lg:col-span-7 flex flex-col gap-6">
            <div className="bg-card border border-border rounded-2xl p-6 shadow-soft flex flex-col gap-4">
              <div className="flex items-center gap-2 mb-1">
                <Sparkles className="w-4 h-4 text-primary" />
                <h2 className="text-base font-semibold">Cognitive Support Mode</h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {supportModesList.map((mode) => {
                  const Icon = mode.icon;
                  const isActive = activeMode === mode.id;

                  return (
                    <button
                      key={mode.id || 'standard'}
                      type="button"
                      onClick={() => handleModeChange(mode.id)}
                      className={cn(
                        'flex flex-col text-left p-4 rounded-xl border transition-all duration-150',
                        isActive 
                          ? 'border-primary ring-1 ring-primary bg-primary/5 text-foreground' 
                          : 'border-border bg-background hover:border-primary/40 text-muted-foreground hover:text-foreground'
                      )}
                    >
                      <div className="flex justify-between items-start w-full mb-2.5">
                        <div className={cn(
                          'w-8 h-8 rounded-lg flex items-center justify-center',
                          isActive ? 'bg-primary/10 text-primary' : 'bg-secondary text-muted-foreground'
                        )}>
                          <Icon className="w-4 h-4" />
                        </div>
                        {isActive && (
                          <div className="w-4 h-4 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-[10px]">
                            <Check className="w-3 h-3" />
                          </div>
                        )}
                      </div>
                      <h3 className="text-sm font-semibold text-foreground mb-1">{mode.title}</h3>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        {mode.description}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Appearance Settings */}
            <div className="bg-card border border-border rounded-2xl p-6 shadow-soft flex flex-col gap-4">
              <div className="flex items-center gap-2">
                <h2 className="text-base font-semibold">Appearance & Atmosphere</h2>
              </div>
              <p className="text-xs text-muted-foreground -mt-2">
                Washi Paper light canvas or Smoked Ink dark obsidian
              </p>
              
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setDarkMode(false)}
                  className={cn(
                    'flex items-center justify-center gap-2 p-3.5 rounded-xl border transition-all',
                    !darkMode 
                      ? 'border-primary bg-primary/10 text-primary font-medium ring-1 ring-primary' 
                      : 'border-border bg-background text-muted-foreground hover:text-foreground'
                  )}
                >
                  <Sun className="w-4 h-4" />
                  <span className="text-xs font-semibold">Washi Light</span>
                </button>
                <button
                  type="button"
                  onClick={() => setDarkMode(true)}
                  className={cn(
                    'flex items-center justify-center gap-2 p-3.5 rounded-xl border transition-all',
                    darkMode 
                      ? 'border-primary bg-primary/10 text-primary font-medium ring-1 ring-primary' 
                      : 'border-border bg-background text-muted-foreground hover:text-foreground'
                  )}
                >
                  <Moon className="w-4 h-4" />
                  <span className="text-xs font-semibold">Smoked Ink Dark</span>
                </button>
              </div>
            </div>
          </div>

          {/* Right Column: Typography & Layout Toggles (5 cols) */}
          <div className="lg:col-span-5 flex flex-col gap-6">
            <div className="bg-card border border-border rounded-2xl p-6 shadow-soft flex flex-col gap-4">
              <h2 className="text-base font-semibold">Visual Ergonomics</h2>

              {/* Dyslexia Font Toggle */}
              <label className="flex items-center justify-between gap-4 p-3 bg-secondary/50 rounded-xl border border-border/50 cursor-pointer hover:bg-secondary transition-colors">
                <div>
                  <span className="text-xs font-semibold text-foreground block">OpenDyslexic Font</span>
                  <span className="text-[11px] text-muted-foreground">Weighted letterforms to prevent rotation</span>
                </div>
                <input
                  type="checkbox"
                  checked={dyslexiaFont}
                  onChange={(e) => setDyslexiaFont(e.target.checked)}
                  className="w-4 h-4 shrink-0 rounded text-primary focus-visible:ring-2 focus-visible:ring-primary accent-primary cursor-pointer"
                />
              </label>

              {/* Zen Mode Toggle */}
              <label className="flex items-center justify-between gap-4 p-3 bg-secondary/50 rounded-xl border border-border/50 cursor-pointer hover:bg-secondary transition-colors">
                <div>
                  <span className="text-xs font-semibold text-foreground block">Zen Mode</span>
                  <span className="text-[11px] text-muted-foreground">Hide ancillary badges and secondary widgets</span>
                </div>
                <input
                  type="checkbox"
                  checked={zenMode}
                  onChange={(e) => setZenMode(e.target.checked)}
                  className="w-4 h-4 shrink-0 rounded text-primary focus-visible:ring-2 focus-visible:ring-primary accent-primary cursor-pointer"
                />
              </label>

              {/* High Contrast Toggle */}
              <label className="flex items-center justify-between gap-4 p-3 bg-secondary/50 rounded-xl border border-border/50 cursor-pointer hover:bg-secondary transition-colors">
                <div>
                  <span className="text-xs font-semibold text-foreground block">High Contrast</span>
                  <span className="text-[11px] text-muted-foreground">Maximized edge separation for low vision</span>
                </div>
                <input
                  type="checkbox"
                  checked={highContrast}
                  onChange={(e) => setHighContrast(e.target.checked)}
                  className="w-4 h-4 shrink-0 rounded text-primary focus-visible:ring-2 focus-visible:ring-primary accent-primary cursor-pointer"
                />
              </label>

              {/* Font Size Selector */}
              <div>
                <label className="text-xs font-semibold text-foreground block mb-2">Base Font Size</label>
                <div className="grid grid-cols-3 gap-2">
                  {(['sm', 'base', 'lg'] as const).map((sz) => (
                    <button
                      key={sz}
                      type="button"
                      onClick={() => setFontSize(sz)}
                      className={cn(
                        'py-2 text-xs rounded-xl border capitalize font-medium transition-colors',
                        fontSize === sz 
                          ? 'border-primary bg-primary/10 text-primary' 
                          : 'border-border bg-background text-muted-foreground hover:text-foreground'
                      )}
                    >
                      {sz === 'sm' ? 'Compact' : sz === 'base' ? 'Standard' : 'Large'}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSaving}
                  className="w-full py-3 bg-primary hover:bg-primary/90 text-primary-foreground font-medium rounded-xl text-xs transition-all shadow-glow-vermilion disabled:opacity-50"
                >
                  {isSaving ? 'Saving Preferences...' : 'Save All Preferences'}
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
}
