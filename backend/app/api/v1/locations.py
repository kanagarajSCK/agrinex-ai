from fastapi import APIRouter, Depends, Query, Request

from app.api.dependencies import get_location_repository
from app.locations.geocoding import OpenMeteoGeocodingProvider
from app.locations.repository import LocationRepository
from app.schemas.common import ApiResponse
from app.schemas.locations import (
    LocationListResponse,
    LocationRecord,
    LocationResolveResponse,
)

router = APIRouter(prefix="/locations", tags=["locations"])


def _list_response(
    snapshot,
    records: list[LocationRecord],
) -> LocationListResponse:
    return LocationListResponse(
        records=records,
        snapshot_id=snapshot.snapshot_id,
        source_update_date=snapshot.source_update_date,
        count=len(records),
    )


@router.get("/states", response_model=ApiResponse[LocationListResponse])
async def states(
    request: Request,
    repository: LocationRepository = Depends(get_location_repository),
) -> ApiResponse[LocationListResponse]:
    snapshot = repository.load()
    return ApiResponse(
        data=_list_response(snapshot, repository.states()),
        request_id=request.state.request_id,
    )


@router.get("/districts", response_model=ApiResponse[LocationListResponse])
async def districts(
    request: Request,
    state_code: str = Query(..., min_length=1, max_length=50),
    repository: LocationRepository = Depends(get_location_repository),
) -> ApiResponse[LocationListResponse]:
    snapshot = repository.load()
    if not any(record.state_code == state_code for record in snapshot.records):
        records = []
    else:
        records = repository.districts(state_code)
    return ApiResponse(
        data=_list_response(snapshot, records),
        request_id=request.state.request_id,
    )


@router.get("/sub-districts", response_model=ApiResponse[LocationListResponse])
async def sub_districts(
    request: Request,
    district_code: str = Query(..., min_length=1, max_length=50),
    repository: LocationRepository = Depends(get_location_repository),
) -> ApiResponse[LocationListResponse]:
    snapshot = repository.load()
    return ApiResponse(
        data=_list_response(snapshot, repository.sub_districts(district_code)),
        request_id=request.state.request_id,
    )


@router.get("/places", response_model=ApiResponse[LocationListResponse])
async def places(
    request: Request,
    district_code: str = Query(..., min_length=1, max_length=50),
    query: str = Query("", max_length=100),
    repository: LocationRepository = Depends(get_location_repository),
) -> ApiResponse[LocationListResponse]:
    snapshot = repository.load()
    return ApiResponse(
        data=_list_response(snapshot, repository.places(district_code, query)),
        request_id=request.state.request_id,
    )


@router.get("/search", response_model=ApiResponse[LocationListResponse])
async def search(
    request: Request,
    query: str = Query(..., min_length=1, max_length=100),
    repository: LocationRepository = Depends(get_location_repository),
) -> ApiResponse[LocationListResponse]:
    snapshot = repository.load()
    return ApiResponse(
        data=_list_response(snapshot, repository.search(query)),
        request_id=request.state.request_id,
    )


@router.get("/{location_id}", response_model=ApiResponse[LocationRecord])
async def location_detail(
    location_id: str,
    request: Request,
    repository: LocationRepository = Depends(get_location_repository),
) -> ApiResponse[LocationRecord]:
    record = repository.get(location_id)
    if record is None:
        from fastapi import HTTPException
        raise HTTPException(status_code=404, detail="Location not found in the LGD snapshot")
    return ApiResponse(data=record, request_id=request.state.request_id)


@router.get("/{location_id}/resolve", response_model=ApiResponse[LocationResolveResponse])
async def resolve_location(
    location_id: str,
    request: Request,
    repository: LocationRepository = Depends(get_location_repository),
) -> ApiResponse[LocationResolveResponse]:
    record = repository.get(location_id)
    if record is None:
        from fastapi import HTTPException
        raise HTTPException(status_code=404, detail="Location not found in the LGD snapshot")
    if record.latitude is not None and record.longitude is not None:
        from datetime import datetime
        from zoneinfo import ZoneInfo
        resolved = LocationResolveResponse(
            location=record,
            latitude=record.latitude,
            longitude=record.longitude,
            resolved_by="snapshot",
            provider="LGD snapshot",
            retrieved_at=datetime.now(ZoneInfo("Asia/Kolkata")),
            confidence="verified",
        )
        return ApiResponse(data=resolved, request_id=request.state.request_id)

    state_name = None
    district_name = None
    if record.state_code:
        state = next(
            (
                item
                for item in repository.load().records
                if item.state_code == record.state_code
                and item.entity_type in {"state", "union_territory"}
            ),
            None,
        )
        state_name = state.name_en if state else None
    if record.district_code:
        district = next(
            (
                item
                for item in repository.load().records
                if item.district_code == record.district_code
                and item.entity_type == "district"
            ),
            None,
        )
        district_name = district.name_en if district else None

    provider = OpenMeteoGeocodingProvider(
        base_url=request.app.state.settings.geocoding_base_url,
        timeout_seconds=request.app.state.settings.provider_timeout_seconds,
    )
    result = await provider.resolve(record.name_en, state_name, district_name)
    if result is None:
        from fastapi import HTTPException
        raise HTTPException(status_code=404, detail="Coordinates could not be resolved reliably")
    latitude, longitude, resolved_name, retrieved_at = result
    resolved = LocationResolveResponse(
        location=record,
        latitude=latitude,
        longitude=longitude,
        resolved_by="open-meteo-geocoding",
        provider=f"Open-Meteo geocoding ({resolved_name})",
        retrieved_at=retrieved_at,
        confidence="verified",
    )
    return ApiResponse(data=resolved, request_id=request.state.request_id)
