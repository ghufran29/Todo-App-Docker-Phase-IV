import json
from typing import Any, Optional


def success_response(data: Any) -> str:
    """Return a structured success response as JSON string."""
    return json.dumps({
        "success": True,
        "data": data,
        "error": None
    }, default=str)


def error_response(code: str, message: str) -> str:
    """Return a structured error response as JSON string."""
    return json.dumps({
        "success": False,
        "data": None,
        "error": {
            "code": code,
            "message": message
        }
    })
