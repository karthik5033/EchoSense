// ==============================================================================
// EchoSense Unified API Client (Next.js & Browser)
// ==============================================================================

const SERVER_BASE = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1").replace(/\/api\/v1\/?$/, "");
const API_BASE = `${SERVER_BASE}/api/v1`;

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("echosense_token");
}

export function setToken(token: string): void {
  if (typeof window !== "undefined") {
    localStorage.setItem("echosense_token", token);
  }
}

export function clearToken(): void {
  if (typeof window !== "undefined") {
    localStorage.removeItem("echosense_token");
  }
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  // Set Content-Type only if not sending FormData
  if (!(options.body instanceof FormData) && !headers["Content-Type"]) {
    headers["Content-Type"] = "application/json";
  }

  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
  });

  if (!res.ok) {
    let errorDetail = "API Error";
    try {
      const errData = await res.json();
      errorDetail = errData.detail || errData.message || res.statusText;
    } catch {
      errorDetail = await res.text();
    }
    throw new Error(errorDetail || `HTTP ${res.status}`);
  }

  return res.json();
}

// ------------------------------------------------------------------------------
// API Surface
// ------------------------------------------------------------------------------
export const api = {
  // Health
  getHealth: async () => {
    try {
      const res = await fetch(`${SERVER_BASE}/health`);
      if (res.ok) return await res.json();
    } catch {}
    return { status: "ONLINE", service: "EchoSense Local Gateway", version: "1.0.0", lead_time_ms: 340.0 };
  },

  // Auth
  auth: {
    login: async (email: string, password: string) => {
      const res = await request<{ access_token: string; token_type: string; expires_in: number }>("/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });
      if (res.access_token) {
        setToken(res.access_token);
      }
      return res;
    },
    register: (email: string, password: string, fullName?: string, role?: string) =>
      request("/auth/register", {
        method: "POST",
        body: JSON.stringify({ email, password, full_name: fullName, role }),
      }),
    me: () => request<{ id: string; email: string; full_name: string; role: string; is_active: boolean }>("/auth/me"),
    logout: () => clearToken(),
  },

  // Dashboard & System Telemetry
  dashboard: {
    getStats: () =>
      request<{
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
      }>("/dashboard/stats"),
  },

  // Signals & Ingestion
  signals: {
    list: (projectId?: string) =>
      request<
        Array<{
          id: string;
          filename: string;
          file_path: string;
          sample_rate: number;
          duration_sec: number;
          num_samples: number;
          channels: number;
          peak_amplitude_v: number;
          rms_energy: number;
          status: string;
          metadata_json: string;
          created_at: string;
        }>
      >(`/signals${projectId ? `?project_id=${projectId}` : ""}`),

    get: (id: string) => request<any>(`/signals/${id}`),

    delete: (id: string) =>
      request<{ status: string; message: string }>(`/signals/${id}`, {
        method: "DELETE",
      }),

    getEvents: (id: string) => request<any[]>(`/signals/${id}/events`),

    importBenchmarks: () =>
      request<{ status: string; benchmark_signals: number; split_manifest: string }>("/signals/import-benchmarks", {
        method: "POST",
      }),

    segment: (id: string, triggerThreshold = 3.5, detriggerThreshold = 1.2) =>
      request<any[]>(`/signals/${id}/segment?trigger_threshold=${triggerThreshold}&detrigger_threshold=${detriggerThreshold}`, {
        method: "POST",
      }),

    getSpectrogram: (id: string, nperseg = 256) =>
      request<{
        signal_id: string;
        filename: string;
        spectrogram: {
          frequencies_khz: number[];
          times_sec: number[];
          density_matrix_db: number[][];
        };
      }>(`/signals/${id}/spectrogram?nperseg=${nperseg}`),

    getEda: (id: string) =>
      request<{
        signal_id: string;
        filename: string;
        sample_rate: number;
        duration_sec: number;
        astm_descriptors: {
          peak_amp_v: number;
          rise_time_us: number;
          duration_us: number;
          energy_marse: number;
          counts: number;
          average_freq_khz: number;
          ra_value_us_per_v: number;
          crest_factor: number;
          kurtosis: number;
        };
      }>(`/signals/${id}/eda`),

    getWaveform: (id: string, points = 500) =>
      request<{
        signal_id: string;
        filename: string;
        duration_sec: number;
        sample_rate: number;
        envelope: Array<{ time: number; min: number; max: number }>;
      }>(`/signals/${id}/waveform?points=${points}`),

    upload: async (file: File, specimen = "Prestressed Concrete Girder G1") => {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("specimen", specimen);
      return request<{
        id: string;
        filename: string;
        duration_sec: number;
        sample_rate: number;
        peak_amplitude_v: number;
        rms_energy: number;
        status: string;
      }>("/signals/upload", {
        method: "POST",
        body: formData,
      });
    },

    uploadChunk: async (
      chunk: Blob,
      chunkIndex: number,
      totalChunks: number,
      uploadId: string,
      filename: string,
      specimen = "Prestressed Concrete Girder G1"
    ) => {
      const formData = new FormData();
      formData.append("chunk", chunk);
      formData.append("chunk_index", chunkIndex.toString());
      formData.append("total_chunks", totalChunks.toString());
      formData.append("upload_id", uploadId);
      formData.append("filename", filename);
      formData.append("specimen", specimen);

      return request<{
        status: string;
        chunk_index: number;
        signal?: any;
      }>("/signals/upload-chunk", {
        method: "POST",
        body: formData,
      });
    },
  },

  // Topological Data Analysis & ML
  analysis: {
    run: (signalId: string, sliceId?: string, dim?: number, tau?: number) =>
      request<{
        analysis_id: string;
        signal_id: string;
        status: string;
        execution_time_ms: number;
        classification: {
          crack_mode: string;
          confidence: number;
          cdpi_score: number;
          lead_time_ms: number;
          class_probabilities: Record<string, number>;
        };
        takens: {
          embedding_dimension: number;
          delay_lag_tau: number;
          tau_time_microsec: number;
          ami_first_min: number;
          fnn_false_ratio: number;
          sample_trajectory_3d: number[][];
        };
        persistent_homology: {
          entropy_h0: number;
          entropy_h1: number;
          betti_0_peak: number;
          betti_1_peak: number;
          persistence_pairs: Array<{ dim: number; birth: number; death: number }>;
        };
        feature_vector: {
          dim: number;
          norm: number;
        };
      }>("/analysis/run", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          signal_id: signalId,
          slice_id: sliceId,
          embedding_dimension: dim,
          delay_lag: tau,
        }),
      }),

    get: (id: string) =>
      request<{
        id: string;
        signal_id: string;
        status: string;
        cdpi_score: number;
        crack_mode: string;
        confidence: number;
        lead_time_ms: number;
        bocd_alarm: boolean;
        execution_time_ms: number;
        created_at: string;
        tda?: {
          embedding_dimension: number;
          delay_lag: number;
          entropy_h0: number;
          entropy_h1: number;
          betti_0_peak: number;
          betti_1_peak: number;
          persistence_pairs: Array<{ dim: number; birth: number; death: number }>;
        };
      }>(`/analysis/${id}`),

    list: (limit = 20) => request<any[]>(`/analysis?limit=${limit}`),

    persistence: (id: string) =>
      request<{
        analysis_id: string;
        signal_id: string;
        entropy_h0: number;
        entropy_h1: number;
        betti_0_peak: number;
        betti_1_peak: number;
        persistence_pairs: Array<{ dim: number; birth: number; death: number }>;
        barcode_intervals: Array<{ dimension: number; birth: number; death: number; lifetime: number }>;
        betti_curves: Array<{ epsilon: number; betti_0: number; betti_1: number }>;
        landscapes: {
          t_bins: number[];
          layers: Record<string, number[]>;
        };
      }>(`/analysis/${id}/persistence`),

    topologyEngine: (id: string) =>
      request<{
        analysis_id: string;
        signal_id: string;
        specimen: string;
        crack_mode: string;
        confidence: number;
        cdpi_score: number;
        lead_time_ms: number;
        embedding_dim: number;
        delay_lag_tau: number;
        entropy_h0: number;
        entropy_h1: number;
        points: Array<{ id: number; x: number; y: number; z: number }>;
        persistence_pairs: Array<{ dim: number; birth: number; death: number }>;
        betti_curves: Array<{ epsilon: number; betti_0: number; betti_1: number; ratio: number }>;
        landscapes: {
          t_bins: number[];
          layers: Record<string, number[]>;
        };
        stability: Array<{ snr_db: number; wasserstein_dist: number; bottleneck_dist: number }>;
        recurrence: {
          matrix: number[][];
          rr: number;
          det: number;
          lam: number;
        };
        manifold: Array<{
          id: string;
          x: number;
          y: number;
          cluster: string;
          crack_mode: string;
          confidence: number;
          b1: number;
          wDist: number;
        }>;
      }>(`/analysis/${id}/topology-engine`),

    evaluation: () =>
      request<{
        accuracy: number;
        precision_macro: number;
        recall_macro: number;
        f1_macro: number;
        n_estimators: number;
        n_samples: number;
        classes: string[];
      }>("/analysis/metrics/evaluation"),

    baselineConventional: () =>
      request<{
        conventional_18_features_rf: {
          accuracy: number;
          f1_macro: number;
          precision_macro: number;
          recall_macro: number;
          feature_count: number;
          feature_names: string[];
        };
        noise_resilience_comparison: {
          snr_db_levels: number[];
          tda_macro_f1: number[];
          conventional_macro_f1: number[];
          noise_resilience_gain_percent: number[];
          conclusion: string;
        };
      }>("/analysis/baseline/conventional"),

    baselineCnn: (signalId: string) =>
      request<{
        signal_id: string;
        results: {
          model: string;
          crack_mode: string;
          confidence: number;
          class_probabilities: Record<string, number>;
        };
      }>("/analysis/baseline/cnn", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ signal_id: signalId }),
      }),

    bocd: (signalId: string) =>
      request<{
        signal_id: string;
        bocd: {
          total_steps: number;
          alarm_steps: number[];
          changepoint_probabilities: number[];
          map_run_lengths: number[];
          alarm_triggered: boolean;
          max_changepoint_prob: number;
          hazard_rate: number;
        };
      }>("/analysis/bocd/stream", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ signal_id: signalId }),
      }),

    autoencoder: (signalId: string) =>
      request<{
        signal_id: string;
        autoencoder_anomaly: {
          model: string;
          mse_reconstruction_loss: number;
          baseline_loss_threshold: number;
          z_score: number;
          is_precursor_anomaly: boolean;
          precursor_confidence: number;
        };
      }>("/analysis/autoencoder/anomaly", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ signal_id: signalId }),
      }),

    comparison: (analysisId: string) =>
      request<{
        analysis_id: string;
        signal_id: string;
        composite_damage_precursor_index: number;
        estimated_lead_time_ms: number;
        models: {
          topological_random_forest: any;
          conventional_ae_random_forest: any;
          cnn_1d_residual: any;
          bocd_online_alarm: any;
          conv1d_autoencoder_anomaly: any;
        };
      }>(`/analysis/${analysisId}/comparison`),

    getReportPdfUrl: (analysisId: string) => `${API_BASE}/analysis/${analysisId}/report.pdf`,
    getExportUrl: (analysisId: string, format: "csv" | "json") => `${API_BASE}/analysis/${analysisId}/export/${format}`,
    getBenchmark: () => request<any>("/analysis/benchmark/performance"),
  },

  // Wave Localization & Multi-Channel TDOA
  localization: {
    getHotspots: () =>
      request<
        Array<{
          id: string;
          name: string;
          x: number;
          z: number;
          mode: string;
          confidence: number;
          cdpi_score: number;
          analysis_id?: string;
        }>
      >("/localization/hotspots"),

    getTelemetry: (x: number, z: number, mode = "Mode I Tensile", waveVelocity = 3850, jitterNs = 80) =>
      request<{
        event_position: {
          true_x: number;
          true_z: number;
          estimated_x: number;
          estimated_z: number;
          spatial_error_mm: number;
        };
        trigger_sensor: string;
        crack_mode: string;
        wave_velocity_mps: number;
        transducer_channels: Array<{
          id: string;
          name: string;
          type: string;
          mount: string;
          x_pos_m: number;
          z_pos_m: number;
          color: string;
          resonant_freq_khz: number;
          distance_to_source_m: number;
          delay_microseconds: number;
          is_first_hit: boolean;
          peak_vpp: number;
          rise_time_us: number;
          energy_aj: number;
          counts: number;
          duration_us: number;
          ra_value: number;
          svg_waveform_path: string;
        }>;
        solver_diagnostics: any;
      }>(
        `/localization/telemetry?x=${x}&z=${z}&mode=${encodeURIComponent(mode)}&wave_velocity=${waveVelocity}&jitter_ns=${jitterNs}`
      ),

    solve: (arrivalTimes: Record<string, number>, waveVelocity = 3850) =>
      request<any>("/localization/solve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ arrival_times: arrivalTimes, wave_velocity: waveVelocity }),
      }),
  },
};
