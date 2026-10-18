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
    featureSchema: [
      {
        name: "Bearing Operating Temperature",
        unit: "°C",
        min: 0,
        max: 120,
        step: 0.5,
        nominal: [20, 55],
        defaultValue: 24.5,
        icon: "Thermometer",
        color: "text-rose-400",
      },
      {
        name: "Radial Mechanical Vibration",
        unit: "g (accel)",
        min: 0.0,
        max: 1.0,
        step: 0.005,
        nominal: [0.01, 0.18],
        defaultValue: 0.082,
        icon: "Activity",
        color: "text-cyan-400",
      },
      {
        name: "Line Bus Operating Voltage",
        unit: "V",
        min: 150,
        max: 480,
        step: 1.0,
        nominal: [340, 420],
        defaultValue: 380.2,
        icon: "Zap",
        color: "text-amber-400",
      },
      {
        name: "Hydraulic Line Pressure",
        unit: "bar",
        min: 0.0,
        max: 5.0,
        step: 0.05,
        nominal: [1.0, 2.5],
        defaultValue: 1.42,
        icon: "Gauge",
        color: "text-purple-400",
      },
      {
        name: "Rotor Spindle Angular Speed",
        unit: "RPM",
        min: 600,
        max: 3200,
        step: 25,
        nominal: [1400, 2200],
        defaultValue: 1850,
        icon: "RotateCw",
        color: "text-emerald-400",
      },
    ],
    presets: [
      {
        name: "Nominal Operating Baseline",
        vector: [24.5, 0.082, 380.2, 1.42, 1850],
        desc: "Optimal operating temperature, low vibration, and steady 380V line voltage.",
        type: "optimal",
      },
      {
        name: "Critical Thermal Spike",
        vector: [89.2, 0.354, 342.1, 2.85, 2400],
        desc: "High bearing temperature (89.2°C) with elevated radial mechanical stress.",
        type: "critical",
      },
      {
        name: "Voltage Sag Anomaly",
        vector: [31.0, 0.120, 210.5, 1.10, 1600],
        desc: "Severe brownout voltage drop (210.5V) causing electrical oscillation.",
        type: "warning",
      },
      {
        name: "Bearing Mechanical Cavitation",
        vector: [78.4, 0.890, 395.0, 4.80, 2950],
        desc: "High harmonic vibration (0.89g) and extreme hydraulic pressure spike.",
        type: "critical",
      },
    ],
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
    inputShape: "[Batch, 5] (Axial, Peak Velocity, Acoustic, Kurtosis, Resonance)",
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
    featureSchema: [
      {
        name: "Axial Vibration Velocity",
        unit: "mm/s",
        min: 0,
        max: 50,
        step: 0.2,
        nominal: [0.5, 8.0],
        defaultValue: 3.2,
        icon: "Activity",
        color: "text-cyan-400",
      },
      {
        name: "High-Frequency Peak Velocity",
        unit: "kHz",
        min: 1,
        max: 40,
        step: 0.5,
        nominal: [5, 18],
        defaultValue: 12.4,
        icon: "Radio",
        color: "text-indigo-400",
      },
      {
        name: "Acoustic Emission Energy",
        unit: "dB",
        min: 20,
        max: 110,
        step: 1,
        nominal: [25, 60],
        defaultValue: 42.0,
        icon: "Volume2",
        color: "text-amber-400",
      },
      {
        name: "Bearing Kurtosis Factor",
        unit: "ratio",
        min: 1.0,
        max: 10.0,
        step: 0.1,
        nominal: [2.5, 3.8],
        defaultValue: 3.05,
        icon: "BarChart3",
        color: "text-purple-400",
      },
      {
        name: "Harmonic Resonance Frequency",
        unit: "Hz",
        min: 50,
        max: 2500,
        step: 10,
        nominal: [120, 450],
        defaultValue: 240,
        icon: "Sliders",
        color: "text-emerald-400",
      },
    ],
    presets: [
      {
        name: "Laminar Acoustic Baseline",
        vector: [3.2, 12.4, 42.0, 3.05, 240],
        desc: "Stable hydrodynamic lubrication, normal kurtosis (3.05), negligible resonance.",
        type: "optimal",
      },
      {
        name: "Roller Spalling Micro-fatigue",
        vector: [14.8, 28.5, 68.0, 6.20, 780],
        desc: "Elevated kurtosis ratio (6.2) indicating spalling fatigue on outer raceway.",
        type: "warning",
      },
      {
        name: "Hydrodynamic Cavitation Burst",
        vector: [26.4, 34.0, 96.5, 7.80, 1850],
        desc: "Severe acoustic emission surge (>96dB) and sub-harmonic fluid oscillation.",
        type: "critical",
      },
      {
        name: "Gearbox Tooth Impact Fracture",
        vector: [44.0, 39.2, 105.0, 9.40, 2300],
        desc: "Extreme shock pulse impacts exceeding safe threshold limits.",
        type: "critical",
      },
    ],
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
    inputShape: "[Batch, 5] (Freq, THD, Power Factor, Phase, Reactive)",
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
    featureSchema: [
      {
        name: "Grid Synchronous Frequency",
        unit: "Hz",
        min: 45.0,
        max: 65.0,
        step: 0.05,
        nominal: [49.8, 50.2],
        defaultValue: 50.01,
        icon: "Waves",
        color: "text-cyan-400",
      },
      {
        name: "Total Harmonic Distortion (THD)",
        unit: "%",
        min: 0.0,
        max: 25.0,
        step: 0.1,
        nominal: [0.5, 3.5],
        defaultValue: 1.8,
        icon: "Activity",
        color: "text-rose-400",
      },
      {
        name: "Active Power Factor",
        unit: "cos φ",
        min: 0.50,
        max: 1.00,
        step: 0.01,
        nominal: [0.92, 0.99],
        defaultValue: 0.96,
        icon: "Zap",
        color: "text-emerald-400",
      },
      {
        name: "3-Phase Angle Imbalance",
        unit: "deg",
        min: 0.0,
        max: 15.0,
        step: 0.1,
        nominal: [0.1, 1.5],
        defaultValue: 0.4,
        icon: "Compass",
        color: "text-indigo-400",
      },
      {
        name: "Reactive Power Surcharge",
        unit: "kVAR",
        min: 0,
        max: 150,
        step: 1,
        nominal: [5, 35],
        defaultValue: 18.5,
        icon: "TrendingUp",
        color: "text-purple-400",
      },
    ],
    presets: [
      {
        name: "Balanced Grid Nominal",
        vector: [50.01, 1.8, 0.96, 0.4, 18.5],
        desc: "Optimal 50.0Hz synchronization, high power factor, minimal harmonic distortion.",
        type: "optimal",
      },
      {
        name: "5th/7th Harmonic Inverter Spill",
        vector: [50.15, 14.2, 0.81, 7.8, 64.0],
        desc: "High non-linear inverter pollution (%THD = 14.2%) with noticeable phase skew.",
        type: "warning",
      },
      {
        name: "Sub-Synchronous Islanding Sag",
        vector: [47.80, 8.4, 0.72, 4.2, 118.0],
        desc: "Sudden frequency droop (47.8Hz) triggering emergency reactive power surge.",
        type: "critical",
      },
      {
        name: "Capacitor Bank Arc Fault",
        vector: [52.60, 21.0, 0.55, 12.4, 145.0],
        desc: "Catastrophic power factor collapse and severe harmonic overvoltage.",
        type: "critical",
      },
    ],
    createdAt: "2026-10-16T18:40:00Z",
  },
};

export function getAllStoredModelMetadata() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...DEFAULT_MODELS };
    const parsed = JSON.parse(raw);
    
    // Merge while preserving fresh featureSchema and presets from DEFAULT_MODELS
    const merged = { ...DEFAULT_MODELS };
    for (const [id, m] of Object.entries(parsed)) {
      merged[id] = {
        ...(DEFAULT_MODELS[id] || {}),
        ...m,
        featureSchema: (DEFAULT_MODELS[id] && DEFAULT_MODELS[id].featureSchema) || m.featureSchema,
        presets: (DEFAULT_MODELS[id] && DEFAULT_MODELS[id].presets) || m.presets,
      };
    }
    return merged;
  } catch {
    return { ...DEFAULT_MODELS };
  }
}

export function getModelMetadata(modelId) {
  const all = getAllStoredModelMetadata();
  const idStr = String(modelId);
  if (idStr && all[idStr]) {
    return all[idStr];
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
      featureSchema: DEFAULT_MODELS[1].featureSchema,
      presets: DEFAULT_MODELS[1].presets,
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
