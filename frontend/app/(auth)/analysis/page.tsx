"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Activity,
  ArrowRight,
  BarChart2,
  CheckCircle2,
  ChevronRight,
  Cpu,
  Download,
  ExternalLink,
  FileText,
  Filter,
  Layers,
  LineChart,
  Radio,
  RefreshCw,
  RotateCw,
  Search,
  ShieldAlert,
  Sparkles,
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
import {
  RECENT_ANALYSES,
  MOCK_BOCD_TIMELINE,
  MOCK_AUTOENCODER_RESIDUALS,
  TOPOLOGICAL_FEATURE_IMPORTANCE,
  CONFUSION_MATRIX,
  AnalysisRecord,
} from "@/lib/echosenseData";
import { PersistenceDiagram } from "@/components/tda/PersistenceDiagram";
import { TakensPhaseSpace } from "@/components/tda/TakensPhaseSpace";
import { BettiCurvesChart } from "@/components/tda/BettiCurvesChart";
import { SignalWaveformPlot } from "@/components/tda/SignalWaveformPlot";
import { downloadDataAsCsv } from "@/lib/utils";

type TabKey = "overview" | "preprocessing" | "takens" | "topology" | "classification" | "changepoints" | "anomalies";

export default function AnalysisPage() {
  const [activeTab, setActiveTab] = useState<TabKey>("overview");
  const [selectedRecord, setSelectedRecord] = useState<AnalysisRecord>(RECENT_ANALYSES[0]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const ds = params.get("dataset");
      if (ds) {
        if (ds === "ds-bridge-girder") {
          const match = RECENT_ANALYSES.find((r) => r.id === "AN-8920") || RECENT_ANALYSES[0];
          setSelectedRecord(match);
        } else if (ds === "ds-concrete-mendeley") {
          const match = RECENT_ANALYSES.find((r) => r.id === "AN-8919");
          if (match) setSelectedRecord(match);
        } else if (ds === "ds-smartphone-field") {
          const match = RECENT_ANALYSES.find((r) => r.id === "AN-8918");
          if (match) setSelectedRecord(match);
        }
      }
      const run = params.get("run");
      if (run) {
        const foundRun = RECENT_ANALYSES.find((r) => r.id.toLowerCase() === run.toLowerCase());
        if (foundRun) setSelectedRecord(foundRun);
      }
      const tab = params.get("tab") as TabKey;
      if (tab && ["overview", "preprocessing", "takens", "topology", "classification", "changepoints", "anomalies"].includes(tab)) {
        setActiveTab(tab);
      }
    }
  }, []);

  const handleExportFeatures = () => {
    downloadDataAsCsv("topological_features_vector.csv", TOPOLOGICAL_FEATURE_IMPORTANCE);
  };

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-7xl mx-auto w-full">
      {/* Header with Run Selector */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 pb-3 border-b border-border/60">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <Activity className="h-6 w-6 text-[#FF5500]" />
            TDA Pipeline Explorer
          </h1>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Analysis Run Selector */}
          <select
            value={selectedRecord.id}
            onChange={(e) => {
              const found = RECENT_ANALYSES.find((r) => r.id === e.target.value);
              if (found) setSelectedRecord(found);
            }}
            className="text-xs bg-muted/60 border border-border rounded-lg px-3 py-1.5 font-mono text-foreground focus:outline-none cursor-pointer"
          >
            {RECENT_ANALYSES.map((rec) => (
              <option key={rec.id} value={rec.id}>
                {rec.id}: {rec.name}
              </option>
            ))}
          </select>

          <Link href="/reports">
            <Button size="sm" variant="outline" className="gap-1.5 text-xs">
              <FileText className="h-3.5 w-3.5" />
              Generate PDF Report
            </Button>
          </Link>
        </div>
      </div>

      {/* Interactive Pipeline Stage Stepper */}
      <div className="rounded-xl border border-border bg-card p-3 overflow-x-auto select-none">
        <div className="flex items-center justify-between min-w-[720px] gap-2 text-xs">
          {[
            { key: "overview", label: "1. Overview", sub: "Status & Result" },
            { key: "preprocessing", label: "2. Preprocessing", sub: "Bandpass & Onsets" },
            { key: "takens", label: "3. Takens Embedding", sub: "Attractor d=3, τ=4" },
            { key: "topology", label: "4. Persistent Homology", sub: "Diagrams & Barcodes" },
            { key: "classification", label: "5. RF Classifier", sub: "Tensile vs Shear" },
            { key: "changepoints", label: "6. BOCD Changepoint", sub: "Temporal Shifts" },
            { key: "anomalies", label: "7. Conv1D Anomaly", sub: "Reconstruction Error" },
          ].map((stage, idx) => {
            const isActive = activeTab === stage.key;
            return (
              <button
                key={stage.key}
                onClick={() => setActiveTab(stage.key as TabKey)}
                className={`flex-1 p-2 rounded-lg text-left transition-all cursor-pointer ${
                  isActive
                    ? "bg-[#FF5500]/15 border border-[#FF5500]/50 shadow-sm"
                    : "hover:bg-muted/50 border border-transparent"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className={`font-semibold ${isActive ? "text-[#FF5500]" : "text-foreground"}`}>
                    {stage.label}
                  </span>
                  <CheckCircle2 className={`w-3.5 h-3.5 ${isActive ? "text-[#FF5500]" : "text-muted-foreground/40"}`} />
                </div>
                <span className="text-[10px] text-muted-foreground font-mono block mt-0.5">
                  {stage.sub}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* TAB CONTENT 1: OVERVIEW */}
      {activeTab === "overview" && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* Classification Hero Result Card */}
          <Card className="border border-border bg-gradient-to-r from-card via-card to-primary/5 p-6">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
              <div className="space-y-2 max-w-2xl">
                <div className="flex items-center gap-2">
                  <Badge
                    variant="outline"
                    className="text-xs font-semibold px-2.5 py-0.5 border-[#FF5500]/40 text-[#FF5500] bg-[#FF5500]/10"
                  >
                    Predicted Damage Mechanism
                  </Badge>
                  <span className="text-xs font-mono text-muted-foreground">
                    Confidence: {(selectedRecord.confidence * 100).toFixed(1)}%
                  </span>
                </div>

                <div className="flex items-baseline gap-3">
                  <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
                    {selectedRecord.predictedClass} Crack Precursor
                  </h2>
                  <span className="text-xs font-mono text-muted-foreground">
                    Mode I Fracture Mechanics
                  </span>
                </div>

                <p className="text-xs text-muted-foreground leading-relaxed">
                  {selectedRecord.notes} Reconstructed state-space confirms early transient elastic wave emissions characteristic of localized concrete micro-tensile rupture before macroscopic crack coalescence.
                </p>
              </div>

              {/* Metrics Pill Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-2 gap-3 shrink-0">
                <div className="p-3 rounded-xl border border-border bg-card/80 min-w-[120px]">
                  <span className="text-[10px] uppercase font-mono text-muted-foreground block">F1-Score</span>
                  <span className="text-lg font-bold font-mono text-foreground">{selectedRecord.f1Score.toFixed(3)}</span>
                </div>
                <div className="p-3 rounded-xl border border-border bg-card/80 min-w-[120px]">
                  <span className="text-[10px] uppercase font-mono text-muted-foreground block">ROC-AUC</span>
                  <span className="text-lg font-bold font-mono text-foreground">{selectedRecord.rocAuc.toFixed(3)}</span>
                </div>
                <div className="p-3 rounded-xl border border-border bg-card/80 min-w-[120px]">
                  <span className="text-[10px] uppercase font-mono text-muted-foreground block">BOCD Shifts</span>
                  <span className="text-lg font-bold font-mono text-foreground">{selectedRecord.changepointsDetected} Points</span>
                </div>
                <div className="p-3 rounded-xl border border-border bg-card/80 min-w-[120px]">
                  <span className="text-[10px] uppercase font-mono text-muted-foreground block">Conv1D Loss</span>
                  <span className="text-lg font-bold font-mono text-primary">{selectedRecord.anomalyScore.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </Card>

          {/* Dual Visualizers: Takens Embedding + Persistence Diagram */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <TakensPhaseSpace />
            <PersistenceDiagram />
          </div>

          {/* Quick Stepper Action */}
          <div className="flex items-center justify-between pt-2">
            <span className="text-xs text-muted-foreground">
              Specimen: <strong>{selectedRecord.specimen}</strong> &bull; Sampling: <strong>{selectedRecord.samplingRate}</strong>
            </span>
            <Button
              size="sm"
              onClick={() => setActiveTab("topology")}
              className="gap-1.5 text-xs bg-primary hover:bg-primary/90 text-white cursor-pointer"
            >
              Deep Dive into Persistent Homology
              <ArrowRight className="w-3.5 h-3.5" />
            </Button>
          </div>
        </div>
      )}

      {/* TAB CONTENT 2: PREPROCESSING */}
      {activeTab === "preprocessing" && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <SignalWaveformPlot
            title={`${selectedRecord.specimen} - Preprocessed Acoustic Transient`}
            samplingRate={selectedRecord.samplingRate}
            isAnomalous={selectedRecord.predictedClass === "Shear"}
          />

          <Card className="border border-border bg-card">
            <CardHeader className="pb-3 border-b border-border/50">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Filter className="h-4 w-4 text-primary" />
                Acoustic Emission Event Boundaries &amp; Onset Telemetry
              </CardTitle>
              <CardDescription className="text-xs">
                Energy thresholding and sliding window segmentation details
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0 overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-border">
                    <TableHead className="text-xs">Event #</TableHead>
                    <TableHead className="text-xs">Onset Time</TableHead>
                    <TableHead className="text-xs">Duration</TableHead>
                    <TableHead className="text-xs">Peak Amplitude</TableHead>
                    <TableHead className="text-xs">RMS Energy</TableHead>
                    <TableHead className="text-xs">Rise Time</TableHead>
                    <TableHead className="text-xs">RA Value</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {[
                    { id: "EVT-01", onset: "1.02 ms", dur: "4.8 ms", amp: "1.18 V", rms: "0.34 V", rise: "0.28 ms", ra: "23.7 μs/V" },
                    { id: "EVT-02", onset: "8.45 ms", dur: "2.1 ms", amp: "0.64 V", rms: "0.19 V", rise: "0.15 ms", ra: "23.4 μs/V" },
                    { id: "EVT-03", onset: "14.20 ms", dur: "6.2 ms", amp: "1.42 V", rms: "0.41 V", rise: "0.35 ms", ra: "24.6 μs/V" },
                    { id: "EVT-04", onset: "22.80 ms", dur: "3.5 ms", amp: "0.88 V", rms: "0.24 V", rise: "0.20 ms", ra: "22.7 μs/V" },
                  ].map((evt) => (
                    <TableRow key={evt.id} className="border-border hover:bg-muted/40">
                      <TableCell className="font-mono text-xs font-semibold text-primary">{evt.id}</TableCell>
                      <TableCell className="font-mono text-xs text-foreground">{evt.onset}</TableCell>
                      <TableCell className="font-mono text-xs text-muted-foreground">{evt.dur}</TableCell>
                      <TableCell className="font-mono text-xs text-foreground font-medium">{evt.amp}</TableCell>
                      <TableCell className="font-mono text-xs text-foreground">{evt.rms}</TableCell>
                      <TableCell className="font-mono text-xs text-muted-foreground">{evt.rise}</TableCell>
                      <TableCell className="font-mono text-xs text-primary font-semibold">{evt.ra}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      )}

      {/* TAB CONTENT 3: TAKENS EMBEDDING */}
      {activeTab === "takens" && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-8">
              <TakensPhaseSpace initialDelay={selectedRecord.timeDelay} initialDim={selectedRecord.embeddingDim} />
            </div>

            <div className="lg:col-span-4 space-y-4">
              <Card className="border border-border bg-card p-4 space-y-3">
                <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-primary" />
                  Embedding Hyperparameters
                </h3>
                <p className="text-xs text-muted-foreground">
                  Takens delay coordinate embedding reconstructs the phase space attractor of the acoustic dynamical system from a scalar time series.
                </p>

                <div className="p-3 rounded-lg border border-border bg-muted/30 space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Selected Dimension (d):</span>
                    <span className="font-mono text-foreground font-semibold">d = {selectedRecord.embeddingDim}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Optimal Delay (τ):</span>
                    <span className="font-mono text-foreground font-semibold">τ = {selectedRecord.timeDelay} samples</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Embedding Radius:</span>
                    <span className="font-mono text-primary font-semibold">R = 1.35</span>
                  </div>
                </div>

                <div className="text-[11px] text-muted-foreground border-t border-border/50 pt-2 space-y-1">
                  <span className="font-semibold text-foreground block">Estimation Criteria:</span>
                  <div>&bull; Time delay τ estimated via first local minimum of average Mutual Information.</div>
                  <div>&bull; Embedding dimension d estimated via False Nearest Neighbors (FNN &lt; 2%).</div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT 4: TOPOLOGY & PERSISTENT HOMOLOGY */}
      {activeTab === "topology" && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <PersistenceDiagram />
            <BettiCurvesChart />
          </div>

          {/* Topological Feature Summary Vector Table */}
          <Card className="border border-border bg-card">
            <CardHeader className="flex flex-row items-center justify-between pb-3 border-b border-border/50">
              <div>
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <Layers className="h-4 w-4 text-primary" />
                  Vectorized Topological Invariants (Passed to Classifier)
                </CardTitle>
                <CardDescription className="text-xs">
                  Fixed-length numerical descriptors extracted from persistence diagrams &amp; Betti curves
                </CardDescription>
              </div>
              <Button size="sm" variant="outline" onClick={handleExportFeatures} className="text-xs gap-1">
                <Download className="w-3 h-3" />
                Export CSV
              </Button>
            </CardHeader>
            <CardContent className="p-0 overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-border">
                    <TableHead className="text-xs">Feature Descriptor</TableHead>
                    <TableHead className="text-xs">Category</TableHead>
                    <TableHead className="text-xs font-mono">Computed Value</TableHead>
                    <TableHead className="text-xs">Gini Importance</TableHead>
                    <TableHead className="text-xs">Mechanical Interpretation</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {TOPOLOGICAL_FEATURE_IMPORTANCE.map((feat) => (
                    <TableRow key={feat.name} className="border-border hover:bg-muted/40">
                      <TableCell className="text-xs font-semibold text-foreground font-mono">
                        {feat.name}
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">{feat.category}</TableCell>
                      <TableCell className="text-xs font-mono text-primary font-bold">
                        {(feat.importance * 3.4).toFixed(3)}
                      </TableCell>
                      <TableCell className="text-xs">
                        <div className="flex items-center gap-2">
                          <div className="w-20 bg-muted/60 h-2 rounded-full overflow-hidden">
                            <div
                              className="bg-[#FF5500] h-full rounded-full"
                              style={{ width: `${feat.importance * 100}%` }}
                            />
                          </div>
                          <span className="font-mono text-[11px] text-muted-foreground">
                            {(feat.importance * 100).toFixed(1)}%
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground max-w-xs truncate">
                        Detects persistent multi-loop orbit closure associated with crack tip stress wave reverberation.
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      )}

      {/* TAB CONTENT 5: CLASSIFICATION RESULTS */}
      {activeTab === "classification" && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Confusion Matrix */}
            <Card className="border border-border bg-card">
              <CardHeader className="pb-3 border-b border-border/50">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <BarChart2 className="h-4 w-4 text-primary" />
                  Random Forest Confusion Matrix
                </CardTitle>
                <CardDescription className="text-xs">
                  Validation across 1,500 test acoustic events (Siracusano &amp; Bridge Girder benchmarks)
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="overflow-x-auto">
                  <table className="w-full text-xs font-mono text-center">
                    <thead>
                      <tr className="border-b border-border/60 text-muted-foreground">
                        <th className="p-2 text-left">Actual \ Pred</th>
                        <th className="p-2 text-muted-foreground">Tensile</th>
                        <th className="p-2 text-primary font-bold">Shear</th>
                        <th className="p-2 text-muted-foreground">Mixed</th>
                        <th className="p-2 text-right">Class Acc</th>
                      </tr>
                    </thead>
                    <tbody>
                      {CONFUSION_MATRIX.map((row) => (
                        <tr key={row.actual} className="border-b border-border/40 hover:bg-muted/30">
                          <td className="p-2.5 font-semibold text-foreground text-left">{row.actual}</td>
                          <td className={`p-2.5 font-bold ${row.actual === "Tensile" ? "bg-muted text-foreground rounded" : "text-muted-foreground"}`}>
                            {row.predictedTensile}
                          </td>
                          <td className={`p-2.5 font-bold ${row.actual === "Shear" ? "bg-primary/10 text-primary rounded" : "text-muted-foreground"}`}>
                            {row.predictedShear}
                          </td>
                          <td className={`p-2.5 font-bold ${row.actual === "Mixed-Mode" ? "bg-muted text-foreground rounded" : "text-muted-foreground"}`}>
                            {row.predictedMixed}
                          </td>
                          <td className="p-2.5 text-right font-bold text-foreground">{row.accuracy}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="mt-4 p-2.5 rounded-lg border border-border bg-muted/30 text-xs flex items-center justify-between text-foreground">
                  <span>Overall TopoAE Accuracy: <strong>94.6%</strong></span>
                  <span>Macro F1: <strong>0.938</strong></span>
                </div>
              </CardContent>
            </Card>

            {/* ROC Curve Representation */}
            <Card className="border border-border bg-card">
              <CardHeader className="pb-3 border-b border-border/50">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <LineChart className="h-4 w-4 text-primary" />
                  Receiver Operating Characteristic (ROC)
                </CardTitle>
                <CardDescription className="text-xs">
                  Area Under Curve (AUC) discrimination capability across crack classes
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-4 flex flex-col items-center">
                <svg viewBox="0 0 280 220" className="w-full max-w-[320px] aspect-[4/3]">
                  {/* Diagonal random guess */}
                  <line x1="30" y1="190" x2="250" y2="30" stroke="#64748b" strokeDasharray="3,3" strokeWidth="1" />

                  {/* TopoAE ROC curve (AUC 0.982) */}
                  <path
                    d="M 30 190 Q 32 40 250 30"
                    fill="none"
                    stroke="#FF5500"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                  />

                  {/* CNN baseline curve (AUC 0.958) */}
                  <path
                    d="M 30 190 Q 45 65 250 30"
                    fill="none"
                    stroke="#06b6d4"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeDasharray="4,2"
                  />

                  {/* Conventional AE curve (AUC 0.912) */}
                  <path
                    d="M 30 190 Q 65 95 250 30"
                    fill="none"
                    stroke="#a855f7"
                    strokeWidth="1.5"
                    strokeDasharray="2,2"
                  />

                  <text x="140" y="210" fontSize="8" fill="currentColor" opacity="0.6" textAnchor="middle" fontFamily="monospace">
                    False Positive Rate (1 - Specificity)
                  </text>
                  <text x="12" y="110" fontSize="8" fill="currentColor" opacity="0.6" textAnchor="middle" transform="rotate(-90, 12, 110)" fontFamily="monospace">
                    True Positive Rate
                  </text>
                </svg>

                <div className="w-full mt-3 pt-2 border-t border-border/50 flex flex-wrap items-center justify-between text-[11px] gap-2">
                  <span className="flex items-center gap-1.5 text-[#FF5500] font-semibold">
                    <span className="w-2.5 h-1 rounded-full bg-[#FF5500]" /> TopoAE (AUC 0.982)
                  </span>
                  <span className="flex items-center gap-1.5 text-muted-foreground">
                    <span className="w-2.5 h-1 rounded-full bg-zinc-400" /> CNN (AUC 0.958)
                  </span>
                  <span className="flex items-center gap-1.5 text-muted-foreground">
                    <span className="w-2.5 h-1 rounded-full bg-zinc-600" /> Conv. AE (AUC 0.912)
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* TAB CONTENT 6: BAYESIAN ONLINE CHANGEPOINT DETECTION (BOCD) */}
      {activeTab === "changepoints" && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <Card className="border border-border bg-card p-5">
            <CardHeader className="p-0 pb-4 border-b border-border/50">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <div>
                  <CardTitle className="text-sm font-semibold flex items-center gap-2">
                    <ShieldAlert className="h-4 w-4 text-[#FF5500]" />
                    Bayesian Online Changepoint Detection (Adams &amp; MacKay 2007)
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Real-time probabilistic discovery of structural statistical regime shifts (Hazard rate λ = 250)
                  </CardDescription>
                </div>
                <Badge variant="outline" className="text-[10px] font-mono border-border text-muted-foreground bg-muted/20">
                  Mean Detection Delay: 340 ms
                </Badge>
              </div>
            </CardHeader>

            <CardContent className="p-0 pt-4 space-y-4">
              {/* Timeline Diagram */}
              <div className="p-4 rounded-xl border border-border bg-muted/20">
                <div className="flex items-center justify-between text-xs font-mono text-muted-foreground mb-3">
                  <span>Structural Loading Timeline (0.0s ➔ 7.0s)</span>
                  <span className="text-[#FF5500] font-semibold">3 Irreversible Changepoints Detected</span>
                </div>

                <div className="space-y-2">
                  {MOCK_BOCD_TIMELINE.map((item, idx) => (
                    <div
                      key={idx}
                      className={`flex items-center justify-between p-2 rounded-lg text-xs font-mono transition-colors ${
                        item.isChangepoint
                          ? "border border-[#FF5500]/40 bg-[#FF5500]/10 text-white font-semibold"
                          : "hover:bg-muted/40 text-muted-foreground"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="w-12 text-primary">{item.time}</span>
                        {item.isChangepoint && (
                          <Badge variant="outline" className="text-[10px] uppercase font-mono border-primary/40 text-primary bg-primary/10">
                            {item.label}
                          </Badge>
                        )}
                        {!item.isChangepoint && <span>Normal steady-state response</span>}
                      </div>

                      <div className="flex items-center gap-4 text-[11px]">
                        <span>P(CP): <strong className={item.isChangepoint ? "text-primary" : "text-foreground"}>{(item.probability * 100).toFixed(0)}%</strong></span>
                        <span>Hazard: {item.hazard.toFixed(3)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* TAB CONTENT 7: AUTOENCODER ANOMALY DETECTION */}
      {activeTab === "anomalies" && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <Card className="border border-border bg-card p-5">
            <CardHeader className="p-0 pb-4 border-b border-border/50">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <div>
                  <CardTitle className="text-sm font-semibold flex items-center gap-2">
                    <Cpu className="h-4 w-4 text-primary" />
                    Conv1D Autoencoder Anomaly Validation (Wang et al. 2026)
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Independent unsupervised anomaly branch trained on undamaged structural baselines
                  </CardDescription>
                </div>
                <Badge variant="outline" className="text-[10px] font-mono border-primary/30 text-primary bg-primary/10">
                  Threshold: 95th Percentile (0.180)
                </Badge>
              </div>
            </CardHeader>

            <CardContent className="p-0 pt-4 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-3 rounded-xl border border-border bg-card">
                  <span className="text-[10px] uppercase font-mono text-muted-foreground block">Anomaly F1</span>
                  <span className="text-2xl font-bold font-mono text-foreground">0.912</span>
                </div>
                <div className="p-3 rounded-xl border border-border bg-card">
                  <span className="text-[10px] uppercase font-mono text-muted-foreground block">Reconstruction Loss</span>
                  <span className="text-2xl font-bold font-mono text-primary">0.042 MSE</span>
                </div>
                <div className="p-3 rounded-xl border border-border bg-card">
                  <span className="text-[10px] uppercase font-mono text-muted-foreground block">Latent Dimension</span>
                  <span className="text-2xl font-bold font-mono text-foreground">16-dim</span>
                </div>
              </div>

              {/* Residual Error Bar Track */}
              <div className="p-4 rounded-xl border border-border bg-muted/20 space-y-2">
                <div className="flex items-center justify-between text-xs font-mono text-muted-foreground">
                  <span>Reconstruction Error vs 0.180 Anomaly Threshold</span>
                  <span className="text-[#FF5500] font-semibold">Step 6 &amp; 11 Exceeded Threshold</span>
                </div>

                <div className="grid grid-cols-13 gap-1 pt-2">
                  {MOCK_AUTOENCODER_RESIDUALS.map((pt) => {
                    const heightPct = Math.min(100, (pt.error / 0.35) * 100);
                    return (
                      <div key={pt.step} className="flex flex-col items-center gap-1 group">
                        <div className="w-full h-24 bg-card rounded flex items-end p-1 border border-border/40 relative">
                          <div
                            className={`w-full rounded-sm transition-all group-hover:brightness-125 ${
                              pt.isAnomaly ? "bg-[#FF5500]" : "bg-zinc-600"
                            }`}
                            style={{ height: `${heightPct}%` }}
                          />
                        </div>
                        <span className="text-[9px] font-mono text-muted-foreground">#{pt.step}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

