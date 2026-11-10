"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import {
  Radio,
  Play,
  Pause,
  Activity,
  ShieldAlert,
  Cpu,
  RefreshCw,
  Bell,
  Sliders,
  ChevronRight,
  Layers,
  Waves,
  Zap,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface LiveHit {
  id: string;
  time: string;
  energy: string;
  frequency: string;
  classifiedMode: "Tensile" | "Shear" | "Mixed-Mode";
  severity: "info" | "warning" | "critical";
  confidence: number;
}

const SAMPLE_COUNT = 240;

export default function RealTimeMonitorPage() {
  const [isStreaming, setIsStreaming] = useState(true);
  const [selectedChannel, setSelectedChannel] = useState("CH-01");
  const [windowSize, setWindowSize] = useState("10s");
  const [displayMode, setDisplayMode] = useState<"rf" | "fft">("rf");

  // Physics animation state
  const [tick, setTick] = useState(0);
  const [burstCycle, setBurstCycle] = useState(0);

  const [liveHits, setLiveHits] = useState<LiveHit[]>([
    {
      id: "HIT-412",
      time: "23:59:12",
      energy: "0.84 V²·s",
      frequency: "148.6 kHz",
      classifiedMode: "Tensile",
      severity: "info",
      confidence: 0.94,
    },
    {
      id: "HIT-411",
      time: "23:58:45",
      energy: "1.42 V²·s",
      frequency: "88.2 kHz",
      classifiedMode: "Shear",
      severity: "critical",
      confidence: 0.96,
    },
    {
      id: "HIT-410",
      time: "23:58:10",
      energy: "0.62 V²·s",
      frequency: "135.4 kHz",
      classifiedMode: "Tensile",
      severity: "info",
      confidence: 0.91,
    },
    {
      id: "HIT-409",
      time: "23:57:30",
      energy: "1.10 V²·s",
      frequency: "95.0 kHz",
      classifiedMode: "Mixed-Mode",
      severity: "warning",
      confidence: 0.88,
    },
  ]);

  // Advance physical time clock
  useEffect(() => {
    if (!isStreaming) return;
    const timer = setInterval(() => {
      setTick((prev) => prev + 1);
    }, 45); // ~22 FPS smooth scope animation

    return () => clearInterval(timer);
  }, [isStreaming]);

  // Compute mathematically sound acoustic emission waveform packet
  // Obeying damped elastic stress wave: V(t) = A * (t/tau_r) * exp(-t/tau_d) * cos(2*pi*f*t) + noise
  const { wavePoints, peakVpp, hasPrecursor } = useMemo(() => {
    const points: number[] = new Array(SAMPLE_COUNT);
    let maxV = 0.05;
    let minV = -0.05;

    // Periodic acoustic burst trigger: burst sweeps across window every 90 ticks
    const cyclePos = tick % 95;
    const isBurstActive = cyclePos >= 10 && cyclePos <= 75;
    const burstProgress = (cyclePos - 10) / 65; // 0.0 to 1.0 progress through window
    const burstCenterIdx = Math.floor(burstProgress * (SAMPLE_COUNT + 60)) - 30;

    const normCarrierFreq = selectedChannel === "CH-04" ? 0.08 : 0.28; // Discrete carrier cycles

    for (let i = 0; i < SAMPLE_COUNT; i++) {
      const t = i + tick * 2;
      // 1. Ambient continuous baseline noise + concrete low-frequency micro-tremor
      const baseline =
        0.032 * Math.sin(0.05 * t) +
        0.018 * Math.sin(0.11 * t + 0.8) +
        0.02 * (Math.sin(1.3 * t) * Math.cos(2.1 * t));

      // 2. Physical transient acoustic emission burst packet
      let burstVal = 0;
      if (isBurstActive) {
        const dist = i - burstCenterIdx;
        // Damped harmonic packet envelope
        if (dist >= 0 && dist < 55) {
          const envelope = (dist / 10) * Math.exp(-dist / 13);
          const oscillation = Math.cos(2 * Math.PI * normCarrierFreq * dist);
          burstVal = 1.18 * envelope * oscillation;
        }
      }

      const v = baseline + burstVal;
      points[i] = v;
      if (v > maxV) maxV = v;
      if (v < minV) minV = v;
    }

    const calculatedPeak = parseFloat((maxV - minV).toFixed(2));
    const precursorDetected = isBurstActive && calculatedPeak > 0.45;

    return {
      wavePoints: points,
      peakVpp: calculatedPeak,
      hasPrecursor: precursorDetected,
    };
  }, [tick, selectedChannel]);

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-7xl mx-auto w-full font-sans select-none">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b border-border/60">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground flex items-center gap-2.5">
            <Radio className="h-5 w-5 text-primary" />
            <span>Real-Time Acoustic Emission Monitor</span>
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Synchronized multi-channel oscilloscope streaming with automated TopoAE precursor hit classification
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant={isStreaming ? "outline" : "default"}
            onClick={() => setIsStreaming(!isStreaming)}
            className="gap-1.5 text-xs font-semibold cursor-pointer border-border h-8"
          >
            {isStreaming ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
            {isStreaming ? "Pause Ingestion" : "Resume Stream"}
          </Button>
        </div>
      </div>

      {/* Sensor Channel & Timebase Control Bar */}
      <div className="p-3.5 rounded-xl border border-border bg-card flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="text-xs font-medium text-muted-foreground">Active Transducer:</span>
          <select
            value={selectedChannel}
            onChange={(e) => setSelectedChannel(e.target.value)}
            className="text-xs bg-muted/60 border border-border rounded-lg px-3 py-1.5 font-mono text-foreground focus:outline-none cursor-pointer"
          >
            <option value="CH-01">CH-01: Girder G1 Midspan (R15α, 150 kHz Resonant)</option>
            <option value="CH-02">CH-02: Shear Key Interface (R15α, 150 kHz Resonant)</option>
            <option value="CH-03">CH-03: Anchor Tendon Zone (R15α, 150 kHz Resonant)</option>
            <option value="CH-04">CH-04: Pier Base Support (Broadband MEMS, 48 kHz)</option>
          </select>
        </div>

        {/* View Toggle & Timebase */}
        <div className="flex items-center gap-3">
          <div className="flex items-center rounded-lg bg-secondary/50 p-0.5 border border-border text-xs">
            <button
              onClick={() => setDisplayMode("rf")}
              className={`px-2.5 py-1 rounded-md text-[11px] font-mono transition-colors cursor-pointer ${
                displayMode === "rf"
                  ? "bg-card text-foreground font-semibold shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              RF Waveform
            </button>
            <button
              onClick={() => setDisplayMode("fft")}
              className={`px-2.5 py-1 rounded-md text-[11px] font-mono transition-colors cursor-pointer ${
                displayMode === "fft"
                  ? "bg-card text-foreground font-semibold shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              FFT Spectrum (PSD)
            </button>
          </div>

          <div className="flex items-center rounded-lg bg-secondary/50 p-0.5 border border-border text-xs">
            {["5s", "10s", "30s"].map((size) => (
              <button
                key={size}
                onClick={() => setWindowSize(size)}
                className={`px-2.5 py-1 rounded-md text-[11px] font-mono transition-colors cursor-pointer ${
                  windowSize === size
                    ? "bg-card text-foreground font-semibold shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {size}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Real-Time Oscilloscope Waveform Display */}
      <Card className="border border-border bg-[#0a0a0e] p-5 shadow-2xl relative overflow-hidden">
        {/* Scope Header */}
        <div className="flex items-center justify-between pb-3 border-b border-border/40 text-xs font-mono">
          <div className="flex items-center gap-2">
            <span className="text-foreground font-semibold">
              {selectedChannel === "CH-01" && "CH-01: Midspan (150 kHz R15α)"}
              {selectedChannel === "CH-02" && "CH-02: Shear Key (150 kHz R15α)"}
              {selectedChannel === "CH-03" && "CH-03: Anchor Tendon (150 kHz R15α)"}
              {selectedChannel === "CH-04" && "CH-04: Pier Base (48 kHz MEMS)"}
            </span>
            <span className="text-muted-foreground">|</span>
            <span className="text-muted-foreground">Gain: +24 dB</span>
            <span className="text-muted-foreground">|</span>
            <span className="text-muted-foreground">Bandpass: 20-400 kHz Butterworth</span>
          </div>

          <div className="flex items-center gap-2 text-muted-foreground text-[11px]">
            <span>Raw Ingest: 10 MS/s</span>
            <span>•</span>
            <span className="text-foreground/80 font-mono">Decimated Scope: 500 kS/s (20x)</span>
          </div>
        </div>

        {/* Oscilloscope SVG Canvas */}
        <div className="relative h-64 w-full flex items-center justify-center my-3 select-none">
          {displayMode === "rf" ? (
            <svg viewBox="0 0 800 240" className="w-full h-full">
              {/* Scope Grid Background */}
              <defs>
                <pattern id="scopeGrid" width="40" height="30" patternUnits="userSpaceOnUse">
                  <path d="M 40 0 L 0 0 0 30" fill="none" stroke="#161622" strokeWidth="0.8" />
                </pattern>
              </defs>
              <rect width="800" height="240" fill="url(#scopeGrid)" />

              {/* Zero Volts Center Reference Line */}
              <line x1="0" y1="120" x2="800" y2="120" stroke="#262638" strokeWidth="1" strokeDasharray="3 3" />
              <line x1="0" y1="45" x2="800" y2="45" stroke="#1e1e2c" strokeWidth="0.8" strokeDasharray="2 2" />
              <line x1="0" y1="195" x2="800" y2="195" stroke="#1e1e2c" strokeWidth="0.8" strokeDasharray="2 2" />

              {/* +1.0V / 0V / -1.0V Amplitude Guides */}
              <text x="12" y="49" fill="#71717a" fontSize="8" fontFamily="monospace">+1.0 V</text>
              <text x="12" y="124" fill="#71717a" fontSize="8" fontFamily="monospace">0.0 V</text>
              <text x="12" y="199" fill="#71717a" fontSize="8" fontFamily="monospace">-1.0 V</text>

              {/* Continuous Physical Acoustic Emission Waveform */}
              <path
                d={wavePoints.reduce((acc, val, i) => {
                  const x = (i / (SAMPLE_COUNT - 1)) * 800;
                  const y = 120 - val * 90;
                  return i === 0 ? `M ${x.toFixed(1)} ${y.toFixed(1)}` : `${acc} L ${x.toFixed(1)} ${y.toFixed(1)}`;
                }, "")}
                fill="none"
                stroke="#FF5500"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
                opacity="0.95"
              />
            </svg>
          ) : (
            /* Power Spectral Density (FFT) Mode */
            <svg viewBox="0 0 800 240" className="w-full h-full">
              <defs>
                <pattern id="fftGrid" width="50" height="30" patternUnits="userSpaceOnUse">
                  <path d="M 50 0 L 0 0 0 30" fill="none" stroke="#161622" strokeWidth="0.8" />
                </pattern>
              </defs>
              <rect width="800" height="240" fill="url(#fftGrid)" />

              {/* FFT Spectrum Envelope peaking at 148.6 kHz */}
              <path
                d="M 50 210 Q 150 200 250 190 T 400 170 Q 470 50 490 35 T 510 50 Q 550 160 650 195 T 750 210"
                fill="none"
                stroke="#FF5500"
                strokeWidth="2"
              />
              <path
                d="M 50 210 Q 150 200 250 190 T 400 170 Q 470 50 490 35 T 510 50 Q 550 160 650 195 T 750 210 L 750 220 L 50 220 Z"
                fill="#FF5500"
                opacity="0.1"
              />

              {/* Resonant Peak Frequency Marker Line */}
              <line x1="490" y1="35" x2="490" y2="220" stroke="#FF5500" strokeWidth="1" strokeDasharray="3 3" />
              <text x="490" y="25" fill="#FF5500" fontSize="10" fontFamily="monospace" textAnchor="middle" fontWeight="bold">
                Resonant Peak: 148.6 kHz (R15α)
              </text>

              {/* Frequency Axis Labels */}
              <text x="50" y="232" fill="#71717a" fontSize="9" fontFamily="monospace">0 kHz</text>
              <text x="250" y="232" fill="#71717a" fontSize="9" fontFamily="monospace">50 kHz</text>
              <text x="490" y="232" fill="#71717a" fontSize="9" fontFamily="monospace">150 kHz</text>
              <text x="750" y="232" fill="#71717a" fontSize="9" fontFamily="monospace">250 kHz</text>
            </svg>
          )}

          {/* Trigger Alert Badge Overlay */}
          <div className="absolute top-4 right-4 backdrop-blur-md rounded-lg px-3 py-1.5 flex items-center gap-2 text-xs font-mono transition-all">
            {hasPrecursor ? (
              <div className="bg-[#FF5500]/15 border border-[#FF5500]/60 text-white rounded-lg px-3 py-1.5 flex items-center gap-2">
                <ShieldAlert className="w-3.5 h-3.5 text-[#FF5500]" />
                <span className="font-semibold">PRECURSOR EVENT CONFIRMED</span>
              </div>
            ) : (
              <div className="bg-secondary/60 border border-border text-muted-foreground rounded-lg px-3 py-1.5 flex items-center gap-2">
                <Activity className="w-3.5 h-3.5 text-zinc-400" />
                <span>STREAM ACQUIRING (Baseline Noise: 0.05 Vpp)</span>
              </div>
            )}
          </div>
        </div>

        {/* Scope Footer Metadata */}
        <div className="flex flex-wrap items-center justify-between gap-3 text-[11px] font-mono text-muted-foreground pt-2.5 border-t border-border/40">
          <span>Sweep Window: -{windowSize} to now</span>
          <div className="flex items-center gap-4">
            <span className="text-foreground/90 font-medium">
              Peak AE Voltage: {peakVpp} Vpp
            </span>
            <span>•</span>
            <span className="text-foreground/90">
              Ringing Frequency: 148.6 kHz
            </span>
          </div>
          <span className="text-muted-foreground">PTP Lock Jitter: &lt; 42 ns</span>
        </div>
      </Card>

      {/* Lower Row: Anomaly Score Gauge & Live Event Stream */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: 4 Cols Gauges */}
        <div className="lg:col-span-4 space-y-4">
          <Card className="border border-border bg-card p-4 space-y-3">
            <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
              <Activity className="h-4 w-4 text-[#FF5500]" />
              Live Conv1D Anomaly Gauge
            </h3>
            <div className="p-4 rounded-xl border border-border bg-muted/20 text-center">
              <div className="text-4xl font-black font-mono text-[#FF5500]">
                {hasPrecursor ? "0.74" : "0.08"}
              </div>
              <span className="text-xs font-semibold text-primary block mt-1">
                {hasPrecursor ? "Elevated Residual (Shear Precursor)" : "Baseline Intact State (Nominal)"}
              </span>
              <p className="text-[11px] text-muted-foreground mt-2 leading-relaxed">
                {hasPrecursor
                  ? "Exceeds 0.180 anomaly threshold. Persistent H1 topological hole confirmed."
                  : "Within normal operating boundaries. Isotropic environmental noise floor."}
              </p>
            </div>
          </Card>

          <Card className="border border-border bg-card p-4 space-y-2">
            <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
              <Cpu className="h-4 w-4 text-primary" />
              Online BOCD Status
            </h3>
            <div className="flex items-center justify-between text-xs font-mono p-2 rounded bg-muted/40">
              <span className="text-muted-foreground">Changepoints Flagged:</span>
              <span className="font-bold text-foreground">5 Points</span>
            </div>
            <div className="flex items-center justify-between text-xs font-mono p-2 rounded bg-muted/40">
              <span className="text-muted-foreground">Precursor Warning Lead:</span>
              <span className="font-bold text-foreground">340 ms</span>
            </div>
          </Card>
        </div>

        {/* Right: 8 Cols Live Hit Log */}
        <Card className="lg:col-span-8 border border-border bg-card">
          <CardHeader className="pb-3 border-b border-border/50">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Bell className="h-4 w-4 text-primary" />
              Real-Time AE Precursor Hit Log
            </CardTitle>
            <CardDescription className="text-xs">
              Instantaneous classification of transient events streamed over the active monitoring session
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0 overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-border">
                  <TableHead className="text-xs font-mono">Hit ID</TableHead>
                  <TableHead className="text-xs font-mono">Time (UTC)</TableHead>
                  <TableHead className="text-xs">Energy</TableHead>
                  <TableHead className="text-xs">Frequency</TableHead>
                  <TableHead className="text-xs">Predicted Mode</TableHead>
                  <TableHead className="text-xs">Confidence</TableHead>
                  <TableHead className="text-right text-xs pr-4">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {liveHits.map((hit) => (
                  <TableRow key={hit.id} className="border-border hover:bg-muted/30">
                    <TableCell className="font-mono text-xs text-foreground/80 font-medium">{hit.id}</TableCell>
                    <TableCell className="font-mono text-xs text-muted-foreground">{hit.time}</TableCell>
                    <TableCell className="font-mono text-xs text-foreground">{hit.energy}</TableCell>
                    <TableCell className="font-mono text-xs text-muted-foreground">{hit.frequency}</TableCell>
                    <TableCell className="text-xs">
                      <Badge
                        variant="outline"
                        className={`text-[10px] font-mono font-medium ${
                          hit.classifiedMode === "Shear"
                            ? "border-primary/40 text-primary bg-primary/5"
                            : "border-border text-zinc-300 bg-muted/40"
                        }`}
                      >
                        {hit.classifiedMode}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-mono text-xs text-foreground">
                      {(hit.confidence * 100).toFixed(0)}%
                    </TableCell>
                    <TableCell className="text-right pr-4">
                      <Link href="/analysis">
                        <Button variant="ghost" size="sm" className="h-6 text-[11px] text-muted-foreground hover:text-foreground cursor-pointer">
                          TDA View →
                        </Button>
                      </Link>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
