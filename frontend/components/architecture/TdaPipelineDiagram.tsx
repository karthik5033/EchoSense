"use client";

import React, { useState } from "react";
import {
  Share2,
  Activity,
  Layers,
  Cpu,
  ShieldAlert,
  ArrowRight,
  CheckCircle2,
  TrendingUp,
  Brain,
  Crosshair,
  Sparkles,
  Zap,
  Sliders,
  Filter,
  BarChart2,
  FileCode,
} from "lucide-react";

interface PipelineNode {
  id: string;
  label: string;
  category: "ingestion" | "embedding" | "tda" | "vectorizer" | "ml" | "spatial";
  badge: string;
  math: string;
  desc: string;
  inbound: string[];
  outbound: string[];
  latency: string;
  tensorShape: string;
  codeSnippet: string;
}

const NODES: Record<string, PipelineNode> = {
  ingest: {
    id: "ingest",
    label: "Acoustic Signal Ingestion",
    category: "ingestion",
    badge: "10 MS/s • PTP Synced",
    math: "x(t) \\in \\mathbb{R}, \\quad f_s = 500\\text{ kS/s} \\; (10\\text{ MS/s base})",
    desc: "Continuous multi-channel streaming from Physical Acoustics R15alpha resonant piezo transducers coupled with high-speed ADC and IEEE 1588 PTP hardware clock (<42ns jitter).",
    inbound: [],
    outbound: ["bandpass", "onset"],
    latency: "1.2 ms",
    tensorShape: "(4, 65536) float32",
    codeSnippet: "waveform = ring_buffer.read_window(samples=65536, channels=4)",
  },
  bandpass: {
    id: "bandpass",
    label: "Butterworth Bandpass & Wavelet",
    category: "ingestion",
    badge: "20 kHz - 1.0 MHz • 4th Order",
    math: "H(s) = \\frac{1}{\\prod_{k=1}^n (s - s_k)}, \\quad \\text{SNR} = +28.4\\text{ dB}",
    desc: "Zero-phase 4th-order Butterworth analog bandpass filter paired with Daubechies db4 soft-wavelet thresholding to eliminate civil structural traffic noise and motor vibration.",
    inbound: ["ingest"],
    outbound: ["ami_fnn"],
    latency: "2.8 ms",
    tensorShape: "(1, 65536) float32",
    codeSnippet: "filtered = butterworth_bandpass(waveform, low=20e3, high=1e6, order=4)",
  },
  onset: {
    id: "onset",
    label: "AIC / STA-LTA Onset Picker",
    category: "spatial",
    badge: "Delta-t_ij Resolution < 0.1 us",
    math: "\\mathrm{AIC}(k) = k \\ln(\\sigma_1^2) + (N - k) \\ln(\\sigma_2^2)",
    desc: "Akaike Information Criterion (AIC) auto-picker paired with Short-Term/Long-Term Average (STA/LTA) energy ratio picker, identifying micro-crack P-wave arrival times across channels.",
    inbound: ["ingest"],
    outbound: ["solver"],
    latency: "3.4 ms",
    tensorShape: "(4,) arrival timestamps [float64]",
    codeSnippet: "onsets = aic_picker.detect_arrivals(filtered_channels, threshold_ratio=3.8)",
  },
  solver: {
    id: "solver",
    label: "Gauss-Newton Hyperbolic TDoA",
    category: "spatial",
    badge: "Epicenter Error +/- 30.0 mm",
    math: "\\|\\mathbf{x} - \\mathbf{s}_i\\| - \\|\\mathbf{x} - \\mathbf{s}_j\\| = v_p \\cdot \\Delta t_{ij}",
    desc: "Non-linear least squares Gauss-Newton solver incorporating orthotropic concrete elastic wave velocity tensor (v_p = 3850 m/s longitudinal, v_s = 2240 m/s shear) for 3D crack localization.",
    inbound: ["onset"],
    outbound: ["alert"],
    latency: "4.1 ms",
    tensorShape: "(3,) coordinates [x, y, z] in meters",
    codeSnippet: "coords, residual = gn_hyperbolic_solve(onsets, sensor_matrix, v_p=3850.0)",
  },
  ami_fnn: {
    id: "ami_fnn",
    label: "AMI & FNN Parameter Optimization",
    category: "embedding",
    badge: "Optimal tau=4, dim d=3",
    math: "I(\\tau) = \\sum P(x_t, x_{t+\\tau}) \\log_2 \\frac{P(x_t, x_{t+\\tau})}{P(x_t)P(x_{t+\\tau})}, \\quad \\mathrm{FNN}(d) < 1.0\\%",
    desc: "Average Mutual Information (AMI) first local minimum selects delay tau=4; Kennel's False Nearest Neighbors (FNN) proves embedding dimension d=3 completely unfolds the strange attractor without geometric blowup.",
    inbound: ["bandpass"],
    outbound: ["takens"],
    latency: "3.6 ms",
    tensorShape: "tau=4 (int), d=3 (int)",
    codeSnippet: "tau = compute_first_ami_min(filtered)\ndim = compute_fnn_dimension(filtered, threshold=0.01)",
  },
  takens: {
    id: "takens",
    label: "Takens Delay Phase Embedding",
    category: "embedding",
    badge: "Reconstructed Attractor in R^3",
    math: "\\mathbf{v}(t) = [x(t),\\; x(t+\\tau),\\; x(t+2\\tau)]^T \\in \\mathbb{R}^3",
    desc: "By Takens' Embedding Theorem (1981), scalar time-series are diffeomorphically mapped to multi-dimensional phase space manifolds, capturing continuous non-linear crack fracture dynamics.",
    inbound: ["ami_fnn"],
    outbound: ["gudhi"],
    latency: "3.8 ms",
    tensorShape: "(2500, 3) float32 point cloud",
    codeSnippet: "attractor = takens_embed(filtered, tau=4, dim=3, subsample=2500)",
  },
  gudhi: {
    id: "gudhi",
    label: "C++ GUDHI & Ripser Engine",
    category: "tda",
    badge: "Vietoris-Rips Filtration eps <= 0.85",
    math: "\\sigma \\in \\mathrm{VR}_\\epsilon(X) \\iff \\max_{i < j} \\|\\mathbf{v}_i - \\mathbf{v}_j\\| \\le \\epsilon",
    desc: "Builds a continuous simplicial complex filtration over phase-space points via high-performance C++ GUDHI simplex trees and Ripser edge reduction, extracting birth-death persistence pairs.",
    inbound: ["takens"],
    outbound: ["homology"],
    latency: "22.4 ms",
    tensorShape: "SimplexTree (2500 vertices, 14200 simplices)",
    codeSnippet: "rips = gudhi.RipsComplex(points=attractor, max_edge_length=0.85)\nsimplex_tree = rips.create_simplex_tree(max_dimension=2)",
  },
  homology: {
    id: "homology",
    label: "Persistent Homology Pairs (H0 & H1)",
    category: "tda",
    badge: "Persistence Invariant (ell = d - b)",
    math: "H_0\\text{ (clusters)},\\; H_1\\text{ (topological loops)}, \\quad \\ell_i = d_i - b_i",
    desc: "Extracts scale-invariant 0D cluster components (H0) and 1D persistent circular tunnels (H1). Transient environmental noise dies at ell < 0.25; true crack cascades maintain stable loops (ell > 0.82).",
    inbound: ["gudhi"],
    outbound: ["vectorizer"],
    latency: "2.1 ms",
    tensorShape: "H0: (340, 2), H1: (84, 2) [birth, death]",
    codeSnippet: "diag = simplex_tree.persistence()\nh1_pairs = [p[1] for p in diag if p[0] == 1]",
  },
  vectorizer: {
    id: "vectorizer",
    label: "Topological Vectorizer (Phi in R^128)",
    category: "vectorizer",
    badge: "Betti Curves • Landscapes • Entropy",
    math: "\\beta_1(\\epsilon) = \\sum_{i=1}^{N_1} \\mathbb{I}(b_i \\le \\epsilon < d_i), \\quad E(D) = -\\sum p_i \\ln p_i",
    desc: "Transforms irregular persistence diagrams into fixed-length 128-dimensional Euclidean feature vectors: 50-step Betti-0/1 functional curves, 5-layer persistence landscapes, and persistent entropy.",
    inbound: ["homology"],
    outbound: ["classifier", "bocd", "autoencoder"],
    latency: "1.8 ms",
    tensorShape: "(128,) float32 dense vector",
    codeSnippet: "phi = vectorize_persistence(diag, betti_steps=50, landscape_layers=5)",
  },
  classifier: {
    id: "classifier",
    label: "Random Forest Fracture Classifier",
    category: "ml",
    badge: "Accuracy 94.6% • F1: 0.938",
    math: "\\hat{y} = \\arg\\max_c \\frac{1}{B} \\sum_{b=1}^{250} T_b(c \\mid \\Phi)",
    desc: "250-tree ensemble classifying fracture mechanism into Tensile Micro-cracks (Mode I, 95.8% precision), Shear Interface Slip (Mode II, 93.4%), and Anchor Tendon Debonding (91.2%).",
    inbound: ["vectorizer"],
    outbound: ["alert"],
    latency: "3.2 ms",
    tensorShape: "(4,) probabilities [Tensile, Shear, Tendon, Undamaged]",
    codeSnippet: "probs = rf_classifier.predict_proba([phi])[0]",
  },
  bocd: {
    id: "bocd",
    label: "Bayesian Online Changepoints (BOCD)",
    category: "ml",
    badge: "Run-Length Posterior P(r_t | x_1:t)",
    math: "P(r_t \\mid x_{1:t}) \\propto \\sum_{r_{t-1}} P(r_t \\mid r_{t-1}) P(x_t \\mid r_{t-1}, x_t^{(r)}) P(r_{t-1} \\mid x_{1:t-1})",
    desc: "Adams & MacKay Bayesian Online Changepoint Detection tracking topological regime shifts in real time, detecting micro-damage onset without requiring historic failure data.",
    inbound: ["vectorizer"],
    outbound: ["alert"],
    latency: "2.4 ms",
    tensorShape: "(100,) run-length posterior distribution",
    codeSnippet: "bocd.update(phi)\nchangepoint_prob = bocd.get_changepoint_probability()",
  },
  autoencoder: {
    id: "autoencoder",
    label: "Conv1D Topological Autoencoder",
    category: "ml",
    badge: "Reconstruction Anomaly Loss",
    math: "\\mathcal{L}_{\\mathrm{recon}} = \\|\\Phi - g_\\theta(f_\\phi(\\Phi))\\|_2^2 > \\eta_{\\mathrm{threshold}}",
    desc: "Unsupervised 1D convolutional autoencoder trained purely on undamaged elastic baseline states; high reconstruction residual provides independent verification of damage.",
    inbound: ["vectorizer"],
    outbound: ["alert"],
    latency: "2.9 ms",
    tensorShape: "scalar residual float32",
    codeSnippet: "recon = autoencoder.predict(phi)\nresidual = np.mean((phi - recon)**2)",
  },
  alert: {
    id: "alert",
    label: "Early Precursor Alert Engine",
    category: "ml",
    badge: "340 ms Precursor Warning Lead",
    math: "\\Delta t_{\\mathrm{lead}} = 340\\text{ ms}, \\quad \\mathrm{Latency}_{\\mathrm{total}} = 35.0\\text{ ms}",
    desc: "Consensus gate fusing Random Forest mode classification, BOCD changepoints, Conv1D anomaly scores, and TDoA localization coordinates into an actionable early warning dispatched 340ms prior to load drop.",
    inbound: ["classifier", "bocd", "autoencoder", "solver"],
    outbound: [],
    latency: "0.8 ms",
    tensorShape: "DispatchPayload (mode, coords, lead_ms, confidence)",
    codeSnippet: "if consensus_gate(probs, changepoint_prob, residual):\n    dispatch_precursor_alert(coords, lead_ms=340)",
  },
};

export function TdaPipelineDiagram() {
  const [selectedNodeId, setSelectedNodeId] = useState<string>("takens");
  const [activeView, setActiveView] = useState<"flow" | "ml_analysis" | "latency">("flow");

  const activeNode = NODES[selectedNodeId] || NODES["takens"];

  return (
    <div className="space-y-6 select-none font-sans">
      {/* View Switcher: Flowchart Graph vs ML Analysis vs Latency Budget */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-2 rounded-xl bg-[#14141a] border border-[#212128]">
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setActiveView("flow")}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
              activeView === "flow"
                ? "bg-[#20202a] text-white border border-[#2c2c3a] shadow-sm"
                : "text-zinc-400 hover:text-white hover:bg-[#191920]"
            }`}
          >
            <Share2 className="w-3.5 h-3.5 text-[#FF5500]" />
            <span>Interactive Architecture Flowchart</span>
          </button>
          <button
            onClick={() => setActiveView("ml_analysis")}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
              activeView === "ml_analysis"
                ? "bg-[#20202a] text-white border border-[#2c2c3a] shadow-sm"
                : "text-zinc-400 hover:text-white hover:bg-[#191920]"
            }`}
          >
            <Brain className="w-3.5 h-3.5 text-[#FF5500]" />
            <span>ML Analysis &amp; Benchmark Metrics</span>
          </button>
          <button
            onClick={() => setActiveView("latency")}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
              activeView === "latency"
                ? "bg-[#20202a] text-white border border-[#2c2c3a] shadow-sm"
                : "text-zinc-400 hover:text-white hover:bg-[#191920]"
            }`}
          >
            <Zap className="w-3.5 h-3.5 text-[#FF5500]" />
            <span>Real-Time Latency Allocation (35ms Budget)</span>
          </button>
        </div>

        <span className="text-[11px] font-mono text-zinc-500 hidden sm:inline">
          {activeView === "flow" && "Click any block to inspect tensor & math"}
          {activeView === "ml_analysis" && "Comparative validation on 42,800 AE events"}
          {activeView === "latency" && "Total Pipeline Latency: 35.0ms << 340ms Lead"}
        </span>
      </div>

      {/* ========================================================= */}
      {/* 1. INTERACTIVE MERMAID-STYLE FLOWCHART GRAPH              */}
      {/* ========================================================= */}
      {activeView === "flow" && (
        <div className="space-y-6">
          <div className="rounded-xl border border-[#23232c] bg-[#0c0c10] p-4 sm:p-6 shadow-2xl relative overflow-hidden">
            <div className="flex items-center justify-between pb-3 border-b border-[#1f1f26] text-xs font-mono">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#FF5500] animate-pulse" />
                <span className="text-zinc-300 font-semibold">
                  Dual-Branch Topological ML &amp; Hyperbolic Localization Flowchart
                </span>
              </div>
              <span className="text-zinc-500">IEEE 1588 PTP &bull; C++ GUDHI &bull; Scikit-learn</span>
            </div>

            {/* SVG Visual Flowchart */}
            <div className="my-4 overflow-x-auto">
              <div className="min-w-[920px] p-2">
                {/* Stage 1: Ingestion */}
                <div className="grid grid-cols-12 gap-3 items-center">
                  <div className="col-span-3">
                    <FlowBlock
                      node={NODES["ingest"]}
                      isSelected={selectedNodeId === "ingest"}
                      onClick={() => setSelectedNodeId("ingest")}
                      color="border-zinc-700 bg-[#16161f]"
                    />
                  </div>

                  <div className="col-span-1 flex items-center justify-center">
                    <ArrowConnector label="DMA Stream" />
                  </div>

                  <div className="col-span-3">
                    <FlowBlock
                      node={NODES["bandpass"]}
                      isSelected={selectedNodeId === "bandpass"}
                      onClick={() => setSelectedNodeId("bandpass")}
                      color="border-zinc-700 bg-[#16161f]"
                    />
                  </div>

                  <div className="col-span-1 flex items-center justify-center">
                    <ArrowConnector label="Clean AE" />
                  </div>

                  <div className="col-span-4">
                    <FlowBlock
                      node={NODES["ami_fnn"]}
                      isSelected={selectedNodeId === "ami_fnn"}
                      onClick={() => setSelectedNodeId("ami_fnn")}
                      color="border-indigo-900/60 bg-[#141424]"
                    />
                  </div>
                </div>

                {/* Connector Split */}
                <div className="grid grid-cols-12 gap-3 my-3">
                  <div className="col-span-3 flex justify-center">
                    <div className="h-6 w-0.5 bg-gradient-to-b from-zinc-700 to-[#FF5500]" />
                  </div>
                  <div className="col-span-9 flex justify-end pr-16">
                    <div className="h-6 w-0.5 bg-gradient-to-b from-indigo-800 to-[#FF5500]" />
                  </div>
                </div>

                {/* Stage 2: Dual Branch Parallel Track */}
                <div className="grid grid-cols-12 gap-3 items-stretch">
                  {/* Lower Track: Spatial Localization Branch */}
                  <div className="col-span-4 space-y-3 p-3.5 rounded-xl border border-sky-900/40 bg-[#0c121e]/80">
                    <div className="flex items-center justify-between text-[10px] font-mono text-sky-400 font-bold uppercase pb-1 border-b border-sky-900/30">
                      <span>BRANCH B: SPATIAL LOCALIZATION</span>
                      <Crosshair className="w-3.5 h-3.5" />
                    </div>
                    <FlowBlock
                      node={NODES["onset"]}
                      isSelected={selectedNodeId === "onset"}
                      onClick={() => setSelectedNodeId("onset")}
                      color="border-sky-900/50 bg-[#0f172a]"
                    />
                    <div className="flex justify-center">
                      <div className="h-4 w-0.5 bg-sky-800" />
                    </div>
                    <FlowBlock
                      node={NODES["solver"]}
                      isSelected={selectedNodeId === "solver"}
                      onClick={() => setSelectedNodeId("solver")}
                      color="border-sky-900/50 bg-[#0f172a]"
                    />
                  </div>

                  {/* Upper Track: Topological ML Pipeline */}
                  <div className="col-span-8 space-y-3 p-3.5 rounded-xl border border-[#FF5500]/30 bg-[#18110c]/70">
                    <div className="flex items-center justify-between text-[10px] font-mono text-[#FF5500] font-bold uppercase pb-1 border-b border-[#FF5500]/20">
                      <span>BRANCH A: TOPOLOGICAL INVARIANT RECONSTRUCTION</span>
                      <Layers className="w-3.5 h-3.5" />
                    </div>

                    <div className="grid grid-cols-3 gap-2.5">
                      <FlowBlock
                        node={NODES["takens"]}
                        isSelected={selectedNodeId === "takens"}
                        onClick={() => setSelectedNodeId("takens")}
                        color="border-orange-950/60 bg-[#1e1410]"
                      />
                      <FlowBlock
                        node={NODES["gudhi"]}
                        isSelected={selectedNodeId === "gudhi"}
                        onClick={() => setSelectedNodeId("gudhi")}
                        color="border-orange-950/60 bg-[#24130c]"
                      />
                      <FlowBlock
                        node={NODES["homology"]}
                        isSelected={selectedNodeId === "homology"}
                        onClick={() => setSelectedNodeId("homology")}
                        color="border-orange-950/60 bg-[#1e1410]"
                      />
                    </div>

                    <div className="flex justify-center my-1">
                      <div className="h-4 w-0.5 bg-[#FF5500]" />
                    </div>

                    <FlowBlock
                      node={NODES["vectorizer"]}
                      isSelected={selectedNodeId === "vectorizer"}
                      onClick={() => setSelectedNodeId("vectorizer")}
                      color="border-emerald-950/60 bg-[#0e1d15]"
                    />

                    {/* Tri-Branch Inference Models */}
                    <div className="grid grid-cols-3 gap-2 pt-2 border-t border-[#231822]">
                      <FlowBlock
                        node={NODES["classifier"]}
                        isSelected={selectedNodeId === "classifier"}
                        onClick={() => setSelectedNodeId("classifier")}
                        color="border-emerald-900/50 bg-[#0d1c14]"
                      />
                      <FlowBlock
                        node={NODES["bocd"]}
                        isSelected={selectedNodeId === "bocd"}
                        onClick={() => setSelectedNodeId("bocd")}
                        color="border-amber-900/50 bg-[#1c140d]"
                      />
                      <FlowBlock
                        node={NODES["autoencoder"]}
                        isSelected={selectedNodeId === "autoencoder"}
                        onClick={() => setSelectedNodeId("autoencoder")}
                        color="border-purple-900/50 bg-[#190d1f]"
                      />
                    </div>
                  </div>
                </div>

                {/* Final Convergence Gate */}
                <div className="flex justify-center my-3">
                  <div className="h-6 w-0.5 bg-gradient-to-b from-[#FF5500] to-emerald-400" />
                </div>

                <div className="max-w-md mx-auto">
                  <FlowBlock
                    node={NODES["alert"]}
                    isSelected={selectedNodeId === "alert"}
                    onClick={() => setSelectedNodeId("alert")}
                    color="border-[#FF5500] bg-[#261008] shadow-[0_0_25px_rgba(255,85,0,0.25)]"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Detailed Node Inspector Drawer */}
          <div className="rounded-xl border border-[#23232c] bg-[#14141a] p-5 sm:p-6 shadow-xl space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b border-[#1f1f26]">
              <div>
                <span className="text-[10px] font-mono uppercase font-bold text-[#FF5500]">
                  Node Specification Inspector
                </span>
                <h3 className="text-base font-bold text-white mt-0.5 flex items-center gap-2">
                  <span>{activeNode.label}</span>
                  <span className="text-xs font-mono font-normal text-zinc-400 px-2 py-0.5 rounded bg-[#1c1c24] border border-[#282834]">
                    {activeNode.badge}
                  </span>
                </h3>
              </div>

              <div className="flex items-center gap-4 text-xs font-mono text-zinc-400">
                <span>Latency: <strong className="text-white">{activeNode.latency}</strong></span>
                <span>•</span>
                <span>Shape: <strong className="text-white">{activeNode.tensorShape}</strong></span>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed font-sans">
              {activeNode.desc}
            </p>

            {/* Formula Block */}
            <div className="rounded-lg border border-[#282836] bg-[#0c0c10] p-3.5 text-center font-mono text-xs sm:text-sm text-zinc-200 select-all overflow-x-auto shadow-inner">
              {activeNode.math}
            </div>

            {/* Code Snippet */}
            <div className="rounded-lg border border-[#242430] bg-[#09090d] p-3 text-xs font-mono text-zinc-300 flex items-center justify-between">
              <span className="text-zinc-500 select-none">Python / C++ Binding:</span>
              <code className="text-emerald-400 select-all">{activeNode.codeSnippet}</code>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 2. ML ANALYSIS & COMPARATIVE BENCHMARK MATRIX             */}
      {/* ========================================================= */}
      {activeView === "ml_analysis" && (
        <div className="space-y-6">
          {/* Performance Comparison Table */}
          <div className="rounded-xl border border-[#23232c] bg-[#14141a] p-5 sm:p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#1f1f26]">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Brain className="w-4 h-4 text-[#FF5500]" />
                  <span>Acoustic Machine Learning Model Benchmarks</span>
                </h3>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Evaluated across 42,800 cyclic fatigue and monotonic bend events with specimen-level holdout validation
                </p>
              </div>
              <span className="text-[11px] font-mono text-emerald-400 font-semibold">
                TopoAE Lead Advantage: +295ms
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs font-mono text-left">
                <thead className="bg-[#101016] text-zinc-400 border-b border-[#212128]">
                  <tr>
                    <th className="p-3">Model Architecture</th>
                    <th className="p-3">Precursor Warning Lead</th>
                    <th className="p-3">Test Accuracy</th>
                    <th className="p-3">Precursor F1</th>
                    <th className="p-3">ROC-AUC</th>
                    <th className="p-3">False Alarm Rate</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1e1e26] text-zinc-300">
                  <tr className="bg-[#FF5500]/10 border-l-2 border-[#FF5500]">
                    <td className="p-3 font-bold text-white flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-[#FF5500]" />
                      <span>EchoSense TopoAE (RF + GUDHI)</span>
                    </td>
                    <td className="p-3 text-emerald-400 font-bold">340 ms Lead</td>
                    <td className="p-3 font-semibold text-white">94.6%</td>
                    <td className="p-3 text-white">0.938</td>
                    <td className="p-3 text-white">0.978</td>
                    <td className="p-3 text-emerald-400 font-semibold">3.2% (Low)</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-medium">1D-CNN Raw Waveform Net</td>
                    <td className="p-3 text-amber-400">45 ms Lead</td>
                    <td className="p-3">91.2%</td>
                    <td className="p-3">0.904</td>
                    <td className="p-3">0.941</td>
                    <td className="p-3 text-zinc-400">8.7%</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-medium">Multi-Class RBF Support Vector (SVM)</td>
                    <td className="p-3 text-zinc-400">12 ms Lead</td>
                    <td className="p-3">86.4%</td>
                    <td className="p-3">0.851</td>
                    <td className="p-3">0.892</td>
                    <td className="p-3 text-zinc-400">14.1%</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-medium text-zinc-500">Conventional AE Energy Baseline (RMS / Peak)</td>
                    <td className="p-3 text-rose-500 font-bold">-180 ms (Post-Failure)</td>
                    <td className="p-3 text-zinc-500">68.2%</td>
                    <td className="p-3 text-zinc-500">0.655</td>
                    <td className="p-3 text-zinc-500">0.710</td>
                    <td className="p-3 text-rose-400">24.8% (Extreme)</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* 2-Column: Confusion Matrix + Feature Importance */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Confusion Matrix (6 Cols) */}
            <div className="lg:col-span-6 rounded-xl border border-[#23232c] bg-[#14141a] p-5 space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-[#1f1f26]">
                <h4 className="text-xs font-bold text-white uppercase font-mono tracking-wider">
                  TopoAE Confusion Matrix (Specimen Holdout)
                </h4>
                <span className="text-[10px] font-mono text-zinc-500">N = 8,560 events</span>
              </div>

              <div className="grid grid-cols-4 gap-2 text-center text-xs font-mono">
                <div className="p-2.5 rounded-lg bg-[#1c130d] border border-[#FF5500]/30">
                  <span className="text-[10px] text-zinc-500 block">Mode I Tensile</span>
                  <span className="text-base font-bold text-white mt-1 block">95.8%</span>
                  <span className="text-[10px] text-emerald-400">2,050 / 2,140</span>
                </div>
                <div className="p-2.5 rounded-lg bg-[#1c130d] border border-[#FF5500]/30">
                  <span className="text-[10px] text-zinc-500 block">Mode II Shear</span>
                  <span className="text-base font-bold text-white mt-1 block">93.4%</span>
                  <span className="text-[10px] text-emerald-400">1,998 / 2,140</span>
                </div>
                <div className="p-2.5 rounded-lg bg-[#1c130d] border border-[#FF5500]/30">
                  <span className="text-[10px] text-zinc-500 block">Tendon Debond</span>
                  <span className="text-base font-bold text-white mt-1 block">91.2%</span>
                  <span className="text-[10px] text-emerald-400">1,951 / 2,140</span>
                </div>
                <div className="p-2.5 rounded-lg bg-[#12161a] border border-sky-900/40">
                  <span className="text-[10px] text-zinc-500 block">Baseline Noise</span>
                  <span className="text-base font-bold text-white mt-1 block">97.8%</span>
                  <span className="text-[10px] text-emerald-400">2,093 / 2,140</span>
                </div>
              </div>

              <p className="text-[11px] text-zinc-400 font-sans leading-relaxed">
                Zero spatial data leakage: validation evaluated strictly on held-out bridge girders (G1 midspan and G2 shear zone) not present during training.
              </p>
            </div>

            {/* Feature Importance (6 Cols) */}
            <div className="lg:col-span-6 rounded-xl border border-[#23232c] bg-[#14141a] p-5 space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-[#1f1f26]">
                <h4 className="text-xs font-bold text-white uppercase font-mono tracking-wider">
                  Gini Feature Importance (Topological Invariants)
                </h4>
                <span className="text-[10px] font-mono text-[#FF5500]">250 RF Trees</span>
              </div>

              <div className="space-y-2.5 text-xs font-mono">
                {[
                  { name: "H1 Persistence Loop Area (AUC beta_1)", pct: 28.4 },
                  { name: "Persistence Entropy E(D)", pct: 24.1 },
                  { name: "First Persistence Landscape Integral (lambda_1)", pct: 19.8 },
                  { name: "H0 Connected Components Peak (beta_0)", pct: 14.2 },
                  { name: "Acoustic Ring-Down Signal Energy", pct: 13.5 },
                ].map((feat, idx) => (
                  <div key={idx} className="space-y-1">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-zinc-300 truncate max-w-[280px]">{feat.name}</span>
                      <span className="text-white font-bold">{feat.pct}%</span>
                    </div>
                    <div className="h-1.5 w-full bg-[#1e1e28] rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-[#FF5500] to-orange-400 rounded-full"
                        style={{ width: `${feat.pct * 3}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 3. REAL-TIME LATENCY ALLOCATION BUDGET                    */}
      {/* ========================================================= */}
      {activeView === "latency" && (
        <div className="rounded-xl border border-[#23232c] bg-[#14141a] p-5 sm:p-6 shadow-xl space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b border-[#1f1f26]">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Zap className="w-4 h-4 text-[#FF5500]" />
                <span>Microsecond Pipeline Latency Allocation</span>
              </h3>
              <p className="text-xs text-zinc-400 mt-0.5">
                Total computational turnaround budget vs 340ms physical crack cascade lead time
              </p>
            </div>
            <div className="text-right">
              <span className="text-xs font-mono text-zinc-500">Pipeline Execution:</span>
              <span className="text-sm font-bold font-mono text-[#FF5500] ml-2">35.0 ms</span>
            </div>
          </div>

          {/* Waterfall Timing Bar */}
          <div className="space-y-2">
            <div className="h-7 w-full rounded-lg overflow-hidden flex text-[10px] font-mono text-white font-bold select-none">
              <div className="bg-zinc-700 flex items-center justify-center" style={{ width: "3.4%" }} title="DMA Buffer: 1.2ms">
                1.2m
              </div>
              <div className="bg-indigo-700 flex items-center justify-center" style={{ width: "8.0%" }} title="Bandpass: 2.8ms">
                2.8m
              </div>
              <div className="bg-purple-700 flex items-center justify-center" style={{ width: "10.3%" }} title="Takens Delay: 3.6ms">
                3.6m
              </div>
              <div className="bg-[#FF5500] flex items-center justify-center shadow-lg" style={{ width: "64.0%" }} title="C++ GUDHI VR Filtration: 22.4ms">
                GUDHI VR: 22.4 ms
              </div>
              <div className="bg-amber-700 flex items-center justify-center" style={{ width: "5.1%" }} title="Vectorization: 1.8ms">
                1.8m
              </div>
              <div className="bg-emerald-600 flex items-center justify-center" style={{ width: "9.2%" }} title="Random Forest: 3.2ms">
                3.2m
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-2 text-[10px] font-mono text-zinc-500 pt-1">
              <span>● DMA Ingest (1.2ms)</span>
              <span>● Bandpass (2.8ms)</span>
              <span>● Takens (3.6ms)</span>
              <span className="text-[#FF5500] font-semibold">● C++ GUDHI VR Tree (22.4ms)</span>
              <span>● Vectorize (1.8ms)</span>
              <span className="text-emerald-400 font-semibold">● ML Inference (3.2ms)</span>
            </div>
          </div>

          {/* Safety Reaction Margin Breakdown */}
          <div className="p-4 rounded-xl border border-[#252532] bg-[#0c0c10] space-y-3 font-mono text-xs">
            <div className="flex items-center justify-between pb-2 border-b border-[#1b1b22]">
              <span className="text-zinc-400">Total Computational Pipeline Turnaround:</span>
              <span className="text-white font-bold">35.0 ms</span>
            </div>
            <div className="flex items-center justify-between pb-2 border-b border-[#1b1b22]">
              <span className="text-zinc-400">Physical Precursor Warning Lead Window:</span>
              <span className="text-white font-bold">340.0 ms</span>
            </div>
            <div className="flex items-center justify-between text-emerald-400 font-bold">
              <span>Net Operator Intervention &amp; Auto-Shutdown Safety Margin:</span>
              <span className="text-sm">+ 305.0 ms</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function FlowBlock({
  node,
  isSelected,
  onClick,
  color,
}: {
  node: PipelineNode;
  isSelected: boolean;
  onClick: () => void;
  color: string;
}) {
  return (
    <div
      onClick={onClick}
      className={`p-3 rounded-xl border transition-all cursor-pointer select-none flex flex-col justify-between ${color} ${
        isSelected
          ? "border-[#FF5500] shadow-[0_0_18px_rgba(255,85,0,0.35)] ring-1 ring-[#FF5500]"
          : "hover:border-zinc-500"
      }`}
    >
      <div>
        <div className="flex items-center justify-between gap-1 mb-1">
          <span className="text-[9px] font-mono font-bold uppercase tracking-wider text-zinc-400 truncate">
            {node.category}
          </span>
          <span className="text-[9px] font-mono text-[#FF5500] font-semibold">{node.latency}</span>
        </div>
        <h4 className="text-xs font-bold text-white leading-snug line-clamp-2">{node.label}</h4>
      </div>
      <span className="text-[10px] font-mono text-zinc-400 truncate mt-2 block border-t border-white/5 pt-1">
        {node.badge}
      </span>
    </div>
  );
}

function ArrowConnector({ label }: { label: string }) {
  return (
    <div className="flex flex-col items-center justify-center text-center">
      <div className="flex items-center relative">
        <div className="w-5 h-0.5 bg-zinc-750 relative overflow-hidden rounded-full">
          <div className="absolute inset-0 w-2 h-full bg-[#FF5500]/70 rounded-full animate-pulse" />
        </div>
        <ArrowRight className="w-3.5 h-3.5 text-zinc-400 -ml-1" />
      </div>
      <span className="text-[9px] font-mono text-zinc-500 mt-0.5 whitespace-nowrap">{label}</span>
    </div>
  );
}
