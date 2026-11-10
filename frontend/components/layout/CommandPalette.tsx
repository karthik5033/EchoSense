"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  LayoutDashboard,
  UploadCloud,
  Activity,
  GitCompare,
  Radio,
  Database,
  FileText,
  Sliders,
  Layers,
  BookOpen,
  X,
  ArrowRight,
  Cpu,
  Crosshair,
  Compass,
  Clock,
  Sparkles,
  Zap,
  Shield,
  FileCode,
  Terminal,
  Waves,
  Hash,
  AlertTriangle,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
}

export interface DeepSearchItem {
  id: string;
  title: string;
  description: string;
  href: string;
  category: "Algorithms & TDA" | "Hardware & DAQ" | "Wave Localization" | "Girders & Runs" | "Datasets" | "Reports & NDT" | "Architecture & Docs";
  keywords: string[];
  icon: React.ComponentType<{ className?: string }>;
  tag?: string;
}

export const DEEP_SEARCH_INDEX: DeepSearchItem[] = [
  // --------------------------------------------------------------------------
  // ALGORITHMS & TDA PIPELINE
  // --------------------------------------------------------------------------
  {
    id: "algo-takens",
    title: "Takens Delay-Coordinate Embedding (τ=4, d=3)",
    description: "Reconstruct phase space attractor from scalar acoustic time-series via Average Mutual Information (AMI)",
    href: "/analysis?tab=takens",
    category: "Algorithms & TDA",
    keywords: ["takens", "delay", "tau", "phase space", "embedding", "dimension", "ami", "fnn", "attractor", "coordinates"],
    icon: Cpu,
    tag: "τ=4 samples",
  },
  {
    id: "algo-persistent-homology",
    title: "Persistent Homology & Vietoris-Rips Filtration",
    description: "Multi-scale topological features, persistent H₁ loops, and birth-death barcodes via GUDHI C++",
    href: "/analysis?tab=topology",
    category: "Algorithms & TDA",
    keywords: ["betti", "homology", "persistent", "vietoris-rips", "gudhi", "h0", "h1", "h2", "filtration", "barcode", "topological"],
    icon: Sparkles,
    tag: "GUDHI VR",
  },
  {
    id: "algo-bocd",
    title: "Bayesian Online Changepoint Detection (BOCD)",
    description: "Real-time non-stationary acoustic regime shift identification with constant hazard rate λ=250",
    href: "/analysis?tab=changepoints",
    category: "Algorithms & TDA",
    keywords: ["bocd", "changepoint", "hazard", "hazard rate", "run length", "poisson", "bayesian", "regime", "online"],
    icon: Clock,
    tag: "λ=250",
  },
  {
    id: "algo-conv1d",
    title: "Conv1D Temporal Autoencoder Residuals",
    description: "Unsupervised anomaly detection scoring reconstruction error against baseline undamaged concrete",
    href: "/analysis?tab=anomalies",
    category: "Algorithms & TDA",
    keywords: ["conv1d", "autoencoder", "residual", "anomaly", "anomaly score", "reconstruction", "deep learning", "bottleneck"],
    icon: Activity,
    tag: "95th Percentile",
  },
  {
    id: "algo-ami",
    title: "Average Mutual Information (AMI) Estimator",
    description: "First local minimum calculation to ensure mutual independence between delay coordinates",
    href: "/analysis?tab=takens",
    category: "Algorithms & TDA",
    keywords: ["ami", "mutual information", "first minimum", "time delay", "non-linear", "delay selection"],
    icon: Hash,
    tag: "Mutual Info",
  },
  {
    id: "algo-fnn",
    title: "False Nearest Neighbors (FNN) Dimension Analysis",
    description: "Determines minimal embedding dimension d to completely unfold phase space trajectory without self-intersection",
    href: "/analysis?tab=takens",
    category: "Algorithms & TDA",
    keywords: ["fnn", "false nearest neighbors", "dimension", "unfolding", "d=3", "topological embedding"],
    icon: Layers,
    tag: "d=3 (0.2% FNN)",
  },
  {
    id: "algo-silhouettes",
    title: "Persistence Silhouettes & Landscapes (p=2)",
    description: "Sobolev L₂ weighted functional representations of persistence diagrams for Random Forest ingestion",
    href: "/topology-engine",
    category: "Algorithms & TDA",
    keywords: ["silhouette", "landscape", "vectorization", "betti curves", "persistence diagram", "random forest"],
    icon: Waves,
    tag: "L₂ Sobolev",
  },
  {
    id: "algo-attractor",
    title: "3D Phase Space Attractor Manifold",
    description: "Interactive 3-dimensional trajectory visualization of acoustic emission stress waves",
    href: "/topology-engine",
    category: "Algorithms & TDA",
    keywords: ["attractor", "3d phase space", "manifold", "state space", "orbit", "trajectory"],
    icon: Cpu,
    tag: "3D Manifold",
  },

  // --------------------------------------------------------------------------
  // HARDWARE, DAQ & SENSORS
  // --------------------------------------------------------------------------
  {
    id: "hw-r15a",
    title: "PAC R15α Piezoelectric Resonant Transducer",
    description: "150 kHz high-sensitivity acoustic sensor calibrated for concrete micro-cracking detection",
    href: "/settings?tab=sensor",
    category: "Hardware & DAQ",
    keywords: ["r15", "r15a", "piezoelectric", "transducer", "sensor", "150 khz", "resonant", "pac"],
    icon: Radio,
    tag: "148.6 kHz Peak",
  },
  {
    id: "hw-preamp",
    title: "Digital Pre-Amplifier Gain Calibration (+24 dB)",
    description: "Linear hardware gain compensation (Av = 15.85×) and input-referred noise floor optimization",
    href: "/settings?tab=sensor",
    category: "Hardware & DAQ",
    keywords: ["gain", "pre-amp", "amplifier", "+24 db", "amplification", "voltage gain", "noise floor"],
    icon: Sliders,
    tag: "+24 dB (15.8×)",
  },
  {
    id: "hw-butterworth",
    title: "Butterworth Digital Bandpass Filter (20 - 200 kHz)",
    description: "Rejects low-frequency ambient vehicle vibration while preventing high-frequency aliasing",
    href: "/settings?tab=sensor",
    category: "Hardware & DAQ",
    keywords: ["butterworth", "bandpass", "filter", "cutoff", "high-pass", "low-pass", "passband", "20 khz", "200 khz"],
    icon: Waves,
    tag: "20 - 200 kHz",
  },
  {
    id: "hw-nyquist",
    title: "Digitizer Sampling Frequency & Nyquist Barrier",
    description: "Hardware DMA ingest rates (10 MS/s, 500 kS/s, 48 kS/s) with spectral folding protection",
    href: "/settings?tab=sensor",
    category: "Hardware & DAQ",
    keywords: ["nyquist", "sampling", "frequency", "fs", "10 mhz", "500 khz", "48 khz", "aliasing", "dma"],
    icon: Activity,
    tag: "fs / 2 Barrier",
  },
  {
    id: "hw-ptp",
    title: "IEEE 1588 Precision Time Protocol (PTP)",
    description: "Nanosecond hardware timestamp synchronization with 42 ns clock jitter across sensor nodes",
    href: "/settings?tab=sensor",
    category: "Hardware & DAQ",
    keywords: ["ptp", "ieee 1588", "timestamp", "jitter", "clock", "nanosecond", "synchronization", "42 ns"],
    icon: Clock,
    tag: "σ = 42 ns",
  },
  {
    id: "hw-scope",
    title: "Live Multi-Channel Acoustic Oscilloscope",
    description: "Real-time RF waveform and Power Spectral Density (PSD) display with automated precursor detection",
    href: "/monitor",
    category: "Hardware & DAQ",
    keywords: ["oscilloscope", "scope", "monitor", "rf waveform", "psd", "fft", "real-time", "voltage", "vpp"],
    icon: Radio,
    tag: "10 MS/s Stream",
  },

  // --------------------------------------------------------------------------
  // WAVE LOCALIZATION & STRUCTURAL GEOMETRY
  // --------------------------------------------------------------------------
  {
    id: "loc-tdoa",
    title: "Time Difference of Arrival (TDoA) Wave Localization",
    description: "Hyperbolic arrival time multilateration across 4-channel piezoelectric transducer array",
    href: "/localization?tab=tdoa",
    category: "Wave Localization",
    keywords: ["tdoa", "localization", "wave localization", "hyperbola", "arrival time", "sensor array", "delta t"],
    icon: Crosshair,
    tag: "±30 mm Error",
  },
  {
    id: "loc-heatmap",
    title: "2D Acoustic Damage Density Heatmap (KDE)",
    description: "Spatial clustering and energy concentration across prestressed girder elevation span",
    href: "/localization?tab=heatmap",
    category: "Wave Localization",
    keywords: ["heatmap", "kde", "density", "cluster", "spatial", "elevation", "energy", "hotspot"],
    icon: Layers,
    tag: "KDE Clustered",
  },
  {
    id: "loc-dispersion",
    title: "Lamb Wave Ultrasonic Dispersion Relations",
    description: "Phase velocity (Cp) and group velocity (Cg) vs frequency-thickness product for S₀ and A₀ modes",
    href: "/localization?tab=dispersion",
    category: "Wave Localization",
    keywords: ["lamb wave", "dispersion", "s0", "a0", "phase velocity", "group velocity", "ultrasonic", "modes"],
    icon: Waves,
    tag: "S₀ & A₀ Modes",
  },
  {
    id: "loc-anisotropy",
    title: "Directional Acoustic Velocity Anisotropy Tensor",
    description: "Concrete stiffness tensor corrections: 4,450 m/s longitudinal vs 3,850 m/s transverse",
    href: "/localization?tab=anisotropy",
    category: "Wave Localization",
    keywords: ["anisotropy", "polar", "tensor", "directional", "velocity", "stiffness", "longitudinal", "transverse"],
    icon: Compass,
    tag: "ε = 1.156",
  },
  {
    id: "loc-solver",
    title: "Geiger's Iterative Gauss-Newton Multilateration Solver",
    description: "Non-linear system Jacobian matrix convergence with Levenberg-Marquardt damping",
    href: "/localization?tab=solver",
    category: "Wave Localization",
    keywords: ["geiger", "gauss-newton", "solver", "jacobian", "levenberg", "convergence", "multilateration"],
    icon: Cpu,
    tag: "5 Iterations",
  },

  // --------------------------------------------------------------------------
  // EXPERIMENTAL RUNS & SPECIMENS
  // --------------------------------------------------------------------------
  {
    id: "run-an8921",
    title: "Run AN-8921: Girder G1 Monotonic Bend (Stage 3)",
    description: "Prestressed bridge girder midspan bending test under four-point loading; elastic tensile micro-cracking",
    href: "/analysis?run=AN-8921",
    category: "Girders & Runs",
    keywords: ["an-8921", "girder g1", "monotonic", "stage 3", "midspan", "tensile", "0.938 f1"],
    icon: Activity,
    tag: "Tensile (94%)",
  },
  {
    id: "run-an8920",
    title: "Run AN-8920: Girder G2 Cyclic Fatigue (Block 5)",
    description: "Cyclic shear key interface loading; irreversible shear slip precursor alert confirmed",
    href: "/analysis?run=AN-8920",
    category: "Girders & Runs",
    keywords: ["an-8920", "girder g2", "cyclic", "fatigue", "block 5", "shear key", "shear slip", "precursor", "alert"],
    icon: AlertTriangle,
    tag: "PRECURSOR ALERT",
  },
  {
    id: "run-an8919",
    title: "Run AN-8919: Concrete Benchmark Cylinder C-14",
    description: "Siracusano et al. tri-mode fracture benchmark with validated 1,000 time sample events",
    href: "/analysis?run=AN-8919",
    category: "Girders & Runs",
    keywords: ["an-8919", "concrete", "cylinder c-14", "siracusano", "mendeley", "mixed-mode", "benchmark"],
    icon: Database,
    tag: "Mixed-Mode (89%)",
  },
  {
    id: "run-an8918",
    title: "Run AN-8918: Smartphone In-Situ Ambient Calibration",
    description: "Pixel 9 Pro internal MEMS microphone ambient acoustic stream calibrated with 48 kHz filter",
    href: "/analysis?run=AN-8918",
    category: "Girders & Runs",
    keywords: ["an-8918", "smartphone", "pixel 9", "mems", "ambient", "calibration", "undamaged", "48 khz"],
    icon: Radio,
    tag: "Undamaged (99%)",
  },
  {
    id: "run-an8917",
    title: "Run AN-8917: Girder G4 Ultimate Limit State Run",
    description: "Tendon anchorage debonding zone under ultimate post-tensioned limit load; 7 changepoints",
    href: "/analysis?run=AN-8917",
    category: "Girders & Runs",
    keywords: ["an-8917", "girder g4", "ultimate limit", "tendon", "anchorage", "debonding", "alert"],
    icon: AlertTriangle,
    tag: "Shear (96%)",
  },

  // --------------------------------------------------------------------------
  // BENCHMARK DATASETS
  // --------------------------------------------------------------------------
  {
    id: "ds-bridge",
    title: "Prestressed RC Bridge-Girder AE Dataset (4.2 GB)",
    description: "42,800 validated experimental acoustic events from 4 prestressed bridge girders under monotonic and cyclic regimes",
    href: "/datasets",
    category: "Datasets",
    keywords: ["bridge girder dataset", "d'angela", "magliulo", "4.2 gb", "42800", "hdf5", "csv", "10 mhz"],
    icon: Database,
    tag: "42,800 Events",
  },
  {
    id: "ds-mendeley",
    title: "Concrete AE Event Dataset (Siracusano 185 MB)",
    description: "16,650 structural acoustic events with validated Tensile, Shear, and Mixed-Mode fracture classifications",
    href: "/datasets",
    category: "Datasets",
    keywords: ["concrete dataset", "siracusano", "mendeley", "185 mb", "16650", "mat", "npy", "500 khz"],
    icon: Database,
    tag: "16,650 Events",
  },
  {
    id: "ds-smartphone",
    title: "Smartphone In-Situ Acoustic Field Captures (620 MB)",
    description: "Uncompressed 24-bit PCM acoustic waveforms captured from commodity smartphone MEMS hardware",
    href: "/datasets",
    category: "Datasets",
    keywords: ["smartphone dataset", "mems dataset", "620 mb", "2450", "wav", "pcm", "field captures"],
    icon: Database,
    tag: "2,450 Events",
  },
  {
    id: "ds-partitioning",
    title: "Zero-Leakage Specimen-Level Data Partitioning",
    description: "Isolates validation splits at girder boundaries (Girder G1 held out entirely) to eliminate spatial leakage",
    href: "/datasets",
    category: "Datasets",
    keywords: ["partitioning", "data split", "train test", "leakage", "holdout", "girder g1", "specimen level"],
    icon: Sliders,
    tag: "Zero-Leakage",
  },

  // --------------------------------------------------------------------------
  // REPORTS & NDT COMPLIANCE
  // --------------------------------------------------------------------------
  {
    id: "rep-002",
    title: "Report REP-2026-002: Girder G2 Cyclic Shear Interface",
    description: "Official precursor alert report; persistent H₁ loops and 5 BOCD changepoints flag imminent shear failure",
    href: "/reports",
    category: "Reports & NDT",
    keywords: ["rep-2026-002", "girder g2 report", "critical risk", "shear precursor report", "pdf", "audit"],
    icon: FileText,
    tag: "Critical Precursor",
  },
  {
    id: "rep-001",
    title: "Report REP-2026-001: Girder G1 Monotonic Test",
    description: "Structural assessment report documenting elastic flexural micro-cracking within codified safety limits",
    href: "/reports",
    category: "Reports & NDT",
    keywords: ["rep-2026-001", "girder g1 report", "monotonic report", "low risk"],
    icon: FileText,
    tag: "Low Risk",
  },
  {
    id: "rep-standards",
    title: "EN 1330-9 & ASTM E1316-24 NDT Compliance",
    description: "Standardized acoustic emission terminology, equipment calibration, and digital audit hash verification",
    href: "/reports",
    category: "Reports & NDT",
    keywords: ["en 1330-9", "astm e1316", "ndt", "standards", "compliance", "audit hash", "calibration"],
    icon: Shield,
    tag: "EN 1330-9",
  },

  // --------------------------------------------------------------------------
  // ARCHITECTURE & DEVELOPER DOCUMENTATION
  // --------------------------------------------------------------------------
  {
    id: "arch-topology",
    title: "5-Layer Edge-to-Cloud System Topology Diagram",
    description: "Hardware DAQ layer, Edge Gateway, Cloud ML Ingestion, TDA Compute Engine, and Presentation Tier",
    href: "/architecture",
    category: "Architecture & Docs",
    keywords: ["architecture", "topology", "system topology", "edge", "gateway", "cloud", "5 layers", "system blueprint"],
    icon: Layers,
    tag: "5-Layer Blueprint",
  },
  {
    id: "arch-pipeline",
    title: "Signal-to-Topology TDA Pipeline Architecture",
    description: "Interactive 6-stage architectural progression from raw 10 MS/s waveform to topological Betti persistence",
    href: "/architecture",
    category: "Architecture & Docs",
    keywords: ["tda pipeline diagram", "architecture pipeline", "stage inspector", "takens stage", "filtration stage"],
    icon: Cpu,
    tag: "Pipeline Graph",
  },
  {
    id: "arch-decision",
    title: "Tri-Branch Consensus Decision Engine Architecture",
    description: "Consensus alarm engine fusing Random Forest, Conv1D Autoencoder, and BOCD changepoints",
    href: "/architecture",
    category: "Architecture & Docs",
    keywords: ["decision engine", "tri-branch", "consensus", "false alarm rejection", "random forest", "autoencoder"],
    icon: Zap,
    tag: "2/3 Consensus",
  },
  {
    id: "docs-rest-api",
    title: "REST API: POST /api/v1/stream/ingest",
    description: "High-throughput DMA buffer ingestion endpoint with PTP timestamp header validation",
    href: "/docs",
    category: "Architecture & Docs",
    keywords: ["rest api", "api", "post", "endpoint", "ingest", "dma", "curl", "python client", "developer"],
    icon: Terminal,
    tag: "REST API",
  },
  {
    id: "docs-websocket",
    title: "WebSocket API: wss://.../ws/v1/telemetry",
    description: "Sub-50ms live oscilloscope streaming socket with serialized acoustic hit packets",
    href: "/docs",
    category: "Architecture & Docs",
    keywords: ["websocket", "wss", "telemetry", "streaming", "socket", "real-time api"],
    icon: Radio,
    tag: "WebSocket",
  },
  {
    id: "docs-python-sdk",
    title: "EchoSense Python SDK (echosense-shm)",
    description: "Python client library for automated TDA extraction, GUDHI filtration, and BOCD streaming",
    href: "/docs",
    category: "Architecture & Docs",
    keywords: ["python", "sdk", "echosense-shm", "pip install", "python client", "library"],
    icon: FileCode,
    tag: "Python SDK",
  },
  {
    id: "docs-contracts",
    title: "Protobuf & JSON Schema Data Contracts",
    description: "Strict payload schemas for edge sensor nodes, PTP frames, and topological feature vectors",
    href: "/docs/data-contracts",
    category: "Architecture & Docs",
    keywords: ["data contracts", "protobuf", "schema", "json schema", "payload", "contracts"],
    icon: FileCode,
    tag: "Data Contracts",
  },
  {
    id: "docs-system-design",
    title: "Technical Requirements & System Design (TRD)",
    description: "Comprehensive engineering specification for civil infrastructure acoustic monitoring",
    href: "/docs/system-design",
    category: "Architecture & Docs",
    keywords: ["system design", "trd", "technical design", "specification", "requirements"],
    icon: BookOpen,
    tag: "TRD Spec",
  },
  {
    id: "bench-compare",
    title: "Comparative ML Benchmarks & Confusion Matrix",
    description: "TopoAE vs Conventional AE Parameter vs 1D-CNN vs Random Forest evaluation matrix",
    href: "/compare",
    category: "Algorithms & TDA",
    keywords: ["model comparison", "benchmark", "confusion matrix", "f1-score", "roc-auc", "accuracy", "roc"],
    icon: GitCompare,
    tag: "F1 = 0.946",
  },
];

export function CommandPalette({ isOpen, onClose }: CommandPaletteProps) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  // Close on Escape or ⌘K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        onClose();
      }
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  // Focus input on open
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      setSelectedIndex(0);
    }
  }, [isOpen]);

  // Granular Search Filtering
  const filteredResults = useMemo(() => {
    const q = query.trim().toLowerCase();

    return DEEP_SEARCH_INDEX.filter((item) => {
      // Category filter
      if (selectedCategory !== "ALL" && item.category !== selectedCategory) {
        return false;
      }

      if (!q) return true;

      // Exact title match
      if (item.title.toLowerCase().includes(q)) return true;

      // Description match
      if (item.description.toLowerCase().includes(q)) return true;

      // Category match
      if (item.category.toLowerCase().includes(q)) return true;

      // Keyword match (granular terms: "takens", "betti", "r15a", "lamb", "geiger", "bocd", etc.)
      return item.keywords.some((kw) => kw.toLowerCase().includes(q));
    });
  }, [query, selectedCategory]);

  // Reset selected index when results change
  useEffect(() => {
    setSelectedIndex(0);
  }, [filteredResults.length, query, selectedCategory]);

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev < filteredResults.length - 1 ? prev + 1 : 0));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : filteredResults.length - 1));
    } else if (e.key === "Enter" && filteredResults[selectedIndex]) {
      e.preventDefault();
      handleSelect(filteredResults[selectedIndex].href);
    }
  };

  const handleSelect = (href: string) => {
    onClose();
    router.push(href);
  };

  if (!isOpen) return null;

  const categories = [
    "ALL",
    "Algorithms & TDA",
    "Hardware & DAQ",
    "Wave Localization",
    "Girders & Runs",
    "Datasets",
    "Reports & NDT",
    "Architecture & Docs",
  ];

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-20 bg-black/75 backdrop-blur-md px-4 select-none animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-2xl rounded-2xl border border-border bg-[#141419] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150 flex flex-col max-h-[82vh]"
        onClick={(e) => e.stopPropagation()}
        onKeyDown={handleKeyDown}
      >
        {/* Search Bar Input */}
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-border/80 bg-muted/20">
          <Search className="h-4 w-4 text-primary shrink-0" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Search Takens, Betti, BOCD, Girders, R15α, Lamb wave, APIs, Reports..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none font-sans"
          />
          {query && (
            <button
              onClick={() => setQuery("")}
              className="p-1 rounded text-muted-foreground hover:text-foreground cursor-pointer"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
          <kbd className="hidden sm:inline-flex items-center px-1.5 py-0.5 rounded border border-border text-[10px] font-mono text-muted-foreground bg-muted/40">
            ESC
          </kbd>
        </div>

        {/* Category Filter Pills */}
        <div className="flex items-center gap-1.5 px-4 py-2 border-b border-border/40 overflow-x-auto text-[11px] font-mono bg-[#111116] shrink-0">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-2.5 py-1 rounded-md whitespace-nowrap transition-colors cursor-pointer ${
                selectedCategory === cat
                  ? "bg-[#FF5500] text-white font-bold"
                  : "bg-muted/30 text-muted-foreground hover:text-foreground border border-border/50"
              }`}
            >
              {cat === "ALL" ? "All Results" : cat}
            </button>
          ))}
        </div>

        {/* Results List */}
        <div className="flex-1 overflow-y-auto p-2 space-y-1 divide-y divide-border/20">
          {filteredResults.length === 0 ? (
            <div className="py-12 text-center space-y-2">
              <Search className="h-6 w-6 text-muted-foreground/40 mx-auto" />
              <p className="text-sm font-medium text-foreground">No matching system nodes found</p>
              <p className="text-xs text-muted-foreground font-mono">
                Try searching &ldquo;Takens&rdquo;, &ldquo;Betti&rdquo;, &ldquo;BOCD&rdquo;, &ldquo;R15α&rdquo;, &ldquo;Lamb&rdquo;, &ldquo;Girder G2&rdquo;
              </p>
            </div>
          ) : (
            filteredResults.map((item, idx) => {
              const Icon = item.icon;
              const isSelected = idx === selectedIndex;

              return (
                <div
                  key={item.id}
                  onClick={() => handleSelect(item.href)}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`flex items-start justify-between gap-3 p-3 rounded-xl cursor-pointer transition-all ${
                    isSelected
                      ? "bg-[#FF5500]/10 border border-[#FF5500]/50"
                      : "hover:bg-muted/30 border border-transparent"
                  }`}
                >
                  <div className="flex items-start gap-3 min-w-0">
                    <div
                      className={`p-2 rounded-lg shrink-0 mt-0.5 ${
                        isSelected
                          ? "bg-[#FF5500] text-white"
                          : "bg-muted/60 text-muted-foreground border border-border"
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                    </div>

                    <div className="min-w-0 space-y-0.5">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span
                          className={`text-xs font-bold font-sans ${
                            isSelected ? "text-primary" : "text-foreground"
                          }`}
                        >
                          {item.title}
                        </span>
                        {item.tag && (
                          <Badge
                            variant="outline"
                            className="text-[9px] font-mono px-1.5 py-0 border-border text-muted-foreground bg-muted/30"
                          >
                            {item.tag}
                          </Badge>
                        )}
                      </div>

                      <p className="text-[11px] text-muted-foreground line-clamp-1 leading-snug">
                        {item.description}
                      </p>

                      <div className="flex items-center gap-2 pt-0.5 text-[10px] font-mono text-zinc-500">
                        <span className="text-primary/80 uppercase font-semibold">{item.category}</span>
                        <span>&bull;</span>
                        <span className="truncate">{item.href}</span>
                      </div>
                    </div>
                  </div>

                  <ArrowRight
                    className={`h-4 w-4 shrink-0 transition-opacity mt-2.5 ${
                      isSelected ? "text-primary opacity-100" : "opacity-0"
                    }`}
                  />
                </div>
              );
            })
          )}
        </div>

        {/* Footer Navigation Hints */}
        <div className="px-4 py-2.5 border-t border-border/60 bg-[#111116] flex items-center justify-between text-[11px] font-mono text-muted-foreground shrink-0">
          <div className="flex items-center gap-3">
            <span>&uarr; &darr; to navigate</span>
            <span>&bull;</span>
            <span>Enter to select</span>
          </div>
          <span className="text-primary font-semibold">
            {filteredResults.length} indexed system destinations
          </span>
        </div>
      </div>
    </div>
  );
}
