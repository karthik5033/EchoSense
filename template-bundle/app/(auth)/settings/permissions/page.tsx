"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ChevronLeft, ShieldCheck, Save, Check, Lock, Users } from "lucide-react";
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

const CAPABILITIES = [
  { id: "read_telemetry", name: "Stream Acoustic Telemetry", desc: "Access real-time 48 kHz microphone feeds, waveforms & BOCD alerts" },
  { id: "trigger_simulation", name: "Inject Acoustic Crack Bursts", desc: "Execute synthetic acoustic burst & load step simulations" },
  { id: "calibrate_filter", name: "Calibrate Filter & STA/LTA", desc: "Modify Butterworth cutoffs (500Hz-20kHz) and trigger thresholds" },
  { id: "run_tda_pipeline", name: "Trigger Full TDA Pipeline", desc: "Execute Takens embedding, GUDHI filtration & vectorization" },
  { id: "retrain_models", name: "Retrain Machine Learning Models", desc: "Retrain Random Forest classifier, Conv1D Autoencoder & CNN baseline" },
  { id: "manage_access", name: "Manage Roles & Compliance", desc: "Assign investigator roles and sign off on ASTM compliance audits" },
];

export default function PermissionsPage() {
  const [matrix, setMatrix] = useState<Record<string, Record<string, boolean>>>({
    ADMIN: {
      read_telemetry: true,
      trigger_simulation: true,
      calibrate_filter: true,
      run_tda_pipeline: true,
      retrain_models: true,
      manage_access: true,
    },
    MANAGER: {
      read_telemetry: true,
      trigger_simulation: true,
      calibrate_filter: true,
      run_tda_pipeline: true,
      retrain_models: false,
      manage_access: false,
    },
    ANALYST: {
      read_telemetry: true,
      trigger_simulation: false,
      calibrate_filter: false,
      run_tda_pipeline: true,
      retrain_models: false,
      manage_access: false,
    },
    OPERATOR: {
      read_telemetry: true,
      trigger_simulation: false,
      calibrate_filter: false,
      run_tda_pipeline: false,
      retrain_models: false,
      manage_access: false,
    },
  });

  const [saved, setSaved] = useState(false);

  const togglePermission = (role: string, capId: string) => {
    setMatrix((prev) => ({
      ...prev,
      [role]: {
        ...prev[role],
        [capId]: !prev[role][capId],
      },
    }));
  };

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto w-full">
      {/* Back button */}
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <Link href="/settings" className="hover:text-foreground flex items-center gap-1 transition-colors">
          <ChevronLeft className="h-4 w-4" />
          Back to System Settings
        </Link>
        <span>/</span>
        <span className="font-mono text-foreground font-semibold">RBAC Permissions</span>
      </div>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <ShieldCheck className="h-6 w-6 text-emerald-500" />
            Role-Based Access Control (RBAC) Matrix
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Configure granular capability permissions for each structural monitoring persona
          </p>
        </div>

        <Button
          onClick={handleSave}
          size="sm"
          className="gap-1.5 text-xs bg-emerald-600 hover:bg-emerald-500 text-white cursor-pointer"
        >
          {saved ? (
            <>
              <Check className="h-3.5 w-3.5" />
              Permissions Saved!
            </>
          ) : (
            <>
              <Save className="h-3.5 w-3.5" />
              Save Permissions Matrix
            </>
          )}
        </Button>
      </div>

      {/* Permissions Matrix Card */}
      <Card className="border border-border bg-card">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="border-border/60">
                <TableHead className="w-1/3 text-xs">EchoSense Capability</TableHead>
                <TableHead className="text-xs text-center">Lead Researcher (ADMIN)</TableHead>
                <TableHead className="text-xs text-center">Structural Engineer (MANAGER)</TableHead>
                <TableHead className="text-xs text-center">Data Analyst (ANALYST)</TableHead>
                <TableHead className="text-xs text-center">Site Inspector (OPERATOR)</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {CAPABILITIES.map((cap) => (
                <TableRow key={cap.id} className="border-border/40 hover:bg-muted/30">
                  <TableCell className="text-xs">
                    <div className="font-semibold text-foreground">{cap.name}</div>
                    <div className="text-[11px] text-muted-foreground">{cap.desc}</div>
                  </TableCell>
                  {["ADMIN", "MANAGER", "ANALYST", "OPERATOR"].map((r) => (
                    <TableCell key={r} className="text-center">
                      <input
                        type="checkbox"
                        checked={matrix[r]?.[cap.id] || false}
                        onChange={() => togglePermission(r, cap.id)}
                        className="h-4 w-4 rounded border-border accent-emerald-500 cursor-pointer"
                      />
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
