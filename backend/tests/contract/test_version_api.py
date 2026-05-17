import importlib

from fastapi.testclient import TestClient

from better_map.api.app import create_app, short_version_hash

app_module = importlib.import_module("better_map.api.app")


def test_version_endpoint_returns_short_hash(monkeypatch) -> None:  # type: ignore[no-untyped-def]
    monkeypatch.setenv("BETTER_MAP_VERSION", "abc1234")

    response = TestClient(create_app(static_dir=None)).get("/api/version")

    assert response.status_code == 200
    assert response.json() == {"short_hash": "abc1234"}


def test_short_version_hash_uses_git_when_env_missing(monkeypatch) -> None:  # type: ignore[no-untyped-def]
    monkeypatch.delenv("BETTER_MAP_VERSION", raising=False)
    monkeypatch.setattr(app_module.subprocess, "check_output", lambda *args, **kwargs: "def5678\n")

    assert short_version_hash() == "def5678"


def test_short_version_hash_falls_back_to_dev(monkeypatch) -> None:  # type: ignore[no-untyped-def]
    def raise_os_error(*args, **kwargs) -> str:  # type: ignore[no-untyped-def]
        raise OSError

    monkeypatch.delenv("BETTER_MAP_VERSION", raising=False)
    monkeypatch.setattr(app_module.subprocess, "check_output", raise_os_error)

    assert short_version_hash() == "dev"
