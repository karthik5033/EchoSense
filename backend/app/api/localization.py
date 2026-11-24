import numpy as np
from typing import Dict, List, Optional, Any
from fastapi import APIRouter, Depends, Query, Body, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc

from app.core.database import get_db
from app.models.analysis import AnalysisRun
from app.models.signal import Signal
from app.ml.localization import (
    DEFAULT_TRANSDUCERS,
    solve_tdoa_hyperbolic,
    generate_multichannel_telemetry
)

router = APIRouter(prefix="/localization", tags=["Acoustic Waveform Localization & TDOA"])

PRESET_HOTSPOTS = [
    {
        "id": "LOC-MIDSPAN-A",
        "name": "Midspan Flexural Micro-Crack (Zone A)",
        "x": 4.20,
        "z": 0.35,
        "mode": "Mode I Tensile",
        "energy_scale": 1.25
    },
    {
        "id": "LOC-SHEARKEY-B",
        "name": "Shear Key Web Precursor (Zone B)",
        "x": 1.85,
        "z": 0.65,
        "mode": "Mode II Shear Slip",
        "energy_scale": 1.05
    },
    {
        "id": "LOC-ANCHORAGE-C",
        "name": "Tendon Anchorage Debonding (Zone C)",
        "x": 7.40,
        "z": 1.10,
        "mode": "Mixed-Mode Delamination",
        "energy_scale": 1.40
    },
    {
        "id": "LOC-BEARING-D",
        "name": "Pier Bearing Seated Interface (Zone D)",
        "x": 8.90,
        "z": 0.15,
        "mode": "Frictional Fretting",
        "energy_scale": 0.70
    }
]

@router.get("/hotspots")
async def list_localization_hotspots(db: AsyncSession = Depends(get_db)):
    """
    Returns available crack hotspots linked to live analysis runs from the database.
    """
    runs_res = await db.execute(select(AnalysisRun).order_by(desc(AnalysisRun.created_at)).limit(6))
    runs = runs_res.scalars().all()
    
    hotspots = []
    for idx, preset in enumerate(PRESET_HOTSPOTS):
        linked_run = runs[idx] if idx < len(runs) else None
        hotspots.append({
            "id": preset["id"],
            "name": preset["name"],
            "x": preset["x"],
            "z": preset["z"],
            "mode": linked_run.crack_mode if linked_run else preset["mode"],
            "confidence": float(linked_run.confidence) if linked_run else 0.94,
            "cdpi_score": float(linked_run.cdpi_score) if linked_run else 0.22,
            "analysis_id": linked_run.id if linked_run else None
        })
    return hotspots

@router.get("/telemetry")
async def get_multichannel_telemetry(
    x: float = Query(4.20, ge=0.0, le=10.0),
    z: float = Query(0.35, ge=0.0, le=1.40),
    mode: str = Query("Mode I Tensile"),
    wave_velocity: float = Query(3850.0, ge=2000.0, le=5500.0),
    jitter_ns: float = Query(80.0, ge=0.0, le=500.0)
):
    """
    Computes exact physical acoustic propagation, TDOA time-delays, and discrete
    waveform envelopes for the 4-channel piezoelectric and MEMS transducer array.
    """
    telemetry = generate_multichannel_telemetry(
        source_x=x,
        source_z=z,
        crack_mode=mode,
        wave_velocity_mps=wave_velocity,
        noise_jitter_ns=jitter_ns
    )
    return telemetry

@router.post("/solve")
async def solve_tdoa(
    arrival_times: Dict[str, float] = Body(..., example={"CH-01": 0.0, "CH-02": 0.000349, "CH-03": 0.000373, "CH-04": 0.001210}),
    wave_velocity: float = Body(3850.0)
):
    """
    Solves for the acoustic emission coordinates (x, z) given measured arrival times across sensors.
    """
    solution = solve_tdoa_hyperbolic(
        arrival_times_sec=arrival_times,
        wave_velocity_mps=wave_velocity
    )
    return solution
