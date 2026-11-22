import Link from "next/link";
import {
  ArrowDownRight,
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
import { MarketTrendChart, RainfallChart, TemperatureChart } from "@/components/charts/intelligence-charts";
import { Card } from "@/components/ui/card";
import { ChartCard, DemoBadge, MetricCard, PageHeader, SectionTitle } from "@/components/ui/primitives";

const quickActions = [
  { href: "/assistant", label: "Ask AI", description: "Explore the assistant preview", icon: Bot, tone: "bg-[#e6f4ea] text-[#17834D]" },
  { href: "/weather", label: "Check weather", description: "View sample forecast", icon: CloudSun, tone: "bg-[#e8f1fb] text-[#3774a6]" },
  { href: "/markets", label: "Compare prices", description: "Explore demo mandi data", icon: ShoppingBasket, tone: "bg-[#fff4dd] text-[#9b741f]" },
  { href: "/crops", label: "Crop guidance", description: "Browse information placeholders", icon: Sprout, tone: "bg-[#f0eafa] text-[#7252a3]" },
];

export function DashboardPage() {
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
        <MetricCard label="Current temperature" value="28°C" detail="Salem · illustrative" icon={CloudSun} accent="amber" />
        <MetricCard label="Rain probability" value="42%" detail="Today · illustrative" icon={CloudRain} accent="blue" />
        <MetricCard label="Active crops" value="3 crops" detail="Sample farm profile" icon={Sprout} />
        <MetricCard label="Tomato modal price" value="₹2,450" detail="Per quintal · demo" icon={ShoppingBasket} accent="violet" />
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
          <ChartCard title="Weather outlook" subtitle="Seven-day temperature forecast · sample values" action={<Link href="/weather" className="inline-flex items-center gap-1 text-xs font-bold text-[#17834D]">Details <ArrowRight aria-hidden="true" className="size-3.5" /></Link>}>
            <div className="mb-3 flex flex-wrap gap-3 text-[11px] font-medium text-[#68796f]">
              <span className="flex items-center gap-1.5"><span className="size-2 rounded-full bg-[#17834D]" /> High temperature · demo</span>
              <span className="flex items-center gap-1.5"><span className="size-2 rounded-full bg-[#79aabd]" /> Low temperature · demo</span>
            </div>
            <TemperatureChart compact />
          </ChartCard>

          <ChartCard title="Rain probability" subtitle="Sample forecast probability by day">
            <RainfallChart />
          </ChartCard>
        </div>

        <div className="grid min-w-0 content-start gap-4">
          <Card className="p-5">
            <div className="mb-4 flex items-start justify-between gap-3">
              <div>
                <div className="flex flex-wrap items-center gap-2"><h2 className="text-[15px] font-bold text-[#183b2b]">Today in Salem</h2><DemoBadge>DEMO</DemoBadge></div>
                <p className="mt-1 text-xs text-[#758279]">Sample conditions · Salem, Tamil Nadu</p>
              </div>
              <CloudSun aria-hidden="true" className="size-6 text-[#d2a13a]" />
            </div>
            <div className="flex items-end gap-3">
              <span className="text-4xl font-extrabold tracking-tight text-[#183b2b]">28°</span>
              <span className="pb-1 text-sm text-[#68796f]">Partly cloudy · demo</span>
            </div>
            <div className="mt-5 grid grid-cols-2 gap-3 border-t border-[#edf1ee] pt-4">
              <div className="flex items-center gap-2 text-xs text-[#61746a]"><Droplets aria-hidden="true" className="size-4 text-[#508bb3]" /> Humidity <strong className="ml-auto text-[#294535]">68% · demo</strong></div>
              <div className="flex items-center gap-2 text-xs text-[#61746a]"><Wind aria-hidden="true" className="size-4 text-[#508bb3]" /> Wind <strong className="ml-auto text-[#294535]">12 km/h · demo</strong></div>
            </div>
            <p className="mt-4 rounded-xl bg-[#f7f9f7] px-3 py-2.5 text-[11px] leading-5 text-[#748279]">Illustrative interface values only. Weather source and observation time are not connected.</p>
          </Card>

          <ChartCard title="Market snapshot" subtitle="Illustrative modal prices · ₹ per quintal" action={<Link href="/markets" className="text-xs font-bold text-[#17834D]">Compare →</Link>}>
            <MarketTrendChart />
            <div className="mt-2 flex flex-wrap items-center gap-2 border-t border-[#edf1ee] pt-3 text-xs">
              <span className="font-bold text-[#254632]">Tomato · Salem</span>
              <span className="font-semibold text-[#17834D]">₹2,450/qtl</span>
              <span className="inline-flex items-center text-[#68796f]"><ArrowDownRight aria-hidden="true" className="size-3.5" /> ₹40 vs prior sample</span>
            </div>
          </ChartCard>

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
        No live weather, market or AI service is connected. All figures, locations and recommendations on this dashboard are sample data for interface demonstration.
      </p>
    </>
  );
}
