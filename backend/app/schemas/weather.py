from datetime import date, datetime
from typing import Self

from pydantic import BaseModel, ConfigDict, Field, model_validator

from app.schemas.common import SourceAttribution


class LocationInput(BaseModel):
    model_config = ConfigDict(extra="forbid", str_strip_whitespace=True)

    city: str | None = Field(default=None, min_length=1, max_length=100)
    district: str | None = Field(default=None, min_length=1, max_length=100)
    latitude: float | None = Field(default=None, ge=-90, le=90)
    longitude: float | None = Field(default=None, ge=-180, le=180)

    @model_validator(mode="after")
    def validate_location(self) -> Self:
        has_coordinates = self.latitude is not None or self.longitude is not None
        if has_coordinates and (self.latitude is None or self.longitude is None):
            raise ValueError("Latitude and longitude must be supplied together")
        if not has_coordinates and self.city is None and self.district is None:
            raise ValueError("Provide a city, district, or coordinate pair")
        return self


class WeatherForecastRequest(BaseModel):
    model_config = ConfigDict(extra="forbid")

    location: LocationInput
    days: int = Field(default=7, ge=1, le=7)


class CurrentConditions(BaseModel):
    temperature_c: float
    humidity_percent: float | None = Field(default=None, ge=0, le=100)
    wind_speed_kph: float | None = Field(default=None, ge=0)
    rain_probability_percent: float | None = Field(default=None, ge=0, le=100)
    observed_at: datetime | None = None


class DailyForecast(BaseModel):
    date: date
    high_c: float | None = None
    low_c: float | None = None
    rain_probability_percent: float | None = Field(default=None, ge=0, le=100)


class WeatherForecastResponse(BaseModel):
    location_label: str
    current: CurrentConditions | None = None
    forecast: list[DailyForecast] = Field(default_factory=list)
    source: SourceAttribution
