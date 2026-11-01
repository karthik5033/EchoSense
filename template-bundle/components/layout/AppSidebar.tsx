"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
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
  PanelLeftClose,
  PanelLeftOpen,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { AppLogo } from "@/components/ui/AppLogo";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useAuth } from "@/lib/AuthContext";

export const NAV_ITEMS = [
  { label: "Overview", href: "/dashboard", icon: LayoutDashboard },
  { label: "Signal Ingestion", href: "/data-ingestion", icon: Database },
  { label: "Acoustic AI Copilot", href: "/chat", icon: MessageSquare },
  { label: "Attractor Topology", href: "/network", icon: Network },
  { label: "TDA & Benchmarks", href: "/analytics", icon: LineChart },
  { label: "Damage Incidents", href: "/cases", icon: FolderGit2 },
  { label: "Sensor Stations", href: "/profiles", icon: Users },
  { label: "BOCD & Alarms", href: "/alerts", icon: BellRing },
  { label: "Telemetry Ledger", href: "/financial", icon: Wallet },
  { label: "Inspection Audit", href: "/audit", icon: ShieldCheck },
  { label: "Calibration & Settings", href: "/settings", icon: Settings },
];

export function AppSidebar() {
  const pathname = usePathname();
  const { user, role } = useAuth();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const initials = `${user.firstName[0] || ""}${user.lastName[0] || ""}`.toUpperCase();

  return (
    <aside
      className={cn(
        "flex h-screen flex-col border-r border-border bg-card shadow-sm transition-all duration-300 relative select-none",
        isCollapsed ? "w-20" : "w-64"
      )}
    >
      {/* Brand Section */}
      <div
        className={cn(
          "flex h-16 items-center border-b border-border/60 transition-all",
          isCollapsed ? "justify-center px-0" : "justify-between px-4"
        )}
      >
        <Link href="/" className="flex items-center gap-2 hover:opacity-85 transition-opacity">
          <AppLogo size="md" showText={!isCollapsed} />
        </Link>
        {!isCollapsed && (
          <button
            onClick={() => setIsCollapsed(true)}
            className="p-1 rounded-md text-muted-foreground hover:bg-muted hover:text-foreground transition-colors cursor-pointer"
            title="Collapse Sidebar"
          >
            <PanelLeftClose className="h-4 w-4" />
          </button>
        )}
      </div>

      {isCollapsed && (
        <div className="flex justify-center py-2 border-b border-border/40">
          <button
            onClick={() => setIsCollapsed(false)}
            className="p-1.5 rounded-md text-muted-foreground hover:bg-muted hover:text-foreground transition-colors cursor-pointer"
            title="Expand Sidebar"
          >
            <PanelLeftOpen className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Navigation List */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        {!isCollapsed && (
          <div className="px-3 pb-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/70">
            EchoSense Modules
          </div>
        )}

        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive =
            pathname === item.href ||
            (item.href !== "/dashboard" && pathname?.startsWith(item.href + "/"));

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all group relative cursor-pointer",
                isActive
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
              title={isCollapsed ? item.label : undefined}
            >
              <Icon className={cn("h-4 w-4 shrink-0 transition-transform group-hover:scale-110", isActive && "text-primary-foreground")} />
              {!isCollapsed && (
                <span className="truncate flex-1">{item.label}</span>
              )}
              {!isCollapsed && isActive && (
                <span className="h-1.5 w-1.5 rounded-full bg-primary-foreground/80" />
              )}
            </Link>
          );
        })}
      </div>

      {/* Role & User Footer */}
      <div className="border-t border-border/60 p-3 bg-muted/20">
        <div className={cn("flex items-center gap-3", isCollapsed ? "justify-center" : "px-1")}>
          <Avatar size="sm" className="bg-primary/10 text-primary border-primary/20">
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
          {!isCollapsed && (
            <div className="flex-1 overflow-hidden">
              <p className="text-xs font-semibold leading-tight text-foreground truncate">
                {user.firstName} {user.lastName}
              </p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-muted text-muted-foreground border border-border">
                  {role}
                </span>
                <span className="text-[10px] text-muted-foreground truncate">
                  {user.title}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}
