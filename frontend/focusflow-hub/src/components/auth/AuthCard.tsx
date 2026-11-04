import { ReactNode } from "react";
import { Logo } from "@/components/shared/Logo";

interface AuthCardProps {
  children: ReactNode;
  title: string;
  subtitle: string;
}

export default function AuthCard({ children, title, subtitle }: AuthCardProps) {
  return (
    <div className="min-h-screen w-full relative flex flex-col items-center justify-center bg-background text-foreground font-sans py-12 px-4 overflow-hidden">
      {/* Subtle ambient blur */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[500px] h-[300px] bg-primary/5 rounded-full blur-3xl pointer-events-none z-0" />

      {/* Main Container */}
      <main className="w-full max-w-md relative z-10 flex flex-col items-center animate-fade-up">
        {/* Logo */}
        <div className="mb-6">
          <Logo size={42} />
        </div>

        {/* Card */}
        <div className="w-full bg-card rounded-2xl border border-border p-8 shadow-soft">
          {/* Header */}
          <header className="text-center mb-6">
            <h1 className="text-2xl font-semibold tracking-tight text-foreground mb-1.5 font-sans">
              {title}
            </h1>
            <p className="text-sm text-muted-foreground font-sans">
              {subtitle}
            </p>
          </header>

          {/* Form and Children */}
          {children}
        </div>

        {/* Legal Footer */}
        <p className="mt-8 text-xs text-muted-foreground text-center font-sans">
          © {new Date().getFullYear()} FocusFlow. Calm productivity for everyone.
        </p>
      </main>
    </div>
  );
}
