"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  GitCompare,
  Sparkles,
  Download,
  BarChart2,
  LineChart,
  CheckCircle2,
  Layers,
  FileText,
  Sliders,
  ShieldCheck,
  Cpu,
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
import { MODEL_COMPARISON_TABLE, ModelBenchmark } from "@/lib/echosenseData";
import { downloadDataAsCsv } from "@/lib/utils";

export default function ModelComparisonPage() {
  const [selectedModels, setSelectedModels] = useState({
    topoAE: true,
    conventionalAE: true,
    cnnBaseline: true,
  });

  const handleExport = () => {
    downloadDataAsCsv("echosense_model_comparison_benchmark.csv", MODEL_COMPARISON_TABLE);
  };

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-7xl mx-auto w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b border-border/60">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <GitCompare className="h-6 w-6 text-primary" />
            Model Comparison &amp; Benchmark
          </h1>
        </div>

        <div className="flex items-center gap-2">
          <Link href="/reports">
            <Button size="sm" variant="outline" className="gap-1.5 text-xs">
              <FileText className="h-3.5 w-3.5" />
              View Assessment Reports
            </Button>
          </Link>
        </div>
      </div>

      {/* Model Cards Triad */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* TopoAE */}
        <Card className="border-2 border-[#FF5500] bg-card p-5 relative overflow-hidden shadow-lg h-full flex flex-col justify-between">
          <div>
            <div className="absolute top-0 right-0 bg-[#FF5500] text-white text-[10px] font-bold px-3 py-0.5 rounded-bl-lg uppercase tracking-wider">
              Proposed (Best)
            </div>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-lg bg-[#FF5500]/20 text-[#FF5500] flex items-center justify-center font-bold">
                T
              </div>
              <div>
                <h3 className="text-sm font-bold text-foreground">TopoAE (Topological RF)</h3>
                <span className="text-[10px] font-mono text-muted-foreground">Takens + GUDHI + Random Forest</span>
              </div>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
              <div className="p-2 rounded bg-muted/30">
                <span className="text-[10px] text-muted-foreground block font-mono">Accuracy</span>
                <span className="text-lg font-bold font-mono text-foreground">94.6%</span>
              </div>
              <div className="p-2 rounded bg-muted/30">
                <span className="text-[10px] text-muted-foreground block font-mono">Macro F1</span>
                <span className="text-lg font-bold font-mono text-foreground">0.938</span>
              </div>
            </div>
            <p className="mt-3 text-[11px] text-muted-foreground leading-relaxed">
              Intrinsic topological invariants provide high noise resilience (&gt;90% at -10 dB SNR) and mathematically provable stability under continuous deformations.
            </p>
          </div>
        </Card>

        {/* Conventional AE Descriptors */}
        <Card className="border border-border bg-card p-5 h-full flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-lg bg-secondary text-muted-foreground flex items-center justify-center font-bold">
                C
              </div>
              <div>
                <h3 className="text-sm font-bold text-foreground">Conventional AE Features</h3>
                <span className="text-[10px] font-mono text-muted-foreground">RF on Amplitude, Energy, Counts, RA</span>
              </div>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
              <div className="p-2 rounded bg-muted/30">
                <span className="text-[10px] text-muted-foreground block font-mono">Accuracy</span>
                <span className="text-lg font-bold font-mono text-foreground">86.2%</span>
              </div>
              <div className="p-2 rounded bg-muted/30">
                <span className="text-[10px] text-muted-foreground block font-mono">Macro F1</span>
                <span className="text-lg font-bold font-mono text-muted-foreground">0.849</span>
              </div>
            </div>
            <p className="mt-3 text-[11px] text-muted-foreground leading-relaxed">
              Fastest inference (3.2 ms), but severely degrades in low-cost smartphone acoustic recordings subject to environmental noise and microphone clipping.
            </p>
          </div>
        </Card>

        {/* CNN Baseline */}
        <Card className="border border-border bg-card p-5 h-full flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-lg bg-secondary text-muted-foreground flex items-center justify-center font-bold">
                D
              </div>
              <div>
                <h3 className="text-sm font-bold text-foreground">CNN Baseline (AE-DenseNet)</h3>
                <span className="text-[10px] font-mono text-muted-foreground">1D Deep Convolutional Network</span>
              </div>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
              <div className="p-2 rounded bg-muted/30">
                <span className="text-[10px] text-muted-foreground block font-mono">Accuracy</span>
                <span className="text-lg font-bold font-mono text-foreground">91.8%</span>
              </div>
              <div className="p-2 rounded bg-muted/30">
                <span className="text-[10px] text-muted-foreground block font-mono">Macro F1</span>
                <span className="text-lg font-bold font-mono text-foreground">0.906</span>
              </div>
            </div>
            <p className="mt-3 text-[11px] text-muted-foreground leading-relaxed">
              Strong raw feature extraction but requires 18.4 MB model storage, 24.6 ms GPU inference, and acts as an uninterpretable black box for regulatory SHM audits.
            </p>
          </div>
        </Card>
      </div>

      {/* Comprehensive Benchmark Table */}
      <Card className="border border-border bg-card">
        <CardHeader className="pb-3 border-b border-border/50">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <BarChart2 className="h-4 w-4 text-primary" />
            Quantitative Performance Benchmark Matrix
          </CardTitle>
          <CardDescription className="text-xs">
            Evaluated on identical cross-validation splits across Concrete and Bridge Girder AE datasets
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0 overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-border">
                <TableHead className="text-xs">Evaluation Metric</TableHead>
                <TableHead className="text-xs text-[#FF5500] font-bold">TopoAE (Proposed)</TableHead>
                <TableHead className="text-xs text-muted-foreground">Conventional AE Descriptors</TableHead>
                <TableHead className="text-xs text-muted-foreground">CNN Baseline</TableHead>
                <TableHead className="text-xs text-right pr-4">Advantage</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {MODEL_COMPARISON_TABLE.map((row) => (
                <TableRow key={row.metric} className="border-border hover:bg-muted/40">
                  <TableCell className="text-xs font-semibold text-foreground">
                    {row.metric}
                  </TableCell>
                  <TableCell className="text-xs font-mono font-bold text-[#FF5500] bg-[#FF5500]/5">
                    {row.topoAE}
                  </TableCell>
                  <TableCell className="text-xs font-mono text-muted-foreground">
                    {row.conventionalAE}
                  </TableCell>
                  <TableCell className="text-xs font-mono text-foreground/90">
                    {row.cnnBaseline}
                  </TableCell>
                  <TableCell className="text-xs text-right pr-4">
                    {row.bestModel === "topoAE" && (
                      <Badge variant="outline" className="text-[10px] font-mono border-primary/30 text-primary bg-primary/5">
                        TopoAE +8.4%
                      </Badge>
                    )}
                    {row.bestModel === "conventionalAE" && (
                      <Badge variant="outline" className="text-[10px] font-mono border-border text-muted-foreground bg-muted/20">
                        Fastest Latency
                      </Badge>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Noise Resilience & Ablation Insight */}
      <Card className="border border-border bg-card p-5">
        <h3 className="text-sm font-semibold text-foreground mb-2 flex items-center gap-2">
          <ShieldCheck className="h-4 w-4 text-primary" />
          Ablation &amp; Noise Invariance Analysis
        </h3>
        <p className="text-xs text-muted-foreground leading-relaxed">
          The central research contribution demonstrated by TopoAE is its <strong>topological stability</strong> under smartphone microphone distortion. Conventional acoustic features (energy, rise time, amplitude) suffer dramatic accuracy drops (from 86.2% to 68.7%) when synthetic ambient noise at -10 dB SNR is injected. TopoAE retains <strong>90.4% accuracy</strong> because persistent homology computes coordinate-free intrinsic loop invariants ($H_1$) that are immune to monotonic scale shifts and high-frequency noise perturbation.
        </p>
      </Card>
    </div>
  );
}

