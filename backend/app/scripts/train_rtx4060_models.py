"""
EchoSense GPU Model Training & Optimization Pipeline
Utilizes NVIDIA GeForce RTX 4060 (8GB VRAM) via PyTorch CUDA 12.6
Trains and validates:
1. 1D Residual CNN for Raw Acoustic Waveforms
2. Conv1D Autoencoder for Unsupervised Anomaly Detection
3. Random Forest 128-dim Topological Condition Classifier
4. Updates all checkpoints in storage/models/
"""

import os
import sys
import time
import joblib
import numpy as np
import torch
import torch.nn as nn
import torch.optim as optim
from torch.utils.data import TensorDataset, DataLoader
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import StratifiedKFold, cross_validate
from sklearn.metrics import accuracy_score, f1_score, classification_report

# Setup path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..")))
from app.core.config import settings

def setup_device() -> torch.device:
    if torch.cuda.is_available():
        device = torch.device("cuda:0")
        gpu_name = torch.cuda.get_device_name(0)
        vram_gb = torch.cuda.get_device_properties(0).total_memory / (1024**3)
        print(f"⚡ GPU Accelerated: {gpu_name} ({vram_gb:.2f} GB VRAM) - CUDA 12.6")
        torch.backends.cudnn.benchmark = True
    else:
        device = torch.device("cpu")
        print("⚠️ Warning: CUDA not available, falling back to CPU")
    return device

# ==============================================================================
# 1. 1D Residual CNN Architecture & Training
# ==============================================================================
class ResidualBlock1D(nn.Module):
    def __init__(self, in_channels: int, out_channels: int, stride: int = 1):
        super().__init__()
        self.conv1 = nn.Conv1d(in_channels, out_channels, kernel_size=7, stride=stride, padding=3)
        self.bn1 = nn.BatchNorm1d(out_channels)
        self.relu = nn.ReLU(inplace=True)
        self.dropout = nn.Dropout(0.2)
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

class HighAccuracy1DCNN(nn.Module):
    def __init__(self, num_classes: int = 3):
        super().__init__()
        self.stem = nn.Sequential(
            nn.Conv1d(1, 32, kernel_size=15, stride=2, padding=7),
            nn.BatchNorm1d(32),
            nn.ReLU(inplace=True),
            nn.MaxPool1d(2),
            nn.Dropout(0.2)
        )
        self.layer1 = ResidualBlock1D(32, 64, stride=2)
        self.layer2 = ResidualBlock1D(64, 128, stride=2)
        self.gap = nn.AdaptiveAvgPool1d(1)
        self.fc = nn.Sequential(
            nn.Linear(128, 64),
            nn.ReLU(inplace=True),
            nn.Dropout(0.3),
            nn.Linear(64, num_classes)
        )

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        feat = self.stem(x)
        feat = self.layer1(feat)
        feat = self.layer2(feat)
        pooled = self.gap(feat).squeeze(-1)
        return self.fc(pooled)

def generate_augmented_acoustic_dataset(n_per_class: int = 800, seq_len: int = 2048):
    """
    Synthesizes physical acoustic emission waveform bursts with SNR variation,
    damping factor perturbations, and modal frequency dispersion.
    """
    t = np.linspace(0, 0.005, seq_len)
    X = []
    y = []

    for _ in range(n_per_class):
        # 1. Tensile Mode: Fast rise time (< 15 us), high carrier frequency (140-190 kHz), sharp decay
        freq_t = np.random.uniform(140000, 190000)
        decay_rate = np.random.uniform(1800, 2600)
        carrier = np.sin(2 * np.pi * freq_t * t + np.random.uniform(0, np.pi))
        env = np.exp(-t * decay_rate)
        snr = np.random.uniform(10, 30)
        noise_std = 1.0 / (10 ** (snr / 20.0))
        sig = carrier * env + np.random.normal(0, noise_std, seq_len)
        X.append(sig / np.max(np.abs(sig)))
        y.append(0)

        # 2. Shear Mode: Slower rise time, lower frequency (50-80 kHz), prolonged friction ringdown
        freq_s = np.random.uniform(48000, 82000)
        decay_s = np.random.uniform(600, 950)
        carrier_s = np.sin(2 * np.pi * freq_s * t)
        env_s = np.exp(-t * decay_s)
        sig_s = carrier_s * env_s + np.random.normal(0, noise_std * 0.8, seq_len)
        X.append(sig_s / np.max(np.abs(sig_s)))
        y.append(1)

        # 3. Mixed Mode: Dual-modal carrier (e.g. 150 kHz + 65 kHz) with phase turbulence
        freq_m1 = np.random.uniform(130000, 170000)
        freq_m2 = np.random.uniform(55000, 75000)
        env_m = np.exp(-t * np.random.uniform(1100, 1500))
        carrier_m = 0.65 * np.sin(2 * np.pi * freq_m1 * t) + 0.35 * np.sin(2 * np.pi * freq_m2 * t + 0.4)
        sig_m = carrier_m * env_m + np.random.normal(0, noise_std, seq_len)
        X.append(sig_m / np.max(np.abs(sig_m)))
        y.append(2)

    X_arr = np.array(X, dtype=np.float32)[:, np.newaxis, :]
    y_arr = np.array(y, dtype=np.int64)
    return X_arr, y_arr

def train_cnn_on_gpu(device: torch.device):
    print("\n--- [1/3] Training 1D Residual CNN on RTX 4060 ---")
    t0 = time.perf_counter()
    X_raw, y_raw = generate_augmented_acoustic_dataset(n_per_class=1000)
    
    # Train / Val Split (80 / 20)
    indices = np.random.permutation(len(X_raw))
    split = int(0.8 * len(X_raw))
    train_idx, val_idx = indices[:split], indices[split:]

    X_train, y_train = torch.tensor(X_raw[train_idx]), torch.tensor(y_raw[train_idx])
    X_val, y_val = torch.tensor(X_raw[val_idx]), torch.tensor(y_raw[val_idx])

    train_loader = DataLoader(TensorDataset(X_train, y_train), batch_size=64, shuffle=True)
    val_loader = DataLoader(TensorDataset(X_val, y_val), batch_size=64, shuffle=False)

    model = HighAccuracy1DCNN(num_classes=3).to(device)
    optimizer = optim.AdamW(model.parameters(), lr=1.5e-3, weight_decay=1e-3)
    criterion = nn.CrossEntropyLoss(label_smoothing=0.05)
    scheduler = optim.lr_scheduler.CosineAnnealingLR(optimizer, T_max=25, eta_min=1e-5)

    best_acc = 0.0
    for epoch in range(1, 31):
        model.train()
        train_loss = 0.0
        for bx, by in train_loader:
            bx, by = bx.to(device), by.to(device)
            optimizer.zero_grad()
            out = model(bx)
            loss = criterion(out, by)
            loss.backward()
            optimizer.step()
            train_loss += loss.item() * len(bx)
        scheduler.step()

        # Validation
        model.eval()
        correct = 0
        total = 0
        with torch.no_grad():
            for bx, by in val_loader:
                bx, by = bx.to(device), by.to(device)
                preds = model(bx).argmax(dim=-1)
                correct += (preds == by).sum().item()
                total += len(by)
        val_acc = correct / total
        if val_acc > best_acc:
            best_acc = val_acc
            out_path = os.path.join(settings.MODEL_DIR, "cnn_baseline_v1.pt")
            torch.save(model.state_dict(), out_path)

        if epoch % 5 == 0 or epoch == 30:
            print(f"Epoch {epoch:2d}/30 | Train Loss: {train_loss/len(X_train):.4f} | Val Accuracy: {val_acc*100:.2f}% (Best: {best_acc*100:.2f}%)")

    elapsed = time.perf_counter() - t0
    print(f"✓ 1D CNN Trained in {elapsed:.2f}s | Final Best Val Accuracy: {best_acc*100:.2f}%")
    return best_acc

# ==============================================================================
# 2. Conv1D Autoencoder Training on RTX 4060
# ==============================================================================
class Conv1DAutoencoder(nn.Module):
    def __init__(self):
        super().__init__()
        self.encoder = nn.Sequential(
            nn.Conv1d(1, 16, kernel_size=9, stride=2, padding=4),
            nn.BatchNorm1d(16),
            nn.ReLU(inplace=True),
            nn.Conv1d(16, 32, kernel_size=7, stride=2, padding=3),
            nn.BatchNorm1d(32),
            nn.ReLU(inplace=True),
            nn.Conv1d(32, 64, kernel_size=5, stride=2, padding=2),
            nn.BatchNorm1d(64),
            nn.ReLU(inplace=True)
        )
        self.decoder = nn.Sequential(
            nn.ConvTranspose1d(64, 32, kernel_size=5, stride=2, padding=2, output_padding=1),
            nn.BatchNorm1d(32),
            nn.ReLU(inplace=True),
            nn.ConvTranspose1d(32, 16, kernel_size=7, stride=2, padding=3, output_padding=1),
            nn.BatchNorm1d(16),
            nn.ReLU(inplace=True),
            nn.ConvTranspose1d(16, 1, kernel_size=9, stride=2, padding=4, output_padding=1),
            nn.Tanh()
        )

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        return self.decoder(self.encoder(x))

def train_autoencoder_on_gpu(device: torch.device):
    print("\n--- [2/3] Training Conv1D Autoencoder on Undamaged Baselines ---")
    t0 = time.perf_counter()

    # Generate 1500 healthy vibration signals
    seq_len = 2048
    t = np.linspace(0, 0.005, seq_len)
    data = []
    for _ in range(1500):
        ambient = np.random.normal(0, 0.025, seq_len)
        res1 = np.random.uniform(0.02, 0.05) * np.sin(2 * np.pi * np.random.uniform(28000, 36000) * t)
        res2 = np.random.uniform(0.01, 0.03) * np.sin(2 * np.pi * np.random.uniform(50000, 58000) * t)
        sig = ambient + res1 + res2
        sig = (sig / np.max(np.abs(sig))) * 0.15
        data.append(sig)

    X_healthy = torch.tensor(np.array(data, dtype=np.float32)[:, np.newaxis, :])
    loader = DataLoader(TensorDataset(X_healthy), batch_size=64, shuffle=True)

    model = Conv1DAutoencoder().to(device)
    optimizer = optim.AdamW(model.parameters(), lr=2e-3, weight_decay=1e-4)
    criterion = nn.MSELoss()
    scheduler = optim.lr_scheduler.CosineAnnealingLR(optimizer, T_max=20)

    model.train()
    for epoch in range(1, 26):
        total_loss = 0.0
        for (bx,) in loader:
            bx = bx.to(device)
            optimizer.zero_grad()
            recon = model(bx)
            loss = criterion(recon, bx)
            loss.backward()
            optimizer.step()
            total_loss += loss.item() * len(bx)
        scheduler.step()
        if epoch % 5 == 0 or epoch == 25:
            print(f"Epoch {epoch:2d}/25 | Reconstruction MSE: {total_loss/len(X_healthy):.6f}")

    # Compute baseline distribution statistics
    model.eval()
    losses = []
    with torch.no_grad():
        for (bx,) in loader:
            bx = bx.to(device)
            recon = model(bx)
            diff = (bx - recon) ** 2
            mse = diff.mean(dim=(1, 2)).cpu().numpy()
            losses.extend(mse)

    losses = np.array(losses)
    mu_loss = float(np.mean(losses))
    std_loss = float(np.std(losses))
    p99_loss = float(np.percentile(losses, 99.0))

    out_path = os.path.join(settings.MODEL_DIR, "conv1d_autoencoder_v1.pt")
    torch.save(model.state_dict(), out_path)
    elapsed = time.perf_counter() - t0
    print(f"✓ Autoencoder Trained in {elapsed:.2f}s | Baseline Loss: μ={mu_loss:.6f}, σ={std_loss:.6f}, P99={p99_loss:.6f}")
    return mu_loss, std_loss, p99_loss

# ==============================================================================
# 3. Random Forest 128-dim Topological Condition Classifier
# ==============================================================================
def train_topological_rf():
    print("\n--- [3/3] Optimizing 128-dim Topological Condition Classifier ---")
    t0 = time.perf_counter()

    from app.ml.classifier import generate_synthetic_benchmark_dataset
    X, y = generate_synthetic_benchmark_dataset(n_samples_per_class=600, n_features=128)

    rf = RandomForestClassifier(
        n_estimators=250,
        max_depth=16,
        min_samples_split=2,
        class_weight="balanced_subsample",
        random_state=42,
        n_jobs=-1
    )

    cv = StratifiedKFold(n_splits=5, shuffle=True, random_state=42)
    scores = cross_validate(
        rf, X, y, cv=cv,
        scoring=['accuracy', 'f1_macro', 'precision_macro', 'recall_macro']
    )

    rf.fit(X, y)
    out_path = os.path.join(settings.MODEL_DIR, "rf_condition_classifier.joblib")
    joblib.dump(rf, out_path)

    acc = np.mean(scores['test_accuracy'])
    f1 = np.mean(scores['test_f1_macro'])
    elapsed = time.perf_counter() - t0
    print(f"✓ Random Forest Trained in {elapsed:.2f}s | 5-Fold CV Accuracy: {acc*100:.2f}%, Macro F1: {f1:.4f}")
    return acc, f1

def main():
    print("=================================================================")
    print("🚀 ECHOSENSE ML ACCELERATION & TRAINING SUITE (NVIDIA RTX 4060)")
    print("=================================================================")
    device = setup_device()

    acc_cnn = train_cnn_on_gpu(device)
    mu_ae, std_ae, p99_ae = train_autoencoder_on_gpu(device)
    acc_rf, f1_rf = train_topological_rf()

    print("\n=================================================================")
    print("🎉 ALL MODELS TRAINED & ACCELERATED ON RTX 4060 SUCCESSFULLY!")
    print(f"1. 1D Residual CNN Accuracy:          {acc_cnn*100:.2f}%")
    print(f"2. Autoencoder Baseline Loss:         μ={mu_ae:.6f}, P99={p99_ae:.6f}")
    print(f"3. Topological Random Forest F1:      {f1_rf*100:.2f}%")
    print(f"All model checkpoints saved to:       {settings.MODEL_DIR}")
    print("=================================================================")

if __name__ == "__main__":
    main()
