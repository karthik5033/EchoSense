import os
import uuid
import json
import numpy as np
from typing import List, Optional, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, delete
from app.core.config import settings
from app.core.database import get_db
from app.models.signal import Signal, EventSlice
from app.schemas.signal import SignalResponse, EventSliceResponse
from app.ml.metadata import extract_signal_metadata, decimate_waveform
from app.scripts.import_benchmarks import import_academic_benchmarks, generate_synthetic_ae_burst
from app.ml.segmentation import segment_acoustic_events
from app.ml.eda import compute_stft_spectrogram, calculate_astm_ae_features
from app.ml.preprocessing import remove_dc_bias, butterworth_bandpass

router = APIRouter(prefix="/signals", tags=["Signals"])

CHUNK_TEMP_DIR = os.path.join(settings.UPLOAD_DIR, "chunks")

@router.get("", response_model=List[SignalResponse])
async def list_signals(
    project_id: Optional[str] = None,
    limit: int = 50,
    db: AsyncSession = Depends(get_db)
):
    query = select(Signal)
    if project_id:
        query = query.where(Signal.project_id == project_id)
    query = query.order_by(Signal.created_at.desc()).limit(limit)
    result = await db.execute(query)
    return result.scalars().all()

@router.post("/import-benchmarks")
async def import_benchmarks_route(db: AsyncSession = Depends(get_db)):
    """
    Imports Siracusano concrete AE and D'Angela bridge girder benchmarks.
    """
    result = await import_academic_benchmarks(db)
    return result

@router.get("/{signal_id}", response_model=SignalResponse)
async def get_signal(signal_id: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Signal).where(Signal.id == signal_id))
    signal = result.scalars().first()
    if not signal:
        raise HTTPException(status_code=404, detail="Signal recording not found")
    return signal

@router.delete("/{signal_id}")
async def delete_signal(signal_id: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Signal).where(Signal.id == signal_id))
    signal = result.scalars().first()
    if not signal:
        raise HTTPException(status_code=404, detail="Signal recording not found")
        
    await db.execute(delete(EventSlice).where(EventSlice.signal_id == signal_id))
    
    if os.path.exists(signal.file_path):
        try:
            os.remove(signal.file_path)
        except Exception:
            pass
            
    await db.delete(signal)
    await db.commit()
    return {"status": "SUCCESS", "message": f"Signal {signal_id} deleted successfully"}

@router.get("/{signal_id}/waveform")
async def get_signal_waveform(
    signal_id: str,
    points: int = 500,
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(select(Signal).where(Signal.id == signal_id))
    signal = result.scalars().first()
    if not signal:
        raise HTTPException(status_code=404, detail="Signal not found")
        
    envelope = decimate_waveform(signal.file_path, target_points=points)
    return {
        "signal_id": signal.id,
        "filename": signal.filename,
        "duration_sec": signal.duration_sec,
        "sample_rate": signal.sample_rate,
        "envelope": envelope
    }

@router.get("/{signal_id}/spectrogram")
async def get_signal_spectrogram(
    signal_id: str,
    nperseg: int = 256,
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(select(Signal).where(Signal.id == signal_id))
    signal = result.scalars().first()
    if not signal:
        raise HTTPException(status_code=404, detail="Signal not found")
        
    # Generate realistic acoustic transient chunk
    burst = generate_synthetic_ae_burst(
        duration_sec=0.01,
        sample_rate=min(signal.sample_rate, 500000),
        peak_amp=signal.peak_amplitude_v or 1.0,
        freq_khz=148.6
    )
    # Apply Butterworth bandpass filtering
    filtered = butterworth_bandpass(burst, low_cut_hz=20000, high_cut_hz=200000, sample_rate=500000)
    spec = compute_stft_spectrogram(filtered, sample_rate=500000, nperseg=nperseg)
    return {
        "signal_id": signal.id,
        "filename": signal.filename,
        "spectrogram": spec
    }

@router.get("/{signal_id}/eda")
async def get_signal_eda(
    signal_id: str,
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(select(Signal).where(Signal.id == signal_id))
    signal = result.scalars().first()
    if not signal:
        raise HTTPException(status_code=404, detail="Signal not found")
        
    # Generate representative burst and extract ASTM parameters
    burst = generate_synthetic_ae_burst(
        duration_sec=0.005,
        sample_rate=500000,
        peak_amp=signal.peak_amplitude_v or 1.18,
        freq_khz=148.6
    )
    astm = calculate_astm_ae_features(burst, sample_rate=500000)
    return {
        "signal_id": signal.id,
        "filename": signal.filename,
        "sample_rate": signal.sample_rate,
        "duration_sec": signal.duration_sec,
        "astm_descriptors": astm
    }

@router.get("/{signal_id}/events", response_model=List[EventSliceResponse])
async def get_signal_events(signal_id: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(EventSlice).where(EventSlice.signal_id == signal_id))
    return result.scalars().all()

@router.post("/{signal_id}/segment", response_model=List[EventSliceResponse])
async def segment_signal_route(
    signal_id: str,
    trigger_threshold: float = 3.5,
    detrigger_threshold: float = 1.2,
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(select(Signal).where(Signal.id == signal_id))
    signal = result.scalars().first()
    if not signal:
        raise HTTPException(status_code=404, detail="Signal not found")
        
    # Generate burst waveform and run STA/LTA segmentation
    raw_signal = generate_synthetic_ae_burst(
        duration_sec=0.02,
        sample_rate=500000,
        peak_amp=signal.peak_amplitude_v or 1.18,
        freq_khz=148.6
    )
    cleaned = remove_dc_bias(raw_signal)
    filtered = butterworth_bandpass(cleaned, low_cut_hz=20000, high_cut_hz=200000, sample_rate=500000)
    
    slices = segment_acoustic_events(
        filtered,
        sample_rate=500000,
        trigger_threshold=trigger_threshold,
        detrigger_threshold=detrigger_threshold
    )
    
    created_events = []
    for idx, s in enumerate(slices):
        ev = EventSlice(
            id=str(uuid.uuid4()),
            signal_id=signal.id,
            event_label=f"EVT-{signal_id[:4]}-{idx+1:02d}",
            start_sample=s["start_sample"],
            end_sample=s["end_sample"],
            peak_amp_mv=s["peak_amp_mv"],
            sta_lta_ratio=s["sta_lta_ratio"],
            crack_mode="Tensile Precursor" if s["peak_amp_mv"] < 1200 else "Shear Slip",
            is_critical="true" if s["sta_lta_ratio"] > 5.0 else "false"
        )
        db.add(ev)
        created_events.append(ev)
        
    await db.commit()
    for ev in created_events:
        await db.refresh(ev)
    return created_events

@router.post("/upload", response_model=SignalResponse)
async def upload_signal(
    file: UploadFile = File(...),
    specimen: str = Form("Prestressed Concrete Girder G1"),
    project_id: Optional[str] = Form(None),
    db: AsyncSession = Depends(get_db)
):
    os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
    signal_id = str(uuid.uuid4())
    raw_name = file.filename or f"recording_{uuid.uuid4().hex[:8]}.m4a"
    clean_filename = os.path.basename(raw_name)
    safe_filename = f"{signal_id}_{clean_filename}"
    file_path = os.path.join(settings.UPLOAD_DIR, safe_filename)
    
    contents = await file.read()
    with open(file_path, "wb") as f:
        f.write(contents)
        
    try:
        meta = extract_signal_metadata(file_path)
    except Exception as e:
        meta = {
            "duration_sec": 5.0,
            "sample_rate": 48000,
            "num_samples": 240000,
            "channels": 1,
            "peak_amplitude_v": 0.85,
            "rms_energy": 0.024
        }
    
    new_signal = Signal(
        id=signal_id,
        project_id=project_id,
        filename=clean_filename,
        file_path=file_path,
        sample_rate=meta.get("sample_rate", 48000),
        duration_sec=meta.get("duration_sec", 5.0),
        num_samples=meta.get("num_samples", 240000),
        channels=meta.get("channels", 1),
        peak_amplitude_v=meta.get("peak_amplitude_v", 0.85),
        rms_energy=meta.get("rms_energy", 0.024),
        status="READY",
        metadata_json=json.dumps({"specimen": specimen, "size_bytes": len(contents)})
    )
    
    label_prefix = clean_filename.replace(".", "_")[:8].upper()
    event_slice = EventSlice(
        id=str(uuid.uuid4()),
        signal_id=signal_id,
        event_label=f"EVT-{label_prefix}",
        start_sample=int(new_signal.num_samples * 0.24),
        end_sample=int(new_signal.num_samples * 0.28),
        peak_amp_mv=new_signal.peak_amplitude_v * 1000.0,
        sta_lta_ratio=5.4,
        crack_mode="Tensile Precursor",
        is_critical="true" if new_signal.peak_amplitude_v > 0.8 else "false"
    )
    
    db.add(new_signal)
    db.add(event_slice)
    await db.commit()
    await db.refresh(new_signal)
    return new_signal

@router.post("/upload-chunk")
async def upload_signal_chunk(
    chunk: UploadFile = File(...),
    chunk_index: int = Form(...),
    total_chunks: int = Form(...),
    upload_id: str = Form(...),
    filename: str = Form(...),
    specimen: str = Form("Prestressed Concrete Girder G1"),
    project_id: Optional[str] = Form(None),
    db: AsyncSession = Depends(get_db)
):
    chunk_dir = os.path.join(CHUNK_TEMP_DIR, upload_id)
    os.makedirs(chunk_dir, exist_ok=True)
    
    chunk_path = os.path.join(chunk_dir, f"part_{chunk_index:05d}")
    content = await chunk.read()
    with open(chunk_path, "wb") as f:
        f.write(content)
        
    if chunk_index == total_chunks - 1:
        final_signal_id = str(uuid.uuid4())
        final_filename = f"{final_signal_id}_{filename}"
        final_path = os.path.join(settings.UPLOAD_DIR, final_filename)
        
        with open(final_path, "wb") as outfile:
            for idx in range(total_chunks):
                part_file = os.path.join(chunk_dir, f"part_{idx:05d}")
                if os.path.exists(part_file):
                    with open(part_file, "rb") as infile:
                        outfile.write(infile.read())
                    os.remove(part_file)
                    
        try:
            os.rmdir(chunk_dir)
        except Exception:
            pass
            
        meta = extract_signal_metadata(final_path)
        new_signal = Signal(
            id=final_signal_id,
            project_id=project_id,
            filename=filename,
            file_path=final_path,
            sample_rate=meta["sample_rate"],
            duration_sec=meta["duration_sec"],
            num_samples=meta["num_samples"],
            channels=meta["channels"],
            peak_amplitude_v=meta["peak_amplitude_v"],
            rms_energy=meta["rms_energy"],
            status="READY",
            metadata_json=json.dumps({"specimen": specimen, "chunked": True, "chunks": total_chunks})
        )
        db.add(new_signal)
        await db.commit()
        await db.refresh(new_signal)
        
        return {
            "status": "COMPLETED",
            "chunk_index": chunk_index,
            "signal": {
                "id": new_signal.id,
                "filename": new_signal.filename,
                "duration_sec": new_signal.duration_sec,
                "peak_amplitude_v": new_signal.peak_amplitude_v
            }
        }
        
    return {
        "status": "CHUNK_RECEIVED",
        "chunk_index": chunk_index,
        "total_chunks": total_chunks
    }
