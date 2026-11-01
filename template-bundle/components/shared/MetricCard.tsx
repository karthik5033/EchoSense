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
}

export function MetricCard({
  title,
  value,
  change,
  isPositive = true,
  subtext,
  icon,
  className,
}: MetricCardProps) {
  return (
    <Card className={cn("overflow-hidden border border-border bg-card", className)}>
      <CardContent className="p-5">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            {title}
          </span>
          {icon && <div className="text-muted-foreground">{icon}</div>}
        </div>
        <div className="mt-3 flex items-baseline justify-between">
          <div className="text-2xl font-bold tracking-tight text-foreground font-mono">
            {value}
          </div>
          {change && (
            <div
              className={cn(
                "inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full",
                isPositive
                  ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20"
                  : "bg-red-500/10 text-red-500 border border-red-500/20"
              )}
            >
              {isPositive ? (
                <TrendingUp className="h-3 w-3" />
              ) : (
                <TrendingDown className="h-3 w-3" />
              )}
              <span>{change}</span>
            </div>
          )}
        </div>
        {subtext && (
          <p className="mt-2 text-xs text-muted-foreground/80 truncate">{subtext}</p>
        )}
      </CardContent>
    </Card>
  );
}

