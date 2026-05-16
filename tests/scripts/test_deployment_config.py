import json
import tomllib
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]


def test_nixpacks_uses_railway_supported_node_package() -> None:
    config = tomllib.loads((ROOT / "nixpacks.toml").read_text())

    assert config["phases"]["setup"]["nixPkgs"] == [
        "python311",
        "nodejs_20",
    ]
    assert "python -m pip install uv" in config["phases"]["install"]["cmds"][0]
    assert "python -m uv sync --frozen" in config["phases"]["install"]["cmds"][0]


def test_railway_start_command_uses_dynamic_port() -> None:
    config = json.loads((ROOT / "railway.json").read_text())
    start_command = config["deploy"]["startCommand"]

    assert "${PORT:-8112}" in start_command
    assert ".venv/bin/uvicorn" in start_command
    assert "better_map.api.app:app" in start_command
