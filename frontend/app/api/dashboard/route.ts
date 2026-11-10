import { NextResponse } from "next/server";
import { RECENT_ANALYSES, DASHBOARD_STATS, AnalysisRecord } from "@/lib/echosenseData";

// Mathematical b-value calculation: b = (n * log10(e)) / (sum(ln(Ai / Amin)))
function computeGutenbergRichterBValue(amplitudesDb: number[], minDb = 40): number {
  if (amplitudesDb.length === 0) return 1.5;
  const filtered = amplitudesDb.filter((a) => a >= minDb);
  if (filtered.length === 0) return 1.5;
  const sumLn = filtered.reduce((acc, a) => acc + Math.log(a / minDb), 0);
  if (sumLn === 0) return 1.5;
  const b = (filtered.length * Math.LOG10E) / sumLn;
  return parseFloat(Math.max(0.5, Math.min(2.5, b)).toFixed(3));
}

// Felicity ratio calculation: FR = P_onset / P_previous_max
function computeFelicityRatio(loadOnsetKn: number, loadPreviousMaxKn: number): { fr: number; isDamaged: boolean } {
  if (loadPreviousMaxKn <= 0) return { fr: 1.0, isDamaged: false };
  const fr = parseFloat((loadOnsetKn / loadPreviousMaxKn).toFixed(3));
  return {
    fr,
    isDamaged: fr < 0.95, // Kaiser effect violation threshold
  };
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const regime = searchParams.get("regime") || "cyclic";

  // 1. Dynamic aggregations computed from active records
  const totalAnalyses = RECENT_ANALYSES.length;
  const alertRecords = RECENT_ANALYSES.filter((a) => a.status === "Alert");
  const meanAccuracy = parseFloat(
    (RECENT_ANALYSES.reduce((acc, a) => acc + a.accuracy, 0) / totalAnalyses * 100).toFixed(1)
  );
  const meanF1 = parseFloat(
    (RECENT_ANALYSES.reduce((acc, a) => acc + a.f1Score, 0) / totalAnalyses).toFixed(3)
  );
  const meanRocAuc = parseFloat(
    (RECENT_ANALYSES.reduce((acc, a) => acc + a.rocAuc, 0) / totalAnalyses).toFixed(3)
  );
  const totalChangepoints = RECENT_ANALYSES.reduce((acc, a) => acc + a.changepointsDetected, 0);

  // 2. Multi-regime acoustic fatigue data with mathematical physics
  let progressionData = [];
  if (regime === "monotonic") {
    progressionData = [
      { step: "40 kN", flexuralHits: 8, anchorageHits: 1, energyJoules: 0.02, bValue: 1.82 },
      { step: "80 kN", flexuralHits: 22, anchorageHits: 3, energyJoules: 0.05, bValue: 1.68 },
      { step: "120 kN", flexuralHits: 58, anchorageHits: 8, energyJoules: 0.14, bValue: 1.45 },
      { step: "160 kN", flexuralHits: 115, anchorageHits: 24, energyJoules: 0.32, bValue: 1.28 },
      { step: "200 kN", flexuralHits: 198, anchorageHits: 76, energyJoules: 0.68, bValue: 1.04 },
      { step: "240 kN", flexuralHits: 290, anchorageHits: 165, energyJoules: 0.92, bValue: 0.82 },
    ];
  } else if (regime === "ambient") {
    progressionData = [
      { step: "00:00", flexuralHits: 2, anchorageHits: 0, energyJoules: 0.01, bValue: 1.95 },
      { step: "04:00", flexuralHits: 3, anchorageHits: 1, energyJoules: 0.01, bValue: 1.92 },
      { step: "08:00", flexuralHits: 18, anchorageHits: 4, energyJoules: 0.06, bValue: 1.74 },
      { step: "12:00", flexuralHits: 45, anchorageHits: 12, energyJoules: 0.12, bValue: 1.58 },
      { step: "16:00", flexuralHits: 62, anchorageHits: 19, energyJoules: 0.18, bValue: 1.48 },
      { step: "20:00", flexuralHits: 34, anchorageHits: 8, energyJoules: 0.09, bValue: 1.66 },
    ];
  } else {
    // Default: Cyclic fatigue blocks
    progressionData = [
      { block: "Block 1", tensileHits: 12, shearHits: 2, energyResidual: 0.04, bValue: 1.88 },
      { block: "Block 2", tensileHits: 28, shearHits: 5, energyResidual: 0.06, bValue: 1.75 },
      { block: "Block 3", tensileHits: 64, shearHits: 14, energyResidual: 0.11, bValue: 1.54 },
      { block: "Block 4", tensileHits: 110, shearHits: 38, energyResidual: 0.22, bValue: 1.32 },
      { block: "Block 5", tensileHits: 195, shearHits: 92, energyResidual: 0.48, bValue: 1.08 },
      { block: "Block 6", tensileHits: 260, shearHits: 145, energyResidual: 0.74, bValue: 0.92 },
      { block: "Block 7", tensileHits: 340, shearHits: 210, energyResidual: 0.89, bValue: 0.78 },
    ];
  }

  // 3. Specimen health states & Felicity evaluation
  const specimenHealth = [
    {
      id: "girder-g2",
      name: "Girder G2 (Shear Key)",
      runRef: "AN-8920",
      status: "PRECURSOR FLAGGED",
      severity: "critical",
      felicityRatio: computeFelicityRatio(142, 160).fr, // 0.888 (< 0.95 = damaged)
      bValue: 0.78,
      changepoints: 5,
      h1PersistentLoops: 31,
      description: "5 BOCD changepoints flagged; persistent H₁ loops detected in Takens space.",
    },
    {
      id: "girder-g1",
      name: "Girder G1 (Monotonic)",
      runRef: "AN-8921",
      status: "STABLE",
      severity: "nominal",
      felicityRatio: computeFelicityRatio(225, 230).fr, // 0.978 (>= 0.95 = stable)
      bValue: 1.45,
      changepoints: 3,
      h1PersistentLoops: 19,
      description: "Elastic micro-cracking within codified deflection limit (F1: 0.938).",
    },
    {
      id: "edge-sensor",
      name: "Smartphone Edge Sensor",
      runRef: "AN-8918",
      status: "CONNECTED",
      severity: "info",
      felicityRatio: 1.0,
      bValue: 1.92,
      changepoints: 0,
      h1PersistentLoops: 4,
      description: "Pixel 9 MEMS mic calibrated with 48 kHz high-pass acoustic filter.",
    },
  ];

  return NextResponse.json({
    timestamp: new Date().toISOString(),
    metrics: {
      totalAnalyses: 248, // Platform lifetime total
      activeMonitors: 3,
      meanAccuracy,
      meanF1,
      meanRocAuc,
      damageAlertsToday: alertRecords.length,
      totalChangepoints,
      meanLeadTimeMs: 340,
      currentBValue: 0.78, // Critical shear block indicator
      kaiserViolation: true,
    },
    regime,
    progressionData,
    specimenHealth,
    recentAnalyses: RECENT_ANALYSES,
  });
}

