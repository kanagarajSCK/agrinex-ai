export type WeatherLocation = {
  latitude: number;
  longitude: number;
  label: string;
};

export type WeatherData = {
  location_label: string;
  latitude: number;
  longitude: number;
  timezone: string;
  current: {
    temperature_c: number;
    apparent_temperature_c?: number | null;
    humidity_percent?: number | null;
    precipitation_mm?: number | null;
    weather_code?: number | null;
    wind_speed_kph?: number | null;
    wind_direction_deg?: number | null;
    observed_at?: string | null;
  } | null;
  forecast: Array<{
    date: string;
    high_c?: number | null;
    low_c?: number | null;
    rain_probability_percent?: number | null;
    precipitation_mm?: number | null;
    wind_speed_kph?: number | null;
    weather_code?: number | null;
  }>;
  hourly: Array<{
    time: string;
    temperature_c?: number | null;
    humidity_percent?: number | null;
    precipitation_probability_percent?: number | null;
    precipitation_mm?: number | null;
    wind_speed_kph?: number | null;
  }>;
  units: {
    temperature: string;
    apparent_temperature: string;
    humidity: string;
    precipitation: string;
    wind_speed: string;
    wind_direction: string;
    precipitation_probability: string;
  };
  source: {
    provider: string;
    source_name: string;
    source_url?: string | null;
    observed_at?: string | null;
  };
};

export type WeatherEnvelope = {
  data: WeatherData;
  request_id: string;
};

export const SALEM_LOCATION: WeatherLocation = {
  latitude: 11.6643,
  longitude: 78.146,
  label: "Salem, Tamil Nadu",
};

export async function fetchWeather(
  latitude: number,
  longitude: number,
  days = 7,
): Promise<WeatherData> {
  const baseUrl =
    process.env.NEXT_PUBLIC_AGRINEX_API_URL?.replace(/\/$/, "") ||
    "http://127.0.0.1:8000";
  const response = await fetch(
    `${baseUrl}/api/v1/weather/forecast?latitude=${encodeURIComponent(latitude)}&longitude=${encodeURIComponent(longitude)}&days=${days}`,
    { cache: "no-store" },
  );
  if (!response.ok) {
    throw new Error(`Weather service returned ${response.status}`);
  }
  const envelope = (await response.json()) as WeatherEnvelope;
  return envelope.data;
}
