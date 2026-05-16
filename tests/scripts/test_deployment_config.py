import json
import tomllib
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]


def test_nixpacks_uses_railway_supported_setup_packages() -> None:
    config = tomllib.loads((ROOT / "nixpacks.toml").read_text())

    assert config["phases"]["setup"]["nixPkgs"] == [
        "python311",
        "curl",
    ]
    assert "nodejs_20" not in config["phases"]["setup"]["nixPkgs"]
    assert "node-v22.12.0-linux-x64.tar.gz" in config["phases"]["install"]["cmds"][0]
    assert "python -m pip" not in config["phases"]["install"]["cmds"][1]
    assert "https://astral.sh/uv/install.sh" in config["phases"]["install"]["cmds"][1]
    assert "~/.local/bin/uv sync --frozen" in config["phases"]["install"]["cmds"][1]
    assert "PATH=../.node/bin:$PATH ../.node/bin/npm ci" in config["phases"]["install"]["cmds"][2]
    assert "PATH=../.node/bin:$PATH ../.node/bin/npm run build" in config["phases"]["build"]["cmds"][0]


def test_railway_start_command_uses_dynamic_port() -> None:
    config = json.loads((ROOT / "railway.json").read_text())
    start_command = config["deploy"]["startCommand"]

    assert "${PORT:-8112}" in start_command
    assert ".venv/bin/uvicorn" in start_command
    assert "better_map.api.app:app" in start_command
