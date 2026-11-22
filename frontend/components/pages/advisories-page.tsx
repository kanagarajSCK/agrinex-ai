"use client";

import { useMemo, useState } from "react";
import { ChevronDown, ChevronUp, Clock3, FileText, ShieldAlert } from "lucide-react";
import { Card } from "@/components/ui/card";
import { DemoBadge, PageHeader, SearchInput } from "@/components/ui/primitives";

const advisories = [
  {
    id: 1,
    title: "Weather context preview",
    category: "Weather",
    date: "Sample entry · no timestamp",
    summary: "Example of how a weather-related information card could be displayed.",
    detail: "This placeholder does not contain a forecast or recommend a field action. Any future weather information should include a verified local source and observation time.",
  },
  {
    id: 2,
    title: "Market information preview",
    category: "Market",
    date: "Sample entry · no timestamp",
    summary: "Example of an advisory history card linked to market context.",
    detail: "No actual price information or sell/hold recommendation is included. This is a layout example only; a future entry would need a reliable market source and clear date.",
  },
  {
    id: 3,
    title: "Crop learning preview",
    category: "Crop learning",
    date: "Sample entry · no timestamp",
    summary: "Example of a saved crop knowledge card.",
    detail: "No crop-specific instruction, input dose or treatment is provided. Future information must be reviewed and attributed to a trusted source.",
  },
];

const filters = ["All", "Weather", "Market", "Crop learning"];

export function AdvisoriesPage() {
  const [filter, setFilter] = useState("All");
  const [query, setQuery] = useState("");
  const [expanded, setExpanded] = useState<number | null>(1);

  const visibleAdvisories = useMemo(() => advisories.filter((item) => {
    const categoryMatches = filter === "All" || item.category === filter;
    const queryMatches = !query.trim() || `${item.title} ${item.summary} ${item.category}`.toLowerCase().includes(query.trim().toLowerCase());
    return categoryMatches && queryMatches;
  }), [filter, query]);

  return (
    <>
      <PageHeader
        eyebrow="Your library"
        title="Advisory history"
        description="A searchable preview of how past information cards could appear. These entries are examples, not real advice or saved account data."
      />

      <Card className="mb-5 p-4 sm:p-5">
        <div className="mb-3 flex flex-wrap items-center gap-2"><h2 className="text-sm font-bold text-[#183b2b]">Find an entry</h2><DemoBadge>EXAMPLE ENTRIES</DemoBadge></div>
        <SearchInput value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search advisory examples" aria-label="Search advisory examples" />
        <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
          {filters.map((item) => (
            <button key={item} type="button" aria-pressed={filter === item} onClick={() => setFilter(item)} className={`min-h-10 shrink-0 rounded-full px-4 text-xs font-semibold ${filter === item ? "bg-[#123D2B] text-white" : "border border-[#dfe8e2] bg-white text-[#526b5b] hover:bg-[#f3f7f4]"}`}>{item}</button>
          ))}
        </div>
      </Card>

      <div className="mb-3 flex items-center justify-between gap-2"><h2 className="text-base font-bold text-[#183b2b]">Recent previews</h2><span className="text-xs text-[#7b8980]">{visibleAdvisories.length} examples</span></div>
      <div className="grid gap-3">
        {visibleAdvisories.length ? visibleAdvisories.map((item) => {
          const isExpanded = expanded === item.id;
          return (
            <Card key={item.id} className="overflow-hidden">
              <button type="button" aria-expanded={isExpanded} onClick={() => setExpanded(isExpanded ? null : item.id)} className="flex min-h-[76px] w-full items-center gap-3 p-4 text-left focus-visible:outline-2 focus-visible:outline-inset focus-visible:outline-[#17834D] sm:p-5">
                <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-[#eff5f0] text-[#17834D]"><FileText aria-hidden="true" className="size-[18px]" /></span>
                <span className="min-w-0 flex-1">
                  <span className="flex flex-wrap items-center gap-2"><span className="text-sm font-bold text-[#183b2b]">{item.title}</span><DemoBadge>DEMO</DemoBadge></span>
                  <span className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-[10px] text-[#829087]"><span>{item.category}</span><span className="inline-flex items-center gap-1"><Clock3 aria-hidden="true" className="size-3" />{item.date}</span></span>
                </span>
                {isExpanded ? <ChevronUp aria-hidden="true" className="size-4 shrink-0 text-[#758279]" /> : <ChevronDown aria-hidden="true" className="size-4 shrink-0 text-[#758279]" />}
              </button>
              <div className="px-4 pb-4 sm:px-5 sm:pb-5">
                <p className="text-sm leading-6 text-[#51685a]">{item.summary}</p>
                {isExpanded && (
                  <div className="mt-3 rounded-xl bg-[#f7f9f7] p-4">
                    <p className="text-xs leading-5 text-[#68796f]">{item.detail}</p>
                    <p className="mt-3 border-t border-[#e6ece7] pt-3 text-[10px] text-[#829087]">Source attribution: placeholder · no source attached</p>
                  </div>
                )}
              </div>
            </Card>
          );
        }) : (
          <Card className="p-8 text-center text-sm text-[#68796f]">No example entries match your search.</Card>
        )}
      </div>

      <div className="mt-5 flex items-start gap-3 rounded-2xl border border-[#f0dfb8] bg-[#fff9eb] p-4">
        <ShieldAlert aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-[#9a7526]" />
        <p className="text-xs leading-5 text-[#735b24]">No recommendations are generated or saved in this phase. Demonstration content is not verified agronomic guidance.</p>
      </div>
    </>
  );
}
