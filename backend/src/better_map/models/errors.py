# SPDX-License-Identifier: AGPL-3.0-only
from pydantic import BaseModel


class ErrorResponse(BaseModel):
    code: str
    message: str
