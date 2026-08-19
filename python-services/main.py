from contextlib import asynccontextmanager
import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.core.jupyter import jupyter_manager
from app.api.execution import router as execution_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Lifespan context manager to auto-start JupyterLab inside the sandbox on boot."""
    try:
        jupyter_manager.start_server()
    except Exception:
        pass
    yield
    jupyter_manager.stop_server()


app = FastAPI(
    title=settings.app_name,
    version=settings.app_version,
    description="AI Execution Layer for AIXchange - Docker Sandbox, Training, Model Export, and Inference.",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan,
)

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount Execution Contract API
app.include_router(execution_router)


@app.get("/health", tags=["Health"])
def health_check():
    """Health check endpoint for the AI execution substrate."""
    return {
        "status": "healthy",
        "service": settings.app_name,
        "version": settings.app_version,
        "environment": settings.environment,
    }


if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host=settings.host,
        port=settings.port,
        reload=(settings.environment == "development"),
    )
