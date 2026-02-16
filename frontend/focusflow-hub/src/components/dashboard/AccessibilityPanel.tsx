import { useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Settings,
  Type,
  Sun,
  Moon,
  Palette,
  LogOut,
  X,
  Eye,
} from 'lucide-react';
import { useApp } from '@/contexts/AppContext';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

interface AccessibilityPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AccessibilityPanel({ isOpen, onClose }: AccessibilityPanelProps) {
  const navigate = useNavigate();
  const {
    accessibility,
    setAccessibility,
    setSupportMode,
    supportMode,
    logout,
  } = useApp();

  /* =========================
     APPLY GLOBAL EFFECTS
  ========================== */

  useEffect(() => {
    const root = document.documentElement;

    // Font size
    root.classList.remove(
      'text-sm',
      'text-base',
      'text-lg',
      'text-xl',
      'text-2xl'
    );

    const sizeMap = {
      sm: 'text-sm',
      base: 'text-base',
      lg: 'text-lg',
      xl: 'text-xl',
      '2xl': 'text-2xl',
    };

    root.classList.add(sizeMap[accessibility.fontSize]);

    // High contrast
    if (accessibility.highContrast) {
      root.classList.add('contrast-125', 'brightness-110');
    } else {
      root.classList.remove('contrast-125', 'brightness-110');
    }

    // Zen Mode (minimal UI)
    if (accessibility.zenMode) {
      root.classList.add('tracking-wide');
    } else {
      root.classList.remove('tracking-wide');
    }
    // Support Mode Font Switching
    root.classList.remove('font-sans', 'font-lexend', 'font-dyslexic');

    if (supportMode === 'dyslexia') {
      root.classList.add('font-dyslexic');
    } else {
      root.classList.add('font-lexend');
    }

    localStorage.setItem('accessibility', JSON.stringify(accessibility));
}, [accessibility, supportMode]);


  const fontSizes = [
    { id: 'sm' as const, label: 'Small' },
    { id: 'base' as const, label: 'Medium' },
    { id: 'lg' as const, label: 'Large' },
    { id: 'xl' as const, label: 'XL' },
    { id: '2xl' as const, label: '2XL' },
  ];

  const modes = [
    { id: 'adhd' as const, label: 'ADHD', color: 'bg-adhd-primary' },
    { id: 'autism' as const, label: 'Autism', color: 'bg-autism-primary' },
    { id: 'dyslexia' as const, label: 'Dyslexia', color: 'bg-dyslexia-primary' },
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (!isOpen) return null;

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        onClick={onClose}
        className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40"
      />

      <motion.div
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        className="fixed right-0 top-0 h-full w-full max-w-md bg-card border-l border-border shadow-2xl z-50 overflow-y-auto"
      >
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <Settings className="w-5 h-5 text-primary" />
              </div>
              <h2 className="text-xl font-bold">Settings</h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-muted transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* FONT SIZE */}
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <Type className="w-5 h-5 text-primary" />
              <h3 className="font-semibold">Font Size</h3>
            </div>

            <div className="grid grid-cols-5 gap-2">
              {fontSizes.map((size) => (
                <button
                  key={size.id}
                  onClick={() =>
                    setAccessibility({ ...accessibility, fontSize: size.id })
                  }
                  className={`py-3 rounded-xl text-sm font-medium transition-all ${
                    accessibility.fontSize === size.id
                      ? 'bg-primary text-white shadow-lg'
                      : 'bg-muted hover:bg-muted/80'
                  }`}
                >
                  {size.label}
                </button>
              ))}
            </div>
          </div>

          {/* CONTRAST */}
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <Sun className="w-5 h-5 text-primary" />
              <h3 className="font-semibold">High Contrast</h3>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() =>
                  setAccessibility({ ...accessibility, highContrast: false })
                }
                className={`py-4 rounded-xl font-medium ${
                  !accessibility.highContrast
                    ? 'bg-primary text-white'
                    : 'bg-muted'
                }`}
              >
                Normal
              </button>

              <button
                onClick={() =>
                  setAccessibility({ ...accessibility, highContrast: true })
                }
                className={`py-4 rounded-xl font-medium ${
                  accessibility.highContrast
                    ? 'bg-black text-white'
                    : 'bg-muted'
                }`}
              >
                High Contrast
              </button>
            </div>
          </div>

          {/* ZEN MODE (Autism Friendly) */}
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <Eye className="w-5 h-5 text-primary" />
              <h3 className="font-semibold">Zen Mode</h3>
            </div>

            <button
              onClick={() =>
                setAccessibility({
                  ...accessibility,
                  zenMode: !accessibility.zenMode,
                })
              }
              className={`w-full py-4 rounded-xl font-medium transition-all ${
                accessibility.zenMode
                  ? 'bg-primary text-white'
                  : 'bg-muted hover:bg-muted/80'
              }`}
            >
              {accessibility.zenMode ? 'Enabled' : 'Enable Zen Mode'}
            </button>
          </div>

          {/* SUPPORT MODE */}
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <Palette className="w-5 h-5 text-primary" />
              <h3 className="font-semibold">Support Mode</h3>
            </div>

            <div className="space-y-3">
              {modes.map((mode) => (
                <button
                  key={mode.id}
                  onClick={() => {
                    setSupportMode(mode.id);
                    navigate(`/${mode.id}`);
                    onClose();    
                  }}
                  className={`w-full py-4 px-4 rounded-xl flex items-center gap-3 border-2 transition-all ${
                    supportMode === mode.id
                      ? 'border-primary bg-primary/10'
                      : 'border-transparent bg-muted'
                  }`}
                >
                  <div className={`w-4 h-4 rounded-full ${mode.color}`} />
                  {mode.label} Mode
                </button>
              ))}
            </div>
          </div>

          {/* LOGOUT */}
          <div className="pt-4 border-t border-border">
            <Button
              onClick={handleLogout}
              variant="outline"
              className="w-full py-6 rounded-xl text-destructive"
            >
              <LogOut className="w-5 h-5 mr-2" />
              Sign out
            </Button>
          </div>
        </div>
      </motion.div>
    </>
  );
}
