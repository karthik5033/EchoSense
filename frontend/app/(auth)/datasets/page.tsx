"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Database,
  Download,
  ExternalLink,
  Layers,
  Sparkles,
  Sliders,
  CheckCircle2,
  FileCode,
  HardDrive,
  Info,
  Search,
  Plus,
  Play,
  Pause,
  Copy,
  Check,
  X,
  Radio,
  Activity,
  FileText,
  UploadCloud,
  ChevronRight,
  Filter,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DATASETS_LIBRARY, AeDatasetItem } from "@/lib/echosenseData";
import { downloadDataAsCsv } from "@/lib/utils";

interface SampleEvent {
  id: string;
  datasetId: string;
  mode: string;
  peakVpp: number;
  freqKhz: number;
  riseUs: number;
  energyPj: number;
  raValue: number;
  timestamp: string;
}

const SAMPLE_EVENTS: Record<string, SampleEvent[]> = {
  "ds-bridge-girder": [
    {
      id: "EVT-42801",
      datasetId: "ds-bridge-girder",
      mode: "Shear Interface Slip",
      peakVpp: 1.24,
      freqKhz: 148.6,
      riseUs: 24.8,
      energyPj: 1840,
      raValue: 20.0,
      timestamp: "Stage 5 Cyclic / Block 5 (t=14.2s)",
    },
    {
      id: "EVT-42802",
      datasetId: "ds-bridge-girder",
      mode: "Tensile Micro-cracks",
      peakVpp: 0.78,
      freqKhz: 152.1,
      riseUs: 14.2,
      energyPj: 920,
      raValue: 18.2,
      timestamp: "Stage 3 Monotonic (t=8.6s)",
    },
    {
      id: "EVT-42803",
      datasetId: "ds-bridge-girder",
      mode: "Tendon Anchorage Debonding",
      peakVpp: 1.45,
      freqKhz: 92.4,
      riseUs: 38.5,
      energyPj: 2480,
      raValue: 26.5,
      timestamp: "Stage 6 Ultimate (t=22.1s)",
    },
    {
      id: "EVT-42804",
      datasetId: "ds-bridge-girder",
      mode: "Undamaged Baseline",
      peakVpp: 0.06,
      freqKhz: 145.0,
      riseUs: 8.0,
      energyPj: 42,
      raValue: 133.3,
      timestamp: "Stage 1 Pre-load Ambient (t=0.5s)",
    },
  ],
  "ds-concrete-mendeley": [
    {
      id: "EVT-16651",
      datasetId: "ds-concrete-mendeley",
      mode: "Tensile (Mode I)",
      peakVpp: 0.65,
      freqKhz: 140.0,
      riseUs: 16.0,
      energyPj: 810,
      raValue: 24.6,
      timestamp: "Sample #1042 / Compression Step 2",
    },
    {
      id: "EVT-16652",
      datasetId: "ds-concrete-mendeley",
      mode: "Shear (Mode II)",
      peakVpp: 1.10,
      freqKhz: 88.0,
      riseUs: 29.0,
      energyPj: 1550,
      raValue: 26.3,
      timestamp: "Sample #1042 / Precursor Window (t=3.85s)",
    },
    {
      id: "EVT-16653",
      datasetId: "ds-concrete-mendeley",
      mode: "Mixed-Mode (Mode I+II)",
      peakVpp: 0.94,
      freqKhz: 115.0,
      riseUs: 22.0,
      energyPj: 1180,
      raValue: 23.4,
      timestamp: "Sample #1042 / Yield Transition (t=4.10s)",
    },
  ],
  "ds-smartphone-field": [
    {
      id: "EVT-02451",
      datasetId: "ds-smartphone-field",
      mode: "Surface Acoustic Pulse",
      peakVpp: 0.38,
      freqKhz: 24.0,
      riseUs: 42.0,
      energyPj: 320,
      raValue: 110.5,
      timestamp: "Pixel 9 Pro Internal MEMS (t=1.20s)",
    },
    {
      id: "EVT-02452",
      datasetId: "ds-smartphone-field",
      mode: "Acoustic Ringdown",
      peakVpp: 0.28,
      freqKhz: 18.5,
      riseUs: 65.0,
      energyPj: 210,
      raValue: 232.1,
      timestamp: "Pixel 9 Pro Internal MEMS (t=2.45s)",
    },
    {
      id: "EVT-02453",
      datasetId: "ds-smartphone-field",
      mode: "Ambient Background",
      peakVpp: 0.04,
      freqKhz: 12.0,
      riseUs: 10.0,
      energyPj: 18,
      raValue: 250.0,
      timestamp: "Ambient Structural Noise Floor (t=0.10s)",
    },
  ],
};

export default function DatasetsPage() {
  const router = useRouter();
  const [datasets, setDatasets] = useState<AeDatasetItem[]>(DATASETS_LIBRARY);
  const [selectedDataset, setSelectedDataset] = useState<AeDatasetItem>(DATASETS_LIBRARY[0]);
  const [selectedModeFilter, setSelectedModeFilter] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState("");

  // Partitioning state
  const [trainSplit, setTrainSplit] = useState(70);
  const [valSplit, setValSplit] = useState(15);
  const testSplit = Math.max(5, 100 - trainSplit - valSplit);
  const [holdoutSpecimen, setHoldoutSpecimen] = useState("Girder G1 (Midspan Holdout)");

  // Interactive sample event
  const availableEvents = useMemo(() => {
    const list = SAMPLE_EVENTS[selectedDataset.id] || SAMPLE_EVENTS["ds-bridge-girder"];
    if (selectedModeFilter === "ALL") return list;
    return list.filter((e) => e.mode.toLowerCase().includes(selectedModeFilter.toLowerCase()));
  }, [selectedDataset.id, selectedModeFilter]);

  const [activeEvent, setActiveEvent] = useState<SampleEvent>(
    SAMPLE_EVENTS["ds-bridge-girder"][0]
  );

  // Synchronize active event when dataset changes
  const handleSelectDataset = (ds: AeDatasetItem) => {
    setSelectedDataset(ds);
    setSelectedModeFilter("ALL");
    const events = SAMPLE_EVENTS[ds.id] || SAMPLE_EVENTS["ds-bridge-girder"];
    if (events && events.length > 0) {
      setActiveEvent(events[0]);
    }
  };

  // Waveform playback animation state
  const [isPlaying, setIsPlaying] = useState(false);
  const [playProgress, setPlayProgress] = useState(0);

  React.useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(() => {
      setPlayProgress((prev) => (prev >= 1 ? 0 : prev + 0.05));
    }, 50);
    return () => clearInterval(interval);
  }, [isPlaying]);

  // Toast notification state
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Copy citation state
  const [hasCopiedCitation, setHasCopiedCitation] = useState(false);
  const handleCopyCitation = () => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(`${selectedDataset.source} — ${selectedDataset.citation}`);
      setHasCopiedCitation(true);
      showToast("Citation copied to clipboard");
      setTimeout(() => setHasCopiedCitation(false), 2000);
    }
  };

  // Pipeline execution transition
  const [isRunningPipeline, setIsRunningPipeline] = useState(false);
  const handleRunTopoAE = () => {
    setIsRunningPipeline(true);
    showToast(`Initializing TopoAE pipeline on ${selectedDataset.name}...`);
    setTimeout(() => {
      router.push(`/analysis?dataset=${selectedDataset.id}`);
    }, 600);
  };

  // Export Manifest
  const handleExportManifest = () => {
    downloadDataAsCsv("echosense_datasets_manifest.csv", datasets);
    showToast("Exported manifest: echosense_datasets_manifest.csv");
  };

  // Download Dataset Metadata
  const handleDownloadDataset = (ds: AeDatasetItem) => {
    const jsonStr = `data:text/json;charset=utf-8,` + encodeURIComponent(JSON.stringify(ds, null, 2));
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", jsonStr);
    downloadAnchor.setAttribute("download", `${ds.id}_descriptor.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    showToast(`Downloaded ${ds.id}_descriptor.json`);
  };

  // Upload Modal State
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [newDatasetName, setNewDatasetName] = useState("");
  const [newDatasetSource, setNewDatasetSource] = useState("");
  const [newDatasetFormat, setNewDatasetFormat] = useState("HDF5 / NumPy (.npy)");
  const [newDatasetFreq, setNewDatasetFreq] = useState("10.0 MHz");
  const [newDatasetEvents, setNewDatasetEvents] = useState("12500");
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);

  const handleRegisterDataset = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDatasetName) return;

    const newId = `ds-custom-${Date.now().toString().slice(-4)}`;
    const created: AeDatasetItem = {
      id: newId,
      name: newDatasetName,
      source: newDatasetSource || "User Local Acoustic Ingestion",
      citation: `EchoSense Custom Ingestion Protocol (Registered ${new Date().toLocaleDateString()})`,
      format: newDatasetFormat,
      size: uploadedFileName ? "245 MB" : "120 MB",
      eventsCount: parseInt(newDatasetEvents) || 10000,
      classes: ["Tensile Micro-cracks", "Shear Interface Slip", "Undamaged Baseline"],
      samplingFrequency: newDatasetFreq,
      description: `User-imported benchmark acoustic emission stream: ${newDatasetName}. Calibrated for TopoAE persistent homology analysis.`,
      preloaded: false,
      status: "Ready",
    };

    setDatasets((prev) => [created, ...prev]);
    setSelectedDataset(created);
    setIsUploadModalOpen(false);
    setNewDatasetName("");
    setNewDatasetSource("");
    setUploadedFileName(null);
    showToast(`Successfully registered new corpus: ${created.name}`);
  };

  // Filtered dataset library
  const filteredDatasets = useMemo(() => {
    return datasets.filter((ds) => {
      const q = searchQuery.toLowerCase();
      return (
        ds.name.toLowerCase().includes(q) ||
        ds.source.toLowerCase().includes(q) ||
        ds.format.toLowerCase().includes(q) ||
        ds.samplingFrequency.toLowerCase().includes(q)
      );
    });
  }, [datasets, searchQuery]);

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-7xl mx-auto w-full select-none">
      {/* Toast Notification Banner */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-2.5 rounded-xl border border-primary/40 bg-[#141419] text-white text-xs font-mono shadow-2xl animate-in fade-in slide-in-from-bottom-3 duration-200">
          <CheckCircle2 className="w-4 h-4 text-[#FF5500]" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b border-border/60">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <Database className="h-6 w-6 text-primary" />
            Acoustic Emission Datasets Library
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Published experimental bridge girder benchmarks, validated concrete fracture acoustic events, and field streams
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant="outline" className="font-mono text-xs border-border text-muted-foreground bg-muted/30">
            {datasets.length} Verified Benchmarks
          </Badge>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-xl border border-border bg-card">
        <div className="relative flex-1 min-w-[240px] max-w-md">
          <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search corpora by name, frequency, citation, or format..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 bg-muted/30 border border-border rounded-lg text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>

        <div className="flex items-center gap-2 text-xs font-mono text-muted-foreground">
          <span>Active Selection:</span>
          <span className="font-bold text-foreground truncate max-w-[220px]">
            {selectedDataset.name}
          </span>
        </div>
      </div>

      {/* Dataset Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {filteredDatasets.map((ds) => {
          const isSelected = selectedDataset.id === ds.id;
          return (
            <Card
              key={ds.id}
              onClick={() => handleSelectDataset(ds)}
              className={`p-5 cursor-pointer transition-all flex flex-col justify-between relative group ${
                isSelected
                  ? "border-2 border-[#FF5500] bg-card shadow-lg ring-1 ring-[#FF5500]/20"
                  : "border-border hover:border-primary/40 bg-card hover:bg-muted/30"
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <Badge variant="outline" className="text-[10px] font-mono border-primary/30 text-primary bg-primary/10">
                    {ds.format}
                  </Badge>
                  <span className="font-mono text-xs text-muted-foreground font-medium">{ds.size}</span>
                </div>

                <h3 className="text-sm font-bold text-foreground leading-snug group-hover:text-primary transition-colors">
                  {ds.name}
                </h3>
                <p className="text-[11px] text-muted-foreground font-mono mt-1">{ds.source}</p>

                <p className="mt-3 text-xs text-muted-foreground line-clamp-3 leading-relaxed">
                  {ds.description}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-border/50">
                <div className="flex items-center justify-between text-xs font-mono mb-2">
                  <span className="text-foreground font-semibold">
                    {ds.eventsCount.toLocaleString()} Events
                  </span>
                  <span className="text-muted-foreground">{ds.samplingFrequency}</span>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <span className="text-[10px] font-mono uppercase text-primary font-bold">
                    {isSelected ? "● Selected Corpus" : "Click to Inspect"}
                  </span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDownloadDataset(ds);
                    }}
                    className="text-[11px] font-mono text-muted-foreground hover:text-foreground flex items-center gap-1 cursor-pointer"
                    title="Download Dataset Descriptor JSON"
                  >
                    <Download className="w-3 h-3" />
                    <span>Descriptor</span>
                  </button>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Selected Dataset Detail Inspection Panel */}
      <Card className="border border-border bg-card p-6 shadow-xl space-y-6">
        {/* Panel Header */}
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6 pb-4 border-b border-border/50">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h2 className="text-lg sm:text-xl font-bold text-foreground">{selectedDataset.name}</h2>
              <Badge variant="secondary" className="text-[10px] font-mono">
                {selectedDataset.status}
              </Badge>
            </div>
            <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
              <span>Source: {selectedDataset.source}</span>
              <span>&bull;</span>
              <span className="font-mono text-primary flex items-center gap-1">
                Citation: {selectedDataset.citation}
                <button
                  onClick={handleCopyCitation}
                  className="hover:text-foreground transition-colors p-1 cursor-pointer"
                  title="Copy Citation & DOI"
                >
                  {hasCopiedCitation ? <Check className="w-3 h-3 text-[#FF5500]" /> : <Copy className="w-3 h-3" />}
                </button>
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              size="sm"
              onClick={handleRunTopoAE}
              disabled={isRunningPipeline}
              className="bg-[#FF5500] hover:bg-[#E54B00] text-white text-xs gap-1.5 cursor-pointer shadow-md"
            >
              <Sparkles className="h-3.5 w-3.5" />
              {isRunningPipeline ? "Launching TopoAE..." : "Run TopoAE on this Dataset"}
            </Button>
          </div>
        </div>

        {/* 2-Column Main Inspector: Left Signal Preview, Right Partitioning & Stream */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Left Column (7 cols): Classified Modes & Interactive Signal Waveform Canvas */}
          <div className="lg:col-span-7 space-y-4">
            
            {/* Fracture Modes Filter Pill Bar */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-foreground font-semibold uppercase tracking-wider text-[11px]">
                  Classified Crack Fracture Modes
                </span>
                <span className="text-muted-foreground text-[11px]">
                  Click mode to filter sample signals
                </span>
              </div>

              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setSelectedModeFilter("ALL")}
                  className={`px-2.5 py-1 rounded-md text-xs font-mono transition-colors cursor-pointer ${
                    selectedModeFilter === "ALL"
                      ? "bg-[#FF5500] text-white font-bold"
                      : "bg-muted/50 text-muted-foreground hover:text-foreground border border-border"
                  }`}
                >
                  ALL MODES
                </button>
                {selectedDataset.classes.map((cls) => {
                  const isFiltered = selectedModeFilter === cls;
                  return (
                    <button
                      key={cls}
                      onClick={() => {
                        setSelectedModeFilter(cls);
                        const match = (SAMPLE_EVENTS[selectedDataset.id] || []).find((e) =>
                          e.mode.toLowerCase().includes(cls.toLowerCase())
                        );
                        if (match) setActiveEvent(match);
                      }}
                      className={`px-2.5 py-1 rounded-md text-xs font-mono transition-colors cursor-pointer flex items-center gap-1.5 ${
                        isFiltered
                          ? "bg-[#FF5500] text-white font-bold"
                          : "bg-muted/50 text-muted-foreground hover:text-foreground border border-border"
                      }`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${isFiltered ? "bg-white" : "bg-primary"}`} />
                      <span>{cls}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Interactive Benchmark Waveform Oscilloscope Preview */}
            <div className="rounded-xl border border-border bg-[#0a0a0f] p-4 shadow-xl space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-border/40 text-xs font-mono">
                <div className="flex items-center gap-2">
                  <Activity className="w-3.5 h-3.5 text-[#FF5500]" />
                  <span className="font-bold text-foreground">{activeEvent.id}</span>
                  <span className="text-muted-foreground">({activeEvent.mode})</span>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setIsPlaying(!isPlaying)}
                    className="h-6 px-2 text-[11px] font-mono text-muted-foreground hover:text-foreground cursor-pointer gap-1"
                  >
                    {isPlaying ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
                    <span>{isPlaying ? "Pause" : "Play Pulse"}</span>
                  </Button>
                </div>
              </div>

              {/* Waveform SVG */}
              <div className="relative h-44 w-full flex items-center justify-center">
                <svg viewBox="0 0 600 180" className="w-full h-full select-none">
                  {/* Scope Grid */}
                  <line x1="0" y1="90" x2="600" y2="90" stroke="#222230" strokeWidth="1" strokeDasharray="3,3" />
                  <line x1="0" y1="30" x2="600" y2="30" stroke="#181824" strokeWidth="0.8" strokeDasharray="2,2" />
                  <line x1="0" y1="150" x2="600" y2="150" stroke="#181824" strokeWidth="0.8" strokeDasharray="2,2" />

                  <text x="8" y="34" fill="#71717a" fontSize="8" fontFamily="monospace">+1.0 V</text>
                  <text x="8" y="94" fill="#71717a" fontSize="8" fontFamily="monospace">0.0 V</text>
                  <text x="8" y="154" fill="#71717a" fontSize="8" fontFamily="monospace">-1.0 V</text>

                  {/* Onset boundary reference */}
                  <line x1="120" y1="10" x2="120" y2="170" stroke="#FF5500" strokeWidth="1" strokeDasharray="2,2" opacity="0.6" />
                  <text x="125" y="22" fill="#FF5500" fontSize="8" fontFamily="monospace">Onset (AIC)</text>

                  {/* Synthetic Physical Waveform for the Active Event */}
                  <path
                    d={(() => {
                      const points = 160;
                      const amp = activeEvent.peakVpp;
                      const freq = activeEvent.freqKhz / 150; // normalized carrier
                      let d = "";
                      for (let i = 0; i < points; i++) {
                        const x = (i / (points - 1)) * 600;
                        const dist = i - 32;
                        let yVal = 0;
                        if (dist >= 0) {
                          const envelope = (dist / 14) * Math.exp(-dist / 18);
                          const osc = Math.cos(2 * Math.PI * freq * dist * 0.28);
                          yVal = amp * envelope * osc * 55;
                        } else {
                          yVal = (Math.sin(i * 1.8) * 0.04) * 55;
                        }
                        const y = 90 - yVal;
                        d += i === 0 ? `M ${x.toFixed(1)} ${y.toFixed(1)}` : ` L ${x.toFixed(1)} ${y.toFixed(1)}`;
                      }
                      return d;
                    })()}
                    fill="none"
                    stroke="#FF5500"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                  />

                  {/* Playhead indicator */}
                  {isPlaying && (
                    <line
                      x1={playProgress * 600}
                      y1="10"
                      x2={playProgress * 600}
                      y2="170"
                      stroke="#ffffff"
                      strokeWidth="1.2"
                      opacity="0.8"
                    />
                  )}
                </svg>
              </div>

              {/* Event Parameter Metrics */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-border/40 text-[11px] font-mono">
                <div className="p-2 rounded bg-muted/30">
                  <span className="text-[10px] text-muted-foreground block">Peak Voltage</span>
                  <span className="text-foreground font-bold">{activeEvent.peakVpp} Vpp</span>
                </div>
                <div className="p-2 rounded bg-muted/30">
                  <span className="text-[10px] text-muted-foreground block">Ringing Frequency</span>
                  <span className="text-foreground font-bold">{activeEvent.freqKhz} kHz</span>
                </div>
                <div className="p-2 rounded bg-muted/30">
                  <span className="text-[10px] text-muted-foreground block">Rise Time (tr)</span>
                  <span className="text-foreground font-bold">{activeEvent.riseUs} µs</span>
                </div>
                <div className="p-2 rounded bg-muted/30">
                  <span className="text-[10px] text-muted-foreground block">RA Value (tr/V)</span>
                  <span className="text-primary font-bold">{activeEvent.raValue} µs/V</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column (5 cols): Event List Selector & Interactive Split Slider */}
          <div className="lg:col-span-5 space-y-4">
            
            {/* Event List Browser Card */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-foreground font-semibold uppercase tracking-wider text-[11px]">
                  Sample Event Index ({availableEvents.length})
                </span>
                <span className="text-muted-foreground text-[10px]">Select event to inspect</span>
              </div>

              <div className="space-y-1.5 max-h-[190px] overflow-y-auto pr-1">
                {availableEvents.map((ev) => {
                  const isActive = activeEvent.id === ev.id;
                  return (
                    <div
                      key={ev.id}
                      onClick={() => setActiveEvent(ev)}
                      className={`p-2.5 rounded-lg border text-xs font-mono cursor-pointer transition-all flex items-center justify-between ${
                        isActive
                          ? "border-[#FF5500] bg-[#FF5500]/10"
                          : "border-border hover:border-primary/40 bg-muted/20"
                      }`}
                    >
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-foreground">{ev.id}</span>
                          <span className="text-[10px] text-primary">({ev.mode})</span>
                        </div>
                        <div className="text-[10px] text-muted-foreground">{ev.timestamp}</div>
                      </div>

                      <div className="text-right">
                        <span className="font-bold text-foreground block">{ev.peakVpp} Vpp</span>
                        <span className="text-[10px] text-muted-foreground block">{ev.freqKhz} kHz</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Interactive Data Partitioning & Leakage Prevention Card */}
            <div className="p-4 rounded-xl border border-border bg-card space-y-4 text-xs">
              <div className="flex items-center justify-between border-b border-border/40 pb-2">
                <span className="font-semibold text-foreground uppercase tracking-wider font-mono text-[11px]">
                  Data Partitioning &amp; Leakage Prevention
                </span>
                <Badge variant="outline" className="text-[10px] font-mono text-muted-foreground border-border">
                  Specimen-Level
                </Badge>
              </div>

              {/* Holdout Specimen Dropdown */}
              <div className="space-y-1">
                <label className="text-[11px] text-muted-foreground font-mono block">
                  Isolated Holdout Specimen (Zero Leakage):
                </label>
                <select
                  value={holdoutSpecimen}
                  onChange={(e) => {
                    setHoldoutSpecimen(e.target.value);
                    showToast(`Holdout set to: ${e.target.value}`);
                  }}
                  className="w-full text-xs bg-muted/40 border border-border rounded-lg px-3 py-1.5 font-mono text-foreground focus:outline-none cursor-pointer"
                >
                  <option value="Girder G1 (Midspan Holdout)">Girder G1 (Monotonic Midspan Bend)</option>
                  <option value="Girder G2 (Shear Key Holdout)">Girder G2 (Cyclic Shear Key Zone)</option>
                  <option value="Girder G4 (Anchorage Holdout)">Girder G4 (Ultimate Limit Prestress)</option>
                  <option value="Specimen C-14 (Cylinder Holdout)">Specimen C-14 (Concrete Tri-axial)</option>
                </select>
              </div>

              {/* Train Split Slider */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between font-mono text-[11px]">
                  <span className="text-muted-foreground">Train Proportion:</span>
                  <span className="text-foreground font-bold">{trainSplit}% ({Math.round((selectedDataset.eventsCount * trainSplit) / 100).toLocaleString()} events)</span>
                </div>
                <input
                  type="range"
                  min="50"
                  max="80"
                  step="5"
                  value={trainSplit}
                  onChange={(e) => setTrainSplit(Number(e.target.value))}
                  className="w-full accent-primary cursor-pointer h-1.5"
                />
              </div>

              {/* Val Split Slider */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between font-mono text-[11px]">
                  <span className="text-muted-foreground">Validation Proportion:</span>
                  <span className="text-zinc-300 font-bold">{valSplit}% ({Math.round((selectedDataset.eventsCount * valSplit) / 100).toLocaleString()} events)</span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="25"
                  step="5"
                  value={valSplit}
                  onChange={(e) => setValSplit(Number(e.target.value))}
                  className="w-full accent-primary cursor-pointer h-1.5"
                />
              </div>

              {/* Visual Split Distribution Bar */}
              <div>
                <div className="flex items-center justify-between mb-1 font-mono text-[10px] text-muted-foreground">
                  <span>Train: {trainSplit}%</span>
                  <span>Val: {valSplit}%</span>
                  <span className="text-primary font-bold">Test: {testSplit}% ({Math.round((selectedDataset.eventsCount * testSplit) / 100).toLocaleString()})</span>
                </div>
                <div className="w-full h-2.5 rounded-full overflow-hidden flex bg-muted/60 border border-border/50">
                  <div className="bg-zinc-500 h-full transition-all" style={{ width: `${trainSplit}%` }} />
                  <div className="bg-zinc-700 h-full transition-all" style={{ width: `${valSplit}%` }} />
                  <div className="bg-[#FF5500] h-full transition-all" style={{ width: `${testSplit}%` }} />
                </div>
              </div>

              <Button
                size="sm"
                variant="outline"
                onClick={() => showToast(`Partition saved: ${trainSplit}% Train / ${valSplit}% Val / ${testSplit}% Test on ${holdoutSpecimen}`)}
                className="w-full text-xs font-semibold gap-1.5 border-border cursor-pointer"
              >
                <CheckCircle2 className="w-3.5 h-3.5 text-[#FF5500]" />
                Lock Partition Configuration
              </Button>
            </div>

          </div>

        </div>
      </Card>

      {/* Upload New Dataset Modal */}
      {isUploadModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-lg rounded-2xl border border-border bg-[#141419] p-6 shadow-2xl space-y-5 text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-border/60">
              <div className="flex items-center gap-2">
                <Database className="w-5 h-5 text-primary" />
                <h3 className="text-base font-bold text-foreground">Register New Acoustic Emission Corpus</h3>
              </div>
              <button
                onClick={() => setIsUploadModalOpen(false)}
                className="text-muted-foreground hover:text-foreground cursor-pointer p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleRegisterDataset} className="space-y-4">
              <div className="space-y-1">
                <label className="font-mono text-muted-foreground block text-[11px]">Corpus Name / Specimen Description:</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Steel-Concrete Composite Girder High-Cycle Fatigue AE"
                  value={newDatasetName}
                  onChange={(e) => setNewDatasetName(e.target.value)}
                  className="w-full px-3 py-2 bg-muted/40 border border-border rounded-lg text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>

              <div className="space-y-1">
                <label className="font-mono text-muted-foreground block text-[11px]">Research Source / Author / DOI:</label>
                <input
                  type="text"
                  placeholder="e.g. D'Angela & Magliulo (2026) • doi: 10.1617/s11527-026-02973-1"
                  value={newDatasetSource}
                  onChange={(e) => setNewDatasetSource(e.target.value)}
                  className="w-full px-3 py-2 bg-muted/40 border border-border rounded-lg text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-mono text-muted-foreground block text-[11px]">File Format:</label>
                  <select
                    value={newDatasetFormat}
                    onChange={(e) => setNewDatasetFormat(e.target.value)}
                    className="w-full px-3 py-2 bg-muted/40 border border-border rounded-lg text-xs text-foreground font-mono focus:outline-none cursor-pointer"
                  >
                    <option value="HDF5 / NumPy (.npy)">HDF5 / NumPy (.npy)</option>
                    <option value="Uncompressed WAV (24-bit)">Uncompressed WAV (24-bit)</option>
                    <option value="ASCII / CSV Records">ASCII / CSV Records</option>
                    <option value="MATLAB (.mat)">MATLAB (.mat)</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-mono text-muted-foreground block text-[11px]">Sampling Frequency:</label>
                  <select
                    value={newDatasetFreq}
                    onChange={(e) => setNewDatasetFreq(e.target.value)}
                    className="w-full px-3 py-2 bg-muted/40 border border-border rounded-lg text-xs text-foreground font-mono focus:outline-none cursor-pointer"
                  >
                    <option value="10.0 MHz">10.0 MHz (Ultra-wideband)</option>
                    <option value="5.0 MHz">5.0 MHz (Decimated)</option>
                    <option value="500 kHz">500 kHz (Resonant R15α)</option>
                    <option value="48.0 kHz">48.0 kHz (MEMS In-situ)</option>
                  </select>
                </div>
              </div>

              {/* Drag and drop simulator */}
              <div
                onClick={() => setUploadedFileName("benchmark_recording_stream_2026.h5")}
                className="p-5 rounded-xl border border-dashed border-border hover:border-primary/60 bg-muted/20 text-center cursor-pointer transition-colors space-y-1"
              >
                <UploadCloud className="w-6 h-6 mx-auto text-primary" />
                <span className="font-mono text-xs text-foreground block">
                  {uploadedFileName ? uploadedFileName : "Click or drag acoustic descriptor file (.h5, .csv, .wav)"}
                </span>
                <span className="text-[10px] text-muted-foreground block">
                  {uploadedFileName ? "File verified • Ready to index" : "Supports streaming HDF5 partitions or multi-channel WAV"}
                </span>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-border/50">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsUploadModalOpen(false)}
                  className="text-xs border-border cursor-pointer"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="bg-[#FF5500] hover:bg-[#E54B00] text-white text-xs font-semibold cursor-pointer"
                >
                  Register Corpus
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
