import pytest
from fastapi.testclient import TestClient
from pytest import MonkeyPatch

from better_map.api.app import app
from better_map.models.wspr import ActivityLookupResult
from better_map.services.wspr_live import (
    WsprProviderError,
    WsprProviderInvalidData,
    WsprProviderRateLimited,
    WsprProviderTimeout,
)


class FakeProvider:
    async def fetch_activity(self, query: object) -> ActivityLookupResult:
        return ActivityLookupResult(callsign="VK2DJJ", count=0, truncated=False)


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


def test_activity_endpoint_rejects_invalid_callsign() -> None:
    response = TestClient(app).get("/api/wspr/activity?callsign=bad callsign")

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
