import os
import subprocess
from pathlib import Path

from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles

from better_map.api.wspr import router as wspr_router


def short_version_hash() -> str:
    for env_key in ("BETTER_MAP_VERSION", "RAILWAY_GIT_COMMIT_SHA", "RAILWAY_GIT_COMMIT"):
        env_hash = os.getenv(env_key)
        if env_hash:
            return env_hash.strip()[:12]
    try:
        return subprocess.check_output(
            ["git", "rev-parse", "--short", "HEAD"], text=True, stderr=subprocess.DEVNULL
        ).strip()
    except (OSError, subprocess.SubprocessError):
        return "dev"


def create_app(static_dir: Path | None = None) -> FastAPI:
    app = FastAPI(title="Better Map API")

    @app.get("/health")
    def health() -> dict[str, str]:
        return {"status": "ok"}

    @app.get("/api/version")
    def version() -> dict[str, str]:
        return {"short_hash": short_version_hash()}

    app.include_router(wspr_router)

    frontend_dist = static_dir or Path(__file__).resolve().parents[4] / "frontend" / "dist"
    if frontend_dist.exists():
        app.mount("/", StaticFiles(directory=frontend_dist, html=True), name="frontend")

    return app


app = create_app()
