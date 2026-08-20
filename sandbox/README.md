# AIXchange Sandbox SDK (`@aixchange/sandbox`)

The **AIXchange Sandbox SDK** provides a lightweight, modular integration and workspace management abstraction for the AI Execution Substrate.

## Purpose

- Define standard execution lifecycle states (`ExecutionState`), framework types, and schema constants.
- Provide `SandboxClient`, an HTTP client communicating with the `python-services` AI Execution Contract.
- Provide `WorkspaceLayout` and path containment validation (`validateContainedPath`) to prevent directory traversal escapes.
- Provide `stageWorkspaceFiles(...)` for copying and staging server-uploaded training code, datasets, and configurations into the target execution workspace hierarchy.

## Responsibility Boundary

| Subsystem | Boundary |
| :--- | :--- |
| `server/` | Application/backend orchestration, access validation, user auth, metadata persistence |
| `sandbox/` | SDK, workspace layout, path security, AI execution client |
| `python-services/` | PyTorch training loops, Docker isolation, Jupyter runtime, Safetensors export, inference |

## Usage Example

```javascript
import { SandboxClient, WorkspaceLayout, stageWorkspaceFiles, ExecutionState } from "@aixchange/sandbox";

// 1. Initialize Client
const client = new SandboxClient({
    baseUrl: "http://localhost:8000",
    timeoutMs: 30000,
});

// 2. Stage Uploaded Files
const { layout, stagedFiles } = await stageWorkspaceFiles(
    "exec_001",
    [{ storagePath: "/uploads/train.py", originalName: "train.py", category: "code" }],
    "./workspace"
);

// 3. Trigger Training
const response = await client.train({
    execution_id: "exec_001",
    framework: "pytorch",
    model_spec: { input_dim: 10, output_dim: 2, hidden_dims: [32] },
    dataset: { local_path: "input/data.csv", format: "csv" },
});

// 4. Poll Execution Status
const status = await client.getStatus("exec_001");
console.log(`Current status: ${status.state}`);
```

## Running Tests

```bash
cd sandbox
node --test tests/**/*.test.js
```
