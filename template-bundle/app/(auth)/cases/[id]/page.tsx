"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ChevronLeft,
  Clock,
  ShieldAlert,
  CheckCircle2,
  AlertTriangle,
  Send,
  User,
  Activity,
  FileCode,
  Share2,
  Check,
  Zap,
  Waves,
  Eye,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { MOCK_CASES, MockCase } from "@/lib/mockData";

export default function CaseDetailPage() {
  const params = useParams();
  const caseId = (params?.id as string) || "case-101";

  const foundCase = MOCK_CASES.find((c) => c.id === caseId) || MOCK_CASES[0];
  const [currentStatus, setCurrentStatus] = useState(foundCase.status);
  const [commentInput, setCommentInput] = useState("");
  const [comments, setComments] = useState([
    {
      author: "Karthik K P",
      time: "2 hours ago",
      text: "Takens embedding (τ=4, d=4) confirms formation of persistent H1 cycle. Birth at ε=0.32, death at ε=2.14.",
    },
    {
      author: "Gagandeep Rai",
      time: "45 mins ago",
      text: "BOCD run-length probability spiked to 0.89. Shear crack precursor verified against reference transducer.",
    },
  ]);
  const [actionApproved, setActionApproved] = useState(false);

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentInput.trim()) return;
    setComments([
      ...comments,
      { author: "Karthik K P (You)", time: "Just now", text: commentInput },
    ]);
    setCommentInput("");
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto w-full">
      {/* Back button & Breadcrumb */}
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <Link href="/cases" className="hover:text-foreground flex items-center gap-1 transition-colors">
          <ChevronLeft className="h-4 w-4" />
          Back to Damage Incidents
        </Link>
        <span>/</span>
        <span className="font-mono text-foreground font-semibold">{foundCase.code}</span>
      </div>

      {/* Case Header Card */}
      <Card className="border border-border bg-card p-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                {foundCase.code}
              </span>
              <Badge
                variant={
                  foundCase.priority === "CRITICAL"
                    ? "destructive"
                    : foundCase.priority === "HIGH"
                    ? "destructive"
                    : "warning"
                }
                className="text-xs font-semibold"
              >
                {foundCase.priority}
              </Badge>
              <span className="text-xs text-muted-foreground flex items-center gap-1">
                <Clock className="h-3.5 w-3.5" /> Logged {foundCase.createdAt.substring(0, 10)}
              </span>
            </div>

            <h1 className="text-xl sm:text-2xl font-extrabold text-foreground tracking-tight">
              {foundCase.title}
            </h1>
            <p className="text-xs text-muted-foreground max-w-3xl leading-relaxed">
              {foundCase.summary}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <select
              value={currentStatus}
              onChange={(e) => setCurrentStatus(e.target.value as any)}
              className="text-xs font-semibold bg-muted border border-border rounded-lg px-3 py-2 text-foreground focus:outline-none cursor-pointer"
            >
              <option value="OPEN">Status: OPEN</option>
              <option value="INVESTIGATING">Status: INVESTIGATING</option>
              <option value="MITIGATING">Status: MITIGATING</option>
              <option value="RESOLVED">Status: RESOLVED</option>
            </select>

            <Button
              onClick={() => setActionApproved(true)}
              disabled={actionApproved}
              className={`text-xs gap-1.5 shadow-sm cursor-pointer ${
                actionApproved
                  ? "bg-emerald-600 text-white"
                  : "bg-emerald-600 hover:bg-emerald-500 text-white"
              }`}
            >
              {actionApproved ? (
                <>
                  <Check className="h-3.5 w-3.5" />
                  Precursor Verified
                </>
              ) : (
                <>
                  <ShieldAlert className="h-3.5 w-3.5" />
                  Verify Precursor
                </>
              )}
            </Button>
          </div>
        </div>

        <div className="mt-6 pt-6 border-t border-border grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div>
            <span className="text-[11px] text-muted-foreground block uppercase font-mono">
              CDPI Risk Score
            </span>
            <div className="mt-1 flex items-center gap-2">
              <span className="text-xl font-bold font-mono text-emerald-400">
                {foundCase.impactScore} / 100
              </span>
            </div>
          </div>
          <div>
            <span className="text-[11px] text-muted-foreground block uppercase font-mono">
              Lead Investigator
            </span>
            <span className="text-sm font-semibold text-foreground mt-1 block">
              {foundCase.assignee.name}
            </span>
          </div>
          <div>
            <span className="text-[11px] text-muted-foreground block uppercase font-mono">
              Sensor Channel
            </span>
            <span className="text-sm font-semibold text-foreground mt-1 block">
              Phone-MEMS-Span2 (48 kHz)
            </span>
          </div>
          <div>
            <span className="text-[11px] text-muted-foreground block uppercase font-mono">
              Fracture Mode
            </span>
            <span className="text-sm font-semibold text-foreground mt-1 block">
              Web Shear Crack (Class 2)
            </span>
          </div>
        </div>
      </Card>

      {/* Main Tabs Area */}
      <Tabs defaultValue="timeline" className="w-full">
        <TabsList className="bg-muted/40 border border-border p-1">
          <TabsTrigger value="timeline" className="text-xs">
            Acoustic Event Timeline
          </TabsTrigger>
          <TabsTrigger value="notes" className="text-xs">
            TDA Diagnostics &amp; Notes
          </TabsTrigger>
          <TabsTrigger value="raw" className="text-xs">
            Persistence Vector (JSON)
          </TabsTrigger>
        </TabsList>

        {/* Timeline Tab */}
        <TabsContent value="timeline" className="mt-4">
          <Card className="border border-border bg-card p-5">
            <h3 className="text-sm font-bold text-foreground mb-4">
              Structural Acoustic Burst Chronology
            </h3>
            <div className="space-y-4 relative pl-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-border">
              <div className="relative">
                <span className="absolute -left-6 top-1 h-3 w-3 rounded-full bg-emerald-500 ring-4 ring-card" />
                <div className="text-xs font-semibold text-foreground">
                  STA/LTA Burst Trigger Threshold (3.5 Ratio) Exceeded
                </div>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  Transient acoustic energy burst registered across channels 1 and 2 with 48 kHz sampling.
                </p>
                <span className="text-[10px] text-muted-foreground font-mono mt-1 block">
                  10 mins ago
                </span>
              </div>

              <div className="relative">
                <span className="absolute -left-6 top-1 h-3 w-3 rounded-full bg-indigo-500 ring-4 ring-card" />
                <div className="text-xs font-semibold text-foreground">
                  Takens Embedding Reconstruction Converged (τ=4, d=4)
                </div>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  Average Mutual Information first local minimum established; FNN ratio dropped under 1%.
                </p>
                <span className="text-[10px] text-muted-foreground font-mono mt-1 block">
                  8 mins ago
                </span>
              </div>

              <div className="relative">
                <span className="absolute -left-6 top-1 h-3 w-3 rounded-full bg-amber-500 ring-4 ring-card" />
                <div className="text-xs font-semibold text-foreground">
                  Bayesian Online Changepoint Alert P(r=0) = 0.89
                </div>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  Statistical shift in persistent entropy stream confirmed micro-crack precursor.
                </p>
                <span className="text-[10px] text-muted-foreground font-mono mt-1 block">
                  5 mins ago
                </span>
              </div>
            </div>
          </Card>
        </TabsContent>

        {/* Notes & Diagnostics Tab */}
        <TabsContent value="notes" className="mt-4">
          <Card className="border border-border bg-card p-5 space-y-4">
            <h3 className="text-sm font-bold text-foreground">
              Investigator Collaboration &amp; Inspection Log
            </h3>

            <div className="space-y-3">
              {comments.map((comm, idx) => (
                <div key={idx} className="p-3 rounded-lg border border-border/60 bg-muted/20 text-xs">
                  <div className="flex items-center justify-between font-semibold text-foreground">
                    <span>{comm.author}</span>
                    <span className="text-[10px] text-muted-foreground font-mono font-normal">
                      {comm.time}
                    </span>
                  </div>
                  <p className="text-muted-foreground mt-1 leading-relaxed">{comm.text}</p>
                </div>
              ))}
            </div>

            <form onSubmit={handleAddComment} className="flex gap-2 pt-2">
              <input
                placeholder="Add structural inspection note or TDA observation..."
                value={commentInput}
                onChange={(e) => setCommentInput(e.target.value)}
                className="flex-1 rounded-md border border-input bg-transparent px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none"
              />
              <Button type="submit" size="sm" className="text-xs bg-emerald-600 hover:bg-emerald-500 text-white cursor-pointer">
                <Send className="h-3 w-3" />
                Post Note
              </Button>
            </form>
          </Card>
        </TabsContent>

        {/* Raw JSON Vector Tab */}
        <TabsContent value="raw" className="mt-4">
          <Card className="border border-border bg-card p-5">
            <h3 className="text-sm font-bold text-foreground mb-2 flex items-center gap-2">
              <FileCode className="h-4 w-4 text-emerald-400" />
              Serialized Persistence Diagram &amp; Feature Vector
            </h3>
            <pre className="p-4 rounded-lg bg-zinc-950 text-emerald-400 font-mono text-[11px] overflow-x-auto border border-border/80">
{JSON.stringify(
  {
    incident_id: foundCase.code,
    timestamp: foundCase.createdAt,
    sampling_rate: 48000,
    optimal_tau: 4,
    optimal_dim: 4,
    fnn_ratio: 0.006,
    h0_components_count: 142,
    h1_loops_count: 38,
    persistent_entropy_h0: 2.841,
    persistent_entropy_h1: 3.418,
    autoencoder_mse: 0.0821,
    bocd_changepoint_prob: 0.892,
    predicted_class: "MICRO_CRACK_SHEAR_PRECURSOR",
    confidence: 0.941,
  },
  null,
  2
)}
            </pre>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
