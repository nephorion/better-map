from datetime import datetime
from typing import Any, Literal

from pydantic import BaseModel, Field

Role = Literal["transmitter", "receiver", "both"]


class Geometry(BaseModel):
    type: Literal["LineString"] = "LineString"
    coordinates: list[list[float]]


class MapFeature(BaseModel):
    id: str
    type: Literal["Feature"] = "Feature"
    geometry: Geometry
    properties: dict[str, Any]


class WsprActivity(BaseModel):
    id: str
    time: datetime
    tx_sign: str
    rx_sign: str
    tx_lat: float
    tx_lon: float
    rx_lat: float
    rx_lon: float
    distance_km: int | None = None
    azimuth: int | None = None
    frequency_hz: int | None = None
    band: str | None = None
    snr_db: int | None = None
    power_dbm: int | None = None
    role: Role

    def to_feature(self) -> MapFeature:
        return MapFeature(
            id=self.id,
            geometry=Geometry(
                coordinates=[[self.tx_lon, self.tx_lat], [self.rx_lon, self.rx_lat]],
            ),
            properties={
                "time": self.time.isoformat(),
                "tx_sign": self.tx_sign,
                "rx_sign": self.rx_sign,
                "distance_km": self.distance_km,
                "frequency_hz": self.frequency_hz,
                "band": self.band,
                "snr_db": self.snr_db,
                "power_dbm": self.power_dbm,
                "role": self.role,
            },
        )


class ActivityLookupResult(BaseModel):
    callsign: str
    window_days: int = 10
    source: str = "wspr.live"
    count: int
    truncated: bool
    features: list[MapFeature] = Field(default_factory=list)
