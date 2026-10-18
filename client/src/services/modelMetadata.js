/**
 * Centralized Model Metadata Store for AIXchange (Phase 8)
 * Manages model technical specs, architecture parameters, tensor shapes,
 * on-chain cryptographic digests, and verified training dataset links.
 */

const STORAGE_KEY = "aix_model_metadata_map";

export const DEFAULT_MODELS = {
  1: {
    modelId: 1,
    name: "DeepPulse ResNet-Telemetry Anomaly Predictor",
    description: "Residual convolutional network trained on Industrial IoT Sensor Telemetry (Dataset #1). Ingests 5-dimensional telemetry vectors and predicts mechanical stress anomalies with 98.42% accuracy and 14.2ms latency.",
    framework: "PyTorch",
    architecture: "ResNet-18 (1D Residual Predictor)",
    category: "Time Series & IoT",
    tags: ["pytorch", "resnet", "anomaly-detection", "industrial-iot", "telemetry"],
    parameters: "11.2M",
    accuracy: "98.42%",
    latency: "14.2ms",
    inputShape: "[Batch, 5] (Temp, Vibration, Voltage, Pressure, RPM)",
    outputShape: "[Batch, 1] (Anomaly Probability 0.0 - 1.0)",
    format: "Safetensors (.safetensors)",
    fileSize: "44.8 MB",
    datasetId: 1,
    datasetTitle: "Industrial IoT Sensor Telemetry",
    modelHash: "569fd95a0b6c30bf06b1368d42e36930873b683259b751edd8fab45c2b2728c2",
    license: "Commercial Monetization",
    owner: "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
    active: true,
    inferenceReady: true,
    version: "v1.2.0",
    hyperparameters: {
      epochs: 10,
      batchSize: 32,
      learningRate: "0.001",
      optimizer: "AdamW (weight_decay=1e-4)",
      lossFunction: "Binary Cross-Entropy with Logits",
    },
    createdAt: "2026-10-10T14:30:00Z",
  },
  2: {
    modelId: 2,
    name: "DynamicMLP Vibration Regressor",
    description: "Multi-layer perceptron trained inside the Phase 7 Docker Sandbox. Performs low-latency forward passes on sensor vibrations to forecast mechanical bearing failure.",
    framework: "PyTorch",
    architecture: "DynamicMLP (Input: 5 -> Hidden: [64, 32] -> Output: 1)",
    category: "Time Series & IoT",
    tags: ["pytorch", "mlp", "vibration", "predictive-maintenance"],
    parameters: "2.8M",
    accuracy: "99.00%",
    latency: "3.8ms",
    inputShape: "[Batch, 5]",
    outputShape: "[Batch, 1]",
    format: "Safetensors (.safetensors)",
    fileSize: "11.2 MB",
    datasetId: 1,
    datasetTitle: "Industrial IoT Sensor Telemetry",
    modelHash: "8f3c71a94e82b4a1c5d3e7f92a1b4c6d8e0f2a4b6c8d0e2f4a6b8c0d2e4f6a8b",
    license: "Research & Non-Commercial",
    owner: "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
    active: true,
    inferenceReady: true,
    version: "v1.0.0",
    hyperparameters: {
      epochs: 5,
      batchSize: 32,
      learningRate: "0.001",
      optimizer: "Adam",
      lossFunction: "Mean Squared Error (MSE)",
    },
    createdAt: "2026-10-15T09:15:00Z",
  },
  3: {
    modelId: 3,
    name: "SensoryBERT Multi-Modal Transformer",
    description: "Lightweight 6-layer bidirectional transformer adapted for industrial anomaly sequence embeddings with self-attention across multi-channel telemetry streams.",
    framework: "Transformers",
    architecture: "BERT-Tiny (6 Layers, 128 Hidden, 4 Attention Heads)",
    category: "Natural Language & Sequences",
    tags: ["transformers", "bert", "attention", "embeddings"],
    parameters: "14.4M",
    accuracy: "97.80%",
    latency: "22.5ms",
    inputShape: "[Batch, 64, 5]",
    outputShape: "[Batch, 2] (Class 0: Nominal, Class 1: Anomaly)",
    format: "ONNX (.onnx)",
    fileSize: "58.1 MB",
    datasetId: 2,
    datasetTitle: "Decentralized Sensor Telemetry Corpus v2",
    modelHash: "3a7b1c9e82f4d6a0b5c7e1f3a9b2d4e6f8a0b2c4d6e8f0a2b4c6d8e0f2a4b6c8",
    license: "Academic Use Only",
    owner: "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC",
    active: true,
    inferenceReady: true,
    version: "v2.1.0",
    hyperparameters: {
      epochs: 8,
      batchSize: 16,
      learningRate: "0.00005",
      optimizer: "AdamW",
      lossFunction: "CrossEntropyLoss",
    },
    createdAt: "2026-10-16T18:40:00Z",
  },
};

export function getAllStoredModelMetadata() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...DEFAULT_MODELS };
    const parsed = JSON.parse(raw);
    return { ...DEFAULT_MODELS, ...parsed };
  } catch {
    return { ...DEFAULT_MODELS };
  }
}

export function getModelMetadata(modelId) {
  const all = getAllStoredModelMetadata();
  if (modelId && all[modelId]) {
    return all[modelId];
  }
  return (
    all["1"] || {
      modelId: modelId || 1,
      name: `AI Model #${modelId}`,
      framework: "PyTorch",
      parameters: "10M",
      accuracy: "98.0%",
      latency: "15ms",
      modelHash: "569fd95a0b6c30bf06b1368d42e36930873b683259b751edd8fab45c2b2728c2",
      active: true,
    }
  );
}

export function saveModelMetadata(modelId, meta) {
  try {
    const all = getAllStoredModelMetadata();
    all[modelId] = {
      ...(all[modelId] || {}),
      ...meta,
      modelId: parseInt(modelId, 10),
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
  } catch (err) {
    console.error("Failed to persist model metadata:", err);
  }
}
