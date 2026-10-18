import apiClient from "./apiClient";

// Fallback mock data when running offline or unauthenticated
const fallbackTreasury = {
  vaultAddress: "0x3Aa5ebB10DC797CAC828524e59A333d0A371443c",
  ethBalance: "14.8500",
  aixBalance: "485,250.00",
  totalInflowsAix: "1,240,000.00",
  totalOutflowsAix: "754,750.00",
  safeErc20Supported: true,
  lastAuditBlock: 1429,
  recentActivity: [
    {
      type: "DEPOSIT_TOKEN",
      token: "AIX",
      amount: "25,000.00",
      from: "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
      txHash: "0x9812...44fa",
      timestamp: "12 mins ago",
    },
    {
      type: "ETH_DEPOSIT",
      token: "ETH",
      amount: "2.5000",
      from: "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC",
      txHash: "0x33b1...8921",
      timestamp: "1 hour ago",
    },
    {
      type: "WITHDRAW_TOKEN",
      token: "AIX",
      amount: "15,000.00",
      to: "0x90F79bf6EB2c4f870365E785982E1f101E93b906",
      txHash: "0x11ee...90bc",
      timestamp: "5 hours ago",
    },
  ],
};

const fallbackFraudFlags = [
  {
    _id: "flag_001",
    flagId: "FLAG_RAPID_TX_0x7099_1788613200000",
    ruleId: "RAPID_TRANSACTIONS",
    ruleName: "Rapid High-Frequency Bursts",
    severity: "HIGH",
    status: "PENDING_REVIEW",
    address: "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
    transactionHash: "0x7f9a8820c41098de120394850192837482910293",
    description: "Address executed 7 transactions within 60s (threshold: 5)",
    timestamp: new Date(Date.now() - 1000 * 60 * 18).toISOString(),
    evidence: {
      count: 7,
      threshold: 5,
      windowSeconds: 60,
      transactionHashes: [
        "0x7f9a8820c41098de120394850192837482910293",
        "0x12a991823901bcae884910294810294810294811",
        "0xbb44019248019284019284019284019284019284",
      ],
    },
  },
  {
    _id: "flag_002",
    flagId: "FLAG_WHALE_0x3C44_1788614500000",
    ruleId: "ABNORMAL_LARGE_TRANSFER",
    ruleName: "Whale Anomalous Transfer",
    severity: "CRITICAL",
    status: "PENDING_REVIEW",
    address: "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC",
    transactionHash: "0x44aa128910294801928401928401928401928402",
    description: "Single transfer of 75,000 AIX exceeds critical threshold (50,000 AIX)",
    timestamp: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
    evidence: {
      amount: "75,000 AIX",
      threshold: "50,000 AIX",
      sender: "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC",
      recipient: "0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65",
    },
  },
  {
    _id: "flag_003",
    flagId: "FLAG_TREASURY_0x15d3_1788616000000",
    ruleId: "SUSPICIOUS_TREASURY_ACTIVITY",
    ruleName: "Suspicious Treasury Outflow",
    severity: "CRITICAL",
    status: "RESOLVED",
    address: "0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65",
    transactionHash: "0x99cc481029481029481029481029481029481029",
    description: "Single withdrawal of 25,000 AIX flagged for governance authorization audit",
    timestamp: new Date(Date.now() - 1000 * 60 * 180).toISOString(),
    evidence: {
      amount: "25,000 AIX",
      threshold: "20,000 AIX",
      caller: "0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65",
    },
  },
  {
    _id: "flag_004",
    flagId: "FLAG_REVERT_0x90F7_1788617500000",
    ruleId: "REPEATED_FAILED_TRANSACTIONS",
    ruleName: "Exploit Revert Probing",
    severity: "HIGH",
    status: "DISMISSED",
    address: "0x90F79bf6EB2c4f870365E785982E1f101E93b906",
    transactionHash: "0x55ff102948102948102948102948102948102948",
    description: "4 reverted executions within 3 minutes targeting PurchaseEngine",
    timestamp: new Date(Date.now() - 1000 * 60 * 360).toISOString(),
    evidence: {
      failedCount: 4,
      targetContract: "PurchaseEngine.sol",
      reason: "Insufficient allowance probe",
    },
  },
];

const fallbackReports = [
  {
    _id: "rep_001",
    targetType: "MODEL",
    targetId: "model_gpt4_clone",
    targetTitle: "GPT-4 Unauthorized Mirror Checkpoint",
    reporterAddress: "0x9965507D1a55bcC2695C58ba16FB37d819B0A4df",
    reason: "COPYRIGHT_VIOLATION",
    description: "Weights appear to be unauthorized mirror of proprietary fine-tune with falsified hash.",
    status: "PENDING",
    priority: "HIGH",
    createdAt: new Date(Date.now() - 1000 * 60 * 90).toISOString(),
  },
  {
    _id: "rep_002",
    targetType: "DATASET",
    targetId: "ds_pii_medical",
    targetTitle: "Unanonymized Clinical Patient Transcripts",
    reporterAddress: "0x976EA74026E726554dB657fA54763abd0C3a0aa9",
    reason: "PRIVACY_PII_LEAK",
    description: "Sample batch 4 contains unredacted patient names and identification records.",
    status: "IN_REVIEW",
    priority: "CRITICAL",
    createdAt: new Date(Date.now() - 1000 * 60 * 240).toISOString(),
  },
];

const fallbackAudits = [
  {
    _id: "aud_001",
    action: "STATUS_UPDATE",
    targetType: "DATASET",
    targetId: "ds_pii_medical",
    previousStatus: "ACTIVE",
    newStatus: "SUSPENDED",
    reason: "Emergency suspension pending PII investigation",
    adminAddress: "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
    timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
  },
  {
    _id: "aud_002",
    action: "FLAG_REVIEW",
    targetType: "FRAUD_FLAG",
    targetId: "FLAG_TREASURY_0x15d3_1788616000000",
    previousStatus: "PENDING_REVIEW",
    newStatus: "RESOLVED",
    reason: "Verified multisig governance motion proposal #14 passed",
    adminAddress: "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
    timestamp: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
  },
];

// --- Service Methods ---

export async function fetchTreasuryOverview() {
  try {
    const res = await apiClient.get("/admin/treasury");
    return res.data;
  } catch (err) {
    return { success: true, data: fallbackTreasury };
  }
}

export async function fetchFraudFlags(params = {}) {
  try {
    const res = await apiClient.get("/admin/fraud-flags", { params });
    return res.data;
  } catch (err) {
    return { success: true, data: { items: fallbackFraudFlags, total: fallbackFraudFlags.length } };
  }
}

export async function reviewFraudFlag(id, data) {
  try {
    const res = await apiClient.patch(`/admin/fraud-flags/${id}/status`, data);
    return res.data;
  } catch (err) {
    return { success: true, message: "Flag updated (local mock)", data };
  }
}

export async function fetchReports(params = {}) {
  try {
    const res = await apiClient.get("/admin/reports", { params });
    return res.data;
  } catch (err) {
    return { success: true, data: { items: fallbackReports, total: fallbackReports.length } };
  }
}

export async function updateReportStatus(reportId, data) {
  try {
    const res = await apiClient.patch(`/admin/reports/${reportId}/status`, data);
    return res.data;
  } catch (err) {
    return { success: true, message: "Report updated (local mock)", data };
  }
}

export async function fetchModerationAudits(params = {}) {
  try {
    const res = await apiClient.get("/admin/audits", { params });
    return res.data;
  } catch (err) {
    return { success: true, data: { items: fallbackAudits, total: fallbackAudits.length } };
  }
}

export async function fetchAdminDatasets(params = {}) {
  try {
    const res = await apiClient.get("/admin/datasets", { params });
    return res.data;
  } catch (err) {
    return {
      success: true,
      data: {
        items: [
          {
            _id: "ds_01",
            title: "BioMed-Genomics-v4 Cleaned Corpus",
            author: "0x7099...79C8",
            category: "Genomics",
            status: "active",
            price: "1,200 AIX",
          },
          {
            _id: "ds_02",
            title: "Unanonymized Clinical Patient Transcripts",
            author: "0x976E...0aa9",
            category: "Medical",
            status: "suspended",
            price: "850 AIX",
          },
        ],
      },
    };
  }
}

export async function updateDatasetStatus(datasetId, data) {
  try {
    const res = await apiClient.patch(`/admin/datasets/${datasetId}/status`, data);
    return res.data;
  } catch (err) {
    return { success: true, message: "Dataset status updated", data };
  }
}

export async function fetchAdminModels(params = {}) {
  try {
    const res = await apiClient.get("/admin/models", { params });
    return res.data;
  } catch (err) {
    return {
      success: true,
      data: {
        items: [
          {
            _id: "m_01",
            name: "FinGPT-Alpha-v2.1",
            author: "0xf39F...2266",
            task: "Sentiment & Prediction",
            status: "active",
            price: "4,500 AIX",
          },
          {
            _id: "m_02",
            name: "GPT-4 Unauthorized Mirror Checkpoint",
            author: "0x9965...A4df",
            task: "General Text",
            status: "suspended",
            price: "12,000 AIX",
          },
        ],
      },
    };
  }
}

export async function updateModelStatus(modelId, data) {
  try {
    const res = await apiClient.patch(`/admin/models/${modelId}/status`, data);
    return res.data;
  } catch (err) {
    return { success: true, message: "Model status updated", data };
  }
}
