"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Activity,
  Sliders,
  Play,
  Pause,
  ArrowRight,
  RefreshCw,
  Info,
  Layers,
  Database,
  Radio,
  Cpu,
  CheckCircle2,
  FileCode,
  Waves,
  Zap,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { SignalWaveformPlot } from "@/components/tda/SignalWaveformPlot";

interface IngestionSource {
  id: string;
  name: string;
  type: "live" | "benchmark" | "daq";
  specimen: string;
  samplingRate: string;
  channels: string;
  transducer: string;
  isAnomalous: boolean;
  snr: string;
}

const INGESTION_SOURCES: IngestionSource[] = [
  {
    id: "live-girder-g1",
    name: "Live Edge Stream: Girder G1 Array",
    type: "live",
    specimen: "Prestressed Bridge Girder G1 (Span: 10.0m)",
    samplingRate: "10.0 MS/s (PTP Synced)",
    channels: "4 Synchronized Nodes (CH-01 to CH-04)",
    transducer: "Resonant R15α (150 kHz) + MEMS",
    isAnomalous: true,
    snr: "+28.4 dB",
  },
  {
    id: "bench-fatigue-14",
    name: "Girder G1 Cyclic Fatigue Shear Burst #14",
    type: "benchmark",
    specimen: "Prestressed RC Bridge-Girder AE Dataset",
    samplingRate: "10.0 MHz (downsampled 500 kHz)",
    channels: "CH-01 Midspan (4.50m, 1.40m)",
    transducer: "Physical Acoustics R15α",
    isAnomalous: false,
    snr: "+32.1 dB",
  },
  {
    id: "bench-shear-08",
    name: "Concrete Shear Precursor Burst Event #08",
    type: "benchmark",
    specimen: "Concrete AE Event Dataset (Siracusano)",
    samplingRate: "500 kHz",
    channels: "Direct Piezo Matrix",
    transducer: "High-Bandwidth Piezoelectric",
    isAnomalous: true,
    snr: "+24.8 dB",
  },
  {
    id: "ambient-baseline",
    name: "In-Situ Ambient Baseline Calibration Run",
    type: "benchmark",
    specimen: "Ambient Traffic Vibration & Environmental Noise",
    samplingRate: "500 kHz",
    channels: "4 Channels Array",
    transducer: "R15α + MEMS Baseline",
    isAnomalous: false,
    snr: "+14.2 dB",
  },
];

export default function SignalIngestionPage() {
  const router = useRouter();
  const [selectedSource, setSelectedSource] = useState<IngestionSource>(INGESTION_SOURCES[0]);
  const [activeModeTab, setActiveModeTab] = useState<"live" | "benchmark" | "daq">("live");
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);

  // Scientific Preprocessing Parameters
  const [bandpassLow, setBandpassLow] = useState(20);
  const [bandpassHigh, setBandpassHigh] = useState(400);
  const [filterOrder, setFilterOrder] = useState("4");
  const [denoisingMethod, setDenoisingMethod] = useState("wavelet");
  const [segmentationWindow, setSegmentationWindow] = useState(50);

  const filteredSources = INGESTION_SOURCES.filter((s) => {
    if (activeModeTab === "live") return s.type === "live";
    if (activeModeTab === "benchmark") return s.type === "benchmark";
    return true;
  });

  const handleLaunchAnalysis = () => {
    setIsProcessing(true);
    setProgress(20);
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 90) {
          clearInterval(interval);
          setTimeout(() => {
            router.push("/analysis");
          }, 350);
          return 100;
        }
        return prev + 25;
      });
    }, 180);
  };

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-7xl mx-auto w-full font-sans select-none">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b border-border/60">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground flex items-center gap-2.5">
            <Radio className="h-5 w-5 text-primary" />
            Acoustic Signal Ingestion &amp; Conditioning
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Multi-channel edge PTP streams, calibrated benchmark datasets, and digital bandpass conditioning
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* ========================================================= */}
        {/* LEFT COLUMN (5 Cols): SOURCE SELECTION & CONDITIONING     */}
        {/* ========================================================= */}
        <div className="lg:col-span-5 space-y-5">
          {/* Source Mode Tabs */}
          <Card className="border border-border bg-card">
            <CardHeader className="pb-3 border-b border-border/50">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <Cpu className="h-4 w-4 text-primary" />
                  Acoustic Ingestion Source
                </CardTitle>
                <span className="text-[10px] font-mono text-muted-foreground">
                  IEEE 1588 PTP
                </span>
              </div>
            </CardHeader>

            <CardContent className="pt-4 space-y-3">
              {/* Mode Switcher */}
              <div className="flex items-center p-1 rounded-lg bg-secondary/50 border border-border text-xs">
                <button
                  onClick={() => {
                    setActiveModeTab("live");
                    setSelectedSource(INGESTION_SOURCES[0]);
                  }}
                  className={`flex-1 py-1.5 rounded-md font-medium text-xs transition-colors cursor-pointer text-center ${
                    activeModeTab === "live"
                      ? "bg-card text-foreground font-semibold shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Edge PTP Stream
                </button>
                <button
                  onClick={() => {
                    setActiveModeTab("benchmark");
                    setSelectedSource(INGESTION_SOURCES[1]);
                  }}
                  className={`flex-1 py-1.5 rounded-md font-medium text-xs transition-colors cursor-pointer text-center ${
                    activeModeTab === "benchmark"
                      ? "bg-card text-foreground font-semibold shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Benchmark Runs
                </button>
              </div>

              {/* Source List */}
              <div className="space-y-2 pt-1">
                {filteredSources.map((src) => {
                  const isSelected = selectedSource.id === src.id;
                  return (
                    <div
                      key={src.id}
                      onClick={() => setSelectedSource(src)}
                      className={`p-3 rounded-xl border text-left cursor-pointer transition-all ${
                        isSelected
                          ? "border-[#FF5500] bg-[#FF5500]/10 shadow-sm"
                          : "border-border hover:border-border/80 bg-card hover:bg-muted/30"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 min-w-0">
                          <Radio
                            className={`h-4 w-4 shrink-0 ${
                              isSelected ? "text-[#FF5500]" : "text-muted-foreground"
                            }`}
                          />
                          <span className="text-xs font-semibold text-foreground truncate font-mono">
                            {src.name}
                          </span>
                        </div>
                        <span className="text-[10px] font-mono text-muted-foreground bg-secondary px-2 py-0.5 rounded border border-border">
                          {src.snr}
                        </span>
                      </div>

                      <div className="mt-2 text-[11px] text-muted-foreground space-y-0.5">
                        <div className="truncate">{src.specimen}</div>
                        <div className="flex items-center justify-between font-mono text-[10px] text-muted-foreground pt-1">
                          <span>{src.channels}</span>
                          <span>{src.samplingRate}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Hardware Lock Status on Live Mode */}
              {activeModeTab === "live" && (
                <div className="p-3 rounded-lg border border-border/80 bg-secondary/30 space-y-1.5 text-xs font-mono">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground text-[11px]">PTP Hardware Clock:</span>
                    <span className="text-foreground font-semibold">Locked (&lt; 42 ns Jitter)</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground text-[11px]">DMA Buffer Status:</span>
                    <span className="text-foreground">65,536 Samples / DMA 16-bit</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground text-[11px]">Noise Gate Threshold:</span>
                    <span className="text-foreground">45.0 dB_AE (Rejects Traffic)</span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Signal Preprocessing Parameters */}
          <Card className="border border-border bg-card">
            <CardHeader className="pb-3 border-b border-border/50">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Sliders className="h-4 w-4 text-primary" />
                Digital Bandpass &amp; Denoising
              </CardTitle>
              <CardDescription className="text-xs">
                Butterworth analog bandpass filtering and Daubechies wavelet thresholding
              </CardDescription>
            </CardHeader>

            <CardContent className="pt-4 space-y-4 text-xs">
              {/* Bandpass Frequency Inputs */}
              <div>
                <div className="flex items-center justify-between mb-1.5 font-mono text-xs">
                  <span className="font-medium text-muted-foreground">Bandpass Filter Range</span>
                  <span className="font-semibold text-foreground">
                    {bandpassLow} kHz - {bandpassHigh} kHz
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="flex items-center gap-2 bg-secondary/40 p-2 rounded-lg border border-border">
                    <span className="text-muted-foreground text-[10px] font-mono">Low Cut:</span>
                    <input
                      type="number"
                      value={bandpassLow}
                      onChange={(e) => setBandpassLow(Number(e.target.value))}
                      className="w-full bg-transparent font-mono text-xs focus:outline-none"
                    />
                    <span className="text-[10px] text-muted-foreground font-mono">kHz</span>
                  </div>
                  <div className="flex items-center gap-2 bg-secondary/40 p-2 rounded-lg border border-border">
                    <span className="text-muted-foreground text-[10px] font-mono">High Cut:</span>
                    <input
                      type="number"
                      value={bandpassHigh}
                      onChange={(e) => setBandpassHigh(Number(e.target.value))}
                      className="w-full bg-transparent font-mono text-xs focus:outline-none"
                    />
                    <span className="text-[10px] text-muted-foreground font-mono">kHz</span>
                  </div>
                </div>
              </div>

              {/* Denoising & Filter Order */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <span className="font-medium text-muted-foreground block mb-1.5">Denoising Method</span>
                  <select
                    value={denoisingMethod}
                    onChange={(e) => setDenoisingMethod(e.target.value)}
                    className="w-full bg-secondary/50 border border-border rounded-lg p-2 font-mono text-xs text-foreground focus:outline-none cursor-pointer"
                  >
                    <option value="wavelet">Wavelet (db4 soft)</option>
                    <option value="savitzky">Savitzky-Golay</option>
                    <option value="none">Raw Pass-through</option>
                  </select>
                </div>
                <div>
                  <span className="font-medium text-muted-foreground block mb-1.5">Filter Order</span>
                  <select
                    value={filterOrder}
                    onChange={(e) => setFilterOrder(e.target.value)}
                    className="w-full bg-secondary/50 border border-border rounded-lg p-2 font-mono text-xs text-foreground focus:outline-none cursor-pointer"
                  >
                    <option value="4">4th Order Butterworth</option>
                    <option value="8">8th Order Butterworth</option>
                    <option value="2">2nd Order Butterworth</option>
                  </select>
                </div>
              </div>

              {/* Segmentation Window */}
              <div>
                <div className="flex items-center justify-between mb-1.5 font-mono text-xs">
                  <span className="font-medium text-muted-foreground">AE Event Window Length</span>
                  <span className="text-foreground font-semibold">{segmentationWindow} ms</span>
                </div>
                <input
                  type="range"
                  min={10}
                  max={200}
                  step={5}
                  value={segmentationWindow}
                  onChange={(e) => setSegmentationWindow(Number(e.target.value))}
                  className="w-full accent-[#FF5500] cursor-pointer h-1.5 bg-secondary rounded-lg"
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* ========================================================= */}
        {/* RIGHT COLUMN (7 Cols): OSCILLOSCOPE & FORWARD ACTION      */}
        {/* ========================================================= */}
        <div className="lg:col-span-7 space-y-5">
          {/* Signal Waveform Scope Plot */}
          <SignalWaveformPlot
            title={selectedSource.name}
            samplingRate={selectedSource.samplingRate}
            isAnomalous={selectedSource.isAnomalous}
          />

          {/* Action Trigger Card */}
          <Card className="border border-border bg-card p-5">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h3 className="text-sm font-semibold text-foreground">
                  Ready for Topological Phase Reconstruction
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Parameters conditioned: Takens τ = 4, d = 3. Filtration max ε = 0.85
                </p>
              </div>

              <Button
                onClick={handleLaunchAnalysis}
                disabled={isProcessing}
                className="bg-[#FF5500] hover:bg-[#E54B00] text-white font-semibold text-xs h-9 px-5 gap-2 shadow-sm shrink-0 cursor-pointer"
              >
                {isProcessing ? (
                  <>
                    <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                    <span>Executing GUDHI Worker ({progress}%)...</span>
                  </>
                ) : (
                  <>
                    <span>Forward to TDA Homology Pipeline</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </>
                )}
              </Button>
            </div>

            {/* Execution Progress Bar */}
            {isProcessing && (
              <div className="mt-3.5 w-full bg-secondary h-1.5 rounded-full overflow-hidden">
                <div
                  className="bg-[#FF5500] h-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
            )}
          </Card>

          {/* Pre-Computed Takens Estimators Strip */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-3 rounded-xl border border-border bg-card">
              <span className="text-[10px] text-muted-foreground uppercase font-mono block">
                Detected Onsets
              </span>
              <span className="text-base font-bold font-mono text-foreground">14 Bursts</span>
              <span className="text-[11px] text-muted-foreground block mt-0.5">
                Energy gate &gt; 45.0 dB_AE
              </span>
            </div>

            <div className="p-3 rounded-xl border border-border bg-card">
              <span className="text-[10px] text-muted-foreground uppercase font-mono block">
                Optimal Takens Delay (AMI)
              </span>
              <span className="text-base font-bold font-mono text-foreground">τ = 4 samples</span>
              <span className="text-[11px] text-muted-foreground block mt-0.5">
                First mutual info minimum
              </span>
            </div>

            <div className="p-3 rounded-xl border border-border bg-card">
              <span className="text-[10px] text-muted-foreground uppercase font-mono block">
                Embedding Dimension (FNN)
              </span>
              <span className="text-base font-bold font-mono text-foreground">d = 3</span>
              <span className="text-[11px] text-muted-foreground block mt-0.5">
                False neighbors &lt; 1.2%
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
