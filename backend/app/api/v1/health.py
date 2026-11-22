from fastapi import APIRouter

router = APIRouter(tags=["system"])

@router.get("/health", summary="Service health check")
async def health_check() -> dict[str, str]:
    """Return a minimal, dependency-free service status."""
    return {"status": "ok", "service": "agrinex-api"}
