"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  LayoutDashboard,
  Database,
  MessageSquare,
  Network,
  LineChart,
  FolderGit2,
  Users,
  BellRing,
  Wallet,
  ShieldCheck,
  Settings,
  Layers,
  BookOpen,
  X,
  ArrowRight,
} from "lucide-react";

interface CommandPaletteProps {
  open?: boolean;
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  onClose?: () => void;
}

const COMMAND_ITEMS = [
  { label: "Overview — Structural Health KPIs", href: "/dashboard", category: "Core Modules", icon: LayoutDashboard },
  { label: "Signal Ingestion — Acoustic Waveform Upload", href: "/data-ingestion", category: "Core Modules", icon: Database },
  { label: "Acoustic AI Copilot — Structural Diagnostics", href: "/chat", category: "Core Modules", icon: MessageSquare },
  { label: "Attractor Topology — Takens Phase Space & Rips Complex", href: "/network", category: "Core Modules", icon: Network },
  { label: "TDA & Benchmarks — Random Forest vs CNN Baselines", href: "/analytics", category: "Core Modules", icon: LineChart },
  { label: "Damage Incidents — Specimen Fracture Records", href: "/cases", category: "Core Modules", icon: FolderGit2 },
  { label: "Sensor Stations — Smartphone & Piezo Channels", href: "/profiles", category: "Core Modules", icon: Users },
  { label: "BOCD & Alarms — Changepoint Events & Autoencoder Residuals", href: "/alerts", category: "Core Modules", icon: BellRing },
  { label: "Telemetry Ledger — Sensor Bandwidth & Compute Telemetry", href: "/financial", category: "Core Modules", icon: Wallet },
  { label: "Inspection Audit — Non-Destructive Testing Compliance", href: "/audit", category: "Core Modules", icon: ShieldCheck },
  { label: "Calibration & Settings — STA/LTA & Bandpass Filter Parameters", href: "/settings", category: "Core Modules", icon: Settings },
  { label: "EchoSense Architecture — Pipeline Design & Layer Contracts", href: "/architecture", category: "Documentation", icon: Layers },
  { label: "REST & WebSocket API Docs", href: "/docs", category: "Documentation", icon: BookOpen },
  { label: "TDA Data Contracts — Persistence Schemas", href: "/docs/data-contracts", category: "Documentation", icon: BookOpen },
  { label: "System Design RFC — Takens & GUDHI Specifications", href: "/docs/system-design", category: "Documentation", icon: BookOpen },
];

export function CommandPalette({ open, isOpen, onOpenChange, onClose }: CommandPaletteProps) {
  const router = useRouter();
  const [query, setQuery] = useState("");

  const isVisible = open !== undefined ? open : (isOpen ?? false);

  const closePalette = () => {
    if (onOpenChange) onOpenChange(false);
    if (onClose) onClose();
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        if (isVisible) {
          closePalette();
        } else if (onOpenChange) {
          onOpenChange(true);
        }
      }
      if (e.key === "Escape" && isVisible) {
        closePalette();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isVisible]);

  if (!isVisible) return null;

  const filtered = COMMAND_ITEMS.filter((item) =>
    item.label.toLowerCase().includes(query.toLowerCase()) ||
    item.category.toLowerCase().includes(query.toLowerCase()) ||
    item.href.toLowerCase().includes(query.toLowerCase())
  );

  const handleSelect = (href: string) => {
    closePalette();
    router.push(href);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-24 bg-black/60 backdrop-blur-sm px-4"
      onClick={closePalette}
    >
      <div
        className="relative w-full max-w-xl rounded-xl border border-border bg-card p-4 shadow-2xl animate-in fade-in-50 zoom-in-95"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 border-b border-border pb-3">
          <Search className="h-5 w-5 text-muted-foreground" />
          <input
            autoFocus
            type="text"
            placeholder="Search signals, TDA attractors, BOCD changepoints, or modules..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
          />
          <button
            onClick={closePalette}
            className="p-1 rounded-md text-muted-foreground hover:bg-muted hover:text-foreground cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="mt-3 max-h-80 overflow-y-auto space-y-1">
          {filtered.length === 0 ? (
            <div className="py-8 text-center text-sm text-muted-foreground">
              No matching modules or actions found.
            </div>
          ) : (
            filtered.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.href}
                  onClick={() => handleSelect(item.href)}
                  className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm text-muted-foreground hover:bg-muted hover:text-foreground transition-colors group cursor-pointer"
                >
                  <div className="flex items-center gap-3 truncate">
                    <Icon className="h-4 w-4 shrink-0 text-muted-foreground group-hover:text-primary transition-colors" />
                    <span className="truncate">{item.label}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-muted border border-border text-muted-foreground">
                      {item.category}
                    </span>
                    <ArrowRight className="h-3.5 w-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </button>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
