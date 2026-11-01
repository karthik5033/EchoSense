"use client";

import React, { useState } from "react";
import {
  UploadCloud,
  FileAudio,
  Database,
  CheckCircle2,
  Loader2,
  RefreshCw,
  Terminal,
  Activity,
  Download,
  AlertCircle,
  FileSpreadsheet,
  Waves,
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
import { MOCK_INGESTION_JOBS } from "@/lib/mockData";
import { downloadDataAsCsv } from "@/lib/utils";

export default function DataIngestionPage() {
  const [jobs, setJobs] = useState(MOCK_INGESTION_JOBS);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStage, setUploadStage] = useState("");

  const handleSimulateUpload = (datasetName: string = "smartphone_recording_pier2.wav") => {
    setIsUploading(true);
    setUploadProgress(15);
    setUploadStage("Validating audio PCM header & 48 kHz sampling integrity...");

    setTimeout(() => {
      setUploadProgress(45);
      setUploadStage("Applying zero-phase 4th-order Butterworth filter [500 Hz - 20 kHz]...");
    }, 600);

    setTimeout(() => {
      setUploadProgress(80);
      setUploadStage("Running STA/LTA acoustic event detection (threshold = 3.5)...");
    }, 1200);

    setTimeout(() => {
      setUploadProgress(100);
      setUploadStage("Completed! 84 acoustic crack events segmented & queued for TDA.");

      const newJob = {
        id: `job-${Date.now()}`,
        fileName: datasetName,
        fileSize: "48.2 MB",
        recordsCount: 84,
        status: "COMPLETED",
        uploadedBy: "Karthik K P",
        timestamp: "Just now",
      };

      setJobs([newJob, ...jobs]);
      setIsUploading(false);
    }, 1800);
  };

  const handleExport = () => {
    downloadDataAsCsv("echosense_ingestion_manifest.csv", jobs);
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <Database className="h-6 w-6 text-emerald-500" />
            Acoustic Signal Ingestion &amp; Preprocessing
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Ingest smartphone audio recordings (.wav, .mp3) and benchmark datasets (.mat, .h5) with automated STA/LTA event segmentation
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleSimulateUpload("siracusano_concrete_ae_train.mat")}
            className="gap-1.5 text-xs border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10 cursor-pointer"
          >
            <FileSpreadsheet className="h-3.5 w-3.5" />
            Load Siracusano Benchmark
          </Button>
          <Button variant="outline" size="sm" onClick={handleExport} className="gap-1.5 text-xs cursor-pointer">
            <Download className="h-3.5 w-3.5" />
            Export Ingestion Manifest
          </Button>
        </div>
      </div>

      {/* Upload Zone & Pipeline Health */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Drag and Drop Box */}
        <Card className="lg:col-span-2 border-2 border-dashed border-border hover:border-emerald-500/50 transition-colors bg-card/60 p-8 flex flex-col items-center justify-center text-center">
          <div className="h-14 w-14 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mb-4">
            <UploadCloud className="h-7 w-7" />
          </div>
          <h3 className="font-bold text-base text-foreground">
            Upload Smartphone Structural Acoustic Recording
          </h3>
          <p className="text-xs text-muted-foreground mt-1.5 max-w-sm">
            Drag and drop acoustic audio files (WAV, MP3, AAC, FLAC) or MATLAB (.mat) benchmark matrices up to 100 MB.
          </p>

          {isUploading ? (
            <div className="w-full max-w-md mt-6 space-y-2">
              <div className="flex items-center justify-between text-xs text-muted-foreground font-mono">
                <span className="flex items-center gap-2 text-foreground font-semibold">
                  <Loader2 className="h-3.5 w-3.5 animate-spin text-emerald-400" />
                  {uploadStage}
                </span>
                <span className="text-emerald-400 font-bold">{uploadProgress}%</span>
              </div>
              <Progress value={uploadProgress} className="h-2" />
            </div>
          ) : (
            <div className="flex flex-wrap items-center justify-center gap-3 mt-6">
              <Button
                size="sm"
                onClick={() => handleSimulateUpload("smartphone_mic_span1_48khz.wav")}
                className="gap-2 text-xs bg-emerald-600 hover:bg-emerald-500 text-white cursor-pointer"
              >
                <FileAudio className="h-3.5 w-3.5" />
                Select WAV File
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleSimulateUpload("d_angela_girder_test_specimen4.mat")}
                className="text-xs cursor-pointer"
              >
                Import D&apos;Angela Bridge Dataset
              </Button>
            </div>
          )}

          <div className="mt-4 flex items-center gap-4 text-[11px] text-muted-foreground/80">
            <span>Supported: 16/24-bit PCM</span>
            <span>•</span>
            <span>44.1 kHz - 48 kHz Mobile / 500 kHz Benchmark</span>
            <span>•</span>
            <span>STA/LTA Automated Slicing</span>
          </div>
        </Card>

        {/* Real-time Ingestion Engine Health */}
        <Card className="border border-border bg-card space-y-4 p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-border pb-3 mb-4">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Waves className="h-4 w-4 text-emerald-400" />
                Signal Preprocessing Stack
              </CardTitle>
              <Badge variant="outline" className="font-mono text-[10px] text-emerald-400 border-emerald-500/30">
                ACTIVE
              </Badge>
            </div>

            <div className="space-y-3.5 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Bandpass Filter:</span>
                <span className="font-mono font-semibold text-foreground">
                  4th-order Butterworth (500Hz - 20kHz)
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Zero-Phase Filtering:</span>
                <span className="font-mono font-semibold text-emerald-400">
                  scipy.signal.filtfilt (0 phase lag)
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">STA/LTA Ratio Trigger:</span>
                <span className="font-mono font-semibold text-foreground">
                  3.5 Trigger / 1.2 Detrigger
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Pre/Post Margin:</span>
                <span className="font-mono font-semibold text-foreground">
                  100 samples padding
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Polyphase Resampler:</span>
                <span className="font-mono font-semibold text-foreground">
                  Target: 48,000 Hz Standard
                </span>
              </div>
            </div>
          </div>

          <div className="p-3 rounded-lg border border-border bg-muted/20 text-[11px] text-muted-foreground leading-relaxed">
            Acoustic signals are segmented into isolated fracture burst windows before phase-space reconstruction
            via Takens delay embedding.
          </div>
        </Card>
      </div>

      {/* Ingestion History Table */}
      <Card className="border border-border bg-card">
        <CardHeader className="flex flex-row items-center justify-between pb-3 border-b border-border/50">
          <div>
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Activity className="h-4 w-4 text-primary" />
              Acoustic Ingestion &amp; Slicing Manifest
            </CardTitle>
            <CardDescription className="text-xs">
              Historical recordings, detected crack events count, and pipeline processing status
            </CardDescription>
          </div>
          <span className="text-xs font-mono text-muted-foreground">
            {jobs.length} Datasets Loaded
          </span>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="border-border/60">
                <TableHead className="text-xs">Job ID</TableHead>
                <TableHead className="text-xs">Signal File Name</TableHead>
                <TableHead className="text-xs">File Size</TableHead>
                <TableHead className="text-xs">Segmented AE Events</TableHead>
                <TableHead className="text-xs">Status</TableHead>
                <TableHead className="text-xs">Operator</TableHead>
                <TableHead className="text-xs text-right">Timestamp</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {jobs.map((job) => (
                <TableRow key={job.id} className="border-border/40 hover:bg-muted/30">
                  <TableCell className="font-mono text-xs font-semibold text-foreground">
                    {job.id}
                  </TableCell>
                  <TableCell className="text-xs font-medium text-foreground">
                    {job.fileName}
                  </TableCell>
                  <TableCell className="text-xs font-mono text-muted-foreground">
                    {job.fileSize}
                  </TableCell>
                  <TableCell className="text-xs font-mono font-bold text-foreground">
                    {job.recordsCount.toLocaleString()} bursts
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        job.status === "COMPLETED"
                          ? "default"
                          : job.status === "PROCESSING"
                          ? "warning"
                          : "destructive"
                      }
                      className="text-[10px]"
                    >
                      {job.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {job.uploadedBy}
                  </TableCell>
                  <TableCell className="text-xs text-right text-muted-foreground font-mono">
                    {job.timestamp}
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
