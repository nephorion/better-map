# SPDX-License-Identifier: AGPL-3.0-only
import pytest

from better_map.models.callsign import CallsignQuery


def test_callsign_query_normalizes_valid_input() -> None:
    query = CallsignQuery.parse(" vk2djj ")

    assert query.callsign == "VK2DJJ"
    assert query.window_hours == 240
    assert query.window_days == 10
    assert query.limit == 1000


def test_callsign_query_accepts_custom_window_hours() -> None:
    query = CallsignQuery.parse("VK2DJJ", 6)

    assert query.window_hours == 6
    assert query.window_days == 1


def test_callsign_query_allows_empty_general_lookup() -> None:
    assert CallsignQuery.parse(None).callsign is None
    assert CallsignQuery.parse("").callsign is None


@pytest.mark.parametrize("value", ["VK", "VK2DJJ_TOO_LONG", "VK2 DJJ", "VK2DJJ!"])
def test_callsign_query_rejects_invalid_input(value: str) -> None:
    with pytest.raises(ValueError):
        CallsignQuery.parse(value)


@pytest.mark.parametrize("window_hours", [0, 24 * 30 + 1])
def test_callsign_query_rejects_invalid_window_hours(window_hours: int) -> None:
    with pytest.raises(ValueError):
        CallsignQuery.parse("VK2DJJ", window_hours)
