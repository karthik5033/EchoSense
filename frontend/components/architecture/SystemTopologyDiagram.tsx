"use client";

import React, { useState } from "react";
import {
  Radio,
  Cpu,
  Layers,
  Database,
  Terminal,
  Activity,
  ShieldCheck,
  CheckCircle2,
  Clock,
  ArrowRight,
  Info,
} from "lucide-react";

interface SubsystemInfo {
  id: string;
  name: string;
  layer: string;
  throughput: string;
  latency: string;
  specs: string[];
  description: string;
}

const SUBSYSTEM_SPECS: Record<string, SubsystemInfo> = {
  sensors: {
    id: "sensors",
    name: "Acoustic Transducer Array",
    layer: "Layer 1: Edge Acquisition",
    throughput: "10.0 MS/s per channel",
    latency: "< 5 microseconds",
    specs: [
      "3x Resonant R15alpha Piezoelectric sensors (150 kHz resonance)",
      "1x High-bandwidth broadband MEMS node (48 kHz)",
      "Silicone grease acoustic impedance couplant",
      "Integrated 40 dB low-noise pre-amplification",
    ],
    description:
      "Captures high-frequency micro-acoustic transient stress waves emitted by localized concrete aggregate micro-cracking.",
  },
  ptp: {
    id: "ptp",
    name: "IEEE 1588 PTP Hardware Clock",
    layer: "Layer 1: Edge Acquisition",
    throughput: "Nanosecond hardware ticks",
    latency: "< 42 ns clock jitter",
    specs: [
      "Hardware timestamping on Gigabit Ethernet MAC",
      "Grandmaster clock failover redundancy",
      "Eliminates inter-channel arrival time skew",
      "Enables sub-centimeter TDoA multilateration",
    ],
    description:
      "Disciplines distributed acquisition nodes to maintain sub-42ns timing coherence across the 10-meter bridge span.",
  },
  dma: {
    id: "dma",
    name: "Circular DMA Ring Buffer",
    layer: "Layer 2: Stream Compute",
    throughput: "65,536 samples / window",
    latency: "< 2 ms memory lock",
    specs: [
      "Zero-copy Direct Memory Access (DMA)",
      "Circular buffer prevents memory starvation",
      "Local NVMe flash ring fallback during network drop",
      "Automated energy burst threshold trigger",
    ],
    description:
      "Continuously streams multi-channel acoustic voltages from high-speed ADCs into kernel ring buffers without CPU interrupts.",
  },
  gudhi: {
    id: "gudhi",
    name: "C++ GUDHI & Ripser Engine",
    layer: "Layer 2: Stream Compute",
    throughput: "250 embedded vertices / window",
    latency: "32 ms compute time",
    specs: [
      "Takens delay reconstruction (tau = 4, d = 3)",
      "Vietoris-Rips filtration up to epsilon = 0.85",
      "Extracts H0 clusters and persistent H1 loops",
      "Calculates persistence entropy and Betti curves",
    ],
    description:
      "Constructs filtered simplicial complexes in phase space, isolating persistent topological loops that signal irreversible micro-crack nucleation.",
  },
  ml: {
    id: "ml",
    name: "TopoAE Random Forest & BOCD",
    layer: "Layer 3: ML Inference",
    throughput: "128-dim invariant vector",
    latency: "4 ms inference latency",
    specs: [
      "Random Forest Ensemble (250 estimators, F1: 0.938)",
      "BOCD Bayesian run-length changepoint detection",
      "340ms precursor warning lead time",
      "Rejects isotropic environmental noise (H1 < 0.25)",
    ],
    description:
      "Classifies acoustic burst modes (Tensile Mode I vs Shear Mode II vs Mixed) and detects statistical regime shifts prior to macroscopic load drops.",
  },
  tdoa: {
    id: "tdoa",
    name: "Gauss-Newton TDoA Solver",
    layer: "Layer 3: Spatial Localization",
    throughput: "4-channel arrival timestamps",
    latency: "6 ms optimization solve",
    specs: [
      "Hyperbolic multilateration across sensor array",
      "Anisotropic concrete tensor (Vp = 3,850 m/s)",
      "Spatial localization accuracy: +/-30.0 mm",
      "Geometric Dilution of Precision (GDOP): 1.34",
    ],
    description:
      "Solves intersecting hyperbolic isochrones via non-linear least squares to pin down the exact 2D/3D crack epicenter within the girder.",
  },
  api: {
    id: "api",
    name: "FastAPI & TimescaleDB Gateway",
    layer: "Layer 4: Enterprise Services",
    throughput: "1,500 req / sec",
    latency: "< 15 ms network propagation",
    specs: [
      "Async FastAPI gateway with OpenAPI 3.1 schemas",
      "Binary WebSocket stream for 30 FPS oscilloscope",
      "TimescaleDB time-series partitioned storage",
      "EN 1330-9 & ASTM E1316 audit report export",
    ],
    description:
      "Exposes REST endpoints and high-throughput WebSocket streams for live telemetry broadcasting, historical run querying, and PDF audit generation.",
  },
};

export function SystemTopologyDiagram() {
  const [selectedSubsystem, setSelectedSubsystem] = useState<string>("gudhi");
  const active = SUBSYSTEM_SPECS[selectedSubsystem] || SUBSYSTEM_SPECS.gudhi;

  return (
    <div className="space-y-6">
      {/* Interactive Topology Visual Canvas */}
      <div className="rounded-xl border border-[#23232c] bg-[#0f0f14] p-5 sm:p-6 shadow-2xl overflow-hidden relative">
        <div className="flex items-center justify-between pb-4 border-b border-[#1f1f26]">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#FF5500] animate-pulse" />
            <span className="text-xs font-mono uppercase tracking-wider text-zinc-300 font-semibold">
              End-to-End Edge-to-Cloud Topological Architecture
            </span>
          </div>
          <span className="text-[11px] font-mono text-zinc-500">
            Click any block to inspect specifications
          </span>
        </div>

        {/* Multi-Layer Flow Architecture */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-5 gap-3 relative select-none">
          {/* Layer 1: Edge Sensors */}
          <div
            onClick={() => setSelectedSubsystem("sensors")}
            className={`p-4 rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${
              selectedSubsystem === "sensors"
                ? "border-[#FF5500] bg-[#FF5500]/10 shadow-[0_0_20px_rgba(255,85,0,0.15)]"
                : "border-[#24242e] bg-[#14141a] hover:border-zinc-600"
            }`}
          >
            <div>
              <div className="flex items-center justify-between text-zinc-400 mb-2">
                <span className="text-[10px] font-mono font-semibold text-zinc-500 uppercase">
                  LAYER 01
                </span>
                <Radio className="w-4 h-4 text-zinc-400" />
              </div>
              <h4 className="text-xs font-bold text-white">Edge Sensor Array</h4>
              <p className="text-[11px] text-zinc-400 mt-1 leading-relaxed">
                4-channel acoustic ingestion (R15alpha + MEMS).
              </p>
            </div>
            <div className="pt-3 border-t border-[#1f1f26] mt-3 flex items-center justify-between text-[10px] font-mono text-zinc-500">
              <span>10.0 MS/s</span>
              <span className="text-zinc-400">PTP Sync</span>
            </div>
          </div>

          {/* Layer 2: DMA Buffer */}
          <div
            onClick={() => setSelectedSubsystem("dma")}
            className={`p-4 rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${
              selectedSubsystem === "dma"
                ? "border-[#FF5500] bg-[#FF5500]/10 shadow-[0_0_20px_rgba(255,85,0,0.15)]"
                : "border-[#24242e] bg-[#14141a] hover:border-zinc-600"
            }`}
          >
            <div>
              <div className="flex items-center justify-between text-zinc-400 mb-2">
                <span className="text-[10px] font-mono font-semibold text-zinc-500 uppercase">
                  LAYER 02
                </span>
                <Cpu className="w-4 h-4 text-zinc-400" />
              </div>
              <h4 className="text-xs font-bold text-white">DMA Ring Buffer</h4>
              <p className="text-[11px] text-zinc-400 mt-1 leading-relaxed">
                Kernel circular memory &amp; 20kHz-1MHz bandpass.
              </p>
            </div>
            <div className="pt-3 border-t border-[#1f1f26] mt-3 flex items-center justify-between text-[10px] font-mono text-zinc-500">
              <span>65,536 spl</span>
              <span className="text-zinc-400">&lt; 2 ms</span>
            </div>
          </div>

          {/* Layer 3: GUDHI TDA Core */}
          <div
            onClick={() => setSelectedSubsystem("gudhi")}
            className={`p-4 rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${
              selectedSubsystem === "gudhi"
                ? "border-[#FF5500] bg-[#FF5500]/10 shadow-[0_0_20px_rgba(255,85,0,0.15)]"
                : "border-[#24242e] bg-[#14141a] hover:border-zinc-600"
            }`}
          >
            <div>
              <div className="flex items-center justify-between text-zinc-400 mb-2">
                <span className="text-[10px] font-mono font-semibold text-[#FF5500] uppercase">
                  LAYER 03
                </span>
                <Layers className="w-4 h-4 text-[#FF5500]" />
              </div>
              <h4 className="text-xs font-bold text-white">GUDHI TDA Engine</h4>
              <p className="text-[11px] text-zinc-400 mt-1 leading-relaxed">
                Takens embedding (tau=4, d=3) &amp; VR filtration.
              </p>
            </div>
            <div className="pt-3 border-t border-[#1f1f26] mt-3 flex items-center justify-between text-[10px] font-mono text-zinc-500">
              <span>H0 / H1 loops</span>
              <span className="text-[#FF5500] font-bold">32 ms</span>
            </div>
          </div>

          {/* Layer 4: ML Inference & TDoA */}
          <div
            onClick={() => setSelectedSubsystem("ml")}
            className={`p-4 rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${
              selectedSubsystem === "ml"
                ? "border-[#FF5500] bg-[#FF5500]/10 shadow-[0_0_20px_rgba(255,85,0,0.15)]"
                : "border-[#24242e] bg-[#14141a] hover:border-zinc-600"
            }`}
          >
            <div>
              <div className="flex items-center justify-between text-zinc-400 mb-2">
                <span className="text-[10px] font-mono font-semibold text-zinc-500 uppercase">
                  LAYER 04
                </span>
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
              </div>
              <h4 className="text-xs font-bold text-white">ML &amp; BOCD Solver</h4>
              <p className="text-[11px] text-zinc-400 mt-1 leading-relaxed">
                Random Forest (F1: 0.938) &amp; 340ms warning lead.
              </p>
            </div>
            <div className="pt-3 border-t border-[#1f1f26] mt-3 flex items-center justify-between text-[10px] font-mono text-zinc-500">
              <span>Precursor Lead</span>
              <span className="text-emerald-400 font-bold">340 ms</span>
            </div>
          </div>

          {/* Layer 5: Enterprise Gateway & UI */}
          <div
            onClick={() => setSelectedSubsystem("api")}
            className={`p-4 rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${
              selectedSubsystem === "api"
                ? "border-[#FF5500] bg-[#FF5500]/10 shadow-[0_0_20px_rgba(255,85,0,0.15)]"
                : "border-[#24242e] bg-[#14141a] hover:border-zinc-600"
            }`}
          >
            <div>
              <div className="flex items-center justify-between text-zinc-400 mb-2">
                <span className="text-[10px] font-mono font-semibold text-zinc-500 uppercase">
                  LAYER 05
                </span>
                <Database className="w-4 h-4 text-zinc-400" />
              </div>
              <h4 className="text-xs font-bold text-white">Gateway &amp; Console</h4>
              <p className="text-[11px] text-zinc-400 mt-1 leading-relaxed">
                FastAPI, 30 FPS WebSocket &amp; TimescaleDB.
              </p>
            </div>
            <div className="pt-3 border-t border-[#1f1f26] mt-3 flex items-center justify-between text-[10px] font-mono text-zinc-500">
              <span>WebSocket</span>
              <span className="text-zinc-400">&lt; 15 ms</span>
            </div>
          </div>
        </div>

        {/* Dataflow Connection Arrow Line */}
        <div className="hidden md:flex items-center justify-between px-10 py-3 text-zinc-600 text-xs font-mono">
          <span>Raw Analog Acoustic Signals</span>
          <ArrowRight className="w-3.5 h-3.5" />
          <span>Zero-Copy Ring Buffer</span>
          <ArrowRight className="w-3.5 h-3.5" />
          <span>Simplicial Homology Pairs</span>
          <ArrowRight className="w-3.5 h-3.5" />
          <span>Topological Feature Vector</span>
          <ArrowRight className="w-3.5 h-3.5" />
          <span>Precursor Alert &amp; Telemetry</span>
        </div>
      </div>

      {/* Selected Subsystem Detail Card */}
      <div className="p-5 sm:p-6 rounded-xl border border-[#23232c] bg-[#141419] shadow-lg space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-[#202028]">
          <div className="space-y-0.5">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#FF5500]">
              {active.layer}
            </span>
            <h3 className="text-base font-bold text-white">{active.name}</h3>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-zinc-400 bg-[#1c1c24] border border-[#282834] px-2.5 py-1 rounded-md">
              Throughput: {active.throughput}
            </span>
            <span className="text-xs font-mono text-emerald-400 bg-emerald-950/30 border border-emerald-800/40 px-2.5 py-1 rounded-md">
              Latency: {active.latency}
            </span>
          </div>
        </div>

        <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed font-sans">
          {active.description}
        </p>

        <div>
          <span className="text-[11px] font-mono font-semibold uppercase tracking-wider text-zinc-500 block mb-2">
            Technical Specifications &amp; Guarantees
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {active.specs.map((spec, i) => (
              <div
                key={i}
                className="p-3 rounded-lg border border-[#24242e] bg-[#0f0f14] flex items-center gap-2.5 text-xs text-zinc-300 font-sans"
              >
                <CheckCircle2 className="w-3.5 h-3.5 text-[#FF5500] shrink-0" />
                <span>{spec}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

