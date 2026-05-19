# SPDX-License-Identifier: AGPL-3.0-only
from __future__ import annotations

import logging
from datetime import UTC, datetime
from typing import Any
from urllib.parse import quote_plus

import httpx

from better_map.models.callsign import CallsignQuery
from better_map.models.wspr import ActivityLookupResult, Role, WsprActivity

logger = logging.getLogger(__name__)


class WsprProviderError(Exception):
    code = "provider_unavailable"


class WsprProviderRateLimited(WsprProviderError):
    code = "provider_rate_limited"


class WsprProviderInvalidData(WsprProviderError):
    code = "provider_invalid_data"


class WsprProviderTimeout(WsprProviderError):
    code = "provider_timeout"


class WsprLiveProvider:
    def __init__(self, base_url: str = "https://db1.wspr.live/", timeout: float = 10.0) -> None:
        self.base_url = base_url
        self.timeout = timeout

    async def fetch_activity(self, query: CallsignQuery) -> ActivityLookupResult:
        sql = self._build_query(query)
        try:
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                response = await client.get(f"{self.base_url}?query={quote_plus(sql)}")
        except httpx.TimeoutException as exc:
            logger.warning("WSPR provider timeout for callsign=%s", query.callsign or "general")
            raise WsprProviderTimeout("WSPR lookup timed out.") from exc
        except httpx.HTTPError as exc:
            logger.warning("WSPR provider unavailable for callsign=%s", query.callsign or "general")
            raise WsprProviderError("WSPR provider is unavailable.") from exc

        if response.status_code == 429:
            logger.warning("WSPR provider rate limited callsign=%s", query.callsign or "general")
            raise WsprProviderRateLimited("WSPR provider rate limit reached.")
        if response.status_code >= 500:
            logger.warning("WSPR provider unavailable status=%s", response.status_code)
            raise WsprProviderError("WSPR provider is unavailable.")

        try:
            payload = response.json()
            rows = payload["data"]
        except (ValueError, KeyError, TypeError) as exc:
            logger.warning(
                "WSPR provider invalid data for callsign=%s",
                query.callsign or "general",
            )
            raise WsprProviderInvalidData("WSPR provider returned invalid data.") from exc

        try:
            activities = self._to_activities(rows, query.callsign)
        except (KeyError, TypeError, ValueError) as exc:
            logger.warning(
                "WSPR provider invalid row data for callsign=%s",
                query.callsign or "general",
            )
            raise WsprProviderInvalidData("WSPR provider returned invalid data.") from exc
        deduped = self._dedupe(activities)
        truncated = len(deduped) > query.limit
        selected = deduped[: query.limit]
        if truncated:
            logger.info(
                "WSPR result truncated callsign=%s limit=%s",
                query.callsign or "general",
                query.limit,
            )

        return ActivityLookupResult(
            callsign=query.callsign or "",
            window_hours=query.window_hours,
            window_days=query.window_days,
            count=len(selected),
            truncated=truncated,
            features=[activity.to_feature() for activity in selected],
        )

    def _build_query(self, query: CallsignQuery) -> str:
        callsign_filter = ""
        if query.callsign:
            callsign = query.callsign.replace("'", "''")
            callsign_filter = (
                f"AND (upper(tx_sign) = '{callsign}' OR upper(rx_sign) = '{callsign}') "
            )
        return (
            "SELECT id,time,band,rx_sign,rx_lat,rx_lon,tx_sign,tx_lat,tx_lon,"
            "distance,azimuth,frequency,power,snr "
            "FROM wspr.rx "
            f"WHERE time >= now('UTC') - INTERVAL {query.window_hours} HOUR "
            f"{callsign_filter}"
            "ORDER BY time DESC "
            f"LIMIT {query.limit + 1} FORMAT JSON"
        )

    def _to_activities(
        self,
        rows: list[dict[str, Any]],
        callsign: str | None,
    ) -> list[WsprActivity]:
        activities: list[WsprActivity] = []
        for row in rows:
            try:
                tx_lat = float(row["tx_lat"])
                tx_lon = float(row["tx_lon"])
                rx_lat = float(row["rx_lat"])
                rx_lon = float(row["rx_lon"])
            except (KeyError, TypeError, ValueError):
                continue
            if not self._valid_coordinate(tx_lat, tx_lon) or not self._valid_coordinate(
                rx_lat, rx_lon
            ):
                continue
            tx_sign = str(row.get("tx_sign", "")).upper()
            rx_sign = str(row.get("rx_sign", "")).upper()
            activities.append(
                WsprActivity(
                    id=str(row.get("id") or self._fallback_id(row)),
                    time=self._parse_time(row["time"]),
                    tx_sign=tx_sign,
                    rx_sign=rx_sign,
                    tx_lat=tx_lat,
                    tx_lon=tx_lon,
                    rx_lat=rx_lat,
                    rx_lon=rx_lon,
                    distance_km=self._optional_int(row.get("distance")),
                    azimuth=self._optional_int(row.get("azimuth")),
                    frequency_hz=self._optional_int(row.get("frequency")),
                    band=str(row["band"]) if row.get("band") is not None else None,
                    snr_db=self._optional_int(row.get("snr")),
                    power_dbm=self._optional_int(row.get("power")),
                    role=self._role(callsign, tx_sign, rx_sign),
                )
            )
        return activities

    def _dedupe(self, activities: list[WsprActivity]) -> list[WsprActivity]:
        seen: set[str] = set()
        deduped: list[WsprActivity] = []
        for activity in activities:
            key = activity.id or self._fallback_id(activity.model_dump())
            if key in seen:
                continue
            seen.add(key)
            deduped.append(activity)
        return deduped

    def _fallback_id(self, row: dict[str, Any]) -> str:
        return "|".join(
            str(row.get(key, ""))
            for key in (
                "time",
                "tx_sign",
                "rx_sign",
                "frequency",
                "tx_lat",
                "tx_lon",
                "rx_lat",
                "rx_lon",
            )
        )

    def _role(self, callsign: str | None, tx_sign: str, rx_sign: str) -> Role:
        if callsign is None:
            return "both"
        if tx_sign == callsign and rx_sign == callsign:
            return "both"
        if tx_sign == callsign:
            return "transmitter"
        return "receiver"

    def _parse_time(self, value: Any) -> datetime:
        if isinstance(value, datetime):
            parsed = value
        else:
            parsed = datetime.fromisoformat(str(value).replace("Z", "+00:00"))
        if parsed.tzinfo is None:
            return parsed.replace(tzinfo=UTC)
        return parsed.astimezone(UTC)

    def _optional_int(self, value: Any) -> int | None:
        return None if value is None else int(value)

    def _valid_coordinate(self, lat: float, lon: float) -> bool:
        return -90 <= lat <= 90 and -180 <= lon <= 180
