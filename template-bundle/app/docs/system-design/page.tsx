"use client";

import React from "react";
import Link from "next/link";
import { ChevronRight, Layers, ArrowRight, ShieldCheck, Cpu, Database, CheckCircle2, Waves, Binary } from "lucide-react";
import { AppLogo } from "@/components/ui/AppLogo";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export default function SystemDesignPage() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 flex items-center justify-between px-6 py-4 bg-background/80 backdrop-blur-md border-b border-border/60">
        <div className="flex items-center gap-4">
          <Link href="/" className="hover:opacity-90">
            <AppLogo size="md" />
          </Link>
          <div className="hidden sm:flex items-center gap-1.5 text-xs text-muted-foreground border-l border-border pl-4">
            <Link href="/docs" className="hover:text-foreground">
              Documentation
            </Link>
            <ChevronRight className="h-3 w-3" />
            <span className="text-foreground font-semibold">System Design RFC</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link href="/docs">
            <Button variant="ghost" size="sm" className="text-xs">
              API Docs
            </Button>
          </Link>
          <Link href="/dashboard">
            <Button size="sm" className="gap-2 text-xs bg-emerald-600 hover:bg-emerald-500 text-white cursor-pointer">
              Launch Dashboard
              <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </Link>
        </div>
      </header>

      {/* Body */}
      <main className="max-w-4xl mx-auto px-6 py-12 flex-1 w-full space-y-10">
        <div className="space-y-4">
          <Badge variant="outline" className="gap-1.5 px-3 py-1 font-mono text-emerald-400 border-emerald-500/30">
            <Layers className="h-3.5 w-3.5 text-emerald-400" />
            RFC-2026-TDA-01
          </Badge>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            EchoSense System Design &amp; Mathematical RFC
          </h1>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Theoretical formulation, state-space reconstruction proofs, Vietoris-Rips filtration complexity,
            and Bayesian online changepoint mechanics.
          </p>
        </div>

        <div className="space-y-6 text-sm text-muted-foreground leading-relaxed">
          {/* Section 1 */}
          <Card className="border border-border bg-card">
            <CardHeader className="pb-3 border-b border-border/50">
              <CardTitle className="text-base font-bold text-foreground flex items-center gap-2">
                <Waves className="h-4 w-4 text-emerald-400" />
                1. Takens Delay-Coordinate Embedding Theorem
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4 space-y-3 text-xs leading-relaxed">
              <p>
                According to Takens&apos; Embedding Theorem (1981), if the underlying structural dynamical system evolves on an
                unknown d-dimensional smooth manifold M, the dynamics can be reconstructed up to diffeomorphism from a scalar
                time series s(t) by forming delay coordinate vectors:
              </p>
              <div className="p-3 rounded-lg bg-zinc-950 font-mono text-emerald-400 text-xs border border-border">
                x(n) = [ s(n), s(n + τ), s(n + 2τ), ..., s(n + (d - 1)τ) ]^T
              </div>
              <p>
                In EchoSense, optimal delay τ is determined by the first minimum of the <strong>Average Mutual Information (AMI)</strong> function,
                and minimal embedding dimension d is evaluated via the <strong>False Nearest Neighbors (FNN)</strong> criterion when FNN ratio drops below 1%.
              </p>
            </CardContent>
          </Card>

          {/* Section 2 */}
          <Card className="border border-border bg-card">
            <CardHeader className="pb-3 border-b border-border/50">
              <CardTitle className="text-base font-bold text-foreground flex items-center gap-2">
                <Binary className="h-4 w-4 text-emerald-400" />
                2. Vietoris-Rips Persistent Homology Filtration
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4 space-y-3 text-xs leading-relaxed">
              <p>
                For the embedded point cloud X, the Vietoris-Rips complex VR(X, ε) is defined as the abstract simplicial complex
                where any k-simplex &#123;x0, x1, ..., xk&#125; is included if all pairwise Euclidean distances are at most ε:
              </p>
              <div className="p-3 rounded-lg bg-zinc-950 font-mono text-emerald-400 text-xs border border-border">
                VR(X, ε) = &#123; σ ⊆ X | ∀ u, v ∈ σ, ||u - v|| ≤ ε &#125;
              </div>
              <p>
                As ε increases from 0 to ε_max, persistent homology tracks the birth (b) and death (d) of topological cycles in dimensions 0 and 1:
              </p>
              <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
                <li><strong>H0 Homology:</strong> Connected components, reflecting clustering and point density across scales.</li>
                <li><strong>H1 Homology:</strong> 1-dimensional cycles / loops, capturing orbital non-linear friction and crack wave slip paths.</li>
              </ul>
            </CardContent>
          </Card>

          {/* Section 3 */}
          <Card className="border border-border bg-card">
            <CardHeader className="pb-3 border-b border-border/50">
              <CardTitle className="text-base font-bold text-foreground flex items-center gap-2">
                <Cpu className="h-4 w-4 text-emerald-400" />
                3. Bayesian Online Changepoint Detection (BOCD)
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4 space-y-3 text-xs leading-relaxed">
              <p>
                To provide instantaneous precursor warnings, EchoSense processes sequential persistent entropy streams using
                the recursive algorithm of Adams &amp; MacKay (2007). Given the run-length r_t (time since the last changepoint):
              </p>
              <div className="p-3 rounded-lg bg-zinc-950 font-mono text-emerald-400 text-xs border border-border">
                P(r_t = 0 | x_&#123;1:t&#125;) = ∑_&#123;r_&#123;t-1&#125;&#125; P(r_&#123;t-1&#125; | x_&#123;1:t-1&#125;) · π_t^(r) · H(r_&#123;t-1&#125;) / ∑_&#123;r_t&#125; P(r_t, x_&#123;1:t&#125;)
              </div>
              <p>
                A structural anomaly alarm is broadcast whenever P(r_t = 0 | x_&#123;1:t&#125;) &gt; 0.65 for two consecutive acoustic event slices.
              </p>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
