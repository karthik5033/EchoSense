import numpy as np
from typing import Dict, Any, List

def compute_persistence_landscape(
    dgm: np.ndarray,
    n_layers: int = 5,
    n_bins: int = 50,
    t_min: float = 0.0,
    t_max: float = 1.0
) -> np.ndarray:
    """
    Computes Bubenik (2015) Persistence Landscapes lambda_k(t) for layers k=1..n_layers.
    """
    t_grid = np.linspace(t_min, t_max, n_bins)
    if len(dgm) == 0:
        return np.zeros((n_layers, n_bins), dtype=np.float32)
        
    # Evaluate triangular functions for each persistence pair:
    # f_(b, d)(t) = max(0, min(t - b, d - t))
    evals = []
    for b, d in dgm:
        if d <= b:
            continue
        curve = np.maximum(0.0, np.minimum(t_grid - b, d - t_grid))
        evals.append(curve)
        
    if not evals:
        return np.zeros((n_layers, n_bins), dtype=np.float32)
        
    eval_matrix = np.array(evals) # (num_pairs, n_bins)
    # Sort values descending along each t to extract layers
    sorted_layers = np.sort(eval_matrix, axis=0)[::-1]
    
    # Take top n_layers, pad if fewer
    if len(sorted_layers) < n_layers:
        padding = np.zeros((n_layers - len(sorted_layers), n_bins), dtype=np.float32)
        landscape = np.vstack([sorted_layers, padding])
    else:
        landscape = sorted_layers[:n_layers]
        
    return landscape.astype(np.float32)

def extract_topological_feature_vector(
    h0_pairs: List[List[float]],
    h1_pairs: List[List[float]]
) -> np.ndarray:
    """
    Combines Persistence Landscapes, statistical lifetime descriptors, and persistent entropy
    into a uniform fixed-length 128-dimensional topological feature vector v_topo.
    """
    dgm0 = np.array(h0_pairs) if h0_pairs else np.empty((0, 2))
    dgm1 = np.array(h1_pairs) if h1_pairs else np.empty((0, 2))
    
    # 1. Landscapes (5 layers x 20 bins = 100 features)
    l1 = compute_persistence_landscape(dgm1, n_layers=5, n_bins=20).flatten()
    
    # 2. Statistical lifetime moments for H0 and H1
    def stats(dgm: np.ndarray) -> np.ndarray:
        if len(dgm) == 0:
            return np.zeros(14, dtype=np.float32)
        lifetimes = np.maximum(0.0, dgm[:, 1] - dgm[:, 0])
        mean_l = float(np.mean(lifetimes))
        std_l = float(np.std(lifetimes))
        max_l = float(np.max(lifetimes))
        sum_l = float(np.sum(lifetimes))
        birth_mean = float(np.mean(dgm[:, 0]))
        death_mean = float(np.mean(dgm[:, 1]))
        count = float(len(dgm))
        return np.array([mean_l, std_l, max_l, sum_l, birth_mean, death_mean, count], dtype=np.float32)
        
    s0 = stats(dgm0)
    s1 = stats(dgm1)
    
    # Concatenate into fixed 128-dim vector
    v_topo = np.concatenate([l1, s0, s1])
    if len(v_topo) < 128:
        v_topo = np.pad(v_topo, (0, 128 - len(v_topo)), mode='constant')
    else:
        v_topo = v_topo[:128]
        
    return v_topo.astype(np.float32)
