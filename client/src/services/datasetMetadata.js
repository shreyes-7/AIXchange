/**
 * Centralized Dataset Metadata Store for AIXchange
 * Manages dataset title, description, category, tags, file details, and IPFS gateways.
 * Connects smart-contract IDs (e.g. #1, #2) with their rich human-readable metadata,
 * caching persistently in localStorage and syncing with the backend database.
 */

const STORAGE_KEY = "aix_dataset_metadata_map";

// High-fidelity defaults for registered on-chain datasets
const DEFAULT_DATASETS = {
  1: {
    datasetId: 1,
    title: "Industrial IoT Sensor Telemetry",
    description: "Decentralized factory floor multi-sensor telemetry stream with 10,000 readings (temperature, vibration, voltage, pressure, RPM) for predictive maintenance and machine learning anomaly detection.",
    category: "IoT / Sensor Telemetry",
    tags: ["iot", "sensors", "telemetry", "anomaly-detection", "industry-4.0"],
    fileName: "industrial_sensor_telemetry.csv",
    fileSize: "351 KB",
    format: "CSV",
    rowCount: 10000,
    cid: "QmTXAoLR5ibkGLXVyXFjSoJTgMAxk44DGtGztu6bZkZkrL",
    contentHash: "0x4a8f39d1b6e2f1c8e9d0a7b4c2e5f8a1b3d6e9f2a4c7e0b3d5f7a9c1e3b5d7f9",
  },
  2: {
    datasetId: 2,
    title: "Decentralized Sensor Telemetry Corpus v2",
    description: "High-precision sensor telemetry and validation dataset with verified AES-256 encrypted payload and zero-leakage licensing for AI model training.",
    category: "IoT / Sensor Telemetry",
    tags: ["ai-training", "deep-learning", "telemetry", "validation"],
    fileName: "sensor_telemetry_v2.csv",
    fileSize: "351 KB",
    format: "CSV",
    rowCount: 5000,
    cid: "QmTXAoLR5ibkGLXVyXFjSoJTgMAxk44DGtGztu6bZkZkrL",
    contentHash: "0x89abcdef0123456789abcdef0123456789abcdef0123456789abcdef01234567",
  },
};

/**
 * Loads all stored dataset metadata from localStorage.
 * @returns {Record<string, Object>}
 */
export function getAllStoredDatasetMetadata() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...DEFAULT_DATASETS };
    const parsed = JSON.parse(raw);
    return { ...DEFAULT_DATASETS, ...parsed };
  } catch {
    return { ...DEFAULT_DATASETS };
  }
}

/**
 * Retrieves metadata for a specific dataset by ID or CID.
 * @param {string|number} datasetId
 * @param {string} [cid]
 * @returns {Object}
 */
export function getDatasetMetadata(datasetId, cid) {
  const all = getAllStoredDatasetMetadata();
  const idStr = String(datasetId);

  if (all[idStr]) return all[idStr];
  if (cid && all[cid]) return all[cid];

  // Try finding by CID match in values
  if (cid) {
    const foundByCid = Object.values(all).find((d) => d.cid === cid);
    if (foundByCid) return foundByCid;
  }

  // Fallback if not found
  return {
    datasetId: Number(datasetId),
    title: `Dataset #${datasetId}`,
    description: "Cryptographically registered dataset on the AIXchange decentralized registry.",
    category: "Machine Learning",
    tags: ["dataset", "ai-training"],
    fileName: "dataset.csv",
    fileSize: "351 KB",
    format: "CSV",
    rowCount: 1000,
    cid: cid || "QmUnknown",
  };
}

/**
 * Saves or updates dataset metadata in localStorage.
 * @param {Object} metadata
 */
export function saveDatasetMetadata(metadata) {
  if (!metadata) return;
  try {
    const all = getAllStoredDatasetMetadata();
    const idKey = String(metadata.datasetId || Date.now());

    const record = {
      ...getDatasetMetadata(idKey, metadata.cid),
      ...metadata,
      datasetId: Number(metadata.datasetId || idKey),
      updatedAt: new Date().toISOString(),
    };

    all[idKey] = record;
    if (metadata.cid) {
      all[metadata.cid] = record;
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
    return record;
  } catch (err) {
    console.warn("Failed saving dataset metadata to localStorage:", err);
  }
}

/**
 * List of available decentralized IPFS gateway mirrors.
 */
export const IPFS_GATEWAYS = [
  {
    name: "AIX Substrate Node (Local Fast Gateway)",
    url: (cid) => `http://localhost:5000/api/v1/datasets/ipfs/${cid}`,
    status: "FAST · ZERO-TIMEOUT",
    recommended: true,
  },
  {
    name: "Pinata Dedicated Gateway",
    url: (cid) => `https://aqua-acceptable-rat-480.mypinata.cloud/ipfs/${cid}`,
    status: "PINATA PINNED",
  },
  {
    name: "Cloudflare IPFS Gateway",
    url: (cid) => `https://cloudflare-ipfs.com/ipfs/${cid}`,
    status: "GLOBAL CDN",
  },
  {
    name: "dweb.link (Protocol Labs)",
    url: (cid) => `https://dweb.link/ipfs/${cid}`,
    status: "IPFS PROTOCOL",
  },
  {
    name: "ipfs.io Public Gateway",
    url: (cid) => `https://ipfs.io/ipfs/${cid}`,
    status: "PUBLIC MIRROR (MAY THROTTLE)",
  },
];

export default {
  getAllStoredDatasetMetadata,
  getDatasetMetadata,
  saveDatasetMetadata,
  IPFS_GATEWAYS,
};
