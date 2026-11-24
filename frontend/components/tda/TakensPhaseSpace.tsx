"use client";

import React, { useState, useMemo } from "react";
import { generateTakensAttractor } from "@/lib/echosenseData";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { RotateCw, Box, Layers } from "lucide-react";
import { AttractorPlot3D } from "./AttractorPlot3D";

interface TakensPhaseSpaceProps {
  className?: string;
  initialDelay?: number;
  initialDim?: number;
  points3D?: Array<[number, number, number]>;
}

export function TakensPhaseSpace({
  className = "",
  initialDelay = 4,
  initialDim = 3,
  points3D,
}: TakensPhaseSpaceProps) {
  const [mode, setMode] = useState<"webgl" | "projection">("webgl");
  const [delay, setDelay] = useState(initialDelay);
  const [dim, setDim] = useState(initialDim);
  const [angleX, setAngleX] = useState(25);
  const [angleY, setAngleY] = useState(45);
  const [isAutoRotating, setIsAutoRotating] = useState(true);

  // Smooth physical 3D attractor rotation loop
  React.useEffect(() => {
    if (!isAutoRotating || mode !== "projection") return;
    const interval = setInterval(() => {
      setAngleY((prev) => (prev + 0.4) % 360);
    }, 45);
    return () => clearInterval(interval);
  }, [isAutoRotating, mode]);

  // Generate 3D point cloud
  const rawPoints = useMemo(() => {
    if (points3D && points3D.length > 0) {
      return points3D.map((p: any, idx: number) => ({
        x: Array.isArray(p) ? p[0] : p.x,
        y: Array.isArray(p) ? p[1] : p.y,
        z: Array.isArray(p) ? p[2] : p.z,
        index: idx,
      }));
    }
    return generateTakensAttractor(220);
  }, [points3D]);

  // 3D Isometric projection to 2D screen
  const projectedPoints = useMemo(() => {
    const radX = (angleX * Math.PI) / 180;
    const radY = (angleY * Math.PI) / 180;
    const cosX = Math.cos(radX);
    const sinX = Math.sin(radX);
    const cosY = Math.cos(radY);
    const sinY = Math.sin(radY);

    const scale = 80;
    const centerX = 170;
    const centerY = 160;

    return rawPoints.map((pt, i) => {
      const x1 = pt.x * cosY + pt.z * sinY;
      const z1 = -pt.x * sinY + pt.z * cosY;

      const y2 = pt.y * cosX - z1 * sinX;
      const z2 = pt.y * sinX + z1 * cosX;

      const px = centerX + x1 * scale;
      const py = centerY - y2 * scale;

      return {
        px,
        py,
        depth: z2,
        index: i,
        phase: (i / rawPoints.length) * 100,
      };
    });
  }, [rawPoints, angleX, angleY]);

  const pathD = useMemo(() => {
    if (projectedPoints.length === 0) return "";
    return projectedPoints.reduce((acc, curr, idx) => {
      if (idx === 0) return `M ${curr.px.toFixed(1)} ${curr.py.toFixed(1)}`;
      return `${acc} L ${curr.px.toFixed(1)} ${curr.py.toFixed(1)}`;
    }, "");
  }, [projectedPoints]);

  if (mode === "webgl") {
    return (
      <div className={`relative flex flex-col ${className}`}>
        <div className="absolute top-6 right-6 z-10">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setMode("projection")}
            className="h-7 text-[11px] gap-1 px-2.5 bg-card/80 backdrop-blur"
          >
            <Layers className="w-3 h-3 text-muted-foreground" />
            <span>Wireframe</span>
          </Button>
        </div>
        <AttractorPlot3D
          initialDelay={delay}
          initialDim={dim}
          onParamsChange={(d, dm) => {
            setDelay(d);
            setDim(dm);
          }}
        />
      </div>
    );
  }

  return (
    <div className={`rounded-xl border border-border bg-card p-4 flex flex-col ${className}`}>
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-border/60">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-semibold text-foreground">
              Takens Delay-Coordinate Embedding
            </h3>
            <span className="text-[10px] font-mono text-[#FF5500] bg-[#FF5500]/10 border border-[#FF5500]/20 px-2 py-0.5 rounded">
              d = {dim}, τ = {delay}
            </span>
          </div>
          <p className="text-[11px] text-muted-foreground mt-0.5">
            Dynamical state-space attractor reconstruction from single acoustic time series
          </p>
        </div>

        <div className="flex items-center gap-1.5">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setMode("webgl")}
            className="h-7 text-[11px] gap-1 px-2.5"
            title="Switch to 3D WebGL Visualizer"
          >
            <Box className="w-3 h-3 text-[#FF5500]" />
            <span>3D WebGL</span>
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsAutoRotating(!isAutoRotating)}
            className={`h-7 text-[11px] gap-1 px-2.5 transition-all ${
              isAutoRotating 
                ? "border-[#FF5500]/40 text-[#FF5500] bg-[#FF5500]/10" 
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <RotateCw className={`w-3 h-3 ${isAutoRotating ? "animate-spin text-[#FF5500]" : ""}`} style={{ animationDuration: '6s' }} />
            <span>{isAutoRotating ? "Auto-Orbit" : "Orbit"}</span>
          </Button>
        </div>
      </div>

      {/* 2D Isometric Projection Canvas */}
      <div className="relative flex-1 flex flex-col items-center justify-center pt-2 select-none overflow-hidden min-h-[260px]">
        <svg viewBox="0 0 340 320" className="w-full max-w-[340px] aspect-square">
          <defs>
            <linearGradient id="orbitGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FFA066" stopOpacity="0.85" />
              <stop offset="50%" stopColor="#FF5500" stopOpacity="0.95" />
              <stop offset="100%" stopColor="#C2410C" stopOpacity="0.85" />
            </linearGradient>
          </defs>

          {/* Coordinate Bounding Frame */}
          <g opacity="0.12" stroke="currentColor" strokeWidth="0.8">
            <rect x="70" y="60" width="200" height="200" rx="4" fill="none" strokeDasharray="3,3" />
            <line x1="70" y1="160" x2="270" y2="160" strokeDasharray="1,4" />
            <line x1="170" y1="60" x2="170" y2="260" strokeDasharray="1,4" />
          </g>

          {/* Orbit Line */}
          <path
            d={pathD}
            fill="none"
            stroke="url(#orbitGrad)"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity="0.9"
          />

          {/* Point nodes */}
          {projectedPoints.map((pt, idx) => {
            if (idx % 6 !== 0) return null;
            const r = Math.max(1.2, 2.8 + pt.depth * 0.8);
            const op = Math.max(0.3, 0.75 + pt.depth * 0.2);
            return (
              <circle
                key={idx}
                cx={pt.px}
                cy={pt.py}
                r={r}
                fill={idx > projectedPoints.length - 15 ? "#FFA066" : "#FF5500"}
                opacity={op}
              />
            );
          })}
        </svg>
      </div>

      {/* Sliders */}
      <div className="grid grid-cols-2 gap-4 pt-3 border-t border-border/40 text-xs">
        <div>
          <div className="flex justify-between items-center mb-1">
            <span className="text-[11px] font-mono text-muted-foreground">Delay Lag (τ)</span>
            <span className="font-mono font-bold text-[#FF5500]">{delay}</span>
          </div>
          <input
            type="range"
            min={1}
            max={16}
            step={1}
            value={delay}
            onChange={(e) => setDelay(parseInt(e.target.value, 10))}
            className="w-full accent-[#FF5500] cursor-pointer h-1.5 bg-muted rounded-lg"
          />
        </div>

        <div>
          <div className="flex justify-between items-center mb-1">
            <span className="text-[11px] font-mono text-muted-foreground">Dimension (d)</span>
            <span className="font-mono font-bold text-foreground">{dim}</span>
          </div>
          <input
            type="range"
            min={2}
            max={5}
            step={1}
            value={dim}
            onChange={(e) => setDim(parseInt(e.target.value, 10))}
            className="w-full accent-[#FF5500] cursor-pointer h-1.5 bg-muted rounded-lg"
          />
        </div>
      </div>
    </div>
  );
}
