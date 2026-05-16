from fastapi.testclient import TestClient

from better_map.api.app import app, create_app


def test_health_endpoint_returns_ok() -> None:
    response = TestClient(app).get("/health")

    assert response.status_code == 200
    assert response.json() == {"status": "ok"}


def test_create_app_serves_frontend_when_dist_exists(tmp_path) -> None:  # type: ignore[no-untyped-def]
    (tmp_path / "index.html").write_text("<main>Better Map</main>")

    response = TestClient(create_app(static_dir=tmp_path)).get("/")

    assert response.status_code == 200
    assert "Better Map" in response.text


def test_create_app_keeps_api_available_without_frontend_dist(tmp_path) -> None:  # type: ignore[no-untyped-def]
    response = TestClient(create_app(static_dir=tmp_path / "missing")).get("/health")

    assert response.status_code == 200
