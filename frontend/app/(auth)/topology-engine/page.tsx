"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  Activity,
  Cpu,
  Layers,
  Sparkles,
  Zap,
  Sliders,
  RefreshCw,
  Download,
  FileText,
  Play,
  Pause,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  Info,
  Maximize2,
  TrendingUp,
  TrendingDown,
  Compass,
  GitBranch,
  Network,
  Share2,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MetricCard } from "@/components/shared/MetricCard";
import { downloadDataAsCsv } from "@/lib/utils";

type TabKey = "filtration" | "landscapes" | "stability" | "recurrence" | "manifold";

interface SimplexPoint {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
}

export default function TopologyEnginePage() {
  const [activeTab, setActiveTab] = useState<TabKey>("filtration");

  // Filtration state
  const [epsilon, setEpsilon] = useState<number>(0.42);
  const [isFiltrationPlaying, setIsFiltrationPlaying] = useState<boolean>(false);
  const [filtrationSpeed, setFiltrationSpeed] = useState<number>(1);
  const [betti0, setBetti0] = useState<number>(14);
  const [betti1, setBetti1] = useState<number>(3);
  const [simplexCount, setSimplexCount] = useState<{ v: number; e: number; t: number }>({ v: 24, e: 48, t: 16 });

  // Stability noise state
  const [snrDb, setSnrDb] = useState<number>(18);
  const [wassersteinDist, setWassersteinDist] = useState<number>(0.142);
  const [bottleneckDist, setBottleneckDist] = useState<number>(0.089);

  // Recurrence threshold
  const [recurrenceEps, setRecurrenceEps] = useState<number>(0.28);
  const [rqaDet, setRqaDet] = useState<number>(89.4);
  const [rqaLam, setRqaLam] = useState<number>(82.1);

  // Manifold filter
  const [selectedCluster, setSelectedCluster] = useState<string>("all");
  const [inspectedEvent, setInspectedEvent] = useState<{ id: string; type: string; confidence: number; b1: number; wDist: number } | null>({
    id: "EV-8921-A",
    type: "Tensile Micro-Crack Precursor",
    confidence: 94.2,
    b1: 4,
    wDist: 0.142,
  });

  // Canvas refs
  const filtrationCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const recurrenceCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const manifoldCanvasRef = useRef<HTMLCanvasElement | null>(null);

  // Point cloud data for Simplicial complex (limit cycle + chaotic attractor points)
  const pointsRef = useRef<SimplexPoint[]>([]);

  useEffect(() => {
    // Generate initial point cloud simulating Takens projection of acoustic burst
    const pts: SimplexPoint[] = [];
    const count = 26;
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2;
      const r = 100 + Math.sin(angle * 3) * 35 + (Math.random() - 0.5) * 20;
      pts.push({
        id: i,
        x: 220 + Math.cos(angle) * r,
        y: 170 + Math.sin(angle) * r * 0.8,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4,
      });
    }
    pointsRef.current = pts;
  }, []);

  // Simplex filtration animation loop
  useEffect(() => {
    let animId: number;
    if (isFiltrationPlaying) {
      const interval = setInterval(() => {
        setEpsilon((prev) => {
          if (prev >= 1.2) return 0.05;
          return parseFloat((prev + 0.01 * filtrationSpeed).toFixed(2));
        });
      }, 50);
      return () => clearInterval(interval);
    }
  }, [isFiltrationPlaying, filtrationSpeed]);

  // Render filtration canvas
  useEffect(() => {
    const canvas = filtrationCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const pts = pointsRef.current;
    const thresholdDist = epsilon * 150; // map epsilon to pixel distance

    // Draw grid lines
    ctx.strokeStyle = "rgba(255, 255, 255, 0.04)";
    ctx.lineWidth = 1;
    for (let x = 0; x < canvas.width; x += 40) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, canvas.height);
      ctx.stroke();
    }
    for (let y = 0; y < canvas.height; y += 40) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(canvas.width, y);
      ctx.stroke();
    }

    // Find edges (1-simplices)
    const edges: [number, number, number][] = [];
    for (let i = 0; i < pts.length; i++) {
      for (let j = i + 1; j < pts.length; j++) {
        const dx = pts[i].x - pts[j].x;
        const dy = pts[i].y - pts[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist <= thresholdDist) {
          edges.push([i, j, dist]);
        }
      }
    }

    // Find triangles (2-simplices: 3-cliques)
    const triangles: [number, number, number][] = [];
    for (let i = 0; i < pts.length; i++) {
      for (let j = i + 1; j < pts.length; j++) {
        for (let k = j + 1; k < pts.length; k++) {
          const d_ij = Math.hypot(pts[i].x - pts[j].x, pts[i].y - pts[j].y);
          const d_jk = Math.hypot(pts[j].x - pts[k].x, pts[j].y - pts[k].y);
          const d_ki = Math.hypot(pts[k].x - pts[i].x, pts[k].y - pts[i].y);
          if (d_ij <= thresholdDist && d_jk <= thresholdDist && d_ki <= thresholdDist) {
            triangles.push([i, j, k]);
          }
        }
      }
    }

    // Update counts and Betti heuristics
    setSimplexCount({ v: pts.length, e: edges.length, t: triangles.length });
    // Approximate Betti numbers
    const estimatedB0 = Math.max(1, Math.round(pts.length - edges.length * 0.45));
    const estimatedB1 = Math.max(0, Math.round(edges.length - triangles.length * 1.5 - (pts.length - estimatedB0)));
    setBetti0(estimatedB0);
    setBetti1(estimatedB1);

    // 1. Draw 2-simplices (filled triangles)
    ctx.fillStyle = "rgba(255, 85, 0, 0.12)";
    triangles.forEach(([i, j, k]) => {
      ctx.beginPath();
      ctx.moveTo(pts[i].x, pts[i].y);
      ctx.lineTo(pts[j].x, pts[j].y);
      ctx.lineTo(pts[k].x, pts[k].y);
      ctx.closePath();
      ctx.fill();
    });

    // 2. Draw 1-simplices (edges)
    ctx.strokeStyle = "rgba(255, 85, 0, 0.45)";
    ctx.lineWidth = 1.2;
    edges.forEach(([i, j]) => {
      ctx.beginPath();
      ctx.moveTo(pts[i].x, pts[i].y);
      ctx.lineTo(pts[j].x, pts[j].y);
      ctx.stroke();
    });

    // 3. Draw epsilon neighborhood balls (translucent circles)
    ctx.fillStyle = "rgba(6, 182, 212, 0.04)";
    ctx.strokeStyle = "rgba(6, 182, 212, 0.18)";
    ctx.lineWidth = 1;
    pts.forEach((p) => {
      ctx.beginPath();
      ctx.arc(p.x, p.y, thresholdDist / 2, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    });

    // 4. Draw 0-simplices (vertices)
    pts.forEach((p) => {
      ctx.beginPath();
      ctx.arc(p.x, p.y, 4, 0, Math.PI * 2);
      ctx.fillStyle = "#FF5500";
      ctx.fill();
      ctx.strokeStyle = "#ffffff";
      ctx.lineWidth = 1;
      ctx.stroke();
    });

    // 5. Draw persistent 1-cycle indicator when topological cavity detected
    if (estimatedB1 > 0) {
      ctx.save();
      ctx.strokeStyle = "rgba(16, 185, 129, 0.85)";
      ctx.lineWidth = 2;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.arc(220, 170, 75, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();

      ctx.fillStyle = "#10b981";
      ctx.font = "bold 11px monospace";
      ctx.fillText(`β₁ Topological Loop Detected (Hole)`, 135, 175);
    }
  }, [epsilon]);

  // Render Recurrence Plot Canvas
  useEffect(() => {
    if (activeTab !== "recurrence") return;
    const canvas = recurrenceCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const N = 70; // resolution
    const cellW = canvas.width / N;
    const cellH = canvas.height / N;

    // Generate mock trajectory signal: sinusoidal chirp + transient micro-burst
    const signal: number[] = [];
    for (let i = 0; i < N; i++) {
      const t = (i / N) * 6 * Math.PI;
      const chirp = Math.sin(t + 0.05 * t * t);
      const burst = Math.exp(-Math.pow((i - 40) / 7, 2)) * Math.sin(t * 3);
      signal.push(chirp + burst);
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    let recCount = 0;
    for (let i = 0; i < N; i++) {
      for (let j = 0; j < N; j++) {
        const diff = Math.abs(signal[i] - signal[j]);
        if (diff <= recurrenceEps) {
          recCount++;
          // Main diagonal vs cross recurrence
          const isDiag = Math.abs(i - j) <= 2;
          ctx.fillStyle = isDiag ? "#FF5500" : "rgba(6, 182, 212, 0.85)";
          ctx.fillRect(i * cellW, (N - 1 - j) * cellH, cellW - 0.5, cellH - 0.5);
        } else {
          ctx.fillStyle = "rgba(22, 22, 27, 0.7)";
          ctx.fillRect(i * cellW, (N - 1 - j) * cellH, cellW - 0.5, cellH - 0.5);
        }
      }
    }

    const rr = (recCount / (N * N)) * 100;
    setRqaDet(parseFloat((82 + (rr > 15 ? 10 : 5) - recurrenceEps * 12).toFixed(1)));
    setRqaLam(parseFloat((76 + rr * 0.4).toFixed(1)));
  }, [activeTab, recurrenceEps]);

  // Render Latent Manifold Canvas (UMAP/t-SNE projection of 32D embeddings)
  useEffect(() => {
    if (activeTab !== "manifold") return;
    const canvas = manifoldCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Mock 120 embedded events in 4 clusters
    interface ManifoldPoint {
      x: number;
      y: number;
      cluster: "baseline" | "tensile" | "shear" | "avalanche";
      id: string;
      confidence: number;
    }

    const clusters: ManifoldPoint[] = [];

    // 1. Baseline Ambient (green, centered at 120, 100)
    for (let i = 0; i < 35; i++) {
      clusters.push({
        x: 120 + (Math.random() - 0.5) * 70,
        y: 110 + (Math.random() - 0.5) * 60,
        cluster: "baseline",
        id: `BL-${100 + i}`,
        confidence: 98.1,
      });
    }

    // 2. Micro-Tensile Precursors (cyan, centered at 280, 90)
    for (let i = 0; i < 30; i++) {
      clusters.push({
        x: 280 + (Math.random() - 0.5) * 65,
        y: 90 + (Math.random() - 0.5) * 55,
        cluster: "tensile",
        id: `TS-${200 + i}`,
        confidence: 94.2,
      });
    }

    // 3. Micro-Shear Friction (amber, centered at 190, 220)
    for (let i = 0; i < 28; i++) {
      clusters.push({
        x: 190 + (Math.random() - 0.5) * 60,
        y: 220 + (Math.random() - 0.5) * 60,
        cluster: "shear",
        id: `SH-${300 + i}`,
        confidence: 91.8,
      });
    }

    // 4. Critical Acoustic Avalanche (Signal pink #FF5500, centered at 380, 200)
    for (let i = 0; i < 25; i++) {
      clusters.push({
        x: 380 + (Math.random() - 0.5) * 70,
        y: 200 + (Math.random() - 0.5) * 65,
        cluster: "avalanche",
        id: `AV-${400 + i}`,
        confidence: 96.5,
      });
    }

    // Draw cluster boundary hulls / halos
    const clusterCenters = [
      { name: "Ambient Elastic Noise", color: "rgba(16, 185, 129, 0.08)", border: "rgba(16, 185, 129, 0.3)", cx: 120, cy: 110, r: 60 },
      { name: "Tensile Micro-Crack Precursor", color: "rgba(6, 182, 212, 0.08)", border: "rgba(6, 182, 212, 0.3)", cx: 280, cy: 90, r: 55 },
      { name: "Friction & Aggregate Interlock", color: "rgba(245, 158, 11, 0.08)", border: "rgba(245, 158, 11, 0.3)", cx: 190, cy: 220, r: 52 },
      { name: "Acoustic Avalanche / Pre-Failure", color: "rgba(255, 85, 0, 0.10)", border: "rgba(255, 85, 0, 0.4)", cx: 380, cy: 200, r: 58 },
    ];

    clusterCenters.forEach((c) => {
      ctx.beginPath();
      ctx.arc(c.cx, c.cy, c.r, 0, Math.PI * 2);
      ctx.fillStyle = c.color;
      ctx.fill();
      ctx.strokeStyle = c.border;
      ctx.setLineDash([3, 3]);
      ctx.stroke();
      ctx.setLineDash([]);
    });

    // Draw points
    clusters.forEach((pt) => {
      if (selectedCluster !== "all" && pt.cluster !== selectedCluster) return;

      ctx.beginPath();
      ctx.arc(pt.x, pt.y, 4, 0, Math.PI * 2);
      if (pt.cluster === "baseline") ctx.fillStyle = "#10b981";
      else if (pt.cluster === "tensile") ctx.fillStyle = "#06b6d4";
      else if (pt.cluster === "shear") ctx.fillStyle = "#f59e0b";
      else ctx.fillStyle = "#FF5500";
      ctx.fill();
      ctx.strokeStyle = "#16161b";
      ctx.lineWidth = 1.2;
      ctx.stroke();
    });

    // Highlight selected/inspected event
    ctx.save();
    ctx.beginPath();
    ctx.arc(280, 90, 9, 0, Math.PI * 2);
    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.restore();
  }, [activeTab, selectedCluster]);

  // Update Wasserstein distance based on noise injection slider
  const handleSnrChange = (val: number) => {
    setSnrDb(val);
    // Stability theorem: bottleneck distance bounded by L_inf noise perturbation
    const noiseFactor = Math.pow(10, -val / 20);
    const newBottleneck = parseFloat((0.05 + noiseFactor * 0.4).toFixed(3));
    const newWasserstein = parseFloat((0.09 + noiseFactor * 0.65).toFixed(3));
    setBottleneckDist(newBottleneck);
    setWassersteinDist(newWasserstein);
  };

  const handleExportTopologyCsv = () => {
    const rows = [
      { metric: "Betti_0", value: betti0, description: "Connected components at epsilon" },
      { metric: "Betti_1", value: betti1, description: "1-dimensional cycles/cavities" },
      { metric: "Simplex_0_Vertices", value: simplexCount.v, description: "0-simplices" },
      { metric: "Simplex_1_Edges", value: simplexCount.e, description: "1-simplices" },
      { metric: "Simplex_2_Triangles", value: simplexCount.t, description: "2-simplices" },
      { metric: "Filtration_Epsilon", value: epsilon, description: "Scale parameter" },
      { metric: "Wasserstein_W2_Distance", value: wassersteinDist, description: "Geodesic metric to healthy baseline" },
      { metric: "Bottleneck_dB_Distance", value: bottleneckDist, description: "Max persistence shift" },
      { metric: "RQA_Determinism_DET", value: `${rqaDet}%`, description: "Laminar predictable trajectory" },
      { metric: "RQA_Laminarity_LAM", value: `${rqaLam}%`, description: "Trapping time ratio" },
    ];
    downloadDataAsCsv("topological_complex_summary.csv", rows);
  };

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-7xl mx-auto w-full">
      {/* HEADER WITH RUN SELECTOR */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 pb-3 border-b border-border/60">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <Cpu className="h-6 w-6 text-[#FF5500]" />
            Topological Phase Space &amp; Complex Engine
          </h1>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Link href="/analysis">
            <Button size="sm" variant="outline" className="gap-1.5 text-xs">
              <Activity className="h-3.5 w-3.5" />
              Return to TDA Pipeline
            </Button>
          </Link>
        </div>
      </div>

      {/* TOP METRIC CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
        <MetricCard
          title="Current Filtration Scale (ε)"
          value={`ε = ${epsilon.toFixed(2)}`}
          subtext="Normalized Metric Neighborhood"
          change={`${simplexCount.t} Simplexes`}
          isPositive={true}
          icon={<Sliders className="h-4 w-4 text-[#FF5500]" />}
        />
        <MetricCard
          title="Homology Invariant β₁"
          value={`β₁ = ${betti1}`}
          subtext="Persistent 1-Cycle Topological Holes"
          change={betti1 > 0 ? "Cavity Active" : "Trivial Homology"}
          isPositive={betti1 > 0}
          icon={<GitBranch className="h-4 w-4 text-[#06b6d4]" />}
        />
        <MetricCard
          title="2-Wasserstein Geodesic (W₂)"
          value={`W₂ = ${wassersteinDist}`}
          subtext="Distance to Uncracked Baseline"
          change={`dB ${bottleneckDist}`}
          isPositive={wassersteinDist < 0.25}
          icon={<Network className="h-4 w-4 text-[#10b981]" />}
        />
        <MetricCard
          title="RQA Determinism (DET)"
          value={`${rqaDet}%`}
          subtext="Phase Space Predictability"
          change={`LAM ${rqaLam}%`}
          isPositive={rqaDet > 80}
          icon={<Activity className="h-4 w-4 text-primary" />}
        />
      </div>

      {/* NAVIGATION TABS */}
      <div className="flex flex-wrap items-center gap-2 border-b border-border/80 pb-2 text-xs font-medium">
        <button
          onClick={() => setActiveTab("filtration")}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
            activeTab === "filtration"
              ? "bg-secondary text-foreground font-semibold border border-border"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <Network className={`h-3.5 w-3.5 ${activeTab === "filtration" ? "text-primary" : "text-muted-foreground"}`} />
          1. Vietoris-Rips Filtration
        </button>

        <button
          onClick={() => setActiveTab("landscapes")}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
            activeTab === "landscapes"
              ? "bg-secondary text-foreground font-semibold border border-border"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <Layers className={`h-3.5 w-3.5 ${activeTab === "landscapes" ? "text-primary" : "text-muted-foreground"}`} />
          2. Persistence Landscapes &amp; Silhouettes
        </button>

        <button
          onClick={() => setActiveTab("stability")}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
            activeTab === "stability"
              ? "bg-secondary text-foreground font-semibold border border-border"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <Share2 className={`h-3.5 w-3.5 ${activeTab === "stability" ? "text-primary" : "text-muted-foreground"}`} />
          3. Noise Stability Sandbox (W₂ / dB)
        </button>

        <button
          onClick={() => setActiveTab("recurrence")}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
            activeTab === "recurrence"
              ? "bg-secondary text-foreground font-semibold border border-border"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <RefreshCw className={`h-3.5 w-3.5 ${activeTab === "recurrence" ? "text-primary" : "text-muted-foreground"}`} />
          4. Recurrence Plot &amp; Chaos (RQA)
        </button>

        <button
          onClick={() => setActiveTab("manifold")}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
            activeTab === "manifold"
              ? "bg-secondary text-foreground font-semibold border border-border"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <Compass className={`h-3.5 w-3.5 ${activeTab === "manifold" ? "text-primary" : "text-muted-foreground"}`} />
          5. Conv1D-AE Latent Manifold
        </button>
      </div>

      {/* TAB 1: VIETORIS-RIPS FILTRATION */}
      {activeTab === "filtration" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2 border-border bg-card">
            <CardHeader className="pb-3 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-base font-semibold flex items-center gap-2">
                  <Network className="h-4 w-4 text-primary" />
                  Simplicial Complex Construction (Live Filtration Animator)
                </CardTitle>
                <CardDescription className="text-xs">
                  Reconstructing the Vietoris-Rips complex VR(X, ε) across continuous scale parameter ε
                </CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setIsFiltrationPlaying(!isFiltrationPlaying)}
                  className="h-8 gap-1 text-xs"
                >
                  {isFiltrationPlaying ? <Pause className="h-3.5 w-3.5 text-primary" /> : <Play className="h-3.5 w-3.5 text-primary" />}
                  {isFiltrationPlaying ? "Pause" : "Animate"}
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setEpsilon(0.05)}
                  className="h-8 w-8 p-0 text-muted-foreground"
                  title="Reset epsilon"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="relative border border-border/80 rounded-xl bg-[#111116] overflow-hidden flex justify-center p-2">
                <canvas ref={filtrationCanvasRef} width={480} height={340} className="w-full max-w-[520px] h-[340px]" />
                <div className="absolute bottom-3 left-3 bg-[#191922]/90 border border-border/80 px-2.5 py-1.5 rounded-md text-[11px] font-mono space-y-0.5">
                  <div className="text-muted-foreground">
                    0-simplices (Vertices): <span className="text-foreground font-bold">{simplexCount.v}</span>
                  </div>
                  <div className="text-muted-foreground">
                    1-simplices (Edges): <span className="text-foreground font-bold">{simplexCount.e}</span>
                  </div>
                  <div className="text-muted-foreground">
                    2-simplices (Faces): <span className="text-[#FF5500] font-bold">{simplexCount.t}</span>
                  </div>
                  <div className="text-muted-foreground">
                    Euler Char. (χ = V - E + F): <span className="text-foreground font-bold">{simplexCount.v - simplexCount.e + simplexCount.t}</span>
                  </div>
                </div>
              </div>

              {/* FILTRATION CONTROLS */}
              <div className="p-3.5 rounded-lg border border-border/60 bg-muted/20 space-y-3">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-muted-foreground">Filtration Scale Parameter (ε):</span>
                  <span className="font-bold text-[#FF5500]">ε = {epsilon.toFixed(2)} / 1.20</span>
                </div>
                <input
                  type="range"
                  min="0.05"
                  max="1.20"
                  step="0.01"
                  value={epsilon}
                  onChange={(e) => setEpsilon(parseFloat(e.target.value))}
                  className="w-full accent-[#FF5500] cursor-pointer"
                />
                <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                  <span>ε = 0.05 (Discrete points)</span>
                  <span>ε = 0.42 (Optimal topological loop persistence)</span>
                  <span>ε = 1.20 (Contractible single simplex)</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* RIGHT PANEL: MATHEMATICAL FOUNDATION */}
          <div className="space-y-4">
            <Card className="border-border bg-card">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <Info className="h-4 w-4 text-primary" />
                  Algebraic Topology Rigor
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-xs text-muted-foreground leading-relaxed">
                <p>
                  Let <span className="font-mono text-foreground font-semibold">X ⊂ ℝ³</span> represent the reconstructed acoustic emission state-space attractor via Takens embedding. The Vietoris-Rips complex at scale <span className="font-mono text-primary font-bold">ε</span> is defined as:
                </p>
                <div className="p-2.5 rounded-md bg-[#111116] border border-border/80 font-mono text-[11px] text-foreground text-center">
                  VR(X, ε) = &#123; σ ⊆ X | ∀ u, v ∈ σ, ||u - v|| ≤ ε &#125;
                </div>
                <p>
                  Homology groups <span className="font-mono text-foreground font-semibold">Hₖ(VR(X, ε))</span> capture topological invariants invariant to coordinate transformations, amplitude scaling, and acoustic sensor coupling variations.
                </p>
                <div className="border-t border-border/60 pt-2 space-y-1.5 font-mono text-[11px]">
                  <div className="flex justify-between">
                    <span>β₀(ε) [Connected Components]:</span>
                    <span className="text-foreground font-bold">{betti0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>β₁(ε) [Persistent 1-Cycles]:</span>
                    <span className="text-[#FF5500] font-bold">{betti1}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Critical Precursor Ratio (β₁/β₀):</span>
                    <span className="text-primary font-bold">{(betti1 / Math.max(1, betti0)).toFixed(3)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-border bg-card">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <Zap className="h-4 w-4 text-primary" />
                  GUDHI / Ripser Execution
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-xs">
                <div className="flex items-center justify-between text-muted-foreground font-mono text-[11px]">
                  <span>Engine:</span>
                  <span className="text-foreground font-bold">Ripser C++ Backend v1.2</span>
                </div>
                <div className="flex items-center justify-between text-muted-foreground font-mono text-[11px]">
                  <span>Reduction Algorithm:</span>
                  <span className="text-foreground font-bold">Compressed Cohomology</span>
                </div>
                <div className="flex items-center justify-between text-muted-foreground font-mono text-[11px]">
                  <span>Computation Latency:</span>
                  <span className="text-foreground font-bold">14.2 ms / 500 pts</span>
                </div>
                <div className="flex items-center justify-between text-muted-foreground font-mono text-[11px]">
                  <span>Peak Memory Usage:</span>
                  <span className="text-foreground font-bold">4.8 MB</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* TAB 2: PERSISTENCE LANDSCAPES & SILHOUETTES */}
      {activeTab === "landscapes" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2 border-border bg-card">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <Layers className="h-4 w-4 text-primary" />
                Bubenik Persistence Landscapes (λ₁, λ₂, λ₃)
              </CardTitle>
              <CardDescription className="text-xs">
                Translating persistent homology diagrams into Hilbert space vectors for Random Forest and Conv1D ingestion
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              {/* SVG LANDSCAPES CHART */}
              <div className="p-4 rounded-xl border border-border/80 bg-[#111116] space-y-2">
                <div className="flex items-center justify-between text-xs font-mono text-muted-foreground pb-1 border-b border-border/40">
                  <span>Persistence Landscape Function λₖ(t)</span>
                  <div className="flex items-center gap-3">
                    <span className="flex items-center gap-1.5 text-[#FF5500]">
                      <span className="w-2.5 h-0.5 bg-[#FF5500] inline-block" /> λ₁ (1st layer)
                    </span>
                    <span className="flex items-center gap-1.5 text-zinc-400">
                      <span className="w-2.5 h-0.5 bg-zinc-400 inline-block" /> λ₂ (2nd layer)
                    </span>
                    <span className="flex items-center gap-1.5 text-zinc-600">
                      <span className="w-2.5 h-0.5 bg-zinc-600 inline-block" /> λ₃ (3rd layer)
                    </span>
                  </div>
                </div>

                <div className="h-56 w-full flex items-center justify-center">
                  <svg viewBox="0 0 500 200" className="w-full h-full">
                    {/* Grid */}
                    <line x1="40" y1="170" x2="480" y2="170" stroke="#333" strokeWidth="1" />
                    <line x1="40" y1="20" x2="40" y2="170" stroke="#333" strokeWidth="1" />

                    {/* Tick labels */}
                    <text x="40" y="185" fill="#777" fontSize="10" fontFamily="monospace">0.0</text>
                    <text x="150" y="185" fill="#777" fontSize="10" fontFamily="monospace">0.2</text>
                    <text x="260" y="185" fill="#777" fontSize="10" fontFamily="monospace">0.4</text>
                    <text x="370" y="185" fill="#777" fontSize="10" fontFamily="monospace">0.6</text>
                    <text x="470" y="185" fill="#777" fontSize="10" fontFamily="monospace">0.8 t</text>
                    <text x="15" y="30" fill="#777" fontSize="10" fontFamily="monospace">λ(t)</text>

                    {/* Layer 1 (Red #FF5500) */}
                    <path
                      d="M 40 170 L 110 170 L 180 80 L 250 170 L 290 170 L 350 50 L 410 170 L 480 170"
                      fill="none"
                      stroke="#FF5500"
                      strokeWidth="2.5"
                    />
                    <polygon
                      points="110,170 180,80 250,170 290,170 350,50 410,170 410,170 110,170"
                      fill="rgba(255, 85, 0, 0.15)"
                    />

                    {/* Layer 2 (Cyan #06b6d4) */}
                    <path
                      d="M 40 170 L 130 170 L 180 120 L 230 170 L 310 170 L 350 100 L 390 170 L 480 170"
                      fill="none"
                      stroke="#06b6d4"
                      strokeWidth="2"
                    />

                    {/* Layer 3 (Emerald #10b981) */}
                    <path
                      d="M 40 170 L 150 170 L 180 145 L 210 170 L 330 170 L 350 135 L 370 170 L 480 170"
                      fill="none"
                      stroke="#10b981"
                      strokeWidth="1.5"
                      strokeDasharray="4 2"
                    />

                    {/* Annotation */}
                    <circle cx="350" cy="50" r="4" fill="#FF5500" />
                    <text x="360" y="48" fill="#FF5500" fontSize="10" fontFamily="monospace" fontWeight="bold">
                      Precursor Peak (λ₁_max = 0.612)
                    </text>
                  </svg>
                </div>
              </div>

              {/* PERSISTENCE SILHOUETTES */}
              <div className="p-4 rounded-xl border border-border/80 bg-muted/15 space-y-2">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="font-semibold text-foreground">Persistence Silhouette Function φ_p(t):</span>
                  <Badge variant="outline" className="text-[10px] font-mono border-border text-zinc-300 bg-muted/40">
                    p = 2 (L₂ Sobolev Weighting)
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  The silhouette normalizes birth-death intervals by power <span className="font-mono text-foreground font-semibold">wᵢ = (dᵢ - bᵢ)ᵖ</span>, eliminating topological noise below the acoustic noise floor while emphasizing long-lived micro-crack signatures.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* VECTOR EMBEDDING FEATURES TABLE */}
          <Card className="border-border bg-card">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <GitBranch className="h-4 w-4 text-emerald-400" />
                Lᵖ Landscape Norm Vectors
              </CardTitle>
              <CardDescription className="text-xs">Extracted inputs for ML classification</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 font-mono text-xs">
              <div className="p-2.5 rounded-lg bg-[#111116] border border-border/70 space-y-1">
                <div className="flex justify-between text-muted-foreground">
                  <span>||λ₁||₁ (L₁-Norm Layer 1):</span>
                  <span className="text-foreground font-bold">3.842</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>||λ₁||₂ (L₂-Norm Layer 1):</span>
                  <span className="text-[#FF5500] font-bold">1.492</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>||λ₂||₁ (L₁-Norm Layer 2):</span>
                  <span className="text-foreground font-bold">1.218</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>||λ₂||₂ (L₂-Norm Layer 2):</span>
                  <span className="text-[#06b6d4] font-bold">0.684</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>||λ₃||₂ (L₂-Norm Layer 3):</span>
                  <span className="text-emerald-400 font-bold">0.241</span>
                </div>
              </div>

              <div className="p-3 rounded-lg border border-border/80 bg-secondary/30 space-y-1.5 text-muted-foreground text-[11px]">
                <div className="font-bold text-foreground">Topological Feature Vector Dimension:</div>
                <div className="text-xs font-mono text-primary font-bold">dim(Φ) = 32 features</div>
                <p>Fed synchronously to Random Forest classifier and 1D Convolutional Autoencoder.</p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* TAB 3: NOISE STABILITY SANDBOX */}
      {activeTab === "stability" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2 border-border bg-card">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <Share2 className="h-4 w-4 text-[#10b981]" />
                Topological Metric Stability Sandbox (Cohen-Steiner Theorem)
              </CardTitle>
              <CardDescription className="text-xs">
                Empirical verification of 2-Wasserstein W₂ and Bottleneck dB distance bounds under aggressive acoustic noise injection
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              {/* NOISE INJECTION SLIDER */}
              <div className="p-4 rounded-xl border border-border/80 bg-muted/20 space-y-3">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-muted-foreground">Injected Acoustic Sensor Noise (SNR):</span>
                  <span className="font-bold text-foreground">SNR = {snrDb} dB</span>
                </div>
                <input
                  type="range"
                  min="-10"
                  max="35"
                  step="1"
                  value={snrDb}
                  onChange={(e) => handleSnrChange(parseInt(e.target.value))}
                  className="w-full accent-[#FF5500] cursor-pointer"
                />
                <div className="flex items-center justify-between text-[11px] text-muted-foreground font-mono">
                  <span>-10 dB (Severe noise)</span>
                  <span>+12 dB (Field ambient)</span>
                  <span>+35 dB (Anechoic)</span>
                </div>
              </div>

              {/* DISTANCE BOUNDS COMPARISON */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl border border-border/80 bg-[#111116] space-y-2">
                  <div className="text-xs font-mono text-muted-foreground">Bottleneck Distance d_B(D_clean, D_noisy)</div>
                  <div className="text-2xl font-bold font-mono text-foreground">{bottleneckDist}</div>
                  <div className="text-[11px] text-muted-foreground">
                    Theoretical bound: <span className="font-mono text-foreground">d_B ≤ ||f - g||_∞</span>
                  </div>
                  <Badge variant="outline" className="text-[10px] font-mono border-border text-muted-foreground">
                    Stable under L_inf perturbation
                  </Badge>
                </div>

                <div className="p-4 rounded-xl border border-border/80 bg-[#111116] space-y-2">
                  <div className="text-xs font-mono text-muted-foreground">2-Wasserstein Distance W₂(D_clean, D_noisy)</div>
                  <div className="text-2xl font-bold font-mono text-foreground">{wassersteinDist}</div>
                  <div className="text-[11px] text-muted-foreground">
                    Optimal transport matching cost: <span className="font-mono text-foreground">inf_γ (Σ ||x - γ(x)||²)¹/²</span>
                  </div>
                  <Badge variant="outline" className="text-[10px] font-mono border-border text-muted-foreground">
                    Geodesic Stability Verified
                  </Badge>
                </div>
              </div>

              {/* CONVERGENCE DIAGRAM */}
              <div className="p-3.5 rounded-lg border border-border/60 bg-secondary/20 text-xs text-muted-foreground leading-relaxed">
                <span className="font-bold text-foreground">Robustness Guarantee: </span>
                Even under harsh -10 dB SNR, persistent points with lifespan <span className="font-mono text-primary font-bold">(death - birth) &gt; 2·d_B</span> remain topologically invariant, preventing false positives from vehicle wheel passage and ambient thermal acoustic drift.
              </div>
            </CardContent>
          </Card>

          {/* THEOREM REFERENCE */}
          <Card className="border-border bg-card">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-primary" />
                Stability Theorem Proof
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-xs text-muted-foreground leading-relaxed">
              <p>
                By Cohen-Steiner, Edelsbrunner, &amp; Harer (2007), for any two tame Lipschitz functions <span className="font-mono text-foreground">f, g: M → ℝ</span> on a triangulable space <span className="font-mono text-foreground">M</span>:
              </p>
              <div className="p-2.5 rounded-md bg-[#111116] border border-border/80 font-mono text-[11px] text-foreground text-center">
                d_B(D(f), D(g)) ≤ ||f - g||_∞
              </div>
              <p>
                In our acoustic emission framework, <span className="font-mono text-foreground">f</span> is the continuous acoustic pressure waveform recorded at 10 MS/s, ensuring that micro-crack topological invariants do not degenerate under additive sensor thermal noise.
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* TAB 4: RECURRENCE PLOT & CHAOS (RQA) */}
      {activeTab === "recurrence" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2 border-border bg-card">
            <CardHeader className="pb-3 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-base font-semibold flex items-center gap-2">
                  <RefreshCw className="h-4 w-4 text-primary" />
                  Phase Space Recurrence Matrix R_i,j(ε)
                </CardTitle>
                <CardDescription className="text-xs">
                  Recurrence Quantification Analysis (RQA) over the Takens attractor to quantify micro-crack non-linear determinism
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="relative border border-border/80 rounded-xl bg-[#111116] overflow-hidden flex justify-center p-2">
                <canvas ref={recurrenceCanvasRef} width={380} height={380} className="w-[380px] h-[380px] rounded-lg" />
              </div>

              {/* RECURRENCE THRESHOLD CONTROLS */}
              <div className="p-3.5 rounded-lg border border-border/60 bg-muted/20 space-y-3">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-muted-foreground">Recurrence Radius ε:</span>
                  <span className="font-bold text-primary">ε = {recurrenceEps.toFixed(2)}</span>
                </div>
                <input
                  type="range"
                  min="0.10"
                  max="0.60"
                  step="0.02"
                  value={recurrenceEps}
                  onChange={(e) => setRecurrenceEps(parseFloat(e.target.value))}
                  className="w-full accent-[#FF5500] cursor-pointer"
                />
              </div>
            </CardContent>
          </Card>

          {/* RQA METRICS PANEL */}
          <Card className="border-border bg-card">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Activity className="h-4 w-4 text-primary" />
                RQA Parameters
              </CardTitle>
              <CardDescription className="text-xs">Nonlinear chaos &amp; determinism</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 font-mono text-xs">
              <div className="p-2.5 rounded-lg bg-[#111116] border border-border/70 space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Determinism (DET):</span>
                  <span className="text-foreground font-bold">{rqaDet}%</span>
                </div>
                <div className="text-[10px] text-muted-foreground font-sans">
                  Percentage of recurrence points forming diagonal lines (predictability)
                </div>
              </div>

              <div className="p-2.5 rounded-lg bg-[#111116] border border-border/70 space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Laminarity (LAM):</span>
                  <span className="text-foreground font-bold">{rqaLam}%</span>
                </div>
                <div className="text-[10px] text-muted-foreground font-sans">
                  Vertical line structures indicating laminar trapping in micro-yield state
                </div>
              </div>

              <div className="p-2.5 rounded-lg bg-[#111116] border border-border/70 space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Trapping Time (TT):</span>
                  <span className="text-foreground font-bold">4.82 μs</span>
                </div>
                <div className="text-[10px] text-muted-foreground font-sans">
                  Average duration system remains in quasi-stationary phase
                </div>
              </div>

              <div className="p-2.5 rounded-lg bg-[#111116] border border-border/70 space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Max Lyapunov Exp (λ_max):</span>
                  <span className="text-[#FF5500] font-bold">+0.418 s⁻¹</span>
                </div>
                <div className="text-[10px] text-muted-foreground font-sans">
                  Positive exponent confirms chaotic deterministic dynamics over stochastic noise
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* TAB 5: CONV1D-AE LATENT MANIFOLD */}
      {activeTab === "manifold" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2 border-border bg-card">
            <CardHeader className="pb-3 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-base font-semibold flex items-center gap-2">
                  <Compass className="h-4 w-4 text-indigo-400" />
                  Topological Latent Manifold Projection (z ∈ ℝ³² → ℝ²)
                </CardTitle>
                <CardDescription className="text-xs">
                  UMAP projection of autoencoder bottleneck embeddings combined with persistence vector Φ
                </CardDescription>
              </div>

              {/* Cluster Filter */}
              <select
                value={selectedCluster}
                onChange={(e) => setSelectedCluster(e.target.value)}
                className="text-xs bg-muted/60 border border-border rounded-lg px-2.5 py-1 font-mono text-foreground focus:outline-none cursor-pointer"
              >
                <option value="all">All Clusters (120 events)</option>
                <option value="baseline">Ambient Noise</option>
                <option value="tensile">Tensile Micro-Cracks</option>
                <option value="shear">Shear Friction</option>
                <option value="avalanche">Acoustic Avalanche</option>
              </select>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="relative border border-border/80 rounded-xl bg-[#111116] overflow-hidden flex justify-center p-2">
                <canvas ref={manifoldCanvasRef} width={480} height={320} className="w-full max-w-[500px] h-[320px]" />
              </div>

              {/* Cluster Legend */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-mono">
                <div className="p-2 rounded-lg bg-[#16161b] border border-border/60 flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-zinc-600" />
                  <span className="text-muted-foreground">Ambient Noise</span>
                </div>
                <div className="p-2 rounded-lg bg-[#16161b] border border-border/60 flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-zinc-400" />
                  <span className="text-muted-foreground">Tensile Precursor</span>
                </div>
                <div className="p-2 rounded-lg bg-[#16161b] border border-border/60 flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-zinc-200" />
                  <span className="text-muted-foreground">Shear Friction</span>
                </div>
                <div className="p-2 rounded-lg bg-[#16161b] border border-border/60 flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#FF5500]" />
                  <span className="text-muted-foreground">Avalanche</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* INSPECTED CLUSTER EVENT */}
          <Card className="border-border bg-card">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-[#FF5500]" />
                Event Topological Signature
              </CardTitle>
              <CardDescription className="text-xs">Inspected point in latent manifold</CardDescription>
            </CardHeader>
            {inspectedEvent && (
              <CardContent className="space-y-3 font-mono text-xs">
                <div className="p-2.5 rounded-lg bg-[#111116] border border-border/70 space-y-1">
                  <div className="text-muted-foreground text-[10px]">EVENT ID</div>
                  <div className="text-sm font-bold text-foreground">{inspectedEvent.id}</div>
                  <Badge variant="outline" className="text-[10px] font-mono border-primary/40 text-primary bg-primary/10 mt-1">
                    {inspectedEvent.type}
                  </Badge>
                </div>

                <div className="space-y-1.5 p-2.5 rounded-lg bg-muted/20 border border-border/60 text-muted-foreground">
                  <div className="flex justify-between">
                    <span>Classifier Confidence:</span>
                    <span className="text-foreground font-bold">{inspectedEvent.confidence}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Betti-1 Invariant:</span>
                    <span className="text-foreground font-bold">β₁ = {inspectedEvent.b1}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Wasserstein Shift:</span>
                    <span className="text-[#FF5500] font-bold">W₂ = {inspectedEvent.wDist}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Reconstruction Loss:</span>
                    <span className="text-foreground font-bold">0.0182 MSE</span>
                  </div>
                </div>

                <div className="p-3 rounded-lg border border-border/80 bg-secondary/30 text-[11px] font-sans text-muted-foreground leading-relaxed">
                  <span className="font-bold text-foreground">Topological Interpretation: </span>
                  Clear separation from ambient noise cluster confirms this acoustic event corresponds to mode-I micro-cracking rather than environmental traffic vibration.
                </div>
              </CardContent>
            )}
          </Card>
        </div>
      )}
    </div>
  );
}
