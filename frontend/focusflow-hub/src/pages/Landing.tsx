import { Link, Navigate } from "react-router-dom";
import { useApp } from "@/contexts/AppContext";
import { Logo } from "@/components/shared/Logo";
import { ArrowRight, Sparkles, Compass, ShieldCheck } from "lucide-react";

export default function Landing() {
  const { isAuthenticated } = useApp();

  // If already authenticated, redirect to dashboard
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="min-h-screen w-full relative flex flex-col justify-between overflow-hidden bg-background text-foreground font-sans">
      {/* Decorative ambient subtle glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[350px] bg-primary/5 rounded-full blur-3xl pointer-events-none z-0" />

      {/* Main Content */}
      <main className="relative z-10 flex-grow flex flex-col items-center justify-center px-6 py-12 md:px-8">
        <div className="w-full max-w-xl flex flex-col items-center text-center space-y-8 animate-fade-up">
          
          {/* Logo Header */}
          <header className="flex flex-col items-center gap-3">
            <Logo size={44} />
            <span className="text-sm font-semibold text-primary tracking-wide uppercase font-sans">
              FocusFlow
            </span>
          </header>

          {/* Hero Content */}
          <section className="flex flex-col items-center space-y-4 w-full">
            <h1 className="text-4xl md:text-5xl font-semibold text-foreground leading-[1.15] tracking-tight font-sans">
              One thing at a time.
            </h1>
            <p className="text-base md:text-lg text-muted-foreground mx-auto max-w-md font-normal leading-relaxed font-sans">
              An adaptive workflow execution platform engineered for neurodivergent minds. Zero noise, clear momentum.
            </p>

            {/* Feature Pills */}
            <div className="flex flex-wrap justify-center gap-2 pt-2">
              <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-card rounded-full text-xs font-medium text-foreground border border-border shadow-soft">
                <Compass className="w-3.5 h-3.5 text-primary" />
                Adaptive Scheduling
              </span>
              <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-card rounded-full text-xs font-medium text-foreground border border-border shadow-soft">
                <Sparkles className="w-3.5 h-3.5 text-accent" />
                Dependency Workflows
              </span>
              <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-card rounded-full text-xs font-medium text-foreground border border-border shadow-soft">
                <ShieldCheck className="w-3.5 h-3.5 text-success" />
                Sensory Ergonomics
              </span>
            </div>
          </section>

          {/* Tactile Flow Geometry Illustration */}
          <div aria-hidden="true" className="w-full max-w-xs h-24 flex items-center justify-center py-2">
            <svg className="w-full h-full opacity-80" fill="none" viewBox="0 0 200 80" xmlns="http://www.w3.org/2000/svg">
              <circle className="fill-primary/15" cx="40" cy="40" r="22" />
              <rect className="fill-secondary stroke-border" height="34" rx="8" width="34" x="83" y="23" strokeWidth="1" />
              <circle className="fill-success/20 stroke-success/40" cx="160" cy="40" r="20" strokeWidth="1" />
              <path className="stroke-border" d="M62 40 L83 40 M117 40 L140 40" strokeDasharray="3 3" strokeWidth="1.5" />
            </svg>
          </div>

          {/* CTA & Sign In Link */}
          <section className="flex flex-col items-center w-full space-y-3">
            <Link to="/signup" className="w-full sm:w-auto">
              <button
                className="w-full sm:w-auto px-8 py-3.5 bg-primary hover:bg-primary/90 text-primary-foreground font-medium rounded-xl transition-all duration-150 hover:scale-[1.02] active:scale-[0.98] shadow-glow-vermilion text-sm flex items-center justify-center gap-2"
              >
                Get Started
                <ArrowRight className="w-4 h-4" />
              </button>
            </Link>
            <p className="text-xs text-muted-foreground font-sans">
              Already have an account?{" "}
              <Link
                to="/login"
                className="text-primary hover:underline font-medium transition-colors"
              >
                Sign in
              </Link>
            </p>
          </section>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 w-full py-6 flex justify-center border-t border-border/40">
        <span className="text-xs text-muted-foreground font-sans">
          FocusFlow — Calm productivity for everyone.
        </span>
      </footer>
    </div>
  );
}
