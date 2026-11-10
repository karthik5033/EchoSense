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
  name = "EchoSense",
}: AppLogoProps) {
  const iconSizes = {
    sm: "w-5 h-5",
    md: "w-6 h-6",
    lg: "w-8 h-8",
  };

  const textSizes = {
    sm: "text-sm",
    md: "text-base",
    lg: "text-lg",
  };

  return (
    <div className={cn("inline-flex items-center gap-2.5 select-none", className)}>
      <div className={cn("relative flex items-center justify-center shrink-0", iconSizes[size])}>
        <svg
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full"
        >
          <path
            d="M12 2C6.477 2 2 6.477 2 12c0 5.523 4.477 10 10 10 2.215 0 4.266-.72 5.928-1.936l-3.32-3.32A5.328 5.328 0 0112 17.333c-2.946 0-5.333-2.388-5.333-5.333 0-2.946 2.387-5.333 5.333-5.333 1.942 0 3.642 1.042 4.566 2.597l4.02-2.01C18.825 4.095 15.65 2 12 2z"
            fill="url(#appLogoGrad)"
          />
          <path
            d="M21.99 12c0 1.764-.46 3.42-1.267 4.858l-3.95-1.975A5.27 5.27 0 0017.333 12c0-.987-.27-1.912-.74-2.705l3.95-1.975c.954 1.458 1.447 3.037 1.447 4.68z"
            fill="#FF5500"
          />
          <defs>
            <linearGradient id="appLogoGrad" x1="2" y1="2" x2="22" y2="22" gradientUnits="userSpaceOnUse">
              <stop stopColor="#FF5500" />
              <stop offset="0.6" stopColor="#ea580c" />
              <stop offset="1" stopColor="#c2410c" />
            </linearGradient>
          </defs>
        </svg>
      </div>
      {showText && (
        <div className="flex flex-col text-left">
          <span className={cn("font-bold text-foreground tracking-tight leading-none", textSizes[size])}>
            {name}
          </span>
          <span className="text-[10px] font-mono tracking-wider text-muted-foreground uppercase mt-0.5">
            TopoAE SHM
          </span>
        </div>
      )}
    </div>
  );
}
