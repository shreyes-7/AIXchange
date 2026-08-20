import test from "node:test";
import assert from "node:assert/strict";

import {
    SandboxClient,
    SandboxError,
    ConnectionError,
    AIExecutionError,
} from "../src/client.js";
import { ExecutionState } from "../src/types.js";

test("SandboxClient.train sends POST request and returns ExecutionResponse", async () => {
    let capturedUrl = "";
    let capturedOptions = null;

    const mockFetch = async (url, options) => {
        capturedUrl = url;
        capturedOptions = options;
        return {
            ok: true,
            status: 200,
            headers: new Headers({ "content-type": "application/json" }),
            json: async () => ({
                execution_id: "exec_001",
                state: ExecutionState.RUNNING,
                message: "Training started",
            }),
        };
    };

    const client = new SandboxClient({
        baseUrl: "http://mock-ai:8000",
        fetchImpl: mockFetch,
    });

    const config = {
        execution_id: "exec_001",
        framework: "pytorch",
        model_spec: { input_dim: 10, output_dim: 2, hidden_dims: [32] },
        dataset: { format: "csv" },
    };

    const response = await client.train(config);

    assert.equal(capturedUrl, "http://mock-ai:8000/api/v1/execution/train");
    assert.equal(capturedOptions.method, "POST");
    assert.equal(JSON.parse(capturedOptions.body).execution_id, "exec_001");
    assert.equal(response.execution_id, "exec_001");
    assert.equal(response.state, ExecutionState.RUNNING);
});

test("SandboxClient.getStatus retrieves execution status", async () => {
    const mockFetch = async (url) => {
        assert.equal(url, "http://mock-ai:8000/api/v1/execution/exec_999/status");
        return {
            ok: true,
            status: 200,
            headers: new Headers({ "content-type": "application/json" }),
            json: async () => ({
                execution_id: "exec_999",
                state: ExecutionState.COMPLETED,
                message: "Done",
                artifacts: {
                    artifact_path: "/workspace/exec_999/output/model.safetensors",
                },
            }),
        };
    };

    const client = new SandboxClient({
        baseUrl: "http://mock-ai:8000",
        fetchImpl: mockFetch,
    });

    const response = await client.getStatus("exec_999");
    assert.equal(response.state, ExecutionState.COMPLETED);
    assert.equal(response.artifacts.artifact_path, "/workspace/exec_999/output/model.safetensors");
});

test("SandboxClient handles AI service errors with AIExecutionError", async () => {
    const mockFetch = async () => ({
        ok: false,
        status: 422,
        headers: new Headers({ "content-type": "application/json" }),
        json: async () => ({
            detail: "Model spec input_dim must be positive",
        }),
    });

    const client = new SandboxClient({
        baseUrl: "http://mock-ai:8000",
        fetchImpl: mockFetch,
    });

    await assert.rejects(
        () => client.train({ execution_id: "exec_err" }),
        (err) => {
            assert.ok(err instanceof AIExecutionError);
            assert.equal(err.statusCode, 422);
            assert.ok(err.message.includes("Model spec input_dim"));
            return true;
        }
    );
});

test("SandboxClient wraps network connection drops in ConnectionError", async () => {
    const mockFetch = async () => {
        throw new Error("ECONNREFUSED");
    };

    const client = new SandboxClient({
        baseUrl: "http://unreachable:8000",
        fetchImpl: mockFetch,
    });

    await assert.rejects(
        () => client.getStatus("exec_unreachable"),
        (err) => {
            assert.ok(err instanceof ConnectionError);
            assert.equal(err.statusCode, 502);
            assert.ok(err.message.includes("Failed to connect"));
            return true;
        }
    );
});

test("SandboxClient Jupyter start, stop, and status lifecycle", async () => {
    const responses = {
        "/api/v1/execution/jupyter/start": { status: "RUNNING", port: "8888", token: "token123", url: "http://localhost:8888/lab" },
        "/api/v1/execution/jupyter/status": { status: "RUNNING", port: "8888", token: "token123", url: "http://localhost:8888/lab" },
        "/api/v1/execution/jupyter/stop": { stopped: true },
    };

    const mockFetch = async (url) => {
        const endpoint = url.replace("http://mock-ai:8000", "");
        return {
            ok: true,
            status: 200,
            headers: new Headers({ "content-type": "application/json" }),
            json: async () => responses[endpoint] || {},
        };
    };

    const client = new SandboxClient({
        baseUrl: "http://mock-ai:8000",
        fetchImpl: mockFetch,
    });

    const start = await client.startJupyter();
    assert.equal(start.status, "RUNNING");

    const status = await client.getJupyterStatus();
    assert.equal(status.port, "8888");

    const stop = await client.stopJupyter();
    assert.equal(stop.stopped, true);
});
