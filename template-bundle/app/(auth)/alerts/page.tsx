"use client";

import React, { useState } from "react";
import {
  BellRing,
  AlertTriangle,
  ShieldAlert,
  CheckCircle2,
  Search,
  Filter,
  Download,
  Check,
  RefreshCw,
  X,
  ExternalLink,
  Flame,
  Activity,
  Waves,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { MOCK_ALERTS, MockAlert } from "@/lib/mockData";
import { downloadDataAsCsv } from "@/lib/utils";

type AlertFilterTab = "ALL" | "CRITICAL" | "HIGH" | "MEDIUM" | "LOW" | "ACKNOWLEDGED";

export default function AlertsPage() {
  const [alerts, setAlerts] = useState<MockAlert[]>(MOCK_ALERTS);
  const [activeTab, setActiveTab] = useState<AlertFilterTab>("ALL");
  const [search, setSearch] = useState("");
  const [selectedAlert, setSelectedAlert] = useState<MockAlert | null>(null);

  const filtered = alerts.filter((item) => {
    if (activeTab === "CRITICAL" && item.severity !== "CRITICAL") return false;
    if (activeTab === "HIGH" && item.severity !== "HIGH") return false;
    if (activeTab === "MEDIUM" && item.severity !== "MEDIUM") return false;
    if (activeTab === "LOW" && item.severity !== "LOW") return false;
    if (activeTab === "ACKNOWLEDGED" && !item.acknowledged) return false;

    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        item.title.toLowerCase().includes(q) ||
        item.description.toLowerCase().includes(q) ||
        item.source.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const toggleAcknowledge = (id: string) => {
    setAlerts((prev) =>
      prev.map((a) => (a.id === id ? { ...a, acknowledged: !a.acknowledged } : a))
    );
  };

  const handleExport = () => {
    downloadDataAsCsv("echosense_acoustic_alerts.csv", filtered);
  };

  const criticalCount = alerts.filter((a) => a.severity === "CRITICAL" && !a.acknowledged).length;
  const highCount = alerts.filter((a) => a.severity === "HIGH" && !a.acknowledged).length;

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto w-full">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <BellRing className="h-6 w-6 text-emerald-500" />
            BOCD Changepoints &amp; Structural Alarms
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Real-time Bayesian statistical transitions, Conv1D Autoencoder anomaly spikes &amp; operator verification
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleExport} className="gap-1.5 text-xs cursor-pointer">
            <Download className="h-3.5 w-3.5" />
            Export Alarms CSV
          </Button>
        </div>
      </div>

      {/* KPI Stats Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card className="border border-border bg-card p-4">
          <span className="text-xs text-muted-foreground uppercase font-semibold">
            Critical Precursors
          </span>
          <div className="text-2xl font-bold font-mono text-red-500 mt-2">{criticalCount}</div>
        </Card>
        <Card className="border border-border bg-card p-4">
          <span className="text-xs text-muted-foreground uppercase font-semibold">
            High Severity BOCD Shifts
          </span>
          <div className="text-2xl font-bold font-mono text-amber-500 mt-2">{highCount}</div>
        </Card>
        <Card className="border border-border bg-card p-4">
          <span className="text-xs text-muted-foreground uppercase font-semibold">
            Active Filter Channels
          </span>
          <div className="text-2xl font-bold font-mono text-emerald-400 mt-2">12 / 12</div>
        </Card>
        <Card className="border border-border bg-card p-4">
          <span className="text-xs text-muted-foreground uppercase font-semibold">
            Mean Verification Lead Time
          </span>
          <div className="text-2xl font-bold font-mono text-foreground mt-2">~140 ms</div>
        </Card>
      </div>

      {/* Filter Tabs and Search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-1.5 bg-muted/60 p-1 rounded-lg border border-border">
          {(["ALL", "CRITICAL", "HIGH", "MEDIUM", "LOW", "ACKNOWLEDGED"] as AlertFilterTab[]).map(
            (tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-3 py-1 rounded-md text-xs font-semibold transition-colors cursor-pointer ${
                  activeTab === tab
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {tab}
              </button>
            )
          )}
        </div>

        <div className="relative max-w-xs w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            placeholder="Search alerts by title or sensor source..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="text-xs pl-9 h-9"
          />
        </div>
      </div>

      {/* Alert Cards List */}
      <div className="space-y-3">
        {filtered.map((item) => (
          <Card
            key={item.id}
            className={`border transition-colors hover:border-emerald-500/40 cursor-pointer ${
              item.acknowledged ? "opacity-75 bg-card/40" : "bg-card"
            }`}
            onClick={() => setSelectedAlert(item)}
          >
            <CardContent className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-start gap-3">
                <div className="mt-0.5">
                  {item.severity === "CRITICAL" ? (
                    <Flame className="h-5 w-5 text-red-500" />
                  ) : item.severity === "HIGH" ? (
                    <AlertTriangle className="h-5 w-5 text-amber-500" />
                  ) : item.severity === "MEDIUM" ? (
                    <Activity className="h-5 w-5 text-blue-500" />
                  ) : (
                    <Waves className="h-5 w-5 text-emerald-500" />
                  )}
                </div>

                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-xs font-semibold text-foreground">
                      {item.id}
                    </span>
                    <Badge
                      variant={
                        item.severity === "CRITICAL"
                          ? "destructive"
                          : item.severity === "HIGH"
                          ? "destructive"
                          : "warning"
                      }
                      className="text-[10px] py-0"
                    >
                      {item.severity}
                    </Badge>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-muted text-muted-foreground">
                      {item.category}
                    </span>
                    <span className="text-[10px] text-muted-foreground font-mono">
                      Source: {item.source}
                    </span>
                  </div>

                  <h3 className="text-sm font-semibold text-foreground">{item.title}</h3>
                  <p className="text-xs text-muted-foreground line-clamp-1">{item.description}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 shrink-0 sm:self-center">
                <span className="text-xs text-muted-foreground font-mono">{item.timestamp}</span>
                <Button
                  variant={item.acknowledged ? "outline" : "default"}
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleAcknowledge(item.id);
                  }}
                  className={`text-xs gap-1.5 cursor-pointer ${
                    !item.acknowledged ? "bg-emerald-600 hover:bg-emerald-500 text-white" : ""
                  }`}
                >
                  <Check className="h-3.5 w-3.5" />
                  {item.acknowledged ? "Verified" : "Acknowledge"}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Alert Detail Modal */}
      {selectedAlert && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg rounded-xl border border-border bg-card p-6 shadow-2xl animate-in fade-in-50 zoom-in-95 space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div className="flex items-center gap-2">
                <Badge variant="destructive">{selectedAlert.severity}</Badge>
                <span className="font-mono text-xs font-semibold text-foreground">
                  {selectedAlert.id}
                </span>
              </div>
              <button
                onClick={() => setSelectedAlert(null)}
                className="p-1 rounded-md text-muted-foreground hover:bg-muted hover:text-foreground cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <h3 className="text-base font-bold text-foreground">{selectedAlert.title}</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              {selectedAlert.description}
            </p>

            <div className="p-3 rounded-lg border border-border bg-muted/20 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Acoustic Source Node:</span>
                <span className="font-mono font-semibold text-foreground">
                  {selectedAlert.source}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Detection Category:</span>
                <span className="font-mono text-emerald-400 font-semibold">
                  {selectedAlert.category}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Trigger Timestamp:</span>
                <span className="font-mono text-foreground">{selectedAlert.timestamp}</span>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-border">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedAlert(null)}
                className="text-xs cursor-pointer"
              >
                Close
              </Button>
              <Button
                size="sm"
                onClick={() => {
                  toggleAcknowledge(selectedAlert.id);
                  setSelectedAlert(null);
                }}
                className="text-xs bg-emerald-600 hover:bg-emerald-500 text-white cursor-pointer"
              >
                Confirm Verification
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
