"use client";

import { useMemo, useState } from "react";
import { ChevronRight, Droplets, Leaf, Search, Sprout } from "lucide-react";
import { Card } from "@/components/ui/card";
import { DemoBadge, PageHeader, SearchInput } from "@/components/ui/primitives";

const cropList = [
  { name: "Rice", category: "Food grains", description: "Crop information layout preview." },
  { name: "Maize", category: "Food grains", description: "Crop information layout preview." },
  { name: "Groundnut", category: "Oilseeds", description: "Crop information layout preview." },
  { name: "Cotton", category: "Commercial crops", description: "Crop information layout preview." },
  { name: "Tomato", category: "Vegetables", description: "Crop information layout preview." },
  { name: "Onion", category: "Vegetables", description: "Crop information layout preview." },
];

const categories = ["All crops", "Food grains", "Oilseeds", "Vegetables", "Commercial crops"];
const growingStages = ["Establishment", "Vegetative growth", "Reproductive stage", "Maturity & harvest"];

export function CropsPage() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All crops");
  const [selectedCrop, setSelectedCrop] = useState("Rice");

  const visibleCrops = useMemo(() => cropList.filter((crop) => (
    (category === "All crops" || crop.category === category)
    && crop.name.toLowerCase().includes(query.trim().toLowerCase())
  )), [category, query]);
  const cropInfo = cropList.find((crop) => crop.name === selectedCrop) ?? cropList[0];

  return (
    <>
      <PageHeader
        eyebrow="Crop intelligence"
        title="Explore crop information"
        description="Browse a structured crop-information interface. Agronomic details, recommendations, schedules and inputs are deliberately not populated in this preview."
      />

      <Card className="mb-5 p-4 sm:p-5">
        <div className="mb-3 flex flex-wrap items-center gap-2"><h2 className="text-sm font-bold text-[#183b2b]">Find a crop</h2><DemoBadge>DEMO CATALOG</DemoBadge></div>
        <SearchInput value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search crops" aria-label="Search sample crops" />
        <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
          {categories.map((item) => (
            <button key={item} type="button" aria-pressed={category === item} onClick={() => setCategory(item)} className={`min-h-10 shrink-0 rounded-full px-4 text-xs font-semibold transition focus-visible:outline-2 focus-visible:outline-[#17834D] ${category === item ? "bg-[#123D2B] text-white" : "border border-[#dfe8e2] bg-white text-[#526b5b] hover:bg-[#f3f7f4]"}`}>
              {item}
            </button>
          ))}
        </div>
      </Card>

      <div className="grid min-w-0 items-start gap-5 xl:grid-cols-[minmax(280px,0.82fr)_minmax(0,1.4fr)]">
        <section>
          <div className="mb-3 flex items-center justify-between gap-2"><h2 className="text-base font-bold text-[#183b2b]">Crop categories</h2><DemoBadge /></div>
          {visibleCrops.length ? (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-2">
              {visibleCrops.map((crop) => (
                <button key={crop.name} type="button" aria-pressed={selectedCrop === crop.name} onClick={() => setSelectedCrop(crop.name)} className={`min-h-36 rounded-2xl border p-4 text-left transition focus-visible:outline-2 focus-visible:outline-[#17834D] ${selectedCrop === crop.name ? "border-[#80b794] bg-[#f7fcf8] shadow-[0_0_0_2px_rgba(23,131,77,0.08)]" : "border-[#e0e9e3] bg-white hover:border-[#b8d4c0]"}`}>
                  <span className="mb-3 grid size-10 place-items-center rounded-xl bg-[#eff6f0] text-[#17834D]"><Sprout aria-hidden="true" className="size-5" /></span>
                  <span className="block text-sm font-bold text-[#203c2c]">{crop.name} <span className="text-[9px] font-semibold text-[#9a792c]">DEMO</span></span>
                  <span className="mt-1 block text-[10px] text-[#7b8980]">{crop.category}</span>
                  <span className="mt-2 block text-[10px] leading-4 text-[#849188]">{crop.description}</span>
                </button>
              ))}
            </div>
          ) : (
            <Card className="p-8 text-center"><Search aria-hidden="true" className="mx-auto mb-2 size-5 text-[#829087]" /><p className="text-sm text-[#607268]">No sample crops match your search.</p></Card>
          )}
        </section>

        <section className="grid min-w-0 gap-4">
          <Card className="p-4 sm:p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <span className="grid size-12 place-items-center rounded-2xl bg-[#eff6f0] text-[#17834D]"><Sprout aria-hidden="true" className="size-6" /></span>
                <div><p className="text-[10px] font-bold uppercase tracking-wider text-[#17834D]">Crop profile · sample</p><h2 className="mt-1 text-xl font-extrabold text-[#183b2b]">{cropInfo.name}</h2><p className="mt-1 text-xs text-[#758279]">{cropInfo.category} · example interface</p></div>
              </div>
              <DemoBadge>DETAILS PLACEHOLDER</DemoBadge>
            </div>
            <p className="mt-4 rounded-xl bg-[#f7f9f7] p-3 text-xs leading-5 text-[#68796f]">Crop-specific facts are not yet sourced or validated for a local region. This screen intentionally avoids presenting planting advice, fertilizer doses, pesticide directions or irrigation prescriptions.</p>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <div className="rounded-xl border border-[#e5ece7] p-4">
                <div className="mb-2 flex items-center gap-2 text-xs font-bold text-[#456052]"><Leaf aria-hidden="true" className="size-4 text-[#17834D]" />Soil information</div>
                <p className="text-xs leading-5 text-[#7b8980]">Placeholder. Add region-specific soil information only after review against an attributable source.</p>
              </div>
              <div className="rounded-xl border border-[#e5ece7] p-4">
                <div className="mb-2 flex items-center gap-2 text-xs font-bold text-[#456052]"><Droplets aria-hidden="true" className="size-4 text-[#508bb3]" />Irrigation information</div>
                <p className="text-xs leading-5 text-[#7b8980]">Placeholder. No schedule, quantity or instruction is available in this phase.</p>
              </div>
            </div>
          </Card>

          <Card className="p-4 sm:p-5">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-2"><div className="flex items-center gap-2"><Sprout aria-hidden="true" className="size-4 text-[#17834D]" /><h2 className="text-sm font-bold text-[#183b2b]">Growing-stage timeline</h2></div><DemoBadge>GENERIC UI ONLY</DemoBadge></div>
            <ol className="grid gap-3 sm:grid-cols-2">
              {growingStages.map((stage, index) => (
                <li key={stage} className="flex min-h-[72px] items-center gap-3 rounded-xl border border-[#e7ede8] p-3">
                  <span className="grid size-8 shrink-0 place-items-center rounded-full bg-[#e6f4ea] text-xs font-bold text-[#17834D]">{index + 1}</span>
                  <span className="min-w-0"><span className="block text-xs font-bold text-[#456052]">{stage}</span><span className="mt-1 block text-[10px] text-[#87938b]">Timing and practices not provided</span></span>
                  <ChevronRight aria-hidden="true" className="ml-auto size-4 shrink-0 text-[#9aa69e]" />
                </li>
              ))}
            </ol>
          </Card>

          <Card className="p-4 sm:p-5">
            <h2 className="text-sm font-bold text-[#183b2b]">Knowledge source attribution</h2>
            <div className="mt-3 flex flex-col gap-2 rounded-xl border border-dashed border-[#d8e2dc] bg-[#fafcfb] p-4 text-xs leading-5 text-[#78867d] sm:flex-row sm:items-center sm:justify-between">
              <span>Source: placeholder · no curated source attached</span>
              <span>Reviewed: not available</span>
            </div>
          </Card>
        </section>
      </div>
    </>
  );
}
