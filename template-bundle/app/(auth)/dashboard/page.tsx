"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Activity,
  AlertTriangle,
  ArrowRight,
  Boxes,
  CheckCircle2,
  Cpu,
  Download,
  ExternalLink,
  Flame,
  Layers,
  LineChart,
  Plus,
  Radio,
  RefreshCw,
  Search,
  ShieldAlert,
  Sparkles,
  TrendingDown,
  TrendingUp,
  X,
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
import { MetricCard } from "@/components/shared/MetricCard";
import {
  MOCK_KPIS,
  MOCK_TREND_DATA,
  MOCK_ALERTS,
  MOCK_CASES,
  MockAlert,
} from "@/lib/mockData";
import { downloadDataAsCsv } from "@/lib/utils";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";

export default function DashboardPage() {
  const [alerts, setAlerts] = useState<MockAlert[]>(MOCK_ALERTS);
  const [isSimulateModalOpen, setIsSimulateModalOpen] = useState(false);
  const [simulationBanner, setSimulationBanner] = useState<string | null>(null);

  const handleExport = () => {
    downloadDataAsCsv("echosense_structural_overview.csv", alerts);
  };

  const handleAcknowledge = (id: string) => {
    setAlerts((prev) =>
      prev.map((a) => (a.id === id ? { ...a, acknowledged: true } : a))
    );
  };

  const triggerSimulation = (eventType: string) => {
    setIsSimulateModalOpen(false);
    setSimulationBanner(
      `Simulated ${eventType} acoustic burst ingested! Takens attractor reconstructed (τ=4, d=4) and BOCD flagged P(r=0) = 0.89.`
    );
    setTimeout(() => setSimulationBanner(null), 6000);
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto w-full">
      {/* Simulation Banner */}
      {simulationBanner && (
        <div className="flex items-center justify-between p-4 rounded-xl border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 text-xs font-medium animate-in fade-in-50">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4" />
            <span>{simulationBanner}</span>
          </div>
          <button onClick={() => setSimulationBanner(null)} className="p-1 hover:text-foreground cursor-pointer">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Top Header Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
            Structural Health Overview
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Real-time acoustic emission telemetry, Takens attractor dynamics &amp; Bayesian changepoint tracking
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsSimulateModalOpen(true)}
            className="gap-1.5 text-xs border-emerald-500/40 text-emerald-400 hover:bg-emerald-500/10 cursor-pointer"
          >
            <Zap className="h-3.5 w-3.5" />
            Simulate Crack Burst
          </Button>

          <Button variant="outline" size="sm" onClick={handleExport} className="gap-1.5 text-xs cursor-pointer">
            <Download className="h-3.5 w-3.5" />
            Export Telemetry CSV
          </Button>
        </div>
      </div>

      {/* Top KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {MOCK_KPIS.map((kpi, idx) => (
          <MetricCard
            key={idx}
            title={kpi.title}
            value={kpi.value}
            change={kpi.change}
            isPositive={kpi.isPositive}
            subtext={kpi.subtext}
            icon={
              idx === 0 ? (
                <ShieldAlert className="h-4 w-4 text-emerald-500" />
              ) : idx === 1 ? (
                <Activity className="h-4 w-4 text-primary" />
              ) : idx === 2 ? (
                <Cpu className="h-4 w-4 text-blue-500" />
              ) : (
                <Flame className="h-4 w-4 text-amber-500" />
              )
            }
          />
        ))}
      </div>

      {/* Main Charts & Live Feed Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Wave Chart */}
        <Card className="lg:col-span-2 border border-border bg-card">
          <CardHeader className="flex flex-row items-center justify-between pb-2 border-b border-border/50">
            <div>
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <LineChart className="h-4 w-4 text-emerald-500" />
                Persistent Topological Entropy &amp; BOCD Changepoint Stream
              </CardTitle>
              <CardDescription className="text-xs">
                Takens attractor H1 loop persistence (green) vs Bayesian changepoint probability (indigo)
              </CardDescription>
            </div>
            <Badge variant="outline" className="font-mono text-xs text-emerald-400 border-emerald-500/30">
              Live Feed 48 kHz
            </Badge>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={MOCK_TREND_DATA}>
                  <defs>
                    <linearGradient id="gradientEntropy" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.35} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                    </linearGradient>
                    <linearGradient id="gradientBocd" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.35} />
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                  <XAxis dataKey="time" stroke="#71717a" fontSize={11} />
                  <YAxis stroke="#71717a" fontSize={11} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#09090b",
                      borderColor: "#27272a",
                      borderRadius: "8px",
                      fontSize: "12px",
                      color: "#f4f4f5",
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="valueB"
                    name="Persistent Entropy H1"
                    stroke="#10b981"
                    fillOpacity={1}
                    fill="url(#gradientEntropy)"
                    strokeWidth={2}
                  />
                  <Area
                    type="monotone"
                    dataKey="valueC"
                    name="BOCD Changepoint Prob"
                    stroke="#6366f1"
                    fillOpacity={1}
                    fill="url(#gradientBocd)"
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Live Activity Feed */}
        <Card className="border border-border bg-card flex flex-col">
          <CardHeader className="pb-2 border-b border-border/50">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Radio className="h-4 w-4 text-emerald-500 animate-pulse" />
                Live Acoustic Event Feed
              </CardTitle>
              <span className="text-[10px] font-mono text-emerald-400 uppercase">
                STA/LTA Active
              </span>
            </div>
            <CardDescription className="text-xs">
              Acoustic emission bursts &amp; changepoint alerts
            </CardDescription>
          </CardHeader>
          <CardContent className="p-4 flex-1 overflow-y-auto space-y-3 max-h-72">
            {alerts.slice(0, 4).map((alert) => (
              <div
                key={alert.id}
                className="p-3 rounded-lg border border-border/60 bg-muted/20 hover:bg-muted/40 transition-colors text-xs space-y-1.5"
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[10px] text-muted-foreground font-semibold">
                    {alert.source}
                  </span>
                  <span className="text-[10px] text-muted-foreground/80">{alert.timestamp}</span>
                </div>
                <p className="font-semibold text-foreground text-xs leading-tight">
                  {alert.title}
                </p>
                <div className="flex items-center justify-between pt-1">
                  <Badge
                    variant={
                      alert.severity === "CRITICAL"
                        ? "destructive"
                        : alert.severity === "HIGH"
                        ? "destructive"
                        : "warning"
                    }
                    className="text-[9px] py-0 h-4"
                  >
                    {alert.severity}
                  </Badge>
                  {!alert.acknowledged ? (
                    <button
                      onClick={() => handleAcknowledge(alert.id)}
                      className="text-[10px] font-medium text-emerald-400 hover:underline cursor-pointer"
                    >
                      Acknowledge
                    </button>
                  ) : (
                    <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                      <CheckCircle2 className="h-3 w-3 text-emerald-500" />
                      Verified
                    </span>
                  )}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Priority Structural Incidents Table */}
      <Card className="border border-border bg-card">
        <CardHeader className="flex flex-row items-center justify-between pb-3 border-b border-border/50">
          <div>
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Boxes className="h-4 w-4 text-primary" />
              Structural Damage Precursor Incidents
            </CardTitle>
            <CardDescription className="text-xs">
              Specimen load progression, crack mechanisms &amp; Composite Damage Precursor Index (CDPI)
            </CardDescription>
          </div>
          <Link href="/cases">
            <Button variant="ghost" size="sm" className="text-xs gap-1 cursor-pointer">
              View All Events
              <ArrowRight className="h-3 w-3" />
            </Button>
          </Link>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="border-border/60">
                <TableHead className="text-xs">Incident ID</TableHead>
                <TableHead className="text-xs">Event Description</TableHead>
                <TableHead className="text-xs">Status</TableHead>
                <TableHead className="text-xs">Priority</TableHead>
                <TableHead className="text-xs">Lead Investigator</TableHead>
                <TableHead className="text-xs text-right">CDPI Score</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {MOCK_CASES.map((item) => (
                <TableRow key={item.id} className="border-border/40 hover:bg-muted/30">
                  <TableCell className="font-mono text-xs font-semibold text-foreground">
                    <Link href={`/cases/${item.id}`} className="hover:underline">
                      {item.code}
                    </Link>
                  </TableCell>
                  <TableCell className="text-xs font-medium text-foreground max-w-xs truncate">
                    {item.title}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        item.status === "RESOLVED"
                          ? "outline"
                          : item.status === "INVESTIGATING"
                          ? "destructive"
                          : "secondary"
                      }
                      className="text-[10px]"
                    >
                      {item.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <span
                      className={`text-[10px] font-bold font-mono ${
                        item.priority === "CRITICAL"
                          ? "text-red-500"
                          : item.priority === "HIGH"
                          ? "text-amber-500"
                          : "text-muted-foreground"
                      }`}
                    >
                      {item.priority}
                    </span>
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {item.assignee.name}
                  </TableCell>
                  <TableCell className="text-xs font-mono font-bold text-right text-foreground">
                    {item.impactScore} / 100
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Simulation Modal */}
      {isSimulateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-xl border border-border bg-card p-6 shadow-2xl animate-in fade-in-50 zoom-in-95 space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-emerald-500" />
                <h3 className="font-bold text-sm text-foreground">
                  Simulate Structural Acoustic Event
                </h3>
              </div>
              <button
                onClick={() => setIsSimulateModalOpen(false)}
                className="p-1 rounded-md text-muted-foreground hover:bg-muted hover:text-foreground cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Inject a simulated acoustic emission waveform into the active EchoSense pipeline to observe
              Takens embedding, GUDHI persistence diagram extraction, and BOCD changepoints in real time.
            </p>
            <div className="grid grid-cols-1 gap-2 pt-2">
              <Button
                variant="outline"
                className="justify-start gap-2 text-xs border-red-500/30 text-red-400 hover:bg-red-500/10 cursor-pointer"
                onClick={() => triggerSimulation("Tensile Micro-Crack Burst")}
              >
                <Flame className="h-4 w-4" />
                Simulate Tensile Crack Precursor (Siracusano Class 1)
              </Button>
              <Button
                variant="outline"
                className="justify-start gap-2 text-xs border-amber-500/30 text-amber-400 hover:bg-amber-500/10 cursor-pointer"
                onClick={() => triggerSimulation("Shear Dislocation Pulse")}
              >
                <Activity className="h-4 w-4" />
                Simulate Web Shear Dislocation (D'Angela Girder Load Step)
              </Button>
              <Button
                variant="outline"
                className="justify-start gap-2 text-xs border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10 cursor-pointer"
                onClick={() => triggerSimulation("Undamaged Ambient Baseline")}
              >
                <CheckCircle2 className="h-4 w-4" />
                Simulate Ambient Noise Rejection (&lt; 500 Hz Filtered)
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
