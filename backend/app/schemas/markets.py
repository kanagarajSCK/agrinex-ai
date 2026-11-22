from datetime import date, datetime
from decimal import Decimal

from pydantic import BaseModel, ConfigDict, Field

from app.schemas.common import SourceAttribution


class MarketSearchRequest(BaseModel):
    model_config = ConfigDict(extra="forbid", str_strip_whitespace=True)

    state: str | None = Field(default=None, min_length=1, max_length=100)
    district: str | None = Field(default=None, min_length=1, max_length=100)
    market: str | None = Field(default=None, min_length=1, max_length=100)
    commodity: str | None = Field(default=None, min_length=1, max_length=100)
    variety: str | None = Field(default=None, min_length=1, max_length=100)
    grade: str | None = Field(default=None, min_length=1, max_length=100)
    arrival_date: date | None = None
    limit: int = Field(default=20, ge=1, le=100)
    offset: int = Field(default=0, ge=0)


class MarketPrice(BaseModel):
    model_config = ConfigDict(extra="forbid")

    state: str
    district: str
    market: str
    commodity: str
    variety: str | None = None
    grade: str | None = None
    arrival_date: date
    min_price_per_quintal: Decimal | None = Field(default=None, gt=0)
    max_price_per_quintal: Decimal | None = Field(default=None, gt=0)
    modal_price_per_quintal: Decimal = Field(gt=0)
    price_unit: str = "INR/quintal"
    retrieved_at: datetime
    source: SourceAttribution
    stale: bool = False


class MarketSearchResponse(BaseModel):
    prices: list[MarketPrice] = Field(default_factory=list)
    record_count: int = Field(default=0, ge=0)
    latest_arrival_date: date | None = None
    retrieved_at: datetime
    source: SourceAttribution
    stale: bool = False
    upstream_total: int | None = Field(default=None, ge=0)


class CommodityListResponse(BaseModel):
    commodities: list[str] = Field(default_factory=list)
    retrieved_at: datetime
    source: SourceAttribution


class GeographyListResponse(BaseModel):
    states: list[str] = Field(default_factory=list)
    districts: list[str] = Field(default_factory=list)
    markets: list[str] = Field(default_factory=list)
    retrieved_at: datetime
    source: SourceAttribution


class MarketSummary(BaseModel):
    commodity: str
    variety: str | None = None
    grade: str | None = None
    compatible_record_count: int = 0
    highest_modal_price_per_quintal: Decimal | None = None
    highest_modal_market: str | None = None
    lowest_modal_price_per_quintal: Decimal | None = None
    lowest_modal_market: str | None = None
    reported_price_range_per_quintal: tuple[Decimal, Decimal] | None = None
    latest_arrival_date: date | None = None
    price_unit: str = "INR/quintal"
    stale: bool = False


class MarketSummaryResponse(BaseModel):
    summary: MarketSummary
    retrieved_at: datetime
    source: SourceAttribution


class MarketTrendResponse(BaseModel):
    available: bool = False
    records: list[MarketPrice] = Field(default_factory=list)
    message: str = (
        "Historical date-range trends are not available from this provider "
        "until upstream filtering and sufficient genuine records are verified."
    )
    retrieved_at: datetime
    source: SourceAttribution
