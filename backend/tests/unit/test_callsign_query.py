import pytest

from better_map.models.callsign import CallsignQuery


def test_callsign_query_normalizes_valid_input() -> None:
    query = CallsignQuery.parse(" vk2djj ")

    assert query.callsign == "VK2DJJ"
    assert query.window_days == 10
    assert query.limit == 1000


@pytest.mark.parametrize("value", ["", "VK", "VK2DJJ_TOO_LONG", "VK2 DJJ", "VK2DJJ!"])
def test_callsign_query_rejects_invalid_input(value: str) -> None:
    with pytest.raises(ValueError):
        CallsignQuery.parse(value)
