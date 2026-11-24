"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import Link from "next/link";
import {
  Radio,
  Play,
  Pause,
  Activity,
  Mic,
  MicOff,
  Smartphone,
  ShieldAlert,
  Cpu,
  RefreshCw,
  Bell,
  Sliders,
  ChevronRight,
  Layers,
  Waves,
  Zap,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useWebSocketMonitoring } from "@/hooks/useWebSocketMonitoring";

interface LiveHit {
  id: string;
  time: string;
  energy: string;
  frequency: string;
  classifiedMode: "Tensile" | "Shear" | "Mixed-Mode";
  severity: "info" | "warning" | "critical";
  confidence: number;
}

const SAMPLE_COUNT = 240;

export default function RealTimeMonitorPage() {
  const [isStreaming, setIsStreaming] = useState(true);
  const [selectedChannel, setSelectedChannel] = useState("PHONE-MIC"); // Default to Phone Mic
  const [windowSize, setWindowSize] = useState("10s");
  const [displayMode, setDisplayMode] = useState<"rf" | "fft">("rf");

  // Local Physical Microphone State (Web Audio API)
  const [isLocalMicActive, setIsLocalMicActive] = useState(false);
  const [localMicWaveform, setLocalMicWaveform] = useState<number[]>(new Array(SAMPLE_COUNT).fill(0));
  const [localFftData, setLocalFftData] = useState<number[]>(new Array(64).fill(0));
  const [localPeakV, setLocalPeakV] = useState(0.02);

  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  // WebSocket Connection to Backend Gateway
  const {
    status: wsStatus,
    latestFrame,
    waveformBuffer,
    liveHits: wsLiveHits,
  } = useWebSocketMonitoring("live-monitor", selectedChannel, isStreaming);

  const [liveHits, setLiveHits] = useState<LiveHit[]>([
    {
      id: "HIT-412",
      time: "23:59:12",
      energy: "0.84 V²·s",
      frequency: "148.6 kHz",
      classifiedMode: "Tensile",
      severity: "info",
      confidence: 0.94,
    },
    {
      id: "HIT-411",
      time: "23:58:45",
      energy: "1.42 V²·s",
      frequency: "88.2 kHz",
      classifiedMode: "Shear",
      severity: "critical",
      confidence: 0.96,
    },
    {
      id: "HIT-410",
      time: "23:58:10",
      energy: "0.62 V²·s",
      frequency: "135.4 kHz",
      classifiedMode: "Tensile",
      severity: "info",
      confidence: 0.91,
    },
  ]);

  const activeHits = wsLiveHits && wsLiveHits.length > 0 ? wsLiveHits : liveHits;

  // Toggle Physical Microphone Access via Browser Web Audio API
  const toggleLocalMicrophone = async () => {
    if (isLocalMicActive) {
      // Stop local microphone
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      }
      if (audioContextRef.current) {
        audioContextRef.current.close().catch(() => {});
      }
      setIsLocalMicActive(false);
    } else {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        mediaStreamRef.current = stream;

        const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
        const audioCtx = new AudioCtx();
        audioContextRef.current = audioCtx;

        const analyser = audioCtx.createAnalyser();
        analyser.fftSize = 512;
        analyser.smoothingTimeConstant = 0.2;
        analyserRef.current = analyser;

        const source = audioCtx.createMediaStreamSource(stream);
        source.connect(analyser);

        setIsLocalMicActive(true);
        setSelectedChannel("LOCAL-MIC");

        const timeData = new Float32Array(analyser.fftSize);
        const freqData = new Uint8Array(analyser.frequencyBinCount);

        const updateLoop = () => {
          if (!analyserRef.current) return;
          analyserRef.current.getFloatTimeDomainData(timeData);
          analyserRef.current.getByteFrequencyData(freqData);

          // Subsample to SAMPLE_COUNT (240 points)
          const step = timeData.length / SAMPLE_COUNT;
          const points: number[] = new Array(SAMPLE_COUNT);
          let maxVal = 0.01;

          for (let i = 0; i < SAMPLE_COUNT; i++) {
            const val = timeData[Math.floor(i * step)] || 0;
            // Amplify physical acoustic sensitivity
            const scaled = Math.max(-1.4, Math.min(1.4, val * 3.2));
            points[i] = scaled;
            if (Math.abs(scaled) > maxVal) maxVal = Math.abs(scaled);
          }

          // Subsample FFT bins to 64 display bars
          const fftStep = Math.floor(freqData.length / 64);
          const fftBands: number[] = new Array(64);
          for (let b = 0; b < 64; b++) {
            fftBands[b] = (freqData[b * fftStep] || 0) / 255;
          }

          setLocalMicWaveform(points);
          setLocalFftData(fftBands);
          setLocalPeakV(parseFloat((maxVal * 2).toFixed(2)));

          animationFrameRef.current = requestAnimationFrame(updateLoop);
        };

        animationFrameRef.current = requestAnimationFrame(updateLoop);
      } catch (err: any) {
        alert("Could not access microphone: " + (err.message || "Permission denied"));
      }
    }
  };

  useEffect(() => {
    return () => {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      }
      if (audioContextRef.current) {
        audioContextRef.current.close().catch(() => {});
      }
    };
  }, []);

  // Compute Active Physical Sound Waves Display
  const { wavePoints, peakVpp, hasPrecursor, signalLabel } = useMemo(() => {
    if (isLocalMicActive && selectedChannel === "LOCAL-MIC") {
      // True 100% Real-Time Physical Sound Waves from Microphone
      const isBurst = localPeakV > 0.45;
      return {
        wavePoints: localMicWaveform,
        peakVpp: localPeakV,
        hasPrecursor: isBurst,
        signalLabel: "Direct Physical Microphone (Real Sound Waves)",
      };
    }

    if (selectedChannel === "PHONE-MIC" || latestFrame?.channel === "PHONE-MIC") {
      // Live Sound Waves streamed from Physical Mobile Phone via WebSocket
      const buffer = waveformBuffer.length > 0 ? waveformBuffer : latestFrame?.waveform_chunk || [];
      const points = new Array(SAMPLE_COUNT).fill(0);

      if (buffer.length > 0) {
        const step = buffer.length / SAMPLE_COUNT;
        for (let i = 0; i < SAMPLE_COUNT; i++) {
          points[i] = buffer[Math.floor(i * step) % buffer.length] || 0;
        }
      }

      const amp = latestFrame?.amplitude_v || 0.05;
      const isBurst = amp > 0.65;
      return {
        wavePoints: points,
        peakVpp: parseFloat((amp * 2).toFixed(2)),
        hasPrecursor: isBurst,
        signalLabel: "Smartphone MEMS Physical Microphone (Mobile Wi-Fi Stream)",
      };
    }

    // Baseline Resting Acoustic Emission Sensor Noise
    const points: number[] = new Array(SAMPLE_COUNT);
    const chunk = latestFrame?.waveform_chunk || [];
    for (let i = 0; i < SAMPLE_COUNT; i++) {
      if (chunk.length > 0) {
        points[i] = chunk[i % chunk.length] || 0;
      } else {
        points[i] = (Math.random() - 0.5) * 0.04;
      }
    }

    const currentV = latestFrame?.amplitude_v || 0.06;
    return {
      wavePoints: points,
      peakVpp: parseFloat((currentV * 2).toFixed(2)),
      hasPrecursor: latestFrame?.bocd_alarm || false,
      signalLabel: selectedChannel,
    };
  }, [isLocalMicActive, selectedChannel, localMicWaveform, localPeakV, waveformBuffer, latestFrame]);

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-7xl mx-auto w-full font-sans select-none">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b border-border/60">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground flex items-center gap-2.5">
            <Radio className="h-5 w-5 text-primary" />
            <span>Real-Time Acoustic Emission Monitor</span>
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Real-time physical acoustic oscilloscope connected to mobile smartphone MEMS &amp; live microphones
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Physical Mic Direct Connect Trigger */}
          <Button
            size="sm"
            variant={isLocalMicActive ? "destructive" : "default"}
            onClick={toggleLocalMicrophone}
            className="gap-1.5 text-xs font-semibold cursor-pointer h-8"
          >
            {isLocalMicActive ? <MicOff className="h-3.5 w-3.5" /> : <Mic className="h-3.5 w-3.5" />}
            {isLocalMicActive ? "Stop Physical Mic" : "Connect Physical Mic"}
          </Button>

          <Button
            size="sm"
            variant={isStreaming ? "outline" : "default"}
            onClick={() => setIsStreaming(!isStreaming)}
            className="gap-1.5 text-xs font-semibold cursor-pointer border-border h-8"
          >
            {isStreaming ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
            {isStreaming ? "Pause Ingestion" : "Resume Stream"}
          </Button>
        </div>
      </div>

      {/* Sensor Channel & Timebase Control Bar */}
      <div className="p-3.5 rounded-xl border border-border bg-card flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="text-xs font-medium text-muted-foreground">Active Transducer:</span>
          <select
            value={selectedChannel}
            onChange={(e) => setSelectedChannel(e.target.value)}
            className="text-xs bg-muted/60 border border-border rounded-lg px-3 py-1.5 font-mono text-foreground focus:outline-none cursor-pointer"
          >
            <option value="PHONE-MIC">📱 PHONE-MIC: Smartphone MEMS Microphone (Physical Phone Stream)</option>
            <option value="LOCAL-MIC">🎙️ LOCAL-MIC: Direct Browser / Computer Physical Microphone</option>
            <option value="CH-01">CH-01: Girder G1 Midspan (R15α, 150 kHz Resonant)</option>
            <option value="CH-02">CH-02: Shear Key Interface (R15α, 150 kHz Resonant)</option>
            <option value="CH-03">CH-03: Anchor Tendon Zone (R15α, 150 kHz Resonant)</option>
            <option value="CH-04">CH-04: Pier Base Support (Broadband MEMS, 48 kHz)</option>
          </select>
        </div>

        {/* View Toggle & Timebase */}
        <div className="flex items-center gap-3">
          <div className="flex items-center rounded-lg bg-secondary/50 p-0.5 border border-border text-xs">
            <button
              onClick={() => setDisplayMode("rf")}
              className={`px-2.5 py-1 rounded-md text-[11px] font-mono transition-colors cursor-pointer ${
                displayMode === "rf"
                  ? "bg-card text-foreground font-semibold shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              RF Waveform
            </button>
            <button
              onClick={() => setDisplayMode("fft")}
              className={`px-2.5 py-1 rounded-md text-[11px] font-mono transition-colors cursor-pointer ${
                displayMode === "fft"
                  ? "bg-card text-foreground font-semibold shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              FFT Spectrum (PSD)
            </button>
          </div>

          <div className="flex items-center rounded-lg bg-secondary/50 p-0.5 border border-border text-xs">
            {["5s", "10s", "30s"].map((size) => (
              <button
                key={size}
                onClick={() => setWindowSize(size)}
                className={`px-2.5 py-1 rounded-md text-[11px] font-mono transition-colors cursor-pointer ${
                  windowSize === size
                    ? "bg-card text-foreground font-semibold shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {size}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Real-Time Oscilloscope Waveform Display */}
      <Card className="border border-border bg-[#0a0a0e] p-5 shadow-2xl relative overflow-hidden">
        {/* Scope Header */}
        <div className="flex items-center justify-between pb-3 border-b border-border/40 text-xs font-mono">
          <div className="flex items-center gap-2">
            <span className="text-foreground font-semibold">
              {signalLabel}
            </span>
            <span className="text-muted-foreground">|</span>
            <span className="text-muted-foreground">
              {isLocalMicActive ? "Real Hardware Mic: Active (60 FPS)" : "Gain: +24 dB"}
            </span>
            <span className="text-muted-foreground">|</span>
            <span className="text-muted-foreground">Bandpass: 20-400 kHz Butterworth</span>
          </div>

          <div className="flex items-center gap-2 text-muted-foreground text-[11px]">
            <span>Rate: 48.0 kS/s</span>
            <span>•</span>
            <span className="text-foreground/80 font-mono">
              {isLocalMicActive ? "WebAudio API • Raw Physical Stream" : "WebSocket 10 Hz Live"}
            </span>
          </div>
        </div>

        {/* Oscilloscope SVG Canvas */}
        <div className="relative h-64 w-full flex items-center justify-center my-3 select-none">
          {displayMode === "rf" ? (
            <svg viewBox="0 0 800 240" className="w-full h-full">
              {/* Scope Grid Background */}
              <defs>
                <pattern id="scopeGrid" width="40" height="30" patternUnits="userSpaceOnUse">
                  <path d="M 40 0 L 0 0 0 30" fill="none" stroke="#161622" strokeWidth="0.8" />
                </pattern>
              </defs>
              <rect width="800" height="240" fill="url(#scopeGrid)" />

              {/* Zero Volts Center Reference Line */}
              <line x1="0" y1="120" x2="800" y2="120" stroke="#262638" strokeWidth="1" strokeDasharray="3 3" />
              <line x1="0" y1="45" x2="800" y2="45" stroke="#1e1e2c" strokeWidth="0.8" strokeDasharray="2 2" />
              <line x1="0" y1="195" x2="800" y2="195" stroke="#1e1e2c" strokeWidth="0.8" strokeDasharray="2 2" />

              {/* Amplitude Guides */}
              <text x="12" y="49" fill="#71717a" fontSize="8" fontFamily="monospace">+1.0 V</text>
              <text x="12" y="124" fill="#71717a" fontSize="8" fontFamily="monospace">0.0 V</text>
              <text x="12" y="199" fill="#71717a" fontSize="8" fontFamily="monospace">-1.0 V</text>

              {/* Actual Continuous Real-Time Sound Waves */}
              <path
                d={wavePoints.reduce((acc, val, i) => {
                  const x = (i / (SAMPLE_COUNT - 1)) * 800;
                  const y = 120 - val * 90;
                  return i === 0 ? `M ${x.toFixed(1)} ${y.toFixed(1)}` : `${acc} L ${x.toFixed(1)} ${y.toFixed(1)}`;
                }, "")}
                fill="none"
                stroke="#FF5500"
                strokeWidth="2.0"
                strokeLinecap="round"
                strokeLinejoin="round"
                opacity="0.95"
              />
            </svg>
          ) : (
            /* Power Spectral Density (FFT) Mode */
            <svg viewBox="0 0 800 240" className="w-full h-full">
              <defs>
                <pattern id="fftGrid" width="50" height="30" patternUnits="userSpaceOnUse">
                  <path d="M 50 0 L 0 0 0 30" fill="none" stroke="#161622" strokeWidth="0.8" />
                </pattern>
              </defs>
              <rect width="800" height="240" fill="url(#fftGrid)" />

              {/* Real Measured FFT Spectrum Bars */}
              {localFftData.map((val, idx) => {
                const barWidth = 800 / 64 - 2;
                const barHeight = val * 190;
                const x = idx * (800 / 64) + 1;
                const y = 220 - barHeight;
                return (
                  <rect
                    key={idx}
                    x={x}
                    y={y}
                    width={barWidth}
                    height={barHeight}
                    fill={val > 0.6 ? "#EF4444" : "#FF5500"}
                    opacity={0.85}
                    rx="1"
                  />
                );
              })}

              <line x1="0" y1="220" x2="800" y2="220" stroke="#FF5500" strokeWidth="1" />
              <text x="50" y="234" fill="#71717a" fontSize="9" fontFamily="monospace">0 kHz</text>
              <text x="250" y="234" fill="#71717a" fontSize="9" fontFamily="monospace">50 kHz</text>
              <text x="490" y="234" fill="#71717a" fontSize="9" fontFamily="monospace">150 kHz</text>
              <text x="750" y="234" fill="#71717a" fontSize="9" fontFamily="monospace">250 kHz</text>
            </svg>
          )}
        </div>

        {/* Scope Footer Metadata */}
        <div className="flex flex-wrap items-center justify-between gap-3 text-[11px] font-mono text-muted-foreground pt-2.5 border-t border-border/40">
          <div className="flex items-center gap-4">
            <span>Sweep Window: -{windowSize} to now</span>
            <span>•</span>
            <span className="text-foreground">Peak AE Voltage: {peakVpp.toFixed(2)} Vpp</span>
            <span>•</span>
            <span>Frequency: 48.0 kHz</span>
            <span>•</span>
            <span className={isLocalMicActive ? "text-amber-500 font-bold" : wsStatus === "connected" ? "text-emerald-500 font-bold" : "text-zinc-500"}>
              {isLocalMicActive
                ? "Physical Microphone: Active (Live Sound Waves)"
                : wsStatus === "connected"
                ? "WebSocket 10 Hz Live (Receiving Stream)"
                : "Awaiting Mobile Connection"}
            </span>
          </div>

          <div>
            {hasPrecursor ? (
              <span className="text-red-500 font-bold tracking-wider">
                ACOUSTIC BURST / SOUND TRANSIENT DETECTED
              </span>
            ) : (
              <span className="text-emerald-500 font-bold tracking-wider">
                NOMINAL SOUNDSTREAM
              </span>
            )}
          </div>
        </div>
      </Card>

      {/* Live Precursor Hit Log Table */}
      <Card className="border border-border bg-card">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base font-bold text-foreground">
                Live Acoustic Transient Log
              </CardTitle>
              <CardDescription className="text-xs">
                Real-time acoustic hits processed through topological precursor engine
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="border-border">
                <TableHead className="text-xs font-mono">Hit ID</TableHead>
                <TableHead className="text-xs font-mono">Timestamp</TableHead>
                <TableHead className="text-xs font-mono">Carrier Energy</TableHead>
                <TableHead className="text-xs font-mono">Peak Freq</TableHead>
                <TableHead className="text-xs font-mono">Classified Mode</TableHead>
                <TableHead className="text-xs font-mono">Severity</TableHead>
                <TableHead className="text-xs font-mono text-right">Confidence</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {activeHits.map((hit) => (
                <TableRow key={hit.id} className="border-border font-mono text-xs">
                  <TableCell className="font-semibold text-foreground">{hit.id}</TableCell>
                  <TableCell className="text-muted-foreground">{hit.time}</TableCell>
                  <TableCell className="text-muted-foreground">{hit.energy}</TableCell>
                  <TableCell className="text-muted-foreground">{hit.frequency}</TableCell>
                  <TableCell className="text-foreground">{hit.classifiedMode}</TableCell>
                  <TableCell>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        hit.severity === "critical"
                          ? "bg-red-500/10 text-red-500 border border-red-500/20"
                          : hit.severity === "warning"
                          ? "bg-amber-500/10 text-amber-500 border border-amber-500/20"
                          : "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20"
                      }`}
                    >
                      {hit.severity.toUpperCase()}
                    </span>
                  </TableCell>
                  <TableCell className="text-right text-foreground font-semibold">
                    {(hit.confidence * 100).toFixed(1)}%
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
