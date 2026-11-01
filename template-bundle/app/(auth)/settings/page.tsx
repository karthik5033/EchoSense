"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Settings,
  User,
  Shield,
  Palette,
  Bell,
  Save,
  Check,
  Moon,
  Sun,
  KeyRound,
  ExternalLink,
  ChevronRight,
  Sliders,
  Waves,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/lib/AuthContext";
import { useTheme } from "@/lib/ThemeContext";

export default function SettingsPage() {
  const { user, updateUser, role } = useAuth();
  const { theme, toggleTheme, setTheme } = useTheme();

  const [formData, setFormData] = useState({
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    title: user.title,
    department: user.department,
  });

  const [signalParams, setSignalParams] = useState({
    filterLowCutoff: 500,
    filterHighCutoff: 20000,
    staWindow: 50,
    ltaWindow: 500,
    triggerRatio: 3.5,
    detriggerRatio: 1.2,
    embeddingDelay: 4,
    embeddingDim: 4,
  });

  const [notifications, setNotifications] = useState({
    emailAlerts: true,
    audioSirens: true,
    criticalIncidentsOnly: false,
  });

  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateUser(formData);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="p-6 space-y-6 max-w-5xl mx-auto w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <Settings className="h-6 w-6 text-emerald-500" />
            Sensor Calibration &amp; System Settings
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Manage your researcher profile, STA/LTA acoustic thresholds, Takens parameters &amp; notification alarms
          </p>
        </div>

        <Link href="/settings/permissions">
          <Button variant="outline" size="sm" className="gap-1.5 text-xs cursor-pointer">
            <Shield className="h-3.5 w-3.5 text-emerald-400" />
            RBAC Permissions Matrix
            <ChevronRight className="h-3 w-3" />
          </Button>
        </Link>
      </div>

      {savedSuccess && (
        <div className="flex items-center gap-2 p-3 rounded-lg border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 text-xs font-semibold animate-in fade-in-50">
          <Check className="h-4 w-4" />
          <span>Configuration preferences saved successfully!</span>
        </div>
      )}

      {/* Tabs */}
      <Tabs defaultValue="calibration">
        <TabsList className="bg-muted/40 border border-border p-1">
          <TabsTrigger value="calibration" className="text-xs">
            Acoustic &amp; TDA Calibration
          </TabsTrigger>
          <TabsTrigger value="profile" className="text-xs">
            Researcher Profile
          </TabsTrigger>
          <TabsTrigger value="appearance" className="text-xs">
            Appearance &amp; Theme
          </TabsTrigger>
          <TabsTrigger value="notifications" className="text-xs">
            Alert Preferences
          </TabsTrigger>
          <TabsTrigger value="security" className="text-xs">
            Security &amp; API Keys
          </TabsTrigger>
        </TabsList>

        {/* Calibration Tab */}
        <TabsContent value="calibration" className="pt-2">
          <Card className="border border-border bg-card">
            <CardHeader className="border-b border-border/50 pb-4">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Sliders className="h-4 w-4 text-emerald-400" />
                Signal Preprocessing &amp; Embedding Calibration
              </CardTitle>
              <CardDescription className="text-xs">
                Fine-tune the zero-phase Butterworth filter, STA/LTA burst detection &amp; Takens attractor parameters
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
                <div>
                  <label className="font-semibold text-foreground block mb-1">
                    Butterworth Bandpass Low Cutoff (Hz)
                  </label>
                  <Input
                    type="number"
                    value={signalParams.filterLowCutoff}
                    onChange={(e) =>
                      setSignalParams({ ...signalParams, filterLowCutoff: parseInt(e.target.value) || 500 })
                    }
                    className="h-9 text-xs"
                  />
                  <span className="text-[10px] text-muted-foreground mt-1 block">
                    Rejects low-frequency environmental rumble (&lt; 500 Hz)
                  </span>
                </div>

                <div>
                  <label className="font-semibold text-foreground block mb-1">
                    Butterworth Bandpass High Cutoff (Hz)
                  </label>
                  <Input
                    type="number"
                    value={signalParams.filterHighCutoff}
                    onChange={(e) =>
                      setSignalParams({ ...signalParams, filterHighCutoff: parseInt(e.target.value) || 20000 })
                    }
                    className="h-9 text-xs"
                  />
                  <span className="text-[10px] text-muted-foreground mt-1 block">
                    Anti-aliasing cutoff for standard 44.1/48 kHz smartphone mics
                  </span>
                </div>

                <div>
                  <label className="font-semibold text-foreground block mb-1">
                    STA/LTA Event Trigger Ratio
                  </label>
                  <Input
                    type="number"
                    step="0.1"
                    value={signalParams.triggerRatio}
                    onChange={(e) =>
                      setSignalParams({ ...signalParams, triggerRatio: parseFloat(e.target.value) || 3.5 })
                    }
                    className="h-9 text-xs"
                  />
                  <span className="text-[10px] text-muted-foreground mt-1 block">
                    Default 3.5 ratio isolates fracture pulse from ambient background
                  </span>
                </div>

                <div>
                  <label className="font-semibold text-foreground block mb-1">
                    Takens Embedding Dimension (d)
                  </label>
                  <Input
                    type="number"
                    value={signalParams.embeddingDim}
                    onChange={(e) =>
                      setSignalParams({ ...signalParams, embeddingDim: parseInt(e.target.value) || 4 })
                    }
                    className="h-9 text-xs"
                  />
                  <span className="text-[10px] text-muted-foreground mt-1 block">
                    Determined via False Nearest Neighbors (FNN &lt; 1%)
                  </span>
                </div>
              </div>

              <div className="flex justify-end pt-4 border-t border-border">
                <Button
                  onClick={() => {
                    setSavedSuccess(true);
                    setTimeout(() => setSavedSuccess(false), 3000);
                  }}
                  size="sm"
                  className="gap-2 text-xs bg-emerald-600 hover:bg-emerald-500 text-white cursor-pointer"
                >
                  <Save className="h-3.5 w-3.5" />
                  Save Calibration Parameters
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Profile Tab */}
        <TabsContent value="profile" className="pt-2">
          <Card className="border border-border bg-card">
            <CardHeader className="border-b border-border/50 pb-4">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <User className="h-4 w-4 text-primary" />
                Researcher Identity Information
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <form onSubmit={handleSaveProfile} className="space-y-4 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="font-medium text-foreground block mb-1">First Name</label>
                    <Input
                      value={formData.firstName}
                      onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                      className="h-9 text-xs"
                    />
                  </div>
                  <div>
                    <label className="font-medium text-foreground block mb-1">Last Name</label>
                    <Input
                      value={formData.lastName}
                      onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                      className="h-9 text-xs"
                    />
                  </div>
                </div>

                <div>
                  <label className="font-medium text-foreground block mb-1">Institutional Email</label>
                  <Input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="h-9 text-xs"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="font-medium text-foreground block mb-1">Research Role</label>
                    <Input
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      className="h-9 text-xs"
                    />
                  </div>
                  <div>
                    <label className="font-medium text-foreground block mb-1">Department / Lab</label>
                    <Input
                      value={formData.department}
                      onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                      className="h-9 text-xs"
                    />
                  </div>
                </div>

                <div className="flex justify-end pt-4 border-t border-border">
                  <Button type="submit" size="sm" className="gap-2 text-xs bg-emerald-600 hover:bg-emerald-500 text-white cursor-pointer">
                    <Save className="h-3.5 w-3.5" />
                    Update Profile
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Appearance Tab */}
        <TabsContent value="appearance" className="pt-2">
          <Card className="border border-border bg-card p-6 space-y-4">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Palette className="h-4 w-4 text-primary" />
              Theme &amp; Interface Aesthetics
            </CardTitle>
            <p className="text-xs text-muted-foreground">
              Select your preferred color theme. Obsidian Dark Mode is optimized for 3D state-space and persistence diagram visibility.
            </p>

            <div className="flex items-center gap-4 pt-2">
              <Button
                variant={theme === "dark" ? "default" : "outline"}
                size="sm"
                onClick={() => setTheme("dark")}
                className="gap-2 text-xs cursor-pointer"
              >
                <Moon className="h-4 w-4" />
                Obsidian Dark (Default)
              </Button>
              <Button
                variant={theme === "light" ? "default" : "outline"}
                size="sm"
                onClick={() => setTheme("light")}
                className="gap-2 text-xs cursor-pointer"
              >
                <Sun className="h-4 w-4" />
                Laboratory Light
              </Button>
            </div>
          </Card>
        </TabsContent>

        {/* Notifications Tab */}
        <TabsContent value="notifications" className="pt-2">
          <Card className="border border-border bg-card p-6 space-y-4">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Bell className="h-4 w-4 text-emerald-400" />
              Real-time Crack Alarm Subscriptions
            </CardTitle>
            <div className="space-y-3 text-xs">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={notifications.audioSirens}
                  onChange={(e) =>
                    setNotifications({ ...notifications, audioSirens: e.target.checked })
                  }
                  className="rounded border-border accent-emerald-500 h-4 w-4"
                />
                <span className="text-foreground">Play audible acoustic warning tone when BOCD detects changepoint</span>
              </label>

              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={notifications.emailAlerts}
                  onChange={(e) =>
                    setNotifications({ ...notifications, emailAlerts: e.target.checked })
                  }
                  className="rounded border-border accent-emerald-500 h-4 w-4"
                />
                <span className="text-foreground">Send instantaneous incident email for critical shear crack precursors</span>
              </label>
            </div>
          </Card>
        </TabsContent>

        {/* Security Tab */}
        <TabsContent value="security" className="pt-2">
          <Card className="border border-border bg-card p-6 space-y-4">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <KeyRound className="h-4 w-4 text-amber-500" />
              EchoSense REST &amp; WebSocket API Credentials
            </CardTitle>
            <p className="text-xs text-muted-foreground">
              Bearer tokens used by smartphone edge agents to post raw acoustic bursts to <code>/api/v1/signals/upload</code>.
            </p>
            <div className="flex items-center gap-2 max-w-md">
              <Input
                readOnly
                value="echosense_live_sec_994aeb85f9e20261101"
                className="font-mono text-xs h-9 bg-muted/40"
              />
              <Button size="sm" variant="outline" className="text-xs cursor-pointer">
                Rotate Key
              </Button>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
