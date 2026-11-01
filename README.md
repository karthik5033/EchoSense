<div align="center">

# 🔬 EchoSense

### A Topological Machine Learning Framework for Structural Damage Precursor Detection from Smartphone Acoustic Emission Signals

[![Build Status](https://img.shields.io/github/actions/workflow/status/karthik5033/EchoSense/ci.yml?branch=main&style=for-the-badge&logo=githubactions&logoColor=white)](https://github.com/karthik5033/EchoSense/actions)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg?style=for-the-badge&logo=opensourceinitiative&logoColor=white)](LICENSE)
[![Next.js](https://img.shields.io/badge/Next.js-14+-black?style=for-the-badge&logo=next.js&logoColor=white)](https://nextjs.org/)
[![Python](https://img.shields.io/badge/Python-3.11+-3776AB?style=for-the-badge&logo=python&logoColor=white)](https://python.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.100+-009688?style=for-the-badge&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![Docker](https://img.shields.io/badge/Docker-Ready-2496ED?style=for-the-badge&logo=docker&logoColor=white)](https://www.docker.com/)

<br/>

**EchoSense** bridges **topological data analysis** and **deep learning** to detect early-stage structural damage from acoustic emission signals — recorded with nothing more than a smartphone.

[Getting Started](#-getting-started) · [Architecture](#-architecture) · [API Docs](#-api-documentation) · [Contributing](#-contributing)

<br/>

<!-- Replace with an actual screenshot of the dashboard -->
<img src="docs/assets/dashboard-preview.png" alt="EchoSense Dashboard Preview" width="85%"/>

*Interactive structural health monitoring dashboard with real-time topological analysis*

</div>

---

## 📖 Overview

EchoSense is a full-stack web application that provides an interactive dashboard for **structural health monitoring (SHM)** using topological machine learning. It processes smartphone-recorded acoustic emission (AE) signals to detect structural damage precursors in civil and mechanical infrastructure.

The core innovation lies in applying **persistent homology** — a technique from topological data analysis (TDA) — to reconstruct the state-space geometry of AE waveforms via Takens embedding, then extracting shape-aware features that capture crack initiation and propagation signatures invisible to conventional spectral methods.

### How It Works

1. **Record** acoustic emissions from a structure using a smartphone microphone
2. **Upload** the signal to the EchoSense dashboard
3. **Analyze** — the ML pipeline segments events, reconstructs attractors, computes persistence diagrams, and classifies structural condition
4. **Monitor** — real-time changepoint detection alerts you to emerging damage precursors

---

## ✨ Key Features

- 🧮 **Topological Feature Extraction** — Persistent homology via GUDHI with persistence landscapes, images, and statistical summaries
- 📱 **Smartphone-Compatible** — Works with standard smartphone microphone recordings; no specialized AE sensors required
- 🔄 **Real-Time Monitoring** — Bayesian Online Changepoint Detection (BOCD) for live structural state tracking
- 🤖 **Multi-Model Pipeline** — Random Forest classification + Conv1D Autoencoder anomaly validation
- 📊 **Interactive Visualizations** — D3.js/Plotly-powered persistence diagrams, barcodes, landscapes, and signal waveforms
- 🏗️ **State-Space Reconstruction** — Takens delay-coordinate embedding for attractor geometry analysis
- 🧪 **Benchmark Comparisons** — Side-by-side evaluation against conventional AE features and CNN baselines
- 🐳 **Fully Containerized** — One-command deployment with Docker Compose
- ⚡ **Async Task Processing** — Celery + Redis for non-blocking ML pipeline execution
- 🔐 **Production Ready** — CI/CD via GitHub Actions, comprehensive test suites, environment-based configuration

---

## 🏛️ Architecture

```mermaid
graph TB
    subgraph Frontend["🖥️ Frontend — Next.js 14 + TypeScript"]
        UI["React 18 + shadcn/ui"]
        VIZ["D3.js / Plotly Visualizations"]
        API_CLIENT["API Client Layer"]
    end

    subgraph Backend["⚙️ Backend — FastAPI + Celery"]
        REST["FastAPI REST API"]
        CELERY["Celery Workers"]
        CACHE["Redis Cache / Broker"]
    end

    subgraph ML_Pipeline["🧠 ML Pipeline"]
        PREPROCESS["Signal Preprocessing &\nEvent Segmentation"]
        TAKENS["Takens Delay-Coordinate\nEmbedding"]
        TDA["Persistent Homology\n(GUDHI)"]
        FEATURES["Feature Vectorization\n(Landscapes, Images, Stats)"]
        CLASSIFY["Random Forest\nClassification"]
        BOCD["Bayesian Online\nChangepoint Detection"]
        AUTOENC["Conv1D Autoencoder\nAnomaly Validation"]
    end

    subgraph Storage["💾 Storage"]
        PG[("PostgreSQL")]
        REDIS_STORE[("Redis")]
    end

    UI --> API_CLIENT
    VIZ --> API_CLIENT
    API_CLIENT -->|"HTTP/REST"| REST
    REST --> CELERY
    CELERY --> CACHE
    CELERY --> PREPROCESS
    PREPROCESS --> TAKENS
    TAKENS --> TDA
    TDA --> FEATURES
    FEATURES --> CLASSIFY
    FEATURES --> BOCD
    FEATURES --> AUTOENC
    REST --> PG
    CACHE --> REDIS_STORE

    style Frontend fill:#0f172a,stroke:#3b82f6,color:#e2e8f0
    style Backend fill:#1e1b4b,stroke:#8b5cf6,color:#e2e8f0
    style ML_Pipeline fill:#14532d,stroke:#22c55e,color:#e2e8f0
    style Storage fill:#7c2d12,stroke:#f97316,color:#e2e8f0
```

---

## 🛠️ Tech Stack

### Frontend

| Technology | Purpose |
|:---|:---|
| **Next.js 14+** | React framework with App Router, SSR/SSG |
| **TypeScript 5+** | Type-safe development |
| **React 18** | UI component library |
| **TailwindCSS** | Utility-first CSS framework |
| **shadcn/ui** | Accessible, composable component system |
| **D3.js / Plotly** | Interactive scientific visualizations |

### Backend

| Technology | Purpose |
|:---|:---|
| **Python 3.11+** | Core language for ML and API |
| **FastAPI** | High-performance async REST API |
| **Celery** | Distributed task queue for ML jobs |
| **Redis** | Message broker + caching layer |
| **PostgreSQL** | Persistent relational storage |

### Machine Learning

| Technology | Purpose |
|:---|:---|
| **NumPy / SciPy** | Numerical computation & signal processing |
| **Pandas** | Data manipulation & analysis |
| **scikit-learn** | Random Forest, metrics, preprocessing |
| **GUDHI** | Persistent homology & topological analysis |
| **PyTorch** | Conv1D Autoencoder & deep learning models |

### Infrastructure

| Technology | Purpose |
|:---|:---|
| **Docker / Docker Compose** | Containerization & orchestration |
| **GitHub Actions** | CI/CD pipelines |

---

## 📋 Prerequisites

Ensure the following are installed on your system:

| Requirement | Version | Check Command |
|:---|:---|:---|
| **Node.js** | 18.0+ | `node --version` |
| **pnpm** | 8.0+ | `pnpm --version` |
| **Python** | 3.11+ | `python --version` |
| **Docker** | 24.0+ | `docker --version` |
| **Docker Compose** | 2.20+ | `docker compose version` |
| **PostgreSQL** | 15+ | `psql --version` |
| **Redis** | 7.0+ | `redis-cli --version` |

> [!NOTE]
> PostgreSQL and Redis can be run via Docker (recommended) instead of installing locally. See the [Docker Compose](#option-1-docker-compose-recommended) setup below.

---

## 🚀 Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/karthik5033/EchoSense.git
cd echosense
```

### 2. Environment Setup

Create environment files from the provided templates:

```bash
# Frontend environment
cp .env.example .env.local

# Backend environment
cp backend/.env.example backend/.env
```

Edit `.env.local` (frontend):

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_APP_NAME=EchoSense
```

Edit `backend/.env` (backend):

```env
DATABASE_URL=postgresql://echosense:echosense@localhost:5432/echosense
REDIS_URL=redis://localhost:6379/0
SECRET_KEY=your-secret-key-change-in-production
ENVIRONMENT=development
DEBUG=true
```

See the [Environment Variables](#-environment-variables) section for a complete reference.

### 3. Install Frontend Dependencies

```bash
pnpm install
```

### 4. Install Backend Dependencies

```bash
cd backend

# Option A: Using uv (recommended)
uv venv
source .venv/bin/activate   # Linux/macOS
# .venv\Scripts\activate    # Windows
uv pip install -r requirements.txt

# Option B: Using pip
python -m venv .venv
source .venv/bin/activate   # Linux/macOS
# .venv\Scripts\activate    # Windows
pip install -r requirements.txt

cd ..
```

### 5. Database Setup

```bash
# If running PostgreSQL locally
createdb echosense

# Run migrations
cd backend
alembic upgrade head
cd ..
```

### 6. Launch the Application

#### Option 1: Docker Compose (Recommended)

```bash
# Build and start all services
docker compose up --build

# Or run in detached mode
docker compose up --build -d
```

This starts:
- 🖥️ **Frontend** → `http://localhost:3000`
- ⚙️ **Backend API** → `http://localhost:8000`
- 📖 **API Docs** → `http://localhost:8000/docs`
- 🐘 **PostgreSQL** → `localhost:5432`
- 🔴 **Redis** → `localhost:6379`
- 👷 **Celery Worker** → background processing

#### Option 2: Run Services Individually

**Terminal 1 — Frontend:**

```bash
pnpm dev
```

**Terminal 2 — Backend API:**

```bash
cd backend
source .venv/bin/activate
uvicorn app.main:app --reload --port 8000
```

**Terminal 3 — Celery Worker:**

```bash
cd backend
source .venv/bin/activate
celery -A app.worker worker --loglevel=info
```

> [!TIP]
> When running services individually, ensure PostgreSQL and Redis are running locally or via `docker compose up postgres redis`.

---

## 📁 Project Structure

```
echosense/
├── 📂 src/                          # Next.js frontend source
│   ├── app/                         # App Router pages & layouts
│   │   ├── (dashboard)/             # Dashboard route group
│   │   │   ├── analysis/            # Analysis results page
│   │   │   ├── monitoring/          # Real-time monitoring page
│   │   │   └── upload/              # Signal upload page
│   │   ├── api/                     # Next.js API routes (BFF)
│   │   ├── layout.tsx               # Root layout
│   │   └── page.tsx                 # Landing page
│   ├── components/                  # React components
│   │   ├── ui/                      # shadcn/ui primitives
│   │   ├── charts/                  # D3.js/Plotly visualizations
│   │   │   ├── PersistenceDiagram.tsx
│   │   │   ├── PersistenceBarcode.tsx
│   │   │   ├── PersistenceLandscape.tsx
│   │   │   ├── SignalWaveform.tsx
│   │   │   └── AttractorPlot.tsx
│   │   └── dashboard/              # Dashboard-specific components
│   ├── lib/                         # Utilities & API client
│   ├── hooks/                       # Custom React hooks
│   ├── types/                       # TypeScript type definitions
│   └── styles/                      # Global styles
├── 📂 backend/                      # Python backend
│   ├── app/
│   │   ├── api/                     # FastAPI route handlers
│   │   │   ├── v1/
│   │   │   │   ├── signals.py       # Signal upload & management
│   │   │   │   ├── analysis.py      # Analysis endpoints
│   │   │   │   └── monitoring.py    # Real-time monitoring
│   │   │   └── deps.py             # Dependency injection
│   │   ├── core/                    # App configuration & security
│   │   ├── models/                  # SQLAlchemy ORM models
│   │   ├── schemas/                 # Pydantic request/response schemas
│   │   ├── services/                # Business logic layer
│   │   ├── ml/                      # ML pipeline modules
│   │   │   ├── preprocessing.py     # Signal preprocessing
│   │   │   ├── takens_embedding.py  # Delay-coordinate embedding
│   │   │   ├── persistent_homology.py  # GUDHI TDA computations
│   │   │   ├── feature_extraction.py   # Topological feature vectors
│   │   │   ├── classifier.py        # Random Forest classifier
│   │   │   ├── bocd.py              # Bayesian changepoint detection
│   │   │   └── autoencoder.py       # Conv1D autoencoder
│   │   ├── worker.py                # Celery worker configuration
│   │   └── main.py                  # FastAPI application entry point
│   ├── alembic/                     # Database migrations
│   ├── tests/                       # Backend test suite
│   ├── requirements.txt
│   └── Dockerfile
├── 📂 data/                         # Datasets & sample signals
├── 📂 models/                       # Trained model artifacts
├── 📂 docs/                         # Documentation & assets
├── 📂 public/                       # Next.js static assets
├── docker-compose.yml               # Multi-service orchestration
├── Dockerfile                       # Frontend Docker build
├── next.config.js                   # Next.js configuration
├── tailwind.config.ts               # Tailwind configuration
├── tsconfig.json                    # TypeScript configuration
├── package.json
├── pnpm-lock.yaml
├── .github/
│   └── workflows/
│       └── ci.yml                   # GitHub Actions CI/CD
├── .env.example                     # Frontend env template
├── LICENSE
└── README.md
```

---

## 🔑 Environment Variables

### Frontend (`.env.local`)

| Variable | Description | Default |
|:---|:---|:---|
| `NEXT_PUBLIC_API_URL` | Backend API base URL | `http://localhost:8000` |
| `NEXT_PUBLIC_APP_NAME` | Application display name | `EchoSense` |
| `NEXT_PUBLIC_WS_URL` | WebSocket URL for real-time updates | `ws://localhost:8000/ws` |
| `NEXTAUTH_SECRET` | NextAuth.js secret (production) | — |
| `NEXTAUTH_URL` | Canonical app URL | `http://localhost:3000` |

### Backend (`backend/.env`)

| Variable | Description | Default |
|:---|:---|:---|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://echosense:echosense@localhost:5432/echosense` |
| `REDIS_URL` | Redis connection string | `redis://localhost:6379/0` |
| `SECRET_KEY` | JWT signing key | — |
| `ENVIRONMENT` | Runtime environment | `development` |
| `DEBUG` | Enable debug mode | `true` |
| `CORS_ORIGINS` | Allowed CORS origins (comma-separated) | `http://localhost:3000` |
| `CELERY_BROKER_URL` | Celery broker URL | `redis://localhost:6379/1` |
| `CELERY_RESULT_BACKEND` | Celery result backend | `redis://localhost:6379/2` |
| `MAX_UPLOAD_SIZE_MB` | Maximum signal file upload size | `100` |
| `MODEL_ARTIFACTS_PATH` | Path to trained model files | `./models` |

> [!CAUTION]
> Never commit `.env.local` or `backend/.env` files to version control. Use `.env.example` templates and set secrets via your CI/CD platform's secret store.

---

## 📖 API Documentation

Once the backend is running, interactive API documentation is available at:

| Docs | URL |
|:---|:---|
| **Swagger UI** | [`http://localhost:8000/docs`](http://localhost:8000/docs) |
| **ReDoc** | [`http://localhost:8000/redoc`](http://localhost:8000/redoc) |

### Key Endpoints

```
POST   /api/v1/signals/upload        Upload an AE signal file
GET    /api/v1/signals/{id}           Retrieve signal metadata
POST   /api/v1/analysis/run           Trigger full TDA pipeline
GET    /api/v1/analysis/{id}/status   Check analysis job status
GET    /api/v1/analysis/{id}/results  Fetch analysis results
POST   /api/v1/monitoring/start       Start real-time monitoring session
WS     /ws/monitoring/{session_id}    WebSocket for live updates
GET    /api/v1/health                 Health check
```

---

## 📜 Available Scripts

### Frontend (pnpm)

| Command | Description |
|:---|:---|
| `pnpm dev` | Start Next.js development server |
| `pnpm build` | Create optimized production build |
| `pnpm start` | Start production server |
| `pnpm lint` | Run ESLint |
| `pnpm lint:fix` | Auto-fix linting issues |
| `pnpm type-check` | Run TypeScript type checking |
| `pnpm test` | Run Jest test suite |
| `pnpm test:watch` | Run tests in watch mode |
| `pnpm test:coverage` | Run tests with coverage report |

### Backend (Python)

| Command | Description |
|:---|:---|
| `uvicorn app.main:app --reload` | Start FastAPI dev server |
| `celery -A app.worker worker` | Start Celery worker |
| `pytest` | Run backend test suite |
| `pytest --cov=app` | Run tests with coverage |
| `alembic upgrade head` | Apply database migrations |
| `alembic revision --autogenerate -m "msg"` | Generate new migration |

---

## 🧪 Testing

### Frontend Tests

```bash
# Run all tests
pnpm test

# Run with coverage
pnpm test:coverage

# Run in watch mode during development
pnpm test:watch
```

### Backend Tests

```bash
cd backend
source .venv/bin/activate

# Run all tests
pytest

# Run with coverage report
pytest --cov=app --cov-report=html

# Run specific test module
pytest tests/test_ml/test_persistent_homology.py

# Run with verbose output
pytest -v
```

### End-to-End Tests

```bash
# Requires all services running
pnpm test:e2e
```

---

## 🚢 Deployment

### Docker Production Build

```bash
# Build production images
docker compose -f docker-compose.prod.yml build

# Start production stack
docker compose -f docker-compose.prod.yml up -d
```

### Frontend on Vercel

```bash
# Install Vercel CLI
pnpm i -g vercel

# Deploy
vercel --prod
```

Set the following environment variables in Vercel:

- `NEXT_PUBLIC_API_URL` → your deployed backend URL

### Cloud Deployment

The application can be deployed to any cloud provider supporting Docker:

| Provider | Frontend | Backend | Database |
|:---|:---|:---|:---|
| **GCP** | Cloud Run | Cloud Run | Cloud SQL |
| **AWS** | Amplify / ECS | ECS / Lambda | RDS |
| **Azure** | Static Web Apps | Container Apps | Azure Database for PostgreSQL |

> [!IMPORTANT]
> For production deployments, ensure all `SECRET_KEY`, `NEXTAUTH_SECRET`, and database credentials are stored in a secrets manager (e.g., GCP Secret Manager, AWS Secrets Manager, Azure Key Vault).

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. **Fork** the repository
2. **Create** a feature branch: `git checkout -b feature/amazing-feature`
3. **Commit** your changes: `git commit -m 'feat: add amazing feature'`
4. **Push** to the branch: `git push origin feature/amazing-feature`
5. **Open** a Pull Request

### Guidelines

- Follow the existing code style and conventions
- Write tests for new features and bug fixes
- Use [Conventional Commits](https://www.conventionalcommits.org/) for commit messages
- Update documentation for any API or behavior changes
- Ensure all CI checks pass before requesting review

---

## 📚 Research References

This project builds on the following research:

1. **D'Angela, A. & Magliulo, G.** (2026). *Prestressed RC Bridge-Girder Acoustic Emission Dataset*. — Primary dataset for bridge girder structural health monitoring evaluation.

2. **Siracusano, G. et al.** (2021). *Concrete AE Event Dataset*. — Benchmark dataset for concrete structural integrity assessment.

3. **Takens, F.** (1981). *Detecting strange attractors in turbulence*. Lecture Notes in Mathematics, 898, 366–381. — Foundational theorem for delay-coordinate state-space reconstruction.

4. **Edelsbrunner, H. & Harer, J.** (2010). *Computational Topology: An Introduction*. American Mathematical Society. — Theoretical foundation for persistent homology computations.

5. **Adams, H. et al.** (2017). *Persistence images: a stable vector representation of persistent homology*. JMLR, 18(8), 1–35. — Persistence image vectorization method.

6. **Bubenik, P.** (2015). *Statistical topological data analysis using persistence landscapes*. JMLR, 16, 77–102. — Persistence landscape feature representation.

7. **Adams, R. P. & MacKay, D. J. C.** (2007). *Bayesian Online Changepoint Detection*. arXiv:0710.3742. — BOCD algorithm for real-time structural state transitions.

---

## 📄 License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.

---

## 👥 Authors

<table>
  <tr>
    <td align="center">
      <strong>Gagandeep Rai</strong><br/>
      RV University — Dept. of Information Science & Engineering<br/>
      <a href="mailto:gagandeep.rai@rvu.edu.in">gagandeep.rai@rvu.edu.in</a>
    </td>
    <td align="center">
      <strong>Karthik K P</strong><br/>
      RV University — Dept. of Information Science & Engineering<br/>
      <a href="mailto:karthik.kp@rvu.edu.in">karthik.kp@rvu.edu.in</a>
    </td>
  </tr>
</table>

---

## 🙏 Acknowledgments

- **RV University**, Department of Information Science & Engineering, for academic support and resources
- **GUDHI** library developers for robust topological computation tools
- **shadcn/ui** for the beautiful, accessible component system
- **FastAPI** community for the high-performance Python web framework
- The authors of the prestressed RC bridge-girder and concrete AE datasets for making their data publicly available for research
- All open-source contributors whose libraries make this project possible

---

<div align="center">

**Built with 🧬 topology and ❤️ at RV University**

[⬆ Back to Top](#-echosense)

</div>
