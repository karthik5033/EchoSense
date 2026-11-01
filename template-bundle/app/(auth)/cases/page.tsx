"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  FolderGit2,
  Plus,
  Search,
  Filter,
  Download,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  Clock,
  User,
  X,
  ShieldAlert,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { MOCK_CASES, MockCase } from "@/lib/mockData";
import { downloadDataAsCsv } from "@/lib/utils";

export default function CasesPage() {
  const [cases, setCases] = useState<MockCase[]>(MOCK_CASES);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [isNewCaseOpen, setIsNewCaseOpen] = useState(false);

  // New Case Form state
  const [newTitle, setNewTitle] = useState("");
  const [newSummary, setNewSummary] = useState("");
  const [newPriority, setNewPriority] = useState<"CRITICAL" | "HIGH" | "MEDIUM" | "LOW">("HIGH");

  const filtered = cases.filter((c) => {
    if (statusFilter !== "ALL" && c.status !== statusFilter) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        c.code.toLowerCase().includes(q) ||
        c.title.toLowerCase().includes(q) ||
        c.summary.toLowerCase().includes(q) ||
        c.assignee.name.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const handleCreateCase = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const created: MockCase = {
      id: `case-${Date.now()}`,
      code: `AE-EVT-2026-${Math.floor(100 + Math.random() * 900)}`,
      title: newTitle,
      summary: newSummary || "Structural acoustic emission event logged via smartphone MEMS sensor array.",
      status: "OPEN",
      priority: newPriority,
      assignee: {
        name: "Karthik K P",
        avatar: "KP",
        role: "TDA Lead Researcher",
      },
      impactScore: Math.floor(50 + Math.random() * 45),
      createdAt: new Date().toISOString(),
      updatedAt: "Just now",
    };

    setCases([created, ...cases]);
    setNewTitle("");
    setNewSummary("");
    setIsNewCaseOpen(false);
  };

  const handleExport = () => {
    downloadDataAsCsv("echosense_damage_incidents.csv", filtered);
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto w-full">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <FolderGit2 className="h-6 w-6 text-emerald-500" />
            Structural Damage Precursor Incidents
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Track specimen crack initiation, fracture mode classifications &amp; Composite Damage Precursor Index (CDPI)
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            onClick={() => setIsNewCaseOpen(true)}
            className="gap-1.5 text-xs bg-emerald-600 hover:bg-emerald-500 text-white cursor-pointer"
          >
            <Plus className="h-3.5 w-3.5" />
            Log Structural Incident
          </Button>

          <Button variant="outline" size="sm" onClick={handleExport} className="gap-1.5 text-xs cursor-pointer">
            <Download className="h-3.5 w-3.5" />
            Export Incidents CSV
          </Button>
        </div>
      </div>

      {/* Filter / Search Bar */}
      <Card className="border border-border bg-card p-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search className="h-4 w-4 absolute left-3 top-2.5 text-muted-foreground" />
            <Input
              placeholder="Search by incident code, specimen, or investigator..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="text-xs pl-9 h-9"
            />
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground font-medium">Status:</span>
            {["ALL", "OPEN", "INVESTIGATING", "MITIGATING", "RESOLVED"].map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-colors cursor-pointer ${
                  statusFilter === st
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground hover:text-foreground"
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>
      </Card>

      {/* Incidents Table */}
      <Card className="border border-border bg-card">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="border-border/60">
                <TableHead className="text-xs">Incident Code</TableHead>
                <TableHead className="text-xs">Fracture Description</TableHead>
                <TableHead className="text-xs">Status</TableHead>
                <TableHead className="text-xs">Priority</TableHead>
                <TableHead className="text-xs">Lead Investigator</TableHead>
                <TableHead className="text-xs">CDPI Score</TableHead>
                <TableHead className="text-xs text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((item) => (
                <TableRow key={item.id} className="border-border/40 hover:bg-muted/30">
                  <TableCell className="font-mono text-xs font-semibold text-foreground">
                    <Link href={`/cases/${item.id}`} className="hover:underline text-emerald-400">
                      {item.code}
                    </Link>
                  </TableCell>
                  <TableCell className="text-xs">
                    <div className="font-medium text-foreground">{item.title}</div>
                    <div className="text-[11px] text-muted-foreground line-clamp-1">
                      {item.summary}
                    </div>
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
                  <TableCell className="text-xs font-mono">
                    <div className="flex items-center gap-2">
                      <Progress value={item.impactScore} className="h-1.5 w-16" />
                      <span className="font-bold text-foreground">{item.impactScore}%</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-xs text-right">
                    <Link href={`/cases/${item.id}`}>
                      <Button variant="ghost" size="sm" className="h-7 text-xs gap-1 cursor-pointer">
                        Inspect
                        <ArrowRight className="h-3 w-3" />
                      </Button>
                    </Link>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* New Incident Modal */}
      {isNewCaseOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <form
            onSubmit={handleCreateCase}
            className="w-full max-w-md rounded-xl border border-border bg-card p-6 shadow-2xl space-y-4 animate-in fade-in-50 zoom-in-95"
          >
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="font-bold text-sm text-foreground">
                Log New Structural Damage Precursor
              </h3>
              <button
                type="button"
                onClick={() => setIsNewCaseOpen(false)}
                className="p-1 rounded-md text-muted-foreground hover:bg-muted hover:text-foreground cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-foreground block mb-1">
                  Specimen Location / Incident Title
                </label>
                <Input
                  required
                  placeholder="e.g. Girder Span 2 Bottom Flange Shear Crack"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="text-xs"
                />
              </div>

              <div>
                <label className="font-semibold text-foreground block mb-1">
                  Acoustic Observation &amp; TDA Notes
                </label>
                <textarea
                  rows={3}
                  placeholder="e.g. Takens embedding detected birth of persistent H1 1-cycle during monotonic loading at 180 kN..."
                  value={newSummary}
                  onChange={(e) => setNewSummary(e.target.value)}
                  className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none"
                />
              </div>

              <div>
                <label className="font-semibold text-foreground block mb-1">
                  Priority / Structural Risk
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {(["CRITICAL", "HIGH", "MEDIUM", "LOW"] as const).map((p) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setNewPriority(p)}
                      className={`p-1.5 rounded border text-[10px] font-bold font-mono transition-colors cursor-pointer ${
                        newPriority === p
                          ? "border-emerald-500 bg-emerald-500/20 text-emerald-400"
                          : "border-border text-muted-foreground hover:bg-muted"
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-border">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsNewCaseOpen(false)}
                className="text-xs cursor-pointer"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                size="sm"
                className="text-xs bg-emerald-600 hover:bg-emerald-500 text-white cursor-pointer"
              >
                Create Incident Record
              </Button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
