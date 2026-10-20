# AIXchange Sandbox Client SDK (`@aixchange/sandbox`)

The **AIXchange Sandbox Client SDK** (`sandbox/`) provides the JavaScript/Node.js workspace management, path traversal containment, and HTTP integration layer connecting the backend server to the `python-services` execution substrate.

---

## Table of Contents

1. [Overview & Responsibilities](#overview--responsibilities)
2. [Responsibility Boundary](#responsibility-boundary)
3. [SDK Modules & Exports](#sdk-modules--exports)
4. [Installation & Integration](#installation--integration)
5. [Usage Example: Staging & Dispatching Training](#usage-example-staging--dispatching-training)
6. [Security & Path Traversal Prevention](#security--path-traversal-prevention)
7. [Automated Testing Suite](#automated-testing-suite)

---

## Overview & Responsibilities

The SDK coordinates all workspace staging operations before untrusted code is executed by the Python substrate:

- **State Modeling**: Enforces strongly typed lifecycle states (`PENDING`, `STAGING`, `TRAINING`, `COMPLETED`, `FAILED`, `CANCELLED`).
- **Filesystem Containment**: Implements `validateContainedPath` to block directory traversal attacks (e.g. `../../etc/passwd` or `..\Windows\System32`).
- **Workspace Staging**: Creates isolated directory layouts for input data, training scripts, checkpoints, model artifacts, and logs.
- **REST Client (`SandboxClient`)**: Communicates with the FastAPI execution server (`http://localhost:8000`) for training dispatch, execution cancellation, and model inference.

---

## Responsibility Boundary

| Subsystem | Folder | Core Responsibility |
| :--- | :--- | :--- |
| **Backend Server** | `server/` | User authentication, access validation, on-chain transaction matching, and MongoDB metadata persistence |
| **Sandbox SDK** | `sandbox/` | Node.js SDK, directory layout contracts, path sanitization, and execution HTTP client |
| **AI Substrate** | `python-services/`| PyTorch training loops, dynamic neural models, Safetensors export, and JupyterLab runtime |

---

## SDK Modules & Exports

The library is packaged as an ES module (`"type": "module"`) under `@aixchange/sandbox`:

- `SandboxClient`: HTTP client wrapper for the `python-services` execution contract.
- `WorkspaceLayout`: Object mapping standard paths (`input/`, `code/`, `checkpoints/`, `output/`, `logs/`).
- `stageWorkspaceFiles(executionId, files, baseDir)`: Asynchronously copies user-uploaded assets into the target workspace structure.
- `validateContainedPath(baseDir, targetPath)`: Canonicalizes filesystem paths and asserts that target paths do not escape the sandbox root.
- `ExecutionState`: Standardized execution state enumeration.

---

## Installation & Integration

The SDK is consumed internally by `server/`:

```powershell
# Working Directory: D:\AIXchange\sandbox
npm install
```

In `server/package.json`:
```json
"dependencies": {
  "@aixchange/sandbox": "file:../sandbox"
}
```

---

## Usage Example: Staging & Dispatching Training

```javascript
import {
    SandboxClient,
    WorkspaceLayout,
    stageWorkspaceFiles,
    ExecutionState
} from "@aixchange/sandbox";

// 1. Initialize HTTP Client
const client = new SandboxClient({
    baseUrl: process.env.AI_SERVICE_URL || "http://localhost:8000",
    timeoutMs: 30000,
});

// 2. Stage Uploaded Files Safely
const executionId = "exec_8f7b2a9e";
const uploadedFiles = [
    { storagePath: "uploads/data.csv", originalName: "data.csv", category: "data" },
    { storagePath: "uploads/train.py", originalName: "train.py", category: "code" },
];

const { layout, stagedFiles } = await stageWorkspaceFiles(
    executionId,
    uploadedFiles,
    "../python-services/workspace"
);

// 3. Dispatch Training Pipeline
const executionResponse = await client.train({
    execution_id: executionId,
    framework: "pytorch",
    model_spec: {
        input_dim: 16,
        output_dim: 2,
        hidden_dims: [64, 32],
        learning_rate: 0.001,
        epochs: 50,
    },
    dataset: {
        local_path: layout.inputDir,
        format: "csv",
    },
});

// 4. Poll Execution Status
const status = await client.getStatus(executionId);
console.log(`Execution status: ${status.state}`);
```

---

## Security & Path Traversal Prevention

The `validateContainedPath` utility resolves absolute canonical paths using `path.resolve` and verifies that the child path starts with the base workspace path. Any attempt to use dot-dot (`..`) segments to escape the execution container triggers a fatal validation exception before filesystem interaction occurs.

---

## Automated Testing Suite

The SDK includes 10 unit tests verifying path containment, workspace staging, and client mock responses:

```powershell
# Working Directory: D:\AIXchange\sandbox
npm test
```
