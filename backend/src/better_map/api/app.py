from fastapi import FastAPI

from better_map.api.wspr import router as wspr_router


def create_app() -> FastAPI:
    app = FastAPI(title="Better Map API")

    @app.get("/health")
    def health() -> dict[str, str]:
        return {"status": "ok"}

    app.include_router(wspr_router)

    return app


app = create_app()
