"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  Bug,
  Calendar,
  CheckCircle2,
  Droplets,
  ExternalLink,
  Layers,
  Leaf,
  MapPin,
  MessageSquare,
  Search,
  ShieldCheck,
  ShoppingBasket,
  Sparkles,
  Sprout,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { PageHeader, SearchInput } from "@/components/ui/primitives";
import { useLocation } from "@/contexts/location-context";
import {
  CROP_CATEGORIES,
  CROPS_DATA,
  type CropCategory,
  type CropProfile,
} from "@/lib/crops";

type DetailTab =
  | "agronomy"
  | "fertilizer"
  | "irrigation"
  | "stages"
  | "pests"
  | "harvest";

export function CropsPage() {
  const { location, openOnboarding } = useLocation();

  const [query, setQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<CropCategory>("All crops");
  const [selectedCropId, setSelectedCropId] = useState<string>("rice");
  const [activeDetailTab, setActiveDetailTab] = useState<DetailTab>("agronomy");

  const locationName = location?.formattedName || "Salem, Tamil Nadu";

  // Filter crops by category and query (English, Tamil local name, or botanical name)
  const visibleCrops = useMemo(() => {
    const q = query.trim().toLowerCase();
    return CROPS_DATA.filter((crop) => {
      const matchesCategory =
        selectedCategory === "All crops" || crop.category === selectedCategory;
      const matchesQuery =
        !q ||
        crop.name.toLowerCase().includes(q) ||
        crop.localName.toLowerCase().includes(q) ||
        crop.botanicalName.toLowerCase().includes(q) ||
        crop.category.toLowerCase().includes(q);
      return matchesCategory && matchesQuery;
    });
  }, [selectedCategory, query]);

  // Selected crop object fallback
  const currentCrop: CropProfile =
    CROPS_DATA.find((c) => c.id === selectedCropId) ||
    visibleCrops[0] ||
    CROPS_DATA[0];

  return (
    <>
      <PageHeader
        eyebrow="Crop intelligence"
        title="Crop Production & Agronomic Intelligence"
        description="Evidence-based crop production guides, nutrient schedules, irrigation requirements, and integrated pest management verified against TNAU and ICAR agricultural university standards."
        badge={
          <span className="inline-flex items-center gap-1.5 rounded-full bg-[#e6f4ea] px-3 py-1 text-xs font-bold text-[#15803d]">
            <CheckCircle2 className="size-3.5" /> University-Verified Agronomy
          </span>
        }
        action={
          <div className="flex items-center gap-2 rounded-2xl border border-[#dfe8e2] bg-white p-1.5 shadow-sm">
            <span className="grid size-7 place-items-center rounded-xl bg-[#eaf4ec] text-[#17834D]">
              <MapPin className="size-3.5" />
            </span>
            <div className="text-left text-xs pr-2">
              <span className="block text-[10px] font-bold uppercase text-[#73887c]">
                Farming Region
              </span>
              <span className="font-bold text-[#183b2b] truncate max-w-[170px] block">
                {locationName}
              </span>
            </div>
            <button
              type="button"
              onClick={() => openOnboarding("gps")}
              className="rounded-lg bg-[#f0f6f2] px-2.5 py-1 text-[11px] font-semibold text-[#17834D] hover:bg-[#e4efe6]"
            >
              Change
            </button>
          </div>
        }
      />

      {/* Filter and Search Bar */}
      <Card className="mb-5 p-4 sm:p-5">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Sprout className="size-4 text-[#17834D]" />
            <h2 className="text-sm font-bold text-[#183b2b]">
              Browse Crop Production Directory
            </h2>
          </div>
          <span className="text-xs font-semibold text-[#6a8073]">
            Showing {visibleCrops.length} verified crop {visibleCrops.length === 1 ? "guide" : "guides"}
          </span>
        </div>

        <SearchInput
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search by crop name (e.g. Rice, Nel, Tomato, Groundnut, Cotton, Turmeric)…"
          aria-label="Search crops"
        />

        <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
          {CROP_CATEGORIES.map((cat) => (
            <button
              key={cat}
              type="button"
              aria-pressed={selectedCategory === cat}
              onClick={() => setSelectedCategory(cat)}
              className={`min-h-9 shrink-0 rounded-full px-4 text-xs font-semibold transition focus-visible:outline-2 focus-visible:outline-[#17834D] ${
                selectedCategory === cat
                  ? "bg-[#123D2B] text-white shadow-sm"
                  : "border border-[#dfe8e2] bg-white text-[#526b5b] hover:bg-[#f3f7f4]"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </Card>

      {/* Main Grid: Left List + Right Detail */}
      <div className="grid min-w-0 items-start gap-5 xl:grid-cols-[minmax(300px,0.85fr)_minmax(0,1.4fr)]">
        {/* Left Column: Crop Cards */}
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold uppercase tracking-wider text-[#73887c]">
              Select Crop Profile
            </h2>
          </div>

          {visibleCrops.length > 0 ? (
            <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 xl:grid-cols-1">
              {visibleCrops.map((crop) => {
                const isSelected = currentCrop.id === crop.id;
                return (
                  <button
                    key={crop.id}
                    type="button"
                    aria-pressed={isSelected}
                    onClick={() => {
                      setSelectedCropId(crop.id);
                    }}
                    className={`flex items-start gap-3.5 rounded-2xl border p-3.5 text-left transition focus-visible:outline-2 focus-visible:outline-[#17834D] ${
                      isSelected
                        ? "border-[#17834D] bg-[#f4fbf5] shadow-[0_0_0_2px_rgba(23,131,77,0.15)]"
                        : "border-[#e0e9e3] bg-white hover:border-[#b8d4c0] hover:bg-[#fafdfa]"
                    }`}
                  >
                    <span
                      className={`grid size-11 shrink-0 place-items-center rounded-xl transition ${
                        isSelected
                          ? "bg-[#17834D] text-white"
                          : "bg-[#eff6f0] text-[#17834D]"
                      }`}
                    >
                      <Sprout className="size-5" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-extrabold text-[#183b2b] text-sm truncate">
                          {crop.name}
                        </span>
                        <span className="rounded-md bg-[#edf4ef] px-2 py-0.5 text-[10px] font-bold text-[#1b5e39]">
                          {crop.category}
                        </span>
                      </div>
                      <span className="block text-xs font-semibold text-[#17834D] mt-0.5">
                        {crop.localName}
                      </span>
                      <p className="mt-1 text-[11px] text-[#63796d] line-clamp-1 italic">
                        {crop.botanicalName} · {crop.duration}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          ) : (
            <Card className="p-8 text-center">
              <Search className="mx-auto mb-2 size-6 text-[#829087]" />
              <p className="text-sm font-bold text-[#183b2b]">
                No verified crops match your search
              </p>
              <p className="mt-1 text-xs text-[#607268]">
                Try searching for common names like Rice, Tomato, Groundnut, Cotton, or Onion.
              </p>
            </Card>
          )}
        </section>

        {/* Right Column: Detailed Verified Crop Profile */}
        <section className="space-y-4">
          {/* Header Card */}
          <Card className="p-5 sm:p-6 border-[#dbe6df] bg-gradient-to-br from-white to-[#fbfdfb]">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="flex items-start gap-4">
                <span className="grid size-14 place-items-center rounded-2xl bg-[#e6f4ea] text-[#17834D] shadow-sm">
                  <Sprout className="size-7" />
                </span>
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-full bg-[#17834D]/10 px-2.5 py-0.5 text-[11px] font-bold text-[#17834D]">
                      {currentCrop.category}
                    </span>
                    <span className="text-xs font-semibold text-[#667e71]">
                      Duration: {currentCrop.duration}
                    </span>
                  </div>
                  <h1 className="mt-1.5 text-2xl font-extrabold tracking-tight text-[#123D2B]">
                    {currentCrop.name}
                  </h1>
                  <p className="text-sm font-semibold text-[#17834D]">
                    {currentCrop.localName} ·{" "}
                    <span className="italic font-normal text-[#5a7265]">
                      {currentCrop.botanicalName}
                    </span>
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-2">
                <Link
                  href={`/markets?commodity=${encodeURIComponent(currentCrop.mandiCommodity)}`}
                  className="inline-flex min-h-10 items-center gap-1.5 rounded-xl border border-[#dfe8e2] bg-white px-3.5 text-xs font-bold text-[#183b2b] shadow-sm transition hover:border-[#17834D] hover:bg-[#f6fbf7]"
                >
                  <ShoppingBasket className="size-4 text-[#17834D]" />
                  Check Mandi Prices
                </Link>
                <Link
                  href={`/assistant?q=${encodeURIComponent(
                    `What is the recommended fertilizer schedule and pest management for ${currentCrop.name} in ${locationName}?`
                  )}`}
                  className="inline-flex min-h-10 items-center gap-1.5 rounded-xl bg-[#17834D] px-3.5 text-xs font-bold text-white shadow-sm transition hover:bg-[#123D2B]"
                >
                  <MessageSquare className="size-4" />
                  Ask AI Assistant
                </Link>
              </div>
            </div>

            <p className="mt-4 text-xs leading-6 text-[#455c4f] sm:text-sm">
              {currentCrop.summary}
            </p>

            {/* Quick Metrics Bar */}
            <div className="mt-5 grid grid-cols-2 gap-2.5 sm:grid-cols-4">
              <div className="rounded-xl border border-[#e1ece4] bg-[#f8faf8] p-3">
                <span className="block text-[10px] font-bold uppercase tracking-wider text-[#708579]">
                  Duration
                </span>
                <span className="mt-0.5 block text-xs font-extrabold text-[#183b2b]">
                  {currentCrop.duration}
                </span>
              </div>
              <div className="rounded-xl border border-[#e1ece4] bg-[#f8faf8] p-3">
                <span className="block text-[10px] font-bold uppercase tracking-wider text-[#708579]">
                  Optimal Temp
                </span>
                <span className="mt-0.5 block text-xs font-extrabold text-[#183b2b]">
                  {currentCrop.temperature}
                </span>
              </div>
              <div className="rounded-xl border border-[#e1ece4] bg-[#f8faf8] p-3">
                <span className="block text-[10px] font-bold uppercase tracking-wider text-[#708579]">
                  Water Need
                </span>
                <span className="mt-0.5 block text-xs font-extrabold text-[#183b2b]">
                  {currentCrop.irrigation.waterRequirement}
                </span>
              </div>
              <div className="rounded-xl border border-[#e1ece4] bg-[#f8faf8] p-3">
                <span className="block text-[10px] font-bold uppercase tracking-wider text-[#708579]">
                  Expected Yield
                </span>
                <span className="mt-0.5 block text-xs font-extrabold text-[#166534]">
                  {currentCrop.harvesting.expectedYield.split("(")[0]}
                </span>
              </div>
            </div>
          </Card>

          {/* Interactive Detail Tabs */}
          <div className="flex gap-1.5 overflow-x-auto border-b border-[#dfe8e1] pb-px">
            {[
              { id: "agronomy", label: "Agronomy & Soil", icon: Leaf },
              { id: "fertilizer", label: "Nutrient (NPK)", icon: Layers },
              { id: "irrigation", label: "Irrigation", icon: Droplets },
              { id: "stages", label: "Growth Timeline", icon: Calendar },
              { id: "pests", label: "Pest & Disease (IPM)", icon: Bug },
              { id: "harvest", label: "Harvest & Post-Harvest", icon: CheckCircle2 },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeDetailTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveDetailTab(tab.id as DetailTab)}
                  className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-t-xl px-4 py-2.5 text-xs font-bold transition ${
                    isActive
                      ? "border-b-2 border-[#17834D] bg-white text-[#17834D]"
                      : "text-[#587063] hover:bg-white/60 hover:text-[#183b2b]"
                  }`}
                >
                  <Icon className="size-3.5" />
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* TAB 1: AGRONOMY & SOIL */}
          {activeDetailTab === "agronomy" && (
            <Card className="p-5 sm:p-6 space-y-5">
              <div>
                <h3 className="text-sm font-extrabold text-[#183b2b] flex items-center gap-2">
                  <Leaf className="size-4 text-[#17834D]" />
                  Soil Suitability & Land Preparation
                </h3>
                <div className="mt-3 grid gap-3 sm:grid-cols-2">
                  <div className="rounded-xl border border-[#e1ece4] p-3.5">
                    <span className="block text-[11px] font-bold uppercase text-[#73887c]">
                      Recommended Soil Type
                    </span>
                    <p className="mt-1 text-xs leading-5 text-[#243f30]">
                      {currentCrop.soilType}
                    </p>
                  </div>
                  <div className="rounded-xl border border-[#e1ece4] p-3.5">
                    <span className="block text-[11px] font-bold uppercase text-[#73887c]">
                      Soil pH Range
                    </span>
                    <p className="mt-1 text-xs leading-5 text-[#243f30]">
                      {currentCrop.soilPh}
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-extrabold text-[#183b2b] flex items-center gap-2">
                  <Calendar className="size-4 text-[#17834D]" />
                  Sowing Seasons & Seed Rate
                </h3>
                <div className="mt-3 grid gap-3 sm:grid-cols-3">
                  <div className="rounded-xl border border-[#e1ece4] p-3.5">
                    <span className="block text-[11px] font-bold uppercase text-[#73887c]">
                      Sowing Season
                    </span>
                    <p className="mt-1 text-xs font-semibold text-[#243f30]">
                      {currentCrop.season}
                    </p>
                  </div>
                  <div className="rounded-xl border border-[#e1ece4] p-3.5">
                    <span className="block text-[11px] font-bold uppercase text-[#73887c]">
                      Seed Rate
                    </span>
                    <p className="mt-1 text-xs font-semibold text-[#243f30]">
                      {currentCrop.seedRate}
                    </p>
                  </div>
                  <div className="rounded-xl border border-[#e1ece4] p-3.5">
                    <span className="block text-[11px] font-bold uppercase text-[#73887c]">
                      Spacing
                    </span>
                    <p className="mt-1 text-xs font-semibold text-[#243f30]">
                      {currentCrop.spacing}
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-extrabold text-[#183b2b] flex items-center gap-2">
                  <Sparkles className="size-4 text-[#17834D]" />
                  Popular University-Recommended Varieties
                </h3>
                <div className="mt-2.5 flex flex-wrap gap-2">
                  {currentCrop.popularVarieties.map((v) => (
                    <span
                      key={v}
                      className="rounded-lg border border-[#cbe1d2] bg-[#f4faf6] px-3 py-1 text-xs font-bold text-[#166534]"
                    >
                      {v}
                    </span>
                  ))}
                </div>
              </div>

              <div className="rounded-xl border border-[#e3ebe5] bg-[#fafcfb] p-3.5">
                <span className="block text-[11px] font-bold uppercase text-[#73887c]">
                  Major Suitable Cultivation Regions
                </span>
                <p className="mt-1 text-xs text-[#455c4f]">
                  {currentCrop.suitableRegions.join(", ")}
                </p>
              </div>
            </Card>
          )}

          {/* TAB 2: FERTILIZER (NPK) */}
          {activeDetailTab === "fertilizer" && (
            <Card className="p-5 sm:p-6 space-y-5">
              <div className="rounded-2xl border border-[#c4e3cb] bg-[#eef8f0] p-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <span className="text-[11px] font-bold uppercase text-[#166534]">
                      Standard Fertilizer Recommendation
                    </span>
                    <h3 className="text-lg font-extrabold text-[#123D2B] mt-0.5">
                      NPK Ratio: {currentCrop.npkRatio}
                    </h3>
                  </div>
                  <span className="rounded-lg bg-white px-2.5 py-1 text-xs font-bold text-[#15803d] border border-[#c4e3cb]">
                    TNAU Verified Dose
                  </span>
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#73887c]">
                  Split Application Schedule
                </h4>

                <div className="rounded-xl border border-[#e1ece4] p-4 bg-white">
                  <div className="flex items-center gap-2">
                    <span className="grid size-6 place-items-center rounded-md bg-[#e6f4ea] text-xs font-bold text-[#17834D]">
                      1
                    </span>
                    <span className="text-xs font-bold text-[#183b2b]">
                      Basal Dose (At Last Land Preparation)
                    </span>
                  </div>
                  <p className="mt-2 text-xs leading-5 text-[#3e5648] pl-8">
                    {currentCrop.fertilizerSchedule.basal}
                  </p>
                </div>

                <div className="rounded-xl border border-[#e1ece4] p-4 bg-white">
                  <div className="flex items-center gap-2">
                    <span className="grid size-6 place-items-center rounded-md bg-[#e6f4ea] text-xs font-bold text-[#17834D]">
                      2
                    </span>
                    <span className="text-xs font-bold text-[#183b2b]">
                      Vegetative / Active Tillering Split
                    </span>
                  </div>
                  <p className="mt-2 text-xs leading-5 text-[#3e5648] pl-8">
                    {currentCrop.fertilizerSchedule.vegetative}
                  </p>
                </div>

                <div className="rounded-xl border border-[#e1ece4] p-4 bg-white">
                  <div className="flex items-center gap-2">
                    <span className="grid size-6 place-items-center rounded-md bg-[#e6f4ea] text-xs font-bold text-[#17834D]">
                      3
                    </span>
                    <span className="text-xs font-bold text-[#183b2b]">
                      Panicle / Flowering / Reproductive Split
                    </span>
                  </div>
                  <p className="mt-2 text-xs leading-5 text-[#3e5648] pl-8">
                    {currentCrop.fertilizerSchedule.flowering}
                  </p>
                </div>

                <div className="rounded-xl border border-[#fed7aa] bg-[#fffaf5] p-4">
                  <div className="flex items-center gap-2">
                    <Sparkles className="size-4 text-[#c2410c]" />
                    <span className="text-xs font-bold text-[#9a3412]">
                      Micronutrients & Foliar Nutrition
                    </span>
                  </div>
                  <p className="mt-2 text-xs leading-5 text-[#7c2d12] pl-6">
                    {currentCrop.fertilizerSchedule.micronutrients}
                  </p>
                </div>
              </div>
            </Card>
          )}

          {/* TAB 3: IRRIGATION */}
          {activeDetailTab === "irrigation" && (
            <Card className="p-5 sm:p-6 space-y-5">
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-xl border border-[#d6e7db] bg-[#f4faf6] p-4">
                  <span className="block text-[11px] font-bold uppercase text-[#166534]">
                    Total Water Requirement
                  </span>
                  <p className="mt-1 text-base font-extrabold text-[#123D2B]">
                    {currentCrop.irrigation.waterRequirement}
                  </p>
                </div>
                <div className="rounded-xl border border-[#d6e7db] bg-[#f4faf6] p-4">
                  <span className="block text-[11px] font-bold uppercase text-[#166534]">
                    Recommended Method
                  </span>
                  <p className="mt-1 text-xs font-bold text-[#123D2B]">
                    {currentCrop.irrigation.method}
                  </p>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-extrabold text-[#183b2b] flex items-center gap-2">
                  <Droplets className="size-4 text-[#2563eb]" />
                  Critical Moisture-Sensitive Stages
                </h3>
                <p className="mt-1 text-xs text-[#63776b]">
                  Moisture deficit during these physiological stages causes permanent yield reduction:
                </p>
                <div className="mt-3 space-y-2">
                  {currentCrop.irrigation.criticalStages.map((stage, idx) => (
                    <div
                      key={stage}
                      className="flex items-center gap-3 rounded-xl border border-[#e1ece4] p-3 text-xs font-semibold text-[#183b2b]"
                    >
                      <span className="grid size-6 shrink-0 place-items-center rounded-full bg-[#dbeafe] text-xs font-bold text-[#1d4ed8]">
                        {idx + 1}
                      </span>
                      <span>{stage}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-xl border border-[#c4e3cb] bg-[#eef8f0] p-4">
                <div className="flex items-start gap-2.5">
                  <ShieldCheck className="size-4 shrink-0 text-[#15803d] mt-0.5" />
                  <div>
                    <h4 className="text-xs font-bold text-[#15803d]">
                      Water Conservation Advisory
                    </h4>
                    <p className="mt-1 text-xs leading-5 text-[#245339]">
                      {currentCrop.irrigation.waterSavingTip}
                    </p>
                  </div>
                </div>
              </div>
            </Card>
          )}

          {/* TAB 4: GROWTH TIMELINE */}
          {activeDetailTab === "stages" && (
            <Card className="p-5 sm:p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-extrabold text-[#183b2b]">
                    Growing-Stage Timeline & Field Operations
                  </h3>
                  <p className="text-xs text-[#63776b] mt-0.5">
                    Step-by-step farmer practices from nursery preparation to harvest.
                  </p>
                </div>
                <span className="text-xs font-bold text-[#17834D]">
                  {currentCrop.growingStages.length} Stages
                </span>
              </div>

              <div className="space-y-3.5 pt-2">
                {currentCrop.growingStages.map((stage) => (
                  <div
                    key={stage.stageNumber}
                    className="rounded-2xl border border-[#dfe8e1] bg-white p-4 transition hover:border-[#b8d4c0]"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#edf2ee] pb-2.5">
                      <div className="flex items-center gap-2.5">
                        <span className="grid size-7 place-items-center rounded-lg bg-[#17834D] text-xs font-bold text-white">
                          {stage.stageNumber}
                        </span>
                        <div>
                          <h4 className="text-sm font-bold text-[#183b2b]">
                            {stage.name}
                          </h4>
                          <span className="text-[11px] text-[#6b8274]">
                            {stage.timing}
                          </span>
                        </div>
                      </div>
                      <span className="rounded-full bg-[#f4faf6] border border-[#cde2d3] px-2.5 py-0.5 text-[11px] font-bold text-[#15803d]">
                        {stage.duration}
                      </span>
                    </div>

                    <p className="mt-2.5 text-xs leading-5 text-[#3e5648]">
                      {stage.description}
                    </p>

                    <div className="mt-3 rounded-xl bg-[#f8faf8] p-3">
                      <span className="block text-[10px] font-bold uppercase tracking-wider text-[#73887c]">
                        Key Field Practices
                      </span>
                      <ul className="mt-1.5 space-y-1">
                        {stage.keyPractices.map((practice, pIdx) => (
                          <li
                            key={pIdx}
                            className="flex items-start gap-2 text-xs text-[#2a4536]"
                          >
                            <CheckCircle2 className="size-3.5 shrink-0 text-[#17834D] mt-0.5" />
                            <span>{practice}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* TAB 5: PEST & DISEASE MANAGEMENT */}
          {activeDetailTab === "pests" && (
            <Card className="p-5 sm:p-6 space-y-4">
              <div>
                <h3 className="text-sm font-extrabold text-[#183b2b] flex items-center gap-2">
                  <Bug className="size-4 text-[#b91c1c]" />
                  Integrated Pest & Disease Management (IPM)
                </h3>
                <p className="text-xs text-[#63776b] mt-0.5">
                  Follow biological and cultural measures first; use chemical controls only when Economic Threshold Levels (ETL) are exceeded.
                </p>
              </div>

              <div className="space-y-3.5 pt-1">
                {currentCrop.pestManagement.map((item, idx) => (
                  <div
                    key={idx}
                    className="rounded-2xl border border-[#fed7aa]/70 bg-white p-4 shadow-sm"
                  >
                    <div className="flex items-center justify-between gap-2 border-b border-[#fee2e2]/60 pb-2.5">
                      <h4 className="text-sm font-bold text-[#183b2b]">
                        {item.name}
                      </h4>
                      <span
                        className={`rounded-md px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                          item.type === "pest"
                            ? "bg-[#ffedd5] text-[#c2410c]"
                            : "bg-[#fee2e2] text-[#b91c1c]"
                        }`}
                      >
                        {item.type}
                      </span>
                    </div>

                    <div className="mt-2.5 text-xs text-[#522b2b]">
                      <strong className="text-[#7f1d1d]">Symptoms:</strong>{" "}
                      {item.symptoms}
                    </div>

                    <div className="mt-3 grid gap-2.5 sm:grid-cols-2">
                      <div className="rounded-xl border border-[#c4e3cb] bg-[#f4faf6] p-3 text-xs leading-5 text-[#1b5e39]">
                        <strong className="block text-[11px] font-bold uppercase text-[#15803d]">
                          Biological & Cultural Control
                        </strong>
                        <p className="mt-1">{item.organicControl}</p>
                      </div>
                      <div className="rounded-xl border border-[#fed7aa] bg-[#fffaf5] p-3 text-xs leading-5 text-[#9a3412]">
                        <strong className="block text-[11px] font-bold uppercase text-[#c2410c]">
                          Approved Chemical Measure (At ETL)
                        </strong>
                        <p className="mt-1">{item.chemicalControl}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* TAB 6: HARVEST & POST-HARVEST */}
          {activeDetailTab === "harvest" && (
            <Card className="p-5 sm:p-6 space-y-4">
              <h3 className="text-sm font-extrabold text-[#183b2b] flex items-center gap-2">
                <CheckCircle2 className="size-4 text-[#17834D]" />
                Harvesting & Post-Harvest Storage
              </h3>

              <div className="grid gap-3.5 sm:grid-cols-2">
                <div className="rounded-xl border border-[#e1ece4] p-4 bg-white">
                  <span className="block text-[11px] font-bold uppercase text-[#73887c]">
                    Maturity Indices
                  </span>
                  <p className="mt-1 text-xs leading-5 text-[#243f30]">
                    {currentCrop.harvesting.maturitySigns}
                  </p>
                </div>
                <div className="rounded-xl border border-[#e1ece4] p-4 bg-white">
                  <span className="block text-[11px] font-bold uppercase text-[#73887c]">
                    Harvesting Method
                  </span>
                  <p className="mt-1 text-xs leading-5 text-[#243f30]">
                    {currentCrop.harvesting.harvestMethod}
                  </p>
                </div>
              </div>

              <div className="rounded-xl border border-[#e1ece4] p-4 bg-[#f8faf8]">
                <span className="block text-[11px] font-bold uppercase text-[#73887c]">
                  Post-Harvest Curing & Storage
                </span>
                <p className="mt-1 text-xs leading-5 text-[#243f30]">
                  {currentCrop.harvesting.postHarvest}
                </p>
              </div>

              <div className="rounded-2xl border border-[#c4e3cb] bg-[#eef8f0] p-4">
                <span className="block text-[11px] font-bold uppercase text-[#15803d]">
                  Expected Yield Potential
                </span>
                <p className="mt-1 text-base font-extrabold text-[#123D2B]">
                  {currentCrop.harvesting.expectedYield}
                </p>
              </div>
            </Card>
          )}

          {/* Knowledge Source Attribution Card */}
          <Card className="p-4 sm:p-5 border-[#d6e3d9] bg-[#f9fbf9]">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#17834D]">
                  Attributable Knowledge Source
                </span>
                <h4 className="text-sm font-bold text-[#183b2b] mt-0.5">
                  {currentCrop.sourceAttribution.guideName}
                </h4>
                <p className="text-xs text-[#63796d] mt-0.5">
                  Institution: {currentCrop.sourceAttribution.institution} (Pub Year: {currentCrop.sourceAttribution.year})
                </p>
              </div>
              <a
                href={currentCrop.sourceAttribution.referenceUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 rounded-xl border border-[#cbe1d2] bg-white px-3 py-1.5 text-xs font-bold text-[#17834D] shadow-sm hover:bg-[#f0f7f2]"
              >
                <span>Agritech Portal</span>
                <ExternalLink className="size-3.5" />
              </a>
            </div>
          </Card>
        </section>
      </div>
    </>
  );
}
