import { useState, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Brain, Calendar, Type, Sliders, Check, Sparkles } from 'lucide-react';
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

  // Synchronize component state when global accessibility state changes (e.g. initial load)
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

  // When support mode changes, show pre-filled default toggles for that mode
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
      // 1. Persist support mode to backend database
      const profile: ProfileResponse = await apiRequest('/profile', {
        method: 'POST',
        body: JSON.stringify({
          support_mode: activeMode || 'none',
        }),
      });

      // 2. Sync global support mode
      const parsedMode = profile.support_mode === 'none' ? null : (profile.support_mode as SupportMode);
      setSupportMode(parsedMode);

      // 3. Sync global accessibility options
      const nextSettings = {
        fontSize,
        dyslexiaFont,
        lineSpacing,
        letterSpacing,
        zenMode,
        highContrast,
        darkMode,
        sessionDefaultMinutes: activeMode === 'adhd' ? 25 : 45,
        showExplicitDependencies: activeMode === 'autism',
        reducedTextDensity: activeMode === 'dyslexia',
      };
      setAccessibility(nextSettings);

      // Invalidate queries so components re-trigger rendering with new profiles/layouts
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['schedule'] });

      toast({
        title: 'Settings updated',
        description: 'Your customization preferences have been saved successfully.',
      });
    } catch (err) {
      toast({
        title: 'Error saving settings',
        description: err instanceof Error ? err.message : 'Something went wrong',
        variant: 'destructive',
      });
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
      colorClass: 'border-[#E8E6E1]',
      activeColorClass: 'border-[#4F46E5] ring-2 ring-[#4F46E5]/10',
    },
    {
      id: 'adhd' as const,
      title: 'ADHD Support',
      description: 'Single-task prioritization, shorter 25m timers, reduced visual clutter',
      icon: Brain,
      colorClass: 'border-[#E8E6E1]',
      activeColorClass: 'border-[#f97316] ring-2 ring-[#f97316]/10',
    },
    {
      id: 'autism' as const,
      title: 'Autism Support',
      description: 'Structured checklists, explicit dependency labels, multi-day week overview calendar',
      icon: Calendar,
      colorClass: 'border-[#E8E6E1]',
      activeColorClass: 'border-[#0284c7] ring-2 ring-[#0284c7]/10',
    },
    {
      id: 'dyslexia' as const,
      title: 'Dyslexia Support',
      description: 'OpenDyslexic typography, larger text options, relaxed layout spacing',
      icon: Type,
      colorClass: 'border-[#E8E6E1]',
      activeColorClass: 'border-[#d97706] ring-2 ring-[#d97706]/10',
    },
  ];

  return (
    <DashboardLayout>
      <div className="flex-1 p-6 md:p-8 max-w-[1200px] mx-auto w-full font-sans text-[#1A1A1A]">
        {/* Title Header */}
        <div className="mb-8">
          <h2 className="text-[28px] font-bold tracking-tight">Personalization Settings</h2>
          <p className="text-[14px] text-[#6B6660] mt-1">
            Configure FocusFlow to match your unique cognitive style and accessibility preferences.
          </p>
        </div>

        <form onSubmit={handleSave} className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Support Mode selection (7 cols) */}
          <div className="lg:col-span-7 flex flex-col gap-6">
            <div className="bg-white border border-[#E8E6E1] rounded-2xl p-6 shadow-sm flex flex-col gap-4">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="w-5 h-5 text-[#4F46E5]" />
                <h3 className="text-[18px] font-semibold">Cognitive Support Mode</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {supportModesList.map((mode) => {
                  const Icon = mode.icon;
                  const isActive = activeMode === mode.id;

                  return (
                    <button
                      key={mode.id || 'standard'}
                      type="button"
                      onClick={() => handleModeChange(mode.id)}
                      className={cn(
                        'flex flex-col text-left p-4 rounded-xl border transition-all duration-200 hover:scale-[1.01]',
                        isActive ? mode.activeColorClass : mode.colorClass,
                        'bg-white'
                      )}
                    >
                      <div className="flex justify-between items-start w-full mb-3">
                        <div className={cn(
                          'w-9 h-9 rounded-lg flex items-center justify-center',
                          isActive 
                            ? mode.id === 'adhd' ? 'bg-[#f97316]/10 text-[#f97316]' 
                              : mode.id === 'autism' ? 'bg-[#0284c7]/10 text-[#0284c7]'
                              : mode.id === 'dyslexia' ? 'bg-[#d97706]/10 text-[#d97706]'
                              : 'bg-[#4F46E5]/10 text-[#4F46E5]'
                            : 'bg-[#FAF9F7] text-[#9E988E]'
                        )}>
                          <Icon className="w-5 h-5" />
                        </div>
                        {isActive && (
                          <div className={cn(
                            'w-5 h-5 rounded-full flex items-center justify-center text-white text-[12px] font-bold',
                            mode.id === 'adhd' ? 'bg-[#f97316]' 
                              : mode.id === 'autism' ? 'bg-[#0284c7]'
                              : mode.id === 'dyslexia' ? 'bg-[#d97706]'
                              : 'bg-[#4F46E5]'
                          )}>
                            <Check className="w-3.5 h-3.5" />
                          </div>
                        )}
                      </div>
                      <h4 className="text-[15px] font-bold mb-1">{mode.title}</h4>
                      <p className="text-[12px] text-[#6B6660] leading-relaxed flex-1">
                        {mode.description}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Appearance Settings */}
            <div className="bg-white border border-[#E8E6E1] rounded-2xl p-6 shadow-sm flex flex-col gap-4">
              <div className="flex items-center gap-2 mb-2">
                <h3 className="text-[18px] font-semibold">Appearance</h3>
              </div>
              <p className="text-[12px] text-[#6B6660] -mt-2">
                Choose your preferred theme
              </p>
              
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setDarkMode(false)}
                  className={cn(
                    'flex items-center justify-center gap-2 p-4 rounded-xl border transition-all duration-200 hover:scale-[1.01]',
                    !darkMode 
                      ? 'border-[#4F46E5] bg-[#4F46E5]/5 text-[#4F46E5] ring-2 ring-[#4F46E5]/10' 
                      : 'border-[#E8E6E1] bg-white text-[#1A1A1A]'
                  )}
                >
                  <span className="text-lg">☀️</span>
                  <span className="text-[14px] font-semibold">Light</span>
                </button>
                <button
                  type="button"
                  onClick={() => setDarkMode(true)}
                  className={cn(
                    'flex items-center justify-center gap-2 p-4 rounded-xl border transition-all duration-200 hover:scale-[1.01]',
                    darkMode 
                      ? 'border-[#4F46E5] bg-[#4F46E5]/5 text-[#4F46E5] ring-2 ring-[#4F46E5]/10' 
                      : 'border-[#E8E6E1] bg-white text-[#1A1A1A]'
                  )}
                >
                  <span className="text-lg">🌙</span>
                  <span className="text-[14px] font-semibold">Dark</span>
                </button>
              </div>
            </div>
          </div>

          {/* Accessibility Overrides (5 cols) */}
          <div className="lg:col-span-5 flex flex-col gap-6">
            <div className="bg-white border border-[#E8E6E1] rounded-2xl p-6 shadow-sm flex flex-col gap-5">
              <div className="flex items-center gap-2 pb-3 border-b border-[#E8E6E1]/50">
                <Sliders className="w-5 h-5 text-[#4F46E5]" />
                <h3 className="text-[18px] font-semibold">Fine-Tuning</h3>
              </div>

              {/* Typography options */}
              <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[12px] font-bold text-[#6B6660] uppercase tracking-wider">Font Size</label>
                  <select
                    value={fontSize}
                    onChange={(e) => setFontSize(e.target.value as any)}
                    className="w-full bg-[#FAF9F7] border border-[#E8E6E1] rounded-lg p-2.5 text-[13px] font-sans outline-none focus:border-[#4F46E5]"
                  >
                    <option value="sm">Small (14px)</option>
                    <option value="base">Standard (16px)</option>
                    <option value="lg">Large (18px)</option>
                    <option value="xl">Extra Large (20px)</option>
                    <option value="2xl">Double Large (24px)</option>
                  </select>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[12px] font-bold text-[#6B6660] uppercase tracking-wider">Line Spacing</label>
                  <select
                    value={lineSpacing}
                    onChange={(e) => setLineSpacing(e.target.value as any)}
                    className="w-full bg-[#FAF9F7] border border-[#E8E6E1] rounded-lg p-2.5 text-[13px] font-sans outline-none focus:border-[#4F46E5]"
                  >
                    <option value="normal">Normal</option>
                    <option value="relaxed">Relaxed</option>
                    <option value="loose">Loose</option>
                  </select>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[12px] font-bold text-[#6B6660] uppercase tracking-wider">Letter Spacing</label>
                  <select
                    value={letterSpacing}
                    onChange={(e) => setLetterSpacing(e.target.value as any)}
                    className="w-full bg-[#FAF9F7] border border-[#E8E6E1] rounded-lg p-2.5 text-[13px] font-sans outline-none focus:border-[#4F46E5]"
                  >
                    <option value="normal">Normal</option>
                    <option value="wide">Wide</option>
                    <option value="wider">Wider</option>
                  </select>
                </div>
              </div>

              {/* Toggles section */}
              <div className="flex flex-col gap-3 pt-3 border-t border-[#E8E6E1]/50">
                <label className="flex items-center gap-3 cursor-pointer p-1 hover:bg-[#FAF9F7] rounded transition-colors">
                  <input
                    type="checkbox"
                    checked={dyslexiaFont}
                    onChange={(e) => setDyslexiaFont(e.target.checked)}
                    className="w-4 h-4 rounded text-[#4F46E5] focus:ring-[#4F46E5]"
                  />
                  <div>
                    <div className="text-[13px] font-semibold">OpenDyslexic Font</div>
                    <div className="text-[11px] text-[#6B6660]">Dyslexia-friendly reading typography</div>
                  </div>
                </label>

                <label className="flex items-center gap-3 cursor-pointer p-1 hover:bg-[#FAF9F7] rounded transition-colors">
                  <input
                    type="checkbox"
                    checked={zenMode}
                    onChange={(e) => setZenMode(e.target.checked)}
                    className="w-4 h-4 rounded text-[#4F46E5] focus:ring-[#4F46E5]"
                  />
                  <div>
                    <div className="text-[13px] font-semibold">Zen Mode</div>
                    <div className="text-[11px] text-[#6B6660]">Minimize extraneous headers and popups</div>
                  </div>
                </label>

                <label className="flex items-center gap-3 cursor-pointer p-1 hover:bg-[#FAF9F7] rounded transition-colors">
                  <input
                    type="checkbox"
                    checked={highContrast}
                    onChange={(e) => setHighContrast(e.target.checked)}
                    className="w-4 h-4 rounded text-[#4F46E5] focus:ring-[#4F46E5]"
                  />
                  <div>
                    <div className="text-[13px] font-semibold">High Contrast</div>
                    <div className="text-[11px] text-[#6B6660]">Intense background contrast optimization</div>
                  </div>
                </label>
              </div>

              {/* Action buttons */}
              <div className="flex flex-col gap-2 mt-4 pt-4 border-t border-[#E8E6E1]/50">
                <button
                  type="submit"
                  disabled={isSaving}
                  className="w-full bg-[#4F46E5] hover:bg-[#4338ca] text-white font-medium py-3 rounded-xl text-[14px] transition-colors disabled:opacity-50"
                >
                  {isSaving ? 'Saving Changes...' : 'Save Settings'}
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
}
