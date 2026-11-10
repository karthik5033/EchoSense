"use client";

import React, { useState, useMemo } from "react";
import { generateAeWaveform } from "@/lib/echosenseData";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Play, Pause, ZoomIn, ZoomOut, Layers } from "lucide-react";

interface SignalWaveformPlotProps {
  className?: string;
  isAnomalous?: boolean;
  title?: string;
  samplingRate?: string;
}

export function SignalWaveformPlot({
  className = "",
  isAnomalous = false,
  title = "Acoustic Emission Transient Burst",
  samplingRate = "500 kHz (1000 samples)",
}: SignalWaveformPlotProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [showFiltered, setShowFiltered] = useState(true);
  const [showEnvelope, setShowEnvelope] = useState(true);

  const data = useMemo(() => generateAeWaveform(160, isAnomalous), [isAnomalous]);

  const width = 560;
  const height = 180;
  const padLeft = 36;
  const padBottom = 24;
  const padTop = 16;
  const padRight = 16;
  const plotW = width - padLeft - padRight;
  const plotH = height - padTop - padBottom;

  const minAmp = -1.2;
  const maxAmp = 1.2;

  const getX = (idx: number) => padLeft + (idx / (data.length - 1)) * plotW;
  const getY = (amp: number) =>
    padTop + plotH - ((amp - minAmp) / (maxAmp - minAmp)) * plotH;

  const rawPath = data.reduce(
    (acc, d, i) =>
      i === 0
        ? `M ${getX(i).toFixed(1)} ${getY(d.amplitude).toFixed(1)}`
        : `${acc} L ${getX(i).toFixed(1)} ${getY(d.amplitude).toFixed(1)}`,
    ""
  );

  const filteredPath = data.reduce(
    (acc, d, i) =>
      i === 0
        ? `M ${getX(i).toFixed(1)} ${getY(d.filtered).toFixed(1)}`
        : `${acc} L ${getX(i).toFixed(1)} ${getY(d.filtered).toFixed(1)}`,
    ""
  );

  const envelopePath = data.reduce(
    (acc, d, i) =>
      i === 0
        ? `M ${getX(i).toFixed(1)} ${getY(d.envelope).toFixed(1)}`
        : `${acc} L ${getX(i).toFixed(1)} ${getY(d.envelope).toFixed(1)}`,
    ""
  );

  return (
    <div className={`rounded-xl border border-border bg-card p-4 flex flex-col ${className}`}>
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-border/60">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-semibold text-foreground">{title}</h3>
            <span className="text-[10px] font-mono text-muted-foreground bg-secondary px-2 py-0.5 rounded border border-border">
              {samplingRate}
            </span>
            {isAnomalous && (
              <span className="text-[10px] font-mono px-2 py-0.5 rounded border border-primary/40 text-primary bg-primary/10 uppercase font-semibold">
                Crack Precursor Hit
              </span>
            )}
          </div>
          <p className="text-[11px] text-muted-foreground mt-0.5">
            Transient elastic wave stress release profile with detected onset boundary
          </p>
        </div>

        <div className="flex items-center gap-1.5">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsPlaying(!isPlaying)}
            className="h-7 text-xs gap-1 px-2.5 text-muted-foreground hover:text-foreground"
          >
            {isPlaying ? <Pause className="w-3.5 h-3.5 text-[#FF5500]" /> : <Play className="w-3.5 h-3.5 text-muted-foreground" />}
            {isPlaying ? "Pause Stream" : "Simulate Play"}
          </Button>

          <div className="flex items-center rounded-lg bg-muted/60 p-0.5 border border-border text-xs">
            <button
              onClick={() => setShowFiltered(!showFiltered)}
              className={`px-2 py-0.5 rounded text-[11px] font-medium transition-colors ${
                showFiltered ? "bg-card text-foreground shadow-sm" : "text-muted-foreground"
              }`}
            >
              Filtered
            </button>
            <button
              onClick={() => setShowEnvelope(!showEnvelope)}
              className={`px-2 py-0.5 rounded text-[11px] font-medium transition-colors ${
                showEnvelope ? "bg-card text-foreground shadow-sm" : "text-muted-foreground"
              }`}
            >
              Envelope
            </button>
          </div>
        </div>
      </div>

      {/* Waveform SVG */}
      <div className="pt-2 select-none overflow-hidden">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto">
          <defs>
            <clipPath id="plotInnerClip">
              <rect x={padLeft} y={padTop} width={plotW} height={plotH} />
            </clipPath>
            <linearGradient id="plotBeamGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#FF5500" stopOpacity="0" />
              <stop offset="75%" stopColor="#FF5500" stopOpacity="0.05" />
              <stop offset="100%" stopColor="#FF5500" stopOpacity="0.35" />
            </linearGradient>
          </defs>

          {/* Zero reference axis */}
          <line
            x1={padLeft}
            y1={getY(0)}
            x2={width - padRight}
            y2={getY(0)}
            stroke="currentColor"
            strokeOpacity="0.25"
            strokeDasharray="3,3"
          />

          {/* Subtle Infinite Scanning Beam */}
          <g clipPath="url(#plotInnerClip)">
            <rect x={padLeft} y={padTop} width="35" height={plotH} fill="url(#plotBeamGrad)">
              <animate
                attributeName="x"
                from={padLeft - 35}
                to={width - padRight}
                dur="3.2s"
                repeatCount="indefinite"
              />
            </rect>
            <line x1={padLeft} y1={padTop} x2={padLeft} y2={padTop + plotH} stroke="#FF5500" strokeWidth="1" opacity="0.6">
              <animate
                attributeName="x1"
                from={padLeft}
                to={width - padRight + 35}
                dur="3.2s"
                repeatCount="indefinite"
              />
              <animate
                attributeName="x2"
                from={padLeft}
                to={width - padRight + 35}
                dur="3.2s"
                repeatCount="indefinite"
              />
            </line>
          </g>

          {/* Event Onset Highlight Band */}
          <rect
            x={getX(18)}
            y={padTop}
            width={getX(110) - getX(18)}
            height={plotH}
            fill="#FF5500"
            fillOpacity="0.04"
            stroke="#FF5500"
            strokeOpacity="0.25"
            strokeDasharray="3,3"
          />
          <text
            x={getX(20) + 4}
            y={padTop + 13}
            fontSize="8"
            fill="#a1a1aa"
            fontFamily="monospace"
          >
            Acoustic Burst Window (Onset t0 = 1.0ms)
          </text>

          {/* Envelope */}
          {showEnvelope && (
            <path
              d={envelopePath}
              fill="none"
              stroke="#71717a"
              strokeWidth="1.0"
              strokeDasharray="2,2"
              opacity="0.7"
            />
          )}

          {/* Raw Waveform */}
          <path
            d={rawPath}
            fill="none"
            stroke="#52525b"
            strokeWidth="0.8"
            opacity="0.4"
          />

          {/* Filtered Waveform */}
          {showFiltered && (
            <path
              d={filteredPath}
              fill="none"
              stroke="#f4f4f5"
              strokeWidth="1.4"
              strokeLinecap="round"
            />
          )}

          {/* Time axis ticks */}
          {[0, 2, 4, 6, 8].map((t) => {
            const idx = Math.floor((t / 8) * (data.length - 1));
            return (
              <g key={t}>
                <text
                  x={getX(idx)}
                  y={height - 6}
                  fontSize="8"
                  fill="currentColor"
                  opacity="0.4"
                  textAnchor="middle"
                  fontFamily="monospace"
                >
                  {t}.0 ms
                </text>
              </g>
            );
          })}

          {/* Amplitude label */}
          <text
            x={padLeft - 6}
            y={getY(1.0) + 3}
            fontSize="8"
            fill="currentColor"
            opacity="0.5"
            textAnchor="end"
            fontFamily="monospace"
          >
            +1.0 V
          </text>
          <text
            x={padLeft - 6}
            y={getY(0) + 3}
            fontSize="8"
            fill="currentColor"
            opacity="0.5"
            textAnchor="end"
            fontFamily="monospace"
          >
            0.0 V
          </text>
          <text
            x={padLeft - 6}
            y={getY(-1.0) + 3}
            fontSize="8"
            fill="currentColor"
            opacity="0.5"
            textAnchor="end"
            fontFamily="monospace"
          >
            -1.0 V
          </text>
        </svg>
      </div>

      {/* Signal Stats Footer */}
      <div className="mt-2 pt-2.5 border-t border-border/50 grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
        <div>
          <span className="text-[10px] text-muted-foreground uppercase font-mono block">Peak Amplitude</span>
          <span className="font-semibold text-foreground font-mono">1.184 Vpp</span>
        </div>
        <div>
          <span className="text-[10px] text-muted-foreground uppercase font-mono block">RMS Energy</span>
          <span className="font-semibold text-foreground font-mono">0.342 V</span>
        </div>
        <div>
          <span className="text-[10px] text-muted-foreground uppercase font-mono block">Ringing Frequency</span>
          <span className="font-semibold text-foreground/90 font-mono">148.6 kHz</span>
        </div>
        <div>
          <span className="text-[10px] text-muted-foreground uppercase font-mono block">RA Value (Rise/Amp)</span>
          <span className="font-semibold text-foreground/90 font-mono">24.8 μs/V</span>
        </div>
      </div>
    </div>
  );
}

