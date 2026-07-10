import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Brain, Calendar, Type, Waves, ArrowRight, Sparkles } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { useApp, SupportMode, getAccessibilityDefaults } from "@/contexts/AppContext";
import { apiRequest } from "@/lib/api";

interface SupportModeCard {
  id: SupportMode;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  staggerClass: string;
}

export default function Onboarding() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { setUser, setSupportMode, setOnboardingComplete, setAccessibility } = useApp();
  const [selectedMode, setSelectedMode] = useState<SupportMode>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const cards: SupportModeCard[] = [
    {
      id: "adhd",
      title: "ADHD Support",
      description: "Task decomposition, time blindness support, micro-wins focus",
      icon: Brain,
      staggerClass: "stagger-1",
    },
    {
      id: "autism",
      title: "Autism Support",
      description: "Structured workflows, predictable scheduling, clear dependencies",
      icon: Calendar,
      staggerClass: "stagger-2",
    },
    {
      id: "dyslexia",
      title: "Dyslexia Support",
      description: "OpenDyslexic font, reduced visual clutter, readable layouts",
      icon: Type,
      staggerClass: "stagger-3",
    },
  ];

  const handleCardClick = (modeId: SupportMode) => {
    if (selectedMode === modeId) {
      setSelectedMode(null);
    } else {
      setSelectedMode(modeId);
    }
  };

  const handleSave = async () => {
    if (!selectedMode) return;

    setIsLoading(true);
    setError(null);

    try {
      // 1. Post selection to profile API
      const profile = await apiRequest("/profile", {
        method: "POST",
        body: JSON.stringify({
          support_mode: selectedMode,
        }),
      });

      // 2. Sync frontend context
      const mode = profile.support_mode === "none" ? null : profile.support_mode;
      setSupportMode(mode);
      setOnboardingComplete(profile.onboarding_completed);
      setAccessibility(getAccessibilityDefaults(mode));

      // Invalidate query to trigger react-query update
      queryClient.invalidateQueries({ queryKey: ['profile'] });

      // 3. Fetch latest user details to sync context
      try {
        const user = await apiRequest("/auth/me");
        setUser(user);
      } catch (meErr) {
        console.error("Failed to sync user data:", meErr);
      }

      // 4. Redirect to dashboard
      navigate("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save selection. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSkip = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const profile = await apiRequest("/profile", {
        method: "POST",
        body: JSON.stringify({ support_mode: "none" }),
      });
      const mode = profile.support_mode === "none" ? null : profile.support_mode;
      setSupportMode(mode);
      setOnboardingComplete(profile.onboarding_completed);
      setAccessibility(getAccessibilityDefaults(mode));
      queryClient.invalidateQueries({ queryKey: ['profile'] });

      // Fetch latest user details to sync context
      try {
        const user = await apiRequest("/auth/me");
        setUser(user);
      } catch (meErr) {
        console.error("Failed to sync user data:", meErr);
      }

      navigate("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to initialize profile");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full relative flex items-center justify-center bg-[#FAF9F7] text-[#1A1A1A] font-sans p-6 md:p-8 overflow-hidden select-none">
      
      {/* Self-contained CSS for animations and active states */}
      <style dangerouslySetInnerHTML={{ __html: `
        .fade-in-up {
          opacity: 0;
          transform: translateY(20px);
          animation: fadeInUp 0.6s ease-out forwards;
        }

        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .stagger-1 {
          animation-delay: 0.1s;
        }

        .stagger-2 {
          animation-delay: 0.2s;
        }

        .stagger-3 {
          animation-delay: 0.3s;
        }

        .card-active-state {
          box-shadow: 0 0 0 2px #4F46E5, 0 10px 25px -5px rgba(79, 70, 229, 0.15);
          border-color: transparent !important;
          animation: scalePulse 0.3s ease-in-out;
        }

        @keyframes scalePulse {
          0% {
            transform: scale(1);
          }
          50% {
            transform: scale(0.98);
          }
          100% {
            transform: scale(1.01);
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .fade-in-up {
            animation: none !important;
            opacity: 1 !important;
            transform: none !important;
          }
          .card-active-state {
            animation: none !important;
            box-shadow: 0 0 0 2px #4F46E5;
          }
        }
      `}} />

      {/* Decorative corner blurs */}
      <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-[#4F46E5]/10 rounded-full blur-[100px] -translate-x-1/2 -translate-y-1/2 pointer-events-none z-0" />
      <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-[#4F46E5]/05 rounded-full blur-[120px] translate-x-1/3 translate-y-1/3 pointer-events-none z-0" />

      {/* Onboarding Container */}
      <main className="w-full max-w-[700px] mx-auto flex flex-col items-center relative z-10">
        
        {/* Header Section */}
        <header className="text-center mb-8 flex flex-col items-center fade-in-up">
          <div className="mb-4 inline-flex items-center justify-center w-12 h-12 rounded-xl bg-[#4F46E5] text-white shadow-sm">
            <Waves className="h-7 w-7" />
          </div>
          <h1 className="text-[32px] font-semibold tracking-tight text-[#1A1A1A] mb-2 leading-[1.3] font-sans">
            Welcome to FocusFlow
          </h1>
          <p className="text-[18px] font-medium text-[#6B6660] font-sans mb-1">
            How do you like to work?
          </p>
          <p className="text-[14px] text-[#9E988E] font-sans">
            Choose a support mode. You can change this anytime.
          </p>
        </header>

        {/* Selection Cards Grid */}
        <section className="w-full flex flex-col gap-4 mb-8">
          {cards.map((card) => {
            const isSelected = selectedMode === card.id;
            const CardIcon = card.icon;

            return (
              <div
                key={card.id}
                onClick={() => handleCardClick(card.id)}
                className={`group flex flex-col md:flex-row items-center md:items-start bg-white border border-[#E8E6E1] rounded-xl p-6 transition-all duration-300 hover:scale-[1.01] hover:border-[#4F46E5]/30 fade-in-up ${
                  card.staggerClass
                } ${isSelected ? "card-active-state" : ""} cursor-pointer`}
              >
                {/* Icon area */}
                <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-[#f0ecf9] flex items-center justify-center text-[#4F46E5] mb-4 md:mb-0 md:mr-4 group-hover:bg-[#e2dfff] transition-colors">
                  <CardIcon className="h-6 w-6" />
                </div>

                {/* Card details */}
                <div className="flex-grow text-center md:text-left">
                  <h2 className="text-[20px] font-medium text-[#1A1A1A] mb-1 font-sans">
                    {card.title}
                  </h2>
                  <p className="text-[14px] text-[#9E988E] mb-4 leading-relaxed font-sans">
                    {card.description}
                  </p>
                  
                  {/* Select button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleCardClick(card.id);
                    }}
                    className={`w-full md:w-auto px-6 py-2 rounded-lg text-[12px] font-semibold font-sans tracking-wide transition-all active:scale-95 ${
                      isSelected
                        ? "bg-[#4F46E5] text-white"
                        : "border-2 border-[#4F46E5] text-[#4F46E5] hover:bg-[#4F46E5] hover:text-white"
                    }`}
                  >
                    {isSelected ? "Selected" : "Select"}
                  </button>
                </div>
              </div>
            );
          })}
        </section>

        {/* API Error State */}
        {error && (
          <div className="mb-4 text-center text-[#D97706] text-sm font-sans flex items-center justify-center gap-2">
            <Sparkles className="h-4 w-4 animate-pulse" />
            <span>{error}</span>
          </div>
        )}

        {/* Action Button & Skip Link */}
        <footer className="w-full flex flex-col items-center gap-4 fade-in-up stagger-3">
          {selectedMode && (
            <button
              onClick={handleSave}
              disabled={isLoading}
              className="w-full sm:w-auto px-8 py-3 bg-[#4F46E5] hover:bg-[#4F46E5]/90 text-white font-medium text-[16px] rounded-lg shadow-md transition-all active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isLoading ? (
                <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  Continue to Dashboard
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          )}

          <button
            onClick={handleSkip}
            className="text-[14px] text-[#9E988E] hover:text-[#4F46E5] transition-colors py-2 px-4"
          >
            Skip for now
          </button>
        </footer>
      </main>
    </div>
  );
}
