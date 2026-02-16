import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, Heart, BookOpen, ArrowRight, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useApp, SupportMode } from '@/contexts/AppContext';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/api';


const supportModes = [
  {
    id: 'adhd' as SupportMode,
    title: 'ADHD Support',
    description: 'Timers, momentum builders, and focus tools to keep you moving forward',
    icon: Zap,
    color: 'from-adhd-primary to-adhd-secondary',
    bgColor: 'bg-adhd-primary/10',
    borderColor: 'border-adhd-primary/30',
    features: ['Countdown timers', 'Progress animations', 'Dopamine rewards'],
  },
  {
    id: 'autism' as SupportMode,
    title: 'Autism Support',
    description: 'Clean interfaces, predictable patterns, and calm visuals',
    icon: Heart,
    color: 'from-autism-primary to-autism-secondary',
    bgColor: 'bg-autism-primary/10',
    borderColor: 'border-autism-primary/30',
    features: ['Minimal distractions', 'Zen mode', 'Muted colors'],
  },
  {
    id: 'dyslexia' as SupportMode,
    title: 'Dyslexia Support',
    description: 'Readable fonts, generous spacing, and clear layouts',
    icon: BookOpen,
    color: 'from-dyslexia-primary to-dyslexia-secondary',
    bgColor: 'bg-dyslexia-primary/10',
    borderColor: 'border-dyslexia-primary/30',
    features: ['Lexend font', 'Extra spacing', 'High contrast'],
  },
];

export default function Onboarding() {
  const navigate = useNavigate();
  const { user, setSupportMode, setOnboardingComplete } = useApp();
  const { toast } = useToast();
  const [selectedMode, setSelectedMode] = useState<SupportMode>(null);

const handleContinue = async () => {
  if (!selectedMode) {
    toast({
      title: "Choose your support mode",
      description: "Select how you'd like to be supported",
      variant: "destructive",
    });
    return;
  }

  try {
    // 🔹 Save profile in backend
    const profile = await apiRequest('/profile', {
      method: 'POST',
      body: JSON.stringify({
        support_mode: selectedMode,
      }),
    });

    // 🔹 Sync frontend context with backend
    setSupportMode(profile.support_mode);
    setOnboardingComplete(profile.onboarding_completed);

    toast({
      title: "Perfect! 🌟",
      description: `Your ${profile.support_mode.toUpperCase()} dashboard is ready`,
    });

    navigate('/dashboard');

  } catch (err: any) {
    toast({
      title: "Something went wrong",
      description: err.message || "Failed to save profile",
      variant: "destructive",
    });
  }
};


  return (
    <div className="min-h-screen bg-gradient-hero flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="w-full max-w-4xl"
      >
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full mb-4">
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-primary">Personalization</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            Hey {user?.name || 'there'}! 👋
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            How would you like to be supported? Choose the mode that feels right for you.
          </p>
        </motion.div>

        {/* Mode Selection */}
        <div className="grid md:grid-cols-3 gap-6 mb-10">
          {supportModes.map((mode, index) => (
            <motion.button
              key={mode.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + index * 0.1 }}
              onClick={() => setSelectedMode(mode.id)}
              className={`relative p-6 rounded-3xl border-2 text-left transition-all duration-300 ${
                selectedMode === mode.id
                  ? `${mode.borderColor} ${mode.bgColor} shadow-lg scale-[1.02]`
                  : 'border-border/50 bg-card hover:border-border hover:shadow-soft'
              }`}
            >
              {/* Selected indicator */}
              <AnimatePresence>
                {selectedMode === mode.id && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                    className="absolute -top-2 -right-2 w-6 h-6 bg-gradient-to-br rounded-full flex items-center justify-center shadow-lg"
                    style={{
                      background: `linear-gradient(135deg, var(--${mode.id}-primary), var(--${mode.id}-secondary))`,
                    }}
                  >
                    <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Icon */}
              <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${mode.color} flex items-center justify-center mb-4 shadow-soft`}>
                <mode.icon className="w-7 h-7 text-white" />
              </div>

              {/* Content */}
              <h3 className="text-xl font-bold text-foreground mb-2">{mode.title}</h3>
              <p className="text-muted-foreground text-sm mb-4">{mode.description}</p>

              {/* Features */}
              <div className="space-y-2">
                {mode.features.map((feature, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm">
                    <div className={`w-1.5 h-1.5 rounded-full bg-gradient-to-br ${mode.color}`} />
                    <span className="text-foreground/80">{feature}</span>
                  </div>
                ))}
              </div>
            </motion.button>
          ))}
        </div>

        {/* Continue Button */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="flex justify-center"
        >
          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Button
              onClick={handleContinue}
              disabled={!selectedMode}
              className={`h-14 px-10 rounded-2xl font-semibold text-lg shadow-glow transition-all duration-300 ${
                selectedMode
                  ? 'bg-gradient-calm text-primary-foreground hover:shadow-lg'
                  : 'bg-muted text-muted-foreground'
              }`}
            >
              Continue to Dashboard
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </motion.div>
        </motion.div>

        {/* Note */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="text-center text-sm text-muted-foreground mt-6"
        >
          You can change your mode anytime in the settings ✨
        </motion.p>
      </motion.div>
    </div>
  );
}
