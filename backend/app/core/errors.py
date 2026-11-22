import logging
from uuid import uuid4

from fastapi import FastAPI, Request
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from starlette.exceptions import HTTPException as StarletteHTTPException

from app.core.exceptions import AppError
from app.schemas.common import ErrorDetail, ErrorIssue, ErrorResponse

logger = logging.getLogger("agrinex")


def _request_id(request: Request) -> str:
    request_id = getattr(request.state, "request_id", None)
    if isinstance(request_id, str):
        return request_id
    return uuid4().hex


def _error_response(
    request: Request,
    status_code: int,
    code: str,
    message: str,
    issues: list[ErrorIssue] | None = None,
) -> JSONResponse:
    request_id = _request_id(request)
    body = ErrorResponse(
        error=ErrorDetail(
            code=code,
            message=message,
            request_id=request_id,
            issues=issues or [],
        )
    )
    return JSONResponse(
        status_code=status_code,
        content=body.model_dump(mode="json"),
        headers={"X-Request-ID": request_id},
    )


def register_exception_handlers(app: FastAPI) -> None:
    @app.exception_handler(AppError)
    async def application_error_handler(request: Request, exc: AppError) -> JSONResponse:
        return _error_response(
            request,
            exc.status_code,
            exc.code,
            exc.public_message,
        )

    @app.exception_handler(RequestValidationError)
    async def request_validation_error_handler(
        request: Request,
        exc: RequestValidationError,
    ) -> JSONResponse:
        issues = [
            ErrorIssue(
                field=".".join(
                    str(part)
                    for part in error["loc"]
                    if part not in ("body", "query", "path")
                ),
                code=str(error["type"]),
            )
            for error in exc.errors()
        ]
        return _error_response(
            request,
            422,
            "REQUEST_VALIDATION_ERROR",
            "The request contains invalid or missing fields.",
            issues,
        )

    @app.exception_handler(StarletteHTTPException)
    async def http_error_handler(
        request: Request,
        exc: StarletteHTTPException,
    ) -> JSONResponse:
        return _error_response(
            request,
            exc.status_code,
            "HTTP_ERROR",
            "The requested resource or method is unavailable.",
        )

    @app.exception_handler(Exception)
    async def unhandled_exception_handler(request: Request, exc: Exception) -> JSONResponse:
        request_id = _request_id(request)
        logger.error(
            "request.unhandled_exception",
            extra={"request_id": request_id, "error_type": type(exc).__name__},
        )
        return _error_response(
            request,
            500,
            "INTERNAL_ERROR",
            "An unexpected server error occurred.",
        )
