"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import {
  FileText,
  Download,
  Printer,
  ShieldCheck,
  ShieldAlert,
  AlertTriangle,
  CheckCircle2,
  Layers,
  Search,
  Hash,
  Database,
  Sliders,
  Check,
  Activity,
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
import { ASSESSMENT_REPORTS, AssessmentReport } from "@/lib/echosenseData";
import { downloadDataAsCsv } from "@/lib/utils";

// Mock sensor array telemetry for the active report
const SENSOR_CHANNELS = [
  { id: "CH-01", name: "Girder Midspan (R15α)", deltaT: "+0.0 µs (First Hit)", amp: "1.18 Vpp", energy: "2,450 pJ", status: "Primary Trigger" },
  { id: "CH-02", name: "Shear Key G2 (R15α)", deltaT: "+24.6 µs", amp: "0.84 Vpp", energy: "1,620 pJ", status: "Verified" },
  { id: "CH-03", name: "Anchor Tendon (Resonant)", deltaT: "+48.2 µs", amp: "0.62 Vpp", energy: "980 pJ", status: "Verified" },
  { id: "CH-04", name: "Pier P4 (Smartphone MEMS)", deltaT: "+165.4 µs", amp: "0.22 Vpp", energy: "210 pJ", status: "Active Node" },
];

export default function AssessmentReportsPage() {
  const [reports] = useState<AssessmentReport[]>(ASSESSMENT_REPORTS);
  const [activeReport, setActiveReport] = useState<AssessmentReport>(ASSESSMENT_REPORTS[1]);
  const [searchQuery, setSearchQuery] = useState("");
  const [riskFilter, setRiskFilter] = useState<"ALL" | "Critical" | "Moderate" | "Low">("ALL");

  const filteredReports = useMemo(() => {
    return reports.filter((rep) => {
      const matchesSearch =
        rep.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        rep.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        rep.analysisRef.toLowerCase().includes(searchQuery.toLowerCase()) ||
        rep.primaryDamageMode.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesRisk = riskFilter === "ALL" || rep.precursorRisk === riskFilter;

      return matchesSearch && matchesRisk;
    });
  }, [reports, searchQuery, riskFilter]);

  const handleDownloadPdf = (rep: AssessmentReport) => {
    alert(`Downloading ${rep.title} (${rep.fileSize})... Generated from TopoAE analysis pipeline.`);
  };

  const handleExportCsv = () => {
    downloadDataAsCsv("echosense_assessment_manifest.csv", reports);
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto w-full">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b border-border/60">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <FileText className="h-6 w-6 text-primary" />
            Structural Assessment Reports
          </h1>
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            onClick={() => handleDownloadPdf(activeReport)}
            className="bg-[#FF5500] hover:bg-[#E54B00] text-white gap-1.5 text-xs shadow-sm cursor-pointer"
          >
            <Download className="h-3.5 w-3.5" />
            Download PDF
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => window.print()}
            className="gap-1.5 text-xs cursor-pointer"
          >
            <Printer className="h-3.5 w-3.5" />
            Print Report
          </Button>
        </div>
      </div>

      {/* Main 2-Column Responsive Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column (4 cols): Archive Navigation & Audit Card */}
        <div className="lg:col-span-5 xl:col-span-4 space-y-5">
          {/* Card 1: Assessment Archive */}
          <Card className="border border-border bg-card">
            <CardHeader className="pb-3 border-b border-border/50">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <Layers className="h-4 w-4 text-primary" />
                  Assessment Archive
                </CardTitle>
                <span className="text-[11px] font-mono text-muted-foreground">
                  {filteredReports.length} of {reports.length}
                </span>
              </div>
              <CardDescription className="text-xs mt-1">
                Select an assessment to review executive findings &amp; engineering recommendations
              </CardDescription>

              {/* Search Bar */}
              <div className="relative mt-2">
                <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Filter by ID, girder, mode..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 bg-muted/40 border border-border rounded-lg text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>

              {/* Risk Filter Tabs */}
              <div className="flex items-center gap-1.5 mt-2.5 pt-2 border-t border-border/40 text-[11px]">
                {(["ALL", "Critical", "Moderate", "Low"] as const).map((risk) => (
                  <button
                    key={risk}
                    onClick={() => setRiskFilter(risk)}
                    className={`px-2.5 py-1 rounded-md font-medium transition-colors cursor-pointer ${
                      riskFilter === risk
                        ? "bg-secondary text-foreground font-semibold border border-border"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {risk === "ALL" ? "All" : risk}
                  </button>
                ))}
              </div>
            </CardHeader>

            <CardContent className="pt-3 space-y-2 max-h-[460px] overflow-y-auto">
              {filteredReports.length === 0 ? (
                <div className="py-8 text-center text-xs text-muted-foreground">
                  No assessment reports match your search query.
                </div>
              ) : (
                filteredReports.map((rep) => {
                  const isSelected = activeReport.id === rep.id;
                  const isCritical = rep.precursorRisk === "Critical";
                  const isModerate = rep.precursorRisk === "Moderate";

                  return (
                    <div
                      key={rep.id}
                      onClick={() => setActiveReport(rep)}
                      className={`p-3.5 rounded-xl border text-left cursor-pointer transition-all ${
                        isSelected
                          ? "border-[#FF5500] bg-[#FF5500]/10 shadow-sm"
                          : "border-border hover:border-primary/40 bg-card/60 hover:bg-muted/40"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-[11px] text-primary font-bold">
                          {rep.id}
                        </span>
                        <Badge
                          variant={isCritical ? "destructive" : isModerate ? "secondary" : "outline"}
                          className={`text-[10px] uppercase font-bold ${
                            !isCritical && !isModerate ? "border-border text-muted-foreground bg-muted/20" : ""
                          }`}
                        >
                          {rep.precursorRisk} Risk
                        </Badge>
                      </div>

                      <h4 className="text-xs font-bold text-foreground mt-1.5 leading-snug">
                        {rep.title}
                      </h4>

                      <div className="mt-2 flex items-center justify-between text-[11px] text-muted-foreground font-mono">
                        <span>Ref: {rep.analysisRef}</span>
                        <span>{rep.fileSize}</span>
                      </div>
                    </div>
                  );
                })
              )}
            </CardContent>
          </Card>

          {/* Card 2: Digital Audit Verification & Calibration Seal */}
          <Card className="border border-border bg-card">
            <CardHeader className="pb-3 border-b border-border/50">
              <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-primary" />
                Digital Audit &amp; Verification Protocol
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-3 space-y-2.5 text-xs font-mono">
              <div className="flex items-center justify-between p-2 rounded-lg bg-muted/30 border border-border/50">
                <span className="text-[11px] text-muted-foreground">Standard</span>
                <span className="text-[11px] font-bold text-foreground">EN 1330-9 &bull; ASTM E1316-24</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-lg bg-muted/30 border border-border/50">
                <span className="text-[11px] text-muted-foreground">Audit Signature</span>
                <span className="text-[11px] text-foreground font-mono font-bold">{activeReport.auditHash || "SHA-256: 7f8a42c3e12d"}</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-lg bg-muted/30 border border-border/50">
                <span className="text-[11px] text-muted-foreground">Model Engine</span>
                <span className="text-[11px] font-semibold text-foreground">TopoAE Conv1D-GUDHI v2.4</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-lg bg-muted/30 border border-border/50">
                <span className="text-[11px] text-muted-foreground">Array Ingestion</span>
                <span className="text-[11px] font-semibold text-foreground">65,536 pts @ 10 MS/s DMA</span>
              </div>

              <div className="pt-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleExportCsv}
                  className="w-full text-xs font-semibold gap-1.5 cursor-pointer"
                >
                  <Download className="h-3.5 w-3.5" />
                  Download Complete Audit Manifest
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column (8 cols): Formal In-App Document Preview */}
        <div className="lg:col-span-7 xl:col-span-8">
          <Card className="border border-border bg-card p-6 sm:p-8 space-y-6 shadow-xl relative overflow-hidden">
            {/* Watermark accent */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-[radial-gradient(ellipse_at_center,rgba(255,85,0,0.06)_0%,transparent_70%)] pointer-events-none" />

            {/* Document Header (Full Width - Zero Squishing) */}
            <div className="pb-5 border-b border-border/80 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-mono tracking-wider text-primary uppercase font-bold">
                      EchoSense Acoustic Diagnostics Lab
                    </span>
                    <Badge variant="outline" className="text-[10px] font-mono border-border text-muted-foreground">
                      OFFICIAL AUDIT REPORT
                    </Badge>
                  </div>
                  <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
                    {activeReport.title}
                  </h2>
                  <p className="text-xs text-muted-foreground">
                    Topological Acoustic Emission Damage Precursor Verification Protocol &bull; Reference {activeReport.analysisRef}
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <Button
                    size="sm"
                    onClick={() => handleDownloadPdf(activeReport)}
                    className="bg-[#FF5500] hover:bg-[#E54B00] text-white gap-1.5 text-xs h-8 shadow-sm cursor-pointer"
                  >
                    <Download className="h-3.5 w-3.5" />
                    PDF
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => window.print()}
                    className="gap-1.5 text-xs h-8 cursor-pointer"
                  >
                    <Printer className="h-3.5 w-3.5" />
                    Print
                  </Button>
                </div>
              </div>

              {/* Key Technical Metadata Strip (4 equal-width cells, full width) */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3.5 rounded-lg bg-muted/30 border border-border/60 text-xs font-mono">
                <div>
                  <span className="text-[10px] text-muted-foreground uppercase block font-semibold">Document ID</span>
                  <span className="font-bold text-foreground text-xs mt-0.5 block">{activeReport.id}</span>
                </div>
                <div>
                  <span className="text-[10px] text-muted-foreground uppercase block font-semibold">Generated (UTC)</span>
                  <span className="font-medium text-foreground text-xs mt-0.5 block">{activeReport.dateGenerated}</span>
                </div>
                <div>
                  <span className="text-[10px] text-muted-foreground uppercase block font-semibold">Lead Inspector</span>
                  <span className="font-medium text-foreground text-xs mt-0.5 block truncate" title={activeReport.author}>
                    {activeReport.author}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-muted-foreground uppercase block font-semibold">Compliance Standard</span>
                  <span className="font-medium text-foreground text-xs mt-0.5 block">EN 1330-9 &bull; ASTM E1316</span>
                </div>
              </div>
            </div>

            {/* Executive Risk Determination Card */}
            <div
              className={`p-4 rounded-xl border ${
                activeReport.precursorRisk === "Critical"
                  ? "border-[#FF5500]/40 bg-[#FF5500]/10"
                  : "border-border bg-muted/20"
              }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs uppercase font-mono font-bold tracking-wider text-foreground">
                  Executive Risk Determination
                </span>
                <Badge
                  variant={activeReport.precursorRisk === "Critical" ? "destructive" : "outline"}
                  className="text-xs font-bold font-mono"
                >
                  {activeReport.precursorRisk} Precursor Severity
                </Badge>
              </div>
              <p className="text-xs text-foreground/90 font-medium leading-relaxed">
                {activeReport.overallCondition}
              </p>
            </div>

            {/* Quantitative Pipeline Stage Verifications (4 Equal-Height Cards) */}
            <div className="space-y-3 text-xs">
              <h3 className="font-semibold text-foreground uppercase tracking-wider font-mono text-[11px] pb-1 border-b border-border/50">
                Quantitative Pipeline Stage Verifications
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3.5 rounded-lg border border-border bg-muted/20 flex flex-col justify-between">
                  <span className="text-[10px] font-mono text-muted-foreground block uppercase font-semibold">
                    Primary Damage Mode
                  </span>
                  <span className="text-xs font-bold text-foreground block mt-1">
                    {activeReport.primaryDamageMode}
                  </span>
                </div>

                <div className="p-3.5 rounded-lg border border-border bg-muted/20 flex flex-col justify-between">
                  <span className="text-[10px] font-mono text-muted-foreground block uppercase font-semibold">
                    Persistent Homology Status
                  </span>
                  <span className="text-xs font-bold text-foreground block mt-1">
                    {activeReport.h1Loops || 19} H₁ Loops Detected (Max pers. {activeReport.maxPersistence || 0.880})
                  </span>
                </div>

                <div className="p-3.5 rounded-lg border border-border bg-muted/20 flex flex-col justify-between">
                  <span className="text-[10px] font-mono text-muted-foreground block uppercase font-semibold">
                    BOCD Statistical Shifts
                  </span>
                  <span className="text-xs font-bold text-foreground block mt-1">
                    {activeReport.changepoints || 4} Irreversible Changepoints (Lead: {activeReport.leadTimeMs || 340}ms)
                  </span>
                </div>

                <div className="p-3.5 rounded-lg border border-border bg-muted/20 flex flex-col justify-between">
                  <span className="text-[10px] font-mono text-muted-foreground block uppercase font-semibold">
                    Classification Metric
                  </span>
                  <span className="text-xs font-bold text-foreground block mt-1">
                    F1: {activeReport.f1Score || 0.938} ({((activeReport.accuracy || 0.946) * 100).toFixed(1)}% Accuracy)
                  </span>
                </div>
              </div>
            </div>

            {/* Acoustic Array Telemetry Table */}
            <div className="space-y-3 text-xs">
              <h3 className="font-semibold text-foreground uppercase tracking-wider font-mono text-[11px] pb-1 border-b border-border/50">
                4-Channel Synchronized Sensor Array Telemetry
              </h3>

              <div className="rounded-lg border border-border overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/40 text-[11px]">
                      <TableHead className="font-mono">Channel</TableHead>
                      <TableHead>Sensor Location</TableHead>
                      <TableHead className="font-mono">TDoA (Δt)</TableHead>
                      <TableHead className="font-mono">Peak Amp</TableHead>
                      <TableHead className="font-mono">Energy</TableHead>
                      <TableHead className="text-right">Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {SENSOR_CHANNELS.map((ch) => (
                      <TableRow key={ch.id} className="text-xs font-mono">
                        <TableCell className="font-bold text-primary">{ch.id}</TableCell>
                        <TableCell className="font-sans font-medium text-foreground">{ch.name}</TableCell>
                        <TableCell className="text-muted-foreground">{ch.deltaT}</TableCell>
                        <TableCell className="text-foreground">{ch.amp}</TableCell>
                        <TableCell className="text-muted-foreground">{ch.energy}</TableCell>
                        <TableCell className="text-right">
                          <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-semibold ${
                            ch.status === "Primary Trigger"
                              ? "bg-primary/10 text-primary border border-primary/30"
                              : "bg-muted text-muted-foreground border border-border"
                          }`}>
                            {ch.status}
                          </span>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>

            {/* Actionable Structural Engineering Recommendations */}
            <div className="space-y-2 text-xs">
              <h3 className="font-semibold text-foreground uppercase tracking-wider font-mono text-[11px] pb-1 border-b border-border/50">
                Actionable Structural Engineering Recommendations
              </h3>
              <ul className="space-y-2 text-muted-foreground leading-relaxed">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                  <span>
                    Initiate ultrasonic non-destructive testing (NDT) across the shear key zone within 48 hours to confirm subsurface micro-delamination depth.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                  <span>
                    Maintain active TopoAE real-time acoustic streaming at 500 kHz to observe rate of secondary changepoint arrivals.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                  <span>
                    Archive raw acoustic waveform records in compliance with EN 1330-9 and ASTM E1316 acoustic emission testing standards.
                  </span>
                </li>
              </ul>
            </div>

            {/* Document Sign-off Footer */}
            <div className="pt-6 border-t border-border/60 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-[11px] text-muted-foreground font-mono">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-primary" />
                <span>Sign-off: Lead Structural Diagnostics Specialist, PE &bull; NDT Level III</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-zinc-500">Hash: {activeReport.auditHash || "SHA-256: 7f8a42c3e12d"}</span>
                <span className="text-foreground font-semibold">EchoSense TopoAE Certified</span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
