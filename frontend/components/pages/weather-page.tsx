"use client";

import {
  CloudRain,
  CloudSun,
  Crosshair,
  Droplets,
  RefreshCw,
  Sun,
  Wind,
} from "lucide-react";
import { useEffect, useState } from "react";
import { TemperatureChart, RainfallChart } from "@/components/charts/intelligence-charts";
import { Card } from "@/components/ui/card";
import { ChartCard, MetricCard, PageHeader } from "@/components/ui/primitives";
import { ErrorState, LoadingState, EmptyState } from "@/components/ui/states";
import {
  fetchWeather,
  SALEM_LOCATION,
  type WeatherLocation,
  type WeatherData,
} from "@/lib/weather";

const LOCATION_STORAGE_KEY = "agrinex-weather-location";

function getInitialLocation(): WeatherLocation {
  if (typeof window === "undefined") return SALEM_LOCATION;
  const saved = window.localStorage.getItem(LOCATION_STORAGE_KEY);
  if (!saved) return SALEM_LOCATION;
  try {
    const parsed = JSON.parse(saved) as WeatherLocation;
    if (
      Number.isFinite(parsed.latitude) &&
      parsed.latitude >= -90 &&
      parsed.latitude <= 90 &&
      Number.isFinite(parsed.longitude) &&
      parsed.longitude >= -180 &&
      parsed.longitude <= 180
    ) {
      return parsed;
    }
  } catch {
    window.localStorage.removeItem(LOCATION_STORAGE_KEY);
  }
  return SALEM_LOCATION;
}

export function WeatherPage() {
  const [location, setLocation] = useState<WeatherLocation>(getInitialLocation);
  const [latitudeInput, setLatitudeInput] = useState(() => String(getInitialLocation().latitude));
  const [longitudeInput, setLongitudeInput] = useState(() => String(getInitialLocation().longitude));
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadWeather(nextLocation: WeatherLocation) {
    setLoading(true);
    setError("");
    try {
      const data = await fetchWeather(nextLocation.latitude, nextLocation.longitude, 7);
      setWeather(data);
    } catch {
      setWeather(null);
      setError("Weather data is currently unavailable. Check the backend connection and try again.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void Promise.resolve().then(() => loadWeather(location));
    // Initial load intentionally uses the location selected during component initialization.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function saveLocation(nextLocation: WeatherLocation) {
    setLocation(nextLocation);
    window.localStorage.setItem(LOCATION_STORAGE_KEY, JSON.stringify(nextLocation));
    void loadWeather(nextLocation);
  }

  function applyManualLocation() {
    const latitude = Number(latitudeInput);
    const longitude = Number(longitudeInput);
    if (!Number.isFinite(latitude) || latitude < -90 || latitude > 90 ||
        !Number.isFinite(longitude) || longitude < -180 || longitude > 180) {
      setError("Enter a valid latitude (-90 to 90) and longitude (-180 to 180).");
      return;
    }
    saveLocation({ latitude, longitude, label: "Selected coordinates" });
  }

  function detectLocation() {
    if (!navigator.geolocation) {
      setError("Browser geolocation is unavailable. Enter coordinates manually.");
      return;
    }
    setLoading(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        saveLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          label: "Current location",
        });
      },
      () => {
        setLoading(false);
        setError("Location permission was denied or location could not be detected. Manual coordinates are still available.");
      },
      { enableHighAccuracy: false, timeout: 10000, maximumAge: 300000 },
    );
  }

  const current = weather?.current;
  const chartData = (weather?.forecast ?? []).map((day) => {
    const date = new Date(`${day.date}T12:00:00`);
    return {
      day: date.toLocaleDateString("en-IN", { weekday: "short" }),
      high: day.high_c ?? 0,
      low: day.low_c ?? 0,
      rain: day.rain_probability_percent ?? 0,
    };
  });

  return (
    <>
      <PageHeader
        eyebrow="Weather intelligence"
        title="Weather for your farm"
        description="Live weather from Open-Meteo. Salem coordinates are a demo default, not an assumed farmer location."
        action={
          <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
            <button type="button" onClick={detectLocation} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-[#dfe8e2] bg-white px-3.5 text-sm font-semibold text-[#42604e]">
              <Crosshair aria-hidden="true" className="size-4 text-[#17834D]" /> Detect location
            </button>
            <button type="button" onClick={() => void loadWeather(location)} disabled={loading} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-[#17834D] px-3.5 text-sm font-semibold text-white disabled:opacity-60">
              <RefreshCw aria-hidden="true" className={`size-4 ${loading ? "animate-spin" : ""}`} /> Refresh
            </button>
          </div>
        }
      />

      <Card className="mb-5 p-4 sm:p-5">
        <div className="grid gap-3 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
          <label className="text-xs font-bold text-[#486056]">Latitude
            <input value={latitudeInput} onChange={(event) => setLatitudeInput(event.target.value)} inputMode="decimal" className="mt-1.5 min-h-11 w-full rounded-xl border border-[#dfe8e2] px-3 text-sm outline-none focus:border-[#17834D]" />
          </label>
          <label className="text-xs font-bold text-[#486056]">Longitude
            <input value={longitudeInput} onChange={(event) => setLongitudeInput(event.target.value)} inputMode="decimal" className="mt-1.5 min-h-11 w-full rounded-xl border border-[#dfe8e2] px-3 text-sm outline-none focus:border-[#17834D]" />
          </label>
          <button type="button" onClick={applyManualLocation} className="min-h-11 rounded-xl border border-[#17834D] px-4 text-sm font-bold text-[#17834D]">Use coordinates</button>
        </div>
      </Card>

      {loading && <LoadingState label="Loading live weather for the selected coordinates…" />}
      {error && <div className="mb-5"><ErrorState title={error} /></div>}

      {!loading && !error && weather && current && (
        <>
          <Card style={{ backgroundColor: "#123D2B" }} className="mb-5 overflow-hidden p-5 text-white sm:mb-6 sm:p-7">
            <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-center">
              <div>
                <div className="mb-4 flex items-center gap-2"><span className="text-xs font-semibold text-[#d3ebda]">CURRENT CONDITIONS</span><span className="rounded-full bg-[#A3E6B5] px-2.5 py-1 text-[10px] font-bold text-[#123D2B]">LIVE</span></div>
                <p className="text-5xl font-extrabold tracking-tight sm:text-6xl">{Math.round(current.temperature_c)}°<span className="ml-2 text-base font-semibold text-[#d3ebda]">C</span></p>
                <p className="mt-2 text-sm text-[#d0e2d5]">Feels like {current.apparent_temperature_c == null ? "—" : `${Math.round(current.apparent_temperature_c)}°C`}</p>
              </div>
              <div className="flex items-center justify-between gap-5 rounded-2xl border border-white/10 bg-white/5 px-5 py-4 sm:min-w-64">
                <div><p className="text-xs text-[#c6dece]">{location.label}</p><p className="mt-1 text-xs text-[#a8c6b3]">{weather.latitude.toFixed(4)}, {weather.longitude.toFixed(4)} · {weather.timezone}</p></div>
                <CloudSun aria-hidden="true" className="size-12 text-[#f3cf79]" strokeWidth={1.5} />
              </div>
            </div>
            <div className="mt-6 grid grid-cols-2 gap-3 border-t border-white/10 pt-5 sm:grid-cols-4">
              <div className="flex items-center gap-2.5"><Droplets aria-hidden="true" className="size-4 text-[#b9dbe5]" /><div><p className="text-[10px] text-[#b8d2c2]">Humidity</p><p className="text-sm font-bold">{current.humidity_percent == null ? "—" : `${Math.round(current.humidity_percent)}%`}</p></div></div>
              <div className="flex items-center gap-2.5"><Wind aria-hidden="true" className="size-4 text-[#b9dbe5]" /><div><p className="text-[10px] text-[#b8d2c2]">Wind</p><p className="text-sm font-bold">{current.wind_speed_kph == null ? "—" : `${Math.round(current.wind_speed_kph)} km/h`}</p></div></div>
              <div className="flex items-center gap-2.5"><CloudRain aria-hidden="true" className="size-4 text-[#b9dbe5]" /><div><p className="text-[10px] text-[#b8d2c2]">Precipitation</p><p className="text-sm font-bold">{current.precipitation_mm == null ? "—" : `${current.precipitation_mm} mm`}</p></div></div>
              <div className="flex items-center gap-2.5"><Sun aria-hidden="true" className="size-4 text-[#f3cf79]" /><div><p className="text-[10px] text-[#b8d2c2]">Weather code</p><p className="text-sm font-bold">{current.weather_code ?? "—"}</p></div></div>
            </div>
          </Card>

          <section aria-label="Weather metrics" className="mb-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
            <MetricCard label="Humidity" value={current.humidity_percent == null ? "—" : `${Math.round(current.humidity_percent)}%`} detail="Relative humidity" icon={Droplets} accent="blue" demo={false} />
            <MetricCard label="Wind speed" value={current.wind_speed_kph == null ? "—" : `${Math.round(current.wind_speed_kph)} km/h`} detail={current.wind_direction_deg == null ? "Open-Meteo" : `Direction ${Math.round(current.wind_direction_deg)}°`} icon={Wind} accent="blue" demo={false} />
            <MetricCard label="Precipitation" value={current.precipitation_mm == null ? "—" : `${current.precipitation_mm} mm`} detail="Current precipitation" icon={CloudRain} accent="green" demo={false} />
            <MetricCard label="High / low" value={weather.forecast[0]?.high_c == null || weather.forecast[0]?.low_c == null ? "—" : `${Math.round(weather.forecast[0].high_c)}° / ${Math.round(weather.forecast[0].low_c)}°`} detail="Today · °C" icon={CloudSun} accent="amber" demo={false} />
          </section>

          {weather.forecast.length > 0 ? (
            <section aria-label="Seven-day forecast" className="mb-5">
              <div className="mb-3"><h2 className="text-base font-bold text-[#183b2b]">Seven-day forecast</h2></div>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 xl:grid-cols-7">
                {weather.forecast.map((day) => (
                  <Card key={day.date} className="p-3 text-center sm:p-4">
                    <p className="text-xs font-bold text-[#43604e]">{new Date(`${day.date}T12:00:00`).toLocaleDateString("en-IN", { weekday: "short" })}</p>
                    <CloudSun aria-hidden="true" className="mx-auto my-3 size-6 text-[#528b66]" />
                    <p className="text-sm font-extrabold text-[#183b2b]">{day.high_c == null ? "—" : `${Math.round(day.high_c)}°`}<span className="ml-1 text-xs font-medium text-[#89958e]">{day.low_c == null ? "—" : `${Math.round(day.low_c)}°`}</span></p>
                    <p className="mt-2 text-[10px] text-[#718278]">{day.rain_probability_percent == null ? "—" : `${Math.round(day.rain_probability_percent)}%`} max rain chance</p>
                  </Card>
                ))}
              </div>
            </section>
          ) : <EmptyState title="No daily forecast values were returned." />}

          <div className="grid min-w-0 gap-4 xl:grid-cols-2">
            <ChartCard title="Temperature trend" subtitle="High and low temperatures · °C" demo={false}>
              {chartData.length ? <TemperatureChart compact data={chartData} /> : <EmptyState title="No temperature chart values." />}
            </ChartCard>
            <ChartCard title="Rain probability" subtitle="Maximum precipitation probability by day · %" demo={false}>
              {chartData.length ? <RainfallChart data={chartData} /> : <EmptyState title="No rainfall probability values." />}
            </ChartCard>
          </div>

          <Card className="mt-5 flex flex-col gap-2 p-4 text-xs leading-5 text-[#6e7c73] sm:flex-row sm:items-center sm:justify-between sm:px-5">
            <p><strong className="text-[#40594a]">Data source:</strong> <a href={weather.source.source_url ?? "https://open-meteo.com/"} target="_blank" rel="noreferrer" className="underline">{weather.source.source_name}</a></p>
            <p><strong className="text-[#40594a]">Updated:</strong> {current.observed_at ? new Date(current.observed_at).toLocaleString("en-IN") : "Provider current time unavailable"} · {weather.timezone}</p>
          </Card>
        </>
      )}
    </>
  );
}
