from typing import Optional, List, Dict, Any
from datetime import datetime
from pydantic import BaseModel

class AnalysisRunResponse(BaseModel):
    id: str
    signal_id: str
    status: str
    cdpi_score: float
    crack_mode: str
    confidence: float
    lead_time_ms: float
    bocd_alarm: str
    execution_time_ms: float
    created_at: datetime

    class Config:
        from_attributes = True

class TDAResultResponse(BaseModel):
    id: str
    analysis_id: str
    embedding_dimension: int
    delay_lag: int
    mutual_info_min: float
    fnn_ratio: float
    entropy_h0: float
    entropy_h1: float
    betti_0_peak: int
    betti_1_peak: int
    persistence_pairs_json: str

    class Config:
        from_attributes = True
