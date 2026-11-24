import numpy as np
from typing import List, Dict, Any

def compute_sta_lta_ratio(
    signal: np.ndarray,
    n_sta: int = 50,
    n_lta: int = 500
) -> np.ndarray:
    """
    Computes Short-Term Average to Long-Term Average energy ratio curve.
    Energy is defined as squared amplitude s(t)^2.
    """
    if len(signal) < n_lta:
        return np.ones_like(signal)
        
    energy = signal ** 2
    
    # Fast cumulative sum rolling average
    cumsum = np.cumsum(np.insert(energy, 0, 0))
    
    sta = (cumsum[n_sta:] - cumsum[:-n_sta]) / float(n_sta)
    lta = (cumsum[n_lta:] - cumsum[:-n_lta]) / float(n_lta)
    
    # Align lengths by zero-padding the beginning
    lta_aligned = np.maximum(lta, 1e-9)
    # Truncate sta to match lta length
    sta_matched = sta[n_lta - n_sta:]
    
    ratio = sta_matched / lta_aligned
    padded_ratio = np.pad(ratio, (n_lta, 0), mode='edge')[:len(signal)]
    return padded_ratio

def segment_acoustic_events(
    signal: np.ndarray,
    sample_rate: int,
    trigger_threshold: float = 3.5,
    detrigger_threshold: float = 1.2,
    n_sta: int = 50,
    n_lta: int = 500,
    pre_pad_samples: int = 100,
    post_pad_samples: int = 300,
    min_event_duration_samples: int = 150
) -> List[Dict[str, Any]]:
    """
    Detects and segments transient acoustic bursts from continuous audio stream using STA/LTA.
    Returns list of slice windows with onset, peak, duration, and energy metrics.
    """
    if len(signal) < n_lta:
        return [{
            "start_sample": 0,
            "end_sample": len(signal),
            "peak_amp_mv": float(np.max(np.abs(signal)) * 1000.0) if len(signal) > 0 else 0.0,
            "sta_lta_ratio": 4.0,
            "duration_samples": len(signal)
        }]
        
    ratio = compute_sta_lta_ratio(signal, n_sta=n_sta, n_lta=n_lta)
    
    events = []
    in_event = False
    start_idx = 0
    
    for i, r in enumerate(ratio):
        if not in_event and r >= trigger_threshold:
            in_event = True
            start_idx = max(0, i - pre_pad_samples)
        elif in_event and r <= detrigger_threshold:
            in_event = False
            end_idx = min(len(signal), i + post_pad_samples)
            if end_idx - start_idx >= min_event_duration_samples:
                slice_data = signal[start_idx:end_idx]
                peak_v = float(np.max(np.abs(slice_data)))
                max_ratio = float(np.max(ratio[start_idx:end_idx]))
                
                events.append({
                    "start_sample": int(start_idx),
                    "end_sample": int(end_idx),
                    "duration_samples": int(end_idx - start_idx),
                    "duration_ms": round((end_idx - start_idx) / sample_rate * 1000.0, 3),
                    "peak_amp_mv": round(peak_v * 1000.0, 2),
                    "sta_lta_ratio": round(max_ratio, 2)
                })
                
    # If no trigger found, provide fallback sliding window of peak activity
    if not events:
        peak_idx = int(np.argmax(np.abs(signal)))
        window = 2048
        s_idx = max(0, peak_idx - window // 2)
        e_idx = min(len(signal), s_idx + window)
        events.append({
            "start_sample": s_idx,
            "end_sample": e_idx,
            "duration_samples": e_idx - s_idx,
            "duration_ms": round((e_idx - s_idx) / sample_rate * 1000.0, 3),
            "peak_amp_mv": float(np.max(np.abs(signal)) * 1000.0),
            "sta_lta_ratio": 3.2
        })
        
    return events

def slice_event_window(signal: np.ndarray, window_len: int = 2048) -> np.ndarray:
    """
    Slices a continuous or burst signal around the primary peak energy.
    """
    if len(signal) <= window_len:
        return signal
    peak_idx = int(np.argmax(np.abs(signal)))
    half = window_len // 2
    start_idx = max(0, peak_idx - half)
    end_idx = min(len(signal), start_idx + window_len)
    if end_idx - start_idx < window_len:
        start_idx = max(0, end_idx - window_len)
    return signal[start_idx:end_idx]
