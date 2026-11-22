from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from starlette.status import HTTP_500_INTERNAL_SERVER_ERROR

def register_exception_handlers(app: FastAPI) -> None:
    @app.exception_handler(Exception)
    async def unhandled_exception_handler(_: Request, __: Exception) -> JSONResponse:
        return JSONResponse(status_code=HTTP_500_INTERNAL_SERVER_ERROR, content={"detail": "An unexpected server error occurred."})
