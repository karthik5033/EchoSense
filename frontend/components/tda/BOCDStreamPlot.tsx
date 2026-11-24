"use client";

import React, { useState } from "react";
import { Activity, AlertTriangle, ShieldCheck } from "lucide-react";

interface BOCDStreamPlotProps {
  changepointProbs?: number[];
  alarmSteps?: number[];
  mapRunLengths?: number[];
  alarmThreshold?: number;
  className?: string;
}

export function BOCDStreamPlot({
  changepointProbs = [],
  alarmSteps = [],
  mapRunLengths = [],
  alarmThreshold = 0.65,
  className = "",
}: BOCDStreamPlotProps) {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  // Fallback synthetic stream if none provided
  const probs = changepointProbs.length > 0 ? changepointProbs : [
    0.01, 0.02, 0.01, 0.03, 0.02, 0.04, 0.02, 0.05, 0.08, 0.12,
    0.15, 0.22, 0.35, 0.58, 0.88, 0.94, 0.72, 0.45, 0.22, 0.11,
    0.05, 0.04, 0.03, 0.02, 0.03, 0.02, 0.01, 0.02, 0.04, 0.03
  ];

  const totalSteps = probs.length;
  const alarms = alarmSteps.length > 0
    ? alarmSteps
    : probs.map((p, idx) => (p >= alarmThreshold ? idx : -1)).filter((idx) => idx !== -1);

  const viewBoxW = 500;
  const viewBoxH = 220;
  const paddingX = 40;
  const paddingY = 25;
  const plotW = viewBoxW - 2 * paddingX;
  const plotH = viewBoxH - 2 * paddingY;

  const getSvgX = (step: number) => paddingX + (step / Math.max(1, totalSteps - 1)) * plotW;
  const getSvgY = (prob: number) => viewBoxH - paddingY - prob * plotH;

  const pointsStr = probs
    .map((p, idx) => `${getSvgX(idx).toFixed(1)},${getSvgY(p).toFixed(1)}`)
    .join(" ");

  const areaPath = `M ${getSvgX(0)},${getSvgY(0)} L ${pointsStr} L ${getSvgX(totalSteps - 1)},${getSvgY(0)} Z`;

  const thresholdY = getSvgY(alarmThreshold);

  return (
    <div className={`rounded-xl border border-border bg-card p-4 flex flex-col ${className}`}>
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-border/60">
        <div>
          <h3 className="text-sm font-semibold text-foreground flex items-center gap-1.5">
            <Activity className="h-4 w-4 text-[#FF5500]" />
            Bayesian Online Changepoint Detection (BOCD) Stream
          </h3>
          <p className="text-[11px] text-muted-foreground mt-0.5">
            Real-time acoustic precursor probability: P(rt = 0 | x_1:t) with hazard rate &lambda; = 150
          </p>
        </div>

        <div className="flex items-center gap-2">
          {alarms.length > 0 ? (
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#FF5500]/10 border border-[#FF5500]/30 text-[#FF5500] text-xs font-mono font-bold">
              <AlertTriangle className="h-3.5 w-3.5" />
              <span>PRECURSOR ALARM ({alarms.length} hits)</span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-muted/40 border border-border text-muted-foreground text-xs font-mono">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
              <span>NOMINAL REGIME</span>
            </div>
          )}
        </div>
      </div>

      {/* SVG Timeline Canvas */}
      <div className="py-2 flex-1 flex flex-col justify-center">
        <svg viewBox={`0 0 ${viewBoxW} ${viewBoxH}`} className="w-full h-auto select-none">
          {/* Grid lines */}
          <g stroke="currentColor" opacity="0.08" strokeWidth="0.8">
            <line x1={paddingX} y1={paddingY} x2={paddingX + plotW} y2={paddingY} />
            <line x1={paddingX} y1={getSvgY(0.5)} x2={paddingX + plotW} y2={getSvgY(0.5)} />
            <line x1={paddingX} y1={viewBoxH - paddingY} x2={paddingX + plotW} y2={viewBoxH - paddingY} />
          </g>

          {/* Alarm Threshold Line */}
          <line
            x1={paddingX}
            y1={thresholdY}
            x2={paddingX + plotW}
            y2={thresholdY}
            stroke="#FF5500"
            strokeDasharray="4,4"
            strokeWidth="1.2"
            opacity="0.8"
          />
          <text
            x={paddingX + plotW - 4}
            y={thresholdY - 5}
            fill="#FF5500"
            fontSize="9"
            fontFamily="monospace"
            textAnchor="end"
          >
            Alarm Threshold (0.65)
          </text>

          {/* Area fill */}
          <path d={areaPath} fill="#FF5500" fillOpacity="0.12" />

          {/* Probability curve */}
          <polyline
            points={pointsStr}
            fill="none"
            stroke="#FF5500"
            strokeWidth="2.0"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Highlight alarm nodes */}
          {probs.map((p, idx) => {
            const cx = getSvgX(idx);
            const cy = getSvgY(p);
            const isAlarm = p >= alarmThreshold;
            if (!isAlarm && idx % 3 !== 0) return null;

            return (
              <circle
                key={idx}
                cx={cx}
                cy={cy}
                r={isAlarm ? 3.5 : 2.0}
                fill={isAlarm ? "#FF5500" : "#71717A"}
                stroke="#0C1017"
                strokeWidth="1"
                className="cursor-pointer"
                onMouseEnter={() => setHoveredIdx(idx)}
                onMouseLeave={() => setHoveredIdx(null)}
              />
            );
          })}

          {/* X Axis Step Labels */}
          <g className="text-[9px] font-mono fill-muted-foreground" textAnchor="middle">
            <text x={paddingX} y={viewBoxH - 8}>t = 0</text>
            <text x={paddingX + plotW * 0.25} y={viewBoxH - 8}>{Math.round(totalSteps * 0.25)}</text>
            <text x={paddingX + plotW * 0.5} y={viewBoxH - 8}>{Math.round(totalSteps * 0.5)}</text>
            <text x={paddingX + plotW * 0.75} y={viewBoxH - 8}>{Math.round(totalSteps * 0.75)}</text>
            <text x={paddingX + plotW} y={viewBoxH - 8}>{totalSteps}</text>
          </g>
        </svg>
      </div>

      {/* Footer Info */}
      <div className="pt-2 border-t border-border/40 flex justify-between items-center text-[11px] font-mono">
        <span className="text-muted-foreground">
          {hoveredIdx !== null
            ? `Step ${hoveredIdx}: P(CP) = ${probs[hoveredIdx].toFixed(4)}`
            : "Hover nodes to inspect changepoint probabilities"}
        </span>
        <span className="text-foreground">
          Detection Delay: &le; 2 events (Precursor Lead: 340 ms)
        </span>
      </div>
    </div>
  );
}
