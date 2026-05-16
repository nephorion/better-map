import re
from dataclasses import dataclass

CALLSIGN_PATTERN = re.compile(r"^[A-Z0-9/]{3,12}$")


@dataclass(frozen=True)
class CallsignQuery:
    callsign: str
    window_days: int = 10
    limit: int = 1000

    @classmethod
    def parse(cls, value: str) -> "CallsignQuery":
        callsign = value.strip().upper()
        if not CALLSIGN_PATTERN.fullmatch(callsign):
            msg = "Callsign must be 3-12 characters using letters, numbers, or /."
            raise ValueError(msg)
        return cls(callsign=callsign)
