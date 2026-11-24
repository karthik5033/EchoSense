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
        self.latest_mobile_audio: dict = None
        self.last_mobile_timestamp: float = 0.0

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

    async def broadcast_all(self, message: dict):
        for sid in list(self.active_connections.keys()):
            await self.broadcast_json(sid, message)

    async def broadcast_json(self, session_id: str, message: dict):
        if session_id in self.active_connections:
            dead_sockets = set()
            for ws in list(self.active_connections[session_id]):
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
                    
                    # Handle real-time audio streamed from mobile phone
                    if cmd.get("type") == "mobile_audio_stream" or cmd.get("action") == "stream_audio":
                        manager.latest_mobile_audio = cmd
                        manager.last_mobile_timestamp = time.time()
                        
                        live_mic_packet = {
                            "type": "telemetry_frame",
                            "session_id": "mobile-live",
                            "timestamp": datetime.now(timezone.utc).strftime("%H:%M:%S.%f")[:-4],
                            "channel": "PHONE-MIC",
                            "amplitude_v": cmd.get("amplitude_v", 0.05),
                            "peak_frequency_khz": cmd.get("peak_frequency_khz", 48.0),
                            "rms_energy": round(cmd.get("amplitude_v", 0.05) * 0.38, 4),
                            "bocd_changepoint_prob": min(0.99, max(0.01, round(cmd.get("amplitude_v", 0.05) * 0.75, 3))),
                            "bocd_alarm": cmd.get("amplitude_v", 0.05) > 0.85,
                            "cdpi_score": min(0.99, max(0.05, round(cmd.get("amplitude_v", 0.05) * 0.85, 3))),
                            "is_precursor_hit": cmd.get("amplitude_v", 0.05) > 0.65,
                            "hit_id": f"MIC-{random.randint(100, 999)}" if cmd.get("amplitude_v", 0.05) > 0.65 else None,
                            "crack_mode": "Mobile Microphone Audio" if cmd.get("amplitude_v", 0.05) <= 0.65 else "Acoustic Transient Hit",
                            "lead_time_ms": 340.0,
                            "waveform_chunk": cmd.get("waveform_chunk", []),
                            "source": "Smartphone Physical MEMS Microphone",
                            "is_real_mic": True
                        }
                        await manager.broadcast_all(live_mic_packet)
                except Exception:
                    pass
            except asyncio.TimeoutError:
                pass

            if not is_paused:
                step += 1
                is_hit = False

                # If PHONE-MIC is active and mobile is streaming live physical sound waves
                if selected_channel == "PHONE-MIC" and (time.time() - manager.last_mobile_timestamp < 4.0) and manager.latest_mobile_audio:
                    mobile_data = manager.latest_mobile_audio
                    amp = mobile_data.get("amplitude_v", 0.05)
                    freq = mobile_data.get("peak_frequency_khz", 48.0)
                    cp_prob = min(0.99, max(0.01, round(amp * 0.75, 3)))
                    cdpi = min(0.99, max(0.05, round(amp * 0.85, 3)))
                    mode = "Live Mobile MEMS Sound Waves"
                    wave_slice = mobile_data.get("waveform_chunk", [0.0] * 32)
                    is_hit = amp > 0.65
                elif (step % 180 == 0) or (random.random() < 0.005):
                    is_hit = True
                    hit_counter += 1
                    amp = round(random.uniform(0.75, 1.25), 2)
                    freq = round(random.uniform(140.0, 165.0), 1)
                    cp_prob = round(random.uniform(0.70, 0.92), 3)
                    cdpi = round(random.uniform(0.65, 0.88), 3)
                    mode = random.choice(CRACK_MODES)
                    # High-frequency burst slice (decaying exponential sinusoid)
                    t_arr = [i * 0.1 for i in range(32)]
                    wave_slice = [round(float(amp * (2.718 ** (-t * 0.35)) * random.choice([1, -1]) * random.uniform(0.7, 1.0)), 3) for t in t_arr]
                else:
                    amp = round(random.uniform(0.04, 0.10), 2)
                    freq = 148.6
                    cp_prob = round(random.uniform(0.01, 0.04), 3)
                    cdpi = 0.22
                    mode = "Nominal Baseline"
                    wave_slice = [round(float(random.uniform(-0.05, 0.05)), 3) for _ in range(32)]

                telemetry_packet = {
                    "type": "telemetry_frame",
                    "session_id": session_id,
                    "timestamp": datetime.now(timezone.utc).strftime("%H:%M:%S.%f")[:-4],
                    "channel": selected_channel,
                    "amplitude_v": amp,
                    "peak_frequency_khz": freq,
                    "rms_energy": round(amp * 0.038, 4),
                    "bocd_changepoint_prob": cp_prob,
                    "bocd_alarm": is_hit and cp_prob >= 0.80,
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
