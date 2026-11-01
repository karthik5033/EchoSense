"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ChevronLeft,
  Boxes,
  Activity,
  Radio,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Compass,
  Zap,
  Gauge,
  Clock,
  ShieldCheck,
  Mic,
  Sliders,
  FileCode,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { MOCK_PROFILES } from "@/lib/mockData";

export default function ProfileDetailPage() {
  const params = useParams();
  const profileId = (params?.id as string) || "prof-001";

  const entity = MOCK_PROFILES.find((p) => p.id === profileId) || MOCK_PROFILES[0];
  const [isPinging, setIsPinging] = useState(false);
  const [pingSuccess, setPingSuccess] = useState(false);

  const handlePing = () => {
    setIsPinging(true);
    setTimeout(() => {
      setIsPinging(false);
      setPingSuccess(true);
      setTimeout(() => setPingSuccess(false), 2500);
    }, 500);
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto w-full">
      {/* Back button & Breadcrumb */}
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <Link href="/profiles" className="hover:text-foreground flex items-center gap-1 transition-colors">
          <ChevronLeft className="h-4 w-4" />
          Back to Sensor Stations
        </Link>
        <span>/</span>
        <span className="font-mono text-foreground font-semibold">{entity.referenceId}</span>
      </div>

      {/* Profile Header Card */}
      <Card className="border border-border bg-card p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="h-14 w-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 font-bold font-mono text-lg">
              <Mic className="h-7 w-7" />
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-bold text-muted-foreground">
                  {entity.referenceId}
                </span>
                <Badge
                  variant={
                    entity.status === "ACTIVE"
                      ? "default"
                      : entity.status === "WARNING"
                      ? "warning"
                      : "outline"
                  }
                  className="text-xs"
                >
                  {entity.status}
                </Badge>
              </div>
              <h1 className="text-2xl font-extrabold text-foreground tracking-tight">
                {entity.name}
              </h1>
              <p className="text-xs text-muted-foreground">
                Responsible Operator: {entity.assignedOperator} | Category: {entity.category}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handlePing}
              disabled={isPinging}
              className="gap-1.5 text-xs cursor-pointer"
            >
              <Radio className="h-3.5 w-3.5 text-emerald-500" />
              {isPinging ? "Querying Audio Feed..." : pingSuccess ? "48 kHz Stream Verified!" : "Ping Acoustic Feed"}
            </Button>
          </div>
        </div>

        {/* Live Parameter Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 pt-6 border-t border-border">
          <div className="p-3 rounded-lg border border-border/60 bg-muted/20">
            <span className="text-[10px] text-muted-foreground uppercase font-mono block">
              Audio Buffer Latency
            </span>
            <span className="text-lg font-bold font-mono text-foreground mt-1 block">
              {entity.parameters.latency}
            </span>
          </div>
          <div className="p-3 rounded-lg border border-border/60 bg-muted/20">
            <span className="text-[10px] text-muted-foreground uppercase font-mono block">
              Sampling &amp; Precision
            </span>
            <span className="text-lg font-bold font-mono text-emerald-400 mt-1 block">
              {entity.parameters.throughput}
            </span>
          </div>
          <div className="p-3 rounded-lg border border-border/60 bg-muted/20">
            <span className="text-[10px] text-muted-foreground uppercase font-mono block">
              Local Edge Load
            </span>
            <span className="text-lg font-bold font-mono text-foreground mt-1 block">
              {entity.parameters.cpuLoad}
            </span>
          </div>
          <div className="p-3 rounded-lg border border-border/60 bg-muted/20">
            <span className="text-[10px] text-muted-foreground uppercase font-mono block">
              Memory / Ring Buffer
            </span>
            <span className="text-lg font-bold font-mono text-foreground mt-1 block">
              {entity.parameters.memoryUsage}
            </span>
          </div>
        </div>
      </Card>

      {/* Tabs */}
      <Tabs defaultValue="telemetry" className="w-full">
        <TabsList className="bg-muted/40 border border-border p-1">
          <TabsTrigger value="telemetry" className="text-xs">
            Sensor Calibration &amp; Telemetry
          </TabsTrigger>
          <TabsTrigger value="diagnostics" className="text-xs">
            Signal Preprocessing Parameters
          </TabsTrigger>
          <TabsTrigger value="raw" className="text-xs">
            Node Manifest (JSON)
          </TabsTrigger>
        </TabsList>

        <TabsContent value="telemetry" className="mt-4">
          <Card className="border border-border bg-card p-5 space-y-4">
            <h3 className="text-sm font-bold text-foreground">
              Acoustic Channel Health &amp; Sensitivity Spectrum
            </h3>
            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Calibration Health Index:</span>
                <span className="font-mono font-bold text-foreground">{entity.healthScore}% Nominal</span>
              </div>
              <Progress value={entity.healthScore} className="h-2" />
              <div className="flex items-center justify-between pt-2">
                <span className="text-muted-foreground">Last Heartbeat Ping:</span>
                <span className="font-mono text-foreground">{entity.lastPing}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Transducer Coupling:</span>
                <span className="font-mono text-emerald-400 font-semibold">Direct Concrete Surface Mount (Acoustic Gel)</span>
              </div>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="diagnostics" className="mt-4">
          <Card className="border border-border bg-card p-5 space-y-3 text-xs">
            <h3 className="text-sm font-bold text-foreground">
              Edge Filter &amp; Window Settings
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              <div className="p-3 rounded border border-border bg-muted/20 space-y-1">
                <span className="font-semibold text-foreground block">Butterworth Bandpass</span>
                <p className="text-[11px] text-muted-foreground">Order: 4 | Cutoff: 500 Hz to 20,000 Hz</p>
              </div>
              <div className="p-3 rounded border border-border bg-muted/20 space-y-1">
                <span className="font-semibold text-foreground block">STA / LTA Ratio Engine</span>
                <p className="text-[11px] text-muted-foreground">STA: 50 samples (1 ms) | LTA: 500 samples (10 ms)</p>
              </div>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="raw" className="mt-4">
          <Card className="border border-border bg-card p-5">
            <pre className="p-4 rounded-lg bg-zinc-950 text-emerald-400 font-mono text-[11px] overflow-x-auto border border-border/80">
{JSON.stringify(entity, null, 2)}
            </pre>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
