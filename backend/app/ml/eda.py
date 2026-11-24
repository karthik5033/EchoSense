import numpy as np
from scipy import signal as sp_signal
from typing import Dict, Any, List

def compute_stft_spectrogram(
    data: np.ndarray,
    sample_rate: int,
    nperseg: int = 256,
    noverlap: int = 128
) -> Dict[str, Any]:
    """
    Computes Short-Time Fourier Transform (STFT) spectrogram of acoustic time-series.
    Returns frequency bins (kHz), time bins (seconds), and normalized power spectral density (dB).
    """
    if len(data) < nperseg:
        # Pad data if too short
        data = np.pad(data, (0, nperseg - len(data)), mode='constant')
        
    freqs, times, Sxx = sp_signal.spectrogram(
        data,
        fs=sample_rate,
        window='hann',
        nperseg=nperseg,
        noverlap=noverlap,
        scaling='density'
    )
    
    # Convert power spectral density to decibels (dB), clamp minimum to -80 dB
    psd_db = 10 * np.log10(np.maximum(Sxx, 1e-12))
    psd_db = np.clip(psd_db, -80.0, 0.0)
    
    # Downsample matrix size if needed for lightweight JSON transfer (e.g., max 64x64 grid)
    f_sub = max(1, len(freqs) // 32)
    t_sub = max(1, len(times) // 32)
    
    sub_freqs = (freqs[::f_sub] / 1000.0).round(1).tolist() # in kHz
    sub_times = times[::t_sub].round(4).tolist()
    sub_matrix = psd_db[::f_sub, ::t_sub].round(1).tolist()
    
    return {
        "frequencies_khz": sub_freqs,
        "times_sec": sub_times,
        "density_matrix_db": sub_matrix
    }

def calculate_astm_ae_features(
    data: np.ndarray,
    sample_rate: int,
    threshold_v: float = 0.05
) -> Dict[str, float]:
    """
    Extracts ASTM E1316 and JCMS-IIIB57 standard non-destructive acoustic emission parameters:
    - Peak Amplitude (V)
    - Rise Time (us)
    - Duration (us)
    - Energy (MARSE)
    - Counts (zero/threshold crossings)
    - Average Frequency (AF = Counts / Duration)
    - RA Value (Rise Time / Peak Amplitude in us/V)
    - Crest Factor and Kurtosis
    """
    if len(data) == 0:
        return {
            "peak_amp_v": 0.0,
            "rise_time_us": 0.0,
            "duration_us": 0.0,
            "energy_marse": 0.0,
            "counts": 0,
            "average_freq_khz": 0.0,
            "ra_value_us_per_v": 0.0,
            "crest_factor": 0.0,
            "kurtosis": 0.0
        }
        
    abs_data = np.abs(data)
    peak_idx = int(np.argmax(abs_data))
    peak_amp = float(abs_data[peak_idx])
    
    # Threshold crossings
    above_th = np.where(abs_data >= threshold_v)[0]
    if len(above_th) > 0:
        first_crossing = above_th[0]
        last_crossing = above_th[-1]
    else:
        first_crossing = 0
        last_crossing = len(data) - 1
        
    rise_samples = max(0, peak_idx - first_crossing)
    duration_samples = max(1, last_crossing - first_crossing)
    
    rise_time_us = (rise_samples / sample_rate) * 1e6
    duration_us = (duration_samples / sample_rate) * 1e6
    
    # Number of threshold crossings
    crossings = np.sum(np.diff(data > threshold_v).astype(int) == 1)
    
    # Energy: Measured Area under Rectified Signal Envelope (MARSE)
    energy_marse = float(np.sum(abs_data) / sample_rate * 1e6)
    
    # Average frequency AF (kHz) = (counts / duration_us) * 1000
    af_khz = (crossings / duration_us * 1000.0) if duration_us > 0 else 0.0
    
    # RA value = Rise Time (us) / Peak Amplitude (V)
    ra_val = (rise_time_us / peak_amp) if peak_amp > 0 else 0.0
    
    # Statistical higher moments
    rms = np.sqrt(np.mean(data**2))
    crest_factor = (peak_amp / rms) if rms > 0 else 0.0
    
    mean = np.mean(data)
    std = np.std(data)
    kurtosis = float(np.mean(((data - mean) / std)**4)) if std > 0 else 3.0
    
    return {
        "peak_amp_v": float(round(peak_amp, 3)),
        "rise_time_us": float(round(rise_time_us, 1)),
        "duration_us": float(round(duration_us, 1)),
        "energy_marse": float(round(energy_marse, 2)),
        "counts": int(crossings),
        "average_freq_khz": float(round(af_khz, 2)),
        "ra_value_us_per_v": float(round(ra_val, 2)),
        "crest_factor": float(round(crest_factor, 2)),
        "kurtosis": float(round(kurtosis, 2))
    }
