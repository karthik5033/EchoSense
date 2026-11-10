import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { TrendingUp, TrendingDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface MetricCardProps {
  title: string;
  value: string | number;
  change?: string;
  isPositive?: boolean;
  subtext?: string;
  icon?: React.ReactNode;
  className?: string;
  showTrendIcon?: boolean;
}

export function MetricCard({
  title,
  value,
  change,
  isPositive = true,
  subtext,
  icon,
  className,
  showTrendIcon,
}: MetricCardProps) {
  // Only show trend arrows if explicitly requested or if change starts with + or -
  const hasTrendPrefix = typeof change === "string" && (change.startsWith("+") || change.startsWith("-"));
  const shouldShowTrend = showTrendIcon ?? hasTrendPrefix;

  return (
    <Card className={cn("overflow-hidden border border-border bg-card shadow-sm hover:border-border/80 transition-all", className)}>
      <CardContent className="p-4 sm:p-4.5 flex flex-col justify-between h-full">
        {/* Top Header: Title and Icon */}
        <div className="flex items-center justify-between gap-2">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground truncate" title={title}>
            {title}
          </span>
          {icon && (
            <div className="p-1.5 rounded-lg bg-secondary/50 text-muted-foreground shrink-0 flex items-center justify-center">
              {icon}
            </div>
          )}
        </div>

        {/* Value and Change Badge - flex-wrap with gap so they NEVER overlap */}
        <div className="mt-2.5 flex items-baseline justify-between gap-x-2 gap-y-1.5 flex-wrap">
          <div className="text-xl sm:text-2xl font-bold tracking-tight text-foreground font-mono whitespace-nowrap">
            {value}
          </div>
          {change && (
            <div
              className={cn(
                "inline-flex items-center gap-1 text-[11px] font-medium font-mono px-2 py-0.5 rounded-md shrink-0 whitespace-nowrap",
                isPositive
                  ? "bg-muted text-foreground/80 border border-border"
                  : "bg-destructive/10 text-destructive border border-destructive/20"
              )}
            >
              {shouldShowTrend && (
                isPositive ? (
                  <TrendingUp className="h-3 w-3 shrink-0" />
                ) : (
                  <TrendingDown className="h-3 w-3 shrink-0" />
                )
              )}
              <span>{change}</span>
            </div>
          )}
        </div>

        {/* Subtext description */}
        {subtext && (
          <p className="mt-2 text-[11px] text-muted-foreground/80 truncate font-sans" title={subtext}>
            {subtext}
          </p>
        )}
      </CardContent>
    </Card>
  );
}

