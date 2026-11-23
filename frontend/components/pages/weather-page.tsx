"use client";

import {
  CloudRain,
  CloudSun,
  Crosshair,
  Droplets,
  MapPin,
  RefreshCw,
  Sun,
  Wind,
} from "lucide-react";
import { useEffect, useState } from "react";
import { TemperatureChart, RainfallChart } from "@/components/charts/intelligence-charts";
import { Card } from "@/components/ui/card";
import { ChartCard, MetricCard, PageHeader } from "@/components/ui/primitives";
import { ErrorState, LoadingState } from "@/components/ui/states";
import {
  fetchWeather,
  type WeatherLocation,
  type WeatherData,
} from "@/lib/weather";
import { useLocation } from "@/contexts/location-context";
import { useLanguage } from "@/contexts/language-context";

export function WeatherPage() {
  const { location, openOnboarding } = useLocation();
  const { t } = useLanguage();

  const activeLat = location?.latitude ?? 11.6643;
  const activeLon = location?.longitude ?? 78.146;
  const activeLabel = location?.formattedName || "Salem, Tamil Nadu";

  const [customLat, setCustomLat] = useState(() => String(activeLat));
  const [customLon, setCustomLon] = useState(() => String(activeLon));
  const [currentCoords, setCurrentCoords] = useState<WeatherLocation>({
    latitude: activeLat,
    longitude: activeLon,
    label: activeLabel,
  });

  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Sync when confirmed location changes in context
  useEffect(() => {
    void Promise.resolve().then(() => {
      const next: WeatherLocation = {
        latitude: activeLat,
        longitude: activeLon,
        label: activeLabel,
      };
      setCurrentCoords(next);
      setCustomLat(String(activeLat));
      setCustomLon(String(activeLon));
      return loadWeather(next);
    });
  }, [activeLat, activeLon, activeLabel]);

  async function loadWeather(coords: WeatherLocation) {
    setLoading(true);
    setError("");
    try {
      const data = await fetchWeather(coords.latitude, coords.longitude, 7);
      setWeather(data);
    } catch {
      setWeather(null);
      setError("Weather data is currently unavailable. Check the backend connection and try again.");
    } finally {
      setLoading(false);
    }
  }

  function applyCustomCoordinates() {
    const lat = Number(customLat);
    const lon = Number(customLon);
    if (!Number.isFinite(lat) || lat < -90 || lat > 90 ||
        !Number.isFinite(lon) || lon < -180 || lon > 180) {
      setError("Enter a valid latitude (-90 to 90) and longitude (-180 to 180).");
      return;
    }
    const next: WeatherLocation = {
      latitude: lat,
      longitude: lon,
      label: `Coordinates ${lat.toFixed(4)}, ${lon.toFixed(4)}`,
    };
    setCurrentCoords(next);
    void loadWeather(next);
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
        eyebrow={t("weatherEyebrow", "Weather intelligence")}
        title={t("weatherTitle", "Weather for your farm")}
        description={`Live 7-day weather forecast from Open-Meteo for ${currentCoords.label}.`}
        action={
          <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
            <button
              type="button"
              onClick={() => openOnboarding("gps")}
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-[#dfe8e2] bg-white px-3.5 text-sm font-semibold text-[#42604e] hover:bg-[#f8faf8]"
            >
              <Crosshair aria-hidden="true" className="size-4 text-[#17834D]" /> Detect GPS Location
            </button>
            <button
              type="button"
              onClick={() => openOnboarding("manual")}
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-[#dfe8e2] bg-white px-3.5 text-sm font-semibold text-[#42604e] hover:bg-[#f8faf8]"
            >
              <MapPin aria-hidden="true" className="size-4 text-[#17834D]" /> Change Location
            </button>
            <button
              type="button"
              onClick={() => void loadWeather(currentCoords)}
              disabled={loading}
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-[#17834D] px-3.5 text-sm font-semibold text-white disabled:opacity-60"
            >
              <RefreshCw aria-hidden="true" className={`size-4 ${loading ? "animate-spin" : ""}`} /> Refresh
            </button>
          </div>
        }
      />

      <Card className="mb-5 p-4 sm:p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-sm font-bold text-[#183b2b]">Active Farm Location</h2>
            <p className="mt-1 text-xs text-[#748279]">
              {currentCoords.label} ({currentCoords.latitude.toFixed(4)}°N, {currentCoords.longitude.toFixed(4)}°E)
            </p>
          </div>
          <button
            type="button"
            onClick={() => openOnboarding()}
            className="inline-flex items-center gap-1.5 rounded-xl border border-[#17834D] bg-[#f2f9f4] px-3 py-1.5 text-xs font-bold text-[#17834D] hover:bg-[#e6f4ea]"
          >
            <MapPin className="size-3.5" />
            Switch Location
          </button>
        </div>
      </Card>

      <Card className="mb-5 p-4 sm:p-5">
        <div className="mb-2">
          <h2 className="text-xs font-bold text-[#486056]">Custom GPS Coordinates (Optional override)</h2>
        </div>
        <div className="grid gap-3 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
          <label className="text-xs font-bold text-[#486056]">Latitude
            <input
              value={customLat}
              onChange={(event) => setCustomLat(event.target.value)}
              inputMode="decimal"
              className="mt-1.5 min-h-11 w-full rounded-xl border border-[#dfe8e2] px-3 text-sm outline-none focus:border-[#17834D]"
            />
          </label>
          <label className="text-xs font-bold text-[#486056]">Longitude
            <input
              value={customLon}
              onChange={(event) => setCustomLon(event.target.value)}
              inputMode="decimal"
              className="mt-1.5 min-h-11 w-full rounded-xl border border-[#dfe8e2] px-3 text-sm outline-none focus:border-[#17834D]"
            />
          </label>
          <button
            type="button"
            onClick={applyCustomCoordinates}
            className="min-h-11 rounded-xl border border-[#17834D] px-4 text-sm font-bold text-[#17834D] hover:bg-[#f2f9f4]"
          >
            Apply Coordinates
          </button>
        </div>
      </Card>

      {loading && <LoadingState label="Loading live weather for the selected coordinates…" />}
      {error && <div className="mb-5"><ErrorState title={error} /></div>}

      {!loading && !error && weather && current && (
        <>
          <Card style={{ backgroundColor: "#123D2B" }} className="mb-5 overflow-hidden p-5 text-white sm:mb-6 sm:p-7">
            <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-center">
              <div>
                <div className="mb-4 flex items-center gap-2">
                  <span className="text-xs font-semibold text-[#d3ebda]">CURRENT CONDITIONS</span>
                  <span className="rounded-full bg-[#A3E6B5] px-2.5 py-1 text-[10px] font-bold text-[#123D2B]">LIVE</span>
                </div>
                <p className="text-5xl font-extrabold tracking-tight sm:text-6xl">
                  {Math.round(current.temperature_c)}°<span className="ml-2 text-base font-semibold text-[#d3ebda]">C</span>
                </p>
                <p className="mt-2 text-sm text-[#d0e2d5]">
                  Feels like {current.apparent_temperature_c == null ? "—" : `${Math.round(current.apparent_temperature_c)}°C`}
                </p>
              </div>
              <div className="flex items-center justify-between gap-5 rounded-2xl border border-white/10 bg-white/5 px-5 py-4 sm:min-w-64">
                <div>
                  <p className="text-xs text-[#c6dece]">{currentCoords.label}</p>
                  <p className="mt-1 text-xs text-[#a8c6b3]">
                    {weather.latitude.toFixed(4)}, {weather.longitude.toFixed(4)} · {weather.timezone}
                  </p>
                </div>
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
                    <p className="mt-1 text-[11px] text-[#718277]">{new Date(`${day.date}T12:00:00`).toLocaleDateString("en-IN", { month: "short", day: "numeric" })}</p>
                    <CloudSun aria-hidden="true" className="mx-auto my-2 size-6 text-[#d2a13a]" />
                    <p className="text-sm font-extrabold text-[#193a2c]">{Math.round(day.high_c ?? 0)}°</p>
                    <p className="text-xs text-[#718277]">{Math.round(day.low_c ?? 0)}°</p>
                    <p className="mt-2 text-[10px] font-semibold text-[#487291]">{Math.round(day.rain_probability_percent ?? 0)}% rain</p>
                  </Card>
                ))}
              </div>
            </section>
          ) : null}

          <div className="grid gap-4 lg:grid-cols-2">
            <ChartCard title="Temperature trend" subtitle="Next 7 days maximum and minimum temperatures (°C)" demo={false}>
              <TemperatureChart data={chartData} />
            </ChartCard>
            <ChartCard title="Rain probability" subtitle="Daily probability of precipitation (%)" demo={false}>
              <RainfallChart data={chartData} />
            </ChartCard>
          </div>
        </>
      )}
    </>
  );
}
