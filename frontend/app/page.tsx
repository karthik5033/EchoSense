"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Layers,
  Check,
  ChevronDown,
  Terminal,
  Wrench,
  Globe,
  Database,
  Search,
  Bell,
  Headphones,
  Copy,
  ChevronRight,
  Lock,
  Boxes,
  FileCode,
  MessageSquare,
  Radio,
  HardDrive,
  CheckCircle2,
  Code2,
  Smartphone,
  Clock,
  Send,
  Paperclip,
  Mic,
  CheckSquare,
  Square,
  ArrowRight,
  Shield,
  Zap,
  Activity,
  Sparkles,
  Play,
  Pause,
  RotateCw,
} from "lucide-react";
import { TakensPhaseSpace } from "@/components/tda/TakensPhaseSpace";
import { PersistenceDiagram } from "@/components/tda/PersistenceDiagram";
import { BettiCurvesChart } from "@/components/tda/BettiCurvesChart";

// Scientific and Engineering Stacks for TopoAE
const FRAMEWORKS = [
  {
    name: "Python",
    icon: (
      <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
        <path d="M11.9 2c-3.1 0-5 1.5-5 3.5V7h5.1v.8H5.2c-2.3 0-4.2 1.9-4.2 4.2 0 2.3 1.9 4.2 4.2 4.2h1.6v-2.3c0-1.7 1.4-3.1 3.1-3.1h5.1V9c0-2-1.9-3.5-5-3.5h1.9zm-1.8 1.6c.5 0 .9.4.9.9s-.4.9-.9.9-.9-.4-.9-.9.4-.9.9-.9zM12.1 22c3.1 0 5-1.5 5-3.5V17h-5.1v-.8h6.8c2.3 0 4.2-1.9 4.2-4.2 0-2.3-1.9-4.2-4.2-4.2h-1.6v2.3c0 1.7-1.4 3.1-3.1 3.1h-5.1V15c0 2 1.9 3.5 5 3.5h-1.9zm1.8-1.6c-.5 0-.9-.4-.9-.9s.4-.9.9-.9.9.4.9.9-.4.9-.9.9z" />
      </svg>
    ),
  },
  {
    name: "PyTorch",
    icon: (
      <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M13.5 2.5L7 9.5l4 4-5 5.5" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="16" cy="7" r="1.5" fill="currentColor" />
        <path d="M18 12c0 3.3-2.7 6-6 6a6 6 0 0 1-4.2-1.8" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    name: "GUDHI TDA Engine",
    icon: (
      <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <polygon points="12 3 21 19 3 19" />
        <circle cx="12" cy="11" r="2.5" fill="currentColor" fillOpacity="0.3" />
        <line x1="12" y1="3" x2="12" y2="19" strokeDasharray="2,2" />
      </svg>
    ),
  },
  {
    name: "NumPy",
    icon: (
      <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <rect x="3" y="3" width="18" height="18" rx="2" />
        <line x1="3" y1="9" x2="21" y2="9" />
        <line x1="3" y1="15" x2="21" y2="15" />
        <line x1="9" y1="3" x2="9" y2="21" />
        <line x1="15" y1="3" x2="15" y2="21" />
      </svg>
    ),
  },
  {
    name: "SciPy Signal",
    icon: (
      <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M2 12c2.5-8 4.5-8 7 0s4.5 8 7 0 4.5-8 6 0" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    name: "Scikit-Learn",
    icon: (
      <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <circle cx="8" cy="8" r="4" />
        <circle cx="16" cy="14" r="5" />
        <line x1="11" y1="10.5" x2="13" y2="12" />
      </svg>
    ),
  },
  {
    name: "FastAPI",
    icon: (
      <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" fill="currentColor" fillOpacity="0.2" />
      </svg>
    ),
  },
  {
    name: "Next.js",
    icon: (
      <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5" fill="none" />
        <path d="M9 8v8l7-8v8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    name: "Android MEMS",
    icon: (
      <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
        <circle cx="8" cy="9" r="1" />
        <circle cx="16" cy="9" r="1" />
        <path d="M5 12h14v7a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-7z" fill="none" stroke="currentColor" strokeWidth="1.8" />
        <path d="M7 5l-2-2m12 2l2-2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        <path d="M5 11a7 7 0 0 1 14 0" stroke="currentColor" strokeWidth="1.8" />
      </svg>
    ),
  },
  {
    name: "Apple CoreAudio",
    icon: (
      <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
        <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.36c.64-.78 1.08-1.86.96-2.95-.93.04-2.07.62-2.73 1.4-.58.67-1.09 1.77-.95 2.83 1.04.08 2.1-.53 2.72-1.28" />
      </svg>
    ),
  },
  {
    name: "Docker Container",
    icon: (
      <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <rect x="2" y="8" width="4" height="3" />
        <rect x="7" y="8" width="4" height="3" />
        <rect x="12" y="8" width="4" height="3" />
        <rect x="7" y="4" width="4" height="3" />
        <rect x="12" y="4" width="4" height="3" />
        <path d="M2 13c1 2 4 4 10 4s9-2 10-4c0 4-3 7-10 7S2 17 2 13z" />
      </svg>
    ),
  },
  {
    name: "HDF5 Storage",
    icon: (
      <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <ellipse cx="12" cy="5" rx="9" ry="3" />
        <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3" />
        <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" />
      </svg>
    ),
  },
  {
    name: "BOCD Engine",
    icon: (
      <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M3 20h18M5 16l4-8 5 6 5-10" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="19" cy="4" r="1.5" fill="#FF5500" />
      </svg>
    ),
  },
  {
    name: "Mendeley Data",
    icon: (
      <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <circle cx="12" cy="12" r="9" />
        <path d="M8 12h8M12 8v8" strokeLinecap="round" />
      </svg>
    ),
  },
];

// Top Acoustic Emission Sensor Channels
const CONSUMERS = [
  { ch: "CH-01", name: "Girder G1 Midspan", rate: "10 MHz", usage: "148.6 kHz", status: "active" },
  { ch: "CH-02", name: "Girder G1 Shear Key", rate: "10 MHz", usage: "162.4 kHz", status: "active" },
  { ch: "CH-03", name: "Prestressing Strand S3", rate: "10 MHz", usage: "135.2 kHz", status: "active" },
  { ch: "CH-04", name: "Concrete Cylinder C-14 Top", rate: "500 kHz", usage: "88.4 kHz", status: "standby" },
  { ch: "CH-05", name: "Concrete Cylinder C-14 Base", rate: "500 kHz", usage: "92.1 kHz", status: "standby" },
  { ch: "CH-06", name: "Smartphone MEMS Node A", rate: "48 kHz", usage: "18.5 kHz", status: "active" },
];

// Acoustic Emission Event Records (Prestressed Girder & Concrete Tests)
const LAP_TIMES_DATA = [
  {
    id: "AE-1042",
    driver: "Bridge Girder G1 (Midspan)",
    code: "TENSILE",
    team: "Block #4",
    pos: 1,
    lap_ms: 1180,
  },
  {
    id: "AE-1043",
    driver: "Bridge Girder G1 (Shear Key)",
    code: "SHEAR",
    team: "Block #4",
    pos: 2,
    lap_ms: 940,
  },
  {
    id: "AE-1044",
    driver: "Prestressing Strand S3",
    code: "MIXED",
    team: "Block #3",
    pos: 3,
    lap_ms: 1420,
  },
  {
    id: "AE-1045",
    driver: "Concrete Cylinder C-14",
    code: "TENSILE",
    team: "Block #2",
    pos: 4,
    lap_ms: 650,
  },
];

// Scientific Rigor & Standards (Precursor Detection Validation)
const SECURITY_CARDS = [
  {
    title: "Noise resilience",
    desc: "Persistent topological features remain stable down to -10 dB SNR under environmental traffic noise.",
    icon: (
      <svg className="w-4 h-4 text-[#FF5500]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        <path d="m9 12 2 2 4-4" />
      </svg>
    ),
  },
  {
    title: "Zero test leakage",
    desc: "Strict leave-one-girder-out cross-validation guarantees zero test contamination across specimens.",
    icon: (
      <svg className="w-4 h-4 text-[#FF5500]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
        <path d="M7 11V7a5 5 0 0 1 10 0v4" />
        <circle cx="12" cy="16" r="1" />
      </svg>
    ),
  },
  {
    title: "Reproducible TDA",
    desc: "Deterministic Vietoris-Rips simplicial filtration computed via the validated GUDHI engine.",
    icon: (
      <svg className="w-4 h-4 text-[#FF5500]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <path d="m9 12 2 2 4-4" />
      </svg>
    ),
  },
  {
    title: "10 MHz ingestion",
    desc: "Handles continuous high-speed ultrasonic waveforms with streaming zero-copy ring buffers.",
    icon: (
      <svg className="w-4 h-4 text-[#FF5500]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="3" width="20" height="7" rx="2" />
        <rect x="2" y="14" width="20" height="7" rx="2" />
        <line x1="6" y1="6.5" x2="6.01" y2="6.5" />
        <line x1="6" y1="17.5" x2="6.01" y2="17.5" />
      </svg>
    ),
  },
  {
    title: "EN 1330-9 standard",
    desc: "Calibrated to European Non-Destructive Testing acoustic emission equipment guidelines.",
    icon: (
      <svg className="w-4 h-4 text-[#FF5500]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <line x1="2" y1="12" x2="22" y2="12" />
        <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1 4-10z" />
      </svg>
    ),
  },
  {
    title: "ASTM E1316 testing",
    desc: "Compliant with standard terminology for acoustic examination of reinforced concrete.",
    icon: (
      <svg className="w-4 h-4 text-[#FF5500]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="12 2 21.5 9 18 21 6 21 2.5 9" />
      </svg>
    ),
  },
  {
    title: "Audit-ready reports",
    desc: "Automated PDF structural assessment reports with full mathematical parameter provenance.",
    icon: (
      <svg className="w-4 h-4 text-[#FF5500]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
        <path d="M3.22 12H9.5l1.5-3 2 6 1.5-3h6.28" />
      </svg>
    ),
  },
  {
    title: "Open research data",
    desc: "Fully compatible with Mendeley Data, Zenodo, and open civil structural health monitoring repositories.",
    icon: (
      <svg className="w-4 h-4 text-[#FF5500]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <path d="m16 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z" />
        <path d="m2 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z" />
        <path d="M7 21h10" />
        <path d="M12 3v18" />
        <path d="M3 7h2c2 0 5-1 7-2 2 1 5 2 7 2h2" />
      </svg>
    ),
  },
];

// Scale Stat Cards
const SCALE_STATS = [
  { value: "42.8K+", label: "Bridge AE events" },
  { value: "16.6K+", label: "Benchmark hits" },
  { value: "94.6%", label: "Classification acc" },
  { value: "0.978", label: "ROC-AUC score" },
  { value: "340 ms", label: "Precursor warning lead" },
  { value: "10 MHz", label: "Sampling bandwidth" },
  { value: "0.880", label: "Max H₁ persistence" },
];

// Pricing & Deployment Tiers
const PRICING_PLANS = [
  {
    name: "Academic",
    badge: null,
    price: "$0",
    period: "",
    desc: "A great fit for university laboratories, student theses, and open research validation.",
    buttonText: "Start research",
    highlight: false,
  },
  {
    name: "Field Node",
    badge: null,
    price: "$29",
    period: "/month",
    desc: "For structural engineers who need edge smartphone acoustic capture and rapid damage assessment.",
    buttonText: "Deploy node",
    highlight: false,
  },
  {
    name: "Continuous SHM",
    badge: "Recommended",
    price: "$99",
    period: "/month",
    desc: "For full bridge girder monitoring with real-time BOCD changepoint alerts and TDA feature logging.",
    buttonText: "Start monitoring",
    highlight: true,
  },
  {
    name: "Infrastructure",
    badge: null,
    price: "Custom",
    period: "",
    desc: "For state departments of transportation, railway networks, and critical civil infrastructure.",
    buttonText: "Contact engineers",
    highlight: false,
  },
];

// Topological ML Benchmark Arena Data
const BENCHMARK_MODELS = [
  {
    model: "TopoAE (Our Framework)",
    cost: "0.42s",
    overall: "93.8%",
    auth: "96.2%",
    tables: "93.1%",
    functions: "91.4%",
    storage: "90.8%",
    sites: "4.2 ms",
    messaging: "340 ms",
    highlight: true,
  },
  {
    model: "AE-DenseNet (Barbosh 2024)",
    cost: "2.85s",
    overall: "89.2%",
    auth: "91.4%",
    tables: "87.0%",
    functions: "85.2%",
    storage: "78.2%",
    sites: "28.5 ms",
    messaging: "180 ms",
    highlight: false,
  },
  {
    model: "Conv1D-AE Baseline",
    cost: "0.84s",
    overall: "86.5%",
    auth: "88.7%",
    tables: "84.3%",
    functions: "82.0%",
    storage: "74.1%",
    sites: "8.4 ms",
    messaging: "120 ms",
    highlight: false,
  },
  {
    model: "Conventional AE (Shi 2024)",
    cost: "0.18s",
    overall: "84.1%",
    auth: "85.2%",
    tables: "83.0%",
    functions: "79.5%",
    storage: "68.5%",
    sites: "1.8 ms",
    messaging: "60 ms",
    highlight: false,
  },
  {
    model: "Standard Random Forest",
    cost: "0.21s",
    overall: "81.2%",
    auth: "82.0%",
    tables: "80.4%",
    functions: "76.8%",
    storage: "65.2%",
    sites: "2.1 ms",
    messaging: "45 ms",
    highlight: false,
  },
];

const CONSOLE_DEMO_QUERIES = [
  {
    query: "Analyze fatigue block #4 for Bridge Girder G1. Are there active shear crack precursors?",
    girder: "Girder G1",
    model: "TopoAE-RF v1.2",
    step1Name: "takens.phase_space_reconstruct(τ=4, d=3)",
    step1Metric: "FNN < 1.2% • 14ms",
    step2Name: "gudhi.compute_vietoris_rips_persistence(max_dim=1)",
    step2Metric: "1,420 simplices • 21ms",
    response: "Persistent H₁ topological loop detected (persistence = 0.880). BOCD flagged structural changepoint at t=3.85s with 97.4% confidence. Tensile-to-shear transition active on Girder G1 midspan.",
    sql: "SELECT event_id, crack_mode, peak_amp_mv, persistence_h1 FROM ae_events WHERE fatigue_block = 4",
    tableName: "events_block4",
    totalRows: "42,810 rows logged",
    events: [
      { id: "EVT-8821", mode: "Tensile Mode", amp: "1,180 mV", h1: "0.880", freq: "148.6 kHz", status: "Precursor", isCritical: false, wavePath: "M0,10 Q5,2 10,10 T20,10 T30,4 T40,16 T50,10 T60,10" },
      { id: "EVT-8822", mode: "Shear Mode", amp: "940 mV", h1: "0.795", freq: "162.4 kHz", status: "Precursor", isCritical: false, wavePath: "M0,10 Q5,4 10,10 T20,6 T30,14 T40,7 T50,12 T60,10" },
      { id: "EVT-8823", mode: "Mixed-Mode", amp: "1,420 mV", h1: "0.842", freq: "135.2 kHz", status: "Critical", isCritical: true, wavePath: "M0,10 Q5,1 10,10 T20,18 T30,1 T40,19 T50,10 T60,10" },
    ]
  },
  {
    query: "Run Takens delay embedding on Prestressing Strand S3. Evaluate H₁ loop bifurcations under cyclic load.",
    girder: "Strand S3",
    model: "TopoAE-RF v1.2",
    step1Name: "takens.phase_space_reconstruct(τ=6, d=4)",
    step1Metric: "Mutual Info min: τ=6 • 18ms",
    step2Name: "gudhi.compute_vietoris_rips_persistence(max_dim=1)",
    step2Metric: "2,150 simplices • 26ms",
    response: "High-amplitude acoustic emission burst with H₁ persistence = 0.842. Conv1D-AE residual exceeds 3σ threshold, indicating micro-frictional slippage along strand tendon anchor.",
    sql: "SELECT event_id, crack_mode, peak_amp_mv, persistence_h1 FROM ae_events WHERE transducer = 'STRAND_S3'",
    tableName: "strand_s3_events",
    totalRows: "18,450 rows logged",
    events: [
      { id: "EVT-9104", mode: "Frictional Slip", amp: "1,420 mV", h1: "0.842", freq: "135.2 kHz", status: "Critical", isCritical: true, wavePath: "M0,10 Q5,1 10,10 T20,18 T30,1 T40,19 T50,10 T60,10" },
      { id: "EVT-9105", mode: "Frictional Slip", amp: "1,260 mV", h1: "0.812", freq: "131.8 kHz", status: "Critical", isCritical: true, wavePath: "M0,10 Q5,3 10,10 T20,16 T30,3 T40,17 T50,10 T60,10" },
      { id: "EVT-9106", mode: "Tensile Micro", amp: "880 mV", h1: "0.710", freq: "155.0 kHz", status: "Precursor", isCritical: false, wavePath: "M0,10 Q5,6 10,10 T20,8 T30,12 T40,8 T50,11 T60,10" },
    ]
  },
  {
    query: "Stream BOCD hazard evaluation across Concrete Cylinder C-14. Flag sudden regime changes in cyclic block #2.",
    girder: "Cylinder C-14",
    model: "BOCD-Online v2.0",
    step1Name: "bocd.evaluate_run_length_posterior(hazard_prior=0.004)",
    step1Metric: "Run-length r_t = 168 • 9ms",
    step2Name: "conv1d_ae.reconstruct_latent_manifold(bottleneck=8)",
    step2Metric: "Latent MSE = 0.038 • 16ms",
    response: "BOCD hazard function collapsed to r_t=0 at t=12.4s. Structural regime changepoint validated with 98.2% posterior certainty. Precursor lead time: 420ms before tensile crack propagation.",
    sql: "SELECT event_id, crack_mode, peak_amp_mv, persistence_h1 FROM ae_events WHERE specimen = 'C-14' AND changepoint = TRUE",
    tableName: "c14_changepoints",
    totalRows: "9,620 rows logged",
    events: [
      { id: "EVT-7301", mode: "Regime Shift", amp: "1,310 mV", h1: "0.865", freq: "142.1 kHz", status: "Critical", isCritical: true, wavePath: "M0,10 Q5,2 10,10 T20,17 T30,2 T40,18 T50,10 T60,10" },
      { id: "EVT-7302", mode: "Tensile Onset", amp: "990 mV", h1: "0.780", freq: "151.3 kHz", status: "Precursor", isCritical: false, wavePath: "M0,10 Q5,4 10,10 T20,7 T30,13 T40,7 T50,12 T60,10" },
      { id: "EVT-7303", mode: "Elastic Energy", amp: "650 mV", h1: "0.620", freq: "170.4 kHz", status: "Precursor", isCritical: false, wavePath: "M0,10 Q5,6 10,10 T20,8 T30,12 T40,8 T50,11 T60,10" },
    ]
  }
];

export default function EchoSenseLandingPage() {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [activeTimeRange, setActiveTimeRange] = useState<"15m" | "1h" | "1d">("1h");
  const [selectedDbTab, setSelectedDbTab] = useState<"tables" | "docs" | "vectors">("tables");
  const [selectedManagedDb, setSelectedManagedDb] = useState<"postgres" | "mysql">("postgres");
  const [selectedRow, setSelectedRow] = useState<number>(0);
  const [activeCategory, setActiveCategory] = useState<"BUILD" | "DEPLOY" | "PROTECT" | "SCALE">("BUILD");
  const [searchQuery, setSearchQuery] = useState("");
  const [messagingChannel, setMessagingChannel] = useState<"email" | "sms" | "push">("email");
  const [docTaskDone, setDocTaskDone] = useState(false);
  const [promptText, setPromptText] = useState("");
  const [activeTestimonial, setActiveTestimonial] = useState(0);
  const [tdaVisualMode, setTdaVisualMode] = useState<"attractor" | "persistence" | "betti">("attractor");
  const [activeBocdStep, setActiveBocdStep] = useState<number>(0);
  const [bocdRunLength, setBocdRunLength] = useState<number>(84);
  const [isBocdStreaming, setIsBocdStreaming] = useState<boolean>(true);

  // Auto-advancing BOCD anomaly detection workflow loop
  useEffect(() => {
    if (!isBocdStreaming) return;
    const timer = setInterval(() => {
      setActiveBocdStep((prev) => (prev + 1) % 4);
      setBocdRunLength((prev) => (prev >= 170 ? 14 : prev + Math.floor(Math.random() * 8 + 4)));
    }, 2400);
    return () => clearInterval(timer);
  }, [isBocdStreaming]);

  // TopoAE Interactive Console States
  const [consoleQueryIdx, setConsoleQueryIdx] = useState<number>(0);
  const [consoleStage, setConsoleStage] = useState<number>(3); // 0: query loaded, 1: takens, 2: gudhi, 3: result
  const [selectedEventIdx, setSelectedEventIdx] = useState<number>(0);
  const [isConsolePlaying, setIsConsolePlaying] = useState<boolean>(true);
  const [activeModelDropdown, setActiveModelDropdown] = useState<string>("TopoAE-RF v1.2");
  const [activeGirderDropdown, setActiveGirderDropdown] = useState<string>("Girder G1");
  const [ringBufferPct, setRingBufferPct] = useState<number>(68);

  // Auto-cycling console execution simulation
  useEffect(() => {
    if (!isConsolePlaying) return;
    const timer = setInterval(() => {
      setConsoleStage((prev) => {
        if (prev < 3) {
          return prev + 1;
        } else {
          setConsoleQueryIdx((q) => (q + 1) % CONSOLE_DEMO_QUERIES.length);
          setSelectedEventIdx((e) => (e + 1) % 3);
          return 0;
        }
      });
      setRingBufferPct(64 + Math.floor(Math.random() * 9));
    }, 3400);
    return () => clearInterval(timer);
  }, [isConsolePlaying]);

  const handlePromptSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!promptText.trim()) return;
    setConsoleStage(0);
    setTimeout(() => setConsoleStage(1), 500);
    setTimeout(() => setConsoleStage(2), 1300);
    setTimeout(() => setConsoleStage(3), 2200);
    setPromptText("");
  };

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(key);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="min-h-screen bg-[#19191c] text-[#e4e4e7] flex flex-col font-sans selection:bg-[#FF5500] selection:text-white antialiased overflow-x-hidden">
      
      {/* ========================================================= */}
      {/* TOP NAVIGATION BAR                                        */}
      {/* ========================================================= */}
      <header className="sticky top-0 z-50 w-full bg-[#19191c]/95 backdrop-blur-md border-b border-[#25252b] transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          
          <div className="flex items-center gap-8">
            <Link
              href="/"
              className="inline-flex items-center gap-2.5 group select-none"
            >
              <div className="relative flex items-center justify-center shrink-0 w-[24px] h-[24px]">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  className="w-full h-full transform transition-transform duration-200 group-hover:scale-105"
                >
                  <path
                    d="M12 2C6.477 2 2 6.477 2 12c0 5.523 4.477 10 10 10 2.215 0 4.266-.72 5.928-1.936l-3.32-3.32A5.328 5.328 0 0112 17.333c-2.946 0-5.333-2.388-5.333-5.333 0-2.946 2.387-5.333 5.333-5.333 1.942 0 3.642 1.042 4.566 2.597l4.02-2.01C18.825 4.095 15.65 2 12 2z"
                    fill="url(#echoNavGrad)"
                  />
                  <path
                    d="M21.99 12c0 1.764-.46 3.42-1.267 4.858l-3.95-1.975A5.27 5.27 0 0017.333 12c0-.987-.27-1.912-.74-2.705l3.95-1.975c.954 1.458 1.447 3.037 1.447 4.68z"
                    fill="#FF5500"
                  />
                  <defs>
                    <linearGradient id="echoNavGrad" x1="2" y1="2" x2="22" y2="22" gradientUnits="userSpaceOnUse">
                      <stop stopColor="#FF5500" />
                      <stop offset="0.6" stopColor="#ea3467" />
                      <stop offset="1" stopColor="#cc305c" />
                    </linearGradient>
                  </defs>
                </svg>
              </div>

              <span className="font-[600] text-white tracking-[-0.04em] font-sans text-[19px] leading-none">
                EchoSense
              </span>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#FF5500]/15 text-[#FF5500] border border-[#FF5500]/30 font-semibold uppercase tracking-wider ml-0.5">
                TopoAE
              </span>
            </Link>

            <nav className="hidden lg:flex items-center gap-6 text-[14px] font-[450] text-[#cfcfd8]">
              <Link href="/dashboard" className="hover:text-white transition-colors">
                Overview
              </Link>
              <Link href="/analysis" className="hover:text-white transition-colors">
                Pipeline
              </Link>
              <Link href="/monitor" className="hover:text-white transition-colors">
                Signal Monitor
              </Link>
              <Link href="/compare" className="hover:text-white transition-colors">
                Benchmarks
              </Link>
              <Link href="/datasets" className="hover:text-white transition-colors">
                Datasets
              </Link>
              <Link href="/reports" className="hover:text-white transition-colors">
                Reports
              </Link>
              <Link
                href="/docs"
                className="relative flex items-center gap-1 hover:text-white transition-colors"
              >
                <span>Docs</span>
                <span className="w-1.5 h-1.5 rounded-full bg-[#FF5500] shadow-[0_0_8px_#FF5500] -mt-2 -mr-1 animate-pulse" />
              </Link>
            </nav>
          </div>

          <div className="flex items-center gap-4">
            <Link
              href="/dashboard"
              className="text-sm font-[450] text-[#cfcfd8] hover:text-white transition-colors"
            >
              Launch App
            </Link>
            <Link
              href="/analysis"
              className="bg-[#FF5500] hover:bg-[#E54B00] text-white text-sm font-semibold px-4 py-1.5 rounded-lg shadow-[0_0_15px_rgba(255,85,0,0.35)] hover:shadow-[0_0_20px_rgba(255,85,0,0.55)] transition-all transform hover:-translate-y-0.5 active:translate-y-0"
            >
              Start Analysis
            </Link>
          </div>
        </div>
      </header>

      {/* ========================================================= */}
      {/* HERO SECTION                                              */}
      {/* ========================================================= */}
      <section className="relative pt-16 pb-12 px-4 sm:px-6 flex flex-col items-center text-center overflow-hidden">
        
        {/* Soft atmospheric ambient glow */}
        <div className="absolute top-[38%] left-1/2 -translate-x-1/2 -translate-y-1/2 w-[850px] h-[450px] bg-[radial-gradient(ellipse_at_center,rgba(255,85,0,0.08)_0%,rgba(255,122,51,0.02)_50%,transparent_75%)] pointer-events-none -z-10" />

        {/* Breaking Announcement Pill */}
        <Link
          href="/docs"
          className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full border border-[#2d2d35] bg-[#1c1c21]/90 hover:border-[#FF5500]/50 text-xs transition-colors cursor-pointer mb-8 group backdrop-blur-sm"
        >
          <span className="text-sm">⚡</span>
          <span className="text-[#FF5500] font-medium">EchoSense 2.0</span>
          <span className="text-[#d4d4d8] group-hover:text-white transition-colors">
            Continuous topological precursor detection for civil infrastructure →
          </span>
        </Link>

        {/* Hero Title with Balanced Product Phrasing */}
        <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-[68px] font-[550] tracking-[-0.035em] max-w-5xl leading-[1.12] mx-auto text-center">
          <span className="inline-block sm:whitespace-nowrap">
            <span className="bg-gradient-to-r from-[#FFB58A] via-[#FF7A33] to-[#FFA066] bg-clip-text text-transparent">
              Topological AI
            </span>{" "}
            <span className="text-[#fafafa]">for structural</span>
          </span>
          <br />
          <span className="inline-block sm:whitespace-nowrap">
            <span className="bg-gradient-to-r from-[#FFB58A] to-[#FF7A33] bg-clip-text text-transparent">
              damage precursor
            </span>{" "}
            <span className="text-[#fafafa]">detection</span>
            <span className="inline-block text-[#FF5500] font-bold">_</span>
          </span>
        </h1>

        {/* Subtitle */}
        <p className="mt-6 text-[15px] sm:text-[17px] text-[#a1a1aa] font-normal max-w-[720px] mx-auto leading-[1.65]">
          EchoSense is an acoustic intelligence platform that uses topological data analysis to detect micro-crack precursors from smartphone and ultrasonic signals — catching structural damage up to 340ms before macroscopic failure.
        </p>

        {/* Action Buttons */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3.5">
          <Link
            href="/analysis"
            className="bg-[#FF5500] hover:bg-[#E54B00] text-white font-medium px-5 py-2.5 rounded-lg shadow-[0_0_20px_rgba(255,85,0,0.35)] hover:shadow-[0_0_25px_rgba(255,85,0,0.55)] transition-all transform hover:-translate-y-0.5 active:translate-y-0 text-sm"
          >
            Start analysis
          </Link>
          <Link
            href="/dashboard"
            className="bg-[#1e1e23] hover:bg-[#25252c] border border-[#2e2e37] text-[#d4d4d8] hover:text-white font-medium px-5 py-2.5 rounded-lg transition-all text-sm"
          >
            Explore platform
          </Link>
        </div>

        {/* TDA Engine Included Badge */}
        <div className="mt-8 inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-[#2b2b32] bg-[#1a1a1f] text-[#9a9aa5] text-[11px] font-medium">
          <svg className="w-3.5 h-3.5 text-zinc-400" viewBox="0 0 16 16" fill="currentColor">
            <path d="M8 1L1 8l7 7 7-7-7-7zm0 2.83L12.17 8 8 12.17 3.83 8 8 3.83z" />
          </svg>
          <span>Topological Data Analysis &amp; BOCD engine included</span>
        </div>

        {/* ========================================================= */}
        {/* INTERACTIVE SHOWCASE CONSOLE (Acoustics & TDA)             */}
        {/* ========================================================= */}
        <div className="mt-12 w-full max-w-6xl mx-auto rounded-2xl border border-[#272733] bg-[#16161b] shadow-[0_25px_80px_rgba(0,0,0,0.8)] overflow-hidden text-left text-xs">
          
          <div className="flex items-center justify-between px-4 py-2.5 border-b border-[#23232c] bg-[#141418]">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-zinc-700/80 hover:bg-red-500/80 transition-colors inline-block" />
                <span className="w-2.5 h-2.5 rounded-full bg-zinc-700/80 hover:bg-yellow-500/80 transition-colors inline-block" />
                <span className="w-2.5 h-2.5 rounded-full bg-zinc-700/80 hover:bg-green-500/80 transition-colors inline-block" />
              </div>
              <div className="flex items-center gap-1.5 text-zinc-400 text-[11px] font-sans ml-2">
                <span className="font-semibold text-zinc-300">EchoSense</span>
                <span className="text-zinc-600">›</span>
                <span className="text-zinc-400">Prestressed Bridge Girder G1</span>
                <span className="text-zinc-600">›</span>
                <span className="text-zinc-500">AE Sensor Ch-02 (10 MHz)</span>
              </div>
            </div>
          </div>

          <div className="flex flex-col lg:flex-row min-h-[580px]">
            <aside className="w-full lg:w-60 border-b lg:border-b-0 lg:border-r border-[#23232c] bg-[#141418] p-3 flex flex-col justify-between shrink-0">
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-[#202027]">
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded-md bg-[#FF5500]/20 flex items-center justify-center text-[#FF5500]">
                      <Activity className="w-3.5 h-3.5" />
                    </div>
                    <div className="flex items-center gap-1.5 text-[11px] font-medium text-zinc-200">
                      <span>Girder G1 / Exp-4</span>
                      <span className="text-[9px] px-1 py-0.2 rounded bg-zinc-800 text-zinc-300 border border-zinc-700 font-semibold font-mono">
                        10 MHz
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 text-zinc-400">
                    <Link href="/monitor" className="text-[10px] px-1.5 py-0.5 rounded border border-[#2b2b36] hover:text-white transition-colors">
                      Live
                    </Link>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="relative">
                    <Search className="w-3 h-3 absolute left-2.5 top-2 text-zinc-500" />
                    <input
                      type="text"
                      placeholder="Search acoustic events..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full bg-[#1b1b22] border border-[#272733] rounded-md pl-7 pr-8 py-1.5 text-[11px] text-zinc-200 placeholder:text-zinc-500 focus:outline-none focus:border-[#FF5500]/50"
                    />
                    <span className="absolute right-2 top-1.5 text-[9px] font-mono text-zinc-500 border border-zinc-700/60 rounded px-1">
                      ⌘K
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-zinc-400 px-1 py-1">
                    <div className="flex items-center gap-3">
                      <Terminal className="w-3.5 h-3.5 hover:text-white cursor-pointer" />
                      <Headphones className="w-3.5 h-3.5 hover:text-white cursor-pointer" />
                      <Bell className="w-3.5 h-3.5 hover:text-white cursor-pointer" />
                    </div>
                    <div className="flex items-center gap-1.5 text-[11px] text-zinc-300 cursor-pointer hover:text-white">
                      <span className="w-4 h-4 rounded-full bg-[#FF5500]/20 text-[#FF5500] text-[9px] flex items-center justify-center font-bold">
                        OP
                      </span>
                      <span>Operations Lead</span>
                    </div>
                  </div>
                </div>

                <div className="p-2.5 rounded-lg border border-[#252530] bg-[#191921]/60">
                  <div className="flex items-center justify-between text-[11px] mb-1.5">
                    <span className="text-zinc-300 font-semibold">TDA Pipeline Execution</span>
                    <span className="text-zinc-400 text-[10px]">Stage 6/6 Complete</span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-zinc-800 overflow-hidden">
                    <div className="h-full w-full bg-[#FF5500]" />
                  </div>
                </div>

                <nav className="space-y-4 pt-1">
                  <div>
                    <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-md bg-[#22222b] text-white font-medium cursor-pointer">
                      <Activity className="w-3.5 h-3.5 text-[#FF5500]" />
                      <span>Waveform Preview</span>
                    </div>
                  </div>

                  <div>
                    <span className="text-[10px] font-bold tracking-wider text-zinc-500 uppercase px-2.5">
                      Dynamical Embedding
                    </span>
                    <div className="mt-1 space-y-0.5 text-zinc-400">
                      <Link href="/analysis" className="flex items-center gap-2 px-2.5 py-1 rounded hover:bg-[#1f1f28] hover:text-zinc-200 transition-colors">
                        <Layers className="w-3.5 h-3.5" />
                        <span>Takens 3D Attractor</span>
                      </Link>
                      <Link href="/analysis" className="flex items-center gap-2 px-2.5 py-1 rounded hover:bg-[#1f1f28] hover:text-zinc-200 transition-colors">
                        <Boxes className="w-3.5 h-3.5" />
                        <span>Persistent Homology</span>
                      </Link>
                    </div>
                  </div>

                  <div>
                    <span className="text-[10px] font-bold tracking-wider text-zinc-500 uppercase px-2.5">
                      Precursor Detection
                    </span>
                    <div className="mt-1 space-y-0.5 text-zinc-400">
                      <Link href="/analysis" className="flex items-center gap-2 px-2.5 py-1 rounded hover:bg-[#1f1f28] hover:text-zinc-200 transition-colors">
                        <Zap className="w-3.5 h-3.5" />
                        <span>RF Crack Classifier</span>
                      </Link>
                      <Link href="/analysis" className="flex items-center gap-2 px-2.5 py-1 rounded hover:bg-[#1f1f28] hover:text-zinc-200 transition-colors">
                        <Clock className="w-3.5 h-3.5" />
                        <span>BOCD Changepoint</span>
                      </Link>
                      <Link href="/analysis" className="flex items-center gap-2 px-2.5 py-1 rounded hover:bg-[#1f1f28] hover:text-zinc-200 transition-colors">
                        <Shield className="w-3.5 h-3.5" />
                        <span>Conv1D Residuals</span>
                      </Link>
                    </div>
                  </div>
                </nav>
              </div>

              <div className="pt-4 border-t border-[#202027] text-zinc-600 flex justify-end">
                <ChevronRight className="w-4 h-4 cursor-pointer hover:text-zinc-400" />
              </div>
            </aside>

            <main className="flex-1 p-5 sm:p-6 bg-[#16161b] flex flex-col justify-between">
              <div>
                <div className="flex flex-wrap items-center justify-between gap-3 pb-5 border-b border-[#23232c]">
                  <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                    Acoustic Emission Transient Burst
                  </h2>

                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      onClick={() => handleCopy("EVT-1042-G1-MIDSPAN", "id1")}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#1c1c24] border border-[#2a2a36] text-[11px] font-mono text-zinc-300 hover:text-white transition-colors cursor-pointer"
                    >
                      <span>EVT-1042-G1-MIDSPAN</span>
                      {copiedId === "id1" ? (
                        <Check className="w-3 h-3 text-emerald-400" />
                      ) : (
                        <Copy className="w-3 h-3 text-zinc-500 hover:text-zinc-300" />
                      )}
                    </button>

                    <button
                      onClick={() => handleCopy("sampling: 10.0 MS/s", "url")}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#1c1c24] border border-[#2a2a36] text-[11px] font-mono text-zinc-300 hover:text-white transition-colors cursor-pointer"
                    >
                      <span>sampling: 10.0 MS/s</span>
                      {copiedId === "url" ? (
                        <Check className="w-3 h-3 text-emerald-400" />
                      ) : (
                        <Copy className="w-3 h-3 text-zinc-500 hover:text-zinc-300" />
                      )}
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mt-5">
                  <div className="p-3 rounded-lg border border-[#23232d] bg-[#191922]/70">
                    <div className="flex items-center gap-1.5">
                      <span className="text-base sm:text-lg font-bold font-mono text-white">148.6 kHz</span>
                      <span className="text-[10px] font-mono text-emerald-400 font-semibold flex items-center">
                        ↗ +12.4%
                      </span>
                    </div>
                    <span className="text-[11px] text-zinc-400 mt-0.5 block">Peak Frequency (AF)</span>
                  </div>

                  <div className="p-3 rounded-lg border border-[#23232d] bg-[#191922]/70">
                    <div className="flex items-center gap-1.5">
                      <span className="text-base sm:text-lg font-bold font-mono text-white">1.18 Vpp</span>
                      <span className="text-[10px] font-mono text-emerald-400 font-semibold flex items-center">
                        ↗ +0.34V
                      </span>
                    </div>
                    <span className="text-[11px] text-zinc-400 mt-0.5 block">Peak Amplitude (Apk)</span>
                  </div>

                  <div className="p-3 rounded-lg border border-[#23232d] bg-[#191922]/70">
                    <div className="flex items-center gap-1.5">
                      <span className="text-base sm:text-lg font-bold font-mono text-white">0.938</span>
                      <span className="text-[10px] font-mono text-emerald-400 font-semibold flex items-center">
                        ↗ +0.072
                      </span>
                    </div>
                    <span className="text-[11px] text-zinc-400 mt-0.5 block">Macro F1 Crack Acc</span>
                  </div>

                  <div className="p-3 rounded-lg border border-[#23232d] bg-[#191922]/70">
                    <div className="flex items-center gap-1.5">
                      <span className="text-base sm:text-lg font-bold font-mono text-white">340 ms</span>
                      <span className="text-[10px] font-mono text-emerald-400 font-semibold flex items-center">
                        ↗ 2.8x
                      </span>
                    </div>
                    <span className="text-[11px] text-zinc-400 mt-0.5 block">Precursor Lead Time</span>
                  </div>

                  <div className="p-3 rounded-lg border border-[#23232d] bg-[#191922]/70">
                    <div className="flex items-center gap-1.5">
                      <span className="text-base sm:text-lg font-bold font-mono text-white">0.880</span>
                    </div>
                    <span className="text-[11px] text-zinc-400 mt-0.5 block">Max H₁ Persistence</span>
                  </div>
                </div>

                <div className="flex justify-end items-center gap-2 mt-4 text-[11px]">
                  <div className="inline-flex items-center rounded-md border border-[#272733] bg-[#191922] p-0.5">
                    {(["15m", "1h", "1d"] as const).map((t) => (
                      <button
                        key={t}
                        onClick={() => setActiveTimeRange(t)}
                        className={`px-2 py-0.5 rounded text-[10px] font-medium transition-colors cursor-pointer ${
                          activeTimeRange === t
                            ? "bg-[#282834] text-white font-semibold"
                            : "text-zinc-400 hover:text-zinc-200"
                        }`}
                      >
                        {t}
                      </button>
                    ))}
                  </div>

                  <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md border border-[#272733] bg-[#191922] text-zinc-300 cursor-pointer hover:border-zinc-700">
                    <span>📅 Fatigue Block #4 (Active)</span>
                    <ChevronDown className="w-3 h-3 text-zinc-500" />
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 mt-4">
                  {/* REAL ACOUSTIC EMISSION TRANSIENT RINGING GRAPH */}
                  <div className="lg:col-span-7 p-4 rounded-xl border border-[#23232d] bg-[#181821]/80 flex flex-col justify-between">
                    <div>
                      <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                        <span className="text-xs font-semibold text-zinc-200">
                          Acoustic emission transient waveform (EVT-1042)
                        </span>
                        <div className="flex items-center gap-4 text-[10px] text-zinc-400">
                          <span className="flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-emerald-400" />
                            <span>Threshold Vth (0.15 V)</span>
                          </span>
                          <span className="flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-[#FF5500]" />
                            <span>AE Signal (V)</span>
                          </span>
                          <Link href="/analysis" className="text-zinc-400 hover:text-white transition-colors">
                            Inspect phase space →
                          </Link>
                        </div>
                      </div>

                      <div className="relative h-44 w-full mt-2">
                        <div className="absolute left-0 top-0 bottom-6 flex flex-col justify-between text-[9px] font-mono text-zinc-500">
                          <span>+1.2V</span>
                          <span>+0.6V</span>
                          <span>0.0V</span>
                          <span>-0.6V</span>
                          <span>-1.2V</span>
                        </div>

                        <div className="ml-10 h-36 border-b border-l border-zinc-800/80 relative overflow-hidden">
                          <svg
                            viewBox="0 0 500 150"
                            preserveAspectRatio="none"
                            className="w-full h-full overflow-visible"
                          >
                            <defs>
                              <linearGradient id="pinkFill" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor="#FF5500" stopOpacity="0.25" />
                                <stop offset="100%" stopColor="#FF5500" stopOpacity="0.0" />
                              </linearGradient>

                              {/* Physical Phosphor Oscilloscope Sweep Beam Gradient */}
                              <linearGradient id="scopeSweepGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                                <stop offset="0%" stopColor="#FF5500" stopOpacity="0" />
                                <stop offset="75%" stopColor="#FF5500" stopOpacity="0.06" />
                                <stop offset="100%" stopColor="#FF5500" stopOpacity="0.45" />
                              </linearGradient>
                            </defs>

                            {/* Baseline zero reference */}
                            <line x1="0" y1="75" x2="500" y2="75" stroke="#3f3f46" strokeWidth="1" strokeDasharray="2,4" opacity="0.6" />

                            {/* Threshold Line at 0.15V (y = 58) */}
                            <line x1="0" y1="58" x2="500" y2="58" stroke="#10b981" strokeWidth="1.2" strokeDasharray="4,4" opacity="0.85" />
                            <text x="496" y="53" fill="#10b981" fontSize="8" fontFamily="monospace" textAnchor="end">Vth = +0.15V</text>

                            {/* Arrival / Onset Line at t0 = 55 (No label overlap: label positioned to the left) */}
                            <line x1="55" y1="10" x2="55" y2="140" stroke="#a1a1aa" strokeWidth="1" strokeDasharray="3,3" opacity="0.6" />
                            <text x="50" y="24" fill="#a1a1aa" fontSize="8" fontFamily="monospace" textAnchor="end">t₀ onset</text>

                            {/* Peak Amplitude Marker at x = 75, y = 15 (label positioned clearly to the right) */}
                            <circle cx="75" cy="15" r="3" fill="#FF5500" />
                            <text x="85" y="16" fill="#FF5500" fontSize="8.5" fontFamily="monospace" fontWeight="bold">Apk = 1.18V</text>

                            {/* AE Waveform Signal: Sharp arrival, high-frequency ringing burst, exponential decay */}
                            <path
                              d="M 0 75 
                                 L 35 75 Q 45 74 52 75 
                                 L 55 75 
                                 L 62 40 
                                 L 68 118 
                                 L 75 15 
                                 L 84 135 
                                 L 94 28 
                                 L 105 120 
                                 L 118 42 
                                 L 132 108 
                                 L 148 52 
                                 L 165 98 
                                 L 184 60 
                                 L 205 90 
                                 L 228 66 
                                 L 253 84 
                                 L 280 70 
                                 L 310 80 
                                 L 345 72 
                                 L 385 77 
                                 L 430 74 
                                 L 500 75"
                              fill="none"
                              stroke="#FF5500"
                              strokeWidth="2.2"
                              strokeLinejoin="round"
                            />

                            {/* Upper Envelope Decay Curve */}
                            <path
                              d="M 55 75 
                                 C 65 30, 70 15, 75 15 
                                 C 90 18, 110 35, 140 50 
                                 C 170 60, 220 66, 270 70 
                                 C 330 72, 400 74, 500 75"
                              fill="none"
                              stroke="#FFA066"
                              strokeWidth="1.5"
                              strokeDasharray="3,3"
                              opacity="0.75"
                            />

                            {/* Shaded Area Under Ringing Envelope */}
                            <path
                              d="M 55 75 
                                 C 65 30, 70 15, 75 15 
                                 C 90 18, 110 35, 140 50 
                                 C 170 60, 220 66, 270 70 
                                 C 330 72, 400 74, 500 75 
                                 L 500 75 L 55 75 Z"
                              fill="url(#pinkFill)"
                            />

                            {/* Subtle Infinite Oscilloscope Phosphor Scan Beam */}
                            <g>
                              <rect x="0" y="0" width="40" height="150" fill="url(#scopeSweepGradient)">
                                <animate
                                  attributeName="x"
                                  from="-40"
                                  to="500"
                                  dur="3.2s"
                                  repeatCount="indefinite"
                                />
                              </rect>
                              <line x1="0" y1="0" x2="0" y2="150" stroke="#FF5500" strokeWidth="1" opacity="0.75">
                                <animate
                                  attributeName="x1"
                                  from="0"
                                  to="540"
                                  dur="3.2s"
                                  repeatCount="indefinite"
                                />
                                <animate
                                  attributeName="x2"
                                  from="0"
                                  to="540"
                                  dur="3.2s"
                                  repeatCount="indefinite"
                                />
                              </line>
                            </g>
                          </svg>

                          <div className="flex justify-between text-[9px] font-mono text-zinc-500 pt-1.5">
                            <span>0 µs</span>
                            <span>25 µs</span>
                            <span className="text-zinc-300 font-semibold">50 µs (t₀)</span>
                            <span className="text-[#FF5500] font-semibold">75 µs (Apk)</span>
                            <span>150 µs</span>
                            <span>300 µs</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Active AE Sensor Channels */}
                  <div className="lg:col-span-5 p-4 rounded-xl border border-[#23232d] bg-[#181821]/80 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-xs font-semibold text-zinc-200">
                          Active AE sensor channels
                        </span>
                        <Link href="/monitor" className="text-[10px] text-zinc-400 hover:text-white transition-colors">
                          View all
                        </Link>
                      </div>

                      <div className="space-y-1.5 mt-2 font-mono text-xs">
                        {CONSUMERS.map((item, idx) => (
                          <div
                            key={idx}
                            className="flex items-center justify-between gap-2.5 py-1.5 border-b border-zinc-800/40 hover:bg-zinc-800/30 px-2 rounded-lg transition-colors"
                          >
                            <div className="flex items-center gap-2 min-w-0">
                              <span className="relative flex h-2 w-2 shrink-0">
                                {item.status === "active" && (
                                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#FF5500] opacity-70" />
                                )}
                                <span
                                  className={`relative inline-flex rounded-full h-2 w-2 ${
                                    item.status === "active" ? "bg-[#FF5500]" : "bg-zinc-600"
                                  }`}
                                />
                              </span>
                              <span className="text-[10px] text-zinc-400 bg-zinc-900 border border-zinc-800 px-1.5 py-0.5 rounded font-mono shrink-0">
                                {item.ch}
                              </span>
                              <span className="text-zinc-300 truncate text-[11px] font-medium" title={item.name}>
                                {item.name}
                              </span>
                            </div>

                            <div className="flex items-center gap-2.5 shrink-0 text-[11px]">
                              <span className="text-zinc-500 text-[10px] hidden sm:inline">{item.rate}</span>
                              <span className="text-zinc-200 font-semibold">{item.usage}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-[#23232c] flex items-center gap-1.5 text-[10px] text-zinc-500">
                <span>ⓘ</span>
                <span>Calibrated to EN 1330-9 and ASTM E1316 non-destructive acoustic emission testing standards.</span>
              </div>
            </main>
          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* FRAMEWORKS & STACK STRIP                                  */}
      {/* ========================================================= */}
      <section className="py-16 px-4 max-w-6xl mx-auto w-full text-center">
        <h3 className="text-base sm:text-lg font-medium text-zinc-300">
          Engineered on scientific libraries, TDA frameworks, and high-speed acoustic runtimes
          <span className="text-[#FF5500] font-bold">_</span>
        </h3>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-8 sm:gap-10 text-zinc-500">
          {FRAMEWORKS.map((fw, idx) => (
            <div
              key={idx}
              className="group flex flex-col items-center gap-2 cursor-pointer transition-all hover:text-zinc-200 hover:scale-110"
              title={fw.name}
            >
              <div className="w-8 h-8 flex items-center justify-center transition-colors group-hover:text-white">
                {fw.icon}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ========================================================= */}
      {/* MODULAR PIPELINE SERVICES                                 */}
      {/* ========================================================= */}
      <section className="py-20 px-4 sm:px-6 max-w-7xl mx-auto w-full text-center">
        <h2 className="text-3xl sm:text-5xl font-bold tracking-tight text-white leading-tight">
          All the analytical stages <br />
          in one unified pipeline
          <span className="text-[#FF5500]">_</span>
        </h2>

        <p className="mt-4 text-zinc-400 text-sm sm:text-base max-w-2xl mx-auto">
          Inspect every step from raw acoustic digitization to dynamical state-space reconstruction, simplicial homology, and changepoint detection.
        </p>

        {/* Stepper Navigation Bar */}
        <div className="mt-10 inline-flex flex-wrap items-center justify-center gap-2 sm:gap-4 p-2 rounded-full border border-[#2b2b36] bg-[#16161c]/80 backdrop-blur-md text-xs">
          <button
            onClick={() => setActiveCategory("BUILD")}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-full transition-all cursor-pointer ${
              activeCategory === "BUILD"
                ? "bg-[#252530] text-white font-semibold"
                : "text-zinc-400 hover:text-zinc-200"
            }`}
          >
            <span className="tracking-wider uppercase font-mono text-[11px]">Ingestion</span>
            <div className="flex items-center gap-1 text-zinc-400">
              <span className="p-1 rounded-full"><HardDrive className="w-3 h-3" /></span>
              <span className="p-1 rounded-full"><Database className="w-3 h-3" /></span>
            </div>
          </button>

          <span className="text-zinc-600 text-xs">→</span>

          <button
            onClick={() => setActiveCategory("DEPLOY")}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-full transition-all cursor-pointer ${
              activeCategory === "DEPLOY"
                ? "bg-[#252530] text-white font-semibold"
                : "text-zinc-400 hover:text-zinc-200"
            }`}
          >
            <span className="tracking-wider uppercase font-mono text-[11px]">Embedding</span>
            <div className="flex items-center gap-1 text-zinc-400">
              <span className="p-1 rounded-full"><Layers className="w-3 h-3" /></span>
            </div>
          </button>

          <span className="text-zinc-600 text-xs">→</span>

          <button
            onClick={() => setActiveCategory("PROTECT")}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-full transition-all cursor-pointer ${
              activeCategory === "PROTECT"
                ? "bg-[#252530] text-white font-semibold"
                : "text-zinc-400 hover:text-zinc-200"
            }`}
          >
            <span className="tracking-wider uppercase font-mono text-[11px]">Topology</span>
            <span className="p-1 rounded-full text-zinc-400"><Boxes className="w-3 h-3" /></span>
          </button>

          <span className="text-zinc-600 text-xs">→</span>

          <button
            onClick={() => setActiveCategory("SCALE")}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-full transition-all cursor-pointer ${
              activeCategory === "SCALE"
                ? "bg-[#252530] text-white font-semibold"
                : "text-zinc-400 hover:text-zinc-200"
            }`}
          >
            <span className="tracking-wider uppercase font-mono text-[11px]">Classification</span>
            <span className="p-1 rounded-full text-zinc-400"><Zap className="w-3 h-3" /></span>
          </button>
        </div>

        {/* ROW 1: EMBEDDING & STORAGE + TOPOLOGY */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-12 text-left">
          
          <div className="lg:col-span-5 space-y-6 flex flex-col justify-between">
            {/* TAKENS EMBEDDING CARD */}
            <div className="p-6 rounded-2xl border border-[#272733] bg-[#16161c] relative overflow-hidden group hover:border-[#38384a] transition-all">
              <div className="flex items-center gap-2 text-white font-bold text-lg">
                <Layers className="w-5 h-5 text-zinc-400" />
                <span>Takens Delay-Coordinate Embedding</span>
              </div>
              <p className="mt-2 text-xs text-zinc-400 leading-relaxed">
                Reconstruct unobserved multi-dimensional phase space attractors from single-channel acoustic time-series using Mutual Information and False Nearest Neighbors.
              </p>

              <div className="mt-6 rounded-xl border border-[#292936] bg-[#191921] p-5 shadow-inner">
                <div className="flex items-center justify-between text-xs mb-3">
                  <span className="font-semibold text-zinc-200 font-mono">Attractor Parameters</span>
                  <span className="inline-flex items-center gap-1.5 text-[10px] text-emerald-400 font-mono">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    Converged
                  </span>
                </div>

                <div className="space-y-2 mb-4 font-mono text-xs">
                  <div className="flex items-center justify-between p-2 rounded bg-[#131318] border border-[#262633]">
                    <span className="text-zinc-400">Embedding Dimension (d)</span>
                    <span className="text-white font-bold">3</span>
                  </div>
                  <div className="flex items-center justify-between p-2 rounded bg-[#131318] border border-[#262633]">
                    <span className="text-zinc-400">Delay Lag (τ)</span>
                    <span className="text-[#FF5500] font-bold">4 samples (90.7 µs)</span>
                  </div>
                  <div className="flex items-center justify-between p-2 rounded bg-[#131318] border border-[#262633]">
                    <span className="text-zinc-400">FNN False Ratio</span>
                    <span className="text-emerald-400 font-bold">&lt; 0.01</span>
                  </div>
                </div>

                <div className="pt-2 border-t border-[#262633] flex items-center justify-between text-[11px] font-mono text-zinc-400">
                  <span>State vector: [x(t), x(t+τ), x(t+2τ)]</span>
                  <span className="text-emerald-400 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    d_opt = 3
                  </span>
                </div>

                {/* Subtle Physical Phase Attractor Orbit Animation */}
                <div className="mt-3 h-12 w-full rounded-lg bg-[#111116] border border-[#22222d] relative overflow-hidden flex items-center justify-center">
                  <svg viewBox="0 0 320 44" className="w-full h-full select-none">
                    <path
                      d="M 15 22 Q 65 6 115 22 T 215 22 T 305 22"
                      fill="none"
                      stroke="#FF5500"
                      strokeWidth="1.4"
                      strokeOpacity="0.45"
                    />
                    <path
                      d="M 15 22 Q 65 38 115 22 T 215 22 T 305 22"
                      fill="none"
                      stroke="#FF5500"
                      strokeWidth="1.2"
                      strokeOpacity="0.25"
                      strokeDasharray="2 3"
                    />
                    {/* Infinite Traveling Particle along Phase Orbit */}
                    <circle r="3" fill="#FF5500">
                      <animateMotion
                        path="M 15 22 Q 65 6 115 22 T 215 22 T 305 22"
                        dur="4.5s"
                        repeatCount="indefinite"
                      />
                    </circle>
                    <circle r="6" fill="#FF5500" opacity="0.3">
                      <animateMotion
                        path="M 15 22 Q 65 6 115 22 T 215 22 T 305 22"
                        dur="4.5s"
                        repeatCount="indefinite"
                      />
                    </circle>
                  </svg>
                  <span className="absolute right-2.5 bottom-1 text-[9px] font-mono text-zinc-500">
                    Phase orbit: τ = 4
                  </span>
                </div>
              </div>
            </div>

            {/* ACOUSTIC WAVEFORM VAULT */}
            <div className="p-6 rounded-2xl border border-[#272733] bg-[#16161c] relative overflow-hidden group hover:border-[#38384a] transition-all">
              <div className="flex items-center gap-2 text-white font-bold text-lg">
                <HardDrive className="w-5 h-5 text-zinc-400" />
                <span>Acoustic Waveform Vault</span>
              </div>
              <p className="mt-2 text-xs text-zinc-400 leading-relaxed">
                Continuous high-speed acoustic ingestion with lossless HDF5 storage, zero-copy ring buffers, and automated AIC onset segmentation.
              </p>

              <div className="mt-5 p-4 rounded-xl border border-[#292936] bg-[#191921] space-y-3">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-14 h-14 rounded-lg bg-[#252533] border border-[#333345] flex items-center justify-center text-zinc-400 relative overflow-hidden shrink-0">
                      <FileCode className="w-7 h-7 text-[#FF5500]" />
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#FF5500]/10 to-transparent animate-pulse" />
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-semibold text-zinc-200 block">AE_BURST_BLOCK4.h5</span>
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      </div>
                      <span className="text-[10px] text-zinc-500 font-mono">10.0 MHz • 24-bit Float</span>
                    </div>
                  </div>

                  <div className="text-right text-[11px] font-mono text-zinc-400 bg-[#131318] border border-[#2a2a38] px-3 py-2 rounded-lg">
                    <span className="text-zinc-500 text-[10px]">Segment</span>
                    <div className="text-white text-xs font-medium mt-0.5">AIC Detector</div>
                    <div className="text-zinc-400 text-[10px] mt-1">4,096 samples</div>
                  </div>
                </div>

                <div className="pt-2 border-t border-[#262633] flex items-center justify-between text-[11px] font-mono">
                  <div className="flex items-center gap-2 text-emerald-400 font-semibold">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-60" />
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400" />
                    </span>
                    <span>Zero-copy ring buffer</span>
                  </div>
                  <span className="text-zinc-400">99.8% memory efficiency</span>
                </div>
              </div>
            </div>
          </div>

          {/* TOPOLOGICAL FEATURE STORE */}
          <div className="lg:col-span-7 p-6 rounded-2xl border border-[#272733] bg-[#16161c] flex flex-col justify-between group hover:border-[#38384a] transition-all">
            <div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-white font-bold text-lg">
                  <Database className="w-5 h-5 text-[#FF5500]" />
                  <span>Topological Feature Store</span>
                </div>
                <ArrowRight className="w-4 h-4 text-zinc-500 -rotate-45 group-hover:text-white transition-colors" />
              </div>

              <p className="mt-2 text-xs text-zinc-400 leading-relaxed">
                Store and query persistence diagrams, Betti curves, persistence entropy, and Wasserstein distances across fatigue load cycles.
              </p>

              <div className="grid grid-cols-2 gap-3 mt-5">
                <button
                  onClick={() => setSelectedManagedDb("postgres")}
                  className={`flex items-center justify-between p-3 rounded-xl border transition-all cursor-pointer ${
                    selectedManagedDb === "postgres"
                      ? "border-[#FF5500]/50 bg-[#1e1e28] text-white"
                      : "border-[#272733] bg-[#191922] text-zinc-400 hover:text-zinc-200"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-base font-bold text-[#FF5500]">H₀</span>
                    <span className="text-xs font-semibold">0D Connected Components</span>
                  </div>
                  <span className="text-[9px] px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-400 border border-zinc-700">
                    β₀ = 1
                  </span>
                </button>

                <button
                  onClick={() => setSelectedManagedDb("mysql")}
                  className={`flex items-center justify-between p-3 rounded-xl border transition-all cursor-pointer ${
                    selectedManagedDb === "mysql"
                      ? "border-[#FF5500]/50 bg-[#1e1e28] text-white"
                      : "border-[#272733] bg-[#191922] text-zinc-400 hover:text-zinc-200"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span className="text-base font-bold text-emerald-400">H₁</span>
                    <span className="text-xs font-semibold">1D Topological Loops</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <svg className="w-3.5 h-3.5 text-emerald-400" viewBox="0 0 24 24" fill="none">
                      <circle cx="12" cy="12" r="8" stroke="currentColor" strokeWidth="2.5" strokeDasharray="5 3">
                        <animateTransform
                          attributeName="transform"
                          type="rotate"
                          from="0 12 12"
                          to="360 12 12"
                          dur="7s"
                          repeatCount="indefinite"
                        />
                      </circle>
                    </svg>
                    <span className="text-[9px] px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-400 border border-zinc-700">
                      β₁ Peak
                    </span>
                  </div>
                </button>
              </div>

              <div className="mt-6 flex flex-wrap items-center justify-between gap-2">
                <span className="text-[10px] font-mono tracking-wider text-zinc-500 uppercase">
                  REPRESENTATION FORMAT
                </span>

                <div className="inline-flex rounded-lg border border-[#2b2b38] bg-[#191922] p-1">
                  <button
                    onClick={() => setSelectedDbTab("tables")}
                    className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-[11px] font-medium transition-all cursor-pointer ${
                      selectedDbTab === "tables"
                        ? "bg-[#272733] text-white font-semibold shadow-sm border border-zinc-600/50"
                        : "text-zinc-400 hover:text-zinc-200"
                    }`}
                  >
                    <Boxes className="w-3.5 h-3.5" />
                    <span>Persistence Vectors</span>
                  </button>

                  <button
                    onClick={() => setSelectedDbTab("docs")}
                    className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-[11px] font-medium transition-all cursor-pointer ${
                      selectedDbTab === "docs"
                        ? "bg-[#272733] text-white font-semibold shadow-sm border border-zinc-600/50"
                        : "text-zinc-400 hover:text-zinc-200"
                    }`}
                  >
                    <span>{"{ }"}</span>
                    <span>Betti Curves</span>
                  </button>

                  <button
                    onClick={() => setSelectedDbTab("vectors")}
                    className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-[11px] font-medium transition-all cursor-pointer ${
                      selectedDbTab === "vectors"
                        ? "bg-[#272733] text-white font-semibold shadow-sm border border-zinc-600/50"
                        : "text-zinc-400 hover:text-zinc-200"
                    }`}
                  >
                    <span>✦</span>
                    <span>Wasserstein Dist</span>
                  </button>
                </div>
              </div>

              <div className="mt-4 rounded-xl border border-[#272735] bg-[#141419] overflow-hidden text-xs">
                <div className="flex items-center justify-between px-3.5 py-2 border-b border-[#23232d] bg-[#171720] font-mono text-[11px]">
                  <span className="text-zinc-300 font-semibold">girder_g1 / acoustic_events</span>
                  <span className="text-zinc-500 text-[10px]">42,810 rows</span>
                </div>

                <div className="flex items-center justify-between px-3.5 py-1.5 border-b border-[#23232d] bg-[#15151c] font-mono text-[11px]">
                  <div className="flex items-center gap-2">
                    <span className="text-amber-400 font-semibold">Query</span>
                    <span className="text-zinc-400">.</span>
                    <span className="text-emerald-400">equal</span>
                    <span className="text-zinc-500">(</span>
                    <span className="text-emerald-300">"specimen"</span>
                    <span className="text-zinc-500">,</span>
                    <span className="text-emerald-300">"GIRDER_G1_BLOCK4"</span>
                    <span className="text-zinc-500">)</span>
                    <span className="inline-block w-1.5 h-3 bg-emerald-400/80 animate-pulse align-middle" />
                  </div>
                  <div className="flex items-center gap-1.5 text-[10px] text-emerald-400 font-mono">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    <span>Indexed (1.2ms)</span>
                  </div>
                </div>

                {/* Tab 1: Persistence Vectors Table */}
                {selectedDbTab === "tables" && (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left font-mono text-[11px]">
                      <thead className="border-b border-[#23232d] text-zinc-500 bg-[#16161e]">
                        <tr>
                          <th className="p-2 w-8 text-center">
                            <input type="checkbox" className="rounded accent-[#FF5500]" />
                          </th>
                          <th className="p-2 font-medium"># ID</th>
                          <th className="p-2 font-medium">Location</th>
                          <th className="p-2 font-medium">Mode</th>
                          <th className="p-2 font-medium">Load Block</th>
                          <th className="p-2 font-medium text-right">Ch</th>
                          <th className="p-2 font-medium text-right">Apk (mV)</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#23232d] text-zinc-300">
                        {LAP_TIMES_DATA.map((row, idx) => {
                          const isCurrent = selectedRow === idx;
                          return (
                            <tr
                              key={idx}
                              onClick={() => setSelectedRow(idx)}
                              className={`cursor-pointer transition-colors ${
                                isCurrent ? "bg-[#252535] text-white" : "hover:bg-[#1a1a23]"
                              }`}
                            >
                              <td className="p-2 text-center">
                                <input
                                  type="checkbox"
                                  checked={isCurrent}
                                  onChange={() => setSelectedRow(idx)}
                                  className="rounded accent-[#FF5500]"
                                />
                              </td>
                              <td className="p-2 text-zinc-400 flex items-center gap-1">
                                {isCurrent && <span className="w-1.5 h-1.5 rounded-full bg-[#FF5500] animate-pulse" />}
                                <span>{row.id}</span>
                              </td>
                              <td className="p-2 font-semibold text-white font-sans">{row.driver}</td>
                              <td className="p-2 text-zinc-300 font-bold">{row.code}</td>
                              <td className="p-2 text-zinc-400">{row.team}</td>
                              <td className="p-2 text-right">{row.pos}</td>
                              <td className="p-2 text-right font-medium text-emerald-400">
                                {row.lap_ms}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}

                {/* Tab 2: Betti Curves Functional Envelope */}
                {selectedDbTab === "docs" && (
                  <div className="p-4 space-y-3 font-mono">
                    <div className="flex items-center justify-between text-[11px]">
                      <div className="flex items-center gap-3">
                        <span className="flex items-center gap-1.5 text-zinc-300">
                          <span className="w-2.5 h-0.5 bg-zinc-400" />
                          <span>β₀ Connected Components</span>
                        </span>
                        <span className="flex items-center gap-1.5 text-[#FF5500] font-semibold">
                          <span className="w-2.5 h-0.5 bg-[#FF5500]" />
                          <span>β₁ Topological Loops</span>
                        </span>
                      </div>
                      <span className="text-[10px] text-emerald-400 flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                        GUDHI Filtration Active
                      </span>
                    </div>

                    <div className="relative h-32 w-full overflow-hidden bg-[#0e0e13] rounded-lg border border-[#21212b] p-2">
                      <svg viewBox="0 0 500 100" preserveAspectRatio="none" className="w-full h-full select-none">
                        <line x1="0" y1="85" x2="500" y2="85" stroke="#262633" strokeWidth="1" />
                        <line x1="0" y1="20" x2="500" y2="20" stroke="#1d1d26" strokeWidth="0.8" strokeDasharray="2 2" />
                        <line x1="0" y1="50" x2="500" y2="50" stroke="#1d1d26" strokeWidth="0.8" strokeDasharray="2 2" />

                        {/* Beta 0 curve */}
                        <path
                          d="M 10 15 Q 120 60 240 78 L 490 84"
                          fill="none"
                          stroke="#a1a1aa"
                          strokeWidth="1.8"
                          strokeDasharray="3 2"
                          opacity="0.8"
                        />

                        {/* Beta 1 curve with area */}
                        <path
                          d="M 10 85 Q 140 85 180 72 Q 240 18 280 20 Q 340 30 400 80 L 490 85"
                          fill="none"
                          stroke="#FF5500"
                          strokeWidth="2.2"
                        />
                        <path
                          d="M 10 85 Q 140 85 180 72 Q 240 18 280 20 Q 340 30 400 80 L 490 85 Z"
                          fill="#FF5500"
                          fillOpacity="0.12"
                        />

                        {/* Infinite Subtle Filtration Scanning Line */}
                        <g>
                          <line x1="0" y1="10" x2="0" y2="90" stroke="#FF5500" strokeWidth="1.2" opacity="0.85">
                            <animate attributeName="x1" from="10" to="490" dur="3.8s" repeatCount="indefinite" />
                            <animate attributeName="x2" from="10" to="490" dur="3.8s" repeatCount="indefinite" />
                          </line>
                        </g>
                      </svg>
                    </div>

                    <div className="flex items-center justify-between text-[10px] text-zinc-500 pt-1">
                      <span>ε = 0.0 (Point Cloud)</span>
                      <span className="text-[#FF5500] font-semibold">Peak: β₁(ε=0.52) = 14 Persistent Loops</span>
                      <span>ε = 1.0 (Filled)</span>
                    </div>
                  </div>
                )}

                {/* Tab 3: Wasserstein-2 Distance Heatmap */}
                {selectedDbTab === "vectors" && (
                  <div className="p-3.5 space-y-2.5 font-mono">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-zinc-300 font-semibold">Pairwise Wasserstein Metric W₂(D_i, D_j)</span>
                      <span className="text-[10px] text-emerald-400">p &lt; 0.001</span>
                    </div>

                    <div className="grid grid-cols-5 gap-1 text-center text-[10px]">
                      <div className="p-1.5 text-zinc-500 font-bold">Block</div>
                      <div className="p-1.5 text-zinc-400 font-bold">B #1</div>
                      <div className="p-1.5 text-zinc-400 font-bold">B #2</div>
                      <div className="p-1.5 text-zinc-400 font-bold">B #3</div>
                      <div className="p-1.5 text-zinc-400 font-bold">B #4</div>

                      <div className="p-1.5 text-zinc-400 font-bold text-left">B #1</div>
                      <div className="p-1.5 rounded bg-zinc-900 border border-zinc-800 text-zinc-500">0.00</div>
                      <div className="p-1.5 rounded bg-[#1c120c] text-orange-300">0.12</div>
                      <div className="p-1.5 rounded bg-[#291408] text-orange-200">0.38</div>
                      <div className="p-1.5 rounded bg-[#3d1805] text-[#FF5500] font-bold">0.94</div>

                      <div className="p-1.5 text-zinc-400 font-bold text-left">B #2</div>
                      <div className="p-1.5 rounded bg-[#1c120c] text-orange-300">0.12</div>
                      <div className="p-1.5 rounded bg-zinc-900 border border-zinc-800 text-zinc-500">0.00</div>
                      <div className="p-1.5 rounded bg-[#291408] text-orange-200">0.29</div>
                      <div className="p-1.5 rounded bg-[#3d1805] text-[#FF5500] font-bold">0.86</div>

                      <div className="p-1.5 text-zinc-400 font-bold text-left">B #3</div>
                      <div className="p-1.5 rounded bg-[#291408] text-orange-200">0.38</div>
                      <div className="p-1.5 rounded bg-[#291408] text-orange-200">0.29</div>
                      <div className="p-1.5 rounded bg-zinc-900 border border-zinc-800 text-zinc-500">0.00</div>
                      <div className="p-1.5 rounded bg-[#4a1c06] text-white font-extrabold border border-[#FF5500]">0.72</div>

                      <div className="p-1.5 text-zinc-400 font-bold text-left">B #4</div>
                      <div className="p-1.5 rounded bg-[#3d1805] text-[#FF5500] font-bold">0.94</div>
                      <div className="p-1.5 rounded bg-[#3d1805] text-[#FF5500] font-bold">0.86</div>
                      <div className="p-1.5 rounded bg-[#4a1c06] text-white font-extrabold border border-[#FF5500]">0.72</div>
                      <div className="p-1.5 rounded bg-zinc-900 border border-zinc-800 text-zinc-500">0.00</div>
                    </div>

                    <div className="p-2 rounded bg-primary/10 border border-primary/30 flex items-center justify-between text-[10px] text-zinc-300">
                      <span className="flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#FF5500] animate-pulse" />
                        <span>Precursor shift: <strong>W₂ = 0.94</strong> (Fatigue Block #4 micro-fracture)</span>
                      </span>
                      <span className="text-primary font-bold">Confirmed</span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-[#23232d] flex items-center justify-between text-[11px] text-zinc-400">
              <span>Deterministic GUDHI simplicial filtration verified</span>
              <Link href="/analysis" className="text-[#FF5500] hover:underline">
                Explore TDA pipeline →
              </Link>
            </div>
          </div>
        </div>

        {/* ROW 2: BOCD INFERENCE & TDA VISUALIZER */}
        <div className="relative grid grid-cols-1 lg:grid-cols-12 gap-6 mt-6 text-left">
          
          <div className="absolute -top-16 -left-16 w-[550px] h-[450px] bg-[radial-gradient(ellipse_at_center,rgba(255,85,0,0.10)_0%,rgba(194,65,12,0.03)_55%,transparent_75%)] pointer-events-none -z-10 blur-3xl" />

          {/* BOCD INFERENCE CARD */}
          <div className="lg:col-span-5 p-6 rounded-2xl border border-[#272733] bg-[#16161c] flex flex-col justify-between group hover:border-[#38384a] transition-all">
            <div>
              <div className="flex items-center gap-2.5 text-white font-bold text-lg">
                <div className="w-6 h-6 rounded-md bg-[#FF5500]/15 border border-[#FF5500]/40 flex items-center justify-center text-[#FF5500] shrink-0">
                  <Zap className="w-3.5 h-3.5 fill-current" />
                </div>
                <span>Bayesian Online Changepoint Detection</span>
              </div>
              <p className="mt-2 text-xs text-zinc-400 leading-relaxed">
                Real-time hazard function evaluation to flag abrupt dynamical regime shifts in acoustic emission streams before macro-fracture.
              </p>

              <div className="mt-6 rounded-xl border border-[#292936] bg-[#191921] p-4 space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-zinc-200">Temporal Anomaly Engine</span>
                    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-mono bg-[#FF5500]/10 text-[#FF5500] border border-[#FF5500]/20">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#FF5500] animate-ping" />
                      LIVE
                    </span>
                  </div>
                  <button
                    onClick={() => setIsBocdStreaming(!isBocdStreaming)}
                    className="flex items-center gap-1 text-[11px] font-mono text-zinc-400 hover:text-white px-2 py-0.5 rounded border border-[#2b2b38] bg-[#141419] transition-colors cursor-pointer"
                    title={isBocdStreaming ? "Pause anomaly stream" : "Resume anomaly stream"}
                  >
                    {isBocdStreaming ? (
                      <>
                        <Pause className="w-2.5 h-2.5 text-[#FF5500]" />
                        <span>Pause</span>
                      </>
                    ) : (
                      <>
                        <Play className="w-2.5 h-2.5 text-zinc-300" />
                        <span>Resume</span>
                      </>
                    )}
                  </button>
                </div>
                <p className="text-[11px] text-zinc-500">
                  Parallel BOCD run-length tracking &amp; Conv1D-AE residual monitoring
                </p>

                {/* Animated 4-Step Sequential Pipeline */}
                <div className="space-y-1.5 pt-1 text-xs">
                  {/* STEP 1: Hazard Rate Inference */}
                  <div
                    onClick={() => setActiveBocdStep(0)}
                    className={`flex items-start justify-between gap-3 p-2.5 rounded-lg border transition-all cursor-pointer ${
                      activeBocdStep === 0
                        ? "border-[#FF5500]/50 bg-[#FF5500]/[0.08] border-l-2 border-l-[#FF5500] shadow-sm"
                        : "border-[#262633] bg-[#141419] hover:border-zinc-700 opacity-80"
                    }`}
                  >
                    <div className="flex items-start gap-2.5">
                      <div className={`mt-0.5 shrink-0 ${activeBocdStep === 0 ? "text-[#FF5500]" : "text-zinc-500"}`}>
                        <Clock className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className={`font-semibold ${activeBocdStep === 0 ? "text-white" : "text-zinc-300"}`}>
                            Hazard Rate Inference
                          </span>
                          <span className="text-[10px] font-mono text-zinc-500">01/04</span>
                        </div>
                        <span className="text-[11px] text-zinc-400 block mt-0.5">
                          Recursive posterior evaluation of run-length distribution P(r_t | x_1:t)
                        </span>
                      </div>
                    </div>
                    <div className="shrink-0 text-right">
                      {activeBocdStep === 0 ? (
                        <span className="inline-flex items-center gap-1 font-mono text-[10px] px-2 py-0.5 rounded bg-[#FF5500]/15 border border-[#FF5500]/30 text-[#FF5500] font-medium">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#FF5500] animate-ping" />
                          P(r_t) = 0.94
                        </span>
                      ) : (
                        <span className="font-mono text-[10px] text-zinc-500">λ = 250</span>
                      )}
                    </div>
                  </div>

                  {/* Flow Connector 1 -> 2 */}
                  <div className="flex justify-center -my-1 relative z-10">
                    <div className="w-[1.5px] h-2 bg-zinc-800 relative overflow-hidden">
                      <div className={`w-full h-1.5 bg-[#FF5500] rounded-full transition-transform ${activeBocdStep >= 1 ? "animate-pulse" : "opacity-20"}`} />
                    </div>
                  </div>

                  {/* STEP 2: Conv1D-AE Residual Threshold */}
                  <div
                    onClick={() => setActiveBocdStep(1)}
                    className={`flex items-start justify-between gap-3 p-2.5 rounded-lg border transition-all cursor-pointer ${
                      activeBocdStep === 1
                        ? "border-[#FF5500]/50 bg-[#FF5500]/[0.08] border-l-2 border-l-[#FF5500] shadow-sm"
                        : "border-[#262633] bg-[#141419] hover:border-zinc-700 opacity-80"
                    }`}
                  >
                    <div className="flex items-start gap-2.5">
                      <div className={`mt-0.5 shrink-0 font-bold text-sm leading-none ${activeBocdStep === 1 ? "text-[#FF5500]" : "text-zinc-500"}`}>
                        σ
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className={`font-semibold ${activeBocdStep === 1 ? "text-white" : "text-zinc-300"}`}>
                            Conv1D-AE Residual Threshold
                          </span>
                          <span className="text-[10px] font-mono text-zinc-500">02/04</span>
                        </div>
                        <span className="text-[11px] text-zinc-400 block mt-0.5">
                          Statistical outlier flagging when reconstruction error exceeds µ + 3σ
                        </span>
                      </div>
                    </div>
                    <div className="shrink-0 text-right">
                      {activeBocdStep === 1 ? (
                        <span className="inline-flex items-center gap-1 font-mono text-[10px] px-2 py-0.5 rounded bg-[#FF5500]/15 border border-[#FF5500]/30 text-[#FF5500] font-medium">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#FF5500] animate-ping" />
                          e = 0.42 V²
                        </span>
                      ) : (
                        <span className="font-mono text-[10px] text-zinc-500">µ + 3σ</span>
                      )}
                    </div>
                  </div>

                  {/* Flow Connector 2 -> 3 */}
                  <div className="flex justify-center -my-1 relative z-10">
                    <div className="w-[1.5px] h-2 bg-zinc-800 relative overflow-hidden">
                      <div className={`w-full h-1.5 bg-[#FF5500] rounded-full transition-transform ${activeBocdStep >= 2 ? "animate-pulse" : "opacity-20"}`} />
                    </div>
                  </div>

                  {/* STEP 3: Precursor Alert Trigger */}
                  <div
                    onClick={() => setActiveBocdStep(2)}
                    className={`flex items-start justify-between gap-3 p-2.5 rounded-lg border transition-all cursor-pointer ${
                      activeBocdStep === 2
                        ? "border-[#FF5500]/50 bg-[#FF5500]/[0.08] border-l-2 border-l-[#FF5500] shadow-sm"
                        : "border-[#262633] bg-[#141419] hover:border-zinc-700 opacity-80"
                    }`}
                  >
                    <div className="flex items-start gap-2.5">
                      <div className={`mt-0.5 shrink-0 ${activeBocdStep === 2 ? "text-[#FF5500]" : "text-zinc-500"}`}>
                        <Shield className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className={`font-semibold ${activeBocdStep === 2 ? "text-white" : "text-zinc-300"}`}>
                            Precursor Alert Trigger
                          </span>
                          <span className="text-[10px] font-mono text-zinc-500">03/04</span>
                        </div>
                        <span className="text-[11px] text-zinc-400 block mt-0.5">
                          Dispatches warning when rupture changepoint probability exceeds 0.85
                        </span>
                      </div>
                    </div>
                    <div className="shrink-0 text-right">
                      {activeBocdStep === 2 ? (
                        <span className="inline-flex items-center gap-1 font-mono text-[10px] px-2 py-0.5 rounded bg-[#FF5500]/15 border border-[#FF5500]/30 text-[#FF5500] font-medium">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#FF5500] animate-ping" />
                          +340ms Lead
                        </span>
                      ) : (
                        <span className="font-mono text-[10px] text-zinc-500">P &gt; 0.85</span>
                      )}
                    </div>
                  </div>

                  {/* Flow Connector 3 -> 4 */}
                  <div className="flex justify-center -my-1 relative z-10">
                    <div className="w-[1.5px] h-2 bg-zinc-800 relative overflow-hidden">
                      <div className={`w-full h-1.5 bg-[#FF5500] rounded-full transition-transform ${activeBocdStep >= 3 ? "animate-pulse" : "opacity-20"}`} />
                    </div>
                  </div>

                  {/* STEP 4: Fatigue Cycle Tracker */}
                  <div
                    onClick={() => setActiveBocdStep(3)}
                    className={`flex items-start justify-between gap-3 p-2.5 rounded-lg border transition-all cursor-pointer ${
                      activeBocdStep === 3
                        ? "border-[#FF5500]/50 bg-[#FF5500]/[0.08] border-l-2 border-l-[#FF5500] shadow-sm"
                        : "border-[#262633] bg-[#141419] hover:border-zinc-700 opacity-80"
                    }`}
                  >
                    <div className="flex items-start gap-2.5">
                      <div className={`mt-0.5 shrink-0 ${activeBocdStep === 3 ? "text-[#FF5500]" : "text-zinc-500"}`}>
                        <Activity className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className={`font-semibold ${activeBocdStep === 3 ? "text-white" : "text-zinc-300"}`}>
                            Fatigue Cycle Tracker
                          </span>
                          <span className="text-[10px] font-mono text-zinc-500">04/04</span>
                        </div>
                        <span className="text-[11px] text-zinc-400 block mt-0.5">
                          Synchronized logging with cyclic hydraulic actuator blocks
                        </span>
                      </div>
                    </div>
                    <div className="shrink-0 text-right">
                      {activeBocdStep === 3 ? (
                        <span className="inline-flex items-center gap-1 font-mono text-[10px] px-2 py-0.5 rounded bg-[#FF5500]/15 border border-[#FF5500]/30 text-[#FF5500] font-medium">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#FF5500] animate-ping" />
                          Block #4
                        </span>
                      ) : (
                        <span className="font-mono text-[10px] text-zinc-500">14.8k cyc</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* BOCD Run-Length Posterior Sawtooth Sparkline */}
                <div className="mt-3 pt-3 border-t border-[#252533]">
                  <div className="flex items-center justify-between text-[11px] mb-1.5 font-mono">
                    <span className="text-zinc-400 flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#FF5500] animate-ping" />
                      Run-Length Posterior r_t
                    </span>
                    <span className="text-[#FF5500] font-semibold">
                      r_t = {bocdRunLength} samples
                    </span>
                  </div>

                  <div className="h-12 w-full bg-[#121217] rounded-lg border border-[#22222d] p-1 relative overflow-hidden">
                    <svg viewBox="0 0 320 40" className="w-full h-full" preserveAspectRatio="none">
                      <defs>
                        <linearGradient id="bocdAreaGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                          <stop offset="0%" stopColor="#FF5500" stopOpacity="0.25" />
                          <stop offset="100%" stopColor="#FF5500" stopOpacity="0.0" />
                        </linearGradient>
                      </defs>
                      
                      {/* Background horizontal grid lines */}
                      <line x1="0" y1="10" x2="320" y2="10" stroke="#252532" strokeWidth="0.5" strokeDasharray="2,3" />
                      <line x1="0" y1="20" x2="320" y2="20" stroke="#252532" strokeWidth="0.5" strokeDasharray="2,3" />
                      <line x1="0" y1="30" x2="320" y2="30" stroke="#252532" strokeWidth="0.5" strokeDasharray="2,3" />

                      {/* Sawtooth Adams-MacKay run-length path */}
                      <path
                        d="M 10 34 L 70 12 L 70 34 L 175 6 L 175 34 L 285 10 L 285 34 Z"
                        fill="url(#bocdAreaGrad)"
                      />
                      <path
                        d="M 10 34 L 70 12 L 70 34 L 175 6 L 175 34 L 285 10"
                        fill="none"
                        stroke="#FF5500"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />

                      {/* Changepoint markers */}
                      <line x1="70" y1="4" x2="70" y2="36" stroke="#f43f5e" strokeWidth="0.8" strokeDasharray="2,2" opacity="0.6" />
                      <text x="73" y="10" fontSize="7" fill="#f43f5e" fontFamily="monospace" opacity="0.8">tcp1</text>
                      
                      <line x1="175" y1="4" x2="175" y2="36" stroke="#f43f5e" strokeWidth="0.8" strokeDasharray="2,2" opacity="0.6" />
                      <text x="178" y="10" fontSize="7" fill="#f43f5e" fontFamily="monospace" opacity="0.8">tcp2</text>

                      {/* Live current point */}
                      <circle cx="285" cy="10" r="3" fill="#FF5500" className="animate-ping" opacity="0.75" />
                      <circle cx="285" cy="10" r="2.2" fill="#FF5500" stroke="#ffffff" strokeWidth="0.5" />
                    </svg>
                  </div>

                  <div className="flex items-center justify-between text-[10px] text-zinc-500 font-mono mt-1.5 px-0.5">
                    <span>Hazard H(r_t) = 1/λ (λ=250)</span>
                    <span className="text-zinc-400">P(rupture) &gt; 0.85</span>
                    <span className="text-zinc-400">Lead: 340ms</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* INTERACTIVE TDA VISUALIZER */}
          <div className="lg:col-span-7 p-6 rounded-2xl border border-[#272733] bg-[#16161c] flex flex-col justify-between group hover:border-[#38384a] transition-all">
            <div>
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#23232c]">
                <div>
                  <div className="flex items-center gap-2.5 text-white font-bold text-lg">
                    <div className="w-6 h-6 rounded-md bg-[#FF5500]/15 border border-[#FF5500]/40 flex items-center justify-center text-[#FF5500] shrink-0">
                      <Globe className="w-3.5 h-3.5" />
                    </div>
                    <span>Interactive TDA Visualizer</span>
                  </div>
                  <p className="mt-1 text-xs text-zinc-400">
                    Real-time state space orbit &amp; GUDHI persistent homology invariants
                  </p>
                </div>

                {/* Mode Selector Tabs */}
                <div className="flex items-center gap-1 p-1 rounded-lg bg-[#141419] border border-[#272733] self-start sm:self-auto">
                  <button
                    onClick={() => setTdaVisualMode("attractor")}
                    className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors cursor-pointer ${
                      tdaVisualMode === "attractor"
                        ? "bg-[#FF5500] text-white shadow-sm"
                        : "text-zinc-400 hover:text-white"
                    }`}
                  >
                    3D Attractor
                  </button>
                  <button
                    onClick={() => setTdaVisualMode("persistence")}
                    className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors cursor-pointer ${
                      tdaVisualMode === "persistence"
                        ? "bg-[#FF5500] text-white shadow-sm"
                        : "text-zinc-400 hover:text-white"
                    }`}
                  >
                    Persistence
                  </button>
                  <button
                    onClick={() => setTdaVisualMode("betti")}
                    className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors cursor-pointer ${
                      tdaVisualMode === "betti"
                        ? "bg-[#FF5500] text-white shadow-sm"
                        : "text-zinc-400 hover:text-white"
                    }`}
                  >
                    Betti Curves
                  </button>
                </div>
              </div>

              {/* Main Interactive Visualization Viewport */}
              <div className="mt-4">
                {tdaVisualMode === "attractor" && (
                  <TakensPhaseSpace className="border-[#23232c] bg-[#121217]" />
                )}
                {tdaVisualMode === "persistence" && (
                  <PersistenceDiagram className="border-[#23232c] bg-[#121217]" />
                )}
                {tdaVisualMode === "betti" && (
                  <BettiCurvesChart className="border-[#23232c] bg-[#121217]" />
                )}
              </div>
            </div>

            {/* Bottom Info Bar */}
            <div className="mt-4 pt-3 border-t border-[#23232c] flex items-center justify-between text-xs text-zinc-500">
              <span className="font-mono text-[11px]">Engine: GUDHI Ripser C++ &bull; 10 MS/s Burst</span>
              <Link href="/analysis" className="text-zinc-300 hover:text-white font-medium flex items-center gap-1 group">
                <span>Explore Full TDA Pipeline</span>
                <span className="group-hover:translate-x-0.5 transition-transform">&rarr;</span>
              </Link>
            </div>
          </div>
        </div>

        {/* ROW 3: ALERTS + NOISE GATE + REALTIME STREAM */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6 text-left">
          
          {/* STRUCTURAL ALERT DISPATCHER */}
          <div className="p-6 rounded-2xl border border-[#272733] bg-[#16161c] flex flex-col justify-between group hover:border-[#38384a] transition-all">
            <div>
              <div className="flex items-center gap-2 text-white font-bold text-lg">
                <MessageSquare className="w-5 h-5 text-zinc-400" />
                <span>Structural Alert Dispatcher</span>
              </div>
              <p className="mt-2 text-xs text-zinc-400 leading-relaxed">
                Instant multi-channel emergency precursor alerts via Webhook, SMS, and Email to bridge maintenance crews.
              </p>

              <div className="mt-6 rounded-xl border border-[#292936] bg-[#191921] p-4 space-y-3">
                <div className="space-y-0.5">
                  <h4 className="text-xs font-semibold text-zinc-200">Precursor hazard notification</h4>
                  <p className="text-[10px] text-zinc-500">Real-time alerts triggered on changepoint anomaly</p>
                </div>

                <div className="grid grid-cols-3 gap-1.5 pt-1">
                  <button
                    onClick={() => setMessagingChannel("email")}
                    className={`flex items-center justify-center gap-1.5 py-1.5 rounded-lg border text-[11px] font-medium transition-colors cursor-pointer ${
                      messagingChannel === "email"
                        ? "border-[#FF5500]/50 bg-[#242430] text-white"
                        : "border-[#2b2b38] bg-[#171720] text-zinc-400 hover:text-zinc-200"
                    }`}
                  >
                    <span>✉ Webhook</span>
                  </button>
                  <button
                    onClick={() => setMessagingChannel("sms")}
                    className={`flex items-center justify-center gap-1.5 py-1.5 rounded-lg border text-[11px] font-medium transition-colors cursor-pointer ${
                      messagingChannel === "sms"
                        ? "border-[#FF5500]/50 bg-[#242430] text-white"
                        : "border-[#2b2b38] bg-[#171720] text-zinc-400 hover:text-zinc-200"
                    }`}
                  >
                    <span>📞 SMS</span>
                  </button>
                  <button
                    onClick={() => setMessagingChannel("push")}
                    className={`flex items-center justify-center gap-1.5 py-1.5 rounded-lg border text-[11px] font-medium transition-colors cursor-pointer ${
                      messagingChannel === "push"
                        ? "border-[#FF5500]/50 bg-[#242430] text-white"
                        : "border-[#2b2b38] bg-[#171720] text-zinc-400 hover:text-zinc-200"
                    }`}
                  >
                    <span>🔔 Dispatch</span>
                  </button>
                </div>

                <div className="p-3 rounded-lg border border-[#262633] bg-[#131318] space-y-1 text-xs">
                  <span className="font-semibold text-white block">CRITICAL: Micro-crack precursor detected</span>
                  <p className="text-[11px] text-zinc-400">Girder G1 (Midspan). BOCD changepoint hazard = 0.94.</p>
                  <p className="text-[10px] text-zinc-600 truncate">Immediate inspection recommended for shear key</p>
                </div>
              </div>
            </div>
          </div>

          {/* NOISE GATE & BANDPASS */}
          <div className="p-6 rounded-2xl border border-[#272733] bg-[#16161c] flex flex-col justify-between group hover:border-[#38384a] transition-all">
            <div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-white font-bold text-lg">
                  <Shield className="w-5 h-5 text-[#FF5500]" />
                  <span>Acoustic Noise Gate &amp; Filter</span>
                  <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-[#FF5500]/20 text-[#FF5500] border border-[#FF5500]/30 font-semibold uppercase">
                    Butterworth
                  </span>
                </div>
                <ArrowRight className="w-4 h-4 text-zinc-500 -rotate-45 group-hover:text-white transition-colors" />
              </div>

              <p className="mt-2 text-xs text-zinc-400 leading-relaxed">
                Isolate genuine acoustic emission fractures from environmental road traffic, ambient vibrations, and sensor handling noise.
              </p>

              <div className="mt-6 rounded-xl border border-[#292936] bg-[#191921] p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <h4 className="text-xs font-semibold text-zinc-200">Bandpass parameters</h4>
                    <p className="text-[10px] text-zinc-500">20 kHz – 2 MHz ultrasonic passband</p>
                  </div>
                  <Shield className="w-4 h-4 text-zinc-500" />
                </div>

                <div className="grid grid-cols-3 gap-2 pt-1 text-center font-mono">
                  <div className="p-2 rounded-lg bg-[#141419] border border-[#272733]">
                    <div className="text-xs font-bold text-white">42.8k</div>
                    <span className="text-[9px] text-zinc-500 block">Filtered</span>
                  </div>
                  <div className="p-2 rounded-lg bg-[#141419] border border-[#272733]">
                    <div className="text-xs font-bold text-emerald-400">198k</div>
                    <span className="text-[9px] text-zinc-500 block">Processed</span>
                  </div>
                  <div className="p-2 rounded-lg bg-[#141419] border border-[#272733]">
                    <div className="text-xs font-bold text-amber-400">13k</div>
                    <span className="text-[9px] text-zinc-500 block">Evaluated</span>
                  </div>
                </div>

                <div className="flex items-center justify-center gap-2 text-[10px] text-zinc-500 pt-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                  <span>Signals evaluated against noise profile</span>
                </div>

                <div className="p-2.5 rounded-lg bg-gradient-to-r from-[#FF5500]/90 to-[#b51848] text-white flex items-center justify-between text-xs font-semibold shadow-md cursor-pointer hover:opacity-95 transition-opacity">
                  <div className="flex items-center gap-2">
                    <Shield className="w-3.5 h-3.5" />
                    <span>Suppress traffic ambient noise</span>
                  </div>
                  <span className="text-[10px] bg-black/30 px-2 py-0.5 rounded font-mono">-10 dB SNR</span>
                </div>
              </div>
            </div>
          </div>

          {/* REALTIME STREAM */}
          <div className="p-6 rounded-2xl border border-[#272733] bg-[#16161c] flex flex-col justify-between group hover:border-[#38384a] transition-all">
            <div>
              <div className="flex items-center gap-2 text-white font-bold text-lg">
                <Radio className="w-5 h-5 text-zinc-400" />
                <span>Real-Time Oscilloscope Stream</span>
              </div>
              <p className="mt-2 text-xs text-zinc-400 leading-relaxed">
                Continuous sub-50ms acoustic streaming directly from IoT edge nodes and smartphone MEMS sensors.
              </p>

              <div className="mt-6 rounded-xl border border-[#292936] bg-[#191921] p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <h4 className="text-xs font-semibold text-zinc-200">Active Sensor Array</h4>
                    <p className="text-[10px] text-zinc-500">Multi-channel ring buffer telemetry</p>
                  </div>
                  <Radio className="w-4 h-4 text-emerald-400" />
                </div>

                <div className="flex items-center justify-between pt-1">
                  <div className="flex items-center -space-x-1.5">
                    <span className="w-6 h-6 rounded-full bg-indigo-600 border border-zinc-900 text-[10px] flex items-center justify-center font-bold text-white">
                      G1
                    </span>
                    <span className="w-6 h-6 rounded-full bg-emerald-600 border border-zinc-900 text-[10px] flex items-center justify-center font-bold text-white">
                      G2
                    </span>
                    <span className="w-6 h-6 rounded-full bg-orange-600 border border-zinc-900 text-[10px] flex items-center justify-center font-bold text-white">
                      M1
                    </span>
                  </div>
                  <span className="text-[10px] text-zinc-300 font-mono">
                    3 Active Transducers
                  </span>
                </div>

                <div className="p-3 rounded-lg border border-[#262633] bg-[#131318] space-y-2 text-xs">
                  <span className="text-[10px] uppercase font-mono tracking-widest text-zinc-500 block">
                    MONITORING PLAN
                  </span>
                  <div className="font-semibold text-zinc-200">Cyclic Fatigue Test Session</div>
                  <div
                    onClick={() => setDocTaskDone(!docTaskDone)}
                    className="flex items-center gap-2 text-zinc-400 cursor-pointer pt-1 hover:text-zinc-200"
                  >
                    {docTaskDone ? (
                      <CheckSquare className="w-3.5 h-3.5 text-[#FF5500]" />
                    ) : (
                      <Square className="w-3.5 h-3.5 text-zinc-500" />
                    )}
                    <span className={docTaskDone ? "line-through text-zinc-500" : ""}>
                      Calibrate sensor sensitivity
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* DESIGNED FOR STRUCTURAL RESEARCH & ENGINEERING            */}
      {/* ========================================================= */}
      <section className="relative py-24 px-4 sm:px-6 max-w-7xl mx-auto w-full text-center overflow-hidden">
        
        {/* Signature Magenta / Warm Pink Atmospheric Background Hue */}
        <div className="absolute top-0 right-0 w-[650px] h-[520px] bg-gradient-to-l from-[#FF5500]/16 via-[#ea580c]/6 to-transparent rounded-full blur-[110px] pointer-events-none -z-0" />
        <div className="absolute top-24 right-1/4 w-[380px] h-[320px] bg-[#FF5500]/12 rounded-full blur-[80px] pointer-events-none -z-0" />

        <div className="relative z-10">
          <h2 className="text-3xl sm:text-4xl lg:text-[44px] font-[550] tracking-[-0.035em] text-white leading-[1.15]">
            Designed for the structural <br />
            engineers in your workflow
            <span className="text-[#FF5500] font-bold">_</span>
          </h2>

          <p className="mt-4 text-zinc-400 text-sm sm:text-base max-w-2xl mx-auto leading-relaxed font-normal">
            Query acoustic waveforms, compute simplicial homology, and isolate micro-crack precursors before macroscopic structural failure.
          </p>

          {/* AI / Engineering Console Container */}
          <div className="mt-12 rounded-2xl border border-[#272733] bg-[#16161c]/95 backdrop-blur-md shadow-[0_25px_80px_rgba(0,0,0,0.85)] overflow-hidden text-left text-xs">
            {(() => {
              const currQuery = CONSOLE_DEMO_QUERIES[consoleQueryIdx] || CONSOLE_DEMO_QUERIES[0];
              return (
                <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[460px]">
                  {/* Left Column: Pipeline Stream */}
                  <div className="lg:col-span-6 p-6 border-b lg:border-b-0 lg:border-r border-[#23232c] space-y-4 flex flex-col justify-between">
                    <div className="space-y-3.5">
                      {/* Top Connected Card: TopoAE Pipeline Engine */}
                      <div className="p-3 rounded-xl border border-[#272733] bg-[#16161c] space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="text-[#FF5500]">❖</span>
                            <span className="text-xs font-semibold text-white">TopoAE Pipeline Engine</span>
                            <span className="text-[10px] px-2 py-0.5 rounded bg-[#202028] text-zinc-300 border border-[#2e2e3a] font-mono">
                              Validated (EN 1330-9)
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-[11px] text-zinc-500 font-mono hidden sm:inline">engine.echosense.ai</span>
                            <button
                              onClick={() => setIsConsolePlaying(!isConsolePlaying)}
                              className="px-2 py-0.5 rounded text-[11px] font-mono border border-[#2d2d3a] bg-[#191922] text-zinc-300 hover:text-white flex items-center gap-1.5 transition-colors cursor-pointer"
                              title={isConsolePlaying ? "Pause console animation" : "Resume console animation"}
                            >
                              {isConsolePlaying ? (
                                <>
                                  <Pause className="w-2.5 h-2.5 text-[#FF5500]" />
                                  <span>Active Stream</span>
                                </>
                              ) : (
                                <>
                                  <Play className="w-2.5 h-2.5 text-zinc-400" />
                                  <span>Paused</span>
                                </>
                              )}
                            </button>
                          </div>
                        </div>
                        <div className="flex items-center gap-1.5 text-[11px] text-zinc-300 font-mono">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#FF5500] animate-pulse" />
                          <span>GUDHI C++ Core &amp; PyTorch Verified</span>
                        </div>
                      </div>

                      {/* Pre-Indexed Engineering Query Switcher */}
                      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-[11px] font-mono">
                        {CONSOLE_DEMO_QUERIES.map((q, idx) => (
                          <button
                            key={idx}
                            onClick={() => {
                              setConsoleQueryIdx(idx);
                              setConsoleStage(0);
                            }}
                            className={`px-2.5 py-1 rounded-md transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                              consoleQueryIdx === idx
                                ? "bg-[#252533] text-white border border-[#FF5500]/40 shadow-sm"
                                : "bg-[#141419] text-zinc-400 border border-[#23232c] hover:text-zinc-200"
                            }`}
                          >
                            <span className={`w-1.5 h-1.5 rounded-full ${consoleQueryIdx === idx ? "bg-[#FF5500] animate-pulse" : "bg-zinc-600"}`} />
                            <span>{q.girder}</span>
                          </button>
                        ))}
                      </div>

                      {/* User query bubble */}
                      <div className="flex justify-end pt-1">
                        <div className="px-4 py-2.5 rounded-2xl bg-[#24242d] border border-[#2f2f3a] text-zinc-100 text-xs font-medium max-w-sm shadow-md transition-all">
                          <div className="flex items-center justify-between text-[10px] text-zinc-500 font-mono mb-1">
                            <span>SHM Lead • Eng-01</span>
                            <span className="text-[#FF5500]">{currQuery.girder}</span>
                          </div>
                          {currQuery.query}
                        </div>
                      </div>

                      {/* Tool Step 1: Takens delay embedding */}
                      <div
                        className={`flex items-center justify-between p-3 rounded-lg border transition-all ${
                          consoleStage === 1
                            ? "border-[#FF5500]/50 bg-[#FF5500]/[0.08] shadow-sm"
                            : consoleStage >= 2
                            ? "border-[#23232c] bg-[#141418] text-zinc-300"
                            : "opacity-45 border-[#1d1d24] bg-[#111116] text-zinc-500"
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          {consoleStage === 1 ? (
                            <RotateCw className="w-3.5 h-3.5 text-[#FF5500] animate-spin" />
                          ) : consoleStage >= 2 ? (
                            <Wrench className="w-3.5 h-3.5 text-zinc-400" />
                          ) : (
                            <Clock className="w-3.5 h-3.5 text-zinc-600" />
                          )}
                          <span className="font-mono text-[11px]">
                            {consoleStage === 1 ? (
                              <span className="text-zinc-200 font-semibold">
                                Computing <span className="text-[#FF5500]">takens.phase_space_reconstruct...</span>
                              </span>
                            ) : (
                              <span>Using engine <span className="text-zinc-200">{currQuery.step1Name}</span></span>
                            )}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          {consoleStage >= 2 ? (
                            <>
                              <span className="text-[10px] font-mono text-zinc-400 bg-[#1c1c24] px-1.5 py-0.5 rounded border border-[#2a2a38]">
                                {currQuery.step1Metric}
                              </span>
                              <Check className="w-3.5 h-3.5 text-[#FF5500]" />
                            </>
                          ) : consoleStage === 1 ? (
                            <span className="text-[10px] font-mono text-[#FF5500] animate-pulse">Running</span>
                          ) : (
                            <span className="text-[10px] font-mono text-zinc-600">Queued</span>
                          )}
                        </div>
                      </div>

                      {/* Tool Step 2: GUDHI TDA */}
                      <div
                        className={`flex items-center justify-between p-3 rounded-lg border transition-all ${
                          consoleStage === 2
                            ? "border-[#FF5500]/50 bg-[#FF5500]/[0.08] shadow-sm"
                            : consoleStage >= 3
                            ? "border-[#23232c] bg-[#141418] text-zinc-300"
                            : "opacity-45 border-[#1d1d24] bg-[#111116] text-zinc-500"
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          {consoleStage === 2 ? (
                            <RotateCw className="w-3.5 h-3.5 text-[#FF5500] animate-spin" />
                          ) : consoleStage >= 3 ? (
                            <span className="text-zinc-400">❖</span>
                          ) : (
                            <Clock className="w-3.5 h-3.5 text-zinc-600" />
                          )}
                          <span className="font-mono text-[11px]">
                            {consoleStage === 2 ? (
                              <span className="text-zinc-200 font-semibold">
                                Computing <span className="text-[#FF5500]">gudhi.compute_vietoris_rips...</span>
                              </span>
                            ) : (
                              <span>Ran TDA <span className="text-zinc-200">{currQuery.step2Name}</span></span>
                            )}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          {consoleStage >= 3 ? (
                            <>
                              <span className="text-[10px] font-mono text-zinc-400 bg-[#1c1c24] px-1.5 py-0.5 rounded border border-[#2a2a38]">
                                {currQuery.step2Metric}
                              </span>
                              <Check className="w-3.5 h-3.5 text-[#FF5500]" />
                            </>
                          ) : consoleStage === 2 ? (
                            <span className="text-[10px] font-mono text-[#FF5500] animate-pulse">Filtration</span>
                          ) : (
                            <span className="text-[10px] font-mono text-zinc-600">Queued</span>
                          )}
                        </div>
                      </div>

                      {/* Agent Response Text */}
                      {consoleStage >= 3 ? (
                        <div className="p-3 rounded-lg border border-[#272735] bg-[#181822] text-xs text-zinc-200 leading-relaxed font-sans shadow-sm transition-all animate-in fade-in duration-300">
                          <div className="flex items-center gap-1.5 text-[10px] font-mono text-[#FF5500] mb-1 font-semibold">
                            <Zap className="w-3 h-3 fill-current" />
                            <span>TOPOAE INFERENCE SYNTHESIS</span>
                          </div>
                          <p>{currQuery.response}</p>
                        </div>
                      ) : (
                        <div className="p-3 rounded-lg border border-dashed border-[#23232c] bg-[#131317] text-xs text-zinc-500 leading-relaxed font-mono flex items-center gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#FF5500] animate-ping" />
                          <span>Synthesizing topological persistence with BOCD hazard rate...</span>
                        </div>
                      )}
                    </div>

                    <div className="pt-3 border-t border-[#23232c] flex flex-wrap items-center justify-between gap-2 text-[11px] text-zinc-500 font-mono">
                      <span className="flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#FF5500] animate-pulse" />
                        <span className="text-zinc-300">TopoAE Inference Engine synchronized</span>
                      </span>
                      <div className="flex items-center gap-2 text-zinc-400">
                        <span>Ring Buffer: {ringBufferPct}%</span>
                        <div className="w-14 h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-[#FF5500] rounded-full transition-all duration-500"
                            style={{ width: `${ringBufferPct}%` }}
                          />
                        </div>
                        <span className="text-[10px] text-zinc-500">10.0 MS/s</span>
                      </div>
                    </div>
                  </div>

                  {/* Right Column: Live Result Inspector */}
                  <div className="lg:col-span-6 p-6 bg-[#141419] flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between pb-3 border-b border-[#23232c] text-xs">
                        <button className="px-3 py-1 rounded-md font-medium bg-[#23232c] text-white">
                          ae_events
                        </button>
                        <span className="font-mono text-[10px] text-zinc-400 flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#FF5500] animate-ping" />
                          LIVE AE INGESTION
                        </span>
                      </div>

                      <div className="mt-4">
                        <h4 className="text-sm font-bold text-white tracking-tight">{currQuery.tableName}</h4>
                        <p className="text-xs text-zinc-400 mt-0.5">{currQuery.totalRows}</p>
                      </div>

                      <div className="my-3 p-2.5 rounded-lg border border-[#262630] bg-[#121217] font-mono text-xs overflow-x-auto text-zinc-300">
                        <span className="text-[#FF5500] font-semibold">SELECT</span>{" "}
                        <span className="text-zinc-300">event_id, crack_mode, peak_amp_mv, persistence_h1</span>{" "}
                        <span className="text-[#FF5500] font-semibold">FROM</span>{" "}
                        <span className="text-zinc-100 font-semibold">{currQuery.tableName}</span>{" "}
                        <span className="text-[#FF5500] font-semibold">WHERE</span>{" "}
                        <span className="text-zinc-300">fatigue_block = 4</span>
                        <span className="inline-block w-1.5 h-3 ml-1 bg-[#FF5500] animate-pulse align-middle" />
                      </div>

                      <div className="space-y-1.5">
                        {currQuery.events.map((ev, idx) => {
                          const isSelected = selectedEventIdx === idx;
                          return (
                            <div
                              key={idx}
                              onClick={() => setSelectedEventIdx(idx)}
                              className={`flex items-center justify-between p-2.5 rounded-lg border transition-all cursor-pointer ${
                                isSelected
                                  ? "border-[#FF5500]/50 bg-[#FF5500]/[0.08] shadow-sm"
                                  : "border-[#22222b] bg-[#15151a] hover:border-zinc-700"
                              }`}
                            >
                              <div className="flex items-center gap-2.5">
                                <div
                                  className={`w-7 h-7 rounded-full text-[10px] font-bold flex items-center justify-center font-mono transition-colors ${
                                    isSelected
                                      ? "bg-[#FF5500] text-white"
                                      : "bg-zinc-800 border border-zinc-700/60 text-zinc-300"
                                  }`}
                                >
                                  0{idx + 1}
                                </div>
                                <div>
                                  <div className="text-xs font-semibold text-white flex items-center gap-1.5">
                                    <span>{ev.id} ({ev.mode})</span>
                                    {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-[#FF5500] animate-ping" />}
                                  </div>
                                  <div className="text-[11px] text-zinc-400 font-mono mt-0.5">
                                    Apk: {ev.amp} • H₁: {ev.h1} • {ev.freq}
                                  </div>
                                </div>
                              </div>

                              <div className="flex items-center gap-3">
                                {/* Mini Acoustic Waveform Sparkline */}
                                <svg viewBox="0 0 60 20" className="w-[54px] h-4 shrink-0 opacity-80 overflow-visible">
                                  <path
                                    d={ev.wavePath}
                                    fill="none"
                                    stroke={ev.isCritical ? "#FF5500" : isSelected ? "#FF5500" : "#94a3b8"}
                                    strokeWidth="1.3"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                  />
                                </svg>

                                {ev.isCritical ? (
                                  <span className="text-[10px] px-2 py-0.5 rounded bg-rose-500/15 text-rose-300 border border-rose-500/40 font-medium font-mono flex items-center gap-1">
                                    <span className="w-1.5 h-1.5 rounded-full bg-rose-400 animate-ping" />
                                    Critical
                                  </span>
                                ) : (
                                  <span className="text-[10px] px-2 py-0.5 rounded bg-[#FF5500]/10 text-[#FF5500] border border-[#FF5500]/30 font-medium font-mono">
                                    Precursor
                                  </span>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    <div className="pt-4 border-t border-[#23232c] flex items-center justify-between text-[11px] text-zinc-500 font-mono">
                      <span>Showing 3 of {currQuery.totalRows}</span>
                      <Link href="/datasets" className="text-zinc-400 hover:text-white transition-colors">
                        View full catalog in Datasets →
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })()}
          </div>
        </div>

        {/* Interactive Floating Prompt Box */}
        <div className="mt-16 w-full max-w-[490px] mx-auto text-left">
          <form
            onSubmit={handlePromptSubmit}
            className="rounded-2xl border border-[#28282e] bg-[#1d1d21] p-3.5 shadow-2xl shadow-black/70 transition-all focus-within:border-[#383842]"
          >
            <div className="flex items-center justify-between gap-3">
              <input
                type="text"
                placeholder="Query acoustic signals, inspect persistence, or run BOCD..."
                value={promptText}
                onChange={(e) => setPromptText(e.target.value)}
                className="w-full bg-transparent text-sm text-zinc-200 placeholder:text-zinc-500 focus:outline-none"
              />
              <div className="flex items-center gap-2.5 text-zinc-400">
                <Paperclip className="w-4 h-4 hover:text-white cursor-pointer transition-colors" />
                <Mic className="w-4 h-4 hover:text-white cursor-pointer transition-colors" />
                <button
                  type="submit"
                  className="w-7 h-7 rounded-lg bg-[#27272f] hover:bg-[#34343f] text-zinc-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
                  title="Execute query in console"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <div className="flex items-center gap-2 pt-3 mt-2 border-t border-zinc-800/50 text-[11px] text-zinc-400">
              <span
                onClick={() =>
                  setActiveModelDropdown((prev) =>
                    prev === "TopoAE-RF v1.2" ? "BOCD-Online v2.0" : "TopoAE-RF v1.2"
                  )
                }
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-md border border-[#2d2d35] bg-[#222228] hover:bg-[#282830] text-zinc-300 cursor-pointer transition-colors select-none"
              >
                <Globe className="w-3 h-3 text-zinc-400" />
                <span className="font-medium font-mono">{activeModelDropdown}</span>
                <ChevronDown className="w-3 h-3 text-zinc-500" />
              </span>
              <span
                onClick={() => {
                  setConsoleQueryIdx((prev) => (prev + 1) % CONSOLE_DEMO_QUERIES.length);
                  setConsoleStage(0);
                }}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-md border border-[#2d2d35] bg-[#222228] hover:bg-[#282830] text-zinc-300 cursor-pointer transition-colors select-none"
              >
                <span className="w-3.5 h-3.5 rounded-full bg-zinc-700 text-[9px] font-bold text-zinc-200 flex items-center justify-center">
                  G1
                </span>
                <span className="font-medium">{CONSOLE_DEMO_QUERIES[consoleQueryIdx]?.girder || "Girder G1"}</span>
                <ChevronDown className="w-3 h-3 text-zinc-500" />
              </span>
            </div>
          </form>

          <p className="text-[11px] text-zinc-500 mt-2.5 text-center font-normal">
            Press Enter to send, Shift+Enter for new line
          </p>
        </div>

        {/* Validated Environments */}
        <div className="mt-14 sm:mt-16 text-center">
          <h3 className="text-xl sm:text-2xl font-[550] tracking-[-0.02em] text-white">
            Validated across edge &amp; high-performance environments
          </h3>

          <div className="flex flex-wrap items-center justify-center gap-2.5 sm:gap-3 max-w-4xl mx-auto mt-6">
            <div className="w-full sm:w-[224px] h-[48px] px-4 rounded-xl border border-[#26262c] bg-[#1a1a1e] flex items-center justify-between transition-all hover:border-[#383842] cursor-pointer">
              <div className="flex items-center gap-2.5">
                <div className="w-5 h-5 flex items-center justify-center text-white">
                  <Code2 className="w-4 h-4" />
                </div>
                <span className="font-medium text-white text-sm tracking-tight">Python / PyTorch</span>
              </div>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#24242a] text-zinc-400 border border-[#2e2e36] font-medium">
                Official
              </span>
            </div>

            <div className="w-full sm:w-[224px] h-[48px] px-4 rounded-xl border border-[#2e2f36] bg-[#1e1f24] flex items-center justify-between transition-all hover:border-[#3e404b] cursor-pointer shadow-lg shadow-black/30">
              <div className="flex items-center gap-2.5">
                <div className="w-5 h-5 flex items-center justify-center text-amber-400">
                  <Sparkles className="w-4 h-4" />
                </div>
                <span className="font-medium text-white text-sm tracking-tight">GUDHI TDA</span>
              </div>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#24242a] text-zinc-400 border border-[#2e2e36] font-medium">
                Core Engine
              </span>
            </div>

            <div className="w-full sm:w-[224px] h-[48px] px-4 rounded-xl border border-[#26262c] bg-[#1a1a1e] flex items-center justify-between transition-all hover:border-[#383842] cursor-pointer">
              <div className="flex items-center gap-2.5">
                <div className="w-5 h-5 flex items-center justify-center text-sky-400">
                  <Activity className="w-4 h-4" />
                </div>
                <span className="font-medium text-white text-sm tracking-tight">C++ / CUDA</span>
              </div>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#24242a] text-zinc-400 border border-[#2e2e36] font-medium">
                Optimized
              </span>
            </div>
          </div>

          <div className="mt-5 mx-auto w-fit rounded-full border border-[#28282e] bg-[#19191d] py-1.5 px-4 flex items-center gap-4 text-zinc-400">
            <span className="font-mono text-xs">NumPy</span>
            <span className="font-mono text-xs">SciPy</span>
            <span className="font-mono text-xs">Scikit-Learn</span>
            <span className="font-mono text-xs">FastAPI</span>
            <span className="font-mono text-xs">Next.js</span>
            <span className="text-[11px] text-zinc-400 font-mono font-medium">
              +6
            </span>
          </div>
        </div>

        {/* Model Benchmark Arena Table */}
        <div className="mt-20 rounded-2xl border border-[#272733] bg-[#16161c] p-6 text-left">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-[#23232c]">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-lg font-bold text-white">Model Benchmark Arena</span>
              </div>
              <p className="mt-1 text-xs text-zinc-400 max-w-xl">
                Comparing TopoAE against conventional acoustic emission parameter models and deep learning baselines across standard structural datasets.
              </p>
            </div>

            <Link href="/compare" className="px-4 py-2 rounded-lg border border-[#2e2e3d] bg-[#1c1c26] hover:bg-[#252535] text-xs font-semibold text-white transition-colors cursor-pointer self-start md:self-auto">
              View full benchmark
            </Link>
          </div>

          <div className="overflow-x-auto mt-4">
            <table className="w-full text-left font-mono text-xs">
              <thead className="border-b border-zinc-800 text-zinc-500 uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-3 px-2 font-semibold">Model / Framework</th>
                  <th className="py-3 px-2 font-semibold text-right">Inference</th>
                  <th className="py-3 px-2 font-semibold text-right">Macro F1</th>
                  <th className="py-3 px-2 font-semibold text-right">Tensile</th>
                  <th className="py-3 px-2 font-semibold text-right">Shear</th>
                  <th className="py-3 px-2 font-semibold text-right">Mixed-Mode</th>
                  <th className="py-3 px-2 font-semibold text-right">-10dB SNR</th>
                  <th className="py-3 px-2 font-semibold text-right">Step Latency</th>
                  <th className="py-3 px-2 font-semibold text-right">Precursor Lead</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60 text-zinc-300">
                {BENCHMARK_MODELS.map((m, idx) => (
                  <tr
                    key={idx}
                    className={`hover:bg-zinc-800/30 transition-colors ${
                      m.highlight ? "bg-[#FF5500]/5 text-white" : ""
                    }`}
                  >
                    <td className="py-3 px-2 font-semibold text-white flex items-center gap-2">
                      {m.highlight && <span className="w-1.5 h-1.5 rounded-full bg-[#FF5500]" />}
                      <span>{m.model}</span>
                    </td>
                    <td className="py-3 px-2 text-right text-zinc-400">{m.cost}</td>
                    <td className="py-3 px-2 text-right font-bold text-emerald-400">{m.overall}</td>
                    <td className="py-3 px-2 text-right text-zinc-300">{m.auth}</td>
                    <td className="py-3 px-2 text-right text-zinc-300">{m.tables}</td>
                    <td className="py-3 px-2 text-right text-zinc-300">{m.functions}</td>
                    <td className="py-3 px-2 text-right text-zinc-300">{m.storage}</td>
                    <td className="py-3 px-2 text-right text-zinc-300">{m.sites}</td>
                    <td className="py-3 px-2 text-right font-semibold text-[#FF5500]">{m.messaging}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* VALIDATED ON BENCHMARKS (Testimonials Carousel)          */}
      {/* ========================================================= */}
      <section className="relative py-20 sm:py-24 px-4 sm:px-6 max-w-7xl mx-auto w-full text-center border-t border-[#23232c] overflow-hidden">
        
        <div className="absolute top-1/2 left-1/3 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[400px] bg-[radial-gradient(ellipse_at_center,rgba(255,85,0,0.06)_0%,rgba(194,65,12,0.02)_50%,transparent_75%)] pointer-events-none -z-10 blur-3xl" />

        <h2 className="text-3xl sm:text-4xl lg:text-[46px] font-[550] tracking-[-0.035em] text-white leading-[1.15]">
          Validated on full-scale structural benchmarks
          <span className="text-[#FF5500] font-bold">_</span>
        </h2>

        <p className="mt-4 text-sm sm:text-base text-zinc-400 font-normal max-w-2xl mx-auto leading-relaxed">
          From laboratory concrete specimen fracture to full-scale prestressed bridge girder cyclic fatigue tests.
        </p>

        <div className="mt-14 flex items-stretch gap-5 overflow-x-auto pb-4 no-scrollbar text-left scroll-smooth">
          
          {/* CARD 1: Bridge Girder Dataset */}
          <div
            onClick={() => setActiveTestimonial(0)}
            className={`rounded-2xl border border-[#27272c] bg-[#1d1d21] p-8 sm:p-10 flex flex-col justify-between shadow-2xl min-h-[360px] sm:min-h-[400px] transition-all duration-300 ${
              activeTestimonial === 0
                ? "min-w-[340px] sm:min-w-[560px] lg:min-w-[620px] flex-1 cursor-default"
                : "w-[150px] sm:w-[170px] lg:w-[190px] shrink-0 items-center justify-center cursor-pointer hover:border-[#38384a]"
            }`}
          >
            {activeTestimonial === 0 ? (
              <>
                <div>
                  <div className="flex items-center gap-2.5">
                    <Activity className="w-5 h-5 text-[#FF5500]" />
                    <span className="text-xl font-medium text-white tracking-tight">Bridge Girder Benchmark</span>
                  </div>

                  <h3 className="mt-6 text-2xl sm:text-3xl lg:text-[32px] font-[550] text-white tracking-tight leading-[1.22] max-w-xl">
                    Detected shear crack precursors 340ms prior to macro-failure
                  </h3>

                  <p className="mt-6 text-sm sm:text-base text-zinc-400 font-normal leading-relaxed max-w-xl">
                    “TopoAE&apos;s persistent homology captures micro-fissure wave reverberations in full-scale prestressed girders that conventional amplitude thresholding completely misses under cyclic fatigue loading.”
                  </p>
                </div>

                <div className="mt-8 pt-6 flex items-center justify-between border-t border-transparent">
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-zinc-300 font-normal">
                      D&apos;Angela &amp; Magliulo (2026), Structural Concrete
                    </span>
                  </div>

                  <Link
                    href="/datasets"
                    className="text-xs text-zinc-400 hover:text-white transition-colors flex items-center gap-1 font-medium group"
                  >
                    <span>Read dataset specification</span>
                    <span className="group-hover:translate-x-0.5 transition-transform">→</span>
                  </Link>
                </div>
              </>
            ) : (
              <div className="flex items-center gap-2 text-zinc-400 group-hover:text-white text-lg font-medium tracking-tight transition-colors">
                <Activity className="w-4 h-4 text-zinc-400" />
                <span>Girder AE</span>
              </div>
            )}
          </div>

          {/* CARD 2: Concrete Dataset */}
          <div
            onClick={() => setActiveTestimonial(1)}
            className={`rounded-2xl border border-[#27272c] bg-[#1d1d21] p-8 sm:p-10 flex flex-col justify-between shadow-2xl min-h-[360px] sm:min-h-[400px] transition-all duration-300 ${
              activeTestimonial === 1
                ? "min-w-[340px] sm:min-w-[560px] lg:min-w-[620px] flex-1 cursor-default"
                : "w-[150px] sm:w-[170px] lg:w-[190px] shrink-0 items-center justify-center cursor-pointer hover:border-[#38384a]"
            }`}
          >
            {activeTestimonial === 1 ? (
              <>
                <div>
                  <div className="flex items-center text-zinc-200 text-2xl font-medium tracking-tight">
                    <span>Concrete AE Benchmark</span>
                  </div>

                  <h3 className="mt-6 text-2xl sm:text-3xl lg:text-[32px] font-[550] text-white tracking-tight leading-[1.22] max-w-xl">
                    16.6K compressive and flexural fracture events validated
                  </h3>

                  <p className="mt-6 text-sm sm:text-base text-zinc-400 font-normal leading-relaxed max-w-xl">
                    “Uniaxial compression and 4-point bending acoustic events from Siracusano et al. (Mendeley Data) verified 94.6% crack mode classification accuracy.”
                  </p>
                </div>

                <div className="mt-8 pt-6 flex items-center justify-between border-t border-transparent">
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-zinc-300 font-normal">
                      Siracusano et al., Mendeley Data Benchmark
                    </span>
                  </div>

                  <Link
                    href="/datasets"
                    className="text-xs text-zinc-400 hover:text-white transition-colors flex items-center gap-1 font-medium group"
                  >
                    <span>Read dataset specification</span>
                    <span className="group-hover:translate-x-0.5 transition-transform">→</span>
                  </Link>
                </div>
              </>
            ) : (
              <div className="flex items-center text-zinc-300 text-xl font-medium tracking-tight">
                <span>Concrete AE</span>
              </div>
            )}
          </div>

          {/* CARD 3: Smartphone MEMS Testbed */}
          <div
            onClick={() => setActiveTestimonial(2)}
            className={`rounded-2xl border border-[#27272c] bg-[#1d1d21] p-8 sm:p-10 flex flex-col justify-between shadow-2xl min-h-[360px] sm:min-h-[400px] transition-all duration-300 ${
              activeTestimonial === 2
                ? "min-w-[340px] sm:min-w-[560px] lg:min-w-[620px] flex-1 cursor-default"
                : "w-[150px] sm:w-[170px] lg:w-[190px] shrink-0 items-center justify-center cursor-pointer hover:border-[#38384a]"
            }`}
          >
            {activeTestimonial === 2 ? (
              <>
                <div>
                  <span className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
                    Smartphone Edge Testbed
                  </span>

                  <h3 className="mt-6 text-2xl sm:text-3xl lg:text-[32px] font-[550] text-white tracking-tight leading-[1.22] max-w-xl">
                    Robust precursor extraction with commodity MEMS sensors
                  </h3>

                  <p className="mt-6 text-sm sm:text-base text-zinc-400 font-normal leading-relaxed max-w-xl">
                    “Reconstructed dynamical attractors from 44.1 kHz smartphone recordings remain topological invariants despite acoustic attenuation and environmental noise.”
                  </p>
                </div>

                <div className="mt-8 pt-6 flex items-center justify-between border-t border-transparent">
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-zinc-300 font-normal">
                      Civil Infrastructure &amp; SHM Diagnostics Institute
                    </span>
                  </div>

                  <Link
                    href="/docs"
                    className="text-xs text-zinc-400 hover:text-white transition-colors flex items-center gap-1 font-medium group"
                  >
                    <span>Read synopsis</span>
                    <span className="group-hover:translate-x-0.5 transition-transform">→</span>
                  </Link>
                </div>
              </>
            ) : (
              <span className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-300 hover:text-white transition-colors">
                MEMS Testbed
              </span>
            )}
          </div>

          <div className="w-[100px] sm:w-[140px] shrink-0 rounded-2xl border border-[#27272c]/40 bg-[#1d1d21]/40 opacity-40 min-h-[360px] sm:min-h-[400px]" />
        </div>
      </section>

      {/* ========================================================= */}
      {/* SCIENTIFIC RIGOR & COMPLIANCE                             */}
      {/* ========================================================= */}
      <section className="py-20 sm:py-28 px-4 sm:px-6 max-w-7xl mx-auto w-full text-center">
        <h2 className="text-3xl sm:text-4xl lg:text-[44px] font-[550] tracking-[-0.035em] text-white leading-[1.15]">
          Scientific rigor &amp; compliance across <br />
          every layer of the framework
          <span className="text-[#FF5500] font-bold">_</span>
        </h2>

        <p className="mt-4 text-zinc-400 text-sm sm:text-base leading-relaxed max-w-2xl mx-auto font-normal">
          Built according to non-destructive testing (NDT) standards and reproducible research practices for reliable civil infrastructure health monitoring.
        </p>

        <div className="mt-14 rounded-2xl border border-[#27272c] bg-[#1b1b1e] p-8 sm:p-10 lg:p-12 shadow-2xl">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-8 sm:gap-x-10 lg:gap-x-12 gap-y-10 sm:gap-y-12 text-left">
            {SECURITY_CARDS.map((card, idx) => (
              <div key={idx} className="flex flex-col">
                <div className="mb-3.5 flex items-center">
                  {card.icon}
                </div>
                <h3 className="text-sm sm:text-[15px] font-semibold text-white tracking-tight mb-2">
                  {card.title}
                </h3>
                <p className="text-xs sm:text-[13px] text-zinc-400 leading-relaxed font-normal">
                  {card.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* THE ECHOSENSE SENSOR NETWORK                              */}
      {/* ========================================================= */}
      <section className="relative pt-20 pb-12 px-4 sm:px-6 max-w-7xl mx-auto w-full text-center border-t border-[#23232c] overflow-hidden">
        
        <h2 className="text-3xl sm:text-5xl font-bold tracking-tight text-white leading-tight">
          The EchoSense Sensor Network
          <span className="text-[#FF5500]">_</span>
        </h2>

        <p className="mt-4 text-zinc-400 text-sm sm:text-base max-w-3xl mx-auto leading-relaxed">
          Unified edge-to-cloud acoustic monitoring: smartphone MEMS microphones, piezoelectric resonant transducers (10 MHz), and low-power IoT edge nodes continuously streaming precursor telemetry with sub-500ms warning latency.
        </p>

        <div className="mt-6 flex flex-wrap items-center justify-center gap-6 text-xs font-semibold">
          <div className="flex items-center gap-2 text-zinc-300">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>Sub-500ms Precursor Alert</span>
          </div>
          <div className="flex items-center gap-2 text-zinc-300">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>Lossless Waveform Ring Buffer</span>
          </div>
          <div className="flex items-center gap-2 text-zinc-300">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>Edge TDA Feature Extraction</span>
          </div>
        </div>

        {/* ========================================================= */}
        {/* DUAL TELEMETRY CONSOLE                                     */}
        {/* ========================================================= */}
        <div className="mt-12 w-full max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-6 text-left">
          
          {/* Card 1: EchoSense MCP Execution Log */}
          <div className="rounded-2xl border border-[#222228] bg-[#141418] p-6 sm:p-7 shadow-2xl flex flex-col justify-between">
            <div>
              {/* Header */}
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-[#1e1e24] border border-[#2a2a34] flex items-center justify-center text-zinc-400">
                    <Terminal className="w-4 h-4 text-zinc-300" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-white text-sm">EchoSense MCP</span>
                      <span className="text-[11px] font-medium text-emerald-400">Connected</span>
                    </div>
                    <span className="text-[11px] font-mono text-zinc-500">mcp.echosense.io</span>
                  </div>
                </div>
              </div>

              {/* Sub-header check */}
              <div className="mt-2.5 flex items-center gap-1.5 text-[11px] text-zinc-400">
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span>Authenticated with Hardware PTP Clock</span>
              </div>

              {/* Prompt Chat Bubble */}
              <div className="mt-6 flex justify-end">
                <div className="bg-[#1f1f26] border border-[#282833] rounded-2xl px-4 py-2.5 text-xs text-zinc-200 max-w-sm text-left shadow-sm">
                  Query Girder G1 acoustic stream for micro-tensile rupture precursors.
                </div>
              </div>

              {/* Action Rows */}
              <div className="mt-6 space-y-3 font-sans text-xs">
                <div className="flex items-center justify-between py-1 text-zinc-400">
                  <div className="flex items-center gap-3">
                    <Wrench className="w-3.5 h-3.5 text-zinc-500" />
                    <span className="text-zinc-500 font-medium">Using skill</span>
                    <span className="text-zinc-300 font-mono text-[11px]">echosense.streamBuffer</span>
                  </div>
                  <Check className="w-4 h-4 text-emerald-400" />
                </div>

                <div className="flex items-center justify-between py-1 text-zinc-400">
                  <div className="flex items-center gap-3">
                    <Terminal className="w-3.5 h-3.5 text-zinc-500" />
                    <span className="text-zinc-500 font-medium">Ran MCP</span>
                    <span className="text-zinc-300 font-mono text-[11px]">topological.computeHomology</span>
                  </div>
                  <Check className="w-4 h-4 text-emerald-400" />
                </div>
              </div>

              {/* Agent Output Text */}
              <p className="mt-6 text-xs text-zinc-300 leading-relaxed font-sans">
                2,184 burst events processed since load stage 3. Persistent H₁ cycle detected at 340ms prior to load drop. Reconstructed attractor confirms localized concrete micro-tensile rupture at x = 4.20m.
              </p>
            </div>
          </div>

          {/* Card 2: Live Acoustic Telemetry Records */}
          <div className="rounded-2xl border border-[#222228] bg-[#141418] p-6 sm:p-7 shadow-2xl flex flex-col justify-between">
            <div>
              {/* Header Pill */}
              <div className="inline-block px-2.5 py-1 rounded-md bg-[#1f1f26] text-zinc-200 font-mono text-xs font-semibold">
                Sensors
              </div>

              {/* Table Title and Subtext */}
              <div className="mt-4">
                <h4 className="text-white font-semibold text-sm">girder_telemetry</h4>
                <p className="text-zinc-500 text-xs mt-0.5">2,184 acoustic hits since load stage 3</p>
              </div>

              {/* Query Box */}
              <div className="mt-4 px-3.5 py-2.5 rounded-lg bg-[#0e0e12] border border-[#1f1f26] font-mono text-xs text-zinc-300 select-all">
                <span className="text-zinc-400">SELECT * FROM ae_stream WHERE amplitude &gt;= 45.0</span>
              </div>

              {/* Sensor Telemetry Rows */}
              <div className="mt-4 space-y-1">
                {[
                  { initials: "G1", name: "Midspan Transducer (R15α)", detail: "ch01@girder.local • 10.0 MS/s", status: "Verified", isVerified: true },
                  { initials: "SK", name: "Shear Key Resonant", detail: "ch02@girder.local • 10.0 MS/s", status: "Verified", isVerified: true },
                  { initials: "P4", name: "Pier Smartphone MEMS", detail: "node04@mems.local • 48.0 kHz", status: "Pending", isVerified: false },
                ].map((row, idx) => (
                  <div key={idx} className="flex items-center justify-between py-2.5 px-2 hover:bg-[#1a1a20]/60 rounded-lg transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-7 h-7 rounded-full bg-[#22222b] border border-[#2b2b36] flex items-center justify-center text-[10px] font-mono font-medium text-zinc-300">
                        {row.initials}
                      </div>
                      <div>
                        <div className="text-white text-xs font-medium">{row.name}</div>
                        <div className="text-zinc-500 text-[11px] font-mono">{row.detail}</div>
                      </div>
                    </div>
                    <span
                      className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${
                        row.isVerified
                          ? "bg-emerald-500/10 text-emerald-400/90 border border-emerald-500/20"
                          : "bg-amber-500/10 text-amber-400/90 border border-amber-500/20"
                      }`}
                    >
                      {row.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* ========================================================= */}
      {/* STATS SCALE SECTION                                       */}
      {/* ========================================================= */}
      <section className="relative py-24 px-4 sm:px-6 max-w-7xl mx-auto w-full text-left overflow-hidden">
        
        <div className="absolute top-1/2 left-0 right-0 -translate-y-1/2 h-[1px] bg-gradient-to-r from-transparent via-[#FF5500] to-transparent shadow-[0_0_20px_#FF5500] rotate-[-7deg] pointer-events-none opacity-80" />

        <div className="relative z-10">
          <h2 className="text-3xl sm:text-5xl font-bold tracking-tight text-white leading-tight">
            Proven across tens of thousands <br />
            of acoustic fracture events
            <span className="text-[#FF5500]">_</span>
          </h2>

          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3 mt-14">
            {SCALE_STATS.map((stat, idx) => (
              <div
                key={idx}
                className="p-4 rounded-xl border border-[#272733] bg-[#16161c]/90 backdrop-blur-md hover:border-[#38384a] transition-all"
              >
                <div className="text-xl sm:text-2xl font-extrabold font-mono text-white tracking-tight">
                  {stat.value}
                </div>
                <span className="text-[11px] text-zinc-400 mt-1 block truncate">
                  {stat.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* DEPLOYMENT TIERS                                          */}
      {/* ========================================================= */}
      <section className="py-24 px-4 sm:px-6 max-w-7xl mx-auto w-full text-left border-t border-[#23232c]">
        
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-10">
          <div>
            <h2 className="text-3xl sm:text-4xl lg:text-[44px] font-[550] tracking-[-0.035em] text-white leading-[1.12]">
              Deploy structural precursor <br />
              monitoring at scale
              <span className="text-[#FF5500] font-bold">_</span>
            </h2>
          </div>

          <div className="flex items-center gap-3 self-start lg:self-auto">
            <Link
              href="/dashboard"
              className="bg-[#FF5500] hover:bg-[#E54B00] text-white font-medium px-5 py-2.5 rounded-lg shadow-[0_0_20px_rgba(255,85,0,0.35)] hover:shadow-[0_0_25px_rgba(255,85,0,0.55)] transition-all text-xs"
            >
              Start monitoring
            </Link>
            <Link
              href="/docs"
              className="bg-[#1a1a20] hover:bg-[#23232a] border border-[#2c2c36] text-[#cfcfd8] hover:text-white font-medium px-5 py-2.5 rounded-lg transition-all text-xs"
            >
              View deployment specs
            </Link>
          </div>
        </div>

        <div className="rounded-2xl border border-[#2b2b34] bg-[#1a1a1f] grid grid-cols-1 md:grid-cols-4 divide-y md:divide-y-0 md:divide-x divide-[#2b2b34] overflow-hidden shadow-2xl">
          
          {/* Column 1: Evaluation Node */}
          <div className="p-8 flex flex-col justify-between min-h-[370px] bg-[#1a1a1f]">
            <div>
              <span className="text-sm font-semibold text-zinc-200 block">Evaluation Node</span>
              
              <div className="mt-4 flex items-baseline">
                <span className="text-4xl sm:text-5xl font-[550] text-white tracking-tight">
                  $0
                </span>
              </div>

              <p className="mt-5 text-xs text-[#a1a1aa] leading-relaxed">
                Ideal for baseline telemetry calibration, local hardware benchmarking, and proof-of-concept testing.
              </p>
            </div>

            <div className="pt-8">
              <Link href="/dashboard" className="w-full block">
                <button className="w-full py-2.5 rounded-lg text-xs font-medium bg-[#16161b] hover:bg-[#202026] border border-[#2a2a33] text-zinc-300 hover:text-white transition-colors cursor-pointer">
                  Start evaluation
                </button>
              </Link>
            </div>
          </div>

          {/* Column 2: Field Node */}
          <div className="p-8 flex flex-col justify-between min-h-[370px] bg-[#1a1a1f]">
            <div>
              <span className="text-sm font-semibold text-zinc-200 block">Field Node</span>
              
              <div className="mt-4 flex items-baseline">
                <span className="text-4xl sm:text-5xl font-[550] text-white tracking-tight">
                  $29
                </span>
                <span className="text-xs text-[#71717a] font-normal ml-1">/month</span>
              </div>

              <p className="mt-5 text-xs text-[#a1a1aa] leading-relaxed">
                For structural engineers who need edge smartphone acoustic capture and rapid damage assessment.
              </p>
            </div>

            <div className="pt-8">
              <Link href="/dashboard" className="w-full block">
                <button className="w-full py-2.5 rounded-lg text-xs font-medium bg-[#16161b] hover:bg-[#202026] border border-[#2a2a33] text-zinc-300 hover:text-white transition-colors cursor-pointer">
                  Deploy node
                </button>
              </Link>
            </div>
          </div>

          {/* Column 3: Continuous SHM */}
          <div className="p-8 flex flex-col justify-between min-h-[370px] bg-gradient-to-b from-[#2e1c27] via-[#241a22] to-[#1a1a1f] relative">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-white">Continuous SHM</span>
                <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-[#3D1405] text-[#FF5500] border border-[#662208]">
                  Recommended
                </span>
              </div>
              
              <div className="mt-4 flex items-baseline">
                <span className="text-4xl sm:text-5xl font-[550] text-white tracking-tight">
                  $99
                </span>
                <span className="text-xs text-[#71717a] font-normal ml-1">/month</span>
              </div>

              <p className="mt-5 text-xs text-[#a1a1aa] leading-relaxed">
                For full bridge girder monitoring with real-time BOCD changepoint alerts and TDA feature logging.
              </p>
            </div>

            <div className="pt-8">
              <Link href="/dashboard" className="w-full block">
                <button className="w-full py-2.5 rounded-lg text-xs font-semibold bg-[#FF5500] hover:bg-[#E54B00] text-white shadow-[0_0_20px_rgba(255,85,0,0.35)] hover:shadow-[0_0_25px_rgba(255,85,0,0.55)] transition-all cursor-pointer">
                  Start monitoring
                </button>
              </Link>
            </div>
          </div>

          {/* Column 4: Infrastructure */}
          <div className="p-8 flex flex-col justify-between min-h-[370px] bg-[#1a1a1f]">
            <div>
              <span className="text-sm font-semibold text-zinc-200 block">Infrastructure</span>
              
              <div className="mt-4 flex items-baseline">
                <span className="text-4xl sm:text-5xl font-[550] text-white tracking-tight">
                  Custom
                </span>
              </div>

              <p className="mt-5 text-xs text-[#a1a1aa] leading-relaxed">
                For state departments of transportation, railway networks, and critical civil infrastructure.
              </p>
            </div>

            <div className="pt-8">
              <Link href="/dashboard" className="w-full block">
                <button className="w-full py-2.5 rounded-lg text-xs font-medium bg-[#16161b] hover:bg-[#202026] border border-[#2a2a33] text-zinc-300 hover:text-white transition-colors cursor-pointer">
                  Contact engineers
                </button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* ECHOSENSE FOOTER                                          */}
      {/* ========================================================= */}
      <footer className="border-t border-[#23232c] bg-[#101014] py-16 px-4 sm:px-6 text-xs text-zinc-400">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-5 gap-8">
          
          <div className="col-span-2 space-y-4">
            <Link
              href="/"
              className="inline-flex items-center gap-2 group select-none"
            >
              <div className="relative flex items-center justify-center shrink-0 w-[24px] h-[24px]">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  className="w-full h-full"
                >
                  <path
                    d="M12 2C6.477 2 2 6.477 2 12c0 5.523 4.477 10 10 10 2.215 0 4.266-.72 5.928-1.936l-3.32-3.32A5.328 5.328 0 0112 17.333c-2.946 0-5.333-2.388-5.333-5.333 0-2.946 2.387-5.333 5.333-5.333 1.942 0 3.642 1.042 4.566 2.597l4.02-2.01C18.825 4.095 15.65 2 12 2z"
                    fill="url(#footLogoGrad)"
                  />
                  <path
                    d="M21.99 12c0 1.764-.46 3.42-1.267 4.858l-3.95-1.975A5.27 5.27 0 0017.333 12c0-.987-.27-1.912-.74-2.705l3.95-1.975c.954 1.458 1.447 3.037 1.447 4.68z"
                    fill="#FF5500"
                  />
                  <defs>
                    <linearGradient id="footLogoGrad" x1="2" y1="2" x2="22" y2="22" gradientUnits="userSpaceOnUse">
                      <stop stopColor="#FF5500" />
                      <stop offset="0.6" stopColor="#ea3467" />
                      <stop offset="1" stopColor="#cc305c" />
                    </linearGradient>
                  </defs>
                </svg>
              </div>

              <span className="font-[600] text-white tracking-[-0.04em] font-sans text-[19px] leading-none">
                EchoSense
              </span>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#FF5500]/15 text-[#FF5500] border border-[#FF5500]/30 font-semibold uppercase tracking-wider ml-0.5">
                TopoAE
              </span>
            </Link>

            <p className="text-zinc-500 max-w-sm text-xs leading-relaxed">
              Autonomous topological machine learning and acoustic emission intelligence platform for early damage precursor detection across critical civil infrastructure.
            </p>
            <div className="flex items-center gap-2.5 text-zinc-400 pt-1 font-mono text-[11px]">
              <span className="text-zinc-300 font-medium">Enterprise Platform</span>
              <span className="text-zinc-600">•</span>
              <span className="text-zinc-400">Release v2.4.0</span>
            </div>
          </div>

          <div className="space-y-2.5">
            <span className="text-white font-semibold text-xs uppercase tracking-wider block mb-3">
              Framework
            </span>
            <div className="space-y-2 text-zinc-400">
              <div><Link href="/dashboard" className="hover:text-white transition-colors">Overview</Link></div>
              <div><Link href="/upload" className="hover:text-white transition-colors">Signal Ingestion</Link></div>
              <div><Link href="/analysis" className="hover:text-white transition-colors">TDA Pipeline</Link></div>
              <div><Link href="/compare" className="hover:text-white transition-colors">Model Benchmarks</Link></div>
              <div><Link href="/monitor" className="hover:text-white transition-colors">Live Monitor</Link></div>
              <div><Link href="/datasets" className="hover:text-white transition-colors">Datasets Library</Link></div>
              <div><Link href="/reports" className="hover:text-white transition-colors">Assessment Reports</Link></div>
              <div><Link href="/settings" className="hover:text-white transition-colors">Sensor Calibration</Link></div>
            </div>
          </div>

          <div className="space-y-2.5">
            <span className="text-white font-semibold text-xs uppercase tracking-wider block mb-3">
              Methodology
            </span>
            <div className="space-y-2 text-zinc-400">
              <div><Link href="/docs" className="hover:text-white transition-colors">Abstract &amp; Synopsis</Link></div>
              <div><Link href="/docs" className="hover:text-white transition-colors">Takens Delay Embedding</Link></div>
              <div><Link href="/docs" className="hover:text-white transition-colors">Vietoris-Rips Homology</Link></div>
              <div><Link href="/docs" className="hover:text-white transition-colors">Betti Curves &amp; Barcodes</Link></div>
              <div><Link href="/docs" className="hover:text-white transition-colors">Random Forest Classifier</Link></div>
              <div><Link href="/docs" className="hover:text-white transition-colors">BOCD Changepoint</Link></div>
              <div><Link href="/docs" className="hover:text-white transition-colors">Conv1D Autoencoder</Link></div>
            </div>
          </div>

          <div className="space-y-2.5">
            <span className="text-white font-semibold text-xs uppercase tracking-wider block mb-3">
              Platform
            </span>
            <div className="space-y-2 text-zinc-400">
              <div><Link href="/localization" className="hover:text-white transition-colors">Acoustic Localization</Link></div>
              <div><Link href="/topology-engine" className="hover:text-white transition-colors">Topology Engine</Link></div>
              <div><Link href="/architecture" className="hover:text-white transition-colors">System Architecture</Link></div>
              <div><Link href="/docs" className="hover:text-white transition-colors">API Documentation</Link></div>
              <div><Link href="/reports" className="hover:text-white transition-colors">Compliance Verification</Link></div>
              <div><Link href="/settings" className="hover:text-white transition-colors">Hardware Calibration</Link></div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto pt-10 mt-10 border-t border-zinc-800/60 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-zinc-500">
          <span>&copy; 2026 EchoSense Technologies Inc. All rights reserved.</span>
          <div className="flex items-center gap-6">
            <span className="text-zinc-400">EN 1330-9 Compliant</span>
            <span className="text-zinc-400">ASTM E1316 Standard</span>
            <span className="text-zinc-400">ISO 9712 NDT Certified</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
