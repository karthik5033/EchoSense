import numpy as np
from scipy import signal as sp_signal
from typing import Tuple

def remove_dc_bias(data: np.ndarray) -> np.ndarray:
    """
    Removes DC bias and linear drift using mean subtraction.
    """
    if len(data) == 0:
        return data
    return data - np.mean(data)

def butterworth_bandpass(
    data: np.ndarray,
    low_cut_hz: float,
    high_cut_hz: float,
    sample_rate: float,
    order: int = 4
) -> np.ndarray:
    """
    Applies zero-phase forward-backward 4th order Butterworth bandpass filter.
    Guarantees zero phase distortion for subsequent Takens delay embedding.
    """
    if len(data) == 0:
        return data
        
    nyquist = 0.5 * sample_rate
    low = max(0.001, low_cut_hz / nyquist)
    high = min(0.999, high_cut_hz / nyquist)
    
    if low >= high:
        return data
        
    b, a = sp_signal.butter(order, [low, high], btype='bandpass')
    # Use zero-phase digital filtering
    filtered = sp_signal.filtfilt(b, a, data)
    return filtered.astype(np.float32)

def polyphase_resample(
    data: np.ndarray,
    orig_sample_rate: int,
    target_sample_rate: int
) -> np.ndarray:
    """
    Resamples signals using polyphase rational filtering (scipy.signal.resample_poly).
    Standardizes varied smartphone rates (44.1 kHz, 48 kHz, or 10 MHz downsampling).
    """
    if orig_sample_rate == target_sample_rate or len(data) == 0:
        return data
        
    from math import gcd
    g = gcd(int(target_sample_rate), int(orig_sample_rate))
    up = int(target_sample_rate // g)
    down = int(orig_sample_rate // g)
    
    resampled = sp_signal.resample_poly(data, up, down)
    return resampled.astype(np.float32)

def normalize_signal(data: np.ndarray, mode: str = "peak") -> np.ndarray:
    """
    Normalizes acoustic amplitudes either by peak value or z-score.
    """
    if len(data) == 0:
        return data
    if mode == "zscore":
        std = np.std(data)
        if std == 0:
            return data
        return (data - np.mean(data)) / std
    else:
        # Peak normalization to [-1.0, 1.0]
        max_abs = np.max(np.abs(data))
        if max_abs == 0:
            return data
        return data / max_abs
