const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || "http://10.0.2.2:8000/api/v1";

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

export async function checkBackendHealth(): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE_URL.replace("/api/v1", "")}/health`);
    const data = await res.json();
    return data.status === "ONLINE";
  } catch {
    return false;
  }
}

export async function fetchDashboardStats(): Promise<DashboardStats | null> {
  try {
    const res = await fetch(`${API_BASE_URL}/dashboard/stats`);
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

export async function fetchSignals(): Promise<SignalItem[]> {
  try {
    const res = await fetch(`${API_BASE_URL}/signals`);
    if (!res.ok) return [];
    return await res.json();
  } catch {
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
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

export async function fetchAnalysis(analysisId: string): Promise<any | null> {
  try {
    const res = await fetch(`${API_BASE_URL}/analysis/${analysisId}`);
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

export async function fetchPersistence(analysisId: string): Promise<any | null> {
  try {
    const res = await fetch(`${API_BASE_URL}/analysis/${analysisId}/persistence`);
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
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
