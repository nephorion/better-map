# SPDX-License-Identifier: AGPL-3.0-only
from better_map.models.errors import ErrorResponse


def test_error_response_model() -> None:
    error = ErrorResponse(code="provider_timeout", message="Lookup timed out.")

    assert error.model_dump() == {"code": "provider_timeout", "message": "Lookup timed out."}
