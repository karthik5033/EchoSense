"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Crosshair,
  Activity,
  Play,
  Pause,
  RotateCcw,
  Sliders,
  Layers,
  Sparkles,
  ArrowRight,
  ShieldAlert,
  CheckCircle2,
  Download,
  Flame,
  Info,
  Radio,
  Clock,
  Compass,
  Cpu,
  Zap,
  Eye,
  EyeOff,
  Waves,
  Volume2,
  ShieldCheck,
  Gauge,
} from "lucide-react";
import { MetricCard } from "@/components/shared/MetricCard";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

// Pre-defined structural damage hotspot locations on 10m Girder
const PRESET_CRACK_LOCATIONS = [
  {
    id: "LOC-MIDSPAN",
    name: "Midspan Flexural Micro-Crack (Zone A)",
    x: 4.20,
    z: 0.35,
    mode: "Mode I Tensile",
    amplitude: 1.18,
    energy_j: 48.2,
    first_hit: "CH-01",
    dt12: 24.6,
    dt13: 48.2,
    dt14: 165.4,
  },
  {
    id: "LOC-SHEARKEY",
    name: "Shear Key Web Precursor (Zone B)",
    x: 1.85,
    z: 0.65,
    mode: "Mode II Shear Slip",
    amplitude: 0.94,
    energy_j: 62.5,
    first_hit: "CH-02",
    dt12: -38.4,
    dt13: 84.1,
    dt14: 210.2,
  },
  {
    id: "LOC-TENDON",
    name: "Prestress Tendon Slippage (Zone C)",
    x: 6.40,
    z: 0.22,
    mode: "Mixed-Mode Delamination",
    amplitude: 1.42,
    energy_j: 89.0,
    first_hit: "CH-03",
    dt12: 65.2,
    dt13: -22.5,
    dt14: 98.6,
  },
  {
    id: "LOC-SUPPORT",
    name: "Pier Support Bearing Micro-Fissure",
    x: 8.80,
    z: 0.40,
    mode: "Mode I Micro-Tensile",
    amplitude: 0.72,
    energy_j: 28.4,
    first_hit: "CH-04",
    dt12: 142.0,
    dt13: 88.5,
    dt14: -54.2,
  },
];

// 4 Active Sensors on the 10m Girder
const SENSORS = [
  {
    id: "CH-01",
    name: "Midspan Transducer",
    type: "R15α Piezo (150 kHz)",
    x: 4.50,
    z: 1.40,
    mount: "Top Flange",
    color: "#FF5500",
    riseUs: 14,
    freqKhz: 150,
    status: "Active",
  },
  {
    id: "CH-02",
    name: "Shear Key Transducer",
    type: "R15α Piezo (150 kHz)",
    x: 2.00,
    z: 1.40,
    mount: "Top Flange",
    color: "#06b6d4",
    riseUs: 22,
    freqKhz: 150,
    status: "Active",
  },
  {
    id: "CH-03",
    name: "Anchor Transducer",
    type: "10 MHz High-Speed Digitizer",
    x: 6.50,
    z: 1.40,
    mount: "Top Flange",
    color: "#a855f7",
    riseUs: 31,
    freqKhz: 220,
    status: "Active",
  },
  {
    id: "CH-04",
    name: "Pier P4 Node",
    type: "48 kHz 24-bit MEMS Sensor",
    x: 8.80,
    z: 0.00,
    mount: "Bottom Flange",
    color: "#10b981",
    riseUs: 58,
    freqKhz: 48,
    status: "Active",
  },
];

// Dispersion curve points (Frequency-Thickness vs Phase/Group Velocity)
const DISPERSION_DATA = [
  { fd: 0.2, cp_s0: 4200, cp_a0: 1200, cg_s0: 3800, cg_a0: 1600 },
  { fd: 0.5, cp_s0: 4100, cp_a0: 1900, cg_s0: 3750, cg_a0: 2200 },
  { fd: 1.0, cp_s0: 3950, cp_a0: 2400, cg_s0: 3600, cg_a0: 2500 },
  { fd: 1.5, cp_s0: 3850, cp_a0: 2550, cg_s0: 3450, cg_a0: 2580 },
  { fd: 2.0, cp_s0: 3780, cp_a0: 2600, cg_s0: 3300, cg_a0: 2550 },
  { fd: 3.0, cp_s0: 3700, cp_a0: 2620, cg_s0: 3100, cg_a0: 2480 },
  { fd: 4.0, cp_s0: 3650, cp_a0: 2630, cg_s0: 2950, cg_a0: 2420 },
  { fd: 5.0, cp_s0: 3620, cp_a0: 2640, cg_s0: 2850, cg_a0: 2380 },
];

// Synthetic acoustic emission burst waveform path generator
function generateBurstPath(amplitude: number, freqKhz: number): string {
  const points: string[] = [];
  const total = 50;
  const cycles = Math.min(8, Math.max(3, Math.round(freqKhz / 30)));
  for (let i = 0; i <= total; i++) {
    const t = i / total;
    const env = Math.pow(t, 0.75) * Math.exp(-4.2 * t) * 4.8;
    const wave = Math.sin(2 * Math.PI * cycles * t);
    const yVal = 24 - env * wave * Math.min(1.4, amplitude) * 16;
    const xVal = (i / total) * 220 + 10;
    points.push(`${i === 0 ? "M" : "L"} ${xVal.toFixed(1)} ${yVal.toFixed(1)}`);
  }
  return points.join(" ");
}

export default function AcousticLocalizationPage() {
  const [activeTab, setActiveTab] = useState<"tdoa" | "heatmap" | "dispersion" | "anisotropy" | "solver">("tdoa");
  const [selectedPreset, setSelectedPreset] = useState(0);
  const [waveSpeed, setWaveSpeed] = useState(3850); // m/s
  const [timingJitterNs, setTimingJitterNs] = useState(100); // ns
  const [isWavePlaying, setIsWavePlaying] = useState(true);
  const [waveTimeUs, setWaveTimeUs] = useState(180); // 0 to 1100 µs
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1);
  const [showWavefronts, setShowWavefronts] = useState(true);
  const [showHyperbolas, setShowHyperbolas] = useState(true);
  const [showRays, setShowRays] = useState(true);
  const [showMesh, setShowMesh] = useState(true);
  const [showCovariance, setShowCovariance] = useState(true);
  const [hoveredSensor, setHoveredSensor] = useState<string | null>(null);
  const [modeFilter, setModeFilter] = useState<"all" | "tensile" | "shear" | "mixed">("all");
  const [solverStep, setSolverStep] = useState(5);

  const currentPreset = PRESET_CRACK_LOCATIONS[selectedPreset];

  // Deep-link query param synchronization
  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const tab = params.get("tab");
      if (tab && ["tdoa", "heatmap", "dispersion", "anisotropy", "solver"].includes(tab)) {
        setActiveTab(tab as any);
      }
    }
  }, []);

  // Animate wave propagation over time (0 to 1100 µs)
  useEffect(() => {
    if (!isWavePlaying) return;
    const interval = setInterval(() => {
      setWaveTimeUs((t) => (t >= 1050 ? 0 : t + 10 * playbackSpeed));
    }, 35);
    return () => clearInterval(interval);
  }, [isWavePlaying, playbackSpeed]);

  // Calculate simulated TDoA localization error based on jitter and speed
  const calculatedX = (currentPreset.x + (timingJitterNs / 100) * 0.018).toFixed(3);
  const calculatedZ = (currentPreset.z + (timingJitterNs / 100) * 0.012).toFixed(3);
  const spatialErrorMm = (Math.abs(parseFloat(calculatedX) - currentPreset.x) * 1000 + Math.abs(parseFloat(calculatedZ) - currentPreset.z) * 1000).toFixed(1);

  // SVG Coordinate Conversion:
  // Canvas ViewBox: 1000 x 410
  // Girder X span: 80px (0.0m) to 920px (10.0m) -> 84 px/m
  // Girder Elevation: 290px (0.00m) to 110px (1.40m) -> 180px for 1.4m = 128.57 px/m
  const toSvgX = (x: number) => 80 + x * 84;
  const toSvgY = (z: number) => 290 - z * (180 / 1.4);

  const epicX = toSvgX(currentPreset.x);
  const epicY = toSvgY(currentPreset.z);
  const solX = toSvgX(parseFloat(calculatedX));
  const solY = toSvgY(parseFloat(calculatedZ));
  const solZ = solY;

  // Radii of expanding wavefields
  const pWaveRadiusM = waveSpeed * (waveTimeUs * 1e-6);
  const pWaveRadiusPx = pWaveRadiusM * 84;
  const sWaveRadiusM = 2400 * (waveTimeUs * 1e-6);
  const sWaveRadiusPx = sWaveRadiusM * 84;

  // Sensor hit timing and signal analysis
  const sensorAnalysis = SENSORS.map((s) => {
    const distM = Math.sqrt((s.x - currentPreset.x) ** 2 + (s.z - currentPreset.z) ** 2);
    const arrivalUs = (distM / waveSpeed) * 1e6;
    const isHit = waveTimeUs >= arrivalUs;
    const isFirstHit = s.id === currentPreset.first_hit;
    const channelAmp = Math.max(0.18, currentPreset.amplitude * (1 / (1 + 0.32 * distM)));
    const energy = Math.round(currentPreset.energy_j * (1 / (1 + 0.38 * distM)));
    return {
      ...s,
      distM,
      arrivalUs,
      isHit,
      isFirstHit,
      channelAmp,
      energy,
    };
  });

  // Calculate mathematical hyperbola paths for sensor pairs
  const computeHyperbola = (
    sA: { x: number; z: number },
    sB: { x: number; z: number },
    dtUs: number
  ) => {
    const deltaD = waveSpeed * (dtUs * 1e-6);
    const pts: { x: number; y: number }[] = [];
    for (let z = -0.15; z <= 1.55; z += 0.05) {
      let bestX = -1;
      let minErr = 999;
      for (let x = 0; x <= 10; x += 0.04) {
        const d1 = Math.sqrt((x - sA.x) ** 2 + (z - sA.z) ** 2);
        const d2 = Math.sqrt((x - sB.x) ** 2 + (z - sB.z) ** 2);
        const err = Math.abs((d1 - d2) - deltaD);
        if (err < minErr) {
          minErr = err;
          bestX = x;
        }
      }
      if (bestX >= 0 && minErr < 0.12) {
        pts.push({ x: toSvgX(bestX), y: toSvgY(z) });
      }
    }
    if (pts.length < 2) return "";
    return pts.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(" ");
  };

  // Precursor Callout Chip Positioning
  const isRightSide = currentPreset.x > 5.5;
  const chipX = isRightSide ? Math.max(epicX - 250, 85) : Math.min(epicX + 45, 715);
  const chipY = Math.max(epicY - 65, 45);

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto w-full">
      
      {/* PAGE HEADER */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-3 border-b border-border/60">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-[#FF5500]/15 text-[#FF5500] border border-[#FF5500]/30">
              <Crosshair className="h-5 w-5" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2.5">
              <span>Acoustic Wave Localization &amp; Spatial Damage Matrix</span>
            </h1>
          </div>
        </div>
      </div>

      {/* TOP KEY METRICS HUD */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
        <MetricCard
          title="Compressional Wave (Vp)"
          value={`${waveSpeed} m/s`}
          subtext="Concrete C40 Acoustic Velocity"
          change="±25 m/s"
          isPositive={true}
          icon={<Activity className="h-4 w-4 text-primary" />}
        />
        <MetricCard
          title="Shear Wave Velocity (Vs)"
          value="2,400 m/s"
          subtext="Transverse Elastic Wavefront"
          change="ν = 0.20"
          isPositive={true}
          icon={<Layers className="h-4 w-4 text-muted-foreground" />}
        />
        <MetricCard
          title="TDoA Accuracy"
          value={`±${spatialErrorMm} mm`}
          subtext="Hyperbolic Multilateration Error"
          change="GDOP 1.34"
          isPositive={true}
          icon={<Crosshair className="h-4 w-4 text-primary" />}
        />
        <MetricCard
          title="Timing Resolution"
          value={`${timingJitterNs} ns`}
          subtext="4-Channel Synchronized Array"
          change="10 MS/s"
          isPositive={true}
          icon={<Clock className="h-4 w-4 text-muted-foreground" />}
        />
      </div>

      {/* NAVIGATION TABS */}
      <div className="flex flex-wrap items-center gap-2 border-b border-border/80 pb-2 text-xs font-medium">
        <button
          onClick={() => setActiveTab("tdoa")}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
            activeTab === "tdoa" ? "bg-secondary text-foreground font-semibold border border-border" : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <Crosshair className="h-3.5 w-3.5 text-primary" />
          <span>1. Acoustic Wave Localization</span>
        </button>

        <button
          onClick={() => setActiveTab("heatmap")}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
            activeTab === "heatmap" ? "bg-secondary text-foreground font-semibold border border-border" : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <Flame className="h-3.5 w-3.5 text-muted-foreground" />
          <span>2. 2D Damage Density Heatmap</span>
        </button>

        <button
          onClick={() => setActiveTab("dispersion")}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
            activeTab === "dispersion" ? "bg-secondary text-foreground font-semibold border border-border" : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <Activity className="h-3.5 w-3.5 text-muted-foreground" />
          <span>3. Lamb Wave Dispersion</span>
        </button>

        <button
          onClick={() => setActiveTab("anisotropy")}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
            activeTab === "anisotropy" ? "bg-secondary text-foreground font-semibold border border-border" : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <Compass className="h-3.5 w-3.5 text-muted-foreground" />
          <span>4. Velocity Anisotropy</span>
        </button>

        <button
          onClick={() => setActiveTab("solver")}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
            activeTab === "solver" ? "bg-secondary text-foreground font-semibold border border-border" : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <Cpu className="h-3.5 w-3.5 text-muted-foreground" />
          <span>5. Gauss-Newton Solver</span>
        </button>
      </div>

      {/* TAB 1: TDoA MULTILATERATION & WAVEFRONT MAP */}
      {activeTab === "tdoa" && (
        <div className="space-y-4">
          
          {/* CLEAN, SIMPLE TOP CONTROLS */}
          <div className="rounded-xl border border-border bg-card p-4 space-y-3 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              {/* Preset Selector */}
              <div className="flex items-center gap-2.5 flex-1 max-w-md">
                <span className="text-xs text-muted-foreground font-medium shrink-0">Precursor Preset:</span>
                <select
                  value={selectedPreset}
                  onChange={(e) => {
                    setSelectedPreset(Number(e.target.value));
                    setWaveTimeUs(0);
                  }}
                  className="w-full text-xs bg-muted/50 border border-border rounded-lg px-3 py-1.5 font-medium text-foreground focus:outline-none cursor-pointer"
                >
                  {PRESET_CRACK_LOCATIONS.map((loc, i) => (
                    <option key={loc.id} value={i}>
                      {loc.name} (x={loc.x}m, z={loc.z}m)
                    </option>
                  ))}
                </select>
              </div>

              {/* Simple Play / Pause Pulse & Reset */}
              <div className="flex items-center gap-2 shrink-0">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setIsWavePlaying(!isWavePlaying)}
                  className="h-8 px-3 text-xs gap-1.5 border-border cursor-pointer font-medium"
                >
                  {isWavePlaying ? <Pause className="h-3.5 w-3.5 text-primary" /> : <Play className="h-3.5 w-3.5 text-primary" />}
                  <span>{isWavePlaying ? "Pause Pulse" : "Simulate Pulse"}</span>
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => {
                    setIsWavePlaying(false);
                    setWaveTimeUs(0);
                  }}
                  className="h-8 px-2.5 text-xs text-muted-foreground hover:text-foreground cursor-pointer"
                  title="Reset Pulse"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>

            {/* Sliders: Wave Speed & Sensor Jitter */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2.5 border-t border-border/50 text-xs">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-muted-foreground font-medium">Concrete Acoustic Velocity (Vp)</span>
                  <span className="font-mono text-foreground font-bold">{waveSpeed} m/s</span>
                </div>
                <input
                  type="range"
                  min="3400"
                  max="4400"
                  step="25"
                  value={waveSpeed}
                  onChange={(e) => setWaveSpeed(Number(e.target.value))}
                  className="w-full accent-primary cursor-pointer h-1.5"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-muted-foreground font-medium">Sensor Clock Jitter</span>
                  <span className="font-mono text-foreground font-bold">{timingJitterNs} ns</span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="500"
                  step="10"
                  value={timingJitterNs}
                  onChange={(e) => setTimingJitterNs(Number(e.target.value))}
                  className="w-full accent-primary cursor-pointer h-1.5"
                />
              </div>
            </div>
          </div>

          {/* MAIN GIRDER SCHEMATIC VIEWPORT (CLEAN, CONTAINED, NO CLUTTER) */}
          <div className="rounded-xl border border-border bg-[#0d0d14] p-5 shadow-xl relative overflow-hidden">
            
            {/* Viewport Header Bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-border/60 text-xs">
              <div className="flex items-center gap-2.5">
                <span className="font-bold text-foreground">
                  Prestressed Concrete Girder (10.0m Span)
                </span>
                <Badge variant="outline" className="font-mono text-[10px] border-border text-muted-foreground">
                  Elevation Cross-Section &bull; C40 Concrete
                </Badge>
              </div>

              <div className="flex items-center gap-4 font-mono text-[11px] text-muted-foreground">
                <span>Source: <strong className="text-foreground">x={currentPreset.x}m, z={currentPreset.z}m</strong></span>
                <span>Accuracy: <strong className="text-primary">&plusmn;{spatialErrorMm} mm</strong></span>
              </div>
            </div>

            {/* SVG SCHEMATIC VIEWPORT */}
            <div className="relative w-full h-[280px] sm:h-[320px] mt-2 flex items-center justify-center">
              <svg viewBox="0 0 1000 360" className="w-full h-full select-none">
                <defs>
                  {/* Clip path strictly containing anything inside the physical girder */}
                  <clipPath id="girder-clip">
                    <rect x="80" y="90" width="840" height="180" rx="3" />
                  </clipPath>

                  {/* Subtle glow for the defect epicenter */}
                  <radialGradient id="defectGlow" cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stopColor="#FF5500" stopOpacity="0.8" />
                    <stop offset="50%" stopColor="#FF5500" stopOpacity="0.15" />
                    <stop offset="100%" stopColor="#FF5500" stopOpacity="0" />
                  </radialGradient>
                </defs>

                {/* 1. Scale Ruler Along Top (0m to 10m) */}
                <line x1="80" y1="65" x2="920" y2="65" stroke="#2e2e3e" strokeWidth="1" />
                {[0, 2, 4, 6, 8, 10].map((m) => {
                  const xPos = 80 + m * 84;
                  return (
                    <g key={`ruler-${m}`}>
                      <line x1={xPos} y1="60" x2={xPos} y2="65" stroke="#4a4a5e" strokeWidth="1" />
                      <text x={xPos} y="54" fill="#8e8ea0" fontSize="9" fontFamily="monospace" textAnchor="middle">
                        {m}m
                      </text>
                    </g>
                  );
                })}

                {/* 2. Girder Support Blocks (Simple & Clean) */}
                <rect x="72" y="270" width="16" height="12" rx="2" fill="#1b1b26" stroke="#2e2e42" strokeWidth="1" />
                <rect x="912" y="270" width="16" height="12" rx="2" fill="#1b1b26" stroke="#2e2e42" strokeWidth="1" />

                {/* 3. Physical Girder Body */}
                <rect
                  x="80"
                  y="90"
                  width="840"
                  height="180"
                  rx="3"
                  fill="#14141d"
                  stroke="#2b2b3d"
                  strokeWidth="1.5"
                />

                {/* Top flange strip */}
                <rect x="80" y="90" width="840" height="16" fill="#1a1a27" stroke="#2f2f42" strokeWidth="1" />
                {/* Bottom flange strip */}
                <rect x="80" y="254" width="840" height="16" fill="#1a1a27" stroke="#2f2f42" strokeWidth="1" />

                {/* Subtle Tendon Arc (clean single muted gray path) */}
                <path
                  d="M 80 130 Q 500 240 920 130"
                  fill="none"
                  stroke="#2d2d3f"
                  strokeWidth="2"
                  strokeDasharray="4,4"
                />

                {/* 4. Acoustic Wave Ripple (STRICTLY CLIPPED INSIDE GIRDER & TAME) */}
                <g clipPath="url(#girder-clip)">
                  {isWavePlaying && (
                    <>
                      <circle
                        cx={epicX}
                        cy={epicY}
                        r={Math.min(110, (waveTimeUs % 400) * 0.28)}
                        fill="none"
                        stroke="#FF5500"
                        strokeWidth="1.5"
                        opacity={Math.max(0, 0.5 - ((waveTimeUs % 400) * 0.28) / 110)}
                      />
                      <circle
                        cx={epicX}
                        cy={epicY}
                        r={Math.min(70, ((waveTimeUs + 160) % 400) * 0.18)}
                        fill="none"
                        stroke="#FF5500"
                        strokeWidth="1"
                        strokeDasharray="3,3"
                        opacity={Math.max(0, 0.35 - (((waveTimeUs + 160) % 400) * 0.18) / 70)}
                      />
                    </>
                  )}
                </g>

                {/* 5. Four Sensor Nodes (Clean, Uniform, Uncluttered) */}
                {SENSORS.map((s) => {
                  const sX = toSvgX(s.x);
                  const sY = s.z > 0.8 ? 90 : 270;
                  const isTriggered = s.id === currentPreset.first_hit;

                  return (
                    <g key={s.id} transform={`translate(${sX}, ${sY})`}>
                      <rect
                        x="-14"
                        y={s.z > 0.8 ? -16 : 0}
                        width="28"
                        height="16"
                        rx="3"
                        fill="#181824"
                        stroke={isTriggered ? "#FF5500" : "#3b3b4f"}
                        strokeWidth="1.2"
                      />
                      <text
                        x="0"
                        y={s.z > 0.8 ? -5 : 11}
                        fill={isTriggered ? "#FF5500" : "#d4d4d8"}
                        fontSize="8.5"
                        fontFamily="monospace"
                        fontWeight="bold"
                        textAnchor="middle"
                      >
                        {s.id}
                      </text>
                    </g>
                  );
                })}

                {/* 6. Solved Defect Epicenter (Crisp, Clean, with Infinite Physical Acoustic Pulse) */}
                <circle cx={epicX} cy={epicY} r="20" fill="url(#defectGlow)" />
                <circle cx={epicX} cy={epicY} r="6" fill="none" stroke="#FF5500" strokeWidth="1.5">
                  <animate attributeName="r" values="6;16;6" dur="2.4s" repeatCount="indefinite" />
                  <animate attributeName="opacity" values="0.9;0.2;0.9" dur="2.4s" repeatCount="indefinite" />
                </circle>
                <circle cx={epicX} cy={epicY} r="2.5" fill="#ffffff" />

                {/* Clean Callout Label (Above or Below, single concise badge) */}
                <g transform={`translate(${Math.max(100, Math.min(780, epicX - 85))}, ${epicY > 180 ? epicY - 34 : epicY + 16})`}>
                  <rect
                    x="0"
                    y="0"
                    width="170"
                    height="22"
                    rx="4"
                    fill="#13131c"
                    stroke="#FF5500"
                    strokeWidth="1"
                  />
                  <circle cx="9" cy="11" r="2.5" fill="#FF5500">
                    <animate attributeName="opacity" values="1;0.3;1" dur="1.8s" repeatCount="indefinite" />
                  </circle>
                  <text x="18" y="14.5" fill="#ffffff" fontSize="8.5" fontFamily="monospace" fontWeight="bold">
                    Precursor: x={currentPreset.x}m, z={currentPreset.z}m
                  </text>
                </g>
              </svg>
            </div>

            {/* Viewport Clean 4-Metric Summary Strip Below */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 mt-2 border-t border-border/50 text-xs font-mono">
              <div className="p-2.5 rounded-lg bg-card border border-border/60">
                <span className="text-[10px] text-muted-foreground uppercase block font-semibold">Event Position</span>
                <span className="font-bold text-foreground text-xs mt-0.5 block">
                  x={currentPreset.x}m, z={currentPreset.z}m
                </span>
              </div>
              <div className="p-2.5 rounded-lg bg-card border border-border/60">
                <span className="text-[10px] text-muted-foreground uppercase block font-semibold">TDoA Error</span>
                <span className="font-bold text-foreground text-xs mt-0.5 block">
                  &plusmn;{spatialErrorMm} mm
                </span>
              </div>
              <div className="p-2.5 rounded-lg bg-card border border-border/60">
                <span className="text-[10px] text-muted-foreground uppercase block font-semibold">Trigger Sensor</span>
                <span className="font-bold text-primary text-xs mt-0.5 block">
                  {currentPreset.first_hit} (t₀ = 0.0 µs)
                </span>
              </div>
              <div className="p-2.5 rounded-lg bg-card border border-border/60">
                <span className="text-[10px] text-muted-foreground uppercase block font-semibold">Wave Velocity</span>
                <span className="font-bold text-foreground text-xs mt-0.5 block">
                  {waveSpeed} m/s
                </span>
              </div>
            </div>

          </div>

          {/* 4-CHANNEL HIGH-SPEED DIGITIZER TELEMETRY STRIP */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-mono text-zinc-400 px-1">
              <span className="font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5 text-[#FF5500]" />
                4-Channel Transducer Array Telemetry (10 MS/s)
              </span>
              <span className="text-zinc-500">EN 1330-9 Calibration</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {sensorAnalysis.map((s) => {
                const isHovered = hoveredSensor === s.id;
                const dtRelUs = s.isFirstHit ? 0 : s.arrivalUs - sensorAnalysis.find((x) => x.isFirstHit)!.arrivalUs;

                return (
                  <div
                    key={`card-${s.id}`}
                    onMouseEnter={() => setHoveredSensor(s.id)}
                    onMouseLeave={() => setHoveredSensor(null)}
                    className={cn(
                      "rounded-xl border p-3.5 transition-all bg-[#13131c] relative overflow-hidden",
                      isHovered
                        ? "border-[#FF5500] ring-1 ring-[#FF5500]/40"
                        : s.isHit
                        ? "border-border/80 shadow-md"
                        : "border-border/50 opacity-75"
                    )}
                  >
                    {/* Header */}
                    <div className="flex items-center justify-between pb-2 border-b border-border/40">
                      <div className="flex items-center gap-2">
                        <span
                          className={cn(
                            "w-2 h-2 rounded-full",
                            s.isHit ? (s.isFirstHit ? "bg-[#FF5500]" : "bg-zinc-400") : "bg-zinc-600"
                          )}
                        />
                        <span className="font-mono font-bold text-xs text-white">{s.id}</span>
                        <span className="text-[10px] text-zinc-400 font-sans truncate">{s.name.split(" ")[0]}</span>
                      </div>

                      <Badge
                        variant="outline"
                        className={cn(
                          "font-mono text-[10px] px-1.5 py-0.2",
                          s.isFirstHit
                            ? "border-primary/50 text-primary bg-primary/10 font-bold"
                            : s.isHit
                            ? "border-border text-zinc-300 bg-muted/40 font-mono"
                            : "border-border text-zinc-500"
                        )}
                      >
                        {s.isHit ? (s.isFirstHit ? "FIRST HIT 0.0µs" : `+${dtRelUs.toFixed(1)} µs`) : "ARMED"}
                      </Badge>
                    </div>

                    {/* Sensor Specs */}
                    <div className="flex items-center justify-between text-[10px] text-zinc-500 font-mono mt-1.5">
                      <span>{s.type.split(" (")[0]}</span>
                      <span>x={s.x}m • {s.mount.split(" ")[0]}</span>
                    </div>

                    {/* Mini Acoustic Emission Burst Oscilloscope Waveform */}
                    <div className="my-2 h-12 w-full bg-[#0a0a0f] rounded border border-border/60 relative overflow-hidden flex items-center justify-center">
                      <svg viewBox="0 0 240 48" className="w-full h-full">
                        {/* Grid raster */}
                        <line x1="0" y1="24" x2="240" y2="24" stroke="#1c1c28" strokeWidth="0.8" strokeDasharray="2,2" />
                        <line x1="60" y1="0" x2="60" y2="48" stroke="#181822" strokeWidth="0.8" strokeDasharray="2,2" />
                        <line x1="120" y1="0" x2="120" y2="48" stroke="#181822" strokeWidth="0.8" strokeDasharray="2,2" />
                        <line x1="180" y1="0" x2="180" y2="48" stroke="#181822" strokeWidth="0.8" strokeDasharray="2,2" />

                        {/* Trigger Level Reference line */}
                        <line x1="0" y1="16" x2="240" y2="16" stroke="#52525b" strokeWidth="0.8" strokeDasharray="3,3" opacity="0.6" />

                        {/* Waveform Trace */}
                        {s.isHit ? (
                          <path
                            d={generateBurstPath(s.channelAmp, s.freqKhz)}
                            fill="none"
                            stroke={s.isFirstHit ? "#FF5500" : "#a1a1aa"}
                            strokeWidth="1.8"
                          />
                        ) : (
                          <line x1="0" y1="24" x2="240" y2="24" stroke="#272733" strokeWidth="1" />
                        )}
                      </svg>
                      <span className="absolute top-1 right-1.5 text-[8px] font-mono text-zinc-500">
                        {s.freqKhz} kHz
                      </span>
                    </div>

                    {/* Measured Metrics */}
                    <div className="grid grid-cols-3 gap-1 pt-1 font-mono text-[10px] text-zinc-400">
                      <div>
                        <span className="text-[9px] text-zinc-500 block">Peak Vpp</span>
                        <span className="text-white font-bold">{s.isHit ? `${s.channelAmp.toFixed(2)} V` : "--"}</span>
                      </div>
                      <div>
                        <span className="text-[9px] text-zinc-500 block">Rise (tr)</span>
                        <span className="text-zinc-300">{s.isHit ? `${s.riseUs} µs` : "--"}</span>
                      </div>
                      <div>
                        <span className="text-[9px] text-zinc-500 block">Energy</span>
                        <span className="text-zinc-200 font-bold">{s.isHit ? `${s.energy} aJ` : "--"}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>
      )}

      {/* TAB 2: 2D DAMAGE DENSITY HEATMAP */}
      {activeTab === "heatmap" && (
        <div className="space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-xl border border-border bg-card/60 text-xs">
            <div>
              <h3 className="font-bold text-foreground text-sm">Acoustic Event Spatial Cluster Density (KDE)</h3>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-zinc-400 font-mono text-xs">Fracture Mode Filter:</span>
              {(["all", "tensile", "shear", "mixed"] as const).map((m) => (
                <button
                  key={m}
                  onClick={() => setModeFilter(m)}
                  className={`px-2.5 py-1 rounded text-xs font-mono uppercase transition-colors cursor-pointer ${
                    modeFilter === m ? "bg-[#FF5500] text-white font-bold" : "bg-secondary text-zinc-400 hover:text-white"
                  }`}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>

          {/* 2D HEATMAP GRID */}
          <div className="rounded-2xl border border-border bg-[#141419] p-6 text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-border/50 font-mono text-[11px] text-zinc-400">
              <span>Z-Axis Elevation (0.0m to 1.4m) vs X-Axis Span (0.0m to 10.0m)</span>
              <span className="text-[#FF5500] font-semibold">Critical Shear Zone: x ∈ [3.8m, 4.6m] (68% AE Energy)</span>
            </div>

            <div className="relative mt-5 h-72 w-full flex flex-col justify-between">
              {/* Heatmap Grid Cells */}
              <div className="grid grid-rows-6 grid-cols-20 gap-1.5 w-full h-56">
                {[...Array(120)].map((_, i) => {
                  const row = Math.floor(i / 20);
                  const col = i % 20;
                  const xVal = col * 0.5;
                  
                  // Hotspot near x = 4.0 - 4.5m and z = 0.3 - 0.7m (Shear-Flexure Zone)
                  const isHotspot = (col >= 7 && col <= 10 && row >= 2 && row <= 4);
                  const isShearKey = (col >= 3 && col <= 5 && row >= 1 && row <= 3);
                  const isTendonSlip = (col >= 12 && col <= 14 && row >= 4);

                  let opacity = 0.08;
                  let bg = "bg-zinc-800/40";
                  let count = Math.floor(Math.random() * 80 + 10);

                  if (isHotspot) {
                    opacity = 0.95;
                    bg = "bg-[#FF5500]";
                    count = Math.floor(Math.random() * 800 + 1200);
                  } else if (isShearKey) {
                    opacity = 0.65;
                    bg = "bg-[#FF5500]/60";
                    count = Math.floor(Math.random() * 400 + 600);
                  } else if (isTendonSlip) {
                    opacity = 0.45;
                    bg = "bg-zinc-500";
                    count = Math.floor(Math.random() * 300 + 400);
                  }

                  return (
                    <div
                      key={`heat-${i}`}
                      title={`Cell (${(col * 0.5).toFixed(1)}m, ${((5 - row) * 0.23).toFixed(2)}m): ${count} Events`}
                      className={`rounded-sm transition-all hover:scale-110 hover:z-10 cursor-pointer ${bg}`}
                      style={{ opacity }}
                    />
                  );
                })}
              </div>

              {/* X-Axis Labels */}
              <div className="flex justify-between font-mono text-[10px] text-zinc-500 pt-2 border-t border-border/40">
                <span>0.0m (Left Support)</span>
                <span>2.5m</span>
                <span className="text-[#FF5500] font-bold">5.0m (Midspan Hotspot)</span>
                <span>7.5m</span>
                <span>10.0m (Right Support)</span>
              </div>
            </div>

            {/* Heatmap Stats Row */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-5 mt-4 border-t border-border/50 text-xs font-mono">
              <div className="p-3 rounded-lg border border-border bg-[#181822]">
                <span className="text-zinc-500 block">Cluster 1 (Midspan Tension)</span>
                <span className="text-lg font-bold text-white mt-1 block">18,420 Events</span>
                <span className="text-[10px] text-[#FF5500]">Peak Density: 2,420 ev/m³</span>
              </div>
              <div className="p-3 rounded-lg border border-border bg-[#181822]">
                <span className="text-zinc-500 block">Cluster 2 (Shear Key Friction)</span>
                <span className="text-lg font-bold text-white mt-1 block">12,180 Events</span>
                <span className="text-[10px] text-zinc-300">Peak Density: 1,180 ev/m³</span>
              </div>
              <div className="p-3 rounded-lg border border-border bg-[#181822]">
                <span className="text-zinc-500 block">Cluster 3 (Prestress Slip)</span>
                <span className="text-lg font-bold text-white mt-1 block">6,840 Events</span>
                <span className="text-[10px] text-zinc-400">Peak Density: 740 ev/m³</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: LAMB WAVE DISPERSION CURVES */}
      {activeTab === "dispersion" && (
        <div className="space-y-6">
          <div className="p-4 rounded-xl border border-border bg-card/60 text-xs">
            <h3 className="font-bold text-foreground text-sm">Lamb Wave Ultrasonic Dispersion</h3>
          </div>

          <div className="rounded-2xl border border-border bg-[#141419] p-6 text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-border/50 font-mono text-[11px] text-zinc-400">
              <span>Phase Velocity (Cp) &amp; Group Velocity (Cg) vs Frequency-Thickness Product (f·d)</span>
              <div className="flex items-center gap-4">
                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-[#FF5500]" /> S₀ Mode</span>
                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-zinc-400" /> A₀ Mode</span>
              </div>
            </div>

            <div className="relative h-72 w-full mt-4">
              <div className="absolute left-0 top-0 bottom-6 flex flex-col justify-between font-mono text-[9px] text-zinc-500">
                <span>5,000 m/s</span>
                <span>4,000 m/s</span>
                <span>3,000 m/s</span>
                <span>2,000 m/s</span>
                <span>1,000 m/s</span>
              </div>

              <div className="ml-14 h-60 border-l border-b border-zinc-800 relative">
                <svg viewBox="0 0 600 240" className="w-full h-full overflow-visible">
                  {/* Grid Lines */}
                  <line x1="0" y1="60" x2="600" y2="60" stroke="#23232d" strokeWidth="1" strokeDasharray="3,3" />
                  <line x1="0" y1="120" x2="600" y2="120" stroke="#23232d" strokeWidth="1" strokeDasharray="3,3" />
                  <line x1="0" y1="180" x2="600" y2="180" stroke="#23232d" strokeWidth="1" strokeDasharray="3,3" />

                  {/* S0 Mode (Phase Velocity) - Accent Line */}
                  <path
                    d="M 20 48 Q 120 54 240 68 T 480 78 T 600 80"
                    fill="none"
                    stroke="#FF5500"
                    strokeWidth="2.5"
                  />
                  <text x="500" y="70" fill="#FF5500" fontSize="9" fontFamily="monospace" fontWeight="bold">S₀ (Phase)</text>

                  {/* S0 Mode (Group Velocity) - Dashed */}
                  <path
                    d="M 20 72 Q 120 78 240 92 T 480 120 T 600 130"
                    fill="none"
                    stroke="#FF5500"
                    strokeWidth="1.5"
                    strokeDasharray="4,4"
                    opacity="0.8"
                  />
                  <text x="500" y="142" fill="#FF5500" fontSize="8" fontFamily="monospace" opacity="0.8">S₀ (Group)</text>

                  {/* A0 Mode (Phase Velocity) - Slate Line */}
                  <path
                    d="M 20 200 Q 120 145 240 115 T 480 105 T 600 102"
                    fill="none"
                    stroke="#a1a1aa"
                    strokeWidth="2"
                  />
                  <text x="500" y="98" fill="#a1a1aa" fontSize="9" fontFamily="monospace" fontWeight="bold">A₀ (Phase)</text>

                  {/* A0 Mode (Group Velocity) - Slate Dashed */}
                  <path
                    d="M 20 180 Q 120 110 240 105 T 480 115 T 600 125"
                    fill="none"
                    stroke="#71717a"
                    strokeWidth="1.5"
                    strokeDasharray="4,4"
                  />
                  <text x="500" y="120" fill="#71717a" fontSize="8" fontFamily="monospace">A₀ (Group)</text>
                </svg>

                <div className="flex justify-between font-mono text-[10px] text-zinc-500 pt-2">
                  <span>0.0 MHz·mm</span>
                  <span>1.0 MHz·mm</span>
                  <span>2.0 MHz·mm</span>
                  <span>3.0 MHz·mm</span>
                  <span>4.0 MHz·mm</span>
                  <span>5.0 MHz·mm</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: ANISOTROPIC VELOCITY POLAR TENSOR */}
      {activeTab === "anisotropy" && (
        <div className="space-y-6">
          <div className="p-4 rounded-xl border border-border bg-card/60 text-xs">
            <h3 className="font-bold text-foreground text-sm">Directional Acoustic Velocity Anisotropy Tensor</h3>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-6 rounded-2xl border border-border bg-[#141419] p-6 flex flex-col items-center justify-center">
              <span className="font-mono text-xs text-zinc-400 mb-4">Directional Velocity Polar Diagram V(θ)</span>
              
              <div className="relative w-72 h-72 flex items-center justify-center">
                <svg viewBox="0 0 300 300" className="w-full h-full overflow-visible">
                  {/* Concentric Polar Grid */}
                  <circle cx="150" cy="150" r="120" fill="none" stroke="#272733" strokeWidth="1" strokeDasharray="3,3" />
                  <circle cx="150" cy="150" r="80" fill="none" stroke="#272733" strokeWidth="1" strokeDasharray="3,3" />
                  <circle cx="150" cy="150" r="40" fill="none" stroke="#272733" strokeWidth="1" strokeDasharray="3,3" />
                  <line x1="30" y1="150" x2="270" y2="150" stroke="#38384a" strokeWidth="1" />
                  <line x1="150" y1="30" x2="150" y2="270" stroke="#38384a" strokeWidth="1" />

                  <text x="275" y="153" fill="#71717a" fontSize="8" fontFamily="monospace">0° (Longitudinal)</text>
                  <text x="135" y="22" fill="#71717a" fontSize="8" fontFamily="monospace">90° (Transverse)</text>

                  {/* Anisotropic Velocity Ellipsoid in Orange */}
                  <ellipse cx="150" cy="150" rx="115" ry="85" fill="none" stroke="#FF5500" strokeWidth="2.5" />
                  <ellipse cx="150" cy="150" rx="115" ry="85" fill="#FF5500" fillOpacity="0.1" />

                  {/* Directional Velocity Vectors */}
                  <line x1="150" y1="150" x2="265" y2="150" stroke="#FF5500" strokeWidth="2" markerEnd="url(#arrow)" />
                  <text x="180" y="142" fill="#FF5500" fontSize="9" fontFamily="monospace" fontWeight="bold">4,450 m/s</text>

                  <line x1="150" y1="150" x2="150" y2="65" stroke="#a1a1aa" strokeWidth="2" />
                  <text x="155" y="105" fill="#a1a1aa" fontSize="9" fontFamily="monospace" fontWeight="bold">3,850 m/s</text>
                </svg>
              </div>
            </div>

            <div className="lg:col-span-6 space-y-4">
              <div className="p-4 rounded-xl border border-border bg-[#16161f] space-y-2 text-xs font-mono">
                <span className="text-zinc-300 font-bold">Anisotropic Correction Matrix [C_ij]</span>
                <p className="text-muted-foreground text-[11px] font-sans">
                  TopoAE incorporates directional stiffness tensors into the Geiger multilateration objective function:
                </p>
                <div className="p-3 rounded bg-[#101014] border border-border/80 font-mono text-[11px] text-[#FF5500]">
                  v(θ) = v₀ · √(1 + ε · cos²(θ - θ_strand))
                </div>
                <div className="grid grid-cols-2 gap-2 pt-2 text-zinc-300">
                  <div>• Longitudinal Velocity: <span className="font-bold text-white">4,450 m/s</span></div>
                  <div>• Transverse Velocity: <span className="font-bold text-white">3,850 m/s</span></div>
                  <div>• Anisotropy Ratio (ε): <span className="font-bold text-foreground">1.156</span></div>
                  <div>• Prestress Angle: <span className="font-bold text-white">0.0° (Horizontal)</span></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: GAUSS-NEWTON ITERATIVE SOLVER CONVERGENCE */}
      {activeTab === "solver" && (
        <div className="space-y-6">
          <div className="p-4 rounded-xl border border-border bg-card/60 text-xs">
            <h3 className="font-bold text-foreground text-sm">Geiger&apos;s Iterative Gauss-Newton Multilateration Solver</h3>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-7 rounded-2xl border border-border bg-[#141419] p-6 text-xs font-mono">
              <div className="flex items-center justify-between pb-3 border-b border-border/50 text-zinc-400">
                <span>Objective Residual Norm: ||r_k||₂ (mm) vs Iteration k</span>
                <span className="text-foreground font-bold">Converged in 5 Steps</span>
              </div>

              <div className="mt-6 space-y-3">
                {[
                  { k: 1, x: 5.12, z: 0.85, res: 48.6, delta: "-31.2 mm" },
                  { k: 2, x: 4.45, z: 0.48, res: 14.2, delta: "-11.8 mm" },
                  { k: 3, x: 4.24, z: 0.38, res: 3.4, delta: "-2.6 mm" },
                  { k: 4, x: 4.205, z: 0.352, res: 0.9, delta: "-0.5 mm" },
                  { k: 5, x: 4.200, z: 0.350, res: 0.2, delta: "0.0 mm (Tol Met)" },
                ].map((s) => (
                  <div key={s.k} className="flex items-center justify-between p-2.5 rounded-lg border border-border bg-[#181822]">
                    <div className="flex items-center gap-3">
                      <span className="w-6 h-6 rounded bg-zinc-800 flex items-center justify-center font-bold text-white text-xs">
                        k={s.k}
                      </span>
                      <span>x={s.x}m, z={s.z}m</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-muted-foreground">||r|| = {s.res} mm</span>
                      <span className="text-foreground font-semibold">{s.delta}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="lg:col-span-5 p-5 rounded-2xl border border-border bg-[#16161f] space-y-3 text-xs font-mono">
              <span className="text-zinc-300 font-bold block">Solver State Vector: [x, z, t₀]</span>
              <p className="text-muted-foreground text-[11px] font-sans">
                Non-linear system Jacobian matrix J evaluated at each iteration step:
              </p>
              <div className="p-3 rounded bg-[#101014] border border-border/80 font-mono text-[10px] text-[#FF5500] leading-relaxed">
                Δθ = (Jᵀ · W · J + λ·I)⁻¹ · Jᵀ · W · r<br />
                λ = 0.001 (Levenberg damping)
              </div>
              <div className="space-y-1.5 pt-2 text-zinc-300">
                <div className="flex justify-between"><span>Final Position:</span><span className="text-white font-bold">x=4.200m, z=0.350m</span></div>
                <div className="flex justify-between"><span>Time of Origin (t₀):</span><span className="text-white font-bold">0.000 µs</span></div>
                <div className="flex justify-between"><span>Residual Variance:</span><span className="text-foreground font-bold">0.04 µs²</span></div>
                <div className="flex justify-between"><span>Condition Number:</span><span className="text-white font-bold">1.48 (Stable)</span></div>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
