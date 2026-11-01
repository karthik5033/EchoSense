# 🔬 EchoSense Dashboard UI

A high-performance, dark-mode **Next.js 15 + Tailwind CSS + shadcn/ui** frontend dashboard for **EchoSense**: A Topological Machine Learning Framework for Structural Damage Precursor Detection from Smartphone Acoustic Emission Signals.

---

## 🚀 Quick Start

From within this `template-bundle` folder:

```bash
# 1. Install dependencies
npm install --legacy-peer-deps

# 2. Run the development server
npm run dev

# 3. Create production build
npm run build
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🗺️ EchoSense Routes & Capabilities

| Route Path | Module | Capabilities & Scientific Features |
|---|---|---|
| `/` | **Landing Page** | High-conversion showcase with live topological metric strip, Takens attractor demo, benchmark tier comparisons, and scientific FAQ |
| `/dashboard` | **Structural Health Overview** | Real-time precursor risk index, live acoustic emission event feed, persistent entropy area chart, and crack burst simulation modal |
| `/data-ingestion` | **Signal Ingestion** | Drag-and-drop batch upload for audio (.wav, .mp3, .mat), STA/LTA acoustic burst slicer, and benchmark dataset loader (D'Angela & Siracusano) |
| `/chat` | **Acoustic AI Copilot** | TDA parameter advisory copilot (optimal delay τ via AMI, dimension d via FNN), ASTM standards guidance, and crack mechanism diagnostics |
| `/network` | **Attractor Topology** | Interactive Takens delay-coordinate state-space attractor and Vietoris-Rips simplicial complex with dynamic filtration scale slider (ε) |
| `/analytics` | **TDA & Benchmarks** | Multi-series comparative evaluation: EchoSense TDA (94.1%) vs 1D CNN (88.7%) vs Conventional AE (81.2%), noise resilience curves & ablation ranking |
| `/cases` | **Damage Incidents** | Structural fracture incident tracking table, Composite Damage Precursor Index (CDPI), specimen attribution, and new incident logger |
| `/cases/[id]` | **Incident Inspector** | Detailed event breakdown with acoustic burst chronology, H0/H1 persistence diagrams, inspector notes, and raw JSON feature vector |
| `/profiles` | **Sensor Stations** | Directory of smartphone MEMS microphones and piezoelectric reference transducers with gain calibration, sample rates, and battery telemetry |
| `/profiles/[id]` | **Sensor Detail** | Detailed sensor station inspector with live acoustic ping test, buffer latency gauges, and Butterworth filter settings |
| `/alerts` | **BOCD Alarms** | Real-time Bayesian Online Changepoint Detection (BOCD) alerts, Conv1D Autoencoder anomaly spikes, severity badges, and CSV export |
| `/financial` | **Telemetry Ledger** | Edge hardware compute consumption (DCUs/CPU), sensor bandwidth stream (MB/s), and equipment cost avoidance vs $10K ultrasonic rigs |
| `/audit` | **Compliance Audit** | Immutable log of bandpass filter adjustments, STA/LTA threshold overrides, model retraining records, and ASTM E1316 compliance audits |
| `/settings` | **Sensor Calibration** | Filter cutoff adjustments (500 Hz - 20 kHz), STA/LTA window lengths, trigger ratios, researcher profile, and API key management |
| `/settings/permissions` | **RBAC Matrix** | Role-Based Access Control matrix for Lead Researcher, Structural Engineer, Data Analyst, and Site Inspector personas |
| `/architecture` | **Architecture Spec** | Interactive 4-layer subsystem architecture diagram (L1 Ingestion → L2 Takens → L3 GUDHI TDA → L4 Inference/BOCD) + Python pipeline code contract |
| `/docs` | **API Reference** | OpenAPI endpoint reference for REST audio upload, TDA pipeline execution, and WebSocket monitoring feeds |
| `/docs/data-contracts` | **Data Contracts** | Strict schemas for AcousticBurstEvent, TopologicalVector, and BOCDTelemetryFrame |
| `/docs/system-design` | **System RFC** | Mathematical foundations: Takens embedding theorem, Vietoris-Rips simplicial filtration, and BOCD recursive run-length equations |

---

## 🎨 Theme & Layout Features

- **Obsidian Dark Mode**: High-contrast, dark-mode-first aesthetic with emerald/teal and indigo neon accents optimized for topological diagrams.
- **Collapsible Sidebar**: Smooth transition between expanded (w-64) and icon-only collapsed (w-20) states.
- **Top Header**: Real-time acoustic streaming indicator, live UTC clock, breadcrumbs, theme switcher, and notification center flyout.
- **Command Palette**: Press `⌘ + K` or `Ctrl + K` anywhere to instantly search and navigate across all EchoSense modules.
- **Zero Broken Links**: All 20 routes pre-rendered statically or dynamically with Next.js App Router.
