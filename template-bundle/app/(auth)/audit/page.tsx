"use client";

import React, { useState } from "react";
import {
  ShieldCheck,
  Search,
  Download,
  Filter,
  CheckCircle2,
  AlertTriangle,
  Lock,
  X,
  FileCode,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { MOCK_AUDIT_LOGS, MockAuditEntry } from "@/lib/mockData";
import { downloadDataAsCsv } from "@/lib/utils";

export default function AuditPage() {
  const [logs, setLogs] = useState<MockAuditEntry[]>(MOCK_AUDIT_LOGS);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [selectedEntry, setSelectedEntry] = useState<MockAuditEntry | null>(null);

  const filtered = logs.filter((entry) => {
    if (statusFilter !== "ALL" && entry.status !== statusFilter) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        entry.actor.toLowerCase().includes(q) ||
        entry.action.toLowerCase().includes(q) ||
        entry.target.toLowerCase().includes(q) ||
        entry.ipAddress.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const handleExport = () => {
    downloadDataAsCsv("echosense_compliance_audit_log.csv", filtered);
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <ShieldCheck className="h-6 w-6 text-emerald-500" />
            Structural Inspection &amp; Compliance Audit
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Immutable log of filter calibrations, STA/LTA threshold overrides, model retraining &amp; ASTM E1316 compliance records
          </p>
        </div>

        <Button variant="outline" size="sm" onClick={handleExport} className="gap-1.5 text-xs cursor-pointer">
          <Download className="h-3.5 w-3.5" />
          Export Audit Trail
        </Button>
      </div>

      {/* Filter & Search Bar */}
      <Card className="border border-border bg-card p-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-semibold text-muted-foreground mr-1">Status:</span>
            {["ALL", "SUCCESS", "FLAGGED", "BLOCKED"].map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1 rounded-md text-xs font-semibold transition-colors cursor-pointer ${
                  statusFilter === st
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground"
                }`}
              >
                {st}
              </button>
            ))}
          </div>

          <div className="relative max-w-xs w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              placeholder="Search investigator, action, node..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 h-8 text-xs bg-background"
            />
          </div>
        </div>
      </Card>

      {/* Audit Log Table */}
      <Card className="border border-border bg-card">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="border-border/60">
                <TableHead className="text-xs">Log ID</TableHead>
                <TableHead className="text-xs">Operator / Process</TableHead>
                <TableHead className="text-xs">Action Type</TableHead>
                <TableHead className="text-xs">Target Specimen / Subsystem</TableHead>
                <TableHead className="text-xs">Timestamp (UTC)</TableHead>
                <TableHead className="text-xs">Status</TableHead>
                <TableHead className="text-xs text-right">Node IP</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((entry) => (
                <TableRow
                  key={entry.id}
                  className="border-border/40 hover:bg-muted/30 cursor-pointer"
                  onClick={() => setSelectedEntry(entry)}
                >
                  <TableCell className="font-mono text-xs font-semibold text-foreground">
                    {entry.id}
                  </TableCell>
                  <TableCell className="text-xs font-medium text-foreground">
                    {entry.actor}
                  </TableCell>
                  <TableCell className="font-mono text-xs text-muted-foreground">
                    <span className="px-1.5 py-0.5 rounded bg-muted/60 border border-border">
                      {entry.action}
                    </span>
                  </TableCell>
                  <TableCell className="text-xs font-mono text-foreground">
                    {entry.target}
                  </TableCell>
                  <TableCell className="text-xs font-mono text-muted-foreground">
                    {entry.timestamp}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        entry.status === "SUCCESS"
                          ? "default"
                          : entry.status === "FLAGGED"
                          ? "warning"
                          : "destructive"
                      }
                      className="text-[10px]"
                    >
                      {entry.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-xs font-mono text-right text-muted-foreground">
                    {entry.ipAddress}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Inspect Modal */}
      {selectedEntry && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg rounded-xl border border-border bg-card p-6 shadow-2xl animate-in fade-in-50 zoom-in-95 space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div className="flex items-center gap-2">
                <Badge
                  variant={
                    selectedEntry.status === "SUCCESS"
                      ? "default"
                      : selectedEntry.status === "FLAGGED"
                      ? "warning"
                      : "destructive"
                  }
                >
                  {selectedEntry.status}
                </Badge>
                <span className="font-mono text-xs font-semibold text-foreground">
                  {selectedEntry.id}
                </span>
              </div>
              <button
                onClick={() => setSelectedEntry(null)}
                className="p-1 rounded-md text-muted-foreground hover:bg-muted hover:text-foreground cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-lg border border-border bg-muted/20 space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Actor:</span>
                  <span className="font-mono font-semibold text-foreground">
                    {selectedEntry.actor}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Action Executed:</span>
                  <span className="font-mono text-emerald-400 font-bold">
                    {selectedEntry.action}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Target Component:</span>
                  <span className="font-mono text-foreground">{selectedEntry.target}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Verification Time:</span>
                  <span className="font-mono text-muted-foreground">
                    {selectedEntry.timestamp}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Origin Node / IP:</span>
                  <span className="font-mono text-muted-foreground">
                    {selectedEntry.ipAddress}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-2 border-t border-border">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedEntry(null)}
                className="text-xs cursor-pointer"
              >
                Close Audit Entry
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
