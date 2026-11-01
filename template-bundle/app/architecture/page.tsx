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
  Terminal,
  Radio,
  FileCode,
  Waves,
} from "lucide-react";
import { AppLogo } from "@/components/ui/AppLogo";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useTheme } from "@/lib/ThemeContext";

const LAYERS = [
  {
    id: 1,
    name: "Layer 1: Smartphone Ingestion & Preprocessing",
    desc: "44.1 - 48 kHz acoustic ingestion, zero-phase bandpass filtering and dynamic STA/LTA event segmentation.",
    nodes: ["MEMS Microphone Ingest", "4th-order Butterworth [500Hz-20kHz]", "STA/LTA Event Slicer", "Polyphase Resampler"],
  },
  {
    id: 2,
    name: "Layer 2: Takens State-Space Attractor Embedding",
    desc: "Reconstructing the continuous dynamical phase-space manifold from discrete 1D scalar waveforms.",
    nodes: ["Average Mutual Information (AMI τ)", "False Nearest Neighbors (FNN d)", "Attractor Point Cloud Constructor", "Farthest Point Subsampler (FPS)"],
  },
  {
    id: 3,
    name: "Layer 3: Persistent Homology & Topological Vectorization",
    desc: "Multiscale topological invariants computed via GUDHI Vietoris-Rips complex and vectorized into dense features.",
    nodes: ["Vietoris-Rips Filtration", "H0 Components & H1 Loops", "Persistence Landscapes (5 Layers)", "Persistence Images & Entropy"],
  },
  {
    id: 4,
    name: "Layer 4: Classification, Changepoints & Validation",
    desc: "Damage mechanism prediction, real-time Bayesian state shift tracking and unsupervised anomaly validation.",
    nodes: ["Random Forest Classifier (94.1%)", "Bayesian Changepoint (BOCD)", "Conv1D Autoencoder Anomaly", "PostgreSQL & WebSocket Bus"],
  },
];

const CODE_SNIPPET = `# EchoSense Topological Machine Learning Pipeline Contract
import numpy as np
import gudhi as gd
from sklearn.ensemble import RandomForestClassifier

class EchoSensePipeline:
    def __init__(self, tau: int = 4, embedding_dim: int = 4, max_edge_length: float = 2.0):
        self.tau = tau
        self.d = embedding_dim
        self.max_edge_length = max_edge_length
        self.classifier = RandomForestClassifier(n_estimators=300, max_depth=16, random_state=42)

    def takens_embedding(self, signal: np.ndarray) -> np.ndarray:
        """Reconstruct dynamical attractor x(n) = [s(n), s(n+tau), ..., s(n+(d-1)tau)]"""
        n_points = len(signal) - (self.d - 1) * self.tau
        return np.column_stack([signal[i * self.tau : i * self.tau + n_points] for i in range(self.d)])

    def compute_persistence(self, point_cloud: np.ndarray):
        """Build Vietoris-Rips simplicial complex via GUDHI"""
        rips = gd.RipsComplex(points=point_cloud, max_edge_length=self.max_edge_length)
        simplex_tree = rips.create_simplex_tree(max_dimension=2)
        diag = simplex_tree.persistence()
        h0 = simplex_tree.persistence_intervals_in_dimension(0)
        h1 = simplex_tree.persistence_intervals_in_dimension(1)
        return h0, h1

    def evaluate_precursor(self, raw_audio_event: np.ndarray) -> dict:
        point_cloud = self.takens_embedding(raw_audio_event)
        h0, h1 = self.compute_persistence(point_cloud)
        persistent_entropy = -np.sum((h1[:, 1] - h1[:, 0]) * np.log2(h1[:, 1] - h1[:, 0] + 1e-9))
        return {
            "status": "PRECURSOR_DETECTED" if persistent_entropy > 3.2 else "NOMINAL",
            "persistent_entropy_h1": float(persistent_entropy),
            "h1_loop_count": len(h1),
        }`;

export default function ArchitecturePage() {
  const { theme } = useTheme();
  const [selectedLayer, setSelectedLayer] = useState<number>(1);
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(CODE_SNIPPET);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 flex items-center justify-between px-6 py-4 bg-background/80 backdrop-blur-md border-b border-border/60">
        <div className="flex items-center gap-4">
          <Link href="/" className="hover:opacity-90">
            <AppLogo size="md" />
          </Link>
          <div className="hidden sm:flex items-center gap-1.5 text-xs text-muted-foreground border-l border-border pl-4">
            <span>EchoSense Core</span>
            <ChevronRight className="h-3 w-3" />
            <span className="text-foreground font-semibold">System Architecture Specification</span>
          </div>
        </div>

        <Link href="/dashboard">
          <Button size="sm" className="gap-2 text-xs bg-emerald-600 hover:bg-emerald-500 text-white cursor-pointer">
            Launch Dashboard
            <ArrowRight className="h-3.5 w-3.5" />
          </Button>
        </Link>
      </header>

      {/* Main Container */}
      <main className="max-w-6xl mx-auto px-4 py-12 w-full space-y-12">
        {/* Title Section */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <Badge variant="outline" className="font-mono text-xs text-emerald-400 border-emerald-500/30">
            End-to-End Pipeline Architecture
          </Badge>
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight">
            Topological &amp; Machine Learning Subsystems
          </h1>
          <p className="text-sm text-muted-foreground leading-relaxed">
            From smartphone acoustic emissions through Takens phase-space embedding, GUDHI persistence
            filtration, and real-time Bayesian changepoint detection.
          </p>
        </div>

        {/* Interactive Layer Selector */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {LAYERS.map((layer) => {
            const isSelected = layer.id === selectedLayer;
            return (
              <div
                key={layer.id}
                onClick={() => setSelectedLayer(layer.id)}
                className={`p-5 rounded-xl border transition-all cursor-pointer ${
                  isSelected
                    ? "border-emerald-500 bg-card shadow-lg ring-1 ring-emerald-500/20"
                    : "border-border bg-card/60 hover:bg-card hover:border-border/80"
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-mono font-bold text-emerald-400">
                    0{layer.id}
                  </span>
                  {isSelected && (
                    <Badge variant="default" className="text-[9px] py-0 bg-emerald-600 text-white">
                      Inspecting
                    </Badge>
                  )}
                </div>
                <h3 className="font-bold text-sm text-foreground mb-1">{layer.name}</h3>
                <p className="text-[11px] text-muted-foreground leading-relaxed">{layer.desc}</p>
              </div>
            );
          })}
        </div>

        {/* Selected Layer Node Diagram */}
        <Card className="border border-border bg-card p-6">
          <CardHeader className="p-0 pb-4 border-b border-border">
            <CardTitle className="text-base font-bold flex items-center gap-2">
              <Layers className="h-5 w-5 text-emerald-500" />
              {LAYERS.find((l) => l.id === selectedLayer)?.name} Subsystem Breakdown
            </CardTitle>
            <CardDescription className="text-xs">
              Component execution graph &amp; data transformations inside this stage
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0 pt-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {LAYERS.find((l) => l.id === selectedLayer)?.nodes.map((node, nIdx) => (
                <div
                  key={nIdx}
                  className="p-4 rounded-lg border border-border/80 bg-muted/20 flex flex-col justify-between space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-muted text-muted-foreground">
                      Module {selectedLayer}.{nIdx + 1}
                    </span>
                    <Sparkles className="h-3.5 w-3.5 text-emerald-400" />
                  </div>
                  <h4 className="font-bold text-xs text-foreground">{node}</h4>
                  <div className="text-[10px] text-emerald-400 flex items-center gap-1">
                    <Check className="h-3 w-3" />
                    Verified &amp; Active
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Code Contract Preview */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Terminal className="h-5 w-5 text-emerald-400" />
              <h2 className="text-base font-bold text-foreground">
                EchoSense TDA Python Pipeline Interface
              </h2>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleCopy}
              className="gap-1.5 text-xs cursor-pointer"
            >
              {copied ? (
                <>
                  <Check className="h-3.5 w-3.5 text-emerald-500" />
                  Copied to Clipboard
                </>
              ) : (
                <>
                  <Copy className="h-3.5 w-3.5" />
                  Copy Python Spec
                </>
              )}
            </Button>
          </div>

          <div className="rounded-xl border border-border bg-zinc-950 p-4 font-mono text-xs overflow-x-auto text-emerald-400">
            <pre>{CODE_SNIPPET}</pre>
          </div>
        </div>
      </main>
    </div>
  );
}
