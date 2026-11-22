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

    @model_validator(mode="after")
    def validate_coordinates(self) -> Self:
        if self.location.latitude is None or self.location.longitude is None:
            raise ValueError("Weather requests require latitude and longitude")
        return self


class CurrentConditions(BaseModel):
    temperature_c: float
    apparent_temperature_c: float | None = None
    humidity_percent: float | None = Field(default=None, ge=0, le=100)
    precipitation_mm: float | None = Field(default=None, ge=0)
    weather_code: int | None = Field(default=None, ge=0)
    wind_speed_kph: float | None = Field(default=None, ge=0)
    wind_direction_deg: float | None = Field(default=None, ge=0, lt=360)
    rain_probability_percent: float | None = Field(default=None, ge=0, le=100)
    observed_at: datetime | None = None


class DailyForecast(BaseModel):
    date: date
    high_c: float | None = None
    low_c: float | None = None
    rain_probability_percent: float | None = Field(default=None, ge=0, le=100)
    precipitation_mm: float | None = Field(default=None, ge=0)
    wind_speed_kph: float | None = Field(default=None, ge=0)
    weather_code: int | None = Field(default=None, ge=0)


class HourlyForecast(BaseModel):
    time: datetime
    temperature_c: float | None = None
    humidity_percent: float | None = Field(default=None, ge=0, le=100)
    precipitation_probability_percent: float | None = Field(default=None, ge=0, le=100)
    precipitation_mm: float | None = Field(default=None, ge=0)
    wind_speed_kph: float | None = Field(default=None, ge=0)


class WeatherUnits(BaseModel):
    temperature: str = "°C"
    apparent_temperature: str = "°C"
    humidity: str = "%"
    precipitation: str = "mm"
    wind_speed: str = "km/h"
    wind_direction: str = "°"
    precipitation_probability: str = "%"


class WeatherForecastResponse(BaseModel):
    location_label: str
    latitude: float = Field(ge=-90, le=90)
    longitude: float = Field(ge=-180, le=180)
    timezone: str = "Asia/Kolkata"
    current: CurrentConditions | None = None
    forecast: list[DailyForecast] = Field(default_factory=list)
    hourly: list[HourlyForecast] = Field(default_factory=list)
    units: WeatherUnits = Field(default_factory=WeatherUnits)
    source: SourceAttribution
