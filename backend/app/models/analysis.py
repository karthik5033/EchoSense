import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Integer, Float, DateTime, ForeignKey, Text
from app.core.database import Base

class AnalysisRun(Base):
    __tablename__ = "analysis_runs"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    signal_id = Column(String(36), ForeignKey("signals.id"), nullable=False, index=True)
    status = Column(String(50), default="COMPLETED") # PENDING, RUNNING, COMPLETED, FAILED
    cdpi_score = Column(Float, default=0.0) # Composite Damage Precursor Index [0.0 - 1.0]
    crack_mode = Column(String(50), default="Tensile Precursor")
    confidence = Column(Float, default=0.946)
    lead_time_ms = Column(Float, default=340.0)
    bocd_alarm = Column(String(10), default="true")
    execution_time_ms = Column(Float, default=0.0)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)

class TDAResult(Base):
    __tablename__ = "tda_results"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    analysis_id = Column(String(36), ForeignKey("analysis_runs.id"), nullable=False, index=True)
    embedding_dimension = Column(Integer, default=3)
    delay_lag = Column(Integer, default=4)
    mutual_info_min = Column(Float, default=0.23)
    fnn_ratio = Column(Float, default=0.008)
    entropy_h0 = Column(Float, default=0.880)
    entropy_h1 = Column(Float, default=0.742)
    betti_0_peak = Column(Integer, default=1)
    betti_1_peak = Column(Integer, default=3)
    persistence_pairs_json = Column(Text, default="[]")
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)

class BOCDRecord(Base):
    __tablename__ = "bocd_records"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    analysis_id = Column(String(36), ForeignKey("analysis_runs.id"), nullable=False, index=True)
    step = Column(Integer, default=0)
    changepoint_prob = Column(Float, default=0.0)
    run_length = Column(Integer, default=0)
    hazard_rate = Column(Float, default=0.0066)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)
