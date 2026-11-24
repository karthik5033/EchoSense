"use client";

import React, { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Layers, ArrowUpDown, Filter } from "lucide-react";

export interface BarcodeInterval {
  dimension: number;
  birth: number;
  death: number;
  lifetime: number;
}

interface PersistenceBarcodeProps {
  intervals?: BarcodeInterval[];
  className?: string;
  maxBars?: number;
}

export function PersistenceBarcode({
  intervals = [],
  className = "",
  maxBars = 35,
}: PersistenceBarcodeProps) {
  const [activeDim, setActiveDim] = useState<"ALL" | "H0" | "H1">("ALL");
  const [sortBy, setSortBy] = useState<"lifetime" | "birth">("lifetime");
  const [hoveredBar, setHoveredBar] = useState<BarcodeInterval | null>(null);

  // Fallback demo intervals if none provided
  const sourceIntervals: BarcodeInterval[] = intervals.length > 0 ? intervals : [
    { dimension: 0, birth: 0.0, death: 0.88, lifetime: 0.88 },
    { dimension: 0, birth: 0.0, death: 0.42, lifetime: 0.42 },
    { dimension: 0, birth: 0.0, death: 0.28, lifetime: 0.28 },
    { dimension: 0, birth: 0.0, death: 0.15, lifetime: 0.15 },
    { dimension: 1, birth: 0.12, death: 0.94, lifetime: 0.82 },
    { dimension: 1, birth: 0.18, death: 0.72, lifetime: 0.54 },
    { dimension: 1, birth: 0.24, death: 0.65, lifetime: 0.41 },
    { dimension: 1, birth: 0.35, death: 0.58, lifetime: 0.23 },
    { dimension: 1, birth: 0.42, death: 0.51, lifetime: 0.09 },
  ];

  const filtered = sourceIntervals.filter((b) => {
    if (activeDim === "H0") return b.dimension === 0;
    if (activeDim === "H1") return b.dimension === 1;
    return true;
  });

  const sorted = [...filtered].sort((a, b) => {
    if (sortBy === "lifetime") return b.lifetime - a.lifetime;
    return a.birth - b.birth;
  }).slice(0, maxBars);

  const maxVal = Math.max(1.0, ...sorted.map((s) => s.death));

  return (
    <div className={`rounded-xl border border-border bg-card p-4 flex flex-col ${className}`}>
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-border/60">
        <div>
          <h3 className="text-sm font-semibold text-foreground">
            Persistence Barcode (Vietoris-Rips Filtration)
          </h3>
          <p className="text-[11px] text-muted-foreground mt-0.5">
            Lifetime intervals $[b, d]$ for connected components ($H_0$) and cycles ($H_1$)
          </p>
        </div>

        <div className="flex items-center gap-1.5">
          {/* Dimension toggle */}
          <div className="flex items-center rounded-lg bg-muted/40 p-0.5 border border-border text-xs">
            <button
              onClick={() => setActiveDim("ALL")}
              className={`px-2 py-0.5 rounded text-[11px] font-medium transition-colors ${
                activeDim === "ALL" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground"
              }`}
            >
              All
            </button>
            <button
              onClick={() => setActiveDim("H0")}
              className={`px-2 py-0.5 rounded text-[11px] font-medium transition-colors ${
                activeDim === "H0" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground"
              }`}
            >
              H₀
            </button>
            <button
              onClick={() => setActiveDim("H1")}
              className={`px-2 py-0.5 rounded text-[11px] font-medium transition-colors ${
                activeDim === "H1" ? "bg-card text-[#FF5500] font-bold shadow-sm" : "text-muted-foreground"
              }`}
            >
              H₁
            </button>
          </div>

          <Button
            size="sm"
            variant="outline"
            onClick={() => setSortBy(sortBy === "lifetime" ? "birth" : "lifetime")}
            className="h-7 text-xs px-2 gap-1"
          >
            <ArrowUpDown className="h-3 w-3" />
            <span>{sortBy === "lifetime" ? "By Lifetime" : "By Birth"}</span>
          </Button>
        </div>
      </div>

      {/* Barcode Plot Area */}
      <div className="py-3 flex-1 flex flex-col justify-center min-h-[240px]">
        <div className="space-y-1.5 overflow-y-auto max-h-[280px] pr-1">
          {sorted.map((bar, idx) => {
            const leftPct = (bar.birth / maxVal) * 100;
            const widthPct = Math.max(1.5, ((bar.death - bar.birth) / maxVal) * 100);
            const isH1 = bar.dimension === 1;

            return (
              <div
                key={idx}
                onMouseEnter={() => setHoveredBar(bar)}
                onMouseLeave={() => setHoveredBar(null)}
                className="group relative flex items-center h-5 cursor-pointer hover:bg-muted/30 px-1 rounded transition-colors"
              >
                {/* Dimension indicator tag */}
                <span className={`w-6 text-[10px] font-mono mr-2 ${isH1 ? "text-[#FF5500] font-bold" : "text-muted-foreground"}`}>
                  {isH1 ? "H₁" : "H₀"}
                </span>

                {/* Track background */}
                <div className="relative flex-1 h-2 bg-muted/30 rounded-full overflow-hidden">
                  <div
                    style={{ left: `${leftPct}%`, width: `${widthPct}%` }}
                    className={`absolute h-full rounded-full transition-all ${
                      isH1 ? "bg-[#FF5500] group-hover:bg-[#FF7733]" : "bg-zinc-500 group-hover:bg-zinc-400"
                    }`}
                  />
                </div>

                {/* Value label */}
                <span className="w-16 text-right text-[10px] font-mono text-muted-foreground ml-2">
                  Δ {bar.lifetime.toFixed(3)}
                </span>
              </div>
            );
          })}
        </div>

        {/* X-axis scale */}
        <div className="flex justify-between items-center pt-2 mt-2 border-t border-border/40 text-[10px] font-mono text-muted-foreground px-8">
          <span>ε = 0.0</span>
          <span>ε = {(maxVal * 0.25).toFixed(2)}</span>
          <span>ε = {(maxVal * 0.5).toFixed(2)}</span>
          <span>ε = {(maxVal * 0.75).toFixed(2)}</span>
          <span>ε = {maxVal.toFixed(2)}</span>
        </div>
      </div>

      {/* Footer Info */}
      {hoveredBar && (
        <div className="pt-2 border-t border-border/40 flex items-center justify-between text-xs font-mono">
          <span className="text-muted-foreground">
            Dimension {hoveredBar.dimension} ({hoveredBar.dimension === 1 ? "1D Topological Loop" : "Connected Component"})
          </span>
          <span className="text-foreground">
            Birth: {hoveredBar.birth.toFixed(4)} | Death: {hoveredBar.death.toFixed(4)} | Lifetime: {hoveredBar.lifetime.toFixed(4)}
          </span>
        </div>
      )}
    </div>
  );
}
