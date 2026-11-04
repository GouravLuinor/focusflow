import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
  size?: number;
  showText?: boolean;
}

export function Logo({ className, size = 36, showText = false }: LogoProps) {
  return (
    <div className={cn("inline-flex items-center gap-3 select-none", className)}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 36 36"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="shrink-0 transition-transform duration-300 hover:scale-105"
      >
        {/* Subtle base surface */}
        <rect
          width="36"
          height="36"
          rx="10"
          className="fill-primary"
        />
        {/* Wabi-Sabi Flow Wave Mark */}
        <path
          d="M10 18C13 14 15 14 18 18C21 22 23 22 26 18"
          stroke="white"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M10 23C13 19 15 19 18 23C21 27 23 27 26 23"
          stroke="white"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeOpacity="0.6"
        />
        <circle
          cx="18"
          cy="12"
          r="2"
          fill="white"
        />
      </svg>
      {showText && (
        <span className="font-semibold text-xl tracking-tight text-foreground font-sans">
          FocusFlow
        </span>
      )}
    </div>
  );
}
