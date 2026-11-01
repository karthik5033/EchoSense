"use client";

import React, { useState } from "react";
import {
  Network,
  Search,
  Filter,
  ShieldCheck,
  AlertTriangle,
  Radio,
  Zap,
  Layers,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  X,
  ExternalLink,
  Sliders,
  Activity,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { MOCK_NETWORK_NODES, MOCK_NETWORK_LINKS } from "@/lib/mockData";

export default function NetworkPage() {
  const [selectedNodeId, setSelectedNodeId] = useState<string>("node-1");
  const [zoomLevel, setZoomLevel] = useState(1);
  const [filtrationEpsilon, setFiltrationEpsilon] = useState(1.42);

  const selectedNode = MOCK_NETWORK_NODES.find((n) => n.id === selectedNodeId) || MOCK_NETWORK_NODES[0];

  const connectedLinks = MOCK_NETWORK_LINKS.filter(
    (l) => l.source === selectedNode.id || l.target === selectedNode.id
  );

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <Network className="h-6 w-6 text-emerald-500" />
            Takens Attractor &amp; Simplicial Topology
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Phase-space trajectory reconstruction (τ = 4, d = 4) and Vietoris-Rips simplicial filtration complex
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setZoomLevel((z) => Math.min(1.5, z + 0.1))}
            className="h-8 w-8 p-0 cursor-pointer"
            title="Zoom In"
          >
            <ZoomIn className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setZoomLevel((z) => Math.max(0.7, z - 0.1))}
            className="h-8 w-8 p-0 cursor-pointer"
            title="Zoom Out"
          >
            <ZoomOut className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setZoomLevel(1)}
            className="h-8 w-8 p-0 cursor-pointer"
            title="Reset Zoom"
          >
            <RotateCcw className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Network Canvas & Inspector Split */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Interactive SVG Mesh Canvas */}
        <Card className="lg:col-span-2 border border-border bg-card relative overflow-hidden min-h-[460px] flex flex-col">
          <CardHeader className="border-b border-border/50 py-3 px-4 flex flex-row items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-mono text-muted-foreground">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Vietoris-Rips Complex ε = {filtrationEpsilon.toFixed(2)} | Zoom: {(zoomLevel * 100).toFixed(0)}%</span>
            </div>
            <div className="flex items-center gap-2">
              <Sliders className="h-3.5 w-3.5 text-muted-foreground" />
              <input
                type="range"
                min="0.5"
                max="3.0"
                step="0.05"
                value={filtrationEpsilon}
                onChange={(e) => setFiltrationEpsilon(parseFloat(e.target.value))}
                className="w-24 accent-emerald-500 h-1 cursor-pointer"
              />
            </div>
          </CardHeader>

          <CardContent className="p-0 flex-1 flex items-center justify-center bg-zinc-950 dark:bg-black/90 relative">
            {/* SVG Visual Canvas */}
            <svg
              className="w-full h-[400px] select-none transition-transform duration-200"
              style={{ transform: `scale(${zoomLevel})` }}
              viewBox="0 0 500 450"
            >
              <defs>
                <linearGradient id="edgeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#10b981" stopOpacity="0.6" />
                  <stop offset="100%" stopColor="#6366f1" stopOpacity="0.4" />
                </linearGradient>
              </defs>

              {/* Rips Complex 1-Simplices (Edges) */}
              {MOCK_NETWORK_LINKS.map((link, idx) => {
                const sNode = MOCK_NETWORK_NODES.find((n) => n.id === link.source);
                const tNode = MOCK_NETWORK_NODES.find((n) => n.id === link.target);
                if (!sNode || !tNode) return null;

                const isConnected =
                  sNode.id === selectedNode.id || tNode.id === selectedNode.id;

                return (
                  <line
                    key={idx}
                    x1={sNode.x}
                    y1={sNode.y}
                    x2={tNode.x}
                    y2={tNode.y}
                    stroke={isConnected ? "#10b981" : "rgba(255,255,255,0.15)"}
                    strokeWidth={isConnected ? 2.5 : 1.2}
                    strokeDasharray={link.strength < 70 ? "4 4" : undefined}
                    className="transition-all duration-300"
                  />
                );
              })}

              {/* Attractor Vertices (0-Simplices) */}
              {MOCK_NETWORK_NODES.map((node) => {
                const isSelected = node.id === selectedNode.id;
                const isBurst = node.type === "Burst";
                const isH1 = node.type === "H1";

                return (
                  <g
                    key={node.id}
                    onClick={() => setSelectedNodeId(node.id)}
                    className="cursor-pointer group"
                  >
                    {/* Pulsing ring for H1 loop generator */}
                    {isH1 && (
                      <circle
                        cx={node.x}
                        cy={node.y}
                        r="18"
                        fill="none"
                        stroke="#10b981"
                        strokeWidth="1.5"
                        strokeDasharray="2 2"
                        className="animate-spin"
                        style={{ transformOrigin: `${node.x}px ${node.y}px` }}
                      />
                    )}

                    <circle
                      cx={node.x}
                      cy={node.y}
                      r={isSelected ? 12 : 9}
                      fill={
                        isBurst
                          ? "#ef4444"
                          : isH1
                          ? "#10b981"
                          : isSelected
                          ? "#10b981"
                          : "#27272a"
                      }
                      stroke={isSelected ? "#ffffff" : isBurst ? "#dc2626" : "#3f3f46"}
                      strokeWidth={isSelected ? 3 : 1.5}
                      className="transition-all group-hover:scale-125"
                    />

                    <text
                      x={node.x}
                      y={node.y + 22}
                      textAnchor="middle"
                      fill="#a1a1aa"
                      fontSize="10"
                      fontFamily="monospace"
                      className="pointer-events-none select-none font-medium"
                    >
                      {node.label}
                    </text>
                  </g>
                );
              })}
            </svg>
          </CardContent>
        </Card>

        {/* Node Inspector Panel */}
        <Card className="border border-border bg-card p-5 space-y-5 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div>
                <CardTitle className="text-sm font-bold text-foreground">
                  {selectedNode.label}
                </CardTitle>
                <CardDescription className="text-xs font-mono">
                  Simplicial Vertex ID: {selectedNode.id}
                </CardDescription>
              </div>
              <Badge
                variant={
                  selectedNode.status === "healthy"
                    ? "default"
                    : selectedNode.status === "warning"
                    ? "warning"
                    : "destructive"
                }
                className="text-[10px]"
              >
                {selectedNode.type}
              </Badge>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Embedding Vector:</span>
                <span className="font-mono font-semibold text-foreground">
                  [{selectedNode.x}, {selectedNode.y}, {(selectedNode.x * 0.4).toFixed(0)}, {(selectedNode.y * 0.6).toFixed(0)}]
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Homology Group:</span>
                <span className="font-mono font-semibold text-emerald-400">
                  {selectedNode.type === "H1" ? "H1 (1-Cycle / Loop)" : "H0 (Connected Component)"}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Birth Filtration (ε):</span>
                <span className="font-mono font-semibold text-foreground">0.320</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Death Filtration (ε):</span>
                <span className="font-mono font-semibold text-foreground">2.140</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Persistence Lifetime (d - b):</span>
                <span className="font-mono font-semibold text-emerald-400 font-bold">
                  1.820 (Persistent Feature)
                </span>
              </div>
            </div>

            {/* Simplex Connections */}
            <div className="pt-3 border-t border-border">
              <span className="text-xs font-semibold text-foreground block mb-2">
                Connected 1-Simplices ({connectedLinks.length}):
              </span>
              <div className="space-y-1.5 max-h-36 overflow-y-auto">
                {connectedLinks.map((link, idx) => (
                  <div
                    key={idx}
                    className="p-2 rounded border border-border/60 bg-muted/20 text-xs flex items-center justify-between font-mono"
                  >
                    <span>
                      {link.source} ↔ {link.target}
                    </span>
                    <span className="text-emerald-400 text-[10px] font-bold">
                      Dist: {(100 - link.strength).toFixed(1)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="p-3 rounded-lg border border-border bg-muted/20 text-[11px] text-muted-foreground leading-relaxed">
            Persistent 1-cycles (H1) indicate non-linear orbital dynamics in the acoustic emission signal,
            characteristic of crack face friction and micro-slip events.
          </div>
        </Card>
      </div>
    </div>
  );
}
