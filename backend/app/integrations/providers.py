from dataclasses import dataclass, field

from app.integrations.gemini import GeminiProvider, UnconfiguredGeminiProvider
from app.integrations.markets import MarketProvider, UnconfiguredMarketProvider
from app.integrations.weather import WeatherProvider, UnconfiguredWeatherProvider


@dataclass(frozen=True)
class ProviderSet:
    weather: WeatherProvider = field(default_factory=UnconfiguredWeatherProvider)
    markets: MarketProvider = field(default_factory=UnconfiguredMarketProvider)
    gemini: GeminiProvider = field(default_factory=UnconfiguredGeminiProvider)
