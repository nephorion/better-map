# SPDX-License-Identifier: AGPL-3.0-only
from fastapi import APIRouter, HTTPException, status

from better_map.models.callsign import CallsignQuery
from better_map.services.wspr_live import (
    WsprLiveProvider,
    WsprProviderError,
    WsprProviderInvalidData,
    WsprProviderRateLimited,
    WsprProviderTimeout,
)

router = APIRouter(prefix="/api/wspr", tags=["wspr"])


@router.get("/activity")
async def get_activity(callsign: str) -> dict[str, object]:
    try:
        query = CallsignQuery.parse(callsign)
        result = await WsprLiveProvider().fetch_activity(query)
    except ValueError as exc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail={"code": "invalid_request", "message": str(exc)},
        ) from exc
    except WsprProviderRateLimited as exc:
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail={"code": exc.code, "message": "WSPR provider is rate limited. Try again later."},
        ) from exc
    except WsprProviderTimeout as exc:
        raise HTTPException(
            status_code=status.HTTP_504_GATEWAY_TIMEOUT,
            detail={"code": exc.code, "message": "WSPR lookup timed out. Try again."},
        ) from exc
    except WsprProviderInvalidData as exc:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail={"code": exc.code, "message": "WSPR provider returned data we could not use."},
        ) from exc
    except WsprProviderError as exc:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail={"code": exc.code, "message": "WSPR provider is unavailable. Try again later."},
        ) from exc

    return result.model_dump(mode="json")
