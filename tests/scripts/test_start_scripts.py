from pathlib import Path


ROOT = Path(__file__).resolve().parents[2]


def read_script(name: str) -> str:
    return (ROOT / "scripts" / name).read_text()


def test_backend_script_starts_uvicorn_from_repo_root() -> None:
    script = read_script("start-backend.sh")

    assert "PYTHONPATH=src uv run uvicorn better_map.api.app:app" in script
    assert "BACKEND_PORT" in script
    assert "8112" in script


def test_frontend_script_requires_cloudflared_and_stops_frontend_on_failure() -> None:
    script = read_script("start-frontend.sh")

    assert "command -v cloudflared" in script
    assert "5212" in script
    assert "kill \"$FRONTEND_PID\"" in script
    assert "kill \"$CLOUDFLARED_PID\"" in script
    assert "rm -f \"$TMP_LOG\"" in script
    assert "authentication is required or invalid" in script
    assert "tunnel startup failed" in script
    assert "no tunnel URL was discovered" in script
