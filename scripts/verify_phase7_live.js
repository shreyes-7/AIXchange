import assert from "node:assert/strict";
import path from "node:path";
import fs from "node:fs";
import fsp from "node:fs/promises";
import os from "node:os";

import {
    SandboxClient,
    WorkspaceLayout,
    stageWorkspaceFiles,
    ExecutionState,
    FrameworkType,
    OptimizerType,
    LossFunctionType,
} from "../sandbox/src/index.js";

async function runLiveVerification() {
    console.log("================================================================");
    console.log("  PHASE 7 REAL LIVE INTEGRATION VERIFICATION");
    console.log("================================================================");

    const client = new SandboxClient({
        baseUrl: "http://127.0.0.1:8000",
        timeoutMs: 15000,
    });

    // 1. Health Check
    console.log("\n[1/7] Testing AI Execution Substrate Health Check...");
    const isHealthy = await client.checkHealth();
    console.log("  Health response:", isHealthy);
    assert.equal(isHealthy, true);
    console.log("  -> PASS: FastAPI service is alive and healthy.");

    // 2. Workspace Provisioning & File Staging Handoff
    console.log("\n[2/7] Testing Workspace Provisioning & File Staging...");
    const executionId = `live_exec_${Date.now()}`;
    const workspaceRoot = path.resolve("./python-services/workspace");

    // Create temporary files to simulate uploaded user files
    const tempDir = await fsp.mkdtemp(path.join(os.tmpdir(), "aix-live-"));
    const dummyScript = path.join(tempDir, "user_train.py");
    const dummyDataset = path.join(tempDir, "dataset.csv");
    const dummyConfig = path.join(tempDir, "config.json");

    await fsp.writeFile(dummyScript, "# User training script\nimport torch\nprint('Running script')", "utf-8");
    await fsp.writeFile(dummyDataset, "feature1,feature2,target\n0.1,0.2,1\n0.3,0.4,0\n", "utf-8");
    await fsp.writeFile(dummyConfig, JSON.stringify({ batch_size: 16, lr: 0.001 }), "utf-8");

    const stagedFiles = [
        { storagePath: dummyScript, originalName: "user_train.py", category: "code" },
        { storagePath: dummyDataset, originalName: "dataset.csv", category: "data" },
        { storagePath: dummyConfig, originalName: "config.json", category: "config" },
    ];

    const stagingResult = await stageWorkspaceFiles(executionId, stagedFiles, workspaceRoot);
    console.log(`  Staged ${stagingResult.stagedFiles.length} files into workspace`);
    assert.equal(stagingResult.stagedFiles.length, 3);

    // Verify workspace file visibility on disk
    const layout = stagingResult.layout;
    assert.ok(fs.existsSync(path.join(layout.code, "user_train.py")), "code file exists");
    assert.ok(fs.existsSync(path.join(layout.data, "dataset.csv")), "data file exists");
    assert.ok(fs.existsSync(path.join(layout.input, "config.json")), "config file exists");
    assert.ok(fs.existsSync(layout.output), "output dir exists");
    assert.ok(fs.existsSync(layout.checkpoints), "checkpoints dir exists");
    assert.ok(fs.existsSync(layout.logs), "logs dir exists");
    console.log("  -> PASS: File handoff validated. Staged files are visible in partitioned workspace.");

    // 3. Dispatch Real Training Execution
    console.log("\n[3/7] Dispatching Real PyTorch Training Execution...");
    const trainingConfig = {
        execution_id: executionId,
        framework: FrameworkType.PYTORCH,
        model_spec: {
            model_type: "mlp",
            input_dim: 8,
            hidden_dims: [32, 16],
            output_dim: 2,
        },
        dataset: {
            dataset_id: 1,
            format: "csv",
            test_split_ratio: 0.2,
        },
        hyperparameters: {
            epochs: 5,
            batch_size: 16,
            learning_rate: 0.005,
            optimizer: OptimizerType.ADAM,
            loss_function: LossFunctionType.CROSS_ENTROPY,
        },
        resource_limits: {
            max_cpu_cores: 2.0,
            max_memory_mb: 2048,
            timeout_seconds: 60,
        },
    };

    const trainResponse = await client.train(trainingConfig);
    console.log("  Training Response State:", trainResponse.state);
    console.log("  Execution Message:", trainResponse.message);
    assert.equal(trainResponse.state, ExecutionState.COMPLETED);
    assert.equal(trainResponse.progress.current_epoch, 5);
    assert.equal(trainResponse.progress.total_epochs, 5);
    console.log(`  Best Val Loss: ${trainResponse.progress.best_val_loss?.toFixed(4)}, Best Val Acc: ${(trainResponse.progress.best_val_accuracy * 100).toFixed(2)}%`);
    console.log("  -> PASS: Real PyTorch training completed successfully.");

    // 4. Query Status & Verify Artifact Persistence
    console.log("\n[4/7] Polling Execution Status & Verifying On-Disk Artifacts...");
    const status = await client.getStatus(executionId);
    assert.equal(status.state, ExecutionState.COMPLETED);
    assert.ok(status.artifacts, "Artifacts returned in status");
    console.log("  Artifact Path:", status.artifacts.artifact_path);
    console.log("  Metadata Path:", status.artifacts.metadata_path);
    console.log("  Summary Path:", status.artifacts.summary_path);

    // Verify artifacts exist on disk and have non-zero size
    const artifactFullPath = path.resolve(status.artifacts.artifact_path);
    const metadataFullPath = path.resolve(status.artifacts.metadata_path);
    const summaryFullPath = path.resolve(status.artifacts.summary_path);

    assert.ok(fs.existsSync(artifactFullPath), "Safetensors artifact exists on disk");
    assert.ok(fs.existsSync(metadataFullPath), "Metadata file exists on disk");
    assert.ok(fs.existsSync(summaryFullPath), "Training summary exists on disk");

    const artifactStat = fs.statSync(artifactFullPath);
    assert.ok(artifactStat.size > 0, "Artifact size is > 0 bytes");
    console.log(`  Safetensors model size: ${artifactStat.size} bytes`);
    console.log("  -> PASS: Artifacts persisted and verified on disk.");

    // 5. Validate Model Artifact via AI Execution API
    console.log("\n[5/7] Validating Exported Model via /validate-model Endpoint...");
    const validationResult = await client.validateModel(
        status.artifacts.artifact_path,
        status.artifacts.metadata_path
    );
    console.log("  Validation Result:", JSON.stringify(validationResult));
    assert.equal(validationResult.is_valid, true);
    assert.equal(validationResult.checksum_verified, true);
    assert.equal(validationResult.load_test_passed, true);
    assert.equal(validationResult.inference_smoke_test_passed, true);
    assert.ok(validationResult.model_metadata.artifact_hash_sha256);
    console.log("  SHA-256 Checksum:", validationResult.model_metadata.artifact_hash_sha256);
    console.log("  -> PASS: Model artifact passed all cryptographic and forward-pass smoke tests.");

    // 6. Test JupyterLab Lifecycle & Workspace Isolation
    console.log("\n[6/7] Testing JupyterLab Lifecycle & Workspace Isolation...");
    const jupyterStart = await client.startJupyter();
    console.log("  Jupyter Start Response:", JSON.stringify(jupyterStart));
    assert.equal(jupyterStart.status, "RUNNING");
    assert.ok(jupyterStart.url.includes("token="));

    const jupyterStatus = await client.getJupyterStatus();
    console.log("  Jupyter Status Response:", JSON.stringify(jupyterStatus));
    assert.equal(jupyterStatus.status, "RUNNING");

    const jupyterStop = await client.stopJupyter();
    console.log("  Jupyter Stop Response:", JSON.stringify(jupyterStop));
    assert.equal(jupyterStop.stopped, true);
    console.log("  -> PASS: JupyterLab session managed cleanly.");

    // 7. Cleanup
    console.log("\n[7/7] Cleaning up temporary workspace files...");
    await fsp.rm(tempDir, { recursive: true, force: true });
    // Clean up created execution workspace
    if (fs.existsSync(layout.root)) {
        await fsp.rm(layout.root, { recursive: true, force: true });
    }
    console.log("  -> PASS: Temporary staging files and workspace cleaned up.");

    console.log("\n================================================================");
    console.log("  ALL PHASE 7 REAL LIVE INTEGRATION CHECKS PASSED!");
    console.log("================================================================");
}

runLiveVerification().catch((err) => {
    console.error("Verification failed:", err);
    process.exit(1);
});
