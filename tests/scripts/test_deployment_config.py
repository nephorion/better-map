from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]


def test_nixpacks_uses_railway_supported_node_package() -> None:
    config = (ROOT / "nixpacks.toml").read_text()

    assert "nodejs_20" in config
    assert "nodejs_22" not in config


def test_railway_start_command_uses_dynamic_port() -> None:
    config = (ROOT / "railway.json").read_text()

    assert "${PORT:-8112}" in config
    assert "better_map.api.app:app" in config
