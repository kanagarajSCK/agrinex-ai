"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  ArrowRight,
  ArrowUpRight,
  Bot,
  CloudRain,
  CloudSun,
  Droplets,
  Leaf,
  MapPin,
  ShoppingBasket,
  Sprout,
  Wind,
} from "lucide-react";
import { RainfallChart, TemperatureChart } from "@/components/charts/intelligence-charts";
import { Card } from "@/components/ui/card";
import { ChartCard, DemoBadge, MetricCard, PageHeader, SectionTitle } from "@/components/ui/primitives";
import { fetchWeather, type WeatherData } from "@/lib/weather";
import { fetchMarketPrices, type MarketPrice } from "@/lib/markets";

const quickActions = [
  { href: "/assistant", label: "Ask AI", description: "Explore the assistant preview", icon: Bot, tone: "bg-[#e6f4ea] text-[#17834D]" },
  { href: "/weather", label: "Check weather", description: "View live forecast", icon: CloudSun, tone: "bg-[#e8f1fb] text-[#3774a6]" },
  { href: "/markets", label: "Compare prices", description: "Explore demo mandi data", icon: ShoppingBasket, tone: "bg-[#fff4dd] text-[#9b741f]" },
  { href: "/crops", label: "Crop guidance", description: "Browse information placeholders", icon: Sprout, tone: "bg-[#f0eafa] text-[#7252a3]" },
];

export function DashboardPage() {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [weatherError, setWeatherError] = useState("");
  const [market, setMarket] = useState<MarketPrice | null>(null);
  const [marketError, setMarketError] = useState("");

  useEffect(() => {
    let active = true;
    const saved = window.localStorage.getItem("agrinex-weather-location");
    if (!saved) {
      void Promise.resolve().then(() => setWeatherError("No verified location selected."));
      return () => { active = false; };
    }
    let initial: { latitude: number; longitude: number } | null = null;
    try {
      const parsed = JSON.parse(saved) as { latitude: number; longitude: number };
      if (Number.isFinite(parsed.latitude) && Number.isFinite(parsed.longitude)) {
        initial = parsed;
      }
    } catch {
      window.localStorage.removeItem("agrinex-weather-location");
    }
    if (!initial) {
      void Promise.resolve().then(() => setWeatherError("Location coordinates could not be resolved."));
      return () => { active = false; };
    }
    void fetchWeather(initial.latitude, initial.longitude, 7)
      .then((data) => {
        if (active) setWeather(data);
      })
      .catch(() => {
        if (active) setWeatherError("Live weather is unavailable.");
      });
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    let active = true;
    const saved = window.localStorage.getItem("agrinex-selected-location");
    let state = "";
    let district = "";
    if (saved) {
      try {
        const parsed = JSON.parse(saved) as { stateName?: string; districtName?: string };
        state = parsed.stateName || "";
        district = parsed.districtName || "";
      } catch {
        window.localStorage.removeItem("agrinex-selected-location");
      }
    }
    if (!state || !district) {
      void Promise.resolve().then(() => setMarketError("Select an official state and district for mandi coverage."));
      return () => { active = false; };
    }
    void fetchMarketPrices({
      state,
      district,
      limit: 20,
      commodity: "Tomato",
    })
      .then((data) => {
        if (active) setMarket(data.prices[0] ?? null);
      })
      .catch((caught) => {
        if (active) {
          setMarket(null);
          setMarketError(caught instanceof Error ? caught.message : "Live market data is unavailable.");
        }
      });
    return () => {
      active = false;
    };
  }, []);

  const chartData = (weather?.forecast ?? []).map((day) => {
    const date = new Date(`${day.date}T12:00:00`);
    return {
      day: date.toLocaleDateString("en-IN", { weekday: "short" }),
      high: day.high_c ?? 0,
      low: day.low_c ?? 0,
      rain: day.rain_probability_percent ?? 0,
    };
  });

  const temperature = weather?.current?.temperature_c;
  const rainProbability = weather?.forecast?.[0]?.rain_probability_percent;

  return (
    <>
      <PageHeader
        eyebrow="Your farm overview"
        title="Good morning, farmer."
        description="A clear starting point for your farm decisions in Salem, Tamil Nadu. All figures on this page are illustrative previews."
        action={
          <Link href="/assistant" className="inline-flex min-h-11 w-full items-center justify-center rounded-xl bg-[#17834D] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[#123D2B] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#17834D] sm:w-auto">
            <Bot aria-hidden="true" className="mr-2 size-4" />
            Ask AgriNex AI
          </Link>
        }
      />

      <Card style={{ backgroundColor: "#123D2B" }} className="mb-5 overflow-hidden p-5 text-white sm:mb-6 sm:p-7">
        <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
          <div className="max-w-2xl">
            <div className="mb-4 flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1.5 text-xs font-semibold text-[#d3ebda]">
                <MapPin aria-hidden="true" className="size-3.5" /> Salem, Tamil Nadu
              </span>
              <DemoBadge>SAMPLE LOCATION</DemoBadge>
            </div>
            <h2 className="max-w-xl text-xl font-bold leading-tight tracking-tight sm:text-2xl">
              Your agricultural intelligence, in one place.
            </h2>
            <p className="mt-2 max-w-xl text-sm leading-6 text-[#c7ddce]">
              Weather, market and crop modules are interactive previews. Verify information with trusted local sources before making decisions.
            </p>
          </div>
          <div className="flex items-center justify-between gap-4 rounded-2xl border border-white/15 bg-white/5 px-4 py-3 md:min-w-48">
            <div>
              <p className="text-xs text-[#c7ddce]">Platform status</p>
              <p className="mt-1 text-sm font-bold">Preview workspace</p>
            </div>
            <span className="grid size-10 place-items-center rounded-xl bg-white/10 text-[#A3E6B5]"><Leaf aria-hidden="true" className="size-5" /></span>
          </div>
        </div>
      </Card>

      <section aria-label="Farm overview metrics" className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <MetricCard label="Current temperature" value={temperature == null ? "Unavailable" : `${Math.round(temperature)}°C`} detail={weather ? "Salem · live" : "Weather service"} icon={CloudSun} accent="amber" demo={false} />
        <MetricCard label="Rain probability" value={rainProbability == null ? "Unavailable" : `${Math.round(rainProbability)}%`} detail={weather ? "Today · live forecast" : "Weather service"} icon={CloudRain} accent="blue" demo={false} />
        <MetricCard label="Active crops" value="3 crops" detail="Sample farm profile" icon={Sprout} />
        <MetricCard label="Tomato modal price" value={market?.modal_price_per_quintal == null ? "Unavailable" : `₹${Number(market.modal_price_per_quintal).toLocaleString("en-IN")}`} detail={market ? `${market.market} · arrival ${market.arrival_date}` : "Live market service"} icon={ShoppingBasket} accent="violet" demo={false} />
      </section>

      <section aria-labelledby="quick-actions-title" className="mb-6">
        <SectionTitle title="Quick actions" />
        <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
          {quickActions.map(({ href, label, description, icon: Icon, tone }) => (
            <Link key={href} href={href} className="group rounded-2xl border border-[#e0e9e3] bg-white p-4 shadow-[0_1px_2px_rgba(16,28,24,0.04)] transition hover:-translate-y-0.5 hover:shadow-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#17834D] sm:p-5">
              <span className={`mb-4 grid size-10 place-items-center rounded-xl ${tone}`}><Icon aria-hidden="true" className="size-5" /></span>
              <span className="flex items-center justify-between gap-2 text-sm font-bold text-[#183b2b]">{label}<ArrowUpRight aria-hidden="true" className="size-4 text-[#7b8b81] transition group-hover:text-[#17834D]" /></span>
              <span className="mt-1 block text-xs leading-5 text-[#728177]">{description} · demo</span>
            </Link>
          ))}
        </div>
      </section>

      <div className="grid min-w-0 gap-4 xl:grid-cols-[minmax(0,1.35fr)_minmax(300px,0.85fr)]">
        <div className="grid min-w-0 gap-4">
          <ChartCard title="Weather outlook" subtitle={weather ? "Seven-day temperature forecast · live" : "Seven-day temperature forecast · unavailable"} demo={false} action={<Link href="/weather" className="inline-flex items-center gap-1 text-xs font-bold text-[#17834D]">Details <ArrowRight aria-hidden="true" className="size-3.5" /></Link>}>
            <div className="mb-3 flex flex-wrap gap-3 text-[11px] font-medium text-[#68796f]">
              <span className="flex items-center gap-1.5"><span className="size-2 rounded-full bg-[#17834D]" /> High temperature{weather ? "" : " · unavailable"}</span>
              <span className="flex items-center gap-1.5"><span className="size-2 rounded-full bg-[#79aabd]" /> Low temperature{weather ? "" : " · unavailable"}</span>
            </div>
            {chartData.length ? <TemperatureChart compact data={chartData} /> : <p className="rounded-xl bg-[#f7f9f7] p-4 text-xs text-[#748279]">{weatherError || "Loading live weather…"}</p>}
          </ChartCard>

          <ChartCard title="Rain probability" subtitle={weather ? "Live forecast probability by day" : "Live forecast unavailable"} demo={false}>
            {chartData.length ? <RainfallChart data={chartData} /> : <p className="rounded-xl bg-[#f7f9f7] p-4 text-xs text-[#748279]">{weatherError || "Loading live weather…"}</p>}
          </ChartCard>
        </div>

        <div className="grid min-w-0 content-start gap-4">
          <Card className="p-5">
            <div className="mb-4 flex items-start justify-between gap-3">
              <div>
                <div className="flex flex-wrap items-center gap-2"><h2 className="text-[15px] font-bold text-[#183b2b]">Today in Salem</h2>{weather ? <span className="rounded-full bg-[#e6f4ea] px-2 py-1 text-[10px] font-bold text-[#17834D]">LIVE</span> : null}</div>
                <p className="mt-1 text-xs text-[#758279]">{weather ? "Open-Meteo · Salem demo coordinates" : "Live weather unavailable"}</p>
              </div>
              <CloudSun aria-hidden="true" className="size-6 text-[#d2a13a]" />
            </div>
            <div className="flex items-end gap-3">
              <span className="text-4xl font-extrabold tracking-tight text-[#183b2b]">{temperature == null ? "—" : `${Math.round(temperature)}°`}</span>
              <span className="pb-1 text-sm text-[#68796f]">{weather ? "Current temperature" : "Unavailable"}</span>
            </div>
            <div className="mt-5 grid grid-cols-2 gap-3 border-t border-[#edf1ee] pt-4">
              <div className="flex items-center gap-2 text-xs text-[#61746a]"><Droplets aria-hidden="true" className="size-4 text-[#508bb3]" /> Humidity <strong className="ml-auto text-[#294535]">{weather?.current?.humidity_percent == null ? "—" : `${Math.round(weather.current.humidity_percent)}%`}</strong></div>
              <div className="flex items-center gap-2 text-xs text-[#61746a]"><Wind aria-hidden="true" className="size-4 text-[#508bb3]" /> Wind <strong className="ml-auto text-[#294535]">{weather?.current?.wind_speed_kph == null ? "—" : `${Math.round(weather.current.wind_speed_kph)} km/h`}</strong></div>
            </div>
            <p className="mt-4 rounded-xl bg-[#f7f9f7] px-3 py-2.5 text-[11px] leading-5 text-[#748279]">{weather?.source.source_name ? `${weather.source.source_name} · ${weather.timezone}` : weatherError || "Connecting to weather service…"}</p>
          </Card>

          <Card className="p-5">
            <div className="mb-3 flex items-center justify-between gap-3"><div><h2 className="text-[15px] font-bold text-[#183b2b]">Market snapshot</h2><p className="mt-1 text-xs text-[#758279]">AGMARKNET / data.gov.in</p></div><Link href="/markets" className="text-xs font-bold text-[#17834D]">Compare →</Link></div>
            {market ? (
              <div>
                <p className="text-sm font-bold text-[#254632]">{market.commodity} · {market.market}</p>
                <p className="mt-2 text-2xl font-extrabold text-[#17834D]">₹{Number(market.modal_price_per_quintal).toLocaleString("en-IN")}/quintal</p>
                <p className="mt-1 text-xs text-[#68796f]">Arrival: {market.arrival_date}{market.stale ? " · stale arrival date" : ""}</p>
              </div>
            ) : (
              <p className="rounded-xl bg-[#f7f9f7] p-3 text-xs text-[#748279]">{marketError || "Loading live market data…"}</p>
            )}
          </Card>

          <Card style={{ backgroundColor: "#fafffb" }} className="border-[#dfece2] p-5">
            <div className="mb-3 flex flex-wrap items-center gap-2">
              <span className="grid size-9 place-items-center rounded-xl bg-[#e6f4ea] text-[#17834D]"><Sprout aria-hidden="true" className="size-5" /></span>
              <span className="text-sm font-bold text-[#183b2b]">Sample advisory preview</span>
              <DemoBadge>SAMPLE</DemoBadge>
            </div>
            <p className="text-sm font-semibold leading-6 text-[#294535]">Review the local forecast and your field conditions before planning irrigation.</p>
            <p className="mt-2 text-xs leading-5 text-[#66776d]">General interface example only; not crop-specific guidance or a recommendation to act.</p>
            <div className="mt-4 rounded-xl border border-[#f0dfb8] bg-[#fff9eb] p-3 text-[11px] leading-5 text-[#735b24]">
              Important: illustrative content is not verified agricultural advice. Confirm decisions with an agricultural extension professional.
            </div>
            <Link href="/advisories" className="mt-4 inline-flex min-h-10 items-center gap-1 text-xs font-bold text-[#17834D]">View advisory history <ArrowRight aria-hidden="true" className="size-3.5" /></Link>
          </Card>
        </div>
      </div>

      <p className="mt-6 flex items-start gap-2 rounded-xl border border-[#e5e9e6] bg-white/70 p-3 text-[11px] leading-5 text-[#728177]">
        <ArrowUpRight aria-hidden="true" className="mt-0.5 size-3.5 shrink-0" />
        Weather values are requested live from Open-Meteo through FastAPI. Market values, crop profiles and recommendations remain demonstration data.
      </p>
    </>
  );
}
