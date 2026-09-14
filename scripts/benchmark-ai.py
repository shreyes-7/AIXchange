"""
PyTorch Real Training & Inference Benchmark for Review III
Trains a real neural network, records loss curve, computes weights SHA-256 digest,
and measures real forward-pass inference latency.
Output: docs/review-iii/metrics/ai-metrics.json
"""

import hashlib
import json
import os
import time
import torch
import torch.nn as nn
import torch.optim as optim

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
METRICS_DIR = os.path.join(ROOT, "docs", "review-iii", "metrics")
os.makedirs(METRICS_DIR, exist_ok=True)

class TelemetryClassifier(nn.Module):
    def __init__(self, in_features=5, hidden=32, num_classes=3):
        super().__init__()
        self.net = nn.Sequential(
            nn.Linear(in_features, hidden),
            nn.ReLU(),
            nn.BatchNorm1d(hidden),
            nn.Linear(hidden, hidden),
            nn.ReLU(),
            nn.Linear(hidden, num_classes)
        )

    def forward(self, x):
        return self.net(x)

def run_ai_benchmarks():
    print("=================================================================")
    print("       AIXCHANGE REVIEW III - PYTORCH AI BENCHMARK ENGINE        ")
    print("=================================================================\n")

    torch.manual_seed(42)
    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    print(f"Executing on hardware device: {device} (PyTorch {torch.__version__})")

    # Generate 1,000 synthetic sensor telemetry samples (Temp, Vib, Volt, Press, RPM)
    X = torch.randn(1000, 5)
    y = (X[:, 0] * 2.0 + X[:, 1] * 1.5 > 0).long() # binary/multiclass target

    dataset = torch.utils.data.TensorDataset(X, y)
    loader = torch.utils.data.DataLoader(dataset, batch_size=32, shuffle=True)

    model = TelemetryClassifier().to(device)
    criterion = nn.CrossEntropyLoss()
    optimizer = optim.Adam(model.parameters(), lr=0.01)

    epochs = 5
    epoch_metrics = []

    print(f"Beginning {epochs}-Epoch Isolated Training Run...")
    start_train = time.time()
    for ep in range(1, epochs + 1):
        model.train()
        running_loss = 0.0
        correct = 0
        total = 0

        for batch_x, batch_y in loader:
            batch_x, batch_y = batch_x.to(device), batch_y.to(device)
            optimizer.zero_grad()
            out = model(batch_x)
            loss = criterion(out, batch_y)
            loss.backward()
            optimizer.step()

            running_loss += loss.item() * batch_x.size(0)
            _, preds = torch.max(out, 1)
            correct += (preds == batch_y).sum().item()
            total += batch_y.size(0)

        epoch_loss = running_loss / total
        epoch_acc = (correct / total) * 100.0
        epoch_metrics.append({
            "epoch": ep,
            "loss": round(epoch_loss, 4),
            "accuracyPercent": round(epoch_acc, 2),
        })
        print(f"  Epoch {ep}/{epochs}: Loss = {epoch_loss:.4f}, Accuracy = {epoch_acc:.2f}%")

    train_duration = round((time.time() - start_train), 3)

    # Export weights to memory and calculate SHA-256 fingerprint
    weights_buffer = io_bytes = bytearray()
    for p in model.parameters():
        io_bytes.extend(p.detach().cpu().numpy().tobytes())
    weights_hash = hashlib.sha256(io_bytes).hexdigest()
    print(f"\nModel Exported - Cryptographic Weights SHA-256:\n  0x{weights_hash}")

    # Forward Pass Inference Latency Benchmark (100 runs)
    print("\nBenchmarking Forward-Pass Inference Latency (100 queries)...")
    model.eval()
    test_sample = torch.randn(1, 5).to(device)

    # Warmup
    for _ in range(10):
        with torch.no_grad():
            _ = model(test_sample)

    latencies = []
    for _ in range(100):
        t0 = time.perf_counter()
        with torch.no_grad():
            _ = model(test_sample)
        latencies.append((time.perf_counter() - t0) * 1000.0) # ms

    latencies.sort()
    avg_latency = round(sum(latencies) / len(latencies), 3)
    p50_latency = round(latencies[50], 3)
    p99_latency = round(latencies[98], 3)

    print(f"  -- Mean Latency: {avg_latency} ms | p50: {p50_latency} ms | p99: {p99_latency} ms")

    results = {
        "timestamp": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
        "environment": {
            "device": str(device),
            "pytorchVersion": torch.__version__,
        },
        "modelArchitecture": {
            "name": "TelemetryClassifier",
            "totalParameters": sum(p.numel() for p in model.parameters()),
            "weightsSha256": weights_hash,
        },
        "training": {
            "epochs": epochs,
            "trainingDurationSec": train_duration,
            "lossConvergence": epoch_metrics,
            "finalLoss": epoch_metrics[-1]["loss"],
            "finalAccuracyPercent": epoch_metrics[-1]["accuracyPercent"],
        },
        "inferencePerformance": {
            "batchSize": 1,
            "iterations": 100,
            "meanLatencyMs": avg_latency,
            "p50LatencyMs": p50_latency,
            "p99LatencyMs": p99_latency,
        }
    }

    out_file = os.path.join(METRICS_DIR, "ai-metrics.json")
    with open(out_file, "w") as f:
        json.dump(results, f, indent=2)

    print(f"\nSaved AI Telemetry to: {out_file}")
    print("=================================================================\n")

if __name__ == "__main__":
    run_ai_benchmarks()
