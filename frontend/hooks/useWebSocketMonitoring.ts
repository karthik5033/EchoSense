"use client";

import { useState, useEffect, useRef, useCallback } from "react";

export interface TelemetryFrame {
  type: string;
  session_id: string;
  timestamp: string;
  channel: string;
  amplitude_v: number;
  peak_frequency_khz: number;
  rms_energy: number;
  bocd_changepoint_prob: number;
  bocd_alarm: boolean;
  cdpi_score: number;
  is_precursor_hit: boolean;
  hit_id: string | null;
  crack_mode: string;
  lead_time_ms: number;
  waveform_chunk: number[];
}

export interface LiveHit {
  id: string;
  time: string;
  energy: string;
  frequency: string;
  classifiedMode: string;
  severity: "info" | "warning" | "critical";
  confidence: number;
}

export function useWebSocketMonitoring(
  sessionId = "live-monitor",
  channel = "CH-01",
  enabled = true
) {
  const [status, setStatus] = useState<"connecting" | "connected" | "disconnected">("disconnected");
  const [latestFrame, setLatestFrame] = useState<TelemetryFrame | null>(null);
  const [waveformBuffer, setWaveformBuffer] = useState<number[]>([]);
  const [liveHits, setLiveHits] = useState<LiveHit[]>([
    {
      id: "HIT-412",
      time: "23:59:12",
      energy: "0.84 V²·s",
      frequency: "148.6 kHz",
      classifiedMode: "Tensile Micro-Crack",
      severity: "info",
      confidence: 0.94,
    },
    {
      id: "HIT-411",
      time: "23:58:45",
      energy: "1.42 V²·s",
      frequency: "88.2 kHz",
      classifiedMode: "Shear Interface Slip",
      severity: "critical",
      confidence: 0.96,
    },
    {
      id: "HIT-410",
      time: "23:58:10",
      energy: "0.62 V²·s",
      frequency: "135.4 kHz",
      classifiedMode: "Tensile Micro-Crack",
      severity: "info",
      confidence: 0.91,
    },
  ]);

  const socketRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const connect = useCallback(() => {
    if (!enabled || typeof window === "undefined") return;

    const wsProtocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    // Default to localhost:8000 for backend gateway or window host
    const wsHost = process.env.NEXT_PUBLIC_WS_URL || "ws://localhost:8000";
    const wsUrl = `${wsHost}/ws/monitoring/${sessionId}`;

    try {
      const ws = new WebSocket(wsUrl);
      socketRef.current = ws;
      setStatus("connecting");

      ws.onopen = () => {
        setStatus("connected");
        ws.send(JSON.stringify({ channel }));
      };

      ws.onmessage = (event) => {
        try {
          const frame: TelemetryFrame = JSON.parse(event.data);
          setLatestFrame(frame);

          // Update rolling waveform buffer (retain last 180 points)
          if (frame.waveform_chunk && frame.waveform_chunk.length > 0) {
            setWaveformBuffer((prev) => {
              const next = [...prev, ...frame.waveform_chunk];
              return next.length > 180 ? next.slice(next.length - 180) : next;
            });
          }

          // If precursor hit event detected, add to live hits
          if (frame.is_precursor_hit && frame.hit_id) {
            const isShear = frame.crack_mode.includes("Shear");
            const isMixed = frame.crack_mode.includes("Mixed");
            const newHit: LiveHit = {
              id: frame.hit_id,
              time: frame.timestamp,
              energy: `${frame.rms_energy} V²·s`,
              frequency: `${frame.peak_frequency_khz} kHz`,
              classifiedMode: frame.crack_mode,
              severity: isShear ? "critical" : (isMixed ? "warning" : "info"),
              confidence: frame.bocd_changepoint_prob,
            };

            setLiveHits((prev) => [newHit, ...prev.slice(0, 19)]);
          }
        } catch (e) {
          console.error("Failed to parse telemetry frame:", e);
        }
      };

      ws.onclose = () => {
        setStatus("disconnected");
        // Reconnect after 3 seconds if enabled
        if (enabled) {
          reconnectTimeoutRef.current = setTimeout(connect, 3000);
        }
      };

      ws.onerror = () => {
        setStatus("disconnected");
        ws.close();
      };
    } catch (err) {
      console.warn("WebSocket connection failure, scheduling retry...", err);
      if (enabled) {
        reconnectTimeoutRef.current = setTimeout(connect, 4000);
      }
    }
  }, [enabled, sessionId, channel]);

  useEffect(() => {
    connect();
    return () => {
      if (reconnectTimeoutRef.current) clearTimeout(reconnectTimeoutRef.current);
      if (socketRef.current) socketRef.current.close();
    };
  }, [connect]);

  const sendCommand = useCallback((cmd: object) => {
    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify(cmd));
    }
  }, []);

  return {
    status,
    latestFrame,
    waveformBuffer,
    liveHits,
    sendCommand,
  };
}
