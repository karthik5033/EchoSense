"use client";

import React, { useState } from "react";
import { Crosshair, Sliders, ShieldCheck, Check } from "lucide-react";

export function LocalizationGeometryDiagram() {
  const [selectedSensor, setSelectedSensor] = useState<string>("CH-01");

  const sensorDetails: Record<string, { name: string; coord: string; role: string; delay: string }> = {
    "CH-01": {
      name: "CH-01: Midspan Transducer",
      coord: "x = 4.50m, z = 1.40m",
      role: "Reference sensor (t0 = 0.00 us, First Hit Arrival)",
      delay: "0.0 us",
    },
    "CH-02": {
      name: "CH-02: Shear Key Transducer",
      coord: "x = 2.00m, z = 1.40m",
      role: "Critical shear span monitoring",
      delay: "Delta-t_12 = -24.6 us",
    },
    "CH-03": {
      name: "CH-03: Anchor Tendon Transducer",
      coord: "x = 6.50m, z = 1.40m",
      role: "Post-tensioned tendon anchor zone",
      delay: "Delta-t_13 = +48.2 us",
    },
    "CH-04": {
      name: "CH-04: Pier Base MEMS Node",
      coord: "x = 8.00m, z = 0.00m",
      role: "Broadband vibration & support reaction",
      delay: "Delta-t_14 = +165.4 us",
    },
  };

  const active = sensorDetails[selectedSensor] || sensorDetails["CH-01"];

  return (
    <div className="space-y-6 select-none">
      <div className="rounded-xl border border-[#23232c] bg-[#0f0f14] p-5 sm:p-6 shadow-2xl space-y-5">
        <div className="flex items-center justify-between pb-3 border-b border-[#1f1f26]">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#FF5500]" />
            <span className="text-xs font-mono uppercase tracking-wider text-zinc-300 font-semibold">
              Hyperbolic Multilateration &amp; Wavefront Geometry (10.0m Prestressed Girder)
            </span>
          </div>
          <span className="text-[11px] font-mono text-emerald-400">
            Gauss-Newton Error: +/- 30.0 mm
          </span>
        </div>

        {/* 2D Girder Elevation SVG Visualization */}
        <div className="rounded-xl border border-[#22222b] bg-[#0c0c10] p-4 relative overflow-hidden">
          <svg viewBox="0 0 1000 280" className="w-full h-auto">
            {/* Background Grid Lines */}
            <defs>
              <pattern id="archGrid" width="50" height="25" patternUnits="userSpaceOnUse">
                <path d="M 50 0 L 0 0 0 25" fill="none" stroke="#181822" strokeWidth="0.8" />
              </pattern>
            </defs>
            <rect width="1000" height="280" fill="url(#archGrid)" />

            {/* Concrete Girder Outline (10.0m x 1.4m scaled to 900 x 140) */}
            <rect
              x="50"
              y="60"
              width="900"
              height="150"
              rx="4"
              fill="#14141c"
              stroke="#2e2e3c"
              strokeWidth="2"
            />

            {/* Top Flange / Web / Bottom Flange Guidelines */}
            <line x1="50" y1="90" x2="950" y2="90" stroke="#1e1e28" strokeWidth="1" strokeDasharray="4 4" />
            <line x1="50" y1="180" x2="950" y2="180" stroke="#1e1e28" strokeWidth="1" strokeDasharray="4 4" />

            {/* Parabolic Prestressed Tendon Profile (1,240 kN) */}
            <path
              d="M 50 85 Q 500 195 950 85"
              fill="none"
              stroke="#FF5500"
              strokeWidth="2.5"
              opacity="0.85"
            />
            <text x="500" y="200" fill="#FF5500" fontSize="10" fontFamily="monospace" textAnchor="middle">
              Parabolic Post-Tensioned Tendon Duct (1,240 kN)
            </text>

            {/* Support Roller / Pinned Seats */}
            <polygon points="40,210 60,210 50,225" fill="#404050" />
            <polygon points="940,210 960,210 950,225" fill="#404050" />
            <text x="50" y="240" fill="#71717a" fontSize="10" fontFamily="monospace" textAnchor="middle">
              Roller (x=0.0m)
            </text>
            <text x="950" y="240" fill="#71717a" fontSize="10" fontFamily="monospace" textAnchor="middle">
              Pinned (x=10.0m)
            </text>

            {/* Sensor 1: CH-01 (x=4.5m, scaled to 455, 60) */}
            <g
              onClick={() => setSelectedSensor("CH-01")}
              className="cursor-pointer group"
            >
              <circle cx="455" cy="60" r="8" fill="#10b981" stroke="#fff" strokeWidth="2" />
              <text x="455" y="45" fill="#10b981" fontSize="11" fontFamily="monospace" textAnchor="middle" fontWeight="bold">
                CH-01 (Midspan)
              </text>
            </g>

            {/* Sensor 2: CH-02 (x=2.0m, scaled to 230, 60) */}
            <g
              onClick={() => setSelectedSensor("CH-02")}
              className="cursor-pointer group"
            >
              <circle cx="230" cy="60" r="7" fill="#6366f1" stroke="#fff" strokeWidth="2" />
              <text x="230" y="45" fill="#818cf8" fontSize="11" fontFamily="monospace" textAnchor="middle" fontWeight="bold">
                CH-02 (Shear)
              </text>
            </g>

            {/* Sensor 3: CH-03 (x=6.5m, scaled to 635, 60) */}
            <g
              onClick={() => setSelectedSensor("CH-03")}
              className="cursor-pointer group"
            >
              <circle cx="635" cy="60" r="7" fill="#6366f1" stroke="#fff" strokeWidth="2" />
              <text x="635" y="45" fill="#818cf8" fontSize="11" fontFamily="monospace" textAnchor="middle" fontWeight="bold">
                CH-03 (Anchor)
              </text>
            </g>

            {/* Sensor 4: CH-04 Pier (x=8.0m, scaled to 770, 210) */}
            <g
              onClick={() => setSelectedSensor("CH-04")}
              className="cursor-pointer group"
            >
              <circle cx="770" cy="210" r="7" fill="#f59e0b" stroke="#fff" strokeWidth="2" />
              <text x="770" y="235" fill="#fbbf24" fontSize="11" fontFamily="monospace" textAnchor="middle" fontWeight="bold">
                CH-04 (Pier MEMS)
              </text>
            </g>

            {/* Acoustic Wavefront Circular Rings Emitted from Precursor Epicenter (x=4.2m -> 428, z=0.35m -> 172) */}
            <circle cx="428" cy="172" r="30" fill="none" stroke="#FF5500" strokeWidth="1" strokeDasharray="3 3" opacity="0.6" />
            <circle cx="428" cy="172" r="65" fill="none" stroke="#FF5500" strokeWidth="1.2" strokeDasharray="4 4" opacity="0.45" />
            <circle cx="428" cy="172" r="110" fill="none" stroke="#FF5500" strokeWidth="1.5" strokeDasharray="5 5" opacity="0.3" />

            {/* Solved Precursor Focal Epicenter */}
            <circle cx="428" cy="172" r="5" fill="#FF5500" stroke="#ffffff" strokeWidth="2" />
            <circle cx="428" cy="172" r="12" fill="#FF5500" opacity="0.2" className="animate-ping" />
            
            {/* Focal Point Callout Box */}
            <rect x="360" y="105" width="145" height="42" rx="6" fill="#181822" stroke="#FF5500" strokeWidth="1.5" />
            <text x="432" y="122" fill="#ffffff" fontSize="10" fontFamily="sans-serif" textAnchor="middle" fontWeight="bold">
              PRECURSOR EPICENTER
            </text>
            <text x="432" y="137" fill="#10b981" fontSize="9" fontFamily="monospace" textAnchor="middle">
              Solved: x=4.218m, z=0.362m
            </text>
          </svg>
        </div>

        {/* Selected Sensor Quick Info Box */}
        <div className="p-4 rounded-xl border border-[#24242e] bg-[#14141a] flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-1">
            <span className="text-[10px] font-mono text-[#FF5500] uppercase font-bold">
              Sensor Node Inspection
            </span>
            <h4 className="text-sm font-bold text-white">{active.name}</h4>
            <p className="text-xs text-zinc-400 font-sans">{active.role}</p>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs font-mono text-zinc-300 bg-[#1c1c24] border border-[#2b2b36] px-3 py-1.5 rounded-lg">
              Coordinates: {active.coord}
            </span>
            <span className="text-xs font-mono text-[#FF5500] bg-[#FF5500]/10 border border-[#FF5500]/30 px-3 py-1.5 rounded-lg">
              Arrival: {active.delay}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

