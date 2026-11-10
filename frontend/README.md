# EchoSense Console & Dashboard UI

A production-grade, enterprise **Next.js 15 + Tailwind CSS** application for continuous topological acoustic emission structural health monitoring (SHM).

---

## 🚀 Quick Start

From within this `template-bundle` directory:

```bash
# 1. Install dependencies
npm install

# 2. Run the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🗺️ Application Routes & Core Diagnostic Modules

| Route Path | Module Name | Diagnostic Purpose & UI Components |
|---|---|---|
| `/` | **Landing Page** | High-conversion overview, live telemetry card, deployment tiers, feature grid, and NDT compliance footer. |
| `/dashboard` | **Overview** | Executive KPI cards, multi-series fatigue block area chart, live precursor alerts, and recent TDA runs table. |
| `/upload` | **Signal Ingestion** | Drag-and-drop batch upload supporting WAV, CSV, HDF5, and NPY files with automated sampling frequency validation. |
| `/analysis` | **TDA Pipeline** | Interactive Takens delay embedding parameter tuning ($\tau$, $d$), GUDHI filtration benchmarks, and confusion matrices. |
| `/localization` | **Wave Localization** | Interactive 2D prestressed girder elevation, hyperbolic TDoA multilateration arcs, and Gauss-Newton spatial solver ($\pm 30\text{ mm}$). |
| `/topology-engine`| **Topology Engine** | 3D phase space attractor canvas, persistence diagrams ($H_0$, $H_1$), persistence barcodes, and Betti curves. |
| `/compare` | **Model Comparison** | Side-by-side benchmark matrix comparing TopoAE, Conv1D Autoencoder, Spectral SVM, and traditional RMS gating. |
| `/monitor` | **Real-Time Monitor** | High-throughput streaming acoustic oscilloscope with real-time precursor classification overlay and hit counters. |
| `/datasets` | **AE Datasets** | Curated catalog of benchmark acoustic emission datasets (D'Angela & Magliulo bridge girders, Siracusano concrete specimens). |
| `/reports` | **Assessment Reports** | Formal engineering assessment archive with executive risk determinations, quantitative verification tables, and export options. |
| `/settings` | **Sensor Calibration** | Hardware calibration parameters (Vp compressional speed, bandpass filters, transducer coupling, and PTP clock settings). |
| `/docs` | **Documentation Portal** | Dual-sidebar documentation system with mathematical formulations, tabbed code snippets, and `Ctrl+K` search. |
| `/architecture` | **System Architecture** | Multi-tier interactive layer diagram covering Edge Ingestion, Stream Compute, ML Inference, and Storage. |

---

## 🎨 Theme & Engineering Design Standards

- **Restrained Industrial Palette**: Formal dark theme (`#111115` base, `#18181f` cards, `#24242e` borders) with `#FD366E` reserved strictly as the primary alert accent.
- **Enterprise Navigation**: Dual-level contextual sidebars, unified header breadcrumbs, and command palette (`Ctrl + K`).
- **Real-Time Visualization**: High-performance SVG and canvas rendering for phase space trajectories, hyperbolic TDoA wavefronts, and acoustic oscilloscopes.
- **Standards Compliant**: Built to display metrics conforming to EN 1330-9, ASTM E1316, and ISO 9712 NDT requirements.

---

## 📄 License

Licensed under the Apache License, Version 2.0.
