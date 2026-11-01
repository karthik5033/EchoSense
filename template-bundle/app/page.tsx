"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Sparkles,
  ArrowRight,
  Sun,
  Moon,
  ShieldCheck,
  Zap,
  Activity,
  Layers,
  Check,
  ChevronDown,
  Terminal,
  Cpu,
  BarChart3,
  Globe2,
  Users,
  Compass,
  Database,
  ExternalLink,
} from "lucide-react";
import { AppLogo } from "@/components/ui/AppLogo";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { useTheme } from "@/lib/ThemeContext";
import { MOCK_KPIS, MOCK_TREND_DATA } from "@/lib/mockData";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";

const FAQS = [
  {
    q: "How can smartphone microphones detect structural acoustic emissions compared to ultrasonic transducers?",
    a: "While commercial piezoelectric sensors capture ultrasonic waves (100 kHz - 1 MHz), micro-crack initiation and mechanical friction in concrete and steel generate lower-frequency acoustic transients in the audible spectrum (500 Hz - 20 kHz). By using zero-phase Butterworth filtering and Takens delay-coordinate embedding, EchoSense reconstructs the nonlinear dynamical attractor of the material response, making early damage signatures detectable on commodity smartphone MEMS sensors.",
  },
  {
    q: "Why apply Persistent Homology (TDA) instead of standard Fourier or Wavelet transforms?",
    a: "Acoustic emission signals from cracking are highly non-stationary, transient, and contaminated by ambient environmental noise. Persistent homology via Vietoris-Rips filtration measures the multiscale geometric invariants (H0 connected components and H1 topological loops) of the phase-space trajectory, which are mathematically proven to be invariant under monotonic amplitude warping and noise perturbations.",
  },
  {
    q: "How does Bayesian Online Changepoint Detection (BOCD) provide early warning?",
    a: "BOCD evaluates the exact posterior probability distribution of run-lengths in real time. When structural integrity begins to degrade—such as micro-cracking prior to macroscopic girder failure—the statistical distribution of persistent topological entropy shifts abruptly, triggering a changepoint alert with minimal detection delay.",
  },
  {
    q: "What role does the Conv1D Autoencoder play alongside the Random Forest classifier?",
    a: "The Conv1D Autoencoder serves as an unsupervised anomaly validation branch. Trained exclusively on undamaged baseline acoustic recordings, it flags novel or unseen structural anomalies by computing reconstruction error residuals, providing an independent second-opinion that protects against false negatives.",
  },
];

const FEATURES = [
  {
    icon: Zap,
    title: "Persistent Homology Engine",
    desc: "Vietoris-Rips filtration via GUDHI extracting multiscale H0 connected components and H1 topological cycle invariants.",
  },
  {
    icon: ShieldCheck,
    title: "Smartphone Edge Sensing",
    desc: "Optimized for commodity smartphone microphones; replaces $10,000 laboratory DAQ rigs with distributed edge acoustic monitoring.",
  },
  {
    icon: Activity,
    title: "Bayesian Changepoint Detection",
    desc: "Adams & MacKay online run-length estimation detecting structural damage onset and load transitions in real time.",
  },
  {
    icon: Database,
    title: "Benchmark Validated",
    desc: "Trained and benchmarked on D'Angela & Magliulo (10 MHz Prestressed RC Girders) and Siracusano et al. (500 kHz Concrete AE).",
  },
  {
    icon: Cpu,
    title: "Takens Attractor Embedding",
    desc: "Average Mutual Information delay τ and False Nearest Neighbors dimension d for automated state-space reconstruction.",
  },
  {
    icon: Globe2,
    title: "Conv1D Autoencoder Anomaly",
    desc: "Unsupervised reconstruction residual validation flagging structural deviations without requiring labeled damage training data.",
  },
];

const BENCHMARK_TIERS = [
  {
    name: "Smartphone Edge Sensing",
    spec: "44.1 - 48 kHz",
    desc: "Commodity smartphone MEMS microphone acoustic monitoring",
    features: [
      "Zero-phase 4th-order Butterworth filter",
      "Dynamic STA/LTA acoustic burst trigger",
      "Real-time edge feature extraction",
      "Ambient noise rejection (< 500 Hz)",
      "Wireless telemetry sync",
    ],
    highlight: false,
  },
  {
    name: "Concrete AE Benchmark",
    spec: "500 kHz Sampled",
    desc: "Siracusano et al. standard 3-class crack mode dataset",
    features: [
      "15,000 Training + 1,650 Testing events",
      "Tensile vs Shear vs Mixed-mode cracks",
      "94.1% Accuracy with Random Forest TDA",
      "Topological Persistence Landscapes",
      "Side-by-side CNN comparison",
    ],
    highlight: true,
  },
  {
    name: "Prestressed Bridge Girder",
    spec: "10 MHz Ultrasonic",
    desc: "D'Angela & Magliulo 4-girder cyclic bending benchmark",
    features: [
      "4 Prestressed reinforced concrete girders",
      "Cyclic and monotonic 4-point bending",
      "Leave-one-girder-out cross validation",
      "Crack initiation to failure tracking",
      "ASTM E1316 compliance mapping",
    ],
    highlight: false,
  },
];

export default function HomePage() {
  const { theme, toggleTheme } = useTheme();
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [activeTab, setActiveTab] = useState<"visual" | "metrics">("visual");

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col selection:bg-primary selection:text-primary-foreground">
      {/* Sticky Header */}
      <header className="sticky top-0 z-50 flex items-center justify-between px-6 py-4 bg-background/80 backdrop-blur-md border-b border-border/60">
        <div className="flex items-center gap-8">
          <Link href="/" className="hover:opacity-90 transition-opacity">
            <AppLogo size="md" />
          </Link>
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-muted-foreground">
            <a href="#features" className="hover:text-foreground transition-colors">
              Core Innovations
            </a>
            <a href="#showcase" className="hover:text-foreground transition-colors">
              Attractor & TDA
            </a>
            <a href="#benchmarks" className="hover:text-foreground transition-colors">
              Benchmarks
            </a>
            <Link href="/architecture" className="hover:text-foreground transition-colors">
              Architecture
            </Link>
            <Link href="/docs" className="hover:text-foreground transition-colors">
              Docs & RFC
            </Link>
          </nav>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            className="h-9 w-9 text-muted-foreground hover:text-foreground cursor-pointer"
            title="Toggle theme"
          >
            {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </Button>
          <Link href="/dashboard">
            <Button size="sm" className="gap-2 font-semibold shadow-sm bg-emerald-600 hover:bg-emerald-500 text-white cursor-pointer">
              Launch EchoSense
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative flex flex-col items-center justify-center pt-24 pb-16 px-4 text-center overflow-hidden">
        {/* Glow backdrop */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[650px] h-[380px] bg-emerald-500/10 rounded-full blur-3xl pointer-events-none -z-10" />

        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 backdrop-blur-md text-xs font-semibold mb-6 shadow-sm text-emerald-400">
          <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
          <span>Acoustic Topological Intelligence</span>
          <span className="text-muted-foreground">|</span>
          <span className="text-foreground font-mono">Smartphone Structural Health Monitoring</span>
        </div>

        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight max-w-4xl text-foreground leading-[1.1]">
          Detect Structural Precursors with{" "}
          <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-emerald-500 bg-clip-text text-transparent">
            Computational Topology
          </span>
        </h1>

        <p className="mt-6 text-base sm:text-lg text-muted-foreground max-w-2xl leading-relaxed">
          EchoSense reconstructs the nonlinear state-space dynamics of infrastructure acoustic emissions
          via Takens delay embedding and persistent homology—identifying micro-crack initiation directly from
          commodity smartphone microphones.
        </p>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
          <Link href="/dashboard">
            <Button size="lg" className="gap-2 px-6 h-11 text-base font-semibold shadow-md bg-emerald-600 hover:bg-emerald-500 text-white cursor-pointer">
              Launch Dashboard
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
          <Link href="/architecture">
            <Button size="lg" variant="outline" className="gap-2 px-6 h-11 text-base cursor-pointer">
              View System Architecture
            </Button>
          </Link>
        </div>

        {/* Live Top KPI Strips */}
        <div className="mt-16 w-full max-w-5xl grid grid-cols-2 lg:grid-cols-4 gap-4 px-2">
          {MOCK_KPIS.map((kpi, idx) => (
            <Card key={idx} className="border border-border/80 bg-card/60 backdrop-blur-md text-left">
              <CardContent className="p-4">
                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider block">
                  {kpi.title}
                </span>
                <div className="mt-2 flex items-baseline justify-between">
                  <span className="text-2xl font-bold font-mono text-foreground">{kpi.value}</span>
                  <span className={`text-xs font-semibold font-mono ${kpi.isPositive ? "text-emerald-500" : "text-amber-500"}`}>
                    {kpi.change}
                  </span>
                </div>
                <span className="text-[11px] text-muted-foreground/80 mt-1 block truncate">
                  {kpi.subtext}
                </span>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Interactive Showcase Preview */}
      <section id="showcase" className="max-w-6xl mx-auto px-4 py-16 w-full">
        <div className="rounded-2xl border border-border bg-card/80 backdrop-blur-xl shadow-2xl overflow-hidden">
          {/* Header Bar */}
          <div className="flex flex-wrap items-center justify-between border-b border-border/60 px-6 py-4 bg-muted/20">
            <div className="flex items-center gap-3">
              <div className="flex gap-1.5">
                <span className="h-3 w-3 rounded-full bg-red-500/80 inline-block" />
                <span className="h-3 w-3 rounded-full bg-amber-500/80 inline-block" />
                <span className="h-3 w-3 rounded-full bg-emerald-500/80 inline-block" />
              </div>
              <span className="font-mono text-xs text-muted-foreground">
                echosense://telemetry/live-attractor-stream
              </span>
            </div>
            <div className="flex gap-2">
              <Button
                variant={activeTab === "visual" ? "secondary" : "ghost"}
                size="sm"
                onClick={() => setActiveTab("visual")}
                className="text-xs h-8 cursor-pointer"
              >
                Acoustic Envelope & TDA
              </Button>
              <Button
                variant={activeTab === "metrics" ? "secondary" : "ghost"}
                size="sm"
                onClick={() => setActiveTab("metrics")}
                className="text-xs h-8 cursor-pointer"
              >
                BOCD Changepoints
              </Button>
            </div>
          </div>

          {/* Chart View */}
          <div className="p-6">
            <div className="h-64 sm:h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={MOCK_TREND_DATA}>
                  <defs>
                    <linearGradient id="gradientA" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                    </linearGradient>
                    <linearGradient id="gradientB" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="time" stroke="#71717a" fontSize={11} tickLine={false} />
                  <YAxis stroke="#71717a" fontSize={11} tickLine={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "rgba(9, 9, 11, 0.9)",
                      borderColor: "#27272a",
                      borderRadius: "8px",
                      fontSize: "12px",
                      color: "#f4f4f5",
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="valueB"
                    name="Persistent Entropy H1"
                    stroke="#10b981"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#gradientA)"
                  />
                  <Area
                    type="monotone"
                    dataKey="valueC"
                    name="BOCD Changepoint Prob"
                    stroke="#6366f1"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#gradientB)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </section>

      {/* Core Innovations / Feature Grid */}
      <section id="features" className="max-w-6xl mx-auto px-4 py-16 w-full">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <Badge variant="outline" className="mb-3 font-mono text-emerald-500 border-emerald-500/30">
            Mathematical & Experimental Foundations
          </Badge>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            Built for Infrastructure Resilience
          </h2>
          <p className="mt-4 text-muted-foreground text-sm sm:text-base">
            From raw smartphone acoustic signals to topological invariants, classification, and changepoints.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {FEATURES.map((f, i) => {
            const Icon = f.icon;
            return (
              <Card key={i} className="border border-border/80 bg-card/60 backdrop-blur-md hover:border-emerald-500/50 transition-colors">
                <CardContent className="p-6">
                  <div className="h-10 w-10 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400 mb-4">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="font-bold text-base text-foreground">{f.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                    {f.desc}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>

      {/* Benchmark Tiers */}
      <section id="benchmarks" className="max-w-6xl mx-auto px-4 py-16 w-full border-t border-border/60">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <Badge variant="outline" className="mb-3 font-mono text-emerald-500 border-emerald-500/30">
            Experimental Verification
          </Badge>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            Validated Across Benchmark Datasets
          </h2>
          <p className="mt-4 text-muted-foreground text-sm sm:text-base">
            Rigorous evaluation against laboratory-grade piezoelectric sensors and acoustic emission benchmarks.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {BENCHMARK_TIERS.map((tier, idx) => (
            <Card
              key={idx}
              className={`border relative bg-card/60 backdrop-blur-md flex flex-col justify-between ${
                tier.highlight ? "border-emerald-500 shadow-xl ring-1 ring-emerald-500/20" : "border-border/80"
              }`}
            >
              {tier.highlight && (
                <div className="absolute -top-3 right-6 bg-emerald-500 text-zinc-950 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider">
                  Primary Evaluation
                </div>
              )}
              <CardContent className="p-6">
                <h3 className="font-bold text-lg text-foreground">{tier.name}</h3>
                <div className="mt-2 text-2xl font-extrabold font-mono text-emerald-400">
                  {tier.spec}
                </div>
                <p className="mt-2 text-xs text-muted-foreground">{tier.desc}</p>
                <div className="my-6 border-t border-border/60" />
                <ul className="space-y-2.5 text-xs text-muted-foreground">
                  {tier.features.map((feat, fIdx) => (
                    <li key={fIdx} className="flex items-center gap-2">
                      <Check className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
              <div className="p-6 pt-0">
                <Link href="/analytics" className="w-full block">
                  <Button
                    variant={tier.highlight ? "default" : "outline"}
                    className={`w-full text-xs font-semibold cursor-pointer ${
                      tier.highlight ? "bg-emerald-600 hover:bg-emerald-500 text-white" : ""
                    }`}
                  >
                    View Benchmark Results
                  </Button>
                </Link>
              </div>
            </Card>
          ))}
        </div>
      </section>

      {/* FAQ Accordion */}
      <section className="max-w-4xl mx-auto px-4 py-16 w-full border-t border-border/60">
        <div className="text-center mb-10">
          <Badge variant="outline" className="mb-3 font-mono text-emerald-500 border-emerald-500/30">
            Frequently Answered Questions
          </Badge>
          <h2 className="text-3xl font-extrabold tracking-tight">
            Scientific & Technical FAQ
          </h2>
        </div>

        <div className="space-y-4">
          {FAQS.map((faq, idx) => (
            <div
              key={idx}
              className="rounded-xl border border-border/80 bg-card/60 backdrop-blur-md overflow-hidden"
            >
              <button
                onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                className="flex w-full items-center justify-between p-4 text-left font-semibold text-sm sm:text-base text-foreground cursor-pointer hover:bg-muted/30 transition-colors"
              >
                <span>{faq.q}</span>
                <ChevronDown
                  className={`h-4 w-4 transition-transform text-muted-foreground ${
                    openFaq === idx ? "rotate-180 text-emerald-400" : ""
                  }`}
                />
              </button>
              {openFaq === idx && (
                <div className="px-4 pb-4 pt-1 text-xs sm:text-sm text-muted-foreground leading-relaxed border-t border-border/40">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto border-t border-border/60 py-10 px-6 bg-card/40 backdrop-blur-md">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-3">
            <AppLogo size="sm" />
            <span>EchoSense © 2026. Academic Research Project by Gagandeep Rai & Karthik K P.</span>
          </div>
          <div className="flex items-center gap-6">
            <Link href="/architecture" className="hover:text-foreground transition-colors">
              Architecture
            </Link>
            <Link href="/docs" className="hover:text-foreground transition-colors">
              Docs & RFC
            </Link>
            <a
              href="https://github.com/karthik5033/EchoSense"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-foreground transition-colors flex items-center gap-1"
            >
              <span>GitHub</span>
              <ExternalLink className="h-3 w-3" />
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
