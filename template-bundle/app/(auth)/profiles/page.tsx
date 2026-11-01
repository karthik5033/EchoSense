"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Users,
  Search,
  Filter,
  Download,
  ArrowRight,
  Boxes,
  CheckCircle2,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  Mic,
  Activity,
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
import { MOCK_PROFILES, MockProfile } from "@/lib/mockData";
import { downloadDataAsCsv } from "@/lib/utils";

export default function ProfilesPage() {
  const [profiles, setProfiles] = useState<MockProfile[]>(MOCK_PROFILES);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("ALL");

  const filtered = profiles.filter((p) => {
    if (categoryFilter !== "ALL" && p.category !== categoryFilter) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        p.referenceId.toLowerCase().includes(q) ||
        p.name.toLowerCase().includes(q) ||
        p.assignedOperator.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const handleExport = () => {
    downloadDataAsCsv("echosense_sensors_directory.csv", filtered);
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <Mic className="h-6 w-6 text-emerald-500" />
            Sensor Stations &amp; Transducers Directory
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Registered smartphone acoustic sensing nodes, piezoelectric reference transducers &amp; edge gateways
          </p>
        </div>

        <Button variant="outline" size="sm" onClick={handleExport} className="gap-1.5 text-xs cursor-pointer">
          <Download className="h-3.5 w-3.5" />
          Export Sensor Matrix
        </Button>
      </div>

      {/* Filter and Search */}
      <Card className="border border-border bg-card p-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-semibold text-muted-foreground mr-1">Sensor Modality:</span>
            {["ALL", "Smartphone MEMS", "Piezo Transducer", "Edge Ingestion Node"].map(
              (cat) => (
                <button
                  key={cat}
                  onClick={() => setCategoryFilter(cat)}
                  className={`px-3 py-1 rounded-md text-xs font-semibold transition-colors cursor-pointer ${
                    categoryFilter === cat
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground"
                  }`}
                >
                  {cat}
                </button>
              )
            )}
          </div>

          <div className="relative max-w-xs w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              placeholder="Search by node ID, phone model..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="text-xs pl-9 h-9"
            />
          </div>
        </div>
      </Card>

      {/* Directory Table */}
      <Card className="border border-border bg-card">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="border-border/60">
                <TableHead className="text-xs">Node Ref ID</TableHead>
                <TableHead className="text-xs">Sensing Station Name</TableHead>
                <TableHead className="text-xs">Sensor Category</TableHead>
                <TableHead className="text-xs">Status</TableHead>
                <TableHead className="text-xs">Health &amp; Battery</TableHead>
                <TableHead className="text-xs">Responsible Operator</TableHead>
                <TableHead className="text-xs text-right">Telemetry</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((item) => (
                <TableRow key={item.id} className="border-border/40 hover:bg-muted/30">
                  <TableCell className="font-mono text-xs font-semibold text-foreground">
                    <Link href={`/profiles/${item.id}`} className="hover:underline text-emerald-400">
                      {item.referenceId}
                    </Link>
                  </TableCell>
                  <TableCell className="text-xs font-medium text-foreground">
                    {item.name}
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {item.category}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        item.status === "ACTIVE"
                          ? "default"
                          : item.status === "WARNING"
                          ? "warning"
                          : "destructive"
                      }
                      className="text-[10px]"
                    >
                      {item.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-xs font-mono">
                    <div className="flex items-center gap-2">
                      <Progress value={item.healthScore} className="h-1.5 w-16" />
                      <span className="font-bold text-foreground">{item.healthScore}%</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {item.assignedOperator}
                  </TableCell>
                  <TableCell className="text-xs text-right font-mono text-muted-foreground">
                    <Link href={`/profiles/${item.id}`}>
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
    </div>
  );
}
