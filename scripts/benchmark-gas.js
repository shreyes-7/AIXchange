/**
 * Real On-Chain Gas Benchmark Script for Review III
 * Executes real transactions against Hardhat EVM (Chain 31337) and logs actual gas units used.
 * Output: docs/review-iii/metrics/gas-benchmarks.json
 */

import { ethers } from "../server/node_modules/ethers/lib.esm/index.js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const METRICS_DIR = path.join(ROOT, "docs", "review-iii", "metrics");

if (!fs.existsSync(METRICS_DIR)) {
  fs.mkdirSync(METRICS_DIR, { recursive: true });
}

const RPC_URL = process.env.RPC_URL || "http://127.0.0.1:8545";
const AIX_TOKEN_ADDRESS = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
const DATASET_REGISTRY_ADDRESS = "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512";
const MODEL_REGISTRY_ADDRESS = "0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0";
const PROVENANCE_REGISTRY_ADDRESS = "0x5FC8d32690cc91D4c39d9d3abcBD16989F875707";
const PURCHASE_ENGINE_ADDRESS = "0x0165878A594ca255338adfa4d48449f69242Eb8F";

async function runGasBenchmarks() {
  console.log("=================================================================");
  console.log("       AIXCHANGE REVIEW III - LIVE GAS BENCHMARK ENGINE           ");
  console.log("=================================================================\n");
  console.log(`Connecting to EVM Provider at ${RPC_URL}...`);

  const provider = new ethers.JsonRpcProvider(RPC_URL);
  const signer = await provider.getSigner(0);
  const user1 = await provider.getSigner(1);

  const benchmarks = [];

  // 1. AIX Token Transfer
  console.log("1. Benchmarking AIXToken.transfer()...");
  const tokenContract = new ethers.Contract(
    AIX_TOKEN_ADDRESS,
    [
      "function transfer(address to, uint256 amount) returns (bool)",
      "function approve(address spender, uint256 amount) returns (bool)",
    ],
    signer
  );

  const txTransfer = await tokenContract.transfer(user1.address, ethers.parseUnits("100", 18));
  const recTransfer = await txTransfer.wait();
  benchmarks.push({
    operation: "AIX Token Transfer",
    contract: "AIXToken.sol",
    address: AIX_TOKEN_ADDRESS,
    txHash: recTransfer.hash,
    gasUsed: Number(recTransfer.gasUsed),
    status: "CONFIRMED",
  });

  // 2. AIX Token Approve
  console.log("2. Benchmarking AIXToken.approve()...");
  const txApprove = await tokenContract.approve(PURCHASE_ENGINE_ADDRESS, ethers.parseUnits("1000", 18));
  const recApprove = await txApprove.wait();
  benchmarks.push({
    operation: "AIX Token Approval (PurchaseEngine)",
    contract: "AIXToken.sol",
    address: AIX_TOKEN_ADDRESS,
    txHash: recApprove.hash,
    gasUsed: Number(recApprove.gasUsed),
    status: "CONFIRMED",
  });

  // 3. Dataset Registration
  console.log("3. Benchmarking DatasetRegistry.registerDataset()...");
  const datasetContract = new ethers.Contract(
    DATASET_REGISTRY_ADDRESS,
    [
      "function registerDataset(string cid, string license, uint256 royalty) returns (uint256)",
      "function getDataset(uint256 datasetId) view returns (tuple(uint256 datasetId, address owner, string cid, string license, uint256 royalty, uint256 createdAt, bool active))",
    ],
    signer
  );

  const randomSuffix = Math.floor(Math.random() * 10000);
  const txDataset = await datasetContract.registerDataset(
    `QmBench${randomSuffix}TelemetryHash`,
    "Custom-Commercial",
    250 // 2.5% royalty in bps
  );
  const recDataset = await txDataset.wait();
  benchmarks.push({
    operation: "Dataset Registration (Encrypted CID)",
    contract: "DatasetRegistry.sol",
    address: DATASET_REGISTRY_ADDRESS,
    txHash: recDataset.hash,
    gasUsed: Number(recDataset.gasUsed),
    status: "CONFIRMED",
  });

  // 4. Model Registration
  console.log("4. Benchmarking ModelRegistry.registerModel()...");
  const modelContract = new ethers.Contract(
    MODEL_REGISTRY_ADDRESS,
    [
      "function registerModel(string name, string metadataURI, string modelHash) returns (uint256)",
      "function addModelVersion(uint256 modelId, string metadataURI, string modelHash) returns (uint256)",
    ],
    signer
  );

  const modelName = `ResNet-Benchmark-${randomSuffix}`;
  const txModel = await modelContract.registerModel(
    modelName,
    `ipfs://QmModel${randomSuffix}/meta.json`,
    "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855"
  );
  const recModel = await txModel.wait();

  // Find modelId from logs if possible, or fallback to 1
  let registeredModelId = 1;
  try {
    for (const log of recModel.logs) {
      if (log.topics && log.topics.length > 1) {
        registeredModelId = Number(BigInt(log.topics[1]));
        break;
      }
    }
  } catch {}

  benchmarks.push({
    operation: "Model Registration & Checksum Anchoring",
    contract: "ModelRegistry.sol",
    address: MODEL_REGISTRY_ADDRESS,
    txHash: recModel.hash,
    gasUsed: Number(recModel.gasUsed),
    status: "CONFIRMED",
  });

  // 5. Model Versioning
  console.log("5. Benchmarking ModelRegistry.addModelVersion()...");
  const txVersion = await modelContract.addModelVersion(
    registeredModelId,
    `ipfs://QmModel${randomSuffix}/v2.json`,
    "b94d27b9934d3e08a52e52d7da7dabfac484efe37a5380ee9088f7ace2efcde9"
  );
  const recVersion = await txVersion.wait();
  benchmarks.push({
    operation: "Model Version State Transition",
    contract: "ModelRegistry.sol",
    address: MODEL_REGISTRY_ADDRESS,
    txHash: recVersion.hash,
    gasUsed: Number(recVersion.gasUsed),
    status: "CONFIRMED",
  });

  // 6. Provenance Anchoring
  console.log("6. Benchmarking ProvenanceRegistry.registerProvenance()...");
  const provContract = new ethers.Contract(
    PROVENANCE_REGISTRY_ADDRESS,
    [
      "function registerProvenance(uint256 datasetId, uint256 modelId, uint256 modelVersion, string executionId, bytes32 metadataHash) returns (uint256)",
    ],
    signer
  );

  const txProv = await provContract.registerProvenance(
    1,
    registeredModelId,
    1,
    `exec_bench_${randomSuffix}`,
    ethers.keccak256(ethers.toUtf8Bytes("telemetry-training-metadata-" + randomSuffix))
  );
  const recProv = await txProv.wait();
  benchmarks.push({
    operation: "Lineage DAG Provenance Anchoring",
    contract: "ProvenanceRegistry.sol",
    address: PROVENANCE_REGISTRY_ADDRESS,
    txHash: recProv.hash,
    gasUsed: Number(recProv.gasUsed),
    status: "CONFIRMED",
  });

  // Summarize
  const totalGas = benchmarks.reduce((sum, b) => sum + b.gasUsed, 0);
  const averageGas = Math.round(totalGas / benchmarks.length);

  const results = {
    timestamp: new Date().toISOString(),
    network: {
      chainId: 31337,
      name: "Hardhat Localhost",
      rpc: RPC_URL,
    },
    summary: {
      totalOperationsTested: benchmarks.length,
      totalGasConsumed: totalGas,
      averageGasPerOperation: averageGas,
      gasPriceGwei: "1.0",
      estimatedCostEth: ethers.formatEther(BigInt(totalGas) * ethers.parseUnits("1", "gwei")),
    },
    benchmarks,
  };

  const outputPath = path.join(METRICS_DIR, "gas-benchmarks.json");
  fs.writeFileSync(outputPath, JSON.stringify(results, null, 2));

  console.log("\n=================================================================");
  console.log("BENCHMARK EXECUTION RESULTS (ACTUAL HARDHAT TRANSACTIONS):");
  benchmarks.forEach((b) => {
    console.log(`  - ${b.operation.padEnd(42)}: ${b.gasUsed.toLocaleString().padStart(8)} gas`);
  });
  console.log(`\nAverage Gas Per Transaction: ${averageGas.toLocaleString()} gas`);
  console.log(`Gas benchmark written to: ${outputPath}`);
  console.log("=================================================================\n");
}

runGasBenchmarks().catch((err) => {
  console.error("Gas benchmark execution failed:", err);
  process.exit(1);
});
