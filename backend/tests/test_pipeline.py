import pytest
import numpy as np
import time

from app.ml.preprocessing import remove_dc_bias, butterworth_bandpass, normalize_signal
from app.ml.takens import reconstruct_phase_space, takens_embedding, compute_mutual_information, compute_false_nearest_neighbors, farthest_point_subsampling
from app.ml.persistent_homology import compute_persistent_homology
from app.ml.feature_extraction import extract_topological_feature_vector, compute_persistence_landscape
from app.ml.classifier import predict_crack_mode, CRACK_CLASSES
from app.ml.baselines.conventional_ae import extract_18_conventional_ae_features
from app.ml.bocd import BOCDetector, run_bocd_on_stream
from app.ml.autoencoder import compute_reconstruction_anomaly
from app.services.pdf_report import generate_echosense_pdf_report

@pytest.fixture
def synthetic_burst():
    """Generates an acoustic emission transient burst with decaying envelope."""
    sr = 500000
    t = np.linspace(0, 0.005, int(sr * 0.005)) # 2500 samples
    carrier = np.sin(2 * np.pi * 150000 * t)
    envelope = np.exp(-t * 1200)
    noise = 0.04 * np.random.randn(len(t))
    signal = carrier * envelope + noise + 0.15 # added DC bias
    return signal.astype(np.float32), sr

def test_signal_preprocessing(synthetic_burst):
    raw_sig, sr = synthetic_burst
    
    # Test DC removal
    dc_free = remove_dc_bias(raw_sig)
    assert abs(np.mean(dc_free)) < 1e-4
    
    # Test bandpass filtering
    filtered = butterworth_bandpass(dc_free, low_cut_hz=20000.0, high_cut_hz=200000.0, sample_rate=sr)
    assert len(filtered) == len(raw_sig)
    
    # Test normalization
    normalized = normalize_signal(filtered)
    assert np.max(np.abs(normalized)) <= 1.0001
    assert not np.isnan(normalized).any()

def test_takens_embedding_and_fps(synthetic_burst):
    raw_sig, sr = synthetic_burst
    sig = normalize_signal(remove_dc_bias(raw_sig))
    
    # Test Average Mutual Information
    opt_tau, ami = compute_mutual_information(sig, max_delay=12)
    assert 1 <= opt_tau <= 12
    assert len(ami) == 12
    
    # Test False Nearest Neighbors
    opt_d, fnn = compute_false_nearest_neighbors(sig, delay=opt_tau, max_dim=4)
    assert 1 <= opt_d <= 4
    
    # Test Takens Phase Space reconstruction with Landmark Subsampling
    t0 = time.perf_counter()
    res = reconstruct_phase_space(sig, tau=opt_tau, d=opt_d, sample_rate=sr, max_cloud_points=1000)
    elapsed_ms = (time.perf_counter() - t0) * 1000
    
    assert "point_cloud" in res
    assert res["point_cloud"].shape[0] <= 1000
    assert res["point_cloud"].shape[1] == opt_d
    assert elapsed_ms < 200, f"Embedding took {elapsed_ms}ms, expected < 200ms"

def test_persistent_homology_and_features(synthetic_burst):
    raw_sig, sr = synthetic_burst
    sig = normalize_signal(remove_dc_bias(raw_sig))
    res = reconstruct_phase_space(sig, tau=4, d=3, sample_rate=sr, max_cloud_points=800)
    pt_cloud = res["point_cloud"]
    
    # Test persistent homology
    t0 = time.perf_counter()
    ph_res = compute_persistent_homology(pt_cloud, max_dim=1)
    t_rips = (time.perf_counter() - t0) * 1000
    
    assert ph_res["betti_0_peak"] >= 1
    assert ph_res["entropy_h0"] > 0
    assert "h0_diagram" in ph_res
    assert "h1_diagram" in ph_res
    assert t_rips < 350, f"Rips filtration took {t_rips}ms, expected < 350ms"
    
    # Test 128-dim topological feature vector extraction
    features = extract_topological_feature_vector(
        h0_pairs=ph_res["h0_diagram"],
        h1_pairs=ph_res["h1_diagram"]
    )
    assert len(features) == 128
    assert not np.isnan(features).any()
    assert not np.isinf(features).any()

def test_random_forest_classification(synthetic_burst):
    dummy_features = np.random.uniform(0.01, 1.0, 128)
    res = predict_crack_mode(dummy_features, entropy_h0=0.88, entropy_h1=0.74)
    
    assert "crack_mode" in res
    assert res["crack_mode"] in CRACK_CLASSES
    assert 0.0 <= res["confidence"] <= 1.0
    assert len(res["class_probabilities"]) == len(CRACK_CLASSES)

def test_conventional_ae_18_features(synthetic_burst):
    raw_sig, sr = synthetic_burst
    sig = normalize_signal(remove_dc_bias(raw_sig))
    
    feats = extract_18_conventional_ae_features(sig, sample_rate=sr)
    assert len(feats) == 18
    assert feats[0] > 0 # peak amplitude
    assert feats[1] >= 0 # energy
    assert feats[3] >= 0 # counts
    assert not np.isnan(feats).any()

def test_bocd_changepoint_detection():
    detector = BOCDetector(hazard_lambda=150.0)
    
    # Feed stable observations
    stable_stream = np.random.normal(loc=0.5, scale=0.05, size=40)
    for val in stable_stream:
        cp_prob, _, is_alarm = detector.update(val)
        
    assert cp_prob < 0.65
    assert not is_alarm
    
    # Check that update successfully advances step count and tracks state
    assert detector.step_count == 40
    assert len(detector.history_changepoint_probs) == 40

def test_conv1d_autoencoder_anomaly(synthetic_burst):
    raw_sig, _ = synthetic_burst
    res = compute_reconstruction_anomaly(raw_sig)
    
    assert "mse_reconstruction_loss" in res
    assert "z_score" in res
    assert "is_precursor_anomaly" in res
    assert res["mse_reconstruction_loss"] >= 0.0

def test_pdf_report_generation():
    mock_data = {
        "id": "pytest-run-001",
        "signal_id": "pytest-sig-001",
        "cdpi_score": 0.865,
        "crack_mode": "Intergranular Microcrack",
        "confidence": 0.92,
        "lead_time_ms": 340.0,
        "bocd_alarm": True,
        "execution_time_ms": 115.4,
        "tda": {
            "embedding_dimension": 3,
            "delay_lag": 4,
            "entropy_h0": 0.88,
            "entropy_h1": 0.74,
            "betti_0_peak": 1,
            "betti_1_peak": 3
        }
    }
    pdf_bytes = generate_echosense_pdf_report(mock_data)
    assert isinstance(pdf_bytes, bytes)
    assert len(pdf_bytes) > 2000
    assert pdf_bytes.startswith(b"%PDF")
