"use client";

import React, { useState } from "react";
import { Layers } from "lucide-react";

interface PersistenceLandscapeProps {
  layers?: Record<string, number[]>;
  tBins?: number[];
  className?: string;
}

const LAYER_COLORS = [
  "#FF5500", // Layer 1 (Primary Loop)
  "#FF8833", // Layer 2
  "#FFAA66", // Layer 3
  "#00E5FF", // Layer 4
  "#818CF8", // Layer 5
];

export function PersistenceLandscape({
  layers,
  tBins,
  className = "",
}: PersistenceLandscapeProps) {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  // Generate fallback demonstration landscape if none provided
  const bins = tBins || Array.from({ length: 50 }, (_, i) => i / 49.0);
  const layerData = layers || {
    layer_1: bins.map((t) => Math.max(0, 0.45 - 2.5 * Math.abs(t - 0.42))),
    layer_2: bins.map((t) => Math.max(0, 0.28 - 2.0 * Math.abs(t - 0.38))),
    layer_3: bins.map((t) => Math.max(0, 0.16 - 1.8 * Math.abs(t - 0.35))),
    layer_4: bins.map((t) => Math.max(0, 0.09 - 1.5 * Math.abs(t - 0.40))),
    layer_5: bins.map((t) => Math.max(0, 0.04 - 1.2 * Math.abs(t - 0.45))),
  };

  const viewBoxW = 500;
  const viewBoxH = 260;
  const paddingX = 40;
  const paddingY = 30;
  const plotW = viewBoxW - 2 * paddingX;
  const plotH = viewBoxH - 2 * paddingY;

  // Find max amplitude across layers
  const maxAmp = Math.max(
    0.5,
    ...Object.values(layerData).flatMap((arr) => arr)
  );

  const getSvgX = (t: number) => paddingX + t * plotW;
  const getSvgY = (v: number) => viewBoxH - paddingY - (v / maxAmp) * plotH;

  // Build SVG polygon paths
  const layerKeys = Object.keys(layerData);

  return (
    <div className={`rounded-xl border border-border bg-card p-4 flex flex-col ${className}`}>
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-border/60">
        <div>
          <h3 className="text-sm font-semibold text-foreground">
            Bubenik Persistence Landscapes (λ₁ … λ₅)
          </h3>
          <p className="text-[11px] text-muted-foreground mt-0.5">
            Functional Banach space representations of persistent homology cycles
          </p>
        </div>

        <div className="flex items-center gap-3 text-[11px] font-mono">
          {layerKeys.map((key, i) => (
            <div key={key} className="flex items-center gap-1.5">
              <span
                className="w-2.5 h-2.5 rounded-sm"
                style={{ backgroundColor: LAYER_COLORS[i % LAYER_COLORS.length] }}
              />
              <span className="text-muted-foreground uppercase">λ{i + 1}</span>
            </div>
          ))}
        </div>
      </div>

      {/* SVG Landscape Canvas */}
      <div className="py-2 flex-1 flex flex-col justify-center">
        <svg viewBox={`0 0 ${viewBoxW} ${viewBoxH}`} className="w-full h-auto select-none">
          {/* Grid lines */}
          <g stroke="currentColor" opacity="0.08" strokeWidth="0.8">
            <line x1={paddingX} y1={paddingY} x2={paddingX + plotW} y2={paddingY} />
            <line x1={paddingX} y1={paddingY + plotH * 0.5} x2={paddingX + plotW} y2={paddingY + plotH * 0.5} />
            <line x1={paddingX} y1={viewBoxH - paddingY} x2={paddingX + plotW} y2={viewBoxH - paddingY} />
            <line x1={paddingX + plotW * 0.25} y1={paddingY} x2={paddingX + plotW * 0.25} y2={viewBoxH - paddingY} />
            <line x1={paddingX + plotW * 0.5} y1={paddingY} x2={paddingX + plotW * 0.5} y2={viewBoxH - paddingY} />
            <line x1={paddingX + plotW * 0.75} y1={paddingY} x2={paddingX + plotW * 0.75} y2={viewBoxH - paddingY} />
          </g>

          {/* Render landscape layers from bottom (layer 5) to top (layer 1) */}
          {layerKeys.slice().reverse().map((key, revIdx) => {
            const actualIdx = layerKeys.length - 1 - revIdx;
            const values = layerData[key];
            const color = LAYER_COLORS[actualIdx % LAYER_COLORS.length];

            const pointsStr = values
              .map((v, i) => `${getSvgX(bins[i]).toFixed(1)},${getSvgY(v).toFixed(1)}`)
              .join(" ");

            const areaPath = `M ${getSvgX(0)},${getSvgY(0)} L ${pointsStr} L ${getSvgX(1)},${getSvgY(0)} Z`;

            return (
              <g key={key}>
                {/* Area Fill */}
                <path
                  d={areaPath}
                  fill={color}
                  fillOpacity={0.12 + (5 - actualIdx) * 0.04}
                />
                {/* Boundary Curve */}
                <polyline
                  points={pointsStr}
                  fill="none"
                  stroke={color}
                  strokeWidth={actualIdx === 0 ? "2.2" : "1.4"}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </g>
            );
          })}

          {/* X Axis Labels */}
          <g className="text-[9px] font-mono fill-muted-foreground" textAnchor="middle">
            <text x={paddingX} y={viewBoxH - 12}>t = 0.0</text>
            <text x={paddingX + plotW * 0.25} y={viewBoxH - 12}>0.25</text>
            <text x={paddingX + plotW * 0.5} y={viewBoxH - 12}>0.50</text>
            <text x={paddingX + plotW * 0.75} y={viewBoxH - 12}>0.75</text>
            <text x={paddingX + plotW} y={viewBoxH - 12}>1.00</text>
          </g>
        </svg>
      </div>

      {/* Footer Info */}
      <div className="pt-2 border-t border-border/40 flex justify-between items-center text-[11px] font-mono text-muted-foreground">
        <span>Coordinate-free topological signature</span>
        <span>Peak Landscape λ₁: {maxAmp.toFixed(3)} (Dominant Crack Cycle)</span>
      </div>
    </div>
  );
}
