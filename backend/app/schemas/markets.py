from datetime import datetime
from decimal import Decimal

from pydantic import BaseModel, ConfigDict, Field

from app.schemas.common import SourceAttribution
from app.schemas.weather import LocationInput


class MarketSearchRequest(BaseModel):
    model_config = ConfigDict(extra="forbid", str_strip_whitespace=True)

    commodity: str = Field(min_length=1, max_length=100)
    market: str | None = Field(default=None, min_length=1, max_length=100)
    location: LocationInput | None = None
    limit: int = Field(default=20, ge=1, le=100)


class MarketPrice(BaseModel):
    commodity: str
    market: str
    modal_price_per_quintal: Decimal = Field(gt=0)
    min_price_per_quintal: Decimal | None = Field(default=None, gt=0)
    max_price_per_quintal: Decimal | None = Field(default=None, gt=0)
    observed_at: datetime
    source: SourceAttribution


class MarketSearchResponse(BaseModel):
    prices: list[MarketPrice] = Field(default_factory=list)
