import { Logo } from '@/components/shared/Logo';

interface AppLoaderProps {
  /** Screen-reader text describing what is loading. */
  label?: string;
}

/**
 * Full-screen loading state: the brand mark breathing gently on the Washi
 * canvas. Calm by design (no spinner churn); motion stops under
 * prefers-reduced-motion.
 */
export function AppLoader({ label = 'Loading' }: AppLoaderProps) {
  return (
    <div
      role="status"
      aria-live="polite"
      className="min-h-screen w-full flex flex-col items-center justify-center gap-4 bg-background text-muted-foreground font-sans"
    >
      <Logo size={44} className="motion-safe:animate-breathe" />
      <span className="sr-only">{label}…</span>
    </div>
  );
}
