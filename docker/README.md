# AIXchange Docker & Storage Architecture (`docker/`)

The **AIXchange Docker & Storage Layer** provides containerized training execution isolation, security sandboxing, and decentralized storage integration for datasets and AI model weights.

---

## Table of Contents

1. [Architectural Overview](#architectural-overview)
2. [AI Sandbox Container (`docker-compose.sandbox.yml`)](#ai-sandbox-container-docker-composesandboxyml)
3. [Resource Constraints & Security Controls](#resource-constraints--security-controls)
4. [How to Launch the Docker Sandbox](#how-to-launch-the-docker-sandbox)
5. [Decentralized Storage & IPFS Architecture](#decentralized-storage--ipfs-architecture)
6. [Troubleshooting & FAQ](#troubleshooting--faq)

---

## Architectural Overview

Executing untrusted Python scripts or third-party neural network training loops on a host machine poses serious security risks (e.g. arbitrary code execution, filesystem tampering, and memory exhaustion).

AIXchange mitigates these risks using a **hardened container sandbox**:

```text
 ┌────────────────────────────────────────────────────────┐
 │           Docker Host / Windows Subsystem              │
 │                                                        │
 │  ┌──────────────────────────────────────────────────┐  │
 │  │        Container: aixchange-ai-sandbox           │  │
 │  │                                                  │  │
 │  │  • Unprivileged user: aixuser (UID 1000)         │  │
 │  │  • Port 8000: AI Execution REST API (FastAPI)    │  │
 │  │  • Port 8888: Isolated JupyterLab Server         │  │
 │  │  • Limits: 4.0 CPUs, 8192 MB RAM, 100 PIDs       │  │
 │  │  • Rootless tmpfs: 512 MB                        │  │
 │  │  • Host Isolation: no-new-privileges:true        │  │
 │  │  • Staged Volume: /workspace                     │  │
 │  └──────────────────────────────────────────────────┘  │
 └────────────────────────────────────────────────────────┘
```

---

## AI Sandbox Container (`docker-compose.sandbox.yml`)

The configuration file is located at `docker/docker-compose.sandbox.yml`:

```yaml
services:
  ai-sandbox:
    build:
      context: ../
      dockerfile: docker/sandbox/Dockerfile
    container_name: aixchange-ai-sandbox
    restart: unless-stopped
    ports:
      - "8000:8000"   # AI Execution REST API
      - "8888:8888"   # Isolated JupyterLab
    environment:
      - NODE_ENV=development
      - JUPYTER_PORT=8888
      - JUPYTER_TOKEN=aixchange_sandbox_token
      - AI_SERVICE_PORT=8000
      - WORKSPACE_DIR=/workspace
    deploy:
      resources:
        limits:
          cpus: '4.0'
          memory: 8192M
          pids: 100
        reservations:
          cpus: '1.0'
          memory: 2048M
    security_opt:
      - no-new-privileges:true
    tmpfs:
      - /tmp:rw,noexec,nosuid,size=512m
    networks:
      - sandbox-net

networks:
  sandbox-net:
    driver: bridge
```

---

## Resource Constraints & Security Controls

1. **No New Privileges (`no-new-privileges:true`)**: Prevents processes inside the container from gaining additional setuid/setgid privileges.
2. **Process Limit (`pids: 100`)**: Prevents fork bombs from exhausting host OS thread tables.
3. **Hard Memory Cap (`8192M`)**: Restricts RAM allocation to 8 GB. Any training loop exceeding this memory limit is terminated cleanly with Out-Of-Memory (OOM) error handling without impacting the host machine.
4. **Hard CPU Cap (`4.0 cpus`)**: Prevents rogue compute loops from starving host system resources.
5. **Noexec Tmpfs**: Mounts `/tmp` with `noexec` and `nosuid` flags, blocking unauthorized binary execution from temporary directories.

---

## How to Launch the Docker Sandbox

### Starting the Container

To start the isolated container environment via the root npm script:

```powershell
# Working Directory: D:\AIXchange (Workspace Root)
npm run sandbox:docker
```

Under the hood, this executes:
```powershell
docker compose -f docker/docker-compose.sandbox.yml up -d
```

### Checking Container Health

```powershell
docker ps --filter "name=aixchange-ai-sandbox"
```

### Viewing Container Logs

```powershell
docker logs -f aixchange-ai-sandbox
```

### Stopping the Sandbox

```powershell
docker compose -f docker/docker-compose.sandbox.yml down
```

> **Local vs. Docker Note:** For local development, running `npm run sandbox:jupyter` (Terminal 5) runs Jupyter directly via the Python virtual environment on port `8888`. Using Docker is optional for local UI development but recommended when executing untrusted multi-epoch training jobs.

---

## Decentralized Storage & IPFS Architecture

AIXchange implements a hybrid decentralized storage strategy:

1. **Off-Chain Binary Decoupling**: Dataset files (CSV, Parquet, Safetensors) are uploaded by users and encrypted locally with AES-256-GCM symmetric encryption using `DATASET_ENCRYPTION_KEY`.
2. **IPFS Pinning via Pinata**: Encrypted archives are pinned to the IPFS network via Pinata's REST API (`PINATA_API_URL`).
3. **On-Chain CID Anchoring**: The returned IPFS Content Identifier (CID) is immutably anchored to the `DatasetRegistry.sol` smart contract on Ethereum.
4. **Decentralized Retrieval**: Authorized users who purchase a valid license receive decrypt credentials from the backend, allowing them to download the ciphertext via public gateways (`https://gateway.pinata.cloud/ipfs/{cid}` or `https://ipfs.io/ipfs/{cid}`).

---

## Troubleshooting & FAQ

### Issue: "Docker daemon is not running"
- **Cause**: Docker Desktop is not started on Windows.
- **Fix**: Launch **Docker Desktop** from the Windows Start menu and wait until the status indicator turns green before running `npm run sandbox:docker`.

### Issue: "Ports 8000 or 8888 already allocated"
- **Cause**: The local Python FastAPI server or a local Jupyter instance is already bound to ports 8000 or 8888.
- **Fix**: Either stop the local Python processes or stop the conflicting container.
