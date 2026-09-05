const { ethers } = require("ethers");

/**
 * Centralized configurable thresholds for Phase 12 Blockchain Monitoring & Fraud Detection
 */
const DEFAULT_MONITORING_CONFIG = {
    // 1. High-value transfer threshold (in AIX wei, default: 50,000 AIX)
    MAX_TRANSFER_THRESHOLD: ethers.parseEther("50000"),

    // 2. Rapid transaction frequency window (in milliseconds, default: 60 seconds)
    RAPID_TRANSACTION_WINDOW_MS: 60 * 1000,

    // 3. High-frequency transaction count threshold within window (default: 5 txs)
    HIGH_FREQUENCY_THRESHOLD: 5,

    // 4. Suspicious treasury outflow threshold (in token wei or ETH wei, default: 20,000 AIX or 5 ETH)
    SUSPICIOUS_TREASURY_TOKEN_OUTFLOW_THRESHOLD: ethers.parseEther("20000"),
    SUSPICIOUS_TREASURY_ETH_OUTFLOW_THRESHOLD: ethers.parseEther("5"),

    // 5. Unusual single royalty distribution amount threshold (default: 15,000 AIX)
    UNUSUAL_ROYALTY_THRESHOLD: ethers.parseEther("15000"),

    // 6. Threshold for repeated failed transactions from same address in window (default: 3)
    FAILED_TRANSACTION_THRESHOLD: 3,

    // 7. Maximum block query range per getLogs request
    MAX_BLOCK_RANGE: 2000,
};

module.exports = {
    DEFAULT_MONITORING_CONFIG,
};
