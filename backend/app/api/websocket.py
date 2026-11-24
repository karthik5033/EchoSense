import asyncio
import json
import random
import time
from datetime import datetime, timezone
from typing import Dict, Set
from fastapi import APIRouter, WebSocket, WebSocketDisconnect

router = APIRouter(tags=["Real-Time Monitoring WebSocket"])

class ConnectionManager:
    def __init__(self):
        self.active_connections: Dict[str, Set[WebSocket]] = {}

    async def connect(self, session_id: str, websocket: WebSocket):
        await websocket.accept()
        if session_id not in self.active_connections:
            self.active_connections[session_id] = set()
        self.active_connections[session_id].add(websocket)

    def disconnect(self, session_id: str, websocket: WebSocket):
        if session_id in self.active_connections:
            self.active_connections[session_id].discard(websocket)
            if not self.active_connections[session_id]:
                del self.active_connections[session_id]

    async def broadcast_json(self, session_id: str, message: dict):
        if session_id in self.active_connections:
            dead_sockets = set()
            for ws in self.active_connections[session_id]:
                try:
                    await ws.send_json(message)
                except Exception:
                    dead_sockets.add(ws)
            for dead in dead_sockets:
                self.disconnect(session_id, dead)

manager = ConnectionManager()

CRACK_MODES = ["Tensile Micro-Crack", "Shear Interface Slip", "Mixed Fracture"]

@router.websocket("/ws")
@router.websocket("/")
@router.websocket("/ws/monitoring/{session_id}")
async def websocket_monitoring_endpoint(websocket: WebSocket, session_id: str = "default"):
    """
    Real-time acoustic emission telemetry stream (10 Hz).
    Simulates high-speed streaming AE hits, BOCD changepoint probabilities,
    and CDPI structural precursor indices.
    """
    await manager.connect(session_id, websocket)
    is_paused = False
    selected_channel = "CH-01"
    hit_counter = 412

    try:
        # Background streaming task
        step = 0
        while True:
            # Check for client messages non-blockingly
            try:
                msg_text = await asyncio.wait_for(websocket.receive_text(), timeout=0.08)
                try:
                    cmd = json.loads(msg_text)
                    if cmd.get("action") == "pause":
                        is_paused = True
                    elif cmd.get("action") == "resume":
                        is_paused = False
                    elif "channel" in cmd:
                        selected_channel = cmd["channel"]
                except Exception:
                    pass
            except asyncio.TimeoutError:
                pass

            if not is_paused:
                step += 1
                # Periodically generate a precursor acoustic burst event
                is_hit = (step % 25 == 0) or (random.random() < 0.04)
                
                if is_hit:
                    hit_counter += 1
                    amp = round(random.uniform(0.85, 1.48), 2)
                    freq = round(random.uniform(135.0, 185.0), 1)
                    cp_prob = round(random.uniform(0.68, 0.96), 3)
                    cdpi = round(random.uniform(0.72, 0.98), 3)
                    mode = random.choice(CRACK_MODES)
                    # Synthetic high-frequency burst slice
                    t_arr = [i * 0.1 for i in range(32)]
                    wave_slice = [round(float(amp * (2.718 ** (-t * 0.4)) * random.choice([1, -1]) * random.uniform(0.6, 1.0)), 3) for t in t_arr]
                else:
                    amp = round(random.uniform(0.04, 0.12), 2)
                    freq = 148.6
                    cp_prob = round(random.uniform(0.01, 0.05), 3)
                    cdpi = 0.28
                    mode = "Nominal Vibration"
                    wave_slice = [round(float(random.uniform(-0.06, 0.06)), 3) for _ in range(32)]

                telemetry_packet = {
                    "type": "telemetry_frame",
                    "session_id": session_id,
                    "timestamp": datetime.now(timezone.utc).strftime("%H:%M:%S.%f")[:-4],
                    "channel": selected_channel,
                    "amplitude_v": amp,
                    "peak_frequency_khz": freq,
                    "rms_energy": round(amp * 0.038, 4),
                    "bocd_changepoint_prob": cp_prob,
                    "bocd_alarm": cp_prob >= 0.65,
                    "cdpi_score": cdpi,
                    "is_precursor_hit": is_hit,
                    "hit_id": f"HIT-{hit_counter}" if is_hit else None,
                    "crack_mode": mode,
                    "lead_time_ms": 340.0,
                    "waveform_chunk": wave_slice
                }

                await websocket.send_json(telemetry_packet)

            await asyncio.sleep(0.08)

    except WebSocketDisconnect:
        manager.disconnect(session_id, websocket)
    except Exception:
        manager.disconnect(session_id, websocket)
