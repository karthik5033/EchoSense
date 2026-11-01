"use client";

import React, { useState } from "react";
import {
  Wallet,
  DollarSign,
  TrendingUp,
  Download,
  Calculator,
  Layers,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Cpu,
  HardDrive,
  Activity,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { MOCK_FINANCIAL_BREAKDOWN } from "@/lib/mockData";
import { downloadDataAsCsv } from "@/lib/utils";

export default function FinancialPage() {
  const [calculatorInput, setCalculatorInput] = useState({
    sensorCount: 12,
    hoursPerDay: 24,
  });

  const estimatedDataDailyMb = calculatorInput.sensorCount * calculatorInput.hoursPerDay * 48 * 2 * 3600 / (1024 * 1024);
  const estimatedSavings = calculatorInput.sensorCount * 8500; // vs $10,000 piezo rigs

  const handleExport = () => {
    downloadDataAsCsv("echosense_telemetry_ledger.csv", MOCK_FINANCIAL_BREAKDOWN);
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <Cpu className="h-6 w-6 text-emerald-500" />
            Edge Compute &amp; Sensor Telemetry Ledger
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Edge hardware consumption, smartphone memory/bandwidth allocations &amp; capital savings vs dedicated ultrasonic rigs
          </p>
        </div>

        <Button variant="outline" size="sm" onClick={handleExport} className="gap-1.5 text-xs cursor-pointer">
          <Download className="h-3.5 w-3.5" />
          Export Telemetry Ledger
        </Button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border border-border bg-card p-5">
          <span className="text-xs text-muted-foreground uppercase font-semibold">
            Capital Equipment Saved
          </span>
          <div className="mt-2 text-2xl font-bold font-mono text-emerald-400">~$102,000</div>
          <span className="text-[11px] text-muted-foreground mt-1 block">
            12 Smartphones vs $10K AE Hardware
          </span>
        </Card>

        <Card className="border border-border bg-card p-5">
          <span className="text-xs text-muted-foreground uppercase font-semibold">
            Continuous Audio Bandwidth
          </span>
          <div className="mt-2 text-2xl font-bold font-mono text-foreground">1.15 MB/s</div>
          <span className="text-[11px] text-emerald-500 font-semibold font-mono mt-1 block">
            Compressed lossless FLAC
          </span>
        </Card>

        <Card className="border border-border bg-card p-5">
          <span className="text-xs text-muted-foreground uppercase font-semibold">
            TDA Compute Latency
          </span>
          <div className="mt-2 text-2xl font-bold font-mono text-emerald-400">380 ms</div>
          <span className="text-[11px] text-muted-foreground mt-1 block">
            Per 1,000 sample event slice
          </span>
        </Card>

        <Card className="border border-border bg-card p-5">
          <span className="text-xs text-muted-foreground uppercase font-semibold">
            Sensor Network Uptime
          </span>
          <div className="mt-2 text-2xl font-bold font-mono text-foreground">99.98%</div>
          <span className="text-[11px] text-muted-foreground mt-1 block">
            Over 30-day monitoring trial
          </span>
        </Card>
      </div>

      {/* Telemetry Breakdown Table */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 border border-border bg-card">
          <CardHeader className="pb-3 border-b border-border/50">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <HardDrive className="h-4 w-4 text-primary" />
              Infrastructure Resource Allocations
            </CardTitle>
            <CardDescription className="text-xs">
              Storage, computation &amp; network bandwidth metrics
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="border-border/60">
                  <TableHead className="text-xs">Subsystem</TableHead>
                  <TableHead className="text-xs">Allocated Units</TableHead>
                  <TableHead className="text-xs">Consumed</TableHead>
                  <TableHead className="text-xs text-right">Variance</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {MOCK_FINANCIAL_BREAKDOWN.map((item, idx) => (
                  <TableRow key={idx} className="border-border/40 hover:bg-muted/30">
                    <TableCell className="text-xs font-semibold text-foreground">
                      {item.category}
                    </TableCell>
                    <TableCell className="text-xs font-mono text-muted-foreground">
                      {item.allocated.toLocaleString()} Units
                    </TableCell>
                    <TableCell className="text-xs font-mono font-medium text-foreground">
                      {item.consumed.toLocaleString()} Units
                    </TableCell>
                    <TableCell
                      className={`text-xs font-mono font-bold text-right ${
                        item.variance.startsWith("-") ? "text-emerald-500" : "text-amber-500"
                      }`}
                    >
                      {item.variance}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Deployment Sizing Calculator */}
        <Card className="border border-border bg-card p-5 space-y-4">
          <div className="border-b border-border pb-3">
            <CardTitle className="text-sm font-bold text-foreground flex items-center gap-2">
              <Calculator className="h-4 w-4 text-emerald-400" />
              Sensing Deployment Sizing
            </CardTitle>
            <CardDescription className="text-xs">
              Estimate daily streaming bandwidth &amp; equipment savings
            </CardDescription>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <label className="font-semibold text-foreground block mb-1">
                Active Smartphone Microphones ({calculatorInput.sensorCount})
              </label>
              <input
                type="range"
                min="2"
                max="32"
                value={calculatorInput.sensorCount}
                onChange={(e) =>
                  setCalculatorInput({
                    ...calculatorInput,
                    sensorCount: parseInt(e.target.value) || 2,
                  })
                }
                className="w-full accent-emerald-500 h-1.5 cursor-pointer"
              />
            </div>

            <div className="p-3 rounded-lg border border-border bg-muted/20 space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Raw Audio Influx:</span>
                <span className="font-mono font-bold text-foreground">
                  ~{(estimatedDataDailyMb / 1024).toFixed(1)} GB / day
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Equipment Cost Avoidance:</span>
                <span className="font-mono font-bold text-emerald-400">
                  ~${estimatedSavings.toLocaleString()} USD
                </span>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
