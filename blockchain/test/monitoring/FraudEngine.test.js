const { expect } = require("chai");
const { ethers } = require("hardhat");
const { FraudEngine } = require("../../monitoring/fraudEngine");

describe("Blockchain Fraud Detection — FraudEngine", function () {
    let fraudEngine;
    const baseConfig = {
        MAX_TRANSFER_THRESHOLD: ethers.parseEther("10000"), // 10,000 AIX
        HIGH_FREQUENCY_THRESHOLD: 4, // 4 txs
        RAPID_TRANSACTION_WINDOW_MS: 30000, // 30s
        SUSPICIOUS_TREASURY_TOKEN_OUTFLOW_THRESHOLD: ethers.parseEther("5000"),
        UNUSUAL_ROYALTY_THRESHOLD: ethers.parseEther("3000"),
        FAILED_TRANSACTION_THRESHOLD: 3,
    };

    beforeEach(function () {
        fraudEngine = new FraudEngine(baseConfig);
    });

    it("Should not flag normal, benign transaction activity", function () {
        const events = [
            {
                contractName: "AIXToken",
                eventName: "Transfer",
                amount: ethers.parseEther("100").toString(),
                from: "0x1111111111111111111111111111111111111111",
                to: "0x2222222222222222222222222222222222222222",
                transactionHash: "0xaaa1",
                timestamp: new Date("2026-09-06T10:00:00Z"),
            },
            {
                contractName: "PurchaseEngine",
                eventName: "DatasetPurchased",
                amount: ethers.parseEther("200").toString(),
                from: "0x1111111111111111111111111111111111111111",
                to: "0x3333333333333333333333333333333333333333",
                transactionHash: "0xaaa2",
                timestamp: new Date("2026-09-06T10:05:00Z"),
            },
        ];

        const flags = fraudEngine.analyze(events);
        expect(flags).to.be.an("array");
        expect(flags.length).to.equal(0);
    });

    it("Should flag abnormally large AIX token transfers with HIGH or CRITICAL severity", function () {
        const events = [
            {
                contractName: "AIXToken",
                eventName: "Transfer",
                amount: ethers.parseEther("15000").toString(), // exceeds 10,000 threshold
                from: "0x1111111111111111111111111111111111111111",
                to: "0x2222222222222222222222222222222222222222",
                transactionHash: "0xbbb1",
                timestamp: new Date("2026-09-06T10:00:00Z"),
            },
        ];

        const flags = fraudEngine.analyze(events);
        expect(flags.length).to.equal(1);
        expect(flags[0].ruleId).to.equal("ABNORMAL_LARGE_TRANSFER");
        expect(flags[0].severity).to.equal("HIGH");
        expect(flags[0].evidence.amountFormatted).to.equal("15000.0");
        expect(flags[0].transactionHash).to.equal("0xbbb1");
    });

    it("Should flag rapid high-frequency transaction bursts from a single wallet", function () {
        const address = "0x9999999999999999999999999999999999999999";
        const now = Date.now();

        // 5 transactions within 10 seconds (threshold is 4 in 30s)
        const events = [0, 2000, 4000, 6000, 8000].map((offset, idx) => ({
            contractName: "AIXToken",
            eventName: "Transfer",
            amount: ethers.parseEther("5").toString(),
            from: address,
            to: "0x8888888888888888888888888888888888888888",
            transactionHash: `0xtx${idx}`,
            timestamp: new Date(now + offset),
        }));

        const flags = fraudEngine.analyze(events);
        expect(flags.length).to.equal(1);
        expect(flags[0].ruleId).to.equal("RAPID_TRANSACTIONS");
        expect(flags[0].address).to.equal(address);
        expect(flags[0].evidence.count).to.equal(5);
        expect(flags[0].evidence.transactionHashes.length).to.equal(5);
    });

    it("Should flag suspicious treasury outflow exceeding safety threshold with CRITICAL severity", function () {
        const events = [
            {
                contractName: "Treasury",
                eventName: "TokenWithdrawn",
                amount: ethers.parseEther("8000").toString(), // threshold is 5,000
                to: "0x7777777777777777777777777777777777777777",
                transactionHash: "0xtreasuryoutflow1",
                timestamp: new Date(),
                arguments: { token: "0xaixToken" },
            },
        ];

        const flags = fraudEngine.analyze(events);
        expect(flags.length).to.equal(1);
        expect(flags[0].ruleId).to.equal("SUSPICIOUS_TREASURY_ACTIVITY");
        expect(flags[0].severity).to.equal("CRITICAL");
        expect(flags[0].evidence.amountFormatted).to.equal("8000.0");
    });

    it("Should flag unusual royalty distributions", function () {
        const events = [
            {
                contractName: "RoyaltyEngine",
                eventName: "RecipientPaid",
                amount: ethers.parseEther("5000").toString(), // threshold is 3,000
                to: "0x6666666666666666666666666666666666666666",
                transactionHash: "0xroyalty1",
                logIndex: 0,
                timestamp: new Date(),
                arguments: { distributionId: "42", shareBps: 8000 },
            },
        ];

        const flags = fraudEngine.analyze(events);
        expect(flags.length).to.equal(1);
        expect(flags[0].ruleId).to.equal("UNUSUAL_ROYALTY_PATTERN");
        expect(flags[0].severity).to.equal("MEDIUM");
        expect(flags[0].evidence.distributionId).to.equal("42");
    });

    it("Should flag repeated failed transaction probing attempts", function () {
        const attacker = "0xattacker111111111111111111111111111111111";
        const failedTxs = [
            { from: attacker, txHash: "0xfail1", timestamp: new Date() },
            { from: attacker, txHash: "0xfail2", timestamp: new Date() },
            { from: attacker, txHash: "0xfail3", timestamp: new Date() },
        ];

        const flags = fraudEngine.analyze([], failedTxs);
        expect(flags.length).to.equal(1);
        expect(flags[0].ruleId).to.equal("REPEATED_FAILED_TRANSACTIONS");
        expect(flags[0].severity).to.equal("HIGH");
        expect(flags[0].address).to.equal(attacker.toLowerCase());
        expect(flags[0].evidence.failureCount).to.equal(3);
    });

    it("Should evaluate multiple rules concurrently and remain deterministic", function () {
        const attacker = "0xbadactor";
        const events = [
            // Rule 1: Large transfer
            {
                contractName: "AIXToken",
                eventName: "Transfer",
                amount: ethers.parseEther("20000").toString(),
                from: attacker,
                to: "0xvictim",
                transactionHash: "0xmulti1",
                timestamp: new Date("2026-09-06T12:00:00Z"),
            },
            // Rule 3: Suspicious treasury outflow
            {
                contractName: "Treasury",
                eventName: "TokenWithdrawn",
                amount: ethers.parseEther("7000").toString(),
                to: attacker,
                transactionHash: "0xmulti2",
                timestamp: new Date("2026-09-06T12:01:00Z"),
            },
        ];

        const run1 = fraudEngine.analyze(events);
        const run2 = fraudEngine.analyze(events);

        expect(run1.length).to.equal(2);
        expect(run1.map((f) => f.ruleId)).to.include("ABNORMAL_LARGE_TRANSFER");
        expect(run1.map((f) => f.ruleId)).to.include("SUSPICIOUS_TREASURY_ACTIVITY");

        // Assert determinism
        expect(JSON.stringify(run1)).to.equal(JSON.stringify(run2));
    });
});
