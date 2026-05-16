from datetime import datetime

import httpx
import pytest
from pytest import MonkeyPatch

from better_map.models.callsign import CallsignQuery
from better_map.services.wspr_live import (
    WsprLiveProvider,
    WsprProviderError,
    WsprProviderInvalidData,
    WsprProviderRateLimited,
    WsprProviderTimeout,
)


class FakeResponse:
    def __init__(self, status_code: int, payload: object) -> None:
        self.status_code = status_code
        self._payload = payload

    def json(self) -> object:
        if isinstance(self._payload, Exception):
            raise self._payload
        return self._payload


class FakeClient:
    def __init__(self, response: FakeResponse | Exception, timeout: float) -> None:
        self.response = response
        self.timeout = timeout

    async def __aenter__(self) -> "FakeClient":
        return self

    async def __aexit__(self, *_args: object) -> None:
        return None

    async def get(self, _url: str) -> FakeResponse:
        if isinstance(self.response, Exception):
            raise self.response
        return self.response


def patch_client(monkeypatch: MonkeyPatch, response: FakeResponse | Exception) -> None:
    monkeypatch.setattr(
        httpx,
        "AsyncClient",
        lambda timeout: FakeClient(response, timeout),
    )


def row(identifier: str, tx_sign: str = "VK2DJJ", rx_sign: str = "VK3ABC") -> dict[str, object]:
    return {
        "id": identifier,
        "time": "2026-05-16T10:30:00+00:00",
        "band": 14,
        "rx_sign": rx_sign,
        "rx_lat": -37.8,
        "rx_lon": 144.9,
        "tx_sign": tx_sign,
        "tx_lat": -33.8,
        "tx_lon": 151.2,
        "distance": 713,
        "azimuth": 45,
        "frequency": 14095600,
        "power": 30,
        "snr": -18,
    }


@pytest.mark.asyncio
async def test_fetch_activity_maps_success(monkeypatch: MonkeyPatch) -> None:
    patch_client(monkeypatch, FakeResponse(200, {"data": [row("1")]}))

    result = await WsprLiveProvider().fetch_activity(CallsignQuery.parse("VK2DJJ"))

    assert result.count == 1
    assert result.features[0].geometry.coordinates == [[151.2, -33.8], [144.9, -37.8]]


@pytest.mark.asyncio
async def test_fetch_activity_handles_receiver_role(monkeypatch: MonkeyPatch) -> None:
    patch_client(monkeypatch, FakeResponse(200, {"data": [row("1", "VK3ABC", "VK2DJJ")]}))

    result = await WsprLiveProvider().fetch_activity(CallsignQuery.parse("VK2DJJ"))

    assert result.features[0].properties["role"] == "receiver"


@pytest.mark.asyncio
async def test_fetch_activity_handles_both_role_and_fallback_identifier(
    monkeypatch: MonkeyPatch,
) -> None:
    item = row("")
    item["id"] = None
    item["rx_sign"] = "VK2DJJ"
    patch_client(monkeypatch, FakeResponse(200, {"data": [item]}))

    result = await WsprLiveProvider().fetch_activity(CallsignQuery.parse("VK2DJJ"))

    assert result.features[0].properties["role"] == "both"
    assert result.features[0].id


@pytest.mark.asyncio
async def test_fetch_activity_deduplicates_and_truncates(monkeypatch: MonkeyPatch) -> None:
    rows = [row(str(index)) for index in range(1001)] + [row("1")]
    patch_client(monkeypatch, FakeResponse(200, {"data": rows}))

    result = await WsprLiveProvider().fetch_activity(CallsignQuery.parse("VK2DJJ"))

    assert result.count == 1000
    assert result.truncated is True


@pytest.mark.asyncio
async def test_fetch_activity_filters_invalid_coordinates(monkeypatch: MonkeyPatch) -> None:
    bad = row("1")
    bad["tx_lat"] = 999
    patch_client(monkeypatch, FakeResponse(200, {"data": [bad]}))

    result = await WsprLiveProvider().fetch_activity(CallsignQuery.parse("VK2DJJ"))

    assert result.count == 0


@pytest.mark.asyncio
async def test_fetch_activity_skips_rows_with_missing_coordinates(monkeypatch: MonkeyPatch) -> None:
    bad = row("1")
    del bad["tx_lat"]
    patch_client(monkeypatch, FakeResponse(200, {"data": [bad]}))

    result = await WsprLiveProvider().fetch_activity(CallsignQuery.parse("VK2DJJ"))

    assert result.count == 0


@pytest.mark.asyncio
async def test_fetch_activity_maps_http_errors(monkeypatch: MonkeyPatch) -> None:
    patch_client(monkeypatch, httpx.ConnectError("down"))

    with pytest.raises(WsprProviderError):
        await WsprLiveProvider().fetch_activity(CallsignQuery.parse("VK2DJJ"))


@pytest.mark.asyncio
async def test_fetch_activity_maps_provider_failures(monkeypatch: MonkeyPatch) -> None:
    patch_client(monkeypatch, FakeResponse(502, {}))

    with pytest.raises(WsprProviderError):
        await WsprLiveProvider().fetch_activity(CallsignQuery.parse("VK2DJJ"))


@pytest.mark.asyncio
async def test_fetch_activity_maps_rate_limit(monkeypatch: MonkeyPatch) -> None:
    patch_client(monkeypatch, FakeResponse(429, {}))

    with pytest.raises(WsprProviderRateLimited):
        await WsprLiveProvider().fetch_activity(CallsignQuery.parse("VK2DJJ"))


@pytest.mark.asyncio
async def test_fetch_activity_maps_timeout(monkeypatch: MonkeyPatch) -> None:
    patch_client(monkeypatch, httpx.TimeoutException("timeout"))

    with pytest.raises(WsprProviderTimeout):
        await WsprLiveProvider().fetch_activity(CallsignQuery.parse("VK2DJJ"))


@pytest.mark.asyncio
async def test_fetch_activity_maps_invalid_data(monkeypatch: MonkeyPatch) -> None:
    patch_client(monkeypatch, FakeResponse(200, {"wrong": []}))

    with pytest.raises(WsprProviderInvalidData):
        await WsprLiveProvider().fetch_activity(CallsignQuery.parse("VK2DJJ"))


@pytest.mark.asyncio
async def test_fetch_activity_maps_invalid_json(monkeypatch: MonkeyPatch) -> None:
    patch_client(monkeypatch, FakeResponse(200, ValueError("bad json")))

    with pytest.raises(WsprProviderInvalidData):
        await WsprLiveProvider().fetch_activity(CallsignQuery.parse("VK2DJJ"))


def test_parse_time_accepts_datetime() -> None:
    provider = WsprLiveProvider()
    value = datetime.fromisoformat("2026-05-16T10:30:00+00:00")

    assert provider._parse_time(value) is value
