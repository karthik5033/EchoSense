// EchoSense / TopoAE - Authentic Structural Health Monitoring & Topological ML Mock Data
// Based on PRD & Research Paper (D'Angela & Magliulo 2026, Siracusano et al. 2021, Sayyad & Bazzi 2026)

export interface AnalysisRecord {
  id: string;
  name: string;
  datasetName: string;
  specimen: string;
  timestamp: string;
  samplingRate: string;
  predictedClass: "Tensile" | "Shear" | "Mixed-Mode" | "Undamaged";
  confidence: number;
  f1Score: number;
  accuracy: number;
  rocAuc: number;
  status: "Completed" | "Processing" | "Alert" | "Queued";
  changepointsDetected: number;
  anomalyScore: number;
  embeddingDim: number;
  timeDelay: number;
  h0Features: number;
  h1Features: number;
  persistenceEntropy: number;
  notes: string;
}

export const RECENT_ANALYSES: AnalysisRecord[] = [
  {
    id: "AN-8921",
    name: "Girder-G1 Monotonic Bend Stage-3",
    datasetName: "Prestressed RC Bridge-Girder AE Dataset",
    specimen: "Girder G1 (Midspan Sensor 2)",
    timestamp: "2026-11-09 23:42:10 UTC",
    samplingRate: "10.0 MHz (downsampled 500 kHz)",
    predictedClass: "Tensile",
    confidence: 0.942,
    f1Score: 0.938,
    accuracy: 0.945,
    rocAuc: 0.982,
    status: "Completed",
    changepointsDetected: 3,
    anomalyScore: 0.18,
    embeddingDim: 3,
    timeDelay: 4,
    h0Features: 42,
    h1Features: 19,
    persistenceEntropy: 2.84,
    notes: "High-frequency burst AE preceding visible tensile micro-crack opening.",
  },
  {
    id: "AN-8920",
    name: "Girder-G2 Cyclic Fatigue Block-5",
    datasetName: "Prestressed RC Bridge-Girder AE Dataset",
    specimen: "Girder G2 (Shear Key Zone)",
    timestamp: "2026-11-09 22:15:33 UTC",
    samplingRate: "10.0 MHz",
    predictedClass: "Shear",
    confidence: 0.916,
    f1Score: 0.908,
    accuracy: 0.912,
    rocAuc: 0.965,
    status: "Alert",
    changepointsDetected: 5,
    anomalyScore: 0.74,
    embeddingDim: 3,
    timeDelay: 6,
    h0Features: 58,
    h1Features: 31,
    persistenceEntropy: 3.42,
    notes: "High-energy long-duration friction signatures detected across shear interface.",
  },
  {
    id: "AN-8919",
    name: "Concrete AE Benchmark Sample #1042",
    datasetName: "Concrete AE Event Dataset (Siracusano)",
    specimen: "Cylinder C-14",
    timestamp: "2026-11-09 20:08:14 UTC",
    samplingRate: "500 kHz",
    predictedClass: "Mixed-Mode",
    confidence: 0.887,
    f1Score: 0.892,
    accuracy: 0.895,
    rocAuc: 0.954,
    status: "Completed",
    changepointsDetected: 2,
    anomalyScore: 0.35,
    embeddingDim: 4,
    timeDelay: 5,
    h0Features: 36,
    h1Features: 24,
    persistenceEntropy: 3.11,
    notes: "Matrix debonding transition to aggregate shear interlock.",
  },
  {
    id: "AN-8918",
    name: "Smartphone In-Situ Ambient Calibration",
    datasetName: "Edge Smartphone Acoustic Stream",
    specimen: "Pixel 9 Pro Internal MEMS Mic",
    timestamp: "2026-11-09 18:30:00 UTC",
    samplingRate: "48.0 kHz",
    predictedClass: "Undamaged",
    confidence: 0.985,
    f1Score: 0.979,
    accuracy: 0.982,
    rocAuc: 0.994,
    status: "Completed",
    changepointsDetected: 0,
    anomalyScore: 0.04,
    embeddingDim: 3,
    timeDelay: 3,
    h0Features: 14,
    h1Features: 4,
    persistenceEntropy: 1.25,
    notes: "Baseline undamaged environmental acoustic envelope validated.",
  },
  {
    id: "AN-8917",
    name: "Girder-G4 Ultimate Limit State Run",
    datasetName: "Prestressed RC Bridge-Girder AE Dataset",
    specimen: "Girder G4 (Tendon Anchorage)",
    timestamp: "2026-11-09 15:10:45 UTC",
    samplingRate: "10.0 MHz",
    predictedClass: "Shear",
    confidence: 0.963,
    f1Score: 0.958,
    accuracy: 0.961,
    rocAuc: 0.991,
    status: "Alert",
    changepointsDetected: 7,
    anomalyScore: 0.89,
    embeddingDim: 3,
    timeDelay: 5,
    h0Features: 72,
    h1Features: 48,
    persistenceEntropy: 3.89,
    notes: "Imminent shear slip precursor identified 18 seconds before macro-crack propagation.",
  },
];

// Summary Statistics for Overview Dashboard
export const DASHBOARD_STATS = {
  totalAnalyses: 248,
  activeMonitors: 3,
  datasetsLoaded: 8,
  damageAlertsToday: 4,
  meanAccuracy: 94.6,
  meanRocAuc: 0.978,
  meanDetectionDelayMs: 340,
  precursorsDetectedCount: 37,
};

// Simulated AE Waveform for Preview & Analysis
export function generateAeWaveform(length = 200, isAnomalous = false) {
  const points = [];
  const freq1 = isAnomalous ? 12 : 8;
  const freq2 = isAnomalous ? 24 : 16;
  const decay = isAnomalous ? 0.025 : 0.04;
  const noiseScale = isAnomalous ? 0.08 : 0.04;

  for (let i = 0; i < length; i++) {
    const t = i / (length - 1);
    // AE transient pulse: burst at t=0.2 with exponential decay
    let amp = 0;
    if (i >= 20) {
      const tau = (i - 20) * decay;
      amp =
        Math.exp(-tau) *
        (Math.sin(2 * Math.PI * freq1 * (t - 0.1)) +
          0.4 * Math.sin(2 * Math.PI * freq2 * (t - 0.1)));
    }
    // Deterministic pseudo-random perturbation based on sample index to guarantee SSR/client hydration equality
    const noise = Math.sin(i * 12.9898 + 78.233) * 0.5 * noiseScale;
    points.push({
      time: (i * 0.05).toFixed(2),
      amplitude: parseFloat((amp + noise).toFixed(4)),
      filtered: parseFloat((amp * 0.92).toFixed(4)),
      envelope: parseFloat(Math.max(0, Math.abs(amp) * 1.05).toFixed(4)),
      residual: parseFloat((noise * 1.5).toFixed(4)),
    });
  }
  return points;
}

// 2D/3D Takens Delay Embedding Attractor Coordinates
export function generateTakensAttractor(pointsCount = 180) {
  const points = [];
  for (let i = 0; i < pointsCount; i++) {
    const angle = (i / pointsCount) * 4 * Math.PI;
    const r = 1 + 0.35 * Math.sin(5 * angle);
    // Deterministic chaotic perturbations to guarantee 100% identical SSR & client hydration
    const noiseX = Math.sin(i * 73.1 + 19.7) * 0.04;
    const noiseY = Math.cos(i * 91.3 + 37.2) * 0.04;
    const noiseZ = Math.sin(i * 113.7 + 53.1) * 0.025;
    const x = r * Math.cos(angle) + noiseX;
    const y = r * Math.sin(angle) + noiseY;
    const z = 0.5 * Math.sin(3 * angle) + noiseZ;
    points.push({
      x: parseFloat(x.toFixed(3)),
      y: parseFloat(y.toFixed(3)),
      z: parseFloat(z.toFixed(3)),
      index: i,
    });
  }
  return points;
}

// Persistent Homology Persistence Diagram (Birth vs Death)
export interface PersistencePoint {
  id: string;
  dimension: 0 | 1;
  birth: number;
  death: number;
  persistence: number;
}

export const MOCK_PERSISTENCE_DIAGRAM: PersistencePoint[] = [
  // H0 features (connected components: born at 0, die as complexes merge)
  { id: "h0-1", dimension: 0, birth: 0.0, death: 0.88, persistence: 0.88 },
  { id: "h0-2", dimension: 0, birth: 0.0, death: 0.72, persistence: 0.72 },
  { id: "h0-3", dimension: 0, birth: 0.0, death: 0.54, persistence: 0.54 },
  { id: "h0-4", dimension: 0, birth: 0.0, death: 0.41, persistence: 0.41 },
  { id: "h0-5", dimension: 0, birth: 0.0, death: 0.32, persistence: 0.32 },
  { id: "h0-6", dimension: 0, birth: 0.0, death: 0.28, persistence: 0.28 },
  { id: "h0-7", dimension: 0, birth: 0.0, death: 0.19, persistence: 0.19 },
  { id: "h0-8", dimension: 0, birth: 0.0, death: 0.14, persistence: 0.14 },

  // H1 features (1D topological loops: key damage precursor indicators!)
  { id: "h1-1", dimension: 1, birth: 0.12, death: 0.82, persistence: 0.70 },
  { id: "h1-2", dimension: 1, birth: 0.18, death: 0.75, persistence: 0.57 },
  { id: "h1-3", dimension: 1, birth: 0.25, death: 0.68, persistence: 0.43 },
  { id: "h1-4", dimension: 1, birth: 0.31, death: 0.61, persistence: 0.30 },
  { id: "h1-5", dimension: 1, birth: 0.42, death: 0.59, persistence: 0.17 },
  { id: "h1-6", dimension: 1, birth: 0.51, death: 0.63, persistence: 0.12 },
  { id: "h1-7", dimension: 1, birth: 0.38, death: 0.46, persistence: 0.08 },
  { id: "h1-8", dimension: 1, birth: 0.22, death: 0.29, persistence: 0.07 },
];

// Betti Curves (beta_0, beta_1 over filtration epsilon)
export const MOCK_BETTI_CURVES = [
  { epsilon: 0.0, beta0: 42, beta1: 0 },
  { epsilon: 0.1, beta0: 31, beta1: 2 },
  { epsilon: 0.2, beta0: 18, beta1: 7 },
  { epsilon: 0.3, beta0: 11, beta1: 14 },
  { epsilon: 0.4, beta0: 6, beta1: 19 },
  { epsilon: 0.5, beta0: 3, beta1: 15 },
  { epsilon: 0.6, beta0: 2, beta1: 8 },
  { epsilon: 0.7, beta0: 1, beta1: 3 },
  { epsilon: 0.8, beta0: 1, beta1: 1 },
  { epsilon: 0.9, beta0: 1, beta1: 0 },
];

// BOCD Run-Length & Changepoint Timeline
export const MOCK_BOCD_TIMELINE = [
  { time: "0.0s", probability: 0.02, hazard: 0.004, isChangepoint: false },
  { time: "0.5s", probability: 0.03, hazard: 0.005, isChangepoint: false },
  { time: "1.0s", probability: 0.08, hazard: 0.008, isChangepoint: false },
  { time: "1.4s", probability: 0.92, hazard: 0.412, isChangepoint: true, label: "CP-1 (Micro-crack Onset)" },
  { time: "2.0s", probability: 0.05, hazard: 0.006, isChangepoint: false },
  { time: "2.5s", probability: 0.06, hazard: 0.007, isChangepoint: false },
  { time: "3.0s", probability: 0.11, hazard: 0.012, isChangepoint: false },
  { time: "3.8s", probability: 0.89, hazard: 0.388, isChangepoint: true, label: "CP-2 (Shear Debonding)" },
  { time: "4.5s", probability: 0.04, hazard: 0.005, isChangepoint: false },
  { time: "5.0s", probability: 0.07, hazard: 0.009, isChangepoint: false },
  { time: "5.5s", probability: 0.14, hazard: 0.018, isChangepoint: false },
  { time: "6.2s", probability: 0.96, hazard: 0.490, isChangepoint: true, label: "CP-3 (Critical Coalescence)" },
  { time: "7.0s", probability: 0.12, hazard: 0.015, isChangepoint: false },
];

// Conv1D Autoencoder Reconstruction Error vs Threshold
export const MOCK_AUTOENCODER_RESIDUALS = [
  { step: 1, error: 0.042, threshold: 0.18, isAnomaly: false },
  { step: 2, error: 0.038, threshold: 0.18, isAnomaly: false },
  { step: 3, error: 0.045, threshold: 0.18, isAnomaly: false },
  { step: 4, error: 0.051, threshold: 0.18, isAnomaly: false },
  { step: 5, error: 0.089, threshold: 0.18, isAnomaly: false },
  { step: 6, error: 0.245, threshold: 0.18, isAnomaly: true }, // Anomaly hit
  { step: 7, error: 0.288, threshold: 0.18, isAnomaly: true },
  { step: 8, error: 0.092, threshold: 0.18, isAnomaly: false },
  { step: 9, error: 0.047, threshold: 0.18, isAnomaly: false },
  { step: 10, error: 0.041, threshold: 0.18, isAnomaly: false },
  { step: 11, error: 0.312, threshold: 0.18, isAnomaly: true }, // Anomaly hit
  { step: 12, error: 0.198, threshold: 0.18, isAnomaly: true },
  { step: 13, error: 0.054, threshold: 0.18, isAnomaly: false },
];

// Model Comparison Matrix: TopoAE vs Conventional AE vs CNN Baseline
export interface ModelBenchmark {
  metric: string;
  topoAE: string | number;
  conventionalAE: string | number;
  cnnBaseline: string | number;
  unit?: string;
  bestModel: "topoAE" | "conventionalAE" | "cnnBaseline";
}

export const MODEL_COMPARISON_TABLE: ModelBenchmark[] = [
  { metric: "Classification Accuracy", topoAE: "94.6%", conventionalAE: "86.2%", cnnBaseline: "91.8%", bestModel: "topoAE" },
  { metric: "Macro F1-Score", topoAE: "0.938", conventionalAE: "0.849", cnnBaseline: "0.906", bestModel: "topoAE" },
  { metric: "ROC-AUC (Macro)", topoAE: "0.978", conventionalAE: "0.912", cnnBaseline: "0.958", bestModel: "topoAE" },
  { metric: "Precision (Tensile)", topoAE: "95.2%", conventionalAE: "87.4%", cnnBaseline: "92.1%", bestModel: "topoAE" },
  { metric: "Recall (Shear Precursors)", topoAE: "93.9%", conventionalAE: "84.1%", cnnBaseline: "89.4%", bestModel: "topoAE" },
  { metric: "Noise Resilience (-10 dB SNR)", topoAE: "90.4%", conventionalAE: "68.7%", cnnBaseline: "79.3%", bestModel: "topoAE" },
  { metric: "Inference Latency per Event", topoAE: "8.4 ms", conventionalAE: "3.2 ms", cnnBaseline: "24.6 ms", bestModel: "conventionalAE" },
  { metric: "Model Parameter Count", topoAE: "280 KB", conventionalAE: "140 KB", cnnBaseline: "18.4 MB", bestModel: "conventionalAE" },
  { metric: "Interpretability Score", topoAE: "High (TDA invariants)", conventionalAE: "Moderate (heuristics)", cnnBaseline: "Low (black-box)", bestModel: "topoAE" },
];

// Gini Feature Importance Ranking (Topological Features)
export const TOPOLOGICAL_FEATURE_IMPORTANCE = [
  { name: "Max H1 Loop Persistence", importance: 0.284, category: "H1 Homology" },
  { name: "Persistence Entropy E(D)", importance: 0.216, category: "Entropy" },
  { name: "Total H1 Lifetime Sum", importance: 0.168, category: "H1 Homology" },
  { name: "Betti-1 Area Under Curve", importance: 0.125, category: "Betti Function" },
  { name: "H0 Death Variance", importance: 0.089, category: "H0 Homology" },
  { name: "Takens Attractor Radius", importance: 0.064, category: "State Space" },
  { name: "Betti-0 Peak Dimension", importance: 0.054, category: "Betti Function" },
];

// Confusion Matrix for TopoAE
export const CONFUSION_MATRIX = [
  { actual: "Tensile", predictedTensile: 472, predictedShear: 14, predictedMixed: 14, total: 500, accuracy: "94.4%" },
  { actual: "Shear", predictedTensile: 11, predictedShear: 476, predictedMixed: 13, total: 500, accuracy: "95.2%" },
  { actual: "Mixed-Mode", predictedTensile: 18, predictedShear: 11, predictedMixed: 471, total: 500, accuracy: "94.2%" },
];

// Built-in Datasets Library
export interface AeDatasetItem {
  id: string;
  name: string;
  source: string;
  citation: string;
  format: string;
  size: string;
  eventsCount: number;
  classes: string[];
  samplingFrequency: string;
  description: string;
  preloaded: boolean;
  status: "Ready" | "Indexed";
}

export const DATASETS_LIBRARY: AeDatasetItem[] = [
  {
    id: "ds-bridge-girder",
    name: "Prestressed RC Bridge-Girder AE Dataset",
    source: "D'Angela & Magliulo (Materials and Structures, 2026)",
    citation: "doi: 10.1617/s11527-026-02973-1",
    format: "Raw AE Waveforms (HDF5 / CSV)",
    size: "4.2 GB",
    eventsCount: 42800,
    classes: ["Tensile Micro-cracks", "Shear Interface Slip", "Tendon Anchorage Debonding", "Undamaged Baseline"],
    samplingFrequency: "10.0 MHz",
    description: "Experimental four-point bending tests on four prestressed reinforced concrete girders under monotonic and cyclic fatigue regimes.",
    preloaded: true,
    status: "Ready",
  },
  {
    id: "ds-concrete-mendeley",
    name: "Concrete AE Event Dataset",
    source: "Siracusano et al. (Applied Sciences, Mendeley Data)",
    citation: "doi: 10.3390/app112412059 (Mendeley: 4ywc84t5gx/2)",
    format: "MATLAB .mat / NumPy .npy",
    size: "185 MB",
    eventsCount: 16650,
    classes: ["Tensile (Mode I)", "Shear (Mode II)", "Mixed-Mode (Mode I+II)"],
    samplingFrequency: "500 kHz",
    description: "15,000 training and 1,650 testing validated structural acoustic events with 1,000 time samples per event.",
    preloaded: true,
    status: "Ready",
  },
  {
    id: "ds-smartphone-field",
    name: "Smartphone In-Situ Acoustic Field Captures",
    source: "EchoSense Infrastructure Testbed / Mendeley Open Data",
    citation: "EchoSense Field Diagnostics Protocol 2026",
    format: "Uncompressed PCM WAV / 24-bit",
    size: "620 MB",
    eventsCount: 2450,
    classes: ["Surface Acoustic Pulse", "Acoustic Ringdown", "Ambient Background"],
    samplingFrequency: "48.0 kHz",
    description: "Smartphone-recorded structural acoustic emission signals from concrete test specimens under step load increments.",
    preloaded: true,
    status: "Ready",
  },
];

// Pre-generated Assessment Reports
export interface AssessmentReport {
  id: string;
  title: string;
  analysisRef: string;
  datasetRef: string;
  dateGenerated: string;
  author: string;
  precursorRisk: "Low" | "Moderate" | "Critical";
  primaryDamageMode: string;
  overallCondition: string;
  fileSize: string;
  f1Score?: number;
  accuracy?: number;
  changepoints?: number;
  h1Loops?: number;
  maxPersistence?: number;
  specimen?: string;
  leadTimeMs?: number;
  auditHash?: string;
}

export const ASSESSMENT_REPORTS: AssessmentReport[] = [
  {
    id: "REP-2026-001",
    title: "Structural Assessment: Prestressed Girder G1 Monotonic Test",
    analysisRef: "AN-8921",
    datasetRef: "Prestressed RC Bridge-Girder AE Dataset",
    dateGenerated: "2026-11-09 23:45 UTC",
    author: "Lead Acoustic Engineer, PE (EchoSense Lab)",
    precursorRisk: "Low",
    primaryDamageMode: "Tensile Micro-cracking (Mode I)",
    overallCondition: "Serviceable — Early elastic micro-cracking within allowable codified deflection limits.",
    fileSize: "2.4 MB (PDF)",
    f1Score: 0.942,
    accuracy: 0.951,
    changepoints: 1,
    h1Loops: 4,
    maxPersistence: 0.312,
    specimen: "Girder G1 (Span 10.0m)",
    leadTimeMs: 420,
    auditHash: "SHA-256: 4e91b0c9a41e",
  },
  {
    id: "REP-2026-002",
    title: "Precursor Alert Report: Girder G2 Cyclic Shear Interface",
    analysisRef: "AN-8920",
    datasetRef: "Prestressed RC Bridge-Girder AE Dataset",
    dateGenerated: "2026-11-09 22:20 UTC",
    author: "Senior Diagnostics Specialist (EchoSense Lab)",
    precursorRisk: "Critical",
    primaryDamageMode: "Shear Slip Delamination (Mode II)",
    overallCondition: "Warning — Persistent H1 topological loops confirm irreversible shear precursor initiation.",
    fileSize: "3.1 MB (PDF)",
    f1Score: 0.938,
    accuracy: 0.946,
    changepoints: 4,
    h1Loops: 19,
    maxPersistence: 0.880,
    specimen: "Girder G2 (Shear Key Section)",
    leadTimeMs: 340,
    auditHash: "SHA-256: 7f8a42c3e12d",
  },
  {
    id: "REP-2026-003",
    title: "Benchmark Validation: Concrete Specimen C-14 Tri-Mode Evaluation",
    analysisRef: "AN-8919",
    datasetRef: "Concrete AE Event Dataset",
    dateGenerated: "2026-11-09 20:15 UTC",
    author: "EchoSense Auto-Assessment Engine",
    precursorRisk: "Moderate",
    primaryDamageMode: "Mixed-Mode Interlock Transition",
    overallCondition: "Monitoring Advised — Secondary changepoints detected with 88.7% confidence.",
    fileSize: "1.8 MB (PDF)",
    f1Score: 0.912,
    accuracy: 0.924,
    changepoints: 2,
    h1Loops: 8,
    maxPersistence: 0.540,
    specimen: "Specimen C-14 (C40 Concrete)",
    leadTimeMs: 290,
    auditHash: "SHA-256: 9b20ce4567df",
  },
  {
    id: "REP-2026-004",
    title: "Tendon Anchorage Limit State: Girder G4 Rupture Precursor",
    analysisRef: "AN-8917",
    datasetRef: "Prestressed RC Bridge-Girder AE Dataset",
    dateGenerated: "2026-11-09 15:10 UTC",
    author: "Senior Diagnostics Specialist (EchoSense Lab)",
    precursorRisk: "Critical",
    primaryDamageMode: "Anchor Tendon Slippage (Mode II)",
    overallCondition: "Critical Alert — 7 irreversible changepoints detected 18 seconds before macroscopic opening.",
    fileSize: "4.2 MB (PDF)",
    f1Score: 0.958,
    accuracy: 0.961,
    changepoints: 7,
    h1Loops: 48,
    maxPersistence: 0.924,
    specimen: "Girder G4 (Anchorage Zone)",
    leadTimeMs: 380,
    auditHash: "SHA-256: 1a88ee744b20",
  },
  {
    id: "REP-2026-005",
    title: "In-Situ Ambient Field Baseline & Noise Gate Verification",
    analysisRef: "AN-8918",
    datasetRef: "Edge Smartphone Acoustic Stream",
    dateGenerated: "2026-11-09 18:30 UTC",
    author: "EchoSense Field Sensor Pod",
    precursorRisk: "Low",
    primaryDamageMode: "Undamaged Environmental Baseline",
    overallCondition: "Nominal Baseline — Zero anomalous changepoints detected; noise threshold validated.",
    fileSize: "1.2 MB (PDF)",
    f1Score: 0.979,
    accuracy: 0.982,
    changepoints: 0,
    h1Loops: 4,
    maxPersistence: 0.125,
    specimen: "MEMS Sensor Pod Array",
    leadTimeMs: 0,
    auditHash: "SHA-256: 3c55d0899e1a",
  },
  {
    id: "REP-2026-006",
    title: "Cyclic Flexural Hysteresis & Micro-Tensile Degradation",
    analysisRef: "AN-8915",
    datasetRef: "Prestressed RC Bridge-Girder AE Dataset",
    dateGenerated: "2026-11-09 11:45 UTC",
    author: "Lead Acoustic Engineer, PE (EchoSense Lab)",
    precursorRisk: "Moderate",
    primaryDamageMode: "Flexural Micro-cracking (Mode I)",
    overallCondition: "Inspection Recommended — Gradual entropy accumulation during reverse load cycles.",
    fileSize: "2.7 MB (PDF)",
    f1Score: 0.926,
    accuracy: 0.933,
    changepoints: 3,
    h1Loops: 12,
    maxPersistence: 0.615,
    specimen: "Girder G3 (Midspan Section)",
    leadTimeMs: 310,
    auditHash: "SHA-256: 8f44ae921c97",
  },
];

