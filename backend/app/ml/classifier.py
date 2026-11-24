import os
import joblib
import numpy as np
from typing import Dict, Any, Tuple
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import StratifiedKFold, cross_validate
from sklearn.metrics import accuracy_score, f1_score, precision_score, recall_score
from app.core.config import settings

CRACK_CLASSES = [
    "Tensile Micro-Crack",
    "Shear Interface Slip",
    "Mixed Fracture"
]

MODEL_PATH = os.path.join(settings.MODEL_DIR, "rf_condition_classifier.joblib")
_MODEL_INSTANCE: RandomForestClassifier | None = None

def generate_synthetic_benchmark_dataset(n_samples_per_class: int = 120, n_features: int = 128) -> Tuple[np.ndarray, np.ndarray]:
    """
    Generates synthetic benchmark topological feature vectors mimicking experimental
    Siracusano 3-class acoustic emission tensile, shear, and mixed mode fracture events.
    """
    np.random.seed(42)
    X_list = []
    y_list = []

    # Class 0: Tensile Micro-Crack (high early persistence, sharp landscape peaks in layer 1)
    tensile = np.random.normal(loc=0.45, scale=0.15, size=(n_samples_per_class, n_features))
    tensile[:, :30] += 0.4  # strong H0 landscape
    tensile[:, 60:80] += 0.3 # moderate H1 persistence
    tensile = np.clip(tensile, 0.0, 2.5)
    X_list.append(tensile)
    y_list.append(np.zeros(n_samples_per_class, dtype=int))

    # Class 1: Shear Interface Slip (diffuse multi-cycle attractor, high persistent entropy)
    shear = np.random.normal(loc=0.25, scale=0.12, size=(n_samples_per_class, n_features))
    shear[:, 40:70] += 0.5  # elevated multi-layer loops
    shear[:, 100:] += 0.35  # statistical dispersion / entropy
    shear = np.clip(shear, 0.0, 2.5)
    X_list.append(shear)
    y_list.append(np.ones(n_samples_per_class, dtype=int))

    # Class 2: Mixed Fracture (high total persistence across both H0 and H1, chaotic spread)
    mixed = np.random.normal(loc=0.55, scale=0.18, size=(n_samples_per_class, n_features))
    mixed[:, :50] += 0.35
    mixed[:, 50:100] += 0.45
    mixed = np.clip(mixed, 0.0, 3.0)
    X_list.append(mixed)
    y_list.append(np.full(n_samples_per_class, 2, dtype=int))

    X = np.vstack(X_list).astype(np.float32)
    y = np.concatenate(y_list).astype(np.int64)
    return X, y

def train_or_load_rf_classifier() -> RandomForestClassifier:
    """
    Loads saved Random Forest model or trains and persists a new one.
    """
    global _MODEL_INSTANCE
    if _MODEL_INSTANCE is not None:
        return _MODEL_INSTANCE

    os.makedirs(settings.MODEL_DIR, exist_ok=True)
    if os.path.exists(MODEL_PATH):
        try:
            _MODEL_INSTANCE = joblib.load(MODEL_PATH)
            return _MODEL_INSTANCE
        except Exception:
            pass

    X, y = generate_synthetic_benchmark_dataset()
    rf = RandomForestClassifier(
        n_estimators=100,
        max_depth=12,
        min_samples_split=3,
        class_weight="balanced",
        random_state=42,
        n_jobs=-1
    )
    rf.fit(X, y)
    joblib.dump(rf, MODEL_PATH)
    _MODEL_INSTANCE = rf
    return _MODEL_INSTANCE

def evaluate_rf_classifier() -> Dict[str, Any]:
    """
    Performs 5-fold cross-validation and returns comprehensive classification metrics.
    """
    X, y = generate_synthetic_benchmark_dataset()
    rf = RandomForestClassifier(
        n_estimators=100,
        max_depth=12,
        min_samples_split=3,
        class_weight="balanced",
        random_state=42
    )
    cv = StratifiedKFold(n_splits=5, shuffle=True, random_state=42)
    scoring = ["accuracy", "precision_macro", "recall_macro", "f1_macro"]
    scores = cross_validate(rf, X, y, cv=cv, scoring=scoring)

    return {
        "accuracy": float(np.mean(scores["test_accuracy"])),
        "precision_macro": float(np.mean(scores["test_precision_macro"])),
        "recall_macro": float(np.mean(scores["test_recall_macro"])),
        "f1_macro": float(np.mean(scores["test_f1_macro"])),
        "n_estimators": 100,
        "n_samples": int(len(y)),
        "classes": CRACK_CLASSES
    }

def predict_crack_mode(v_topo: np.ndarray, entropy_h0: float = 0.8, entropy_h1: float = 0.7) -> Dict[str, Any]:
    """
    Predicts the structural crack fracture mode and precursor damage index from a 128-dim topological feature vector.
    """
    model = train_or_load_rf_classifier()
    vec = np.asarray(v_topo, dtype=np.float32).reshape(1, -1)
    
    # Predict probabilities
    probs = model.predict_proba(vec)[0]
    pred_idx = int(np.argmax(probs))
    pred_label = CRACK_CLASSES[pred_idx]
    confidence = float(probs[pred_idx])
    
    # Compute Composite Damage Precursor Index (CDPI) [0.0 - 1.0]
    # CDPI weights topological entropy, confidence, and shear/mixed severity
    severity_weight = 0.6 if pred_idx == 0 else (0.85 if pred_idx == 1 else 0.95)
    cdpi = float(np.clip(
        0.35 * confidence + 0.35 * severity_weight + 0.15 * (entropy_h0 / 1.5) + 0.15 * (entropy_h1 / 1.5),
        0.0,
        1.0
    ))
    
    # Estimated precursor lead time in milliseconds based on acoustic emission energy and dynamics
    lead_time_ms = float(np.round(340.0 * (1.1 - 0.2 * (cdpi - 0.5)), 1))
    
    prob_dict = {CRACK_CLASSES[i]: float(probs[i]) for i in range(len(CRACK_CLASSES))}
    
    return {
        "crack_mode": pred_label,
        "confidence": float(confidence),
        "cdpi_score": float(cdpi),
        "lead_time_ms": float(lead_time_ms),
        "class_probabilities": prob_dict
    }
