# SPDX-License-Identifier: AGPL-3.0-only
import re
from dataclasses import dataclass

CALLSIGN_PATTERN = re.compile(r"^[A-Z0-9/]{3,12}$")


@dataclass(frozen=True)
class CallsignQuery:
    callsign: str | None
    window_hours: int = 24 * 10
    limit: int = 1000

    @classmethod
    def parse(cls, value: str | None, window_hours: int | None = None) -> "CallsignQuery":
        normalized_window_hours = cls._parse_window_hours(window_hours)
        if value is None or value.strip() == "":
            return cls(callsign=None, window_hours=normalized_window_hours)
        callsign = value.strip().upper()
        if not CALLSIGN_PATTERN.fullmatch(callsign):
            msg = "Callsign must be 3-12 characters using letters, numbers, or /."
            raise ValueError(msg)
        return cls(callsign=callsign, window_hours=normalized_window_hours)

    @staticmethod
    def _parse_window_hours(value: int | None) -> int:
        if value is None:
            return 24 * 10
        if value < 1 or value > 24 * 30:
            msg = "WSPR request window must be between 1 hour and 30 days."
            raise ValueError(msg)
        return value

    @property
    def window_days(self) -> int:
        return max(1, round(self.window_hours / 24))
