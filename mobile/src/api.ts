import { Platform } from 'react-native';

export const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || "http://192.168.0.105:8000/api/v1";

export interface DashboardStats {
  status: string;
  system: {
    version: string;
    tda_engine: string;
    lead_time_ms: number;
    sampling_rate: string;
    clock_sync: string;
  };
  metrics: {
    total_projects: number;
    total_signals: number;
    total_analyses: number;
    f1_score: number;
    macro_accuracy: number;
    active_channels: number;
  };
  channels: Array<{
    id: string;
    name: string;
    freq: string;
    rate: string;
    active: boolean;
  }>;
}

export interface SignalItem {
  id: string;
  filename: string;
  sample_rate: number;
  duration_sec: number;
  peak_amplitude_v: number;
  status: string;
}

export interface AnalysisSummary {
  analysis_id: string;
  signal_id: string;
  status: string;
  execution_time_ms: number;
  classification: {
    crack_mode: string;
    confidence: number;
    cdpi_score: number;
    lead_time_ms: number;
  };
  takens: {
    embedding_dimension: number;
    delay_lag_tau: number;
    tau_time_microsec: number;
  };
  persistent_homology: {
    entropy_h0: number;
    entropy_h1: number;
    betti_0_peak: number;
    betti_1_peak: number;
    persistence_pairs: Array<{ dim: number; birth: number; death: number }>;
  };
}

export interface ClientLogEntry {
  id: string;
  timestamp: string;
  source: string;
  level: string;
  context: string;
  message: string;
  stack?: string;
  details?: Record<string, any>;
}

// In-memory diagnostic log buffer for instant viewing and copying in mobile UI
const localDiagnosticLogs: ClientLogEntry[] = [];

export function getLocalDiagnosticLogs(): ClientLogEntry[] {
  return [...localDiagnosticLogs];
}

export function clearLocalDiagnosticLogs(): void {
  localDiagnosticLogs.length = 0;
}

/**
 * Sends client diagnostic telemetry to the backend `/api/v1/system/client-logs` endpoint.
 * This guarantees any error happening on the phone is visible on the backend terminal & copyable.
 */
export async function sendClientLog(
  level: 'ERROR' | 'WARN' | 'INFO',
  context: string,
  message: string,
  details?: Record<string, any>,
  stack?: string
): Promise<void> {
  const entry: ClientLogEntry = {
    id: `cli-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    timestamp: new Date().toISOString(),
    source: `mobile-${Platform.OS}`,
    level,
    context,
    message,
    stack,
    details: {
      ...details,
      platform: Platform.OS,
      apiBaseUrl: API_BASE_URL,
    },
  };

  localDiagnosticLogs.unshift(entry);
  if (localDiagnosticLogs.length > 50) {
    localDiagnosticLogs.pop();
  }

  try {
    await fetch(`${API_BASE_URL}/system/client-logs`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(entry),
    });
  } catch {
    // If backend is unreachable, error is preserved in localDiagnosticLogs for viewing
  }
}

export async function checkBackendHealth(): Promise<{ online: boolean; latencyMs: number; error?: string }> {
  const t0 = Date.now();
  try {
    const healthUrl = `${API_BASE_URL.replace("/api/v1", "")}/health`;
    const res = await fetch(healthUrl);
    const latencyMs = Date.now() - t0;
    if (!res.ok) {
      await sendClientLog('WARN', 'checkBackendHealth', `Health responded with status ${res.status}`);
      return { online: false, latencyMs, error: `HTTP ${res.status}` };
    }
    const data = await res.json();
    return { online: data.status === "ONLINE", latencyMs };
  } catch (err: any) {
    const latencyMs = Date.now() - t0;
    await sendClientLog('ERROR', 'checkBackendHealth', `Failed to reach ${API_BASE_URL}: ${err.message}`, { latencyMs });
    return { online: false, latencyMs, error: err.message };
  }
}

export async function fetchSystemDiagnostics(): Promise<any | null> {
  try {
    const res = await fetch(`${API_BASE_URL}/system/diagnostics`);
    if (!res.ok) return null;
    return await res.json();
  } catch (err: any) {
    await sendClientLog('ERROR', 'fetchSystemDiagnostics', err.message);
    return null;
  }
}

export async function fetchDashboardStats(): Promise<DashboardStats | null> {
  try {
    const res = await fetch(`${API_BASE_URL}/dashboard/stats`);
    if (!res.ok) {
      await sendClientLog('WARN', 'fetchDashboardStats', `HTTP ${res.status}`);
      return null;
    }
    return await res.json();
  } catch (err: any) {
    await sendClientLog('ERROR', 'fetchDashboardStats', err.message);
    return null;
  }
}

export async function fetchSignals(): Promise<SignalItem[]> {
  try {
    const res = await fetch(`${API_BASE_URL}/signals`);
    if (!res.ok) {
      await sendClientLog('WARN', 'fetchSignals', `HTTP ${res.status}`);
      return [];
    }
    return await res.json();
  } catch (err: any) {
    await sendClientLog('ERROR', 'fetchSignals', err.message);
    return [];
  }
}

export async function runAnalysis(signalId: string): Promise<AnalysisSummary | null> {
  try {
    const res = await fetch(`${API_BASE_URL}/analysis/run`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ signal_id: signalId }),
    });
    if (!res.ok) {
      const errText = await res.text();
      await sendClientLog('ERROR', 'runAnalysis', `HTTP ${res.status}: ${errText}`, { signalId });
      return null;
    }
    return await res.json();
  } catch (err: any) {
    await sendClientLog('ERROR', 'runAnalysis', err.message, { signalId });
    return null;
  }
}

export async function fetchAnalysis(analysisId: string): Promise<any | null> {
  try {
    const res = await fetch(`${API_BASE_URL}/analysis/${analysisId}`);
    if (!res.ok) return null;
    return await res.json();
  } catch (err: any) {
    await sendClientLog('ERROR', 'fetchAnalysis', err.message, { analysisId });
    return null;
  }
}

export async function fetchPersistence(analysisId: string): Promise<any | null> {
  try {
    const res = await fetch(`${API_BASE_URL}/analysis/${analysisId}/persistence`);
    if (!res.ok) return null;
    return await res.json();
  } catch (err: any) {
    await sendClientLog('ERROR', 'fetchPersistence', err.message, { analysisId });
    return null;
  }
}

/**
 * Uploads an acoustic recording from the mobile device to the EchoSense backend.
 * Normalizes file URI for Android / iOS and forwards all exceptions to backend telemetry.
 */
export async function uploadAudioSignal(
  uri: string,
  filename: string,
  specimen: string = "Prestressed Concrete Girder G1"
): Promise<SignalItem> {
  try {
    // Normalization: Ensure clean URI format across platforms
    let fileUri = uri;
    if (Platform.OS === 'android') {
      if (!fileUri.startsWith('file://') && !fileUri.startsWith('content://')) {
        fileUri = `file://${fileUri}`;
      }
    }

    const formData = new FormData();
    formData.append("file", {
      uri: fileUri,
      name: filename,
      type: "audio/m4a",
    } as any);
    formData.append("specimen", specimen);

    const uploadUrl = `${API_BASE_URL}/signals/upload`;
    const res = await fetch(uploadUrl, {
      method: "POST",
      body: formData,
      headers: {
        Accept: "application/json",
      },
    });

    if (!res.ok) {
      let errorDetail = "";
      try {
        errorDetail = await res.text();
      } catch {}
      const errMsg = `Upload rejected (${res.status}): ${errorDetail || res.statusText}`;
      await sendClientLog('ERROR', 'uploadAudioSignal', errMsg, {
        rawUri: uri,
        fileUri,
        filename,
        specimen,
        status: res.status
      });
      throw new Error(errMsg);
    }

    const signalData: SignalItem = await res.json();
    await sendClientLog('INFO', 'uploadAudioSignal', `Successfully uploaded signal ${signalData.id} (${signalData.filename})`);
    return signalData;
  } catch (err: any) {
    await sendClientLog('ERROR', 'uploadAudioSignal', `Upload exception: ${err.message}`, {
      uri,
      filename,
      stack: err.stack,
    });
    throw err;
  }
}

export async function loginUser(email: string, password: string) {
  const res = await fetch(`${API_BASE_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) throw new Error("Invalid credentials");
  return await res.json();
}
