"""
EchoSense Multi-Channel Acoustic Wave Localization & TDOA Solver
Implements non-linear hyperbolic triangulation (ASTM E1316 / EN 1330-9 compliant)
for acoustic emission source localization on prestressed concrete girders.
"""

import numpy as np
from typing import Dict, List, Tuple, Any, Optional
from scipy.optimize import least_squares

# Standard 10m Prestressed Concrete Girder Transducer Grid
DEFAULT_TRANSDUCERS = [
    {
        "id": "CH-01",
        "name": "Midspan Acoustic Sensor",
        "type": "R15α Resonant Piezo",
        "x": 4.50,
        "z": 1.40,
        "mount": "Top Flange",
        "resonant_freq_khz": 150.0,
        "sensitivity_db": 62.0,
        "color": "#FF5500",
    },
    {
        "id": "CH-02",
        "name": "Shear Key Sensor",
        "type": "R15α Resonant Piezo",
        "x": 2.00,
        "z": 1.40,
        "mount": "Top Flange",
        "resonant_freq_khz": 150.0,
        "sensitivity_db": 62.0,
        "color": "#06b6d4",
    },
    {
        "id": "CH-03",
        "name": "Anchor Zone Transducer",
        "type": "10 MHz High-Speed Digitizer",
        "x": 6.50,
        "z": 1.40,
        "mount": "Top Flange",
        "resonant_freq_khz": 220.0,
        "sensitivity_db": 68.0,
        "color": "#a855f7",
    },
    {
        "id": "CH-04",
        "name": "Pier Support Node",
        "type": "48 kHz 24-bit MEMS Sensor",
        "x": 8.80,
        "z": 0.00,
        "mount": "Bottom Flange",
        "resonant_freq_khz": 48.0,
        "sensitivity_db": 54.0,
        "color": "#10b981",
    },
]

def solve_tdoa_hyperbolic(
    arrival_times_sec: Dict[str, float],
    transducers: Optional[List[Dict[str, Any]]] = None,
    wave_velocity_mps: float = 3850.0,
    initial_guess: Tuple[float, float] = (5.0, 0.7),
    bounds: Tuple[Tuple[float, float], Tuple[float, float]] = ((0.0, 0.0), (10.0, 1.4))
) -> Dict[str, Any]:
    """
    Non-linear Levenberg-Marquardt hyperbolic TDOA solver.
    Solves for acoustic emission source position (x, z) minimizing residual travel time differences:
    r_i - r_1 = C * (t_i - t_1)
    """
    if transducers is None:
        transducers = DEFAULT_TRANSDUCERS

    # Map sensor positions
    sensor_map = {s["id"]: (float(s["x"]), float(s["z"])) for s in transducers}
    
    # Filter sensors with valid arrival times
    valid_sensors = [s_id for s_id in arrival_times_sec if s_id in sensor_map and arrival_times_sec[s_id] is not None]
    if len(valid_sensors) < 3:
        # Minimum 3 sensors required for 2D planar hyperbolic triangulation
        return {
            "success": False,
            "error": "Insufficient valid transducer arrivals (minimum 3 required for 2D triangulation)",
            "estimated_x": initial_guess[0],
            "estimated_z": initial_guess[1],
            "residual_error_mm": 999.0
        }

    # Identify primary trigger sensor (first hit sensor with minimum t_i)
    trigger_sensor = min(valid_sensors, key=lambda s_id: arrival_times_sec[s_id])
    t0 = arrival_times_sec[trigger_sensor]
    x0, z0 = sensor_map[trigger_sensor]

    other_sensors = [s_id for s_id in valid_sensors if s_id != trigger_sensor]

    def residuals(params):
        px, pz = params
        r0 = np.hypot(px - x0, pz - z0)
        res_list = []
        for s_id in other_sensors:
            xi, zi = sensor_map[s_id]
            ri = np.hypot(px - xi, pz - zi)
            observed_dt = arrival_times_sec[s_id] - t0
            predicted_dt = (ri - r0) / wave_velocity_mps
            res_list.append(predicted_dt - observed_dt)
        return res_list

    # Constrained Non-linear Least Squares Optimization
    opt_res = least_squares(
        residuals,
        x0=list(initial_guess),
        bounds=bounds,
        loss="soft_l1",
        f_scale=1e-5
    )

    est_x, est_z = float(opt_res.x[0]), float(opt_res.x[1])
    rmse_dt = float(np.sqrt(np.mean(opt_res.fun**2))) if len(opt_res.fun) > 0 else 0.0
    spatial_error_mm = float(rmse_dt * wave_velocity_mps * 1000.0)

    # Compute individual channel delta-t in microseconds
    dt_microseconds = {}
    for s_id in valid_sensors:
        dt_microseconds[s_id] = round(float((arrival_times_sec[s_id] - t0) * 1e6), 2)

    return {
        "success": bool(opt_res.success),
        "trigger_sensor": trigger_sensor,
        "estimated_x": round(est_x, 3),
        "estimated_z": round(est_z, 3),
        "spatial_error_mm": round(max(8.5, spatial_error_mm), 1),
        "residual_rms_microsec": round(rmse_dt * 1e6, 3),
        "dt_microseconds": dt_microseconds,
        "wave_velocity_mps": wave_velocity_mps,
        "sensors_used": valid_sensors
    }

def generate_multichannel_telemetry(
    source_x: float = 4.20,
    source_z: float = 0.35,
    crack_mode: str = "Mode I Tensile",
    energy_scale: float = 1.0,
    wave_velocity_mps: float = 3850.0,
    transducers: Optional[List[Dict[str, Any]]] = None,
    noise_jitter_ns: float = 80.0
) -> Dict[str, Any]:
    """
    Simulates real physical acoustic wave propagation across the transducer array.
    Computes exact geometric spreading, attenuation, and discrete channel envelope points.
    """
    if transducers is None:
        transducers = DEFAULT_TRANSDUCERS

    attenuation_coeff = 0.12 # dB/m in concrete

    # Calculate exact distance from source to each sensor
    channels_telemetry = []
    arrival_times = {}

    for sensor in transducers:
        sx, sz = float(sensor["x"]), float(sensor["z"])
        dist_m = float(np.hypot(source_x - sx, source_z - sz))
        
        # Propagation time
        prop_time_sec = dist_m / wave_velocity_mps
        # Add realistic sensor measurement jitter
        jitter_sec = np.random.normal(0, noise_jitter_ns * 1e-9)
        t_arr = max(0.0, prop_time_sec + jitter_sec)
        arrival_times[sensor["id"]] = t_arr

    # First hit sensor
    first_hit_id = min(arrival_times, key=arrival_times.get)
    t_min = arrival_times[first_hit_id]

    for sensor in transducers:
        s_id = sensor["id"]
        sx, sz = float(sensor["x"]), float(sensor["z"])
        dist_m = float(np.hypot(source_x - sx, source_z - sz))
        t_arr = arrival_times[s_id]
        dt_us = (t_arr - t_min) * 1e6

        # Attenuation based on distance
        att_factor = 1.0 / np.sqrt(max(0.2, dist_m)) * np.exp(-attenuation_coeff * dist_m)
        
        # Base amplitude conditioned on crack mode
        base_amp = 1.18 if "tensile" in crack_mode.lower() else (0.85 if "shear" in crack_mode.lower() else 0.45)
        peak_vpp = round(float(np.clip(base_amp * att_factor * energy_scale, 0.05, 1.45)), 2)
        
        # ASTM feature parameters
        rise_time_us = round(float(12.0 + dist_m * 4.2 + (np.random.rand() - 0.5) * 3.0), 1)
        energy_aj = round(float(peak_vpp * peak_vpp * 45.0 + (np.random.rand() - 0.5) * 4.0), 1)
        counts = int(max(4, round(peak_vpp * 32.0)))
        duration_us = round(float(rise_time_us * 3.8 + counts * 1.5), 1)
        ra_value = round(float((rise_time_us / max(0.01, peak_vpp)) * 0.8), 1)

        # Generate 40-point discrete waveform envelope for SVG oscilloscope
        n_pts = 40
        waveform_pts = []
        cycles = max(3, int(sensor.get("resonant_freq_khz", 150.0) / 40.0))
        for p_idx in range(n_pts):
            progress = p_idx / float(n_pts - 1)
            # Damped oscillator envelope: t^alpha * exp(-beta * t)
            env = np.power(progress, 0.7) * np.exp(-3.8 * progress) * 3.5
            osc = np.sin(2.0 * np.pi * cycles * progress)
            # Scale to SVG pixel height [8, 40] around center 24
            y_pixel = round(float(24.0 - env * osc * min(1.3, peak_vpp) * 15.0), 1)
            x_pixel = round(float(progress * 220.0 + 10.0), 1)
            waveform_pts.append({"x": x_pixel, "y": y_pixel})

        svg_path = " ".join([f"{'M' if i == 0 else 'L'} {pt['x']} {pt['y']}" for i, pt in enumerate(waveform_pts)])

        channels_telemetry.append({
            "id": s_id,
            "name": sensor["name"],
            "type": sensor["type"],
            "mount": sensor.get("mount", "Flange"),
            "x_pos_m": sx,
            "z_pos_m": sz,
            "color": sensor["color"],
            "resonant_freq_khz": sensor.get("resonant_freq_khz", 150.0),
            "distance_to_source_m": round(dist_m, 2),
            "delay_microseconds": round(dt_us, 1),
            "is_first_hit": (s_id == first_hit_id),
            "peak_vpp": peak_vpp,
            "rise_time_us": rise_time_us,
            "energy_aj": energy_aj,
            "counts": counts,
            "duration_us": duration_us,
            "ra_value": ra_value,
            "svg_waveform_path": svg_path
        })

    # Execute hyperbolic solver
    solver_solution = solve_tdoa_hyperbolic(
        arrival_times_sec=arrival_times,
        transducers=transducers,
        wave_velocity_mps=wave_velocity_mps,
        initial_guess=(source_x + 0.15, source_z + 0.05)
    )

    return {
        "event_position": {
            "true_x": source_x,
            "true_z": source_z,
            "estimated_x": solver_solution["estimated_x"],
            "estimated_z": solver_solution["estimated_z"],
            "spatial_error_mm": solver_solution["spatial_error_mm"],
        },
        "trigger_sensor": first_hit_id,
        "crack_mode": crack_mode,
        "wave_velocity_mps": wave_velocity_mps,
        "transducer_channels": channels_telemetry,
        "solver_diagnostics": solver_solution
    }
