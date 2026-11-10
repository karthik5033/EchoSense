"use client";

import React, { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import {
  Sliders,
  User,
  Cpu,
  Radio,
  Bell,
  Check,
  Shield,
  ChevronRight,
  RefreshCw,
  Sparkles,
  Zap,
  Activity,
  Layers,
  CheckCircle2,
  AlertTriangle,
  Send,
  Download,
  Info,
  Clock,
  Waves,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/lib/AuthContext";

type SettingsTab = "sensor" | "pipeline" | "notifications" | "profile";

export default function SettingsPage() {
  const { user, updateUser } = useAuth();
  const [activeTab, setActiveTab] = useState<SettingsTab>("sensor");
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const tab = params.get("tab") as SettingsTab;
      if (tab && ["sensor", "pipeline", "notifications", "profile"].includes(tab)) {
        setActiveTab(tab);
      }
    }
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // -------------------------------------------------------------
  // TAB 1: SENSOR & DAQ CALIBRATION (Strict Hardware Physics)
  // -------------------------------------------------------------
  const [transducerModel, setTransducerModel] = useState("R15A");
  const [micGainDb, setMicGainDb] = useState(24);
  const [samplingRatePreset, setSamplingRatePreset] = useState("500khz");
  const [lowCutoffKhz, setLowCutoffKhz] = useState(20);
  const [highCutoffKhz, setHighCutoffKhz] = useState(200);
  const [ptpJitterNs, setPtpJitterNs] = useState(42);
  const [acousticVelocity, setAcousticVelocity] = useState(3850);

  // Computed Sensor Physics
  const sensorPhysics = useMemo(() => {
    // 1. Sampling Rate & Nyquist Barrier
    let fsKhz = 500;
    if (samplingRatePreset === "10mhz") fsKhz = 10000;
    if (samplingRatePreset === "48khz") fsKhz = 48;
    const nyquistKhz = fsKhz / 2;

    // 2. Voltage Amplification Factor: Av = 10^(Gain/20)
    const voltageGainAv = Math.pow(10, micGainDb / 20);

    // 3. Input-Referred Noise Floor (16-bit ADC, 2.0 Vpp scale)
    const adcQuantizationV = 2.0 / 65536; // ~30.5 uV
    const inputReferredNoiseUv = (adcQuantizationV / voltageGainAv) * 1e6;

    // 4. Dynamic Range: DR = 6.02 * N + 1.76 dB
    const bitDepth = samplingRatePreset === "10mhz" ? 16 : 24;
    const dynamicRangeDb = bitDepth === 16 ? 98.1 : 144.0;

    // 5. Spatial Localization Uncertainty: Delta_x = Vp * Jitter
    const spatialUncertaintyMm = (acousticVelocity * (ptpJitterNs * 1e-9)) * 1000;

    // 6. Aliasing Warning Check
    const hasAliasingRisk = highCutoffKhz >= nyquistKhz;

    // 7. Resonant Frequency of Transducer
    let centerFreqKhz = 148.6;
    if (transducerModel === "WD") centerFreqKhz = 320.0;
    if (transducerModel === "MEMS") centerFreqKhz = 24.0;

    return {
      fsKhz,
      nyquistKhz,
      voltageGainAv: voltageGainAv.toFixed(2),
      inputReferredNoiseUv: inputReferredNoiseUv.toFixed(2),
      dynamicRangeDb,
      spatialUncertaintyMm: spatialUncertaintyMm.toFixed(3),
      hasAliasingRisk,
      centerFreqKhz,
    };
  }, [samplingRatePreset, micGainDb, lowCutoffKhz, highCutoffKhz, ptpJitterNs, acousticVelocity, transducerModel]);

  // -------------------------------------------------------------
  // TAB 2: TDA HYPERPARAMETERS (Dynamical Reconstruction & GUDHI)
  // -------------------------------------------------------------
  const [embeddingDimD, setEmbeddingDimD] = useState(3);
  const [timeDelayTau, setTimeDelayTau] = useState(4);
  const [complexType, setComplexType] = useState<"vietoris-rips" | "alpha">("vietoris-rips");
  const [filtrationMaxRadius, setFiltrationMaxRadius] = useState(1.5);
  const [minPersistenceThreshold, setMinPersistenceThreshold] = useState(0.12);
  const [bocdHazardRate, setBocdHazardRate] = useState(250);
  const [anomalyPercentile, setAnomalyPercentile] = useState(95);

  // Computed TDA Physics
  const tdaPhysics = useMemo(() => {
    // Delta t in microseconds based on active sampling rate
    const deltaTUs = (timeDelayTau / sensorPhysics.fsKhz) * 1000;
    // Phase separation angle in degrees for R15a carrier (148.6 kHz)
    const phaseDeg = ((2 * Math.PI * sensorPhysics.centerFreqKhz * 1000 * (deltaTUs * 1e-6)) * (180 / Math.PI)) % 360;
    // FNN residual percentage estimate based on dimension
    const fnnResidualPercent = embeddingDimD === 2 ? 14.8 : embeddingDimD === 3 ? 0.2 : 0.05;

    return {
      deltaTUs: deltaTUs.toFixed(2),
      phaseDeg: phaseDeg.toFixed(1),
      fnnResidualPercent,
    };
  }, [timeDelayTau, embeddingDimD, sensorPhysics.fsKhz, sensorPhysics.centerFreqKhz]);

  // -------------------------------------------------------------
  // TAB 3: ALERT TRIGGERS & DISPATCH ENGINE
  // -------------------------------------------------------------
  const [h1LoopThreshold, setH1LoopThreshold] = useState(0.40);
  const [bocdProbabilityThreshold, setBocdProbabilityThreshold] = useState(85);
  const [conv1dResidualThreshold, setConv1dResidualThreshold] = useState(0.180);
  const [webhookUrl, setWebhookUrl] = useState("https://shm-telemetry.echosense.io/v1/alerts/girder-g2");
  const [mqttTopic, setMqttTopic] = useState("bridge/girder-g2/precursors");
  const [isSimulatingAlert, setIsSimulatingAlert] = useState(false);

  const handleSimulateAlert = () => {
    setIsSimulatingAlert(true);
    setTimeout(() => {
      setIsSimulatingAlert(false);
      showToast(`Simulated Alert Dispatched to ${mqttTopic} • HTTP 200 OK`);
    }, 700);
  };

  // -------------------------------------------------------------
  // TAB 4: RESEARCHER & INSTITUTIONAL PROFILE
  // -------------------------------------------------------------
  const [firstName, setFirstName] = useState(user.firstName || "Operations");
  const [lastName, setLastName] = useState(user.lastName || "Lead");
  const [email, setEmail] = useState(user.email || "ops@echosense.io");
  const [department, setDepartment] = useState(user.department || "Structural Acoustic Diagnostics Lab");
  const [ndtLicense, setNdtLicense] = useState("ASNT NDT Level III (Acoustic Emission) • PE #84920");

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateUser({ firstName, lastName, email, department });
    showToast("Researcher profile & digital audit credentials updated.");
  };

  // Master Save Configuration
  const handleSaveAllConfig = () => {
    if (typeof window !== "undefined") {
      const config = {
        transducerModel,
        micGainDb,
        samplingRatePreset,
        lowCutoffKhz,
        highCutoffKhz,
        ptpJitterNs,
        acousticVelocity,
        embeddingDimD,
        timeDelayTau,
        bocdHazardRate,
        anomalyPercentile,
      };
      localStorage.setItem("echosense_system_config", JSON.stringify(config));
    }
    showToast("Master System Configuration synchronized across TopoAE modules.");
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-6xl mx-auto w-full select-none">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-2.5 rounded-xl border border-primary/40 bg-[#141419] text-white text-xs font-mono shadow-2xl animate-in fade-in slide-in-from-bottom-3 duration-200">
          <CheckCircle2 className="w-4 h-4 text-[#FF5500]" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b border-border/60">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <Sliders className="h-6 w-6 text-primary" />
            Settings &amp; SHM Calibration
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Hardware acquisition calibration, Takens dynamical embedding parameters, and tri-branch alarm consensus
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            onClick={handleSaveAllConfig}
            className="bg-[#FF5500] hover:bg-[#E54B00] text-white gap-1.5 text-xs font-semibold cursor-pointer shadow-sm"
          >
            <Check className="h-3.5 w-3.5" />
            Apply All Presets
          </Button>
          <Link href="/settings/permissions">
            <Button variant="outline" size="sm" className="gap-1.5 text-xs border-border cursor-pointer">
              <Shield className="h-3.5 w-3.5 text-primary" />
              RBAC Matrix
              <ChevronRight className="h-3 w-3" />
            </Button>
          </Link>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-border/60 pb-1 text-xs">
        {[
          { key: "sensor", label: "Sensor Calibration", icon: Radio },
          { key: "pipeline", label: "TDA Hyperparameters", icon: Cpu },
          { key: "notifications", label: "Alert Triggers", icon: Bell },
          { key: "profile", label: "Researcher Profile", icon: User },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as SettingsTab)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg font-medium transition-colors cursor-pointer ${
                isActive
                  ? "bg-card text-foreground border border-border shadow-sm font-semibold"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Icon className="w-3.5 h-3.5 text-primary" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* ------------------------------------------------------------- */}
      {/* TAB 1: SENSOR CALIBRATION (Comprehensive DAQ & Signal Physics) */}
      {/* ------------------------------------------------------------- */}
      {activeTab === "sensor" && (
        <div className="space-y-6">
          <Card className="border border-border bg-card p-6 shadow-xl space-y-6">
            <CardHeader className="p-0 pb-4 border-b border-border/50">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base font-bold text-foreground">
                    Acoustic Transducer &amp; DAQ Acquisition Calibration
                  </CardTitle>
                  <CardDescription className="text-xs mt-0.5">
                    Hardware sensitivity compensation, Butterworth bandpass filtering, and IEEE 1588 PTP clock synchronization
                  </CardDescription>
                </div>
                <Badge variant="outline" className="font-mono text-xs border-border text-muted-foreground">
                  EN 1330-9 Protocol
                </Badge>
              </div>
            </CardHeader>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Left Column (7 cols): Hardware Sliders & Filter Cutoffs */}
              <div className="lg:col-span-7 space-y-5 text-xs">
                
                {/* 1. Transducer Model Selection */}
                <div className="space-y-1.5">
                  <label className="font-mono text-muted-foreground block text-[11px]">
                    Active Acoustic Transducer Model:
                  </label>
                  <select
                    value={transducerModel}
                    onChange={(e) => setTransducerModel(e.target.value)}
                    className="w-full bg-muted/40 border border-border rounded-lg px-3 py-2 font-mono text-xs text-foreground focus:outline-none cursor-pointer"
                  >
                    <option value="R15A">PAC R15α Resonant Piezoelectric (150 kHz Resonant Peak)</option>
                    <option value="WD">PAC Wideband Differential WD (100 kHz - 1000 kHz)</option>
                    <option value="MEMS">Commodity In-Situ MEMS Acoustic Sensor (48 kHz)</option>
                  </select>
                </div>

                {/* 2. Digital Pre-Amp Gain Slider */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between font-mono text-[11px]">
                    <span className="text-muted-foreground">Pre-Amplifier Hardware Gain Compensation (G):</span>
                    <span className="text-primary font-bold text-xs">+{micGainDb} dB (Av = {sensorPhysics.voltageGainAv}×)</span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={40}
                    step={2}
                    value={micGainDb}
                    onChange={(e) => setMicGainDb(Number(e.target.value))}
                    className="w-full accent-primary cursor-pointer h-1.5 bg-muted rounded-lg"
                  />
                  <div className="flex justify-between text-[10px] text-muted-foreground font-mono">
                    <span>0 dB (Unity Gain)</span>
                    <span>+20 dB (10×)</span>
                    <span>+40 dB (100× Max)</span>
                  </div>
                </div>

                {/* 3. Sampling Frequency Preset */}
                <div className="space-y-1.5">
                  <label className="font-mono text-muted-foreground block text-[11px]">
                    Digitizer Sampling Rate (fs):
                  </label>
                  <select
                    value={samplingRatePreset}
                    onChange={(e) => setSamplingRatePreset(e.target.value)}
                    className="w-full bg-muted/40 border border-border rounded-lg px-3 py-2 font-mono text-xs text-foreground focus:outline-none cursor-pointer"
                  >
                    <option value="10mhz">10.0 MS/s (Hardware DMA Stream • Nyquist: 5,000 kHz)</option>
                    <option value="500khz">500.0 kS/s (Decimated Oscilloscope • Nyquist: 250 kHz)</option>
                    <option value="48khz">48.0 kS/s (MEMS Audio Benchmark • Nyquist: 24 kHz)</option>
                  </select>
                </div>

                {/* 4. Butterworth Bandpass Cutoff Frequencies */}
                <div className="grid grid-cols-2 gap-4 pt-2 border-t border-border/40">
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between font-mono text-[11px]">
                      <span className="text-muted-foreground">High-Pass Cutoff (flow):</span>
                      <span className="text-foreground font-bold">{lowCutoffKhz} kHz</span>
                    </div>
                    <input
                      type="range"
                      min={5}
                      max={60}
                      step={5}
                      value={lowCutoffKhz}
                      onChange={(e) => setLowCutoffKhz(Number(e.target.value))}
                      className="w-full accent-primary cursor-pointer h-1.5 bg-muted rounded-lg"
                    />
                    <span className="text-[10px] text-muted-foreground block">
                      Rejects ambient mechanical vibrations &amp; traffic rumble
                    </span>
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between font-mono text-[11px]">
                      <span className="text-muted-foreground">Low-Pass Cutoff (fhigh):</span>
                      <span className="text-foreground font-bold">{highCutoffKhz} kHz</span>
                    </div>
                    <input
                      type="range"
                      min={100}
                      max={400}
                      step={20}
                      value={highCutoffKhz}
                      onChange={(e) => setHighCutoffKhz(Number(e.target.value))}
                      className="w-full accent-primary cursor-pointer h-1.5 bg-muted rounded-lg"
                    />
                    <span className="text-[10px] text-muted-foreground block">
                      Anti-aliasing cutoff prior to ADC stage
                    </span>
                  </div>
                </div>

                {/* 5. IEEE 1588 PTP Jitter & Acoustic Wave Velocity */}
                <div className="grid grid-cols-2 gap-4 pt-2 border-t border-border/40">
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between font-mono text-[11px]">
                      <span className="text-muted-foreground">PTP Timestamp Jitter (σt):</span>
                      <span className="text-foreground font-bold">{ptpJitterNs} ns</span>
                    </div>
                    <input
                      type="range"
                      min={10}
                      max={200}
                      step={10}
                      value={ptpJitterNs}
                      onChange={(e) => setPtpJitterNs(Number(e.target.value))}
                      className="w-full accent-primary cursor-pointer h-1.5 bg-muted rounded-lg"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between font-mono text-[11px]">
                      <span className="text-muted-foreground">Concrete Acoustic Velocity (Vp):</span>
                      <span className="text-foreground font-bold">{acousticVelocity} m/s</span>
                    </div>
                    <input
                      type="range"
                      min={3400}
                      max={4400}
                      step={25}
                      value={acousticVelocity}
                      onChange={(e) => setAcousticVelocity(Number(e.target.value))}
                      className="w-full accent-primary cursor-pointer h-1.5 bg-muted rounded-lg"
                    />
                  </div>
                </div>

              </div>

              {/* Right Column (5 cols): Live Mathematical Verification & Filter Response */}
              <div className="lg:col-span-5 space-y-4">
                
                {/* Mathematical Calibration Summary Card */}
                <div className="p-4 rounded-xl border border-border bg-muted/20 space-y-3 font-mono text-xs">
                  <div className="flex items-center justify-between pb-2 border-b border-border/40">
                    <span className="font-bold text-foreground flex items-center gap-1.5">
                      <Activity className="w-3.5 h-3.5 text-primary" />
                      Derived Acquisition Metrics
                    </span>
                    <Badge
                      variant="outline"
                      className={`text-[10px] ${
                        sensorPhysics.hasAliasingRisk
                          ? "border-destructive text-destructive bg-destructive/10 font-bold"
                          : "border-border text-foreground bg-muted/40"
                      }`}
                    >
                      {sensorPhysics.hasAliasingRisk ? "Aliasing Risk!" : "Nyquist Satisfied"}
                    </Badge>
                  </div>

                  <div className="space-y-2 text-[11px]">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Nyquist Barrier (fs / 2):</span>
                      <span className="font-bold text-foreground">{sensorPhysics.nyquistKhz.toLocaleString()} kHz</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Linear Gain Factor (Av):</span>
                      <span className="font-bold text-foreground">{sensorPhysics.voltageGainAv}×</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Input-Referred Noise Floor:</span>
                      <span className="font-bold text-foreground">{sensorPhysics.inputReferredNoiseUv} µV</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Dynamic Range:</span>
                      <span className="font-bold text-foreground">{sensorPhysics.dynamicRangeDb} dB</span>
                    </div>
                    <div className="flex justify-between pt-1 border-t border-border/40">
                      <span className="text-muted-foreground">Spatial Uncertainty (Δx):</span>
                      <span className="font-bold text-primary">&plusmn;{sensorPhysics.spatialUncertaintyMm} mm</span>
                    </div>
                  </div>
                </div>

                {/* Filter Passband Response Curve SVG */}
                <div className="rounded-xl border border-border bg-[#0a0a0f] p-4 space-y-2 text-xs font-mono">
                  <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                    <span>Butterworth Passband: [{lowCutoffKhz} kHz - {highCutoffKhz} kHz]</span>
                    <span className="text-primary font-bold">{transducerModel} ({sensorPhysics.centerFreqKhz} kHz)</span>
                  </div>

                  <div className="h-28 w-full">
                    <svg viewBox="0 0 320 100" className="w-full h-full select-none">
                      {/* Grid */}
                      <line x1="0" y1="50" x2="320" y2="50" stroke="#1c1c28" strokeWidth="0.8" strokeDasharray="2,2" />
                      <line x1="160" y1="0" x2="160" y2="100" stroke="#1c1c28" strokeWidth="0.8" strokeDasharray="2,2" />

                      {/* Passband Envelope */}
                      <path
                        d={`M 10 90 Q 40 85 60 25 L 220 25 Q 260 85 300 90`}
                        fill="none"
                        stroke="#FF5500"
                        strokeWidth="2"
                      />
                      <path
                        d={`M 10 90 Q 40 85 60 25 L 220 25 Q 260 85 300 90 L 300 100 L 10 100 Z`}
                        fill="#FF5500"
                        opacity="0.1"
                      />

                      {/* Resonant center marker */}
                      <line x1="160" y1="15" x2="160" y2="90" stroke="#FF5500" strokeWidth="1" strokeDasharray="2,2" />
                      <text x="160" y="12" fill="#FF5500" fontSize="7.5" fontFamily="monospace" textAnchor="middle" fontWeight="bold">
                        f₀: {sensorPhysics.centerFreqKhz} kHz
                      </text>

                      {/* Freq labels */}
                      <text x="10" y="96" fill="#71717a" fontSize="7" fontFamily="monospace">0 kHz</text>
                      <text x="60" y="96" fill="#71717a" fontSize="7" fontFamily="monospace">{lowCutoffKhz}k</text>
                      <text x="220" y="96" fill="#71717a" fontSize="7" fontFamily="monospace">{highCutoffKhz}k</text>
                      <text x="310" y="96" fill="#71717a" fontSize="7" fontFamily="monospace" textAnchor="end">500k</text>
                    </svg>
                  </div>
                </div>

                <Button
                  size="sm"
                  onClick={() => showToast("Acoustic DAQ hardware parameters calibrated.")}
                  className="w-full text-xs font-semibold gap-1.5 bg-[#FF5500] hover:bg-[#E54B00] text-white cursor-pointer"
                >
                  <Check className="w-3.5 h-3.5" />
                  Save Sensor Calibration
                </Button>

              </div>
            </div>
          </Card>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* TAB 2: TDA HYPERPARAMETERS (Takens & Topological Reconstruction) */}
      {/* ------------------------------------------------------------- */}
      {activeTab === "pipeline" && (
        <Card className="border border-border bg-card p-6 shadow-xl space-y-6">
          <CardHeader className="p-0 pb-4 border-b border-border/50">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base font-bold text-foreground">
                  Topological Machine Learning Hyperparameters
                </CardTitle>
                <CardDescription className="text-xs mt-0.5">
                  Takens delay-coordinate embedding, GUDHI simplicial filtration, and BOCD changepoint hazard rates
                </CardDescription>
              </div>
              <Badge variant="outline" className="font-mono text-xs border-border text-muted-foreground">
                GUDHI &bull; PyBOCD
              </Badge>
            </div>
          </CardHeader>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left Column (7 cols): Hyperparameter Controls */}
            <div className="lg:col-span-7 space-y-5 text-xs">
              
              {/* Takens Time Delay (tau) */}
              <div className="space-y-2">
                <div className="flex items-center justify-between font-mono text-[11px]">
                  <span className="text-muted-foreground">Time Delay (τ) [First Minimum of AMI]:</span>
                  <span className="text-primary font-bold text-xs">τ = {timeDelayTau} samples ({tdaPhysics.deltaTUs} µs)</span>
                </div>
                <input
                  type="range"
                  min={1}
                  max={12}
                  step={1}
                  value={timeDelayTau}
                  onChange={(e) => setTimeDelayTau(Number(e.target.value))}
                  className="w-full accent-primary cursor-pointer h-1.5 bg-muted rounded-lg"
                />
                <div className="flex justify-between text-[10px] text-muted-foreground font-mono">
                  <span>1 sample (0.2 µs)</span>
                  <span className="text-primary font-bold">4 samples (Quarter-cycle ~90°)</span>
                  <span>12 samples (2.4 µs)</span>
                </div>
              </div>

              {/* Embedding Dimension (d) */}
              <div className="space-y-2">
                <div className="flex items-center justify-between font-mono text-[11px]">
                  <span className="text-muted-foreground">Embedding Dimension (d) [False Nearest Neighbors]:</span>
                  <span className="text-foreground font-bold text-xs">d = {embeddingDimD} Dimensions</span>
                </div>
                <input
                  type="range"
                  min={2}
                  max={6}
                  step={1}
                  value={embeddingDimD}
                  onChange={(e) => setEmbeddingDimD(Number(e.target.value))}
                  className="w-full accent-primary cursor-pointer h-1.5 bg-muted rounded-lg"
                />
                <div className="flex justify-between text-[10px] text-muted-foreground font-mono">
                  <span>d=2 (Plane)</span>
                  <span className="text-foreground font-bold">d=3 (Phase Space Attractor)</span>
                  <span>d=6 (High-dim)</span>
                </div>
              </div>

              {/* Simplicial Complex Type */}
              <div className="grid grid-cols-2 gap-4 pt-2 border-t border-border/40">
                <div className="space-y-1.5">
                  <label className="font-mono text-muted-foreground block text-[11px]">
                    Simplicial Complex Type:
                  </label>
                  <select
                    value={complexType}
                    onChange={(e) => setComplexType(e.target.value as any)}
                    className="w-full bg-muted/40 border border-border rounded-lg px-3 py-2 font-mono text-xs text-foreground focus:outline-none cursor-pointer"
                  >
                    <option value="vietoris-rips">Vietoris-Rips Complex VR(X, ε)</option>
                    <option value="alpha">Alpha Complex α(X, ε) [Exact Voronoi]</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between font-mono text-[11px]">
                    <span className="text-muted-foreground">Max Filtration (εmax):</span>
                    <span className="text-foreground font-bold">{filtrationMaxRadius}σ</span>
                  </div>
                  <input
                    type="range"
                    min={0.5}
                    max={3.0}
                    step={0.1}
                    value={filtrationMaxRadius}
                    onChange={(e) => setFiltrationMaxRadius(Number(e.target.value))}
                    className="w-full accent-primary cursor-pointer h-1.5 bg-muted rounded-lg"
                  />
                </div>
              </div>

              {/* Min Persistence Threshold & BOCD Hazard Rate */}
              <div className="grid grid-cols-2 gap-4 pt-2 border-t border-border/40">
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between font-mono text-[11px]">
                    <span className="text-muted-foreground">Min Persistence (Pthresh):</span>
                    <span className="text-foreground font-bold">{minPersistenceThreshold}</span>
                  </div>
                  <input
                    type="range"
                    min={0.04}
                    max={0.25}
                    step={0.01}
                    value={minPersistenceThreshold}
                    onChange={(e) => setMinPersistenceThreshold(Number(e.target.value))}
                    className="w-full accent-primary cursor-pointer h-1.5 bg-muted rounded-lg"
                  />
                  <span className="text-[10px] text-muted-foreground block">
                    Prunes topological noise (lifetime &lt; {minPersistenceThreshold})
                  </span>
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between font-mono text-[11px]">
                    <span className="text-muted-foreground">BOCD Constant Hazard (λ):</span>
                    <span className="text-foreground font-bold">λ = {bocdHazardRate}</span>
                  </div>
                  <input
                    type="range"
                    min={50}
                    max={500}
                    step={25}
                    value={bocdHazardRate}
                    onChange={(e) => setBocdHazardRate(Number(e.target.value))}
                    className="w-full accent-primary cursor-pointer h-1.5 bg-muted rounded-lg"
                  />
                  <span className="text-[10px] text-muted-foreground block">
                    Higher λ reduces false changepoint triggers from traffic
                  </span>
                </div>
              </div>

            </div>

            {/* Right Column (5 cols): Mathematical Attractor & Embedding Sync Card */}
            <div className="lg:col-span-5 space-y-4">
              <div className="p-4 rounded-xl border border-border bg-muted/20 space-y-3 font-mono text-xs">
                <div className="flex items-center justify-between pb-2 border-b border-border/40">
                  <span className="font-bold text-foreground flex items-center gap-1.5">
                    <Cpu className="w-3.5 h-3.5 text-primary" />
                    Takens Dynamical Reconstruction
                  </span>
                  <Badge variant="outline" className="text-[10px] border-border text-foreground bg-muted/40 font-mono">
                    d={embeddingDimD}, τ={timeDelayTau}
                  </Badge>
                </div>

                <div className="p-3 rounded-lg bg-[#0d0d12] border border-border/80 text-[11px] text-primary leading-relaxed">
                  v(t) = [x(t), x(t + {timeDelayTau}), x(t + {timeDelayTau * 2}){embeddingDimD > 3 ? `, ... x(t + ${(embeddingDimD - 1) * timeDelayTau})` : ""}]
                </div>

                <div className="space-y-2 text-[11px]">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Coordinate Time Separation:</span>
                    <span className="font-bold text-foreground">Δt = {tdaPhysics.deltaTUs} µs</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Phase Orthogonality (θ):</span>
                    <span className="font-bold text-foreground">{tdaPhysics.phaseDeg}&deg; (Quarter-Cycle)</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">False Nearest Neighbors:</span>
                    <span className="font-bold text-primary">{tdaPhysics.fnnResidualPercent}% (Unfolded)</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Homology Betti Dimensions:</span>
                    <span className="font-bold text-foreground">H₀ (Components), H₁ (Cycles)</span>
                  </div>
                </div>
              </div>

              <Button
                size="sm"
                onClick={() => showToast("TDA pipeline hyperparameters synchronized.")}
                className="w-full text-xs font-semibold gap-1.5 bg-[#FF5500] hover:bg-[#E54B00] text-white cursor-pointer"
              >
                <Check className="w-3.5 h-3.5" />
                Update TDA Pipeline Defaults
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* ------------------------------------------------------------- */}
      {/* TAB 3: ALERT TRIGGERS (Tri-Branch Consensus & Telemetry)       */}
      {/* ------------------------------------------------------------- */}
      {activeTab === "notifications" && (
        <Card className="border border-border bg-card p-6 shadow-xl space-y-6">
          <CardHeader className="p-0 pb-4 border-b border-border/50">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base font-bold text-foreground">
                  Automated Precursor Alert Triggers &amp; Telemetry Dispatch
                </CardTitle>
                <CardDescription className="text-xs mt-0.5">
                  Tri-branch consensus thresholds for shear slip precursor alarms and external industrial integration
                </CardDescription>
              </div>
              <Badge variant="outline" className="font-mono text-xs border-border text-muted-foreground">
                Consensus: 2/3 Engine
              </Badge>
            </div>
          </CardHeader>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left Column (7 cols): Threshold Sliders */}
            <div className="lg:col-span-7 space-y-5 text-xs">
              
              {/* Branch 1: Topological Loop Persistence */}
              <div className="p-3.5 rounded-xl border border-border bg-muted/20 space-y-2">
                <div className="flex items-center justify-between font-mono text-[11px]">
                  <span className="font-bold text-foreground">Branch 1: Persistent H₁ Loop Opening</span>
                  <span className="text-primary font-bold">Persistence &ge; {h1LoopThreshold.toFixed(2)}</span>
                </div>
                <input
                  type="range"
                  min={0.20}
                  max={0.80}
                  step={0.05}
                  value={h1LoopThreshold}
                  onChange={(e) => setH1LoopThreshold(Number(e.target.value))}
                  className="w-full accent-primary cursor-pointer h-1.5 bg-muted rounded-lg"
                />
                <span className="text-[10px] text-muted-foreground block">
                  Confirms irreversible topological hole formation in Takens phase space
                </span>
              </div>

              {/* Branch 2: BOCD Changepoint Posterior */}
              <div className="p-3.5 rounded-xl border border-border bg-muted/20 space-y-2">
                <div className="flex items-center justify-between font-mono text-[11px]">
                  <span className="font-bold text-foreground">Branch 2: Online BOCD Changepoint Probability</span>
                  <span className="text-foreground font-bold">P(rt = 0) &ge; {bocdProbabilityThreshold}%</span>
                </div>
                <input
                  type="range"
                  min={60}
                  max={98}
                  step={2}
                  value={bocdProbabilityThreshold}
                  onChange={(e) => setBocdProbabilityThreshold(Number(e.target.value))}
                  className="w-full accent-primary cursor-pointer h-1.5 bg-muted rounded-lg"
                />
                <span className="text-[10px] text-muted-foreground block">
                  Identifies abrupt non-stationary acoustic energy rate shifts
                </span>
              </div>

              {/* Branch 3: Conv1D Autoencoder Residual */}
              <div className="p-3.5 rounded-xl border border-border bg-muted/20 space-y-2">
                <div className="flex items-center justify-between font-mono text-[11px]">
                  <span className="font-bold text-foreground">Branch 3: Conv1D Autoencoder Residual Norm</span>
                  <span className="text-foreground font-bold">&epsilon; &ge; {conv1dResidualThreshold.toFixed(3)}</span>
                </div>
                <input
                  type="range"
                  min={0.080}
                  max={0.350}
                  step={0.010}
                  value={conv1dResidualThreshold}
                  onChange={(e) => setConv1dResidualThreshold(Number(e.target.value))}
                  className="w-full accent-primary cursor-pointer h-1.5 bg-muted rounded-lg"
                />
                <span className="text-[10px] text-muted-foreground block">
                  95th percentile reconstruction residual over baseline undamaged concrete
                </span>
              </div>

            </div>

            {/* Right Column (5 cols): Telemetry Dispatch & Test Simulator */}
            <div className="lg:col-span-5 space-y-4 text-xs font-mono">
              <div className="p-4 rounded-xl border border-border bg-card space-y-3">
                <span className="font-bold text-foreground block text-[11px] uppercase tracking-wider">
                  Telemetry Dispatch Endpoints
                </span>

                <div className="space-y-1">
                  <label className="text-[10px] text-muted-foreground block">Webhook Endpoint (HTTPS POST):</label>
                  <input
                    type="text"
                    value={webhookUrl}
                    onChange={(e) => setWebhookUrl(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-muted/30 border border-border rounded-lg text-xs font-mono text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] text-muted-foreground block">Industrial MQTT Topic:</label>
                  <input
                    type="text"
                    value={mqttTopic}
                    onChange={(e) => setMqttTopic(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-muted/30 border border-border rounded-lg text-xs font-mono text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>

                <div className="pt-2 border-t border-border/40 space-y-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleSimulateAlert}
                    disabled={isSimulatingAlert}
                    className="w-full text-xs font-semibold gap-1.5 border-border cursor-pointer"
                  >
                    <Send className="w-3.5 h-3.5 text-primary" />
                    {isSimulatingAlert ? "Dispatching Test Payload..." : "Send Test Alert Simulation"}
                  </Button>
                </div>
              </div>
            </div>

          </div>
        </Card>
      )}

      {/* ------------------------------------------------------------- */}
      {/* TAB 4: RESEARCHER & INSTITUTIONAL PROFILE                     */}
      {/* ------------------------------------------------------------- */}
      {activeTab === "profile" && (
        <Card className="border border-border bg-card p-6 shadow-xl space-y-6">
          <CardHeader className="p-0 pb-4 border-b border-border/50">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base font-bold text-foreground">
                  Researcher &amp; Institutional Diagnostics Profile
                </CardTitle>
                <CardDescription className="text-xs mt-0.5">
                  Affiliation, lead investigator credentials, and cryptographic audit signatures displayed on assessment reports
                </CardDescription>
              </div>
              <Badge variant="outline" className="font-mono text-xs border-border text-muted-foreground">
                Audit Verified
              </Badge>
            </div>
          </CardHeader>

          <form onSubmit={handleSaveProfile} className="space-y-4 pt-2 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="font-medium text-muted-foreground block text-[11px]">First Name:</label>
                <Input value={firstName} onChange={(e) => setFirstName(e.target.value)} />
              </div>
              <div className="space-y-1">
                <label className="font-medium text-muted-foreground block text-[11px]">Last Name:</label>
                <Input value={lastName} onChange={(e) => setLastName(e.target.value)} />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="font-medium text-muted-foreground block text-[11px]">Institutional Diagnostics Email:</label>
                <Input value={email} onChange={(e) => setEmail(e.target.value)} />
              </div>
              <div className="space-y-1">
                <label className="font-medium text-muted-foreground block text-[11px]">Diagnostics Division / Laboratory:</label>
                <Input value={department} onChange={(e) => setDepartment(e.target.value)} />
              </div>
            </div>

            <div className="space-y-1">
              <label className="font-medium text-muted-foreground block text-[11px]">
                NDT Certification / Professional Engineer License:
              </label>
              <Input value={ndtLicense} onChange={(e) => setNdtLicense(e.target.value)} />
              <span className="text-[10px] text-muted-foreground mt-0.5 block">
                Stamped on generated PDF inspection reports in compliance with EN 1330-9 and ASTM E1316-24
              </span>
            </div>

            <div className="p-3.5 rounded-xl border border-border bg-muted/20 space-y-1.5 font-mono text-[11px]">
              <span className="text-muted-foreground block">Cryptographic Audit Public Key (ECDSA P-256):</span>
              <span className="text-foreground font-bold block truncate">
                SHA256: 7f8a42c3e12d99b1c7a8b3e5f4d1e2a0b9c8d7e6f5a4b3c2d1e0f9a8b7c6d5e4
              </span>
            </div>

            <Button type="submit" size="sm" className="bg-[#FF5500] hover:bg-[#E54B00] text-white text-xs font-semibold cursor-pointer">
              Save Profile Changes
            </Button>
          </form>
        </Card>
      )}

    </div>
  );
}
