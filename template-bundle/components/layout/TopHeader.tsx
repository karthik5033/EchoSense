"use client";

import React, { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import {
  Search,
  Sun,
  Moon,
  ChevronRight,
} from "lucide-react";
import { useTheme } from "@/lib/ThemeContext";
import { useAuth } from "@/lib/AuthContext";
import { NotificationCenter } from "./NotificationCenter";
import { CommandPalette } from "./CommandPalette";

export function TopHeader() {
  const pathname = usePathname();
  const { theme, toggleTheme } = useTheme();
  const { role } = useAuth();
  const [isCommandOpen, setIsCommandOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [utcTime, setUtcTime] = useState("");

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setUtcTime(now.toISOString().substring(11, 19) + " UTC");
    };
    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  const getPageTitle = () => {
    if (pathname.includes("/dashboard")) return "Structural Health Overview";
    if (pathname.includes("/data-ingestion")) return "Acoustic Signal Ingestion";
    if (pathname.includes("/chat")) return "Acoustic AI Copilot";
    if (pathname.includes("/network")) return "Attractor & Simplicial Topology";
    if (pathname.includes("/analytics")) return "TDA & Model Benchmarks";
    if (pathname.includes("/cases")) return "Structural Damage Incidents";
    if (pathname.includes("/profiles")) return "Sensor Stations & Transducers";
    if (pathname.includes("/alerts")) return "BOCD Changepoints & Alarms";
    if (pathname.includes("/financial")) return "Telemetry & Compute Ledger";
    if (pathname.includes("/audit")) return "Structural Compliance Audit";
    if (pathname.includes("/settings/permissions")) return "Role & Model Permissions";
    if (pathname.includes("/settings")) return "Sensor Calibration & Settings";
    if (pathname.includes("/architecture")) return "EchoSense System Architecture";
    if (pathname.includes("/docs/data-contracts")) return "TDA Data Contracts";
    if (pathname.includes("/docs/system-design")) return "System Design RFC";
    if (pathname.includes("/docs")) return "API & Pipeline Docs";
    return "EchoSense Platform";
  };

  return (
    <>
      <header className="flex h-16 w-full items-center justify-between border-b border-border bg-background/80 px-6 backdrop-blur-md sticky top-0 z-20">
        {/* Left: Breadcrumbs / Title */}
        <div className="flex items-center gap-3">
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Link href="/dashboard" className="hover:text-foreground transition-colors font-medium">
                EchoSense
              </Link>
              <ChevronRight className="h-3 w-3" />
              <span className="text-foreground font-medium">{getPageTitle()}</span>
            </div>
            <h1 className="text-sm font-bold text-foreground tracking-tight sm:text-base">
              {getPageTitle()}
            </h1>
          </div>
        </div>

        {/* Center: Search / Command Trigger */}
        <div className="hidden md:flex items-center max-w-sm w-full mx-4">
          <button
            onClick={() => setIsCommandOpen(true)}
            className="flex h-9 w-full items-center justify-between rounded-lg border border-input bg-muted/30 px-3 text-xs text-muted-foreground hover:bg-muted/60 transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <Search className="h-3.5 w-3.5" />
              <span>Search acoustic signals, TDA runs, alerts...</span>
            </div>
            <kbd className="pointer-events-none hidden sm:inline-flex h-5 select-none items-center gap-1 rounded border border-border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
              <span className="text-xs">⌘</span>K
            </kbd>
          </button>
        </div>

        {/* Right: Actions, Live Pill, Theme Toggle, Notifications, Role Picker */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Live Sensor Stream Status */}
          <div className="hidden lg:flex items-center gap-2 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-xs font-mono">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-ping" />
            <span>AE STREAMING</span>
            <span className="text-muted-foreground">|</span>
            <span className="text-muted-foreground font-mono">{utcTime}</span>
          </div>

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors cursor-pointer"
            title="Toggle theme"
          >
            {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>

          {/* Notification Trigger */}
          <div className="relative">
            <button
              onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
              className="p-2 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors relative cursor-pointer"
              title="Acoustic alerts"
            >
              <NotificationCenter />
            </button>
          </div>

          {/* Role badge */}
          <div className="hidden sm:flex items-center px-2 py-1 rounded border border-border bg-muted/50 text-[11px] font-mono text-muted-foreground">
            {role}
          </div>
        </div>
      </header>

      {/* Global Command Palette */}
      <CommandPalette open={isCommandOpen} onOpenChange={setIsCommandOpen} />
    </>
  );
}
