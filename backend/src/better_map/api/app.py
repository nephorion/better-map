from pathlib import Path

from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles

from better_map.api.wspr import router as wspr_router


def create_app(static_dir: Path | None = None) -> FastAPI:
    app = FastAPI(title="Better Map API")

    @app.get("/health")
    def health() -> dict[str, str]:
        return {"status": "ok"}

    app.include_router(wspr_router)

    frontend_dist = static_dir or Path(__file__).resolve().parents[4] / "frontend" / "dist"
    if frontend_dist.exists():
        app.mount("/", StaticFiles(directory=frontend_dist, html=True), name="frontend")

    return app


app = create_app()
