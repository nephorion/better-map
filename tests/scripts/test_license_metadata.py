# SPDX-License-Identifier: AGPL-3.0-only

import json
import tomllib
from pathlib import Path


REPO_ROOT = Path(__file__).resolve().parents[2]
SPDX_IDENTIFIER = "AGPL-3.0-only"


def read_text(path: str) -> str:
    return (REPO_ROOT / path).read_text(encoding="utf-8")


def test_root_license_contains_agpl_v3_and_nephorion_copyright() -> None:
    license_text = read_text("LICENSE")

    assert "GNU AFFERO GENERAL PUBLIC LICENSE" in license_text
    assert "Version 3, 19 November 2007" in license_text
    assert "Copyright (C) 2026 Nephorion" in license_text
    assert "Remote Network Interaction" in license_text


def test_repository_license_metadata_uses_agpl_3_only() -> None:
    package_json = json.loads(read_text("frontend/package.json"))
    pyproject = tomllib.loads(read_text("backend/pyproject.toml"))
    readme = read_text("README.md")

    assert package_json["license"] == SPDX_IDENTIFIER
    assert pyproject["project"]["license"] == SPDX_IDENTIFIER
    assert "License-AGPL--3.0--only" in readme
    assert "](LICENSE)" in readme


def source_files() -> list[Path]:
    roots = [
        REPO_ROOT / ".specify",
        REPO_ROOT / "frontend",
        REPO_ROOT / "backend",
        REPO_ROOT / "tests",
        REPO_ROOT / "scripts",
    ]
    suffixes = {".css", ".js", ".ps1", ".py", ".sh", ".ts", ".tsx", ".yml"}
    ignored_parts = {".venv", "coverage", "dist", "node_modules"}
    return sorted(
        path
        for root in roots
        for path in root.rglob("*")
        if path.is_file() and path.suffix in suffixes and ignored_parts.isdisjoint(path.parts)
    )


def test_all_committed_source_files_have_spdx_headers() -> None:
    files = source_files()

    assert files
    for path in files:
        lines = path.read_text(encoding="utf-8").splitlines()
        first_content_line = lines[1] if lines and lines[0].startswith("#!") else lines[0]
        assert f"SPDX-License-Identifier: {SPDX_IDENTIFIER}" in first_content_line, path.relative_to(REPO_ROOT)
