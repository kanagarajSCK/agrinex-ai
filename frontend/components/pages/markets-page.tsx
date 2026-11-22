"use client";

import { useMemo, useState } from "react";
import { ArrowDownRight, ArrowUpRight, ChartNoAxesCombined, Clock3, MapPin, Search, ShoppingBasket } from "lucide-react";
import { MarketTrendChart } from "@/components/charts/intelligence-charts";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ChartCard, DemoBadge, DemoSelect, PageHeader, SearchInput } from "@/components/ui/primitives";

const marketPrices = [
  { crop: "Tomato", market: "Salem", price: 2450, unit: "₹/quintal", movement: "−₹40", direction: "down", updated: "Sample entry" },
  { crop: "Tomato", market: "Erode", price: 2400, unit: "₹/quintal", movement: "+₹20", direction: "up", updated: "Sample entry" },
  { crop: "Tomato", market: "Namakkal", price: 2370, unit: "₹/quintal", movement: "+₹10", direction: "up", updated: "Sample entry" },
  { crop: "Onion", market: "Salem", price: 1850, unit: "₹/quintal", movement: "+₹30", direction: "up", updated: "Sample entry" },
  { crop: "Onion", market: "Erode", price: 1790, unit: "₹/quintal", movement: "−₹15", direction: "down", updated: "Sample entry" },
  { crop: "Maize", market: "Namakkal", price: 2180, unit: "₹/quintal", movement: "+₹0", direction: "up", updated: "Sample entry" },
  { crop: "Turmeric", market: "Erode", price: 7250, unit: "₹/quintal", movement: "−₹50", direction: "down", updated: "Sample entry" },
];

export function MarketsPage() {
  const [commodity, setCommodity] = useState("All commodities");
  const [market, setMarket] = useState("All markets");
  const [search, setSearch] = useState("");

  const filteredPrices = useMemo(() => marketPrices.filter((item) => {
    const matchesCommodity = commodity === "All commodities" || item.crop === commodity;
    const matchesMarket = market === "All markets" || item.market === market;
    const query = search.trim().toLowerCase();
    const matchesSearch = !query || `${item.crop} ${item.market}`.toLowerCase().includes(query);
    return matchesCommodity && matchesMarket && matchesSearch;
  }), [commodity, market, search]);

  return (
    <>
      <PageHeader
        eyebrow="Market intelligence"
        title="Compare market prices"
        description="Browse interface examples for commodity and market comparisons. All prices are fabricated demonstration values, not verified market information."
        action={<span className="flex items-center gap-2 text-xs text-[#6e7c73]"><Clock3 aria-hidden="true" className="size-4" />Updated time unavailable</span>}
      />

      <Card className="mb-5 p-4 sm:p-5">
        <div className="mb-3 flex flex-wrap items-center gap-2"><h2 className="text-sm font-bold text-[#183b2b]">Search and filter</h2><DemoBadge>LOCAL SAMPLE DATA</DemoBadge></div>
        <div className="grid gap-3 md:grid-cols-[minmax(220px,1fr)_minmax(160px,0.65fr)_minmax(160px,0.65fr)]">
          <SearchInput value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search crops or markets" aria-label="Search demo market prices" />
          <DemoSelect aria-label="Select commodity" value={commodity} onChange={(event) => setCommodity(event.target.value)}>
            <option>All commodities</option><option>Tomato</option><option>Onion</option><option>Maize</option><option>Turmeric</option>
          </DemoSelect>
          <DemoSelect aria-label="Select market" value={market} onChange={(event) => setMarket(event.target.value)}>
            <option>All markets</option><option>Salem</option><option>Erode</option><option>Namakkal</option>
          </DemoSelect>
        </div>
        <p className="mt-2 text-[11px] text-[#829087]">Filters run only against sample entries stored in this page.</p>
      </Card>

      <div className="mb-5 grid min-w-0 gap-4 xl:grid-cols-[minmax(0,1.4fr)_minmax(280px,0.8fr)]">
        <ChartCard title="Market price comparison" subtitle="Sample tomato modal values · ₹ per quintal · not actual market data">
          <div className="mb-3 flex flex-wrap gap-3 text-[11px] text-[#68796f]">
            {[["#17834D", "Salem"], ["#77a6c1", "Erode"], ["#d3a548", "Namakkal"]].map(([color, label]) => <span key={label} className="flex items-center gap-1.5"><span className="size-2 rounded-full" style={{ backgroundColor: color }} />{label} · demo</span>)}
          </div>
          <MarketTrendChart commodity={commodity === "All commodities" ? "Tomato" : commodity} />
          <p className="mt-1 flex items-center gap-2 text-[11px] text-[#829087]"><ChartNoAxesCombined aria-hidden="true" className="size-3.5" />Illustrative trend values · source not connected</p>
        </ChartCard>

        <Card className="p-5">
          <div className="mb-4 flex items-center gap-2"><span className="grid size-9 place-items-center rounded-xl bg-[#fff4dd] text-[#9b741f]"><ShoppingBasket aria-hidden="true" className="size-[18px]" /></span><div><h2 className="text-sm font-bold text-[#183b2b]">Price trend preview</h2><p className="text-[11px] text-[#829087]">Values are for UI demonstration only</p></div></div>
          <div className="rounded-2xl bg-[#f7f9f7] p-4">
            <div className="flex items-start justify-between gap-2"><div><p className="text-xs font-semibold text-[#6f7e75]">Tomato · Salem</p><p className="mt-2 text-3xl font-extrabold tracking-tight text-[#183b2b]">₹2,450</p><p className="mt-1 text-[11px] text-[#829087]">Per quintal · DEMO</p></div><DemoBadge>DEMO</DemoBadge></div>
            <div className="mt-4 flex items-center gap-2 border-t border-[#e6ece7] pt-3 text-xs"><span className="inline-flex items-center gap-1 font-bold text-[#946c27]"><ArrowDownRight aria-hidden="true" className="size-4" /> ₹40</span><span className="text-[#829087]">vs previous sample entry</span></div>
          </div>
          <div className="mt-4 space-y-3 text-xs text-[#6e7c73]">
            <p className="flex items-center justify-between gap-2"><span>Market source</span><strong className="text-[#456052]">Placeholder</strong></p>
            <p className="flex items-center justify-between gap-2"><span>Last updated</span><strong className="text-[#456052]">Not available</strong></p>
            <p className="flex items-center justify-between gap-2"><span>Price type</span><strong className="text-[#456052]">Modal · sample</strong></p>
          </div>
        </Card>
      </div>

      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2"><h2 className="text-base font-bold text-[#183b2b]">Market price cards</h2><DemoBadge /></div>
        <span className="text-xs text-[#7b8980]">{filteredPrices.length} sample {filteredPrices.length === 1 ? "entry" : "entries"}</span>
      </div>
      {filteredPrices.length ? (
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {filteredPrices.map((item) => {
            const TrendIcon = item.direction === "up" ? ArrowUpRight : ArrowDownRight;
            return (
              <Card key={`${item.crop}-${item.market}`} className="p-4 sm:p-5">
                <div className="flex items-start justify-between gap-3"><div><p className="text-sm font-bold text-[#183b2b]">{item.crop}</p><p className="mt-1 flex items-center gap-1 text-xs text-[#758279]"><MapPin aria-hidden="true" className="size-3.5" />{item.market} market · sample</p></div><DemoBadge /></div>
                <div className="mt-4 flex items-end justify-between gap-2"><div><p className="text-2xl font-extrabold tracking-tight text-[#193c2b]">₹{item.price.toLocaleString("en-IN")}</p><p className="mt-1 text-[11px] text-[#829087]">{item.unit} · demo</p></div><span className="inline-flex items-center gap-1 rounded-lg bg-[#f5f8f5] px-2 py-1 text-xs font-semibold text-[#587064]"><TrendIcon aria-hidden="true" className="size-3.5" />{item.movement} sample</span></div>
                <p className="mt-4 border-t border-[#edf1ee] pt-3 text-[10px] text-[#829087]">Source and updated time: {item.updated.toLowerCase()} · no live provider</p>
              </Card>
            );
          })}
        </div>
      ) : (
        <Card className="p-8 text-center"><Search aria-hidden="true" className="mx-auto mb-2 size-5 text-[#829087]" /><p className="text-sm font-semibold text-[#456052]">No sample entries match these filters.</p><Button variant="secondary" className="mt-4" onClick={() => { setSearch(""); setMarket("All markets"); setCommodity("All commodities"); }}>Clear filters</Button></Card>
      )}

      <p className="mt-5 rounded-xl border border-[#f0dfb8] bg-[#fff9eb] p-4 text-xs leading-5 text-[#735b24]">Important: all prices, movements, markets and charts on this page are fictional UI demonstration data. They do not describe actual market activity or support a sell/hold decision.</p>
    </>
  );
}
