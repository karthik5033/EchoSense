import React from "react";
import { cn } from "@/lib/utils";

interface AppLogoProps {
  className?: string;
  size?: "sm" | "md" | "lg";
  showText?: boolean;
  name?: string;
}

export function AppLogo({
  className,
  size = "md",
  showText = true,
  name = "ECHOSENSE",
}: AppLogoProps) {
  const sizeClasses = {
    sm: "h-6 w-6",
    md: "h-8 w-8",
    lg: "h-10 w-10",
  };

  const textClasses = {
    sm: "text-sm",
    md: "text-base",
    lg: "text-lg",
  };

  return (
    <div className={cn("inline-flex items-center gap-2.5 select-none font-bold tracking-wider", className)}>
      <div
        className={cn(
          "relative flex items-center justify-center rounded-lg bg-emerald-600 dark:bg-emerald-500 text-white dark:text-zinc-950 shadow-md ring-1 ring-emerald-500/20 overflow-hidden",
          sizeClasses[size]
        )}
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="h-4/5 w-4/5 transform -rotate-12 transition-transform duration-300 hover:rotate-0"
        >
          {/* Topological loop / Mobius / Attractor Waveform */}
          <path d="M2 12c1.5-4 4-7 7-7 4 0 5 8 9 8 3 0 4-2 4-5" />
          <path d="M2 12c1.5 4 4 7 7 7 4 0 5-8 9-8 3 0 4 2 4 5" />
          <circle cx="9" cy="12" r="1.5" fill="currentColor" />
          <circle cx="18" cy="12" r="1.5" fill="currentColor" />
        </svg>
      </div>
      {showText && (
        <div className="flex flex-col text-left">
          <span className={cn("font-extrabold uppercase tracking-widest text-foreground", textClasses[size])}>
            {name}
          </span>
          <span className="text-[9px] font-mono tracking-widest text-emerald-500 dark:text-emerald-400 -mt-1 uppercase">
            Topological SHM
          </span>
        </div>
      )}
    </div>
  );
}
