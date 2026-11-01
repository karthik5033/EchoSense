"use client";

import React from "react";
import Link from "next/link";
import { ChevronRight, Database, ArrowRight, BookOpen, ShieldCheck, FileJson } from "lucide-react";
import { AppLogo } from "@/components/ui/AppLogo";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

const CONTRACT_SCHEMAS = [
  {
    name: "AcousticBurstEventContract",
    version: "1.0.0",
    desc: "Strict schema definition for segmented acoustic emission bursts captured by smartphone MEMS microphones.",
    fields: [
      { name: "event_id", type: "string (UUID)", required: true, desc: "Unique acoustic burst slice identifier" },
      { name: "signal_id", type: "string (UUID)", required: true, desc: "Parent continuous audio recording ID" },
      { name: "sample_rate", type: "integer (Hz)", required: true, desc: "Standardized sampling rate (e.g. 48,000 Hz)" },
      { name: "start_sample", type: "integer", required: true, desc: "Onset sample index determined by STA/LTA trigger" },
      { name: "duration_samples", type: "integer", required: true, desc: "Event length (e.g. 1,000 samples)" },
      { name: "peak_amplitude", type: "float", required: true, desc: "Peak absolute normalized amplitude [-1.0, 1.0]" },
      { name: "sta_lta_ratio", type: "float", required: true, desc: "STA/LTA energy ratio at trigger trigger point" },
    ],
  },
  {
    name: "TopologicalVectorContract",
    version: "1.0.0",
    desc: "Fixed-length numerical vector representation vectorized from GUDHI persistence diagrams.",
    fields: [
      { name: "vector_id", type: "string (UUID)", required: true, desc: "Reference ID of vector representation" },
      { name: "embedding_tau", type: "integer", required: true, desc: "Takens delay parameter via AMI" },
      { name: "embedding_dim", type: "integer", required: true, desc: "Takens embedding dimension via FNN" },
      { name: "persistent_entropy_h0", type: "float", required: true, desc: "Shannon entropy of H0 connected components" },
      { name: "persistent_entropy_h1", type: "float", required: true, desc: "Shannon entropy of H1 topological 1-cycles" },
      { name: "landscape_layers", type: "Array<float> [500]", required: true, desc: "5 layers of persistence landscapes (100 bins each)" },
      { name: "persistence_image", type: "Array<float> [400]", required: true, desc: "20x20 Gaussian smoothed persistence image" },
    ],
  },
  {
    name: "BOCDTelemetryFrameContract",
    version: "1.0.0",
    desc: "Streaming WebSocket message format for live structural changepoint detection.",
    fields: [
      { name: "timestamp", type: "float (Epoch s)", required: true, desc: "Acquisition timestamp" },
      { name: "seq", type: "integer", required: true, desc: "Sequential packet counter" },
      { name: "bocd_probability", type: "float [0.0 - 1.0]", required: true, desc: "Posterior changepoint probability P(r_t = 0)" },
      { name: "autoencoder_mse", type: "float", required: true, desc: "Reconstruction error residue" },
      { name: "alarm_status", type: "enum: NOMINAL | WARNING | CRITICAL", required: true, desc: "Structural risk assessment" },
    ],
  },
];

export default function DataContractsPage() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 flex items-center justify-between px-6 py-4 bg-background/80 backdrop-blur-md border-b border-border/60">
        <div className="flex items-center gap-4">
          <Link href="/" className="hover:opacity-90">
            <AppLogo size="md" />
          </Link>
          <div className="hidden sm:flex items-center gap-1.5 text-xs text-muted-foreground border-l border-border pl-4">
            <Link href="/docs" className="hover:text-foreground">
              Documentation
            </Link>
            <ChevronRight className="h-3 w-3" />
            <span className="text-foreground font-semibold">TDA Data Contracts</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link href="/docs">
            <Button variant="ghost" size="sm" className="text-xs">
              API Docs
            </Button>
          </Link>
          <Link href="/dashboard">
            <Button size="sm" className="gap-2 text-xs bg-emerald-600 hover:bg-emerald-500 text-white cursor-pointer">
              Launch Dashboard
              <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </Link>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-5xl mx-auto px-4 py-12 w-full space-y-8">
        <div className="space-y-3">
          <Badge variant="outline" className="font-mono text-xs text-emerald-400 border-emerald-500/30">
            Schema Definitions
          </Badge>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            Topological &amp; Acoustic Data Contracts
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed max-w-2xl">
            Strict field specifications and types for signal payloads, persistence diagrams, and
            real-time changepoint telemetry frames.
          </p>
        </div>

        {/* Schemas List */}
        <div className="space-y-6">
          {CONTRACT_SCHEMAS.map((schema, sIdx) => (
            <Card key={sIdx} className="border border-border bg-card">
              <CardHeader className="border-b border-border/50 py-4 px-6 flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-base font-bold text-foreground flex items-center gap-2">
                    <FileJson className="h-4 w-4 text-emerald-500" />
                    {schema.name}
                  </CardTitle>
                  <CardDescription className="text-xs mt-1">{schema.desc}</CardDescription>
                </div>
                <Badge variant="outline" className="font-mono text-xs">
                  v{schema.version}
                </Badge>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y divide-border/60">
                  {schema.fields.map((field, fIdx) => (
                    <div key={fIdx} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-foreground">{field.name}</span>
                          {field.required && (
                            <span className="text-[10px] text-red-500 font-semibold uppercase">
                              Required
                            </span>
                          )}
                        </div>
                        <p className="text-muted-foreground text-[11px]">{field.desc}</p>
                      </div>
                      <span className="font-mono text-[11px] text-emerald-400 bg-muted/40 px-2 py-0.5 rounded border border-border shrink-0">
                        {field.type}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </main>
    </div>
  );
}
