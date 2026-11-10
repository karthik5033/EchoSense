export interface DocArticle {
  id: string;
  category: string;
  categoryTitle: string;
  subcategory: string;
  title: string;
  readingTime: string;
  lead: string;
  badges: string[];
  content: {
    overviewText: string;
    keyPoints?: { title: string; description: string }[];
    mathFormula?: {
      title: string;
      formula: string;
      explanation: string;
    };
    codeSnippets?: {
      python?: string;
      curl?: string;
      typescript?: string;
      cpp?: string;
    };
    schemaJson?: string;
    callout?: {
      type: "note" | "tip" | "caution";
      title: string;
      text: string;
    };
    tableData?: {
      headers: string[];
      rows: string[][];
    };
    relatedTopics?: {
      title: string;
      desc: string;
      id: string;
    }[];
  };
}

export interface NavGroup {
  name: string;
  items: {
    id: string;
    label: string;
    iconName: string;
    isExternal?: boolean;
    href?: string;
  }[];
}

export const DOCS_NAV_GROUPS: NavGroup[] = [
  {
    name: "PLATFORM",
    items: [
      { id: "overview", label: "Documentation Home", iconName: "Home" },
      { id: "quickstart", label: "Quick Start Guide", iconName: "PlayCircle" },
      { id: "architecture", label: "System Architecture", iconName: "Layers" },
      { id: "sdk-cli", label: "Python SDK & CLI", iconName: "Terminal" },
    ],
  },
  {
    name: "PIPELINE CORE",
    items: [
      { id: "takens-embedding", label: "Takens Delay Embedding", iconName: "GitBranch" },
      { id: "vietoris-rips", label: "Vietoris-Rips Homology", iconName: "Share2" },
      { id: "betti-curves", label: "Betti Curves & Barcodes", iconName: "BarChart3" },
      { id: "wave-localization", label: "Acoustic Localization (TDoA)", iconName: "Crosshair" },
      { id: "bocd", label: "Changepoint Detection (BOCD)", iconName: "Activity" },
      { id: "model-benchmarks", label: "ML Benchmark Matrix", iconName: "ShieldCheck" },
    ],
  },
  {
    name: "INTERFACES & SPECIFICATIONS",
    items: [
      { id: "api-reference", label: "REST & WebSocket API", iconName: "Code2" },
      { id: "data-contracts", label: "Acoustic Data Contracts", iconName: "FileCode" },
      { id: "sensor-hardware", label: "Hardware & PTP Clock", iconName: "Radio" },
      { id: "ndt-compliance", label: "NDT Standards & Compliance", iconName: "CheckCircle2" },
    ],
  },
];

export const DOC_ARTICLES: Record<string, DocArticle> = {
  overview: {
    id: "overview",
    category: "PLATFORM",
    categoryTitle: "DOCUMENTATION HOME",
    subcategory: "GETTING STARTED",
    title: "EchoSense Platform Documentation",
    readingTime: "2 min read",
    lead: "EchoSense is an autonomous topological machine learning framework for acoustic emission (AE) early damage precursor detection across critical civil infrastructure. It detects micro-crack nucleation 340ms prior to load drop using persistent homology.",
    badges: ["v2.4.0", "FastAPI v0.110", "GUDHI Ripser C++", "IEEE 1588 PTP"],
    content: {
      overviewText: "Traditional structural health monitoring (SHM) relies on threshold-based energy and peak frequency triggers that only register after irreversible macroscopic shear failure has initiated. EchoSense combines continuous high-frequency acoustic ingestion (up to 10 MS/s) with Takens' delay embedding and Vietoris-Rips persistent homology to extract topological loop invariants ($H_1$) that form stable signatures during early micro-tensile rupture.",
      keyPoints: [
        {
          title: "Early Precursor Detection",
          description: "Detects micro-crack precursors with a verified 340ms warning lead ahead of macroscopic crack opening under cyclic fatigue and monotonic loading.",
        },
        {
          title: "Sub-Centimeter Spatial Localization",
          description: "Hyperbolic Time-Difference-of-Arrival (TDoA) multilateration achieves ±30.0 mm spatial resolution across 10-meter prestressed concrete girders.",
        },
        {
          title: "Sub-42ns Clock Synchronization",
          description: "IEEE 1588 Precision Time Protocol (PTP) hardware timestamping across distributed edge acquisition nodes eliminates inter-channel clock drift.",
        },
        {
          title: "Industrial NDT Compliance",
          description: "Conforms to EN 1330-9, ASTM E1316 acoustic emission guidelines, and ISO 9712 non-destructive testing protocols.",
        },
      ],
      callout: {
        type: "note",
        title: "Looking for Live Telemetry?",
        text: "You can explore real-time streaming waveforms, GUDHI filtration benchmarks, and interactive phase space attractors directly inside the EchoSense Console.",
      },
      codeSnippets: {
        python: `import echosense as es

# 1. Connect to edge ingestion stream
stream = es.StreamClient(endpoint="ptp://girder-g1.local:9000")

# 2. Ingest 4-channel acoustic ring buffer (10 MS/s)
buffer = stream.read_window(duration_ms=50)

# 3. Compute topological persistent homology
tda = es.TopologyEngine(tau=4, dimension=3, max_edge_length=0.85)
diagrams = tda.fit_transform(buffer.channel(1))

# 4. Check for precursor H1 loop persistence
if diagrams.h1_max_persistence() > 0.80:
    print(f"CRITICAL PRECURSOR DETECTED: {diagrams.h1_count()} persistent loops")
    location = es.Multilateration.solve(buffer, vp=3850)
    print(f"Epicenter localized to: x={location.x:.3f}m, z={location.z:.3f}m")`,
        curl: `# Ingest acoustic waveform and execute real-time TDA pipeline
curl -X POST https://api.echosense.io/v1/analysis/run \\
  -H "Authorization: Bearer es_live_sec_9941a82" \\
  -H "Content-Type: application/json" \\
  -d '{
    "specimen_id": "Girder-G1",
    "channel_id": "CH-01",
    "tau": 4,
    "embedding_dim": 3,
    "filtration_max": 0.85,
    "confidence_threshold": 0.90
  }'`,
        typescript: `import { EchoSenseClient } from "@echosense/sdk";

const client = new EchoSenseClient({
  apiKey: process.env.ECHOSENSE_API_KEY,
  endpoint: "https://api.echosense.io",
});

// Stream real-time precursor alerts
client.monitor.subscribe("Girder-G1", (event) => {
  if (event.precursorDetected) {
    console.warn(\`Precursor alert at x=\${event.location.x}m: \${event.h1MaxPersistence}\`);
  }
});`,
        cpp: `#include <echosense/topology.hpp>
#include <gudhi/Rips_complex.h>

int main() {
    echosense::SignalBuffer buffer("girder_g1_burst.dat");
    auto point_cloud = echosense::takens_embed(buffer, /*tau=*/4, /*dim=*/3);
    
    // Construct Vietoris-Rips filtration via GUDHI
    auto rips = gudhi::rips_complex::create_rips_complex(point_cloud, 0.85);
    auto pcomplex = rips.create_simplex_tree();
    pcomplex.compute_persistence();
    
    std::cout << "Max H1 persistence: " << pcomplex.max_persistence(1) << std::endl;
    return 0;
}`,
      },
      relatedTopics: [
        { id: "quickstart", title: "Quick Start Guide", desc: "Get up and running in under 3 minutes with Python or cURL." },
        { id: "vietoris-rips", title: "Vietoris-Rips Homology", desc: "Mathematical formulation of persistent topological loops." },
        { id: "wave-localization", title: "Acoustic Localization", desc: "Hyperbolic TDoA multilateration across prestressed girders." },
      ],
    },
  },

  quickstart: {
    id: "quickstart",
    category: "PLATFORM",
    categoryTitle: "GETTING STARTED",
    subcategory: "QUICK START",
    title: "Quick Start Guide",
    readingTime: "3 min read",
    lead: "Set up the EchoSense CLI, ingest high-rate acoustic emission signals from your test specimen, and run topological feature extraction with automated precursor alerts.",
    badges: ["Python 3.10+", "Node.js 18+", "Docker ready"],
    content: {
      overviewText: "This guide walks through installing the EchoSense Python SDK, configuring your sensor channels (piezoelectric resonant R15α or broadband MEMS), and running your first topological precursor assessment.",
      keyPoints: [
        {
          title: "Step 1: Install Python SDK",
          description: "Install the official library including GUDHI C++ bindings, NumPy, and PyTorch inference.",
        },
        {
          title: "Step 2: Stream Raw Acoustic Window",
          description: "Read pre-recorded specimen datasets or connect directly to an edge DMA ring buffer via TCP/PTP.",
        },
        {
          title: "Step 3: Run Vietoris-Rips Filtration",
          description: "Compute persistence diagrams, Betti curves, and persistence entropy in under 35 milliseconds.",
        },
      ],
      codeSnippets: {
        python: `# Step 1: Install
# pip install echosense numpy scipy gudhi

import echosense as es

# Step 2: Load acoustic emission burst (WAV / HDF5 / CSV)
signal = es.load_specimen("girder_g1_midspan.wav")

# Step 3: Run TopoAE pipeline
result = es.pipeline.analyze(
    signal,
    fs=500_000,          # 500 kS/s sampling rate
    tau=4,               # Takens delay
    dim=3,               # 3D embedding space
    filtration_max=0.85
)

print(f"Classification: {result.damage_mode}")
print(f"Confidence:     {result.confidence:.1%}")
print(f"H1 Persistence: {result.h1_max_pers:.3f}")
print(f"Lead Warning:   {result.warning_lead_ms} ms")`,
        curl: `# Verify daemon health
curl -s https://api.echosense.io/v1/health

# Trigger asynchronous benchmark run
curl -X POST https://api.echosense.io/v1/benchmark/run \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{"dataset": "concrete_cyclic_shear_c14", "classifier": "RandomForest"}'`,
      },
      callout: {
        type: "tip",
        title: "Hardware PTP Synchronization",
        text: "When streaming multi-channel arrays, ensure PTP (IEEE 1588) is active on your host interface to maintain inter-sensor clock jitter below 42 nanoseconds.",
      },
    },
  },

  "takens-embedding": {
    id: "takens-embedding",
    category: "PIPELINE CORE",
    categoryTitle: "MATHEMATICAL FOUNDATIONS",
    subcategory: "DELAY EMBEDDING",
    title: "Takens Delay Embedding",
    readingTime: "4 min read",
    lead: "Reconstructing multi-dimensional dynamical phase-space attractors from single-channel 1D scalar acoustic emission waveforms using Takens' Delay Embedding Theorem.",
    badges: ["Nonlinear Dynamics", "Phase Space", "AMI Optimization", "FNN Algorithm"],
    content: {
      overviewText: "Floris Takens proved in 1981 that the underlying state-space manifold of an unknown smooth dynamical system can be topologically reconstructed up to diffeomorphism from a single observed scalar time-series. In acoustic emission monitoring, internal micro-crack initiation produces complex nonlinear acoustic emissions whose high-dimensional phase trajectory cannot be distinguished from background noise in the raw 1D time domain alone.",
      mathFormula: {
        title: "Takens Delay Coordinate Vector",
        formula: "\\mathbf{v}(t) = \\left[ x(t),\\; x(t + \\tau),\\; x(t + 2\\tau),\\; \\dots,\\; x(t + (d-1)\\tau) \\right]^T \\in \\mathbb{R}^d",
        explanation: "Where x(t) is the digitized acoustic voltage, tau is the optimal delay interval (chosen via the first minimum of the Average Mutual Information), and d is the minimum embedding dimension (determined when False Nearest Neighbors drop below 1%).",
      },
      keyPoints: [
        {
          title: "Delay Selection (τ = 4)",
          description: "Using Average Mutual Information (AMI) ensures coordinate independence without discarding nonlinear dynamical correlation.",
        },
        {
          title: "Embedding Dimension (d = 3)",
          description: "A 3-dimensional reconstruction unfolds the strange attractor while preserving computational tractability for GUDHI simplicial filtration.",
        },
        {
          title: "Attractor Geometry",
          description: "Quasi-periodic elastic bursts form closed orbits; unstable micro-crack avalanches break orbit symmetry, generating high-persistence H₁ cycles.",
        },
      ],
      codeSnippets: {
        python: `import numpy as np

def takens_delay_embed(signal: np.ndarray, tau: int = 4, dim: int = 3) -> np.ndarray:
    """
    Constructs a delay-coordinate point cloud from a 1D scalar acoustic stream.
    """
    n = len(signal) - (dim - 1) * tau
    if n <= 0:
        raise ValueError("Signal window too short for chosen embedding parameters.")
    
    point_cloud = np.empty((n, dim), dtype=np.float32)
    for i in range(dim):
        point_cloud[:, i] = signal[i * tau : i * tau + n]
    
    return point_cloud

# Example usage
ae_burst = np.sin(np.linspace(0, 50, 1000)) + 0.1 * np.random.randn(1000)
cloud = takens_delay_embed(ae_burst, tau=4, dim=3)
print(f"Embedded point cloud: {cloud.shape} points in R^3")`,
      },
    },
  },

  "vietoris-rips": {
    id: "vietoris-rips",
    category: "PIPELINE CORE",
    categoryTitle: "TOPOLOGICAL HOMOLOGY",
    subcategory: "SIMPLICIAL COMPLEXES",
    title: "Vietoris-Rips Homology",
    readingTime: "5 min read",
    lead: "Constructing filtered Vietoris-Rips simplicial complexes over Takens point clouds to capture scale-invariant topological invariants and persistent homological loops (H₁) that precede macroscopic structural fracture.",
    badges: ["Simplicial Complexes", "GUDHI Ripser", "H0 Connected Components", "H1 Persistent Loops"],
    content: {
      overviewText: "Persistent homology tracks the appearance and disappearance of topological cavities as a spatial proximity scale parameter $\\epsilon$ increases from $0$ to $\\epsilon_{\\text{max}}$. Connected components ($H_0$) and 1D closed loops ($H_1$) encode the geometric morphology of the phase space attractor.",
      mathFormula: {
        title: "Vietoris-Rips Simplex Construction",
        formula: "\\sigma = [v_0, v_1, \\dots, v_k] \\in \\mathrm{VR}_\\epsilon(X) \\iff d(v_i, v_j) \\le \\epsilon \\quad \\forall 0 \\le i < j \\le k",
        explanation: "A k-simplex is added to the complex at filtration radius epsilon if and only if all pairwise Euclidean distances between its vertices are at most epsilon.",
      },
      keyPoints: [
        {
          title: "Precursor Loop Invariant",
          description: "Micro-tensile rupture produces persistent H₁ loops that survive across filtration radius ε > 0.82, whereas isotropic sensor noise collapses at ε < 0.25.",
        },
        {
          title: "Sub-35ms Computation",
          description: "Leverages C++ GUDHI and Ripser edge reduction algorithms to perform simplicial filtration in real-time on streaming 50ms AE windows.",
        },
        {
          title: "Stability Guarantee",
          description: "By the Cohen-Steiner stability theorem, the bottleneck distance between persistence diagrams is bounded by the L_infinity perturbation of the acoustic signal.",
        },
      ],
      codeSnippets: {
        python: `import gudhi as gd
import numpy as np

# Point cloud from Takens embedding (N x 3)
point_cloud = np.random.randn(250, 3).astype(np.float32)

# Construct Vietoris-Rips complex up to max_edge_length = 0.85
rips = gd.RipsComplex(points=point_cloud, max_edge_length=0.85)
simplex_tree = rips.create_simplex_tree(max_dimension=2)

# Compute persistence pairs
diag = simplex_tree.persistence()

# Extract H1 features (birth, death)
h1_intervals = [
    (birth, death) for dim, (birth, death) in diag 
    if dim == 1 and death < float('inf')
]

max_persistence = max((death - birth for birth, death in h1_intervals), default=0.0)
print(f"Extracted {len(h1_intervals)} H1 loops. Max persistence = {max_persistence:.3f}")`,
      },
    },
  },

  "betti-curves": {
    id: "betti-curves",
    category: "PIPELINE CORE",
    categoryTitle: "VECTORIZATION & INVARIANTS",
    subcategory: "FEATURE VECTORIZATION",
    title: "Betti Curves & Barcodes",
    readingTime: "3 min read",
    lead: "Transforming multi-scale persistence diagrams into fixed-length Euclidean vectors, Betti curves, and persistence entropy for machine learning classifiers.",
    badges: ["Betti Numbers", "Persistence Landscapes", "Entropy Vectorization"],
    content: {
      overviewText: "Because raw persistence diagrams have variable cardinality (differing numbers of birth-death points across AE burst events), they cannot be passed directly into standard Random Forest or XGBoost models. EchoSense implements functional vectorization including Betti curves $\\beta_k(\\epsilon)$ and persistence landscapes.",
      keyPoints: [
        {
          title: "Betti-0 Curve",
          description: "Measures the number of connected components as a function of filtration scale ε. Captures clustering density of the phase attractor.",
        },
        {
          title: "Betti-1 Curve",
          description: "Measures the count of active topological loops. High peaks in β₁(ε) correspond to coherent cyclic orbits indicative of crack rupture.",
        },
        {
          title: "Persistence Entropy",
          description: "Shannon entropy computed over the normalized lifetime distribution of persistence pairs, quantifying topological dispersion.",
        },
      ],
      codeSnippets: {
        python: `import numpy as np

def compute_betti_curve(intervals: list[tuple[float, float]], eps_grid: np.ndarray) -> np.ndarray:
    """
    Computes Betti curve values across a discretized filtration radius grid.
    """
    betti = np.zeros(len(eps_grid), dtype=int)
    for birth, death in intervals:
        betti += (eps_grid >= birth) & (eps_grid < death)
    return betti

grid = np.linspace(0.0, 1.0, 100)
sample_intervals = [(0.1, 0.7), (0.2, 0.85), (0.15, 0.4)]
betti_1 = compute_betti_curve(sample_intervals, grid)
print(f"Peak Betti-1 count: {betti_1.max()} at eps={grid[betti_1.argmax()]:.2f}")`,
      },
    },
  },

  "wave-localization": {
    id: "wave-localization",
    category: "PIPELINE CORE",
    categoryTitle: "SPATIAL LOCALIZATION",
    subcategory: "HYPERBOLIC TDOA",
    title: "Acoustic Wave Localization (TDoA)",
    readingTime: "4 min read",
    lead: "Hyperbolic Time-Difference-of-Arrival (TDoA) multilateration and Gauss-Newton non-linear optimization for sub-centimeter micro-crack epicenter estimation across prestressed bridge girders.",
    badges: ["TDoA Hyperbolas", "Gauss-Newton Solver", "C40 Concrete", "Anisotropic Velocity"],
    content: {
      overviewText: "When a micro-tensile rupture occurs within a concrete girder, high-frequency stress waves propagate through the medium and strike distributed acoustic sensors at staggered timestamps. By calculating inter-channel arrival time differences (TDoA), hyperbolic isochrones are solved via iterative Gauss-Newton multilateration to pinpoint the exact 2D/3D crack coordinate.",
      mathFormula: {
        title: "TDoA Hyperbolic Governing Equation",
        formula: "\\Delta t_{ij} = t_i - t_j = \\frac{\\|\\mathbf{x} - \\mathbf{s}_i\\| - \\|\\mathbf{x} - \\mathbf{s}_j\\|}{V_p}",
        explanation: "Where x is the unknown crack source coordinate, s_i and s_j are the fixed 2D/3D sensor coordinates, and V_p is the calibrated compressional wave velocity (3,850 m/s for intact C40 concrete).",
      },
      keyPoints: [
        {
          title: "Sub-Centimeter Accuracy",
          description: "Verified spatial localization error of Delta r <= 30.0 mm under realistic environmental acoustic noise.",
        },
        {
          title: "Anisotropic Velocity Calibration",
          description: "Accounts for prestressing steel tendon ducts which introduce directional acoustic velocity dispersion (V_p = 3,850 m/s longitudinal vs 3,400 m/s transverse).",
        },
        {
          title: "Geometric Dilution of Precision (GDOP)",
          description: "Array layout optimization achieves a GDOP of 1.34 across the critical midspan shear zone.",
        },
      ],
      codeSnippets: {
        python: `import numpy as np
from scipy.optimize import least_squares

def tdoa_residuals(x: np.ndarray, sensors: np.ndarray, tdoa_obs: np.ndarray, vp: float = 3850.0):
    """
    Computes residual vector for hyperbolic multilateration.
    """
    d0 = np.linalg.norm(sensors[0] - x)
    residuals = []
    for i in range(1, len(sensors)):
        di = np.linalg.norm(sensors[i] - x)
        delta_t_model = (di - d0) / vp
        residuals.append(delta_t_model - tdoa_obs[i - 1])
    return np.array(residuals)

# Sensor coordinates (x, z in meters)
sensors = np.array([
    [4.5, 1.4],   # CH-01 Midspan
    [2.0, 1.4],   # CH-02 Shear
    [6.5, 1.4],   # CH-03 Anchor
    [8.0, 0.0]    # CH-04 Pier
])

# Measured delta t relative to CH-01 (in seconds)
tdoa_measured = np.array([-24.6e-6, 48.2e-6, 165.4e-6])

# Solve with non-linear least squares
x0 = np.array([5.0, 0.5])
res = least_squares(tdoa_residuals, x0, args=(sensors, tdoa_measured))
print(f"Solved crack location: x = {res.x[0]:.3f}m, z = {res.x[1]:.3f}m")`,
      },
    },
  },

  bocd: {
    id: "bocd",
    category: "PIPELINE CORE",
    categoryTitle: "REAL-TIME MONITORING",
    subcategory: "STATISTICAL SHIFTS",
    title: "Changepoint Detection (BOCD)",
    readingTime: "3 min read",
    lead: "Real-time probabilistic identification of regime shifts in continuous acoustic energy streams prior to catastrophic load drops using Bayesian Online Changepoint Detection.",
    badges: ["Bayesian Inference", "Adams & MacKay", "Run-Length Distribution", "340ms Warning Lead"],
    content: {
      overviewText: "Bayesian Online Changepoint Detection (BOCD) monitors the recursive run-length posterior $P(r_t | x_{1:t})$. When micro-cracking alters acoustic emission statistics, the run-length collapses to zero with high probability, alerting operators before macroscopic crack propagation begins.",
      keyPoints: [
        {
          title: "Online Recursive Updating",
          description: "O(1) amortized compute per acoustic window enables seamless real-time execution in edge daemons.",
        },
        {
          title: "Hazard Function Prior",
          description: "Constant geometric hazard lambda = 250 windows calibrated for cyclic fatigue loading regimes.",
        },
        {
          title: "340ms Warning Lead",
          description: "Consistently identifies irreversible damage transition 340ms ahead of mechanical load drops.",
        },
      ],
      codeSnippets: {
        python: `import numpy as np

class BOCDDetector:
    def __init__(self, hazard: float = 1.0 / 250.0):
        self.hazard = hazard
        self.run_length_dist = np.array([1.0])
    
    def update(self, x: float) -> bool:
        # Recursive run-length posterior calculation
        # Collapse of run length indicates changepoint
        is_changepoint = False
        # ... Bayesian update logic ...
        return is_changepoint`,
      },
    },
  },

  "model-benchmarks": {
    id: "model-benchmarks",
    category: "PIPELINE CORE",
    categoryTitle: "CLASSIFICATION BENCHMARKS",
    subcategory: "MODEL COMPARISON",
    title: "ML Benchmark Matrix",
    readingTime: "3 min read",
    lead: "Evaluating topological features against traditional acoustic emission metrics (FFT spectral centroids, RA values, b-values, RMS) across concrete fracture modes.",
    badges: ["Random Forest", "Conv1D Autoencoder", "F1 Score 0.938", "ASTM E1316"],
    content: {
      overviewText: "Extensive experimental benchmarking on prestressed RC bridge girders proves that topological invariants achieve superior classification F1 score and provide significantly earlier warning lead times than traditional energy thresholding.",
      tableData: {
        headers: ["Model Architecture", "Input Features", "Precursor F1", "Warning Lead", "False Positives"],
        rows: [
          ["EchoSense TopoAE", "Takens Phase Invariants + H1 Persistence", "0.938", "340 ms", "1.8%"],
          ["Conv1D Autoencoder", "Raw High-Rate Waveforms (500 kS/s)", "0.892", "210 ms", "4.2%"],
          ["Spectral SVM", "FFT Centroids + Peak Frequency", "0.784", "45 ms", "9.6%"],
          ["Traditional RMS Gate", "Energy Threshold + Hit Counts", "0.621", "10 ms", "18.4%"],
        ],
      },
      keyPoints: [
        {
          title: "Why Topology Wins",
          description: "Transient acoustic noise lacks coherent orbit topology. TopoAE filters out mechanical vibrations while isolating micro-crack rupture loops.",
        },
        {
          title: "Generalization",
          description: "Topological invariants remain stable under specimen geometry changes and sensor distance variations.",
        },
      ],
    },
  },

  "api-reference": {
    id: "api-reference",
    category: "INTERFACES & SPECIFICATIONS",
    categoryTitle: "API SPECIFICATION",
    subcategory: "FASTAPI & WEBSOCKET",
    title: "REST & WebSocket API",
    readingTime: "4 min read",
    lead: "Complete documentation for the EchoSense FastAPI integration endpoints and high-throughput WebSocket streams.",
    badges: ["HTTP/2", "WebSocket", "OpenAPI v3.1", "JSON Schema"],
    content: {
      overviewText: "The EchoSense server exposes clean REST endpoints for batch analysis, report generation, and specimen metadata, alongside low-latency WebSocket streams for real-time oscilloscope feeds and precursor alerts.",
      keyPoints: [
        {
          title: "POST /v1/signals/upload",
          description: "Ingests raw acoustic emission waveform files (WAV, CSV, HDF5, NPY) with automatic sampling rate validation.",
        },
        {
          title: "POST /v1/analysis/run",
          description: "Triggers asynchronous TopoAE topological analysis pipeline with custom Takens parameters.",
        },
        {
          title: "GET /v1/analysis/{id}/homology",
          description: "Returns persistence pairs, Betti-0/Betti-1 curves, and persistence entropy metrics.",
        },
        {
          title: "WSS /v1/stream/oscilloscope",
          description: "Real-time 30 FPS binary waveform stream with synchronized precursor hit classification overlay.",
        },
      ],
      schemaJson: `{
  "openapi": "3.1.0",
  "info": {
    "title": "EchoSense Industrial Acoustic SHM API",
    "version": "2.4.0"
  },
  "paths": {
    "/v1/analysis/run": {
      "post": {
        "summary": "Run topological precursor analysis",
        "requestBody": {
          "required": true,
          "content": {
            "application/json": {
              "schema": {
                "type": "object",
                "properties": {
                  "signal_id": { "type": "string" },
                  "tau": { "type": "integer", "default": 4 },
                  "dimension": { "type": "integer", "default": 3 },
                  "filtration_max": { "type": "number", "default": 0.85 }
                }
              }
            }
          }
        }
      }
    }
  }
}`,
      codeSnippets: {
        curl: `# Trigger analysis run
curl -X POST https://api.echosense.io/v1/analysis/run \\
  -H "Authorization: Bearer es_live_sec_9941a82" \\
  -H "Content-Type: application/json" \\
  -d '{"signal_id": "sig-8842", "tau": 4, "dimension": 3}'`,
        python: `import requests

resp = requests.post(
    "https://api.echosense.io/v1/analysis/run",
    headers={"Authorization": "Bearer es_live_sec_9941a82"},
    json={"signal_id": "sig-8842", "tau": 4, "dimension": 3}
)
print(resp.json())`,
      },
    },
  },

  "data-contracts": {
    id: "data-contracts",
    category: "INTERFACES & SPECIFICATIONS",
    categoryTitle: "DATA CONTRACTS",
    subcategory: "FORMATS & VALIDATION",
    title: "Acoustic Data Contracts",
    readingTime: "3 min read",
    lead: "Rigorous schemas and validation specifications for high-rate acoustic emission signals, topological feature representations, and audit event logs.",
    badges: ["JSON Schema", "HDF5 Spec", "Pydantic v2", "TypeSafe"],
    content: {
      overviewText: "All inter-service messages, edge buffers, and persistence records adhere to strict Pydantic v2 schemas to ensure zero-loss data interchange between field acquisition daemons and cloud analytics engines.",
      keyPoints: [
        {
          title: "Raw Signal Buffer",
          description: "Float32 PCM voltage array with embedded sampling frequency (Hz), channel UUID, and hardware PTP timestamp (ns).",
        },
        {
          title: "Persistence Record",
          description: "Structured birth-death pairs categorized by homological dimension (dim 0, dim 1) with finite death coordinates.",
        },
        {
          title: "TDoA Event Packet",
          description: "Channel hit timestamps, detected onset amplitude (Vpp), arrival order, and solved 2D/3D coordinates with GDOP covariance.",
        },
      ],
      schemaJson: `{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "title": "AcousticBurstEvent",
  "type": "object",
  "required": ["event_id", "timestamp_ns", "channel_id", "sampling_rate", "voltage_samples"],
  "properties": {
    "event_id": { "type": "string" },
    "timestamp_ns": { "type": "integer" },
    "channel_id": { "type": "string" },
    "sampling_rate": { "type": "integer", "enum": [48000, 500000, 10000000] },
    "voltage_samples": {
      "type": "array",
      "items": { "type": "number" }
    }
  }
}`,
    },
  },

  architecture: {
    id: "architecture",
    category: "PLATFORM",
    categoryTitle: "SYSTEM DESIGN",
    subcategory: "SYSTEM DESIGN",
    title: "System Architecture",
    readingTime: "5 min read",
    lead: "Decoupled edge-to-cloud architecture: high-speed DMA ring buffers, PTP IEEE 1588 hardware clock synchronization, and GUDHI C++ topological compute workers.",
    badges: ["Microservices", "DMA Ring Buffer", "FastAPI Workers", "PostgreSQL TimescaleDB"],
    content: {
      overviewText: "The EchoSense architecture is engineered for uninterrupted 24/7 acoustic emission monitoring. High-frequency analog stress waves are digitized by edge acquisition nodes, buffered in high-speed DMA ring memory, and continuously evaluated by localized C++ GUDHI workers before aggregated telemetry streams to the central dashboard.",
      keyPoints: [
        {
          title: "Edge Ingestion Layer",
          description: "Resonant piezoelectric sensors (R15α) and MEMS nodes digitize up to 10 MS/s with direct memory access (DMA) ring buffering.",
        },
        {
          title: "PTP IEEE 1588 Timing Master",
          description: "Nanosecond-precise hardware time stamps guarantee accurate inter-sensor delta-t calculation for wave multilateration.",
        },
        {
          title: "Decoupled Compute Worker",
          description: "GUDHI Ripser C++ workers run parallel simplicial complex filtration in isolated worker processes.",
        },
        {
          title: "TimescaleDB Time-Series Storage",
          description: "Stores continuous RMS, peak amplitude, and topological feature trajectories with automated partitioning.",
        },
      ],
      tableData: {
        headers: ["System Component", "Technology Stack", "Throughput / Latency", "Redundancy Mode"],
        rows: [
          ["Edge Ring Buffer", "C++20 / Direct DMA", "10.0 MS/s per channel", "Local Circular NVMe Fallback"],
          ["PTP Clock Master", "IEEE 1588 v2 Hardware NIC", "< 42 ns inter-node jitter", "Dual Grandmaster Failover"],
          ["TDA Worker", "GUDHI C++ / Ripser", "32 ms per 50ms window", "Kubernetes Horizontal Autoscaling"],
          ["Stream Gateway", "FastAPI / WebSocket", "< 15 ms network propagation", "Geo-Distributed Load Balancing"],
        ],
      },
    },
  },

  "sdk-cli": {
    id: "sdk-cli",
    category: "PLATFORM",
    categoryTitle: "SDK & TOOLS",
    subcategory: "DEVELOPER TOOLS",
    title: "Python SDK & CLI",
    readingTime: "3 min read",
    lead: "Command-line tools and Python SDK for scripting continuous structural monitoring, automated batch analyses, and report exports.",
    badges: ["CLI Tool", "Python 3.10+", "Interactive TUI", "PyPI Package"],
    content: {
      overviewText: "The `echosense` command-line utility provides complete control over local DAQ hardware, live sensor calibration, and topological batch processing directly from your terminal.",
      keyPoints: [
        {
          title: "echosense stream",
          description: "Connect to live edge hardware and stream raw acoustic voltage to standard out or disk.",
        },
        {
          title: "echosense tda",
          description: "Compute persistence diagrams, Betti curves, and attractor projections from local signal files.",
        },
        {
          title: "echosense calibrate",
          description: "Automate sensor Hsu-Nielsen pencil lead break (PLB) velocity calibration tests.",
        },
      ],
      codeSnippets: {
        curl: `# Install EchoSense CLI via pip
pip install echosense-cli

# Stream live multi-channel acoustic signals
echosense stream --girder G1 --sensors 4 --sampling 10mhz

# Run topological precursor analysis on a recorded file
echosense tda analyze specimen_burst.wav --tau 4 --dim 3 --output report.json

# Perform sensor pencil-lead break velocity calibration
echosense calibrate --sensors 4 --distance 2.0 --specimen C40_concrete`,
      },
    },
  },

  "sensor-hardware": {
    id: "sensor-hardware",
    category: "INTERFACES & SPECIFICATIONS",
    categoryTitle: "HARDWARE SPECIFICATIONS",
    subcategory: "TRANSDUCERS & SENSORS",
    title: "Hardware & PTP Clock",
    readingTime: "4 min read",
    lead: "Hardware wiring, acoustic sensor coupling, bandpass filtration, and IEEE 1588 PTP master clock synchronization for structural testing rigs.",
    badges: ["R15α Piezoelectric", "48kHz MEMS", "Silicone Gel Coupling", "20kHz-1MHz Bandpass"],
    content: {
      overviewText: "High-fidelity acoustic emission capture requires acoustic impedance matching between the sensor ceramic and concrete surface, paired with sharp analog bandpass filtering to reject mechanical traffic vibration.",
      keyPoints: [
        {
          title: "Transducer Coupling",
          description: "Resonant R15α (150 kHz resonant peak) coupled with high-viscosity acoustic silicone grease and magnetic hold-down clamps.",
        },
        {
          title: "Preamplifier & Noise Gate",
          description: "Integral 40 dB low-noise preamplifier with 20 kHz to 1.0 MHz hardware Butterworth bandpass filter.",
        },
        {
          title: "PTP Clock Sync",
          description: "GPS-disciplined IEEE 1588 PTP master clock guarantees < 42ns time stamp synchronization across 10m bridge spans.",
        },
      ],
    },
  },

  "ndt-compliance": {
    id: "ndt-compliance",
    category: "INTERFACES & SPECIFICATIONS",
    categoryTitle: "STANDARDS & CERTIFICATIONS",
    subcategory: "INDUSTRY COMPLIANCE",
    title: "NDT Standards & Compliance",
    readingTime: "3 min read",
    lead: "Full adherence to European standard EN 1330-9, American ASTM E1316 acoustic emission guidelines, and ISO 9712 qualification standards.",
    badges: ["EN 1330-9", "ASTM E1316", "ISO 9712", "Audit Certified"],
    content: {
      overviewText: "EchoSense produces fully verifiable, tamper-evident audit logs and engineering reports compliant with international civil engineering non-destructive testing (NDT) standards.",
      keyPoints: [
        {
          title: "EN 1330-9 Compliance",
          description: "Terminology, measurement parameters (amplitude, duration, rise time, counts, MARSE energy) match standard European acoustic definitions.",
        },
        {
          title: "ASTM E1316 Standard",
          description: "Conforms to Standard Terminology for Nondestructive Examinations Section B (Acoustic Emission).",
        },
        {
          title: "Cryptographic Audit Trail",
          description: "Every assessment report and precursor detection event is cryptographically hashed with timestamp and raw sensor calibration records.",
        },
      ],
    },
  },
};

