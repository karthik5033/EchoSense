from typing import Optional, List, Dict, Any
from datetime import datetime
from pydantic import BaseModel

class SignalBase(BaseModel):
    filename: str
    sample_rate: int = 10000000
    duration_sec: float = 0.0
    num_samples: int = 0
    channels: int = 1
    peak_amplitude_v: float = 0.0
    rms_energy: float = 0.0
    status: str = "READY"

class SignalCreate(SignalBase):
    file_path: str
    project_id: Optional[str] = None
    metadata_json: Optional[str] = "{}"

class SignalResponse(SignalBase):
    id: str
    project_id: Optional[str] = None
    file_path: str
    created_at: datetime

    class Config:
        from_attributes = True

class EventSliceResponse(BaseModel):
    id: str
    signal_id: str
    event_label: str
    start_sample: int
    end_sample: int
    peak_amp_mv: float
    sta_lta_ratio: float
    crack_mode: str
    is_critical: str

    class Config:
        from_attributes = True
