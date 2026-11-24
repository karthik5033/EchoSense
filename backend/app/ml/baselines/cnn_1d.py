import os
import torch
import torch.nn as nn
import torch.optim as optim
import numpy as np
from typing import Dict, Any, Tuple
from app.core.config import settings

CNN_MODEL_PATH = os.path.join(settings.MODEL_DIR, "cnn_baseline_v1.pt")
CLASSES = ["Tensile Micro-Crack", "Shear Interface Slip", "Mixed Fracture"]

class ResidualBlock1D(nn.Module):
    def __init__(self, in_channels: int, out_channels: int, stride: int = 1):
        super().__init__()
        self.conv1 = nn.Conv1d(in_channels, out_channels, kernel_size=7, stride=stride, padding=3)
        self.bn1 = nn.BatchNorm1d(out_channels)
        self.relu = nn.ReLU(inplace=True)
        self.dropout = nn.Dropout(0.3)
        self.conv2 = nn.Conv1d(out_channels, out_channels, kernel_size=7, stride=1, padding=3)
        self.bn2 = nn.BatchNorm1d(out_channels)

        self.shortcut = nn.Sequential()
        if stride != 1 or in_channels != out_channels:
            self.shortcut = nn.Sequential(
                nn.Conv1d(in_channels, out_channels, kernel_size=1, stride=stride),
                nn.BatchNorm1d(out_channels)
            )

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        res = self.shortcut(x)
        out = self.relu(self.bn1(self.conv1(x)))
        out = self.dropout(out)
        out = self.bn2(self.conv2(out))
        out += res
        return self.relu(out)

class AcousticEmission1DCNN(nn.Module):
    """
    4-Layer 1D Deep Convolutional Neural Network with Residual Connections
    for end-to-end acoustic emission crack mode classification from raw waveforms.
    """
    def __init__(self, num_classes: int = 3):
        super().__init__()
        # Initial stem
        self.stem = nn.Sequential(
            nn.Conv1d(1, 32, kernel_size=15, stride=2, padding=7),
            nn.BatchNorm1d(32),
            nn.ReLU(inplace=True),
            nn.MaxPool1d(2),
            nn.Dropout(0.3)
        )
        # Residual stages
        self.layer1 = ResidualBlock1D(32, 64, stride=2)
        self.layer2 = ResidualBlock1D(64, 128, stride=2)
        
        # Classification head
        self.gap = nn.AdaptiveAvgPool1d(1)
        self.fc = nn.Sequential(
            nn.Linear(128, 64),
            nn.ReLU(inplace=True),
            nn.Dropout(0.3),
            nn.Linear(64, num_classes)
        )

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        # x shape: (B, 1, L)
        feat = self.stem(x)
        feat = self.layer1(feat)
        feat = self.layer2(feat)
        pooled = self.gap(feat).squeeze(-1)
        logits = self.fc(pooled)
        return logits

_CNN_MODEL_INSTANCE: AcousticEmission1DCNN | None = None

def generate_synthetic_waveforms(n_per_class: int = 100, seq_len: int = 2048) -> Tuple[torch.Tensor, torch.Tensor]:
    """
    Generates synthetic representative raw acoustic bursts for Tensile, Shear, and Mixed modes.
    """
    t = np.linspace(0, 0.004, seq_len)
    X = []
    y = []

    for _ in range(n_per_class):
        # Tensile: rapid rise, high frequency carrier (160 kHz), fast exponential decay
        decay_t = np.exp(-t / 0.0004)
        carrier_t = np.sin(2 * np.pi * np.random.uniform(140000, 180000) * t)
        noise = np.random.normal(0, 0.05, seq_len)
        sig = decay_t * carrier_t + noise
        X.append(sig / np.max(np.abs(sig)))
        y.append(0)

        # Shear: slower rise, lower frequency carrier (60 kHz), reverberant tail
        decay_s = np.exp(-t / 0.0015)
        carrier_s = np.sin(2 * np.pi * np.random.uniform(50000, 75000) * t)
        noise = np.random.normal(0, 0.05, seq_len)
        sig = decay_s * carrier_s + noise
        X.append(sig / np.max(np.abs(sig)))
        y.append(1)

        # Mixed: dual frequency burst (mixed high & low frequencies)
        decay_m = np.exp(-t / 0.0008)
        carrier_m = 0.6 * np.sin(2 * np.pi * 150000 * t) + 0.4 * np.sin(2 * np.pi * 65000 * t)
        noise = np.random.normal(0, 0.05, seq_len)
        sig = decay_m * carrier_m + noise
        X.append(sig / np.max(np.abs(sig)))
        y.append(2)

    X_arr = np.array(X, dtype=np.float32)[:, np.newaxis, :] # (N, 1, 2048)
    y_arr = np.array(y, dtype=np.int64)
    return torch.tensor(X_arr), torch.tensor(y_arr)

def train_or_load_cnn_model() -> AcousticEmission1DCNN:
    """
    Loads saved PyTorch checkpoint or trains a new 1D CNN model.
    """
    global _CNN_MODEL_INSTANCE
    if _CNN_MODEL_INSTANCE is not None:
        return _CNN_MODEL_INSTANCE

    os.makedirs(settings.MODEL_DIR, exist_ok=True)
    model = AcousticEmission1DCNN(num_classes=3)

    if os.path.exists(CNN_MODEL_PATH):
        try:
            state = torch.load(CNN_MODEL_PATH, map_location="cpu")
            model.load_state_dict(state)
            model.eval()
            _CNN_MODEL_INSTANCE = model
            return _CNN_MODEL_INSTANCE
        except Exception:
            pass

    # Quick training to convergence
    X_train, y_train = generate_synthetic_waveforms(n_per_class=80)
    optimizer = optim.Adam(model.parameters(), lr=1e-3, weight_decay=1e-4)
    criterion = nn.CrossEntropyLoss()
    scheduler = optim.lr_scheduler.CosineAnnealingLR(optimizer, T_max=15)

    model.train()
    dataset = torch.utils.data.TensorDataset(X_train, y_train)
    loader = torch.utils.data.DataLoader(dataset, batch_size=32, shuffle=True)

    for epoch in range(12):
        for bx, by in loader:
            optimizer.zero_grad()
            out = model(bx)
            loss = criterion(out, by)
            loss.backward()
            optimizer.step()
        scheduler.step()

    torch.save(model.state_dict(), CNN_MODEL_PATH)
    model.eval()
    _CNN_MODEL_INSTANCE = model
    return _CNN_MODEL_INSTANCE

def predict_cnn_waveform(waveform: np.ndarray) -> Dict[str, Any]:
    """
    Evaluates 1D CNN model on a raw waveform segment.
    """
    model = train_or_load_cnn_model()
    model.eval()

    # Ensure shape is (1, 1, 2048)
    if len(waveform) < 2048:
        padded = np.pad(waveform, (0, 2048 - len(waveform)), mode='constant')
    else:
        padded = waveform[:2048]

    # Normalize amplitude
    max_val = np.max(np.abs(padded))
    if max_val > 0:
        padded = padded / max_val

    inp = torch.tensor(padded, dtype=torch.float32).unsqueeze(0).unsqueeze(0)

    with torch.no_grad():
        logits = model(inp)
        probs = torch.softmax(logits, dim=-1).squeeze(0).numpy()

    pred_idx = int(np.argmax(probs))
    pred_label = CLASSES[pred_idx]
    confidence = float(probs[pred_idx])

    return {
        "model": "1D Residual CNN Baseline (PyTorch)",
        "crack_mode": pred_label,
        "confidence": float(round(confidence, 4)),
        "class_probabilities": {
            CLASSES[i]: float(round(probs[i], 4)) for i in range(len(CLASSES))
        }
    }
