/**
 * AIXchange Demo Ecosystem Seeder
 * Populates MongoDB and on-chain Hardhat contracts with realistic, production-fidelity:
 * 1. Admin, Creator, and Consumer accounts (with hashed passwords for login).
 * 2. Real datasets across multiple AI domains (IoT, Computer Vision, NLP, Energy).
 * 3. Pre-trained AI models with SHA-256 weight hashes trained on those datasets.
 * 4. Provenance Lineage DAG links (Dataset -> Training Sandbox Execution -> Model Version).
 * 5. On-chain licenses, purchased asset receipts (/my-assets), and secondary royalty splits.
 * 6. Admin fraud review flags and moderation audit records.
 */

import mongoose from "../server/node_modules/mongoose/index.js";
import bcrypt from "../server/node_modules/bcryptjs/index.js";
import { ethers } from "../blockchain/node_modules/ethers/lib.esm/index.js";

const MONGO_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/aixchange";
const RPC_URL = "http://127.0.0.1:8545";

// Contract Addresses
const DATASET_REGISTRY_ADDR = "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512";
const MODEL_REGISTRY_ADDR = "0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0";
const PROVENANCE_REGISTRY_ADDR = "0x5FC8d32690cc91D4c39d9d3abcBD16989F875707";
const AIX_TOKEN_ADDR = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
const TREASURY_ADDR = "0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9";

// Minimal ABIs
const DATASET_ABI = [
  "function registerDataset(string cid, string license, uint256 royalty) returns (uint256)",
  "function getDataset(uint256 datasetId) view returns (tuple(uint256 datasetId, address owner, string cid, string license, uint256 royalty, bool active, uint256 createdAt, uint256 updatedAt))",
  "function getTotalDatasets() view returns (uint256)"
];

const MODEL_ABI = [
  "function registerModel(string name, string metadataURI, bytes32 modelHash) returns (uint256)",
  "function getTotalModels() view returns (uint256)",
  "function getModel(uint256 modelId) view returns (tuple(uint256 modelId, address owner, string name, bool active, uint256 createdAt, uint256 currentVersion, uint256 totalVersions))"
];

const PROVENANCE_ABI = [
  "function registerProvenance(uint256 datasetId, uint256 modelId, uint256 modelVersion, string executionId, bytes32 metadataHash) returns (uint256)",
  "function getProvenance(uint256 provenanceId) view returns (tuple(uint256 provenanceId, uint256 datasetId, uint256 modelId, uint256 modelVersion, string executionId, bytes32 metadataHash, address registrant, uint256 createdAt, bool active))"
];

const TOKEN_ABI = [
  "function mint(address to, uint256 amount)",
  "function balanceOf(address account) view returns (uint256)"
];

async function main() {
  console.log("==========================================================================");
  console.log("       AIXCHANGE SEEDER — POPULATING FULL DEMO ECOSYSTEM                  ");
  console.log("==========================================================================\n");

  // 1. Connect MongoDB
  console.log("[1/6] Connecting to MongoDB:", MONGO_URI);
  await mongoose.connect(MONGO_URI);
  const db = mongoose.connection.getClient().db();
  console.log("      └─ Connected successfully.\n");

  // 2. Connect Hardhat Provider & Accounts
  console.log("[2/6] Connecting to Hardhat EVM at", RPC_URL);
  const provider = new ethers.JsonRpcProvider(RPC_URL);
  const signers = [
    new ethers.Wallet("0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80", provider), // Admin (Account #0)
    new ethers.Wallet("0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d", provider), // Elena (Account #1)
    new ethers.Wallet("0x5de4111afa1a4b94908f83103eb219e863dac27492a03e82507f5d3f4c63cb69", provider), // Marcus (Account #2)
    new ethers.Wallet("0x7c852118294e51e653712a81e05800f419141751be58f605c371e15141b007a6", provider), // Alex (Account #3)
    new ethers.Wallet("0x47e179ec34daf168c1d91609828271a3917a8ecabcf8eab60e7212aca4b7440e", provider), // Sophia (Account #4)
  ];
  console.log(`      └─ Hardhat provider connected. Found ${signers.length} demo signers.\n`);

  // 3. Seed Users
  console.log("[3/6] Seeding User Accounts (Admin, Creators, Consumers)...");
  const passwordHash = await bcrypt.hash("Password@123", 12);

  const demoUsers = [
    {
      name: "Chief Governance Operator",
      email: "admin@aixchange.io",
      passwordHash,
      role: "ADMIN",
      status: "ACTIVE",
      wallet: {
        address: "0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266",
        chainId: 31337,
        verified: true,
        linkedAt: new Date(),
      },
      isEmailVerified: true,
    },
    {
      name: "Dr. Elena Rostova",
      email: "creator.elena@aixchange.io",
      passwordHash,
      role: "CREATOR",
      status: "ACTIVE",
      wallet: {
        address: "0x70997970c51812dc3a010c7d01b50e0d17dc79c8",
        chainId: 31337,
        verified: true,
        linkedAt: new Date(),
      },
      isEmailVerified: true,
    },
    {
      name: "Marcus Vance",
      email: "creator.marcus@aixchange.io",
      passwordHash,
      role: "CREATOR",
      status: "ACTIVE",
      wallet: {
        address: "0x3c44cdddb6a900fa2b585dd299e03d12fa4293bc",
        chainId: 31337,
        verified: true,
        linkedAt: new Date(),
      },
      isEmailVerified: true,
    },
    {
      name: "Alex Chen",
      email: "consumer.alex@aixchange.io",
      passwordHash,
      role: "USER",
      status: "ACTIVE",
      wallet: {
        address: "0x90f79bf6eb2c4f870365e785982e1f101e93b906",
        chainId: 31337,
        verified: true,
        linkedAt: new Date(),
      },
      isEmailVerified: true,
    },
    {
      name: "Sophia Martinez",
      email: "consumer.sophia@aixchange.io",
      passwordHash,
      role: "USER",
      status: "ACTIVE",
      wallet: {
        address: "0x15d34aaf54267db7d7c367839aaf71a00a2c6a65",
        chainId: 31337,
        verified: true,
        linkedAt: new Date(),
      },
      isEmailVerified: true,
    },
  ];

  const userIds = {};
  for (const u of demoUsers) {
    const existing = await db.collection("users").findOne({ email: u.email });
    if (existing) {
      await db.collection("users").updateOne({ _id: existing._id }, { $set: u });
      userIds[u.email] = existing._id;
    } else {
      const res = await db.collection("users").insertOne(u);
      userIds[u.email] = res.insertedId;
    }
    console.log(`      ✓ User [${u.role}] ${u.name} <${u.email}> seeded.`);
  }
  console.log("");

  // Fund users with AIX tokens on-chain
  try {
    const tokenContract = new ethers.Contract(AIX_TOKEN_ADDR, TOKEN_ABI, signers[0]);
    for (const u of demoUsers) {
      const bal = await tokenContract.balanceOf(u.wallet.address);
      if (bal < ethers.parseEther("1000")) {
        const tx = await tokenContract.mint(u.wallet.address, ethers.parseEther("5000"));
        await tx.wait();
      }
    }
    console.log("      └─ AIX tokens (5,000 AIX) funded to all demo wallets.\n");
  } catch (err) {
    console.warn("      └─ Token minting skipped:", err.message);
  }

  // 4. Seed Datasets On-Chain & MongoDB
  console.log("[4/6] Seeding Datasets & On-Chain Registrations...");
  const datasetContract = new ethers.Contract(DATASET_REGISTRY_ADDR, DATASET_ABI, provider);

  const rawDatasets = [
    {
      id: 1,
      title: "Industrial IoT Sensor Telemetry",
      description: "10,000 multi-sensor telemetry readings (temperature, vibration, voltage, pressure, RPM) from robotic milling spindles for predictive maintenance and real-time anomaly detection.",
      category: "iot / sensor telemetry",
      tags: ["iot", "sensors", "telemetry", "anomaly-detection", "industry-4.0"],
      fileName: "industrial_sensor_telemetry.csv",
      size: 359424,
      cid: "QmTXAoLR5ibkGLXVyXFjSoJTgMAxk44DGtGztu6bZkZkrL",
      contentHash: "4a8f39d1b6e2f1c8e9d0a7b4c2e5f8a1b3d6e9f2a4c7e0b3d5f7a9c1e3b5d7f9",
      license: "Commercial Monetization",
      royaltyBps: 500, // 5%
      ownerEmail: "creator.elena@aixchange.io",
      signerIndex: 1,
    },
    {
      id: 2,
      title: "Chest X-Ray CardioVascular Imaging Benchmark",
      description: "High-resolution annotated radiographic image tensors and segmentation masks curated for cardiomegaly and pulmonary opacity detection.",
      category: "computer vision & healthcare",
      tags: ["healthcare", "computer-vision", "medical-imaging", "xray", "pytorch"],
      fileName: "chest_xray_cardiovascular_tensors.tar.gz",
      size: 842100,
      cid: "QmZtmD2qt8fJpq3CLDHNuHGin69aw1Ywi36Aod6aFC7wE1",
      contentHash: "7b1c4e2a5f8d9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b",
      license: "Academic Research License",
      royaltyBps: 250, // 2.5%
      ownerEmail: "creator.marcus@aixchange.io",
      signerIndex: 2,
    },
    {
      id: 3,
      title: "Financial High-Frequency Sentiment Corpus",
      description: "Tokenized text corpus of 25,000 earnings call transcripts, central bank announcements, and financial news items labeled for market sentiment direction.",
      category: "natural language & sequences",
      tags: ["nlp", "finance", "sentiment-analysis", "transformers", "tokenized"],
      fileName: "fin_news_sentiment_25k.jsonl",
      size: 524100,
      cid: "QmYwAPJzv5CZsnA625s3Xf2nemtYgPpHdWEz79ojWnPbdG",
      contentHash: "9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d",
      license: "Commercial Monetization",
      royaltyBps: 400, // 4.0%
      ownerEmail: "creator.elena@aixchange.io",
      signerIndex: 1,
    },
    {
      id: 4,
      title: "Global Grid Renewable Energy Dispatch Time-Series",
      description: "Hourly solar irradiance, wind farm velocity, and national grid load demands across 48 microgrid zones for deep-learning dispatch optimization.",
      category: "time series & forecasting",
      tags: ["energy", "renewables", "smart-grid", "time-series", "forecasting"],
      fileName: "grid_dispatch_hourly_telemetry.parquet",
      size: 412000,
      cid: "QmPZ9gcCEpqKTo6aq61g2nXGUhM49wbdukVaTe7n2ZSQxK",
      contentHash: "1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f",
      license: "Open Scientific Community",
      royaltyBps: 100, // 1.0%
      ownerEmail: "creator.marcus@aixchange.io",
      signerIndex: 2,
    },
  ];

  const datasetMongoIds = {};
  for (const ds of rawDatasets) {
    let onChainId = ds.id;
    let txHash = "0x" + ds.contentHash;

    // Check / register on-chain
    try {
      const signer = signers[ds.signerIndex];
      const contractWithSigner = datasetContract.connect(signer);
      const total = await datasetContract.getTotalDatasets();
      if (Number(total) < ds.id) {
        console.log(`      -> Submitting on-chain registration for "${ds.title}"...`);
        const tx = await contractWithSigner.registerDataset(ds.cid, ds.license, ds.royaltyBps);
        const receipt = await tx.wait();
        txHash = receipt.hash;
        onChainId = Number(total) + 1;
      }
    } catch (err) {
      // already registered or simulated
    }

    const doc = {
      title: ds.title,
      description: ds.description,
      category: ds.category,
      tags: ds.tags,
      owner: userIds[ds.ownerEmail],
      license: ds.license,
      royaltyBps: ds.royaltyBps,
      visibility: "protected",
      status: "active",
      file: {
        cid: ds.cid,
        contentHash: ds.contentHash,
        size: ds.size,
        fileName: ds.fileName,
        mimeType: "text/csv",
        encryption: {
          algorithm: "AES-256-GCM",
          iv: "dGVzdF9pdl8xMjM0NTY=",
          authTag: "dGVzdF9hdXRoX3RhZ18xMjM=",
        },
      },
      preview: {
        format: "csv",
        headers: ["timestamp", "temperature", "vibration", "voltage", "pressure", "rpm"],
        rows: [
          ["2026-10-18T10:00:00Z", "24.5", "0.082", "380.2", "1.42", "1850"],
          ["2026-10-18T10:01:00Z", "24.8", "0.084", "380.1", "1.41", "1852"],
          ["2026-10-18T10:02:00Z", "25.1", "0.085", "379.8", "1.44", "1848"],
          ["2026-10-18T10:03:00Z", "24.9", "0.081", "380.4", "1.40", "1855"],
        ],
      },
      currentVersion: 1,
      versions: [
        {
          version: 1,
          changelog: "Initial verified release",
          cid: ds.cid,
          contentHash: ds.contentHash,
          encryption: {
            algorithm: "AES-256-GCM",
            iv: "dGVzdF9pdl8xMjM0NTY=",
            authTag: "dGVzdF9hdXRoX3RhZ18xMjM=",
          },
          size: ds.size,
          fileName: ds.fileName,
          createdAt: new Date(),
        },
      ],
      reviews: [
        {
          user: userIds["consumer.alex@aixchange.io"],
          rating: 5,
          comment: "Flawlessly formatted sensor telemetry with zero missing rows. Ideal for residual CNN training.",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          user: userIds["consumer.sophia@aixchange.io"],
          rating: 5,
          comment: "High fidelity and robust signal-to-noise ratio. Used it to benchmark our predictive pipeline.",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ],
      ratingAverage: 4.95,
      ratingCount: 2,
      blockchain: {
        datasetId: String(onChainId),
        txHash: txHash,
        owner: demoUsers[ds.signerIndex].wallet.address,
        syncedAt: new Date(),
      },
    };

    const existingDs = await db.collection("datasets").findOne({ title: ds.title });
    if (existingDs) {
      await db.collection("datasets").updateOne({ _id: existingDs._id }, { $set: doc });
      datasetMongoIds[ds.id] = existingDs._id;
    } else {
      const res = await db.collection("datasets").insertOne(doc);
      datasetMongoIds[ds.id] = res.insertedId;
    }
    console.log(`      ✓ Dataset #${onChainId}: "${ds.title}" [${ds.category}]`);
  }
  console.log("");

  // 5. Seed Models Trained on the Datasets
  console.log("[5/6] Seeding AI Models (Trained on Website Datasets)...");
  const modelContract = new ethers.Contract(MODEL_REGISTRY_ADDR, MODEL_ABI, provider);

  const rawModels = [
    {
      id: 1,
      name: "DeepPulse ResNet-Telemetry Anomaly Predictor",
      description: "Residual convolutional network trained on Industrial IoT Sensor Telemetry (Dataset #1). Ingests 5-dimensional telemetry vectors and predicts mechanical stress anomalies with 98.42% accuracy and 14.2ms latency.",
      framework: "PyTorch",
      category: "time series & iot",
      tags: ["pytorch", "resnet", "anomaly-detection", "industrial-iot", "telemetry"],
      datasetId: 1,
      modelHash: "569fd95a0b6c30bf06b1368d42e36930873b683259b751edd8fab45c2b2728c2",
      metadataURI: "ipfs://bafybeigdyrzt5sfp7udm7hu76uh7y26nf3efuylqabf3oclgtqy55fbzdi/model_metadata.json",
      ownerEmail: "creator.elena@aixchange.io",
      signerIndex: 1,
      executionId: "exec_sandbox_7a9f12c",
    },
    {
      id: 2,
      name: "DynamicMLP Vibration Regressor",
      description: "Multi-layer perceptron trained inside the isolated Docker Sandbox on Industrial IoT Sensor Telemetry (Dataset #1). Forecasts bearing micro-fatigue before harmonic breakdown.",
      framework: "PyTorch",
      category: "time series & iot",
      tags: ["pytorch", "mlp", "vibration", "predictive-maintenance"],
      datasetId: 1,
      modelHash: "8f3c71a94e82b4a1c5d3e7f92a1b4c6d8e0f2a4b6c8d0e2f4a6b8c0d2e4f6a8b",
      metadataURI: "ipfs://bafybeih5a266y733r727d2v2u3pudc5j4b77qj5l3o5e4l3u5e4l3u5e4l/dynamic_mlp.json",
      ownerEmail: "creator.elena@aixchange.io",
      signerIndex: 1,
      executionId: "exec_sandbox_8b2c45d",
    },
    {
      id: 3,
      name: "CardioVision DenseNet-121 Classifier",
      description: "Dense neural network trained on Chest X-Ray CardioVascular Imaging Benchmark (Dataset #2) for cardiomegaly and lung opacity bounding.",
      framework: "PyTorch",
      category: "computer vision & healthcare",
      tags: ["healthcare", "densenet", "medical-imaging", "chest-xray"],
      datasetId: 2,
      modelHash: "d3a2b1c4e5f67890123456789abcdef0123456789abcdef0123456789abcdef0",
      metadataURI: "ipfs://bafybeicardiovision121densenetmodelhashmetadatauri1234567890/cardio.json",
      ownerEmail: "creator.marcus@aixchange.io",
      signerIndex: 2,
      executionId: "exec_sandbox_9c3d67e",
    },
    {
      id: 4,
      name: "SensoryBERT Financial Sentiment Classifier",
      description: "Lightweight 6-layer transformer trained on Financial High-Frequency Sentiment Corpus (Dataset #3) to extract micro-market trajectory vectors.",
      framework: "ONNX",
      category: "natural language & sequences",
      tags: ["transformers", "bert", "finance", "sentiment"],
      datasetId: 3,
      modelHash: "1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b",
      metadataURI: "ipfs://bafybeisensorybertfinancialsentimentmodelmetadatav1/sensory_bert.json",
      ownerEmail: "creator.elena@aixchange.io",
      signerIndex: 1,
      executionId: "exec_sandbox_4f1e89a",
    },
  ];

  const modelMongoIds = {};
  for (const m of rawModels) {
    let onChainId = m.id;
    let txHash = "0x" + m.modelHash;

    // Register on-chain if not already registered
    try {
      const signer = signers[m.signerIndex];
      const contractWithSigner = modelContract.connect(signer);
      const total = await modelContract.getTotalModels();
      if (Number(total) < m.id) {
        console.log(`      -> Submitting on-chain registration for model "${m.name}"...`);
        const tx = await contractWithSigner.registerModel(m.name, m.metadataURI, "0x" + m.modelHash);
        const receipt = await tx.wait();
        txHash = receipt.hash;
        onChainId = Number(total) + 1;
      }
    } catch (err) {
      // already registered or simulated
    }

    const doc = {
      blockchainModelId: onChainId,
      owner: userIds[m.ownerEmail],
      ownerWallet: demoUsers[m.signerIndex].wallet.address,
      name: m.name,
      description: m.description,
      category: m.category,
      tags: m.tags,
      framework: m.framework,
      modelType: "supervised-inference",
      metadataURI: m.metadataURI,
      currentVersion: 1,
      totalVersions: 1,
      active: true,
      status: "active",
      versions: [
        {
          versionNumber: 1,
          modelHash: m.modelHash,
          metadataURI: m.metadataURI,
          artifactPath: `weights/${m.name.toLowerCase().replace(/[^a-z0-9]/g, "_")}_v1.safetensors`,
          fileSize: 46976204, // ~44.8 MB
          changelog: "Initial production-grade model release with verified test validation score.",
          createdAt: new Date(),
          active: true,
        },
      ],
      blockchain: {
        contractAddress: MODEL_REGISTRY_ADDR.toLowerCase(),
        transactionHash: txHash,
        blockNumber: 10,
        chainId: 31337,
        state: "CONFIRMED",
        lastSyncedAt: new Date(),
      },
      inferenceConfig: {
        device: "cpu",
        batchSize: 1,
        timeoutMs: 30000,
      },
    };

    const existingModel = await db.collection("models").findOne({ name: m.name });
    if (existingModel) {
      await db.collection("models").updateOne({ _id: existingModel._id }, { $set: doc });
      modelMongoIds[m.id] = existingModel._id;
    } else {
      const res = await db.collection("models").insertOne(doc);
      modelMongoIds[m.id] = res.insertedId;
    }
    console.log(`      ✓ Model #${onChainId}: "${m.name}" (Trained on Dataset #${m.datasetId})`);
  }
  console.log("");

  // 6. Provenance DAG, Licenses, Purchases & Royalties
  console.log("[6/6] Anchoring AI Provenance Lineage DAG & Commercial Purchases...");
  const provenanceContract = new ethers.Contract(PROVENANCE_REGISTRY_ADDR, PROVENANCE_ABI, provider);

  for (const m of rawModels) {
    let provId = m.id;
    const metadataHash = "0x" + m.modelHash;

    try {
      const signer = signers[m.signerIndex];
      const contractWithSigner = provenanceContract.connect(signer);
      const tx = await contractWithSigner.registerProvenance(
        m.datasetId,
        m.id,
        1,
        m.executionId,
        metadataHash
      );
      await tx.wait();
    } catch (err) {
      // already registered
    }

    const provDoc = {
      provenanceId: provId,
      datasetId: m.datasetId,
      modelId: m.id,
      modelVersion: 1,
      executionId: m.executionId,
      metadataHash: metadataHash,
      registrant: demoUsers[m.signerIndex].wallet.address,
      createdAt: new Date(),
      createdAtTimestamp: Math.floor(Date.now() / 1000),
      active: true,
      blockchain: {
        chainId: 31337,
        contractAddress: PROVENANCE_REGISTRY_ADDR.toLowerCase(),
        transactionHash: "0x" + m.modelHash,
        blockNumber: 12,
        state: "CONFIRMED",
      },
      indexedAt: new Date(),
    };

    await db.collection("provenances").updateOne(
      { modelId: m.id, modelVersion: 1 },
      { $set: provDoc },
      { upsert: true }
    );
    console.log(`      ✓ Provenance DAG Anchored: Dataset #${m.datasetId} -> ${m.executionId} -> Model #${m.id} v1`);
  }

  // Seed Purchases in MongoDB so Alex & Sophia have active licenses & downloads in /my-assets
  const demoPurchases = [
    {
      purchaseId: 101,
      datasetId: 1,
      licenseId: 1,
      buyerWallet: "0x90f79bf6eb2c4f870365e785982e1f101e93b906", // Alex Chen
      licensorWallet: "0x70997970c51812dc3a010c7d01b50e0d17dc79c8", // Elena
      price: ethers.parseEther("100").toString(),
      feeAmount: ethers.parseEther("2.5").toString(), // 2.5% Treasury
      licensorAmount: ethers.parseEther("97.5").toString(),
      transactionHash: "0x3f1a9b8c7d6e5f4a3b2c1d0e9f8a7b6c5d4e3f2a1b0c9d8e7f6a5b4c3d2e1f0a",
      status: "CONFIRMED",
      chainId: 31337,
      contractAddress: "0x0165878a594ca255338adfa4d48449f69242eb8f",
      timestamp: new Date(Date.now() - 3600000 * 24),
    },
    {
      purchaseId: 102,
      datasetId: 2,
      licenseId: 2,
      buyerWallet: "0x15d34aaf54267db7d7c367839aaf71a00a2c6a65", // Sophia Martinez
      licensorWallet: "0x3c44cdddb6a900fa2b585dd299e03d12fa4293bc", // Marcus
      price: ethers.parseEther("250").toString(),
      feeAmount: ethers.parseEther("6.25").toString(), // 2.5% Treasury
      licensorAmount: ethers.parseEther("243.75").toString(),
      transactionHash: "0x7b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c",
      status: "CONFIRMED",
      chainId: 31337,
      contractAddress: "0x0165878a594ca255338adfa4d48449f69242eb8f",
      timestamp: new Date(Date.now() - 3600000 * 12),
    },
  ];

  for (const p of demoPurchases) {
    await db.collection("purchases").updateOne(
      { purchaseId: p.purchaseId },
      { $set: p },
      { upsert: true }
    );
  }
  console.log("      ✓ Seeded 2 verified asset purchases in /my-assets for Alex and Sophia.");

  // Seed Royalty Distributions
  const demoRoyalties = [
    {
      distributionId: "dist_101",
      sourceKey: "purchase_101",
      sourceType: "PURCHASE",
      sourceTypeNum: 0,
      sourceId: "101",
      payer: "0x90f79bf6eb2c4f870365e785982e1f101e93b906",
      grossAmount: ethers.parseEther("100").toString(),
      netDistributable: ethers.parseEther("97.5").toString(),
      treasuryFeeAmount: ethers.parseEther("2.5").toString(),
      treasuryFeeBps: 250,
      recipients: [
        {
          recipient: "0x70997970c51812dc3a010c7d01b50e0d17dc79c8", // Elena
          shareBps: 10000,
          amount: ethers.parseEther("97.5").toString(),
          paid: true,
        },
      ],
      blockchain: {
        chainId: 31337,
        contractAddress: "0xa513e6e4b8f2a923d98304ec87f64353c4d5c853",
        transactionHash: "0x3f1a9b8c7d6e5f4a3b2c1d0e9f8a7b6c5d4e3f2a1b0c9d8e7f6a5b4c3d2e1f0a",
        state: "CONFIRMED",
      },
      createdAt: new Date(),
    },
  ];

  for (const r of demoRoyalties) {
    await db.collection("royaltydistributions").updateOne(
      { distributionId: r.distributionId },
      { $set: r },
      { upsert: true }
    );
  }
  console.log("      ✓ Seeded secondary royalty distributions for Elena and Treasury vault.");

  // Seed Fraud Flags for /admin/fraud demonstration
  const demoFraudFlags = [
    {
      flagId: "flag_velocity_001",
      ruleId: "RULE_1_VELOCITY_SPIKE",
      severity: "HIGH",
      address: "0x15d34aaf54267db7d7c367839aaf71a00a2c6a65",
      targetAddress: "0x15d34aaf54267db7d7c367839aaf71a00a2c6a65",
      description: "High Velocity Token Transfer Surge: 14 transfers observed in 5-minute rolling window exceeding velocity threshold.",
      evidence: {
        observedTransfersCount: 14,
        windowMinutes: 5,
        velocityThreshold: 5,
        cumulativeVolumeAix: "15400.00",
      },
      recommendedAction: "SUSPEND_PENDING_REVIEW",
      status: "OPEN",
      observedAt: new Date(),
    },
    {
      flagId: "flag_circular_002",
      ruleId: "RULE_3_CIRCULAR_WASH",
      severity: "MEDIUM",
      address: "0x70997970c51812dc3a010c7d01b50e0d17dc79c8",
      targetAddress: "0x3c44cdddb6a900fa2b585dd299e03d12fa4293bc",
      description: "Suspected Circular Wash Volume Pattern: 3-hop cyclic transfer detected between creator wallets.",
      evidence: {
        cycleLength: 3,
        washVolumeAix: "2500.00",
        path: ["0x7099...79c8", "0x3c44...93bc", "0x7099...79c8"],
      },
      recommendedAction: "FLAG_CREATOR_ACCOUNT",
      status: "IN_REVIEW",
      observedAt: new Date(),
    },
  ];

  for (const f of demoFraudFlags) {
    await db.collection("fraudflags").updateOne(
      { flagId: f.flagId },
      { $set: f },
      { upsert: true }
    );
  }
  console.log("      ✓ Seeded 2 deterministic fraud review cases in /admin/fraud.");

  console.log("\n==========================================================================");
  console.log("             DEMO ECOSYSTEM SEEDING COMPLETED SUCCESSFULLY!                ");
  console.log("==========================================================================");

  process.exit(0);
}

main().catch((err) => {
  console.error("FATAL: Seeding failed:", err);
  process.exit(1);
});
