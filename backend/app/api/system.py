import os
import sys
import time
import logging
from datetime import datetime, timezone
from typing import Dict, Any, List, Optional
from collections import deque
from pydantic import BaseModel
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import text
from app.core.config import settings
from app.core.database import get_db

logger = logging.getLogger("echosense.system")
router = APIRouter(prefix="/system", tags=["System & Diagnostics"])

# Ring buffer for recent client logs (last 200 entries)
MAX_LOGS = 200
client_logs_buffer: deque = deque(maxlen=MAX_LOGS)

class ClientLogEntry(BaseModel):
    source: str = "mobile"  # "mobile" | "web" | "cli"
    level: str = "ERROR"    # "ERROR" | "WARN" | "INFO"
    context: str            # Component or function where the event occurred
    message: str            # Primary error message
    stack: Optional[str] = None
    details: Optional[Dict[str, Any]] = None
    timestamp: Optional[str] = None

@router.post("/client-logs", status_code=status.HTTP_201_CREATED)
async def receive_client_log(entry: ClientLogEntry):
    """
    Receives and persists error telemetry & diagnostic logs from the mobile app or web client.
    Prints directly to backend terminal so developer/user can inspect or copy-paste errors immediately.
    """
    ts = entry.timestamp or datetime.now(timezone.utc).isoformat()
    log_record = {
        "id": f"log-{int(time.time()*1000)}-{len(client_logs_buffer)}",
        "timestamp": ts,
        "source": entry.source,
        "level": entry.level.upper(),
        "context": entry.context,
        "message": entry.message,
        "stack": entry.stack,
        "details": entry.details or {},
    }
    
    # Store in memory buffer
    client_logs_buffer.appendleft(log_record)
    
    # Print prominently to backend terminal
    color_prefix = "\033[91m" if entry.level.upper() == "ERROR" else "\033[93m"
    color_reset = "\033[0m"
    print(f"\n{color_prefix}[CLIENT TELEMETRY ERROR - {entry.source.upper()}] [{entry.context}]{color_reset} {entry.message}")
    if entry.details:
        print(f"  Details: {entry.details}")
    if entry.stack:
        print(f"  Stack: {entry.stack[:300]}...")
    sys.stdout.flush()
    
    # Also write to local log file for persistence
    log_dir = os.path.join("storage", "logs")
    os.makedirs(log_dir, exist_ok=True)
    log_file = os.path.join(log_dir, "client_errors.log")
    try:
        with open(log_file, "a", encoding="utf-8") as f:
            f.write(f"[{ts}] [{entry.level.upper()}] [{entry.source}] [{entry.context}] {entry.message} | Details: {entry.details}\n")
            if entry.stack:
                f.write(f"  Stack: {entry.stack}\n")
    except Exception as e:
        logger.error(f"Failed to append to client log file: {e}")
        
    return {"status": "LOGGED", "log_id": log_record["id"], "buffered_count": len(client_logs_buffer)}

@router.get("/client-logs")
async def get_client_logs(limit: int = 50, level: Optional[str] = None):
    """
    Retrieves the most recent client diagnostic error logs.
    """
    logs = list(client_logs_buffer)
    if level:
        logs = [l for l in logs if l["level"] == level.upper()]
    return logs[:limit]

@router.delete("/client-logs")
async def clear_client_logs():
    """
    Clears the in-memory client diagnostic logs buffer.
    """
    client_logs_buffer.clear()
    return {"status": "CLEARED", "buffered_count": 0}

@router.get("/diagnostics")
async def get_system_diagnostics(db: AsyncSession = Depends(get_db)):
    """
    Comprehensive health inspection across all hardware, ML pipelines, database, and storage.
    """
    # 1. Database check
    db_ok = False
    try:
        res = await db.execute(text("SELECT 1"))
        db_ok = res.scalar() == 1
    except Exception as e:
        logger.error(f"Database health check failed: {e}")

    # 2. Storage check
    upload_dir_ok = os.path.exists(settings.UPLOAD_DIR) and os.access(settings.UPLOAD_DIR, os.W_OK)
    
    # 3. PyTorch & GPU status
    cuda_available = False
    device_name = "CPU"
    try:
        import torch
        cuda_available = torch.cuda.is_available()
        if cuda_available:
            device_name = torch.cuda.get_device_name(0)
    except ImportError:
        pass

    # 4. Model artifacts presence
    models_ready = {
        "conv1d_autoencoder": os.path.exists(os.path.join(settings.MODEL_DIR, "conv1d_autoencoder_v1.pt")),
        "cnn_classifier": os.path.exists(os.path.join(settings.MODEL_DIR, "cnn_baseline_v1.pt")),
        "random_forest": os.path.exists(os.path.join(settings.MODEL_DIR, "rf_condition_classifier.joblib")),
    }

    return {
        "status": "HEALTHY" if db_ok and upload_dir_ok else "DEGRADED",
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "database": {
            "status": "CONNECTED" if db_ok else "ERROR",
            "type": settings.DATABASE_URL.split("://")[0]
        },
        "storage": {
            "upload_dir": settings.UPLOAD_DIR,
            "writable": upload_dir_ok,
            "free_space_mb": round(os.statvfs(".").f_bavail * os.statvfs(".").f_frsize / (1024 * 1024), 1) if hasattr(os, "statvfs") else 50000.0
        },
        "ml_compute": {
            "cuda_available": cuda_available,
            "device": device_name,
            "models": models_ready
        },
        "client_telemetry": {
            "logged_errors_count": len(client_logs_buffer),
            "latest_error": client_logs_buffer[0] if len(client_logs_buffer) > 0 else None
        }
    }
