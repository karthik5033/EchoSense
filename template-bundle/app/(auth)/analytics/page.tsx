"use client";

import React, { useState } from "react";
import {
  LineChart as LineChartIcon,
  BarChart3,
  TrendingUp,
  Download,
  Filter,
  RefreshCw,
  Activity,
  Layers,
  ChevronRight,
  Sparkles,
  Award,
  Zap,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import { MOCK_CATEGORY_DISTRIBUTION } from "@/lib/mockData";
import { downloadDataAsCsv } from "@/lib/utils";

const BENCHMARK_COMPARISON_DATA = [
  { noiseSnr: "No Noise", echosense: 96.2, cnn: 94.5, conventional: 86.8 },
  { noiseSnr: "+20 dB", echosense: 95.1, cnn: 91.2, conventional: 83.4 },
  { noiseSnr: "+15 dB", echosense: 94.1, cnn: 88.7, conventional: 81.2 },
  { noiseSnr: "+10 dB", echosense: 92.4, cnn: 82.3, conventional: 74.5 },
  { noiseSnr: "+5 dB", echosense: 89.8, cnn: 74.1, conventional: 66.8 },
  { noiseSnr: "0 dB (High Noise)", echosense: 86.5, cnn: 65.4, conventional: 58.2 },
];

const TIME_RANGES = ["LOAD_STEP_1", "LOAD_STEP_2", "LOAD_STEP_3", "FULL_TEST"];

export default function AnalyticsPage() {
  const [selectedRange, setSelectedRange] = useState("FULL_TEST");

  const handleExport = () => {
    downloadDataAsCsv("echosense_benchmark_comparison.csv", BENCHMARK_COMPARISON_DATA);
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <LineChartIcon className="h-6 w-6 text-emerald-500" />
            TDA &amp; Model Benchmark Comparisons
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Side-by-side performance evaluation: EchoSense Topological RF vs 1D CNN vs Conventional Acoustic Descriptors
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Range picker */}
          <div className="flex items-center bg-muted/60 p-1 rounded-lg border border-border">
            {TIME_RANGES.map((range) => (
              <button
                key={range}
                onClick={() => setSelectedRange(range)}
                className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-colors cursor-pointer ${
                  selectedRange === range
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {range}
              </button>
            ))}
          </div>

          <Button variant="outline" size="sm" onClick={handleExport} className="gap-1.5 text-xs cursor-pointer">
            <Download className="h-3.5 w-3.5" />
            Export Benchmark CSV
          </Button>
        </div>
      </div>

      {/* Top 3 Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border border-border bg-card p-5">
          <span className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">
            EchoSense Classification Accuracy
          </span>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-3xl font-extrabold font-mono text-emerald-400">94.1%</span>
            <span className="text-xs font-semibold text-emerald-500 font-mono">+12.9% vs Conv AE</span>
          </div>
          <p className="text-xs text-muted-foreground/80 mt-1">
            Siracusano benchmark (15K train + 1.65K test)
          </p>
        </Card>

        <Card className="border border-border bg-card p-5">
          <span className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">
            Macro F1-Score
          </span>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-3xl font-extrabold font-mono text-foreground">0.938</span>
            <span className="text-xs font-semibold text-emerald-500 font-mono">Balanced</span>
          </div>
          <p className="text-xs text-muted-foreground/80 mt-1">
            Tensile (0.95), Shear (0.93), Mixed-mode (0.92)
          </p>
        </Card>

        <Card className="border border-border bg-card p-5">
          <span className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">
            Damage Precursor Detection Lead
          </span>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-3xl font-extrabold font-mono text-emerald-400">2.1 Cycles</span>
            <span className="text-xs font-semibold text-emerald-500 font-mono">~140 ms Pre-Failure</span>
          </div>
          <p className="text-xs text-muted-foreground/80 mt-1">
            Alerts triggered prior to macroscopic crack opening
          </p>
        </Card>
      </div>

      {/* Main Comparative Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Multi-Series Noise Resilience Line Chart */}
        <Card className="border border-border bg-card">
          <CardHeader className="pb-2 border-b border-border/50">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-emerald-500" />
              Noise Resilience Under Smartphone SNR Degradation
            </CardTitle>
            <CardDescription className="text-xs">
              Classification accuracy across simulated environmental SNR noise levels (dB)
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={BENCHMARK_COMPARISON_DATA}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                  <XAxis dataKey="noiseSnr" stroke="#71717a" fontSize={11} />
                  <YAxis domain={[50, 100]} stroke="#71717a" fontSize={11} unit="%" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#09090b",
                      borderColor: "#27272a",
                      borderRadius: "8px",
                      fontSize: "12px",
                      color: "#f4f4f5",
                    }}
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="echosense"
                    name="EchoSense (TDA + RF)"
                    stroke="#10b981"
                    strokeWidth={3}
                    dot={{ fill: "#10b981", r: 4 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="cnn"
                    name="1D CNN Baseline"
                    stroke="#6366f1"
                    strokeWidth={2}
                    strokeDasharray="4 4"
                    dot={{ fill: "#6366f1", r: 3 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="conventional"
                    name="Conventional AE Descriptors"
                    stroke="#f59e0b"
                    strokeWidth={2}
                    strokeDasharray="2 2"
                    dot={{ fill: "#f59e0b", r: 3 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Category Distribution Bar Chart */}
        <Card className="border border-border bg-card">
          <CardHeader className="pb-2 border-b border-border/50">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-primary" />
              Crack Mechanism Classification Distribution
            </CardTitle>
            <CardDescription className="text-xs">
              Acoustic event class breakdown across experimental evaluation callset
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={MOCK_CATEGORY_DISTRIBUTION}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                  <XAxis dataKey="name" stroke="#71717a" fontSize={11} />
                  <YAxis stroke="#71717a" fontSize={11} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#09090b",
                      borderColor: "#27272a",
                      borderRadius: "8px",
                      fontSize: "12px",
                      color: "#f4f4f5",
                    }}
                  />
                  <Bar
                    dataKey="count"
                    name="Acoustic Events"
                    fill="#10b981"
                    radius={[6, 6, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* TDA Feature Ablation Study Card */}
      <Card className="border border-border bg-card p-5">
        <div className="flex items-center justify-between border-b border-border pb-3 mb-4">
          <CardTitle className="text-sm font-bold flex items-center gap-2">
            <Layers className="h-4 w-4 text-emerald-400" />
            Topological Feature Importance &amp; Ablation Ranking
          </CardTitle>
          <Badge variant="outline" className="font-mono text-xs text-emerald-400 border-emerald-500/30">
            Gini Impurity Metric
          </Badge>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
          <div className="p-3 rounded-lg border border-border/60 bg-muted/20">
            <span className="text-muted-foreground block">H1 Persistent Entropy:</span>
            <span className="font-mono font-bold text-foreground text-sm">Weight: 0.284</span>
            <p className="text-[10px] text-muted-foreground mt-1">Measures diversity of crack burst cycle lifetimes</p>
          </div>
          <div className="p-3 rounded-lg border border-border/60 bg-muted/20">
            <span className="text-muted-foreground block">Landscape Layer λ1 (Peak Area):</span>
            <span className="font-mono font-bold text-foreground text-sm">Weight: 0.241</span>
            <p className="text-[10px] text-muted-foreground mt-1">Captures primary non-linear orbital attractor loop</p>
          </div>
          <div className="p-3 rounded-lg border border-border/60 bg-muted/20">
            <span className="text-muted-foreground block">Betti 1 Integral (∫β1 dt):</span>
            <span className="font-mono font-bold text-foreground text-sm">Weight: 0.198</span>
            <p className="text-[10px] text-muted-foreground mt-1">Total loop persistence across filtration scale ε</p>
          </div>
          <div className="p-3 rounded-lg border border-border/60 bg-muted/20">
            <span className="text-muted-foreground block">Conventional AE Energy:</span>
            <span className="font-mono font-bold text-muted-foreground text-sm">Weight: 0.092</span>
            <p className="text-[10px] text-muted-foreground mt-1">Standard squared voltage integral descriptor</p>
          </div>
        </div>
      </Card>
    </div>
  );
}
