# SPDX-License-Identifier: AGPL-3.0-only
import pytest
from fastapi.testclient import TestClient
from pytest import MonkeyPatch

from better_map.api.app import app
from better_map.models.callsign import CallsignQuery
from better_map.models.wspr import ActivityLookupResult
from better_map.services.wspr_live import (
    WsprProviderError,
    WsprProviderInvalidData,
    WsprProviderRateLimited,
    WsprProviderTimeout,
)


class FakeProvider:
    async def fetch_activity(self, query: object) -> ActivityLookupResult:
        callsign = query.callsign if isinstance(query, CallsignQuery) else ""
        window_hours = query.window_hours if isinstance(query, CallsignQuery) else 240
        return ActivityLookupResult(
            callsign=callsign or "",
            window_hours=window_hours,
            count=0,
            truncated=False,
        )


class TimeoutProvider:
    async def fetch_activity(self, query: object) -> ActivityLookupResult:
        raise WsprProviderTimeout("timeout")


class RateLimitProvider:
    async def fetch_activity(self, query: object) -> ActivityLookupResult:
        raise WsprProviderRateLimited("rate limited")


class InvalidDataProvider:
    async def fetch_activity(self, query: object) -> ActivityLookupResult:
        raise WsprProviderInvalidData("invalid")


class UnavailableProvider:
    async def fetch_activity(self, query: object) -> ActivityLookupResult:
        raise WsprProviderError("unavailable")


def test_activity_endpoint_returns_lookup(monkeypatch: MonkeyPatch) -> None:
    monkeypatch.setattr("better_map.api.wspr.WsprLiveProvider", lambda: FakeProvider())

    response = TestClient(app).get("/api/wspr/activity?callsign=vk2djj")

    assert response.status_code == 200
    assert response.json()["callsign"] == "VK2DJJ"


def test_activity_endpoint_accepts_custom_window_hours(monkeypatch: MonkeyPatch) -> None:
    monkeypatch.setattr("better_map.api.wspr.WsprLiveProvider", lambda: FakeProvider())

    response = TestClient(app).get("/api/wspr/activity?callsign=vk2djj&window_hours=6")

    assert response.status_code == 200
    assert response.json()["window_hours"] == 6


def test_activity_endpoint_returns_general_lookup_without_callsign(
    monkeypatch: MonkeyPatch,
) -> None:
    monkeypatch.setattr("better_map.api.wspr.WsprLiveProvider", lambda: FakeProvider())

    response = TestClient(app).get("/api/wspr/activity")

    assert response.status_code == 200
    assert response.json()["callsign"] == ""


def test_activity_endpoint_rejects_invalid_callsign() -> None:
    response = TestClient(app).get("/api/wspr/activity?callsign=bad callsign")

    assert response.status_code == 400
    assert response.json()["detail"]["code"] == "invalid_request"


def test_activity_endpoint_rejects_invalid_window_hours() -> None:
    response = TestClient(app).get("/api/wspr/activity?window_hours=0")

    assert response.status_code == 400
    assert response.json()["detail"]["code"] == "invalid_request"


@pytest.mark.parametrize(
    ("provider", "status_code", "code"),
    [
        (TimeoutProvider, 504, "provider_timeout"),
        (RateLimitProvider, 429, "provider_rate_limited"),
        (InvalidDataProvider, 502, "provider_invalid_data"),
        (UnavailableProvider, 502, "provider_unavailable"),
    ],
)
def test_activity_endpoint_maps_provider_errors(
    monkeypatch: MonkeyPatch, provider: type[object], status_code: int, code: str
) -> None:
    monkeypatch.setattr("better_map.api.wspr.WsprLiveProvider", provider)

    response = TestClient(app).get("/api/wspr/activity?callsign=VK2DJJ")

    assert response.status_code == status_code
    assert response.json()["detail"]["code"] == code
