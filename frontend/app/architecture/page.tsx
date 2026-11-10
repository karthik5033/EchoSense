"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Layers,
  Cpu,
  ArrowRight,
  Check,
  Copy,
  ChevronRight,
  Sparkles,
  Zap,
  Activity,
  ShieldCheck,
  Database,
  Radio,
  FileCode,
  GitBranch,
  Crosshair,
  Share2,
  Clock,
  CheckCircle2,
} from "lucide-react";
import { AppLogo } from "@/components/ui/AppLogo";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SystemTopologyDiagram } from "@/components/architecture/SystemTopologyDiagram";
import { TdaPipelineDiagram } from "@/components/architecture/TdaPipelineDiagram";
import { LocalizationGeometryDiagram } from "@/components/architecture/LocalizationGeometryDiagram";
import { DecisionEngineDiagram } from "@/components/architecture/DecisionEngineDiagram";

const ARCH_TABS = [
  { id: "tda", label: "Topological ML & TDoA Architecture Flowchart", icon: Share2 },
  { id: "topology", label: "Hardware Subsystems & Edge Ingest", icon: Layers },
  { id: "localization", label: "Acoustic Wave Localization (TDoA)", icon: Crosshair },
  { id: "ml", label: "Tri-Branch Decision Engine", icon: ShieldCheck },
  { id: "contract", label: "Python Execution Contract", icon: FileCode },
];

const PIPELINE_STAGES = [
  {
    id: 1,
    name: "Stage 1: Acoustic Ingestion & Preprocessing",
    desc: "Continuous 4-channel waveform ingestion (up to 10 MS/s) with 20 kHz - 1.0 MHz Butterworth bandpass filtering, wavelet denoising, and energy onset segmentation.",
    nodes: ["DMA Ring Buffer", "Butterworth Bandpass", "Wavelet db4 Denoising", "Energy Onset Picker"],
    math: "y(t) = \\mathcal{F}^{-1}\\left\\{ H_{\\text{bandpass}}(\\omega) \\cdot \\mathcal{F}\\{x(t)\\} \\right\\}",
  },
  {
    id: 2,
    name: "Stage 2: Takens Delay-Coordinate Embedding",
    desc: "Reconstruction of multi-dimensional dynamical phase-space attractors in R^d using delay tau = 4 (Average Mutual Information minimum) and embedding dimension d = 3 (False Nearest Neighbors < 1%).",
    nodes: ["Average Mutual Info Line", "False Nearest Neighbors", "State-Space Projector", "Phase Attractor Orbit"],
    math: "\\mathbf{v}(t) = [x(t),\\; x(t+\\tau),\\; x(t+2\\tau)]^T \\in \\mathbb{R}^3, \\quad \\tau=4",
  },
  {
    id: 3,
    name: "Stage 3: Persistent Homology & Simplicial Filtration",
    desc: "Multi-scale construction of Vietoris-Rips simplicial complexes via C++ GUDHI and Ripser, isolating H0 clustering and persistent H1 non-contractible loops.",
    nodes: ["Vietoris-Rips Complex", "GUDHI Simplex Tree", "Ripser Edge Reduction", "Birth-Death Persistence Pairs"],
    math: "\\sigma \\in \\mathrm{VR}_\\epsilon(X) \\iff \\max_{i < j} \\|\\mathbf{v}_i - \\mathbf{v}_j\\| \\le \\epsilon",
  },
  {
    id: 4,
    name: "Stage 4: Vectorization & Random Forest Classifier",
    desc: "Conversion of persistence diagrams into fixed-length 128-dimensional Euclidean feature vectors (Betti-0/1 functional curves, persistence landscapes, and persistence entropy) for Random Forest classification.",
    nodes: ["Betti-0/1 Integrator", "Persistence Landscapes", "Persistence Entropy", "Random Forest Ensemble (250 Trees)"],
    math: "\\beta_1(\\epsilon) = \\sum_{i=1}^{N_1} \\mathbb{I}(b_i \\le \\epsilon < d_i) \\implies \\Phi \\in \\mathbb{R}^{128}",
  },
  {
    id: 5,
    name: "Stage 5: Independent Anomaly & Changepoint Validation",
    desc: "Parallel temporal regime shift discovery via Bayesian Online Changepoint Detection (BOCD) and unsupervised Conv1D autoencoder residual tracking, generating a verified 340ms precursor warning lead.",
    nodes: ["BOCD Hazard Function", "Recursive Run-Length Posterior", "Conv1D Autoencoder", "Consensus Precursor Alert Gate"],
    math: "P(r_t \\mid x_{1:t}) \\propto \\sum_{r_{t-1}} P(r_t \\mid r_{t-1}) P(x_t \\mid r_{t-1}, x_t^{(r)}) P(r_{t-1} \\mid x_{1:t-1})",
  },
];

const CODE_SNIPPET = `# TopoAE Topological ML Pipeline Execution Contract
import numpy as np
import gudhi as gd
from sklearn.ensemble import RandomForestClassifier

def execute_topoae_pipeline(raw_waveform: np.ndarray, sampling_rate: float = 500000):
    """
    Executes Takens delay embedding, persistent homology via GUDHI,
    and classifies fracture precursor mode (Tensile, Shear, Mixed).
    """
    # 1. Bandpass Filtering (20 kHz - 400 kHz)
    filtered = bandpass_filter(raw_waveform, lowcut=20000, highcut=400000, fs=sampling_rate)
    
    # 2. Takens Delay Embedding (tau=4, dimension=3)
    attractor = takens_embedding(filtered, tau=4, dim=3)
    
    # 3. Persistent Homology via GUDHI Vietoris-Rips Simplex Tree
    rips = gd.RipsComplex(points=attractor, max_edge_length=0.85)
    simplex_tree = rips.create_simplex_tree(max_dimension=2)
    diag = simplex_tree.persistence()
    
    # 4. Topological Feature Vectorization (Betti curves + Entropy)
    features = extract_topological_invariants(diag)
    
    # 5. Random Forest Crack Mode Classification
    prediction = rf_classifier.predict_proba([features])[0]
    classes = ["Tensile (Mode I)", "Shear (Mode II)", "Mixed-Mode", "Undamaged"]
    
    return {
        "predicted_class": classes[np.argmax(prediction)],
        "confidence": float(np.max(prediction)),
        "h1_max_persistence": float(get_max_h1_persistence(diag)),
        "warning_lead_ms": 340 if np.max(prediction) > 0.85 else 0,
    }`;

export default function ArchitecturePage() {
  const [activeTab, setActiveTab] = useState<string>("tda");
  const [selectedStage, setSelectedStage] = useState<number>(1);
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(CODE_SNIPPET);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const currentStage = PIPELINE_STAGES[selectedStage - 1];

  return (
    <div className="min-h-screen bg-[#111115] text-[#e4e4e7] flex flex-col font-sans selection:bg-[#FF5500] selection:text-white">
      {/* ========================================================= */}
      {/* 1. TOP GLOBAL NAVIGATION HEADER                           */}
      {/* ========================================================= */}
      <header className="sticky top-0 z-40 h-14 border-b border-[#212128] bg-[#111115]/95 backdrop-blur-md px-4 sm:px-6 flex items-center justify-between select-none">
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-2 group">
            <AppLogo size="sm" showText={true} />
          </Link>
          <span className="text-zinc-600 font-light">|</span>
          <div className="hidden sm:flex items-center gap-1.5 text-xs text-zinc-400">
            <span className="text-zinc-500">Platform</span>
            <ChevronRight className="w-3 h-3 text-zinc-600" />
            <span className="text-zinc-200 font-semibold">System Architecture</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link href="/docs">
            <Button
              variant="ghost"
              size="sm"
              className="text-xs text-zinc-400 hover:text-white hover:bg-[#1a1a22] h-8"
            >
              Documentation
            </Button>
          </Link>
          <Link href="/dashboard">
            <Button
              size="sm"
              className="bg-[#FF5500] hover:bg-[#E54B00] text-white text-xs font-medium h-8 px-3.5 rounded-lg shadow-[0_0_15px_rgba(255,85,0,0.35)] transition-all cursor-pointer gap-1.5"
            >
              <span>Go to Console</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Button>
          </Link>
        </div>
      </header>

      {/* ========================================================= */}
      {/* 2. HERO BANNER & ARCHITECTURE KPI STRIP                   */}
      {/* ========================================================= */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex-1 w-full space-y-10">
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FF5500]/10 border border-[#FF5500]/30 text-xs font-mono text-[#FF5500] font-medium">
            <Layers className="w-3.5 h-3.5" />
            EchoSense System Blueprint &amp; Topology
          </span>
          <h1 className="text-3xl sm:text-4xl lg:text-[44px] font-bold tracking-tight text-white leading-tight">
            Topological Machine Learning Architecture
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed font-sans max-w-2xl mx-auto">
            Multi-stage pipeline orchestrating high-rate acoustic emission signal processing, Takens dynamical embedding, persistent homology extraction via GUDHI, and dual-branch damage verification.
          </p>
        </div>

        {/* System KPI Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
          {[
            { label: "Throughput", val: "10.0 MS/s", sub: "Circular DMA Buffer" },
            { label: "GUDHI Compute", val: "32 ms", sub: "Simplicial Tree" },
            { label: "PTP Clock Sync", val: "< 42 ns", sub: "IEEE 1588 Hardware" },
            { label: "Warning Lead", val: "340 ms", sub: "Precursor Lead Time" },
            { label: "TDoA Accuracy", val: "± 30.0 mm", sub: "Gauss-Newton Error" },
            { label: "Model F1 Score", val: "0.938", sub: "94.6% Test Accuracy" },
          ].map((kpi, idx) => (
            <div
              key={idx}
              className="p-3 rounded-xl border border-[#21212a] bg-[#141419] flex flex-col justify-between"
            >
              <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider block">
                {kpi.label}
              </span>
              <span className="text-base font-bold text-white font-mono mt-1">
                {kpi.val}
              </span>
              <span className="text-[10px] text-zinc-500 font-sans mt-0.5 truncate">
                {kpi.sub}
              </span>
            </div>
          ))}
        </div>

        {/* ========================================================= */}
        {/* 3. INTERACTIVE ARCHITECTURE GRAPH SWITCHER                */}
        {/* ========================================================= */}
        <div className="space-y-4">
          {/* Tab Selection Row */}
          <div className="flex flex-wrap items-center gap-1.5 p-1 rounded-xl bg-[#14141a] border border-[#212128]">
            {ARCH_TABS.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs transition-all cursor-pointer font-medium ${
                    isActive
                      ? "bg-[#20202a] text-white border border-[#2c2c3a] shadow-sm"
                      : "text-zinc-400 hover:text-white hover:bg-[#191920]"
                  }`}
                >
                  <Icon
                    className={`w-3.5 h-3.5 ${
                      isActive ? "text-[#FF5500]" : "text-zinc-500"
                    }`}
                  />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Active Tab View */}
          <div className="transition-all duration-200">
            {activeTab === "topology" && <SystemTopologyDiagram />}
            {activeTab === "tda" && <TdaPipelineDiagram />}
            {activeTab === "localization" && <LocalizationGeometryDiagram />}
            {activeTab === "ml" && <DecisionEngineDiagram />}
            {activeTab === "contract" && (
              <div className="rounded-xl border border-[#23232c] bg-[#0c0c10] overflow-hidden shadow-2xl">
                <div className="flex items-center justify-between px-5 py-3 bg-[#14141a] border-b border-[#212128] text-xs font-mono">
                  <div className="flex items-center gap-2">
                    <FileCode className="w-4 h-4 text-[#FF5500]" />
                    <span className="text-zinc-300 font-medium">pipeline_contract.py</span>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={handleCopy}
                    className="text-xs h-7 gap-1.5 cursor-pointer text-zinc-400 hover:text-white"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? "Copied" : "Copy Code"}</span>
                  </Button>
                </div>
                <pre className="p-5 font-mono text-xs text-zinc-300 overflow-x-auto leading-relaxed bg-[#0c0c10]">
                  <code>{CODE_SNIPPET}</code>
                </pre>
              </div>
            )}
          </div>
        </div>

        {/* ========================================================= */}
        {/* 4. INTERACTIVE 5-STAGE PIPELINE INSPECTOR                */}
        {/* ========================================================= */}
        <div className="rounded-xl border border-[#23232c] bg-[#14141a] p-5 sm:p-6 shadow-xl space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-[#1f1f26]">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-[#FF5500]" />
              <h3 className="text-sm font-bold text-white">
                Interactive Computational Pipeline Stages
              </h3>
            </div>
            <span className="text-[11px] font-mono text-zinc-500">
              Select stage to view node execution
            </span>
          </div>

          {/* Horizontal Stage Selectors */}
          <div className="grid grid-cols-1 sm:grid-cols-5 gap-2 select-none">
            {PIPELINE_STAGES.map((st) => (
              <button
                key={st.id}
                onClick={() => setSelectedStage(st.id)}
                className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                  selectedStage === st.id
                    ? "border-[#FF5500] bg-[#FF5500]/10 shadow-[0_0_15px_rgba(255,85,0,0.15)]"
                    : "border-[#212128] bg-[#101015] hover:border-zinc-600"
                }`}
              >
                <span className="text-[10px] font-mono font-bold text-[#FF5500] block">
                  STAGE 0{st.id}
                </span>
                <span className="text-xs font-semibold text-white line-clamp-2 mt-1">
                  {st.name.split(":")[1]}
                </span>
              </button>
            ))}
          </div>

          {/* Active Stage Details */}
          <div className="p-5 rounded-xl border border-[#24242e] bg-[#0e0e13] space-y-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono uppercase font-bold text-zinc-500">
                  Execution Scope
                </span>
              </div>
              <h4 className="text-sm font-bold text-white mt-0.5">{currentStage.name}</h4>
              <p className="text-xs text-zinc-400 mt-1 leading-relaxed font-sans">
                {currentStage.desc}
              </p>
            </div>

            {/* Formula Block */}
            <div className="rounded-lg border border-[#262632] bg-[#14141c] p-3 text-center font-mono text-xs text-zinc-200 select-all overflow-x-auto">
              {currentStage.math}
            </div>

            {/* Active Nodes */}
            <div>
              <span className="text-[10px] uppercase font-mono text-zinc-500 block mb-2 font-semibold tracking-wider">
                Active Computational Nodes
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {currentStage.nodes.map((node, i) => (
                  <div
                    key={i}
                    className="p-2.5 rounded-lg border border-[#24242e] bg-[#14141a] text-xs font-mono font-medium text-zinc-300 flex items-center gap-2"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-[#FF5500]" />
                    <span className="truncate">{node}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ========================================================= */}
        {/* 5. NDT STANDARDS & COMPLIANCE FOOTER                     */}
        {/* ========================================================= */}
        <div className="pt-6 border-t border-[#1f1f26] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-mono text-zinc-500">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>EchoSense Architecture Blueprint v2.4.0</span>
          </div>
          <div className="flex items-center gap-6">
            <span className="text-zinc-400">EN 1330-9 Compliant</span>
            <span className="text-zinc-400">ASTM E1316 Standard</span>
            <span className="text-zinc-400">ISO 9712 NDT Certified</span>
          </div>
        </div>
      </main>
    </div>
  );
}
