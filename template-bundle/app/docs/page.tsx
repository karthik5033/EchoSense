"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  BookOpen,
  Search,
  ChevronRight,
  Terminal,
  FileCode,
  Copy,
  Check,
  ExternalLink,
  ArrowRight,
  Layers,
  Database,
  Cpu,
} from "lucide-react";
import { AppLogo } from "@/components/ui/AppLogo";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

const ENDPOINTS = [
  {
    method: "POST",
    path: "/api/v1/signals/upload",
    summary: "Upload raw acoustic emission signal (.wav, .mat)",
    desc: "Accepts multipart/form-data audio uploads with client-side chunking, SHA-256 deduplication and automated STA/LTA segmentation.",
    response: `{
  "signal_id": "8f3b23e4-d55a-4632-9cb4-14f7b2331561",
  "filename": "girder_specimen_3_load_cycle_12.wav",
  "sample_rate": 48000,
  "duration_seconds": 12.45,
  "total_samples": 597600,
  "detected_events_count": 84,
  "status": "READY_FOR_ANALYSIS"
}`,
  },
  {
    method: "POST",
    path: "/api/v1/analysis/run",
    summary: "Trigger asynchronous TDA & ML pipeline",
    desc: "Enqueues Celery task to execute Takens delay embedding, GUDHI Vietoris-Rips filtration, RF classification, and BOCD changepoints.",
    response: `{
  "run_id": "b786c2aa-9f93-41bb-bcf4-617834bc67d8",
  "status": "QUEUED",
  "queue_position": 1,
  "estimated_duration_seconds": 14.5
}`,
  },
  {
    method: "GET",
    path: "/api/v1/analysis/{run_id}/results",
    summary: "Retrieve persistence diagrams, landscapes & predictions",
    desc: "Returns H0/H1 birth-death pairs, 924-dim topological feature vector, Random Forest crack prediction, and BOCD changepoint probabilities.",
    response: `{
  "run_id": "b786c2aa-9f93-41bb-bcf4-617834bc67d8",
  "status": "COMPLETED",
  "execution_time_seconds": 12.42,
  "optimal_parameters": { "tau": 4, "dimension": 4 },
  "classification": {
    "model": "RandomForest-EchoSense",
    "predicted_condition": "MICRO_CRACK_PRECURSOR",
    "confidence": 0.941
  },
  "bocd": {
    "changepoints_detected": 2,
    "timestamps": [3.45, 8.12],
    "max_probability": 0.892
  }
}`,
  },
  {
    method: "WS",
    path: "/ws/monitoring/{session_id}",
    summary: "Real-time acoustic telemetry WebSocket feed",
    desc: "Streams 20 Hz inference frames with instantaneous RMS, persistent entropy, and real-time changepoint alarms.",
    response: `{
  "type": "TELEMETRY_FRAME",
  "timestamp": 1730491823.451,
  "persistent_entropy": 3.418,
  "bocd_probability": 0.892,
  "alarm_status": "CRITICAL_PRECURSOR"
}`,
  },
];

export default function DocsPage() {
  const [search, setSearch] = useState("");
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);

  const filtered = ENDPOINTS.filter(
    (ep) =>
      ep.path.toLowerCase().includes(search.toLowerCase()) ||
      ep.summary.toLowerCase().includes(search.toLowerCase()) ||
      ep.method.toLowerCase().includes(search.toLowerCase())
  );

  const handleCopy = (text: string, idx: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIdx(idx);
    setTimeout(() => setCopiedIdx(null), 2000);
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 flex items-center justify-between px-6 py-4 bg-background/80 backdrop-blur-md border-b border-border/60">
        <div className="flex items-center gap-4">
          <Link href="/" className="hover:opacity-90">
            <AppLogo size="md" />
          </Link>
          <div className="hidden sm:flex items-center gap-1.5 text-xs text-muted-foreground border-l border-border pl-4">
            <span>EchoSense Core</span>
            <ChevronRight className="h-3 w-3" />
            <span className="text-foreground font-semibold">API Catalog &amp; Endpoints</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link href="/docs/data-contracts" className="text-xs text-muted-foreground hover:text-foreground">
            Data Contracts
          </Link>
          <Link href="/docs/system-design" className="text-xs text-muted-foreground hover:text-foreground">
            System RFC
          </Link>
          <Link href="/dashboard">
            <Button size="sm" className="gap-2 text-xs bg-emerald-600 hover:bg-emerald-500 text-white cursor-pointer">
              Launch Dashboard
              <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-5xl mx-auto px-4 py-12 w-full space-y-8">
        <div className="space-y-3">
          <Badge variant="outline" className="font-mono text-xs text-emerald-400 border-emerald-500/30">
            REST &amp; WebSocket Endpoints
          </Badge>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            EchoSense API Reference
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed max-w-2xl">
            Complete programmatic interface for uploading acoustic signals, executing GUDHI persistent
            homology jobs, and subscribing to live BOCD changepoints.
          </p>
        </div>

        {/* Search */}
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            placeholder="Search API endpoints..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 text-xs h-9 bg-card"
          />
        </div>

        {/* Endpoints List */}
        <div className="space-y-6">
          {filtered.map((ep, idx) => (
            <Card key={idx} className="border border-border bg-card overflow-hidden">
              <CardHeader className="bg-muted/20 border-b border-border/50 py-3 px-5 flex flex-row items-center justify-between">
                <div className="flex items-center gap-3">
                  <Badge
                    variant={
                      ep.method === "GET"
                        ? "default"
                        : ep.method === "POST"
                        ? "success"
                        : "destructive"
                    }
                    className="font-mono text-xs px-2"
                  >
                    {ep.method}
                  </Badge>
                  <span className="font-mono text-xs font-bold text-foreground">{ep.path}</span>
                </div>
                <span className="text-xs text-muted-foreground hidden sm:inline">{ep.summary}</span>
              </CardHeader>

              <CardContent className="p-5 space-y-3">
                <p className="text-xs text-muted-foreground leading-relaxed">{ep.desc}</p>

                <div className="space-y-1.5 pt-2">
                  <div className="flex items-center justify-between text-[11px] font-mono text-muted-foreground">
                    <span>Response Payload (JSON):</span>
                    <button
                      onClick={() => handleCopy(ep.response, idx)}
                      className="flex items-center gap-1 hover:text-foreground cursor-pointer"
                    >
                      {copiedIdx === idx ? (
                        <>
                          <Check className="h-3 w-3 text-emerald-500" />
                          <span>Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="h-3 w-3" />
                          <span>Copy</span>
                        </>
                      )}
                    </button>
                  </div>
                  <pre className="p-3 rounded-lg bg-zinc-950 text-emerald-400 font-mono text-[11px] overflow-x-auto border border-border/80">
                    {ep.response}
                  </pre>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </main>
    </div>
  );
}
