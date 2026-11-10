"use client";

import React from "react";
import { ShieldCheck, Activity, BrainCircuit, ArrowDown, CheckCircle2 } from "lucide-react";

export function DecisionEngineDiagram() {
  return (
    <div className="space-y-6 select-none">
      <div className="rounded-xl border border-[#23232c] bg-[#0f0f14] p-5 sm:p-6 shadow-2xl space-y-6">
        <div className="flex items-center justify-between pb-3 border-b border-[#1f1f26]">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span className="text-xs font-mono uppercase tracking-wider text-zinc-300 font-semibold">
              Tri-Branch ML Decision &amp; Precursor Verification Engine
            </span>
          </div>
          <span className="text-[11px] font-mono text-emerald-400">
            Combined F1 Score: 0.938 (94.6% Accuracy)
          </span>
        </div>

        {/* 3 Branches Layout */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Branch 1: Supervised Random Forest */}
          <div className="p-5 rounded-xl border border-[#24242e] bg-[#14141a] space-y-4 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between text-zinc-400 mb-2">
                <span className="text-[10px] font-mono font-bold text-zinc-500 uppercase">
                  BRANCH A: SUPERVISED
                </span>
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
              </div>
              <h4 className="text-sm font-bold text-white">Topological Random Forest</h4>
              <p className="text-xs text-zinc-400 mt-1.5 leading-relaxed font-sans">
                250-tree ensemble trained on 128-dimensional topological vector embeddings (Betti curves, persistence entropy, and landscape integrals).
              </p>
            </div>

            <div className="space-y-2 pt-3 border-t border-[#1f1f26]">
              <div className="flex items-center justify-between text-[11px] font-mono">
                <span className="text-zinc-500">Test Accuracy</span>
                <span className="text-emerald-400 font-bold">94.6%</span>
              </div>
              <div className="flex items-center justify-between text-[11px] font-mono">
                <span className="text-zinc-500">Precursor F1</span>
                <span className="text-white font-semibold">0.938</span>
              </div>
              <div className="flex items-center justify-between text-[11px] font-mono">
                <span className="text-zinc-500">Output Modes</span>
                <span className="text-zinc-300">Tensile, Shear, Mixed</span>
              </div>
            </div>
          </div>

          {/* Branch 2: Unsupervised Conv1D Autoencoder */}
          <div className="p-5 rounded-xl border border-[#24242e] bg-[#14141a] space-y-4 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between text-zinc-400 mb-2">
                <span className="text-[10px] font-mono font-bold text-zinc-500 uppercase">
                  BRANCH B: UNSUPERVISED
                </span>
                <BrainCircuit className="w-4 h-4 text-cyan-400" />
              </div>
              <h4 className="text-sm font-bold text-white">Conv1D Autoencoder</h4>
              <p className="text-xs text-zinc-400 mt-1.5 leading-relaxed font-sans">
                5-layer convolutional autoencoder trained on baseline undamaged waveforms. Detects out-of-distribution acoustic bursts via reconstruction loss.
              </p>
            </div>

            <div className="space-y-2 pt-3 border-t border-[#1f1f26]">
              <div className="flex items-center justify-between text-[11px] font-mono">
                <span className="text-zinc-500">Latent Bottleneck</span>
                <span className="text-cyan-400 font-bold">16 Dim</span>
              </div>
              <div className="flex items-center justify-between text-[11px] font-mono">
                <span className="text-zinc-500">Anomaly Metric</span>
                <span className="text-white font-semibold">MSE Residual Loss</span>
              </div>
              <div className="flex items-center justify-between text-[11px] font-mono">
                <span className="text-zinc-500">Validation Mode</span>
                <span className="text-zinc-300">Zero-Shot Anomaly</span>
              </div>
            </div>
          </div>

          {/* Branch 3: BOCD Changepoint Detector */}
          <div className="p-5 rounded-xl border border-[#24242e] bg-[#14141a] space-y-4 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between text-zinc-400 mb-2">
                <span className="text-[10px] font-mono font-bold text-[#FF5500] uppercase">
                  BRANCH C: TEMPORAL REGIME
                </span>
                <Activity className="w-4 h-4 text-[#FF5500]" />
              </div>
              <h4 className="text-sm font-bold text-white">BOCD Changepoint Engine</h4>
              <p className="text-xs text-zinc-400 mt-1.5 leading-relaxed font-sans">
                Bayesian online recursive run-length distribution tracking. Collapses posterior to zero when topological dynamics shift, alerting 340ms ahead of failure.
              </p>
            </div>

            <div className="space-y-2 pt-3 border-t border-[#1f1f26]">
              <div className="flex items-center justify-between text-[11px] font-mono">
                <span className="text-zinc-500">Warning Lead Time</span>
                <span className="text-[#FF5500] font-bold">340 ms</span>
              </div>
              <div className="flex items-center justify-between text-[11px] font-mono">
                <span className="text-zinc-500">Hazard Function</span>
                <span className="text-white font-semibold">lambda = 250 windows</span>
              </div>
              <div className="flex items-center justify-between text-[11px] font-mono">
                <span className="text-zinc-500">Amortized Cost</span>
                <span className="text-zinc-300">O(1) Recursive</span>
              </div>
            </div>
          </div>
        </div>

        {/* Consensus Verification Banner */}
        <div className="p-4 rounded-xl border border-[#262634] bg-[#121218] flex items-center justify-between text-xs font-mono text-zinc-300">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Multi-Model Consensus: Both Branch A &amp; Branch C must affirm precursor initiation before critical alarm dispatch.</span>
          </div>
          <span className="hidden sm:inline-block text-[11px] text-zinc-500 font-bold uppercase">
            False Positive Rate &lt; 1.8%
          </span>
        </div>
      </div>
    </div>
  );
}

