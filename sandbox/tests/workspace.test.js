import test from "node:test";
import assert from "node:assert/strict";
import path from "node:path";
import fs from "node:fs";
import fsp from "node:fs/promises";
import os from "node:os";

import {
    WorkspaceLayout,
    sanitizeExecutionId,
    validateContainedPath,
    stageWorkspaceFiles,
    getWorkspaceDestinationForCategory,
} from "../src/workspace.js";
import { FileCategory } from "../src/types.js";

test("WorkspaceLayout generates complete directory hierarchy paths", () => {
    const root = path.resolve("./test_workspace/exec_123");
    const layout = new WorkspaceLayout(root);

    assert.equal(layout.root, root);
    assert.equal(layout.input, path.join(root, "input"));
    assert.equal(layout.code, path.join(root, "code"));
    assert.equal(layout.data, path.join(root, "data"));
    assert.equal(layout.output, path.join(root, "output"));
    assert.equal(layout.checkpoints, path.join(root, "checkpoints"));
    assert.equal(layout.logs, path.join(root, "logs"));
});

test("sanitizeExecutionId accepts valid IDs and rejects unsafe inputs", () => {
    assert.equal(sanitizeExecutionId("exec_123"), "exec_123");
    assert.equal(sanitizeExecutionId("exec-abc_456"), "exec-abc_456");

    assert.throws(() => sanitizeExecutionId(""), /Invalid execution ID/);
    assert.throws(() => sanitizeExecutionId("../dangerous"), /Invalid execution ID format/);
    assert.throws(() => sanitizeExecutionId("exec/123"), /Invalid execution ID format/);
    assert.throws(() => sanitizeExecutionId("exec\\123"), /Invalid execution ID format/);
    assert.throws(() => sanitizeExecutionId("exec 123"), /Invalid execution ID format/);
});

test("validateContainedPath strictly blocks path traversal escapes", () => {
    const baseDir = path.resolve("./workspace_base");

    // Valid nested path
    const valid = validateContainedPath(baseDir, "exec_001/input/train.csv");
    assert.equal(valid, path.join(baseDir, "exec_001", "input", "train.csv"));

    // Invalid path escaping baseDir
    assert.throws(
        () => validateContainedPath(baseDir, "../outside.txt"),
        /Path traversal attempt detected/
    );
    assert.throws(
        () => validateContainedPath(baseDir, "../../etc/passwd"),
        /Path traversal attempt detected/
    );
});

test("getWorkspaceDestinationForCategory routes to appropriate workspace directories", () => {
    const layout = new WorkspaceLayout("/workspace/exec_1");
    assert.equal(getWorkspaceDestinationForCategory(layout, FileCategory.CODE), layout.code);
    assert.equal(getWorkspaceDestinationForCategory(layout, FileCategory.DATA), layout.data);
    assert.equal(getWorkspaceDestinationForCategory(layout, FileCategory.CONFIG), layout.input);
    assert.equal(getWorkspaceDestinationForCategory(layout, FileCategory.NOTEBOOK), layout.input);
    assert.equal(getWorkspaceDestinationForCategory(layout, FileCategory.OTHER), layout.input);
});

test("stageWorkspaceFiles creates workspace and copies files to correct subdirectories", async () => {
    const tempDir = await fsp.mkdtemp(path.join(os.tmpdir(), "aix-stage-test-"));
    const serverStorageDir = path.join(tempDir, "server_uploads");
    const workspaceBaseDir = path.join(tempDir, "workspaces");
    await fsp.mkdir(serverStorageDir, { recursive: true });

    // Create mock uploaded files
    const codeFile = path.join(serverStorageDir, "train.py");
    const dataFile = path.join(serverStorageDir, "data.csv");
    const configFile = path.join(serverStorageDir, "hyperparams.json");

    await fsp.writeFile(codeFile, "print('training')", "utf-8");
    await fsp.writeFile(dataFile, "feat1,feat2,target\n1,2,0", "utf-8");
    await fsp.writeFile(configFile, '{"epochs": 5}', "utf-8");

    const filesToStage = [
        { storagePath: codeFile, originalName: "train.py", category: FileCategory.CODE },
        { storagePath: dataFile, originalName: "dataset.csv", category: FileCategory.DATA },
        { storagePath: configFile, originalName: "config.json", category: FileCategory.CONFIG },
    ];

    const { layout, stagedFiles } = await stageWorkspaceFiles("exec_stage_test", filesToStage, workspaceBaseDir);

    assert.equal(stagedFiles.length, 3);
    assert.ok(fs.existsSync(layout.code));
    assert.ok(fs.existsSync(layout.data));
    assert.ok(fs.existsSync(layout.input));

    // Verify files were placed in the right directory
    assert.ok(fs.existsSync(path.join(layout.code, "train.py")));
    assert.ok(fs.existsSync(path.join(layout.data, "dataset.csv")));
    assert.ok(fs.existsSync(path.join(layout.input, "config.json")));

    const stagedContent = await fsp.readFile(path.join(layout.code, "train.py"), "utf-8");
    assert.equal(stagedContent, "print('training')");

    // Cleanup
    await fsp.rm(tempDir, { recursive: true, force: true });
});
