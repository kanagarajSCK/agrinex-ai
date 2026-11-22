import {
  Cloud,
  CloudRain,
  CloudSun,
  Droplets,
  MapPin,
  Sun,
  Wind,
} from "lucide-react";
import { TemperatureChart, RainfallChart } from "@/components/charts/intelligence-charts";
import { Card } from "@/components/ui/card";
import { ChartCard, DemoBadge, MetricCard, PageHeader } from "@/components/ui/primitives";

const forecast = [
  { day: "Today", icon: CloudSun, high: "31°", low: "23°", rain: "42%" },
  { day: "Tue", icon: Sun, high: "30°", low: "22°", rain: "35%" },
  { day: "Wed", icon: Cloud, high: "32°", low: "23°", rain: "18%" },
  { day: "Thu", icon: CloudRain, high: "31°", low: "22°", rain: "52%" },
  { day: "Fri", icon: CloudRain, high: "29°", low: "22°", rain: "68%" },
  { day: "Sat", icon: Cloud, high: "30°", low: "21°", rain: "38%" },
  { day: "Sun", icon: Sun, high: "31°", low: "22°", rain: "24%" },
];

export function WeatherPage() {
  return (
    <>
      <PageHeader
        eyebrow="Weather intelligence"
        title="Weather for your farm"
        description="Explore the weather dashboard layout with sample conditions for Salem. No forecast provider or live location is connected."
        action={<span className="flex min-h-11 items-center gap-2 rounded-xl border border-[#dfe8e2] bg-white px-3.5 text-sm font-semibold text-[#42604e]"><MapPin aria-hidden="true" className="size-4 text-[#17834D]" /> Salem, Tamil Nadu <DemoBadge>SAMPLE</DemoBadge></span>}
      />

      <Card style={{ backgroundColor: "#123D2B" }} className="mb-5 overflow-hidden p-5 text-white sm:mb-6 sm:p-7">
        <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-center">
          <div>
            <div className="mb-4 flex flex-wrap items-center gap-2"><span className="text-xs font-semibold text-[#d3ebda]">CURRENT CONDITIONS</span><DemoBadge>DEMO DATA</DemoBadge></div>
            <p className="text-5xl font-extrabold tracking-tight sm:text-6xl">28°<span className="ml-2 text-base font-semibold text-[#d3ebda]">C</span></p>
            <p className="mt-2 text-sm text-[#d0e2d5]">Partly cloudy · illustrative only</p>
            <p className="mt-1 text-xs text-[#a8c6b3]">Feels like 30° · sample value</p>
          </div>
          <div className="flex items-center justify-between gap-5 rounded-2xl border border-white/10 bg-white/5 px-5 py-4 sm:min-w-64">
            <div><p className="text-xs text-[#c6dece]">Salem, Tamil Nadu</p><p className="mt-1 text-xs text-[#a8c6b3]">Location preview · not detected</p></div>
            <CloudSun aria-hidden="true" className="size-12 text-[#f3cf79]" strokeWidth={1.5} />
          </div>
        </div>
        <div className="mt-6 grid grid-cols-2 gap-3 border-t border-white/10 pt-5 sm:grid-cols-4">
          <div className="flex items-center gap-2.5"><Droplets aria-hidden="true" className="size-4 text-[#b9dbe5]" /><div><p className="text-[10px] text-[#b8d2c2]">Humidity</p><p className="text-sm font-bold">68% · demo</p></div></div>
          <div className="flex items-center gap-2.5"><Wind aria-hidden="true" className="size-4 text-[#b9dbe5]" /><div><p className="text-[10px] text-[#b8d2c2]">Wind</p><p className="text-sm font-bold">12 km/h · demo</p></div></div>
          <div className="flex items-center gap-2.5"><CloudRain aria-hidden="true" className="size-4 text-[#b9dbe5]" /><div><p className="text-[10px] text-[#b8d2c2]">Rain chance</p><p className="text-sm font-bold">42% · demo</p></div></div>
          <div className="flex items-center gap-2.5"><Sun aria-hidden="true" className="size-4 text-[#f3cf79]" /><div><p className="text-[10px] text-[#b8d2c2]">UV index</p><p className="text-sm font-bold">6 · sample</p></div></div>
        </div>
      </Card>

      <section aria-label="Weather metrics" className="mb-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <MetricCard label="Humidity" value="68%" detail="Illustrative value" icon={Droplets} accent="blue" />
        <MetricCard label="Wind speed" value="12 km/h" detail="Illustrative value" icon={Wind} accent="blue" />
        <MetricCard label="Rain probability" value="42%" detail="Illustrative value" icon={CloudRain} accent="green" />
        <MetricCard label="High / low" value="31° / 23°" detail="Illustrative value" icon={CloudSun} accent="amber" />
      </section>

      <section aria-label="Seven-day sample forecast" className="mb-5">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2"><h2 className="text-base font-bold text-[#183b2b]">Seven-day forecast</h2><DemoBadge>SAMPLE FORECAST</DemoBadge></div>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 xl:grid-cols-7">
          {forecast.map(({ day, icon: Icon, high, low, rain }) => (
            <Card key={day} className="p-3 text-center sm:p-4">
              <p className="text-xs font-bold text-[#43604e]">{day}</p>
              <Icon aria-hidden="true" className="mx-auto my-3 size-6 text-[#528b66]" />
              <p className="text-sm font-extrabold text-[#183b2b]">{high}<span className="ml-1 text-xs font-medium text-[#89958e]">{low}</span></p>
              <p className="mt-2 text-[10px] text-[#718278]">{rain} rain · demo</p>
            </Card>
          ))}
        </div>
      </section>

      <div className="grid min-w-0 gap-4 xl:grid-cols-2">
        <ChartCard title="Temperature trend" subtitle="High and low temperatures · °C · sample data">
          <div className="mb-3 flex gap-4 text-[11px] text-[#68796f]"><span className="flex items-center gap-1.5"><span className="size-2 rounded-full bg-[#17834D]" />High · demo</span><span className="flex items-center gap-1.5"><span className="size-2 rounded-full bg-[#79aabd]" />Low · demo</span></div>
          <TemperatureChart compact />
        </ChartCard>
        <ChartCard title="Rainfall probability" subtitle="Chance of rain by day · illustrative percentages">
          <RainfallChart />
        </ChartCard>
      </div>

      <Card className="mt-5 flex flex-col gap-2 p-4 text-xs leading-5 text-[#6e7c73] sm:flex-row sm:items-center sm:justify-between sm:px-5">
        <p><strong className="text-[#40594a]">Data source:</strong> Placeholder · no provider connected</p>
        <p><strong className="text-[#40594a]">Updated:</strong> No live timestamp available · sample view</p>
      </Card>
    </>
  );
}
