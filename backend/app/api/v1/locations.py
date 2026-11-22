from fastapi import APIRouter, Depends, Query, Request

from app.api.dependencies import get_location_repository
from app.locations.geocoding import OpenMeteoGeocodingProvider
from app.locations.repository import LocationRepository
from app.schemas.common import ApiResponse
from app.schemas.locations import (
    LocationListResponse,
    LocationRecord,
    LocationResolveResponse,
    LocationReverseGeocodeResponse,
)

router = APIRouter(prefix="/locations", tags=["locations"])

VILLAGE_COVERAGE_STATES = {
    "maharashtra",
    "andhra pradesh",
    "karnataka",
    "kerala",
    "tamil nadu",
    "telangana",
}


@router.get("/reverse-geocode", response_model=ApiResponse[LocationReverseGeocodeResponse])
async def reverse_geocode(
    request: Request,
    latitude: float = Query(..., ge=-90, le=90),
    longitude: float = Query(..., ge=-180, le=180),
    repository: LocationRepository = Depends(get_location_repository),
) -> ApiResponse[LocationReverseGeocodeResponse]:
    from fastapi import HTTPException
    from datetime import datetime
    from zoneinfo import ZoneInfo

    if not (6.0 <= latitude <= 38.0 and 68.0 <= longitude <= 98.0):
        raise HTTPException(
            status_code=422,
            detail="Coordinates are outside the supported geographical bounds of India (6°N–38°N, 68°E–98°E).",
        )

    geocoder = OpenMeteoGeocodingProvider(
        base_url=request.app.state.settings.geocoding_base_url,
        timeout_seconds=request.app.state.settings.provider_timeout_seconds,
    )
    detected = await geocoder.reverse(latitude, longitude)
    if not detected or detected.get("outside_india") == "true":
        raise HTTPException(
            status_code=422,
            detail="The detected coordinates are outside India or could not be mapped to an Indian territory.",
        )

    state_name = detected.get("state_name", "").strip()
    district_name = detected.get("district_name", "").strip()
    place_name = detected.get("locality_name") or detected.get("city_name") or district_name or "Local Area"

    snapshot = repository.load()
    all_records = snapshot.records

    matched_state = None
    if state_name:
        for r in all_records:
            if r.entity_type in {"state", "union_territory"} and (
                r.name_en.casefold() == state_name.casefold()
                or state_name.casefold() in r.name_en.casefold()
                or r.name_en.casefold() in state_name.casefold()
            ):
                matched_state = r
                break

    matched_district = None
    if matched_state and district_name:
        for r in all_records:
            if (
                r.entity_type == "district"
                and r.state_code == matched_state.state_code
                and (
                    r.name_en.casefold() == district_name.casefold()
                    or district_name.casefold() in r.name_en.casefold()
                    or r.name_en.casefold() in district_name.casefold()
                )
            ):
                matched_district = r
                break

    has_village_coverage = (
        matched_state is not None
        and matched_state.name_en.casefold() in VILLAGE_COVERAGE_STATES
    )

    matched_subdistrict = None
    matched_village = None
    if has_village_coverage and matched_district:
        subdistrict_needle = detected.get("subdistrict_name", "").strip().casefold()
        if subdistrict_needle:
            for r in all_records:
                if (
                    r.entity_type == "sub-district"
                    and r.district_code == matched_district.district_code
                    and (
                        subdistrict_needle in r.name_en.casefold()
                        or r.name_en.casefold() in subdistrict_needle
                    )
                ):
                    matched_subdistrict = r
                    break

        place_needle = place_name.casefold()
        if place_needle and place_needle != matched_district.name_en.casefold():
            for r in all_records:
                if (
                    r.entity_type in {"city", "town", "village", "panchayat"}
                    and r.district_code == matched_district.district_code
                    and (
                        place_needle in r.name_en.casefold()
                        or r.name_en.casefold() in place_needle
                    )
                ):
                    matched_village = r
                    break

    parts = [place_name]
    if district_name and district_name.casefold() not in place_name.casefold():
        parts.append(district_name)
    if state_name and state_name.casefold() not in parts[-1].casefold():
        parts.append(state_name)
    formatted_name = ", ".join(parts)

    confidence = "verified" if (matched_state and matched_district) else "approximate"

    res = LocationReverseGeocodeResponse(
        latitude=latitude,
        longitude=longitude,
        state=matched_state,
        district=matched_district,
        subdistrict=matched_subdistrict,
        village=matched_village,
        state_name=matched_state.name_en if matched_state else state_name,
        district_name=matched_district.name_en if matched_district else district_name,
        place_name=place_name,
        formatted_name=formatted_name,
        village_coverage_available=has_village_coverage,
        confidence=confidence,
        provider="GPS & LGD Reverse Geocoding",
        retrieved_at=datetime.now(ZoneInfo("Asia/Kolkata")),
    )
    return ApiResponse(data=res, request_id=request.state.request_id)


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
