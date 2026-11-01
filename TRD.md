# 🔬 EchoSense — Technical Requirements Document (TRD)

## Document Information

- **Project:** EchoSense (Topological Acoustic Emission Machine Learning Framework)
- **Version:** 1.0.0-PROD
- **Status:** Approved / Technical Specification
- **Classification:** Open Academic & Industrial Structural Health Monitoring (SHM)
- **Author:** System Architecture & ML Engineering Team

---

## 1. System Architecture Overview

### 1.1 High-Level Architecture

EchoSense is designed as an asynchronous, distributed full-stack architecture combining a high-performance **Next.js 14+ App Router** frontend, a scalable **FastAPI REST & WebSocket** backend, a distributed **Celery + Redis** task execution queue for compute-intensive Topological Data Analysis (TDA) and Deep Learning routines, and a **PostgreSQL** relational database for metadata, experiment versioning, and analytical records.

```mermaid
flowchart TB
    subgraph ClientLayer["Client & Edge Acquisition Layer"]
        MOBILE["📱 Smartphone Sensor / Mobile Mic\n(WAV / PCM 44.1 - 48 kHz)"]
        BROWSER["💻 Web Client (Next.js 14 App Router)\nReact 18 + TypeScript + Tailwind"]
    end

    subgraph GatewayLayer["Ingress & Edge Services"]
        NGINX["🛡️ Reverse Proxy / Load Balancer\n(TLS Termination, Rate Limiting)"]
    end

    subgraph AppLayer["Application & API Layer (FastAPI)"]
        API["⚙️ FastAPI REST Gateway\n(Async HTTP / OpenAPI 3.1)"]
        WS_HUB["⚡ Real-Time WebSocket Hub\n(Live Anomaly & Monitoring Streams)"]
        AUTH_SVC["🔐 Auth & RBAC Manager\n(JWT, Session Validation)"]
    end

    subgraph TaskLayer["Distributed Compute & ML Processing (Celery Workers)"]
        TASK_BROKER["📦 Redis Broker & Pub/Sub\n(Queue / Channel 6379)"]
        WORKER_PRE["🔄 Preprocessing & Segmentation Worker\n(Bandpass, STA/LTA Event Slicing)"]
        WORKER_TDA["🧮 Takens & Persistent Homology Worker\n(GUDHI, Rips Complex, Landscapes)"]
        WORKER_ML["🤖 Inference & BOCD Worker\n(Random Forest, Conv1D-AE, Changepoint)"]
    end

    subgraph PersistenceLayer["Storage & Artifacts Layer"]
        PG[("🐘 PostgreSQL 16\n(Users, Signals, Runs, Metrics)")]
        STORAGE[("🗄️ Object / Artifact Storage\n(Raw Waveforms, Model Weights .pt/.joblib)")]
        REDIS_CACHE[("🔴 Redis Cache & Session Store")]
    end

    MOBILE -->|"HTTP Multipart Upload"| NGINX
    BROWSER -->|"HTTPS / WSS"| NGINX
    NGINX --> API
    NGINX --> WS_HUB

    API --> AUTH_SVC
    API --> PG
    API --> STORAGE
    API --> TASK_BROKER
    WS_HUB <--> REDIS_CACHE

    TASK_BROKER --> WORKER_PRE
    TASK_BROKER --> WORKER_TDA
    TASK_BROKER --> WORKER_ML

    WORKER_PRE --> STORAGE
    WORKER_TDA --> REDIS_CACHE
    WORKER_ML --> PG
    WORKER_ML --> WS_HUB
```

### 1.2 Component Responsibility Matrix

| Subsystem | Primary Technologies | Core Responsibilities |
| :--- | :--- | :--- |
| **Frontend UI** | Next.js 14+, React 18, TypeScript, TailwindCSS, shadcn/ui | Signal audio recording/upload, interactive charts, 3D phase-space visualizer, run monitoring, report export. |
| **Visualization Engine** | D3.js, Plotly.js, Three.js, Lucide Icons | Persistent diagrams, barcodes, persistence landscapes, Betti curves, raw audio waveforms, 3D attractor point clouds. |
| **API Gateway** | FastAPI, Pydantic v2, Starlette, Uvicorn | Request validation, auth verification, file upload chunking, job dispatch, WebSocket streaming. |
| **Task Queue** | Celery 5.3+, Redis 7.2 | Asynchronous pipeline execution, long-running TDA calculations, distributed worker orchestration. |
| **TDA & ML Engine** | GUDHI, scikit-learn, PyTorch, SciPy, NumPy | Signal filtering, Takens delay-coordinate embedding, Vietoris-Rips filtration, topological vectorization, classification, autoencoder anomaly detection, BOCD. |
| **Primary Database** | PostgreSQL 16, SQLAlchemy 2.0, Alembic | Relational records: users, project spaces, signal manifests, event slices, persistence vectors, model metrics. |
| **Artifact Storage** | MinIO / Local POSIX File Storage | Raw `.wav`, `.mat` datasets, preprocessed `.npy` arrays, model checkpoints (`.pt`, `.joblib`). |

---

## 2. Frontend Technical Specification (Next.js 14+)

### 2.1 Technology Stack & Architecture

- **Framework:** Next.js 14.2+ (App Router architecture with React Server Components and Server Actions)
- **Language:** TypeScript 5.4+ (Strict mode enabled, `noImplicitAny: true`, zero untyped `any`)
- **Styling:** Tailwind CSS 3.4+ configured with CSS variables for dark/light themes
- **Component Primitives:** Radix UI primitives accessible via `shadcn/ui`
- **State Management:**
  - **Server State / Caching:** `@tanstack/react-query` v5 for query deduplication, optimistic updates, and background polling.
  - **Client / Session State:** `zustand` v4 for UI layout states, active filters, audio playback position, and inspection selections.
- **Form Management:** `react-hook-form` paired with `zod` for declarative schema validation.
- **Audio Decoding / Processing:** Web Audio API (`AudioContext`, `OfflineAudioContext`) for client-side waveform rendering, fast downsampling, and preview playback.

### 2.2 Routing & Page Architecture

```
src/app/
├── (auth)/
│   ├── login/page.tsx
│   └── register/page.tsx
├── (dashboard)/
│   ├── layout.tsx                     # Main navigation shell, WebSocket provider, status banner
│   ├── page.tsx                       # Dashboard overview: system health, recent runs, alerts
│   ├── signals/
│   │   ├── page.tsx                   # Signal repository & batch management
│   │   ├── upload/page.tsx            # Drag-and-drop chunked file upload & metadata tagging
│   │   └── [id]/page.tsx              # Single-signal inspector: waveform, spectrogram, STA/LTA onsets
│   ├── analysis/
│   │   ├── new/page.tsx               # Pipeline configuration wizard (Takens, GUDHI, models)
│   │   ├── [runId]/page.tsx           # Run results view: TDA diagrams, confusion matrix, metrics
│   │   └── compare/page.tsx           # Side-by-side benchmark comparison (EchoSense vs CNN vs Conv-AE)
│   ├── monitoring/
│   │   └── page.tsx                   # Live acoustic streaming, BOCD changepoints, anomaly alarms
│   ├── models/
│   │   └── page.tsx                   # Model zoo: trained checkpoints, hyperparameters, ROC curves
│   └── settings/
│       └── page.tsx                   # Hardware calibration, sensor sensitivity, API keys
└── api/
    └── auth/[...nextauth]/route.ts    # NextAuth.js session & OAuth/credential handler
```

### 2.3 Scientific Visualization Components

```mermaid
flowchart LR
    A["Raw Signal Waveform"] --> B["STA/LTA Event Slices"]
    B --> C["Takens Delay Embedding\n(Three.js 3D Attractor)"]
    C --> D["Persistent Homology\n(Plotly Diagram & Barcode)"]
    D --> E["Feature Vectorization\n(D3.js Landscape & Betti Curves)"]
    E --> F["Structural Health Status\n(Dashboard Gauges & Alarms)"]
```

#### 2.3.1 Component Specifications

1. **`AttractorPlot.tsx` (3D State-Space Visualizer)**
   - **Engine:** Three.js via `@react-three/fiber` and `@react-three/drei`
   - **Capability:** Interactive rotation, pan, zoom of embedded point cloud \(\mathbf{x}_n = [s(n), s(n+\tau), s(n+2\tau)]\).
   - **Performance:** InstancedMesh geometry rendering up to 50,000 vertices at 60 FPS; color mapping by time index or local trajectory velocity.

2. **`PersistenceDiagram.tsx` (Birth-Death Scatter Plot)**
   - **Engine:** Plotly.js / SVG Canvas
   - **Features:** Diagonal line \(y = x\), distinction of \(H_0\) (connected components) vs \(H_1\) (1-cycles/loops), hover tooltips reporting exact birth, death, and persistence (\(\text{death} - \text{birth}\)), zoom box, log-scale coordinates toggle.

3. **`PersistenceBarcode.tsx`**
   - **Engine:** D3.js (SVG)
   - **Features:** Horizontal bar segments representing topological lifetime across filtration scale \(\epsilon\), sorted by birth or lifetime, synchronized hover crosshair with diagram.

4. **`PersistenceLandscape.tsx`**
   - **Engine:** D3.js / Canvas
   - **Features:** Multi-layer landscape curves \(\lambda_k(t)\) showing dominant topological peaks, fill area under curves, layer toggle (\(k=1, 2, 3, \dots\)).

5. **`SignalWaveform.tsx`**
   - **Engine:** Web Audio API + D3.js Canvas
   - **Features:** Multi-resolution peak decimation for files up to 100 MB; overlay of trigger thresholds (STA/LTA ratio), bounding boxes of segmented events.

6. **`BOCDStreamPlot.tsx`**
   - **Engine:** Plotly.js Heatmap
   - **Features:** Run-length distribution \(P(r_t | x_{1:t})\) matrix plotted over time, highlighted changepoint probabilities \(P(r_t = 0 | x_{1:t})\) with confidence threshold line.

### 2.4 Real-Time WebSocket Client

- Uses a dedicated `useWebSocketMonitoring` custom hook with auto-reconnect, exponential backoff (1s, 2s, 5s, max 30s), and heartbeat pings (`ping`/`pong` every 15 seconds).
- Buffer queue to prevent UI micro-stutters: aggregates streaming acoustic inference packets at 20 Hz frame budget.

---

## 3. Backend Technical Specification (FastAPI & ML Pipeline)

### 3.1 Framework Architecture

- **Runtime:** Python 3.11+
- **Web Framework:** FastAPI 0.111+ with Pydantic v2
- **ASGI Server:** Uvicorn with `uvloop` and `httptools`
- **Asynchronous Task Queue:** Celery 5.4+ backed by Redis 7.2
- **Data Protocols:** JSON for metadata and metrics; Apache Arrow / NumPy `.npy` byte streams for high-dimensional topological representations.

### 3.2 Signal Preprocessing Module (`app/ml/preprocessing.py`)

1. **Audio Ingestion & Quality Assurance:**
   - Supported formats: WAV (16-bit, 24-bit PCM), MP3, AAC, FLAC, and raw MAT files (Siracusano et al. benchmark).
   - Resampling: Polyphase filtering via `scipy.signal.resample_poly` to standardize sample rates (e.g., target 44.1 kHz or 48 kHz for smartphone mode, or 500 kHz for benchmark validation).
2. **Bandpass Filtering:**
   - 4th-order Butterworth digital filter.
   - Frequency band for smartphone acoustic emissions: \(f_{\text{low}} = 500 \text{ Hz}\), \(f_{\text{high}} = 20,000 \text{ Hz}\) (suppressing low-frequency mechanical rumble and high-frequency digital aliasing).
   - Zero-phase filtering via `scipy.signal.filtfilt`.
3. **Event Detection & Segmentation (STA/LTA):**
   - Short-Term Average / Long-Term Average algorithm:
     \[
     \text{STA}(i) = \frac{1}{N_{\text{STA}}} \sum_{j=0}^{N_{\text{STA}}-1} s^2(i-j), \quad \text{LTA}(i) = \frac{1}{N_{\text{LTA}}} \sum_{j=0}^{N_{\text{LTA}}-1} s^2(i-j)
     \]
   - Parameter defaults: \(N_{\text{STA}} = 50\) samples (\(\approx 1 \text{ ms}\)), \(N_{\text{LTA}} = 500\) samples (\(\approx 10 \text{ ms}\)).
   - Event Trigger Condition: \(\frac{\text{STA}(i)}{\text{LTA}(i)} \ge \eta_{\text{trigger}}\) (default 3.5).
   - De-trigger condition: \(\frac{\text{STA}(i)}{\text{LTA}(i)} \le \eta_{\text{detrigger}}\) (default 1.2).
   - Pre-trigger and post-trigger margins: 100 samples padding to capture full onset dynamics.

### 3.3 Takens Delay-Coordinate Embedding (`app/ml/takens_embedding.py`)

Given a discrete acoustic event series \(s = \{s_1, s_2, \dots, s_N\}\), reconstruct the continuous phase-space manifold \(\mathbf{X} \in \mathbb{R}^{M \times d}\):
\[
\mathbf{x}_n = \left[ s(n), s(n + \tau), s(n + 2\tau), \dots, s(n + (d-1)\tau) \right]^T
\]
where \(d\) is the embedding dimension, \(\tau\) is the time delay, and \(M = N - (d-1)\tau\).

1. **Optimal Delay Determination (\(\tau\)):**
   - **Average Mutual Information (AMI):** First local minimum of the mutual information function between \(s(t)\) and \(s(t+\tau)\):
     \[
     I(\tau) = \sum_{i,j} P(s_i, s_{i+\tau}) \log_2 \left( \frac{P(s_i, s_{i+\tau})}{P(s_i) P(s_{i+\tau})} \right)
     \]
   - Fallback: First zero-crossing of the Autocorrelation Function (ACF).
2. **Optimal Embedding Dimension Determination (\(d\)):**
   - **False Nearest Neighbors (FNN) Algorithm:** Calculates the fraction of points that appear as nearest neighbors in dimension \(d\) because of projection overlap rather than true dynamical proximity in dimension \(d+1\).
   - Criterion: Stop when FNN ratio drops below 1% (typical civil SHM acoustic events: \(d \in [3, 6]\)).
3. **Point Cloud Subsampling:**
   - To keep persistent homology computation bounded to \(O(M \log M)\), point clouds with \(M > 1200\) points are subsampled via **Farthest Point Sampling (FPS)** or min-max landmark sampling to preserve outer attractor manifold topology while discarding redundant density.

### 3.4 Persistent Homology Module (`app/ml/persistent_homology.py`)

- **Engine:** GUDHI Library (SimplexTree / RipsComplex)
- **Complex Type:** Vietoris-Rips Complex constructed up to max edge length \(\epsilon_{\max} = 2.0 \cdot \text{std}(\mathbf{X})\).
- **Homological Dimensions:**
  - \(H_0\): 0-dimensional homology (connected components, clustering across scales).
  - \(H_1\): 1-dimensional homology (topological 1-cycles, non-linear orbital loops, attractor vortex structures).
- **Persistence Extraction:**
  - Generates birth-death pairs: \(\mathcal{D}_k = \{(b_i, d_i) \mid 0 \le b_i < d_i \le \epsilon_{\max}\}\) for \(k \in \{0, 1\}\).

### 3.5 Topological Feature Vectorization (`app/ml/feature_extraction.py`)

Converts irregular persistence diagrams into a standardized, fixed-length feature vector \(\mathbf{v}_{\text{topo}} \in \mathbb{R}^{D}\) suitable for tabular and dense classifiers:

1. **Persistence Landscapes (\(\lambda_k(t)\)):**
   - Triangulated landscape functions evaluated across 100 uniform grid points for layers \(k \in \{1, 2, 3, 4, 5\}\) (500 dimensions).
2. **Persistence Images (PI):**
   - Birth-persistence transformed coordinate plane \((b, p = d - b)\).
   - Weighted by sigmoid or linear ramp \(w(b, p) = \arctan(C \cdot p^p)\).
   - Discretized into a \(20 \times 20\) pixel grid with Gaussian kernel smoothing (\(\sigma = 0.05\)) (400 dimensions).
3. **Topological Summary Statistics (Per Homology Dimension \(k \in \{0, 1\}\)):**
   - Total persistence: \(\sum_i (d_i - b_i)\)
   - Mean, variance, skewness, and kurtosis of lifetimes \(\ell_i = d_i - b_i\)
   - Max persistence: \(\max_i (d_i - b_i)\)
   - Persistent Entropy:
     \[
     E(\mathcal{D}_k) = -\sum_{i=1}^n \frac{\ell_i}{L} \log_2 \left( \frac{\ell_i}{L} \right), \quad L = \sum_{i=1}^n \ell_i
     \]
   - Betti curve integrals: \(\int \beta_0(t) dt\), \(\int \beta_1(t) dt\).
4. **Combined Feature Vector Size:** 924 numerical descriptors per event slice.

### 3.6 Machine Learning Models

```mermaid
flowchart TD
    INPUT["Acoustic Event Segment"] --> FEAT["Feature Extraction"]
    FEAT --> TOP_VEC["Topological Vector (924-d)"]
    FEAT --> CONV_VEC["Conventional AE Vector (18-d)"]
    INPUT --> RAW_WAV["Raw Normalized Waveform (1000 samples)"]

    TOP_VEC --> RF["Random Forest Classifier\n(Damage Condition Prediction)"]
    TOP_VEC --> BOCD["Bayesian Online Changepoint\n(Temporal Transition Detection)"]
    RAW_WAV --> AUTOENC["Conv1D Autoencoder\n(Reconstruction Error Anomaly Score)"]
    RAW_WAV --> CNN["1D CNN Baseline\n(Direct Supervised Comparison)"]

    RF --> OUT1["Event Class: Tensile / Shear / Mixed"]
    BOCD --> OUT2["Changepoint Probability P(r_t = 0)"]
    AUTOENC --> OUT3["MSE Anomaly Residue > Threshold"]
    CNN --> OUT4["Baseline Prediction & Benchmark Comparison"]
```

#### 3.6.1 Random Forest Classifier (`app/ml/classifier.py`)
- **Library:** `scikit-learn`
- **Hyperparameters:** `n_estimators=300`, `max_depth=16`, `min_samples_split=4`, `class_weight="balanced_subsample"`, `random_state=42`.
- **Target Classes:**
  1. Undamaged / Ambient Baseline
  2. Micro-crack / Tensile fracture precursor
  3. Macro-crack / Shear & Mixed-mode dislocation

#### 3.6.2 Bayesian Online Changepoint Detection (`app/ml/bocd.py`)
- **Algorithm:** Adams & MacKay (2007) implementation for streaming time series.
- **Hazard Function:** Constant prior hazard rate \(H(r_t) = \frac{1}{\lambda}\) (default \(\lambda = 150\) events).
- **Underlying Predictive Model (UPM):** Conjugate Gaussian-Inverse-Gamma distribution updating sequentially on the stream of persistent entropies and latent anomaly scores:
  \[
  P(r_t = 0 \mid x_{1:t}) = \frac{\sum_{r_{t-1}} P(r_{t-1} \mid x_{1:t-1}) \pi_t^{(r)} H(r)}{\sum_{r_t} P(r_t, x_{1:t})}
  \]
- **Alert Trigger:** Condition met when \(P(r_t = 0 \mid x_{1:t}) > 0.65\) for two consecutive samples.

#### 3.6.3 Conv1D Autoencoder (`app/ml/autoencoder.py`)
- **Framework:** PyTorch 2.3+
- **Purpose:** Unsupervised damage detection trained exclusively on baseline undamaged structural recordings.
- **Architecture:**
  - **Encoder:**
    - `Conv1d(1, 32, kernel_size=7, stride=2, padding=3)` + `BatchNorm1d` + `GELU`
    - `Conv1d(32, 64, kernel_size=5, stride=2, padding=2)` + `BatchNorm1d` + `GELU`
    - `Conv1d(64, 128, kernel_size=3, stride=2, padding=1)` + `BatchNorm1d` + `GELU`
    - `AdaptiveAvgPool1d(16)` \(\to\) Latent Vector \(\mathbf{z} \in \mathbb{R}^{64}\)
  - **Decoder:**
    - `ConvTranspose1d(128, 64, kernel_size=3, stride=2, padding=1, output_padding=1)` + `GELU`
    - `ConvTranspose1d(64, 32, kernel_size=5, stride=2, padding=2, output_padding=1)` + `GELU`
    - `ConvTranspose1d(32, 1, kernel_size=7, stride=2, padding=3, output_padding=1)` + `Tanh`
- **Loss:** \(\mathcal{L}_{\text{recon}} = \frac{1}{T} \sum_{t=1}^T |s(t) - \hat{s}(t)|^2\)
- **Anomaly Score:** Normalized Reconstruction Error (Z-score relative to validation set).

#### 3.6.4 Baseline Benchmark Models
1. **Conventional AE Features Baseline:** 18 physical descriptors extracted via SciPy: Peak Amplitude, Rise Time, Duration, Energy (integral of squared voltage), Ring-Down Counts, Average Frequency, Reverberation Frequency, Margin Factor. Evaluated with Random Forest.
2. **1D CNN Baseline:** 4-layer Deep 1D CNN with Residual connections operating directly on raw 1,000-sample time windows.

---

## 4. Database Schema Specification (PostgreSQL 16)

```mermaid
erDiagram
    USERS ||--o{ PROJECTS : owns
    PROJECTS ||--o{ SIGNALS : contains
    PROJECTS ||--o{ MODELS : registers
    SIGNALS ||--o{ EVENT_SLICES : segmented_into
    SIGNALS ||--o{ ANALYSIS_RUNS : analyzed_in
    ANALYSIS_RUNS ||--o{ TDA_RESULTS : produces
    ANALYSIS_RUNS ||--o{ BOCD_EVENTS : detects
    ANALYSIS_RUNS ||--o{ ANOMALY_SCORES : calculates

    USERS {
        uuid id PK
        varchar email UK
        varchar hashed_password
        varchar full_name
        varchar role
        timestamptz created_at
    }

    PROJECTS {
        uuid id PK
        uuid owner_id FK
        varchar name
        text description
        varchar structure_type
        jsonb metadata
        timestamptz created_at
    }

    SIGNALS {
        uuid id PK
        uuid project_id FK
        varchar filename
        varchar storage_path
        integer sample_rate
        float duration_seconds
        integer channel_count
        varchar file_hash UK
        jsonb acquisition_metadata
        timestamptz created_at
    }

    EVENT_SLICES {
        uuid id PK
        uuid signal_id FK
        integer slice_index
        integer start_sample
        integer end_sample
        float peak_amplitude
        float energy
        varchar label
    }

    ANALYSIS_RUNS {
        uuid id PK
        uuid signal_id FK
        uuid model_id FK
        varchar status
        integer embedding_dimension
        integer time_delay
        float execution_time_seconds
        jsonb metrics_summary
        timestamptz started_at
        timestamptz completed_at
    }

    TDA_RESULTS {
        uuid id PK
        uuid run_id FK
        uuid slice_id FK
        jsonb h0_diagram
        jsonb h1_diagram
        float persistent_entropy_h0
        float persistent_entropy_h1
        text feature_vector_ref
    }

    BOCD_EVENTS {
        uuid id PK
        uuid run_id FK
        integer event_index
        float changepoint_probability
        float run_length_mode
        boolean alert_triggered
    }

    ANOMALY_SCORES {
        uuid id PK
        uuid run_id FK
        uuid slice_id FK
        float reconstruction_mse
        float z_score
        boolean is_anomaly
    }

    MODELS {
        uuid id PK
        uuid project_id FK
        varchar model_type
        varchar version
        varchar weights_storage_path
        jsonb hyperparameters
        jsonb evaluation_metrics
        boolean is_active
        timestamptz trained_at
    }
```

### 4.1 SQL Migration Definitions (Alembic DDL Highlights)

```sql
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) NOT NULL UNIQUE,
    hashed_password VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL DEFAULT 'researcher',
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE signals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    filename VARCHAR(255) NOT NULL,
    storage_path VARCHAR(512) NOT NULL,
    sample_rate INTEGER NOT NULL,
    duration_seconds DOUBLE PRECISION NOT NULL,
    channel_count INTEGER NOT NULL DEFAULT 1,
    file_hash VARCHAR(64) NOT NULL UNIQUE,
    acquisition_metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_signals_project ON signals(project_id);
CREATE INDEX idx_signals_hash ON signals(file_hash);

CREATE TABLE analysis_runs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    signal_id UUID NOT NULL REFERENCES signals(id) ON DELETE CASCADE,
    model_id UUID REFERENCES models(id) ON DELETE SET NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'QUEUED',
    embedding_dimension INTEGER NOT NULL DEFAULT 3,
    time_delay INTEGER NOT NULL DEFAULT 1,
    execution_time_seconds DOUBLE PRECISION,
    metrics_summary JSONB DEFAULT '{}'::jsonb,
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ
);

CREATE INDEX idx_runs_signal ON analysis_runs(signal_id);
CREATE INDEX idx_runs_status ON analysis_runs(status);
```

---

## 5. API Contracts & Endpoint Specifications

### 5.1 REST API Routes

```mermaid
flowchart LR
    A["POST /api/v1/signals/upload"] -->|"Returns 201 + Signal ID"| B["POST /api/v1/analysis/run"]
    B -->|"Returns 202 + Run ID (Queued)"| C["GET /api/v1/analysis/{run_id}/status"]
    C -->|"Poll or Wait WS"| D["GET /api/v1/analysis/{run_id}/results"]
```

#### 5.1.1 POST `/api/v1/signals/upload`
- **Description:** Uploads raw audio signal (`.wav`, `.mat`) with client-side chunking support.
- **Request:** `multipart/form-data`
  - `file`: Binary file stream
  - `project_id`: UUID
  - `structure_type`: string ("RC_BRIDGE_GIRDER", "CONCRETE_SLAB", "STEEL_TRUSS")
  - `sampling_rate_override`: optional integer
- **Response:** `201 Created`
  ```json
  {
    "signal_id": "8f3b23e4-d55a-4632-9cb4-14f7b2331561",
    "filename": "girder_specimen_3_load_cycle_12.wav",
    "sample_rate": 48000,
    "duration_seconds": 12.45,
    "total_samples": 597600,
    "detected_events_count": 84,
    "status": "READY_FOR_ANALYSIS"
  }
  ```

#### 5.1.2 POST `/api/v1/analysis/run`
- **Description:** Enqueues full EchoSense pipeline analysis job to Celery.
- **Request:** `application/json`
  ```json
  {
    "signal_id": "8f3b23e4-d55a-4632-9cb4-14f7b2331561",
    "embedding_strategy": "AUTO",
    "manual_tau": null,
    "manual_dim": null,
    "max_rips_dimension": 1,
    "enable_bocd": true,
    "enable_autoencoder": true,
    "run_comparison_baselines": true
  }
  ```
- **Response:** `202 Accepted`
  ```json
  {
    "run_id": "b786c2aa-9f93-41bb-bcf4-617834bc67d8",
    "status": "QUEUED",
    "queue_position": 1,
    "estimated_duration_seconds": 18.5
  }
  ```

#### 5.1.3 GET `/api/v1/analysis/{run_id}/results`
- **Description:** Returns processed topological diagrams, predictions, and benchmark metrics.
- **Response:** `200 OK`
  ```json
  {
    "run_id": "b786c2aa-9f93-41bb-bcf4-617834bc67d8",
    "status": "COMPLETED",
    "execution_time_seconds": 14.82,
    "optimal_parameters": {
      "tau": 4,
      "dimension": 4,
      "fnn_threshold": 0.008
    },
    "classification": {
      "model": "RandomForest-EchoSense",
      "predicted_condition": "MICRO_CRACK_PRECURSOR",
      "confidence": 0.892,
      "class_probabilities": {
        "UNDAMAGED": 0.041,
        "MICRO_CRACK_PRECURSOR": 0.892,
        "MACRO_CRACK_SHEAR": 0.067
      }
    },
    "bocd": {
      "changepoints_detected": 2,
      "timestamps": [3.45, 8.12],
      "max_changepoint_probability": 0.874
    },
    "autoencoder_anomaly": {
      "mean_reconstruction_error": 0.0421,
      "anomaly_detected": true,
      "peak_z_score": 4.12
    },
    "benchmarks": {
      "echosense_rf": { "accuracy": 0.941, "f1_macro": 0.938 },
      "conventional_ae_rf": { "accuracy": 0.812, "f1_macro": 0.795 },
      "cnn_baseline": { "accuracy": 0.887, "f1_macro": 0.879 }
    },
    "artifacts": {
      "persistence_diagram_url": "/api/v1/artifacts/diagrams/b786c2aa.json",
      "attractor_pointcloud_url": "/api/v1/artifacts/pointclouds/b786c2aa.arrow"
    }
  }
  ```

### 5.2 Real-Time WebSocket Protocol

- **Endpoint:** `ws://localhost:8000/ws/monitoring/{session_id}`
- **Subscribed Channels:** `acoustic.feed`, `analysis.alerts`, `bocd.streaming`
- **Frame Schema (Inference Stream):**
  ```json
  {
    "type": "TELEMETRY_FRAME",
    "timestamp": 1730491823.451,
    "seq": 1482,
    "event_detected": true,
    "instantaneous_rms": 0.0452,
    "dominant_frequency_hz": 4210.5,
    "persistent_entropy": 3.41,
    "bocd_probability": 0.78,
    "anomaly_score": 2.85,
    "alarm_status": "WARNING"
  }
  ```

---

## 6. Infrastructure, DevOps & Containerization

### 6.1 Multi-Service Docker Architecture

```mermaid
flowchart TD
    subgraph Host["Docker Host Infrastructure"]
        TRAEFIK["Reverse Proxy / Ingress (80, 443)"]
        WEB["Next.js Web Container (3000)"]
        API["FastAPI App Container (8000)"]
        CELERY["Celery Worker Container (TDA/ML)"]
        REDIS[("Redis 7.2 (6379)")]
        POSTGRES[("PostgreSQL 16 (5432)")]
        MINIO[("MinIO Object Store (9000)")]
    end

    TRAEFIK --> WEB
    TRAEFIK --> API
    API --> POSTGRES
    API --> REDIS
    API --> MINIO
    CELERY --> REDIS
    CELERY --> POSTGRES
    CELERY --> MINIO
```

### 6.2 Docker Compose Specification (`docker-compose.yml`)

```yaml
version: '3.8'

services:
  frontend:
    build:
      context: .
      dockerfile: Dockerfile
    container_name: echosense_frontend
    environment:
      - NEXT_PUBLIC_API_URL=http://localhost:8000
      - NEXT_PUBLIC_WS_URL=ws://localhost:8000/ws
    ports:
      - "3000:3000"
    depends_on:
      backend:
        condition: service_healthy
    networks:
      - echosense_net

  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    container_name: echosense_backend
    environment:
      - DATABASE_URL=postgresql://echosense:echosense_secure_pass@postgres:5432/echosense
      - REDIS_URL=redis://redis:6379/0
      - CELERY_BROKER_URL=redis://redis:6379/1
      - CELERY_RESULT_BACKEND=redis://redis:6379/2
      - STORAGE_BACKEND=local
      - STORAGE_PATH=/app/data/storage
    volumes:
      - signal_data:/app/data/storage
      - model_artifacts:/app/models
    ports:
      - "8000:8000"
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8000/api/v1/health"]
      interval: 10s
      timeout: 5s
      retries: 5
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_healthy
    networks:
      - echosense_net

  celery_worker:
    build:
      context: ./backend
      dockerfile: Dockerfile
    container_name: echosense_worker
    command: celery -A app.worker worker --loglevel=info --concurrency=4
    environment:
      - DATABASE_URL=postgresql://echosense:echosense_secure_pass@postgres:5432/echosense
      - REDIS_URL=redis://redis:6379/0
      - CELERY_BROKER_URL=redis://redis:6379/1
      - CELERY_RESULT_BACKEND=redis://redis:6379/2
    volumes:
      - signal_data:/app/data/storage
      - model_artifacts:/app/models
    depends_on:
      redis:
        condition: service_healthy
      backend:
        condition: service_started
    networks:
      - echosense_net

  postgres:
    image: postgres:16-alpine
    container_name: echosense_postgres
    environment:
      - POSTGRES_USER=echosense
      - POSTGRES_PASSWORD=echosense_secure_pass
      - POSTGRES_DB=echosense
    ports:
      - "5432:5432"
    volumes:
      - pgdata:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U echosense -d echosense"]
      interval: 5s
      timeout: 5s
      retries: 5
    networks:
      - echosense_net

  redis:
    image: redis:7.2-alpine
    container_name: echosense_redis
    ports:
      - "6379:6379"
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 5s
      timeout: 3s
      retries: 5
    networks:
      - echosense_net

volumes:
  pgdata:
  signal_data:
  model_artifacts:

networks:
  echosense_net:
    driver: bridge
```

---

## 7. Security Architecture & Compliance

1. **Authentication & Authorization:**
   - Stateless JWT authentication signed via HMAC-SHA256 (`HS256`).
   - Token lifecycle: Access token TTL = 60 minutes; Refresh token TTL = 14 days (stored in HTTP-only, `SameSite=Strict`, Secure cookie).
   - Role-Based Access Control (RBAC): `ADMIN` (model training, deletion), `ENGINEER` (signal ingestion, analysis runs, exports), `VIEWER` (read-only dashboards).
2. **Signal File Validation & Sanitization:**
   - MIME validation checking true magic bytes (preventing executable injection disguised as `.wav`).
   - Hard upper limit on file uploads: 100 MB per file.
   - Files stored using non-predictable UUID names on disk (`{uuid4}.wav`), preventing directory traversal attacks (`../`).
3. **CORS & Network Boundaries:**
   - Restricted origin whitelist enforced at both Nginx and FastAPI middleware levels.
   - WebSockets require token exchange during initial HTTP handshake upgrade.

---

## 8. Non-Functional & Performance Requirements

| Parameter | Performance Target | Mitigation / Engineering Strategy |
| :--- | :--- | :--- |
| **API Response Time (Metadata)** | \(p_{95} \le 120 \text{ ms}\) | Index optimization in PostgreSQL, Redis caching of frequent summary stats. |
| **TDA Feature Extraction** | \(p_{95} \le 12.0 \text{ s}\) per 10s audio event | Farthest Point Subsampling of point clouds (\(\le 1200\) points), parallelized Celery task distribution. |
| **3D Attractor FPS** | \(\ge 60 \text{ FPS}\) | Three.js `InstancedMesh` with GPU vertex shaders; avoids individual DOM/SVG nodes. |
| **WebSocket Latency** | \(\le 50 \text{ ms}\) | Redis Pub/Sub backplane, compact binary/JSON payloads, 20 Hz frame throttling. |
| **Concurrent Pipeline Tasks** | \(\ge 10\) simultaneous runs | Celery worker autoscaling, queue separation (fast triage vs. heavy TDA). |
| **Dataset Storage Capacity** | Up to 500 GB AE files | POSIX volume mount / S3/MinIO chunked storage, background compression to zstandard. |

---

## 9. Testing & Quality Assurance Strategy

```mermaid
flowchart LR
    A["Unit Tests\n(PyTest + Jest)"] --> B["TDA Numerical Validation\n(Synthetic Sine/Lorenz Tests)"]
    B --> C["API Integration Tests\n(FastAPI TestClient + Supertest)"]
    C --> D["E2E User Flow Tests\n(Playwright Frontend Automation)"]
    D --> E["Model Benchmark Gates\n(Regression / F1 Thresholds)"]
```

1. **Unit Testing:**
   - Python: `pytest` with `pytest-asyncio`, `pytest-cov` targeting \(\ge 85\%\) code coverage on preprocessing, Takens, and GUDHI extraction.
   - Frontend: `jest` and `@testing-library/react` for UI components, hooks, and mathematical formatting functions.
2. **Topological Invariant Verification (Synthetic Math Tests):**
   - Synthetic Sine Wave Test: Phase-space circle must produce exactly one persistent \(H_1\) feature with infinite lifetime relative to noise.
   - Lorenz Attractor Chaotic Test: Verifies embedding dimension convergence to \(d=3\).
3. **End-to-End Automation:**
   - Playwright suite simulating full flow: Login \(\to\) Signal Upload \(\to\) Parameter Config \(\to\) Run Execution \(\to\) Diagram Exploration \(\to\) PDF Report Export.
