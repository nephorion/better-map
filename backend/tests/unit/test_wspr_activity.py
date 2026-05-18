# SPDX-License-Identifier: AGPL-3.0-only
from datetime import UTC, datetime

from better_map.models.wspr import WsprActivity


def test_wspr_activity_converts_to_line_feature() -> None:
    activity = WsprActivity(
        id="1",
        time=datetime(2026, 5, 16, 10, 30, tzinfo=UTC),
        tx_sign="VK2DJJ",
        rx_sign="VK3ABC",
        tx_lat=-33.8,
        tx_lon=151.2,
        rx_lat=-37.8,
        rx_lon=144.9,
        distance_km=713,
        frequency_hz=14095600,
        band="20m",
        snr_db=-18,
        power_dbm=30,
        role="transmitter",
    )

    feature = activity.to_feature()

    assert feature.geometry.coordinates == [[151.2, -33.8], [144.9, -37.8]]
    assert feature.properties["tx_sign"] == "VK2DJJ"
    assert feature.properties["role"] == "transmitter"
