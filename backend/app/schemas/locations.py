from datetime import date, datetime
from typing import Literal

from pydantic import BaseModel, ConfigDict, Field


LocationEntityType = Literal[
    "state",
    "union_territory",
    "district",
    "sub-district",
    "city",
    "town",
    "village",
    "local-body",
    "panchayat",
]


class LocationRecord(BaseModel):
    model_config = ConfigDict(extra="forbid")

    location_id: str = Field(min_length=1, max_length=200)
    lgd_code: str | None = Field(default=None, max_length=50)
    name_en: str = Field(min_length=1, max_length=200)
    name_local: str | None = Field(default=None, max_length=200)
    parent_location_id: str | None = Field(default=None, max_length=200)
    entity_type: LocationEntityType
    state_code: str | None = Field(default=None, max_length=50)
    district_code: str | None = Field(default=None, max_length=50)
    latitude: float | None = Field(default=None, ge=-90, le=90)
    longitude: float | None = Field(default=None, ge=-180, le=180)
    source: str = "LGD"
    source_update_date: date | None = None
    active: bool = True


class LocationSnapshot(BaseModel):
    model_config = ConfigDict(extra="forbid")

    snapshot_id: str
    source: str = "Local Government Directory"
    source_update_date: date | None = None
    ingested_at: datetime
    records: list[LocationRecord] = Field(default_factory=list)


class LocationListResponse(BaseModel):
    records: list[LocationRecord] = Field(default_factory=list)
    snapshot_id: str | None = None
    source_update_date: date | None = None
    count: int = 0


class LocationResolveResponse(BaseModel):
    location: LocationRecord
    latitude: float
    longitude: float
    resolved_by: Literal["snapshot", "open-meteo-geocoding"]
    provider: str
    retrieved_at: datetime
    confidence: Literal["verified", "ambiguous", "not_resolved"]


class LocationReverseGeocodeResponse(BaseModel):
    latitude: float
    longitude: float
    state: LocationRecord | None = None
    district: LocationRecord | None = None
    subdistrict: LocationRecord | None = None
    village: LocationRecord | None = None
    state_name: str
    district_name: str
    place_name: str
    formatted_name: str
    village_coverage_available: bool = False
    confidence: Literal["verified", "ambiguous", "approximate"] = "approximate"
    provider: str = "reverse-geocoding"
    retrieved_at: datetime
