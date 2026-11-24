import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Integer, Float, DateTime, ForeignKey, Text
from app.core.database import Base

class Signal(Base):
    __tablename__ = "signals"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    project_id = Column(String(36), ForeignKey("projects.id"), nullable=True, index=True)
    filename = Column(String(255), nullable=False)
    file_path = Column(String(512), nullable=False)
    sample_rate = Column(Integer, default=10000000) # e.g. 10 MS/s or 48 kHz
    duration_sec = Column(Float, default=0.0)
    num_samples = Column(Integer, default=0)
    channels = Column(Integer, default=1)
    peak_amplitude_v = Column(Float, default=0.0)
    rms_energy = Column(Float, default=0.0)
    status = Column(String(50), default="READY") # READY, PROCESSING, ANALYZED, ERROR
    metadata_json = Column(Text, default="{}")
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)

class EventSlice(Base):
    __tablename__ = "event_slices"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    signal_id = Column(String(36), ForeignKey("signals.id"), nullable=False, index=True)
    event_label = Column(String(64), default="EVT-UNKNOWN")
    start_sample = Column(Integer, nullable=False)
    end_sample = Column(Integer, nullable=False)
    peak_amp_mv = Column(Float, default=0.0)
    sta_lta_ratio = Column(Float, default=0.0)
    crack_mode = Column(String(50), default="Tensile Onset") # Tensile, Shear, Mixed
    is_critical = Column(String(10), default="false")
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)
