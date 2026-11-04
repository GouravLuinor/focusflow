import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Brain, Calendar, Type, ArrowRight, Sparkles } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { useApp, SupportMode, getAccessibilityDefaults } from "@/contexts/AppContext";
import { apiRequest } from "@/lib/api";
import { Logo } from "@/components/shared/Logo";

interface SupportModeCard {
  id: SupportMode;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  badge: string;
}

export default function Onboarding() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { setUser, setSupportMode, setOnboardingComplete, setAccessibility } = useApp();
  const [selectedMode, setSelectedMode] = useState<SupportMode>("adhd");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const cards: SupportModeCard[] = [
    {
      id: "adhd",
      title: "ADHD Support",
      description: "Micro-step decomposition, progressive flow timer, momentum blocks",
      icon: Brain,
      badge: "Momentum",
    },
    {
      id: "autism",
      title: "Autism Support",
      description: "Structured workflows, explicit dependencies, predictable day timelines",
      icon: Calendar,
      badge: "Clarity",
    },
    {
      id: "dyslexia",
      title: "Dyslexia Support",
      description: "OpenDyslexic typography, high contrast borders, minimal visual noise",
      icon: Type,
      badge: "Ergonomic",
    },
  ];

  const handleCardClick = (modeId: SupportMode) => {
    setSelectedMode(modeId);
  };

  const handleSave = async () => {
    if (!selectedMode) return;

    setIsLoading(true);
    setError(null);

    try {
      const profile = await apiRequest("/profile", {
        method: "POST",
        body: JSON.stringify({ support_mode: selectedMode }),
      });

      const mode = profile.support_mode === "none" ? null : profile.support_mode;
      setSupportMode(mode);
      setOnboardingComplete(profile.onboarding_completed);
      setAccessibility(getAccessibilityDefaults(mode));
      queryClient.invalidateQueries({ queryKey: ["profile"] });

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
      queryClient.invalidateQueries({ queryKey: ["profile"] });

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
    <div className="min-h-screen w-full relative flex items-center justify-center bg-background text-foreground font-sans p-6 md:p-8 select-none">
      {/* Container */}
      <main className="w-full max-w-[640px] mx-auto flex flex-col items-center relative z-10">
        {/* Header Section */}
        <header className="text-center mb-8 flex flex-col items-center">
          <div className="mb-4">
            <Logo size={44} />
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground mb-2">
            Welcome to FocusFlow
          </h1>
          <p className="text-sm text-muted-foreground max-w-sm">
            Choose your cognitive workflow preference. You can customize or switch this anytime in Settings.
          </p>
        </header>

        {/* Selection Cards Grid */}
        <section className="w-full flex flex-col gap-3 mb-6">
          {cards.map((card) => {
            const isSelected = selectedMode === card.id;
            const CardIcon = card.icon;

            return (
              <div
                key={card.id}
                onClick={() => handleCardClick(card.id)}
                className={`group flex items-start p-4 rounded-2xl border transition-all cursor-pointer ${
                  isSelected
                    ? "bg-primary/10 border-primary/40 shadow-soft"
                    : "bg-card border-border hover:border-border-strong hover:bg-secondary/40"
                }`}
              >
                {/* Icon area */}
                <div
                  className={`flex-shrink-0 w-11 h-11 rounded-xl flex items-center justify-center mr-4 transition-colors ${
                    isSelected
                      ? "bg-primary text-primary-foreground shadow-glow-vermilion"
                      : "bg-secondary text-muted-foreground group-hover:text-foreground"
                  }`}
                >
                  <CardIcon className="h-5 w-5" />
                </div>

                {/* Card details */}
                <div className="flex-grow">
                  <div className="flex items-center justify-between mb-1">
                    <h2 className="text-base font-semibold text-foreground">
                      {card.title}
                    </h2>
                    <span
                      className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full ${
                        isSelected
                          ? "bg-primary/20 text-primary"
                          : "bg-secondary text-muted-foreground"
                      }`}
                    >
                      {card.badge}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {card.description}
                  </p>
                </div>
              </div>
            );
          })}
        </section>

        {/* API Error State */}
        {error && (
          <div className="mb-4 text-center text-accent text-xs flex items-center justify-center gap-1.5 p-2.5 bg-accent/10 rounded-xl border border-accent/20">
            <Sparkles className="h-4 w-4" />
            <span>{error}</span>
          </div>
        )}

        {/* Action Buttons */}
        <footer className="w-full flex flex-col items-center gap-3">
          <button
            data-testid="onboarding-submit-btn"
            onClick={handleSave}
            disabled={isLoading}
            className="w-full py-3 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-sm rounded-xl shadow-glow-vermilion transition-all active:scale-[0.99] flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isLoading ? (
              <span className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                Enter Workspace
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </button>

          <button
            onClick={handleSkip}
            className="text-xs text-muted-foreground hover:text-foreground transition-colors py-1.5 px-3"
          >
            Skip for now
          </button>
        </footer>
      </main>
    </div>
  );
}
