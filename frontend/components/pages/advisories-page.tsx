"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  Bot,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Clock3,
  CloudSun,
  MapPin,
  MessageSquare,
  ShieldCheck,
  ShoppingBasket,
  Sprout,
  Trash2,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { PageHeader, SearchInput } from "@/components/ui/primitives";
import {
  clearAdvisoryHistory,
  deleteAdvisory,
  getContextualAdvisories,
  getStoredAdvisories,
  type AdvisoryCategory,
  type AdvisoryItem,
} from "@/lib/advisories";
import { useLocation } from "@/contexts/location-context";
import { useLanguage } from "@/contexts/language-context";

const categories: AdvisoryCategory[] = [
  "All",
  "AI Consultation",
  "Weather",
  "Market",
  "Crop guidance",
];

const categoryStyles: Record<
  AdvisoryItem["category"],
  { badge: string; iconBg: string; iconColor: string; icon: typeof Sprout }
> = {
  "AI Consultation": {
    badge: "bg-[#f3eefc] text-[#743eb3] border-[#e4d4fa]",
    iconBg: "bg-[#f3eefc]",
    iconColor: "text-[#743eb3]",
    icon: Bot,
  },
  Weather: {
    badge: "bg-[#e8f1fb] text-[#2c6ba0] border-[#d0e3f7]",
    iconBg: "bg-[#e8f1fb]",
    iconColor: "text-[#2c6ba0]",
    icon: CloudSun,
  },
  Market: {
    badge: "bg-[#fef4e2] text-[#9c6a1b] border-[#fae4ba]",
    iconBg: "bg-[#fef4e2]",
    iconColor: "text-[#9c6a1b]",
    icon: ShoppingBasket,
  },
  "Crop guidance": {
    badge: "bg-[#e6f4ea] text-[#17834D] border-[#c5e6ce]",
    iconBg: "bg-[#e6f4ea]",
    iconColor: "text-[#17834D]",
    icon: Sprout,
  },
};

const initialAdvisories = getContextualAdvisories();

export function AdvisoriesPage() {
  const { location, openOnboarding } = useLocation();
  const { t } = useLanguage();

  const [filter, setFilter] = useState<AdvisoryCategory>("All");
  const [query, setQuery] = useState("");
  const [advisories, setAdvisories] = useState<AdvisoryItem[]>(initialAdvisories);
  const [expanded, setExpanded] = useState<string | null>(initialAdvisories[0]?.id || null);
  const [userConsultationCount, setUserConsultationCount] = useState(0);

  const locationLabel = location?.formattedName || "Salem, Tamil Nadu";

  useEffect(() => {
    void Promise.resolve().then(() => {
      const stored = getStoredAdvisories();
      setUserConsultationCount(stored.filter((item) => item.isAiConsultation).length);

      const contextual = getContextualAdvisories(locationLabel);
      const storedIds = new Set(stored.map((item) => item.id));
      const merged = [...stored, ...contextual.filter((item) => !storedIds.has(item.id))];
      setAdvisories(merged);

      if (merged.length > 0) {
        setExpanded((prev) => prev ?? merged[0].id);
      }
    });
  }, [locationLabel]);

  const handleDelete = (id: string, event: React.MouseEvent) => {
    event.stopPropagation();
    deleteAdvisory(id);
    setAdvisories((prev) => prev.filter((item) => item.id !== id));
  };

  const handleClearHistory = () => {
    if (window.confirm("Clear your saved AI consultation history?")) {
      clearAdvisoryHistory();
      const contextual = getContextualAdvisories(locationLabel);
      setAdvisories(contextual);
      setUserConsultationCount(0);
    }
  };

  const visibleAdvisories = useMemo(() => {
    return advisories.filter((item) => {
      const categoryMatches = filter === "All" || item.category === filter;
      const q = query.trim().toLowerCase();
      const queryMatches =
        !q ||
        item.title.toLowerCase().includes(q) ||
        item.summary.toLowerCase().includes(q) ||
        item.detail.toLowerCase().includes(q) ||
        (item.crop && item.crop.toLowerCase().includes(q)) ||
        (item.query && item.query.toLowerCase().includes(q));
      return categoryMatches && queryMatches;
    });
  }, [advisories, filter, query]);

  return (
    <>
      <PageHeader
        eyebrow={t("advisoriesEyebrow", "Your farm intelligence library")}
        title={t("advisoriesTitle", "Advisory history")}
        description={`Search past agricultural consultations, real-time field weather alerts, and verified AGMARKNET mandi guidance for ${locationLabel}.`}
        action={
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => openOnboarding()}
              className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-[#dfe8e2] bg-white px-3.5 text-xs font-semibold text-[#456052] hover:bg-[#f8faf8]"
            >
              <MapPin className="size-3.5 text-[#17834D]" />
              <span className="max-w-[160px] truncate">{locationLabel}</span>
            </button>
            <Link
              href="/assistant"
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-[#17834D] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#123D2B]"
            >
              <Bot aria-hidden="true" className="size-4" />
              Ask New Question
            </Link>
          </div>
        }
      />

      <Card className="mb-5 p-4 sm:p-5">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-bold text-[#183b2b]">Find an advisory</h2>
            <span className="rounded-full bg-[#f0f4f1] px-2.5 py-0.5 text-[11px] font-semibold text-[#486354]">
              {visibleAdvisories.length} entries
            </span>
          </div>
          {userConsultationCount > 0 && (
            <button
              type="button"
              onClick={handleClearHistory}
              className="inline-flex items-center gap-1 text-xs font-semibold text-[#8b4545] transition hover:text-[#b03030]"
            >
              <Trash2 aria-hidden="true" className="size-3.5" />
              Clear consultation history
            </button>
          )}
        </div>

        <SearchInput
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search by crop, disease, weather, or question…"
          aria-label="Search advisories"
        />

        <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
          {categories.map((item) => {
            const count =
              item === "All"
                ? advisories.length
                : advisories.filter((a) => a.category === item).length;
            const isActive = filter === item;
            return (
              <button
                key={item}
                type="button"
                aria-pressed={isActive}
                onClick={() => setFilter(item)}
                className={`inline-flex min-h-10 shrink-0 items-center gap-1.5 rounded-full px-4 text-xs font-semibold transition ${
                  isActive
                    ? "bg-[#123D2B] text-white shadow-sm"
                    : "border border-[#dfe8e2] bg-white text-[#526b5b] hover:bg-[#f3f7f4]"
                }`}
              >
                <span>{item}</span>
                <span
                  className={`rounded-full px-1.5 py-0.2 text-[10px] font-bold ${
                    isActive ? "bg-white/20 text-white" : "bg-[#eff5f0] text-[#4a6354]"
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </Card>

      <div className="mb-3 flex items-center justify-between gap-2">
        <h2 className="text-base font-bold text-[#183b2b]">
          {filter === "All" ? "Current & saved advisories" : `${filter} advisories`}
        </h2>
        <span className="flex items-center gap-1.5 text-xs text-[#7b8980]">
          <MapPin aria-hidden="true" className="size-3.5 text-[#17834D]" />
          {locationLabel}
        </span>
      </div>

      <div className="grid gap-3">
        {visibleAdvisories.length > 0 ? (
          visibleAdvisories.map((item) => {
            const isExpanded = expanded === item.id;
            const style = categoryStyles[item.category] || categoryStyles["Crop guidance"];
            const CategoryIcon = style.icon;

            return (
              <Card
                key={item.id}
                className="overflow-hidden border-[#e2ece5] transition-all hover:border-[#b5d6be]"
              >
                <button
                  type="button"
                  aria-expanded={isExpanded}
                  onClick={() => setExpanded(isExpanded ? null : item.id)}
                  className="flex min-h-[76px] w-full items-start gap-3 p-4 text-left transition hover:bg-[#fafcfa] focus-visible:outline-2 focus-visible:outline-inset focus-visible:outline-[#17834D] sm:p-5"
                >
                  <span
                    className={`grid size-10 shrink-0 place-items-center rounded-xl ${style.iconBg} ${style.iconColor}`}
                  >
                    <CategoryIcon aria-hidden="true" className="size-5" />
                  </span>

                  <span className="min-w-0 flex-1">
                    <span className="flex flex-wrap items-center gap-2">
                      <span className="text-sm font-bold text-[#183b2b]">{item.title}</span>
                      <span
                        className={`rounded-full border px-2 py-0.5 text-[10px] font-bold ${style.badge}`}
                      >
                        {item.category}
                      </span>
                      {item.isAiConsultation && (
                        <span className="rounded-full bg-[#17834D]/10 px-2 py-0.5 text-[10px] font-bold text-[#17834D]">
                          AI SAVED
                        </span>
                      )}
                    </span>

                    <span className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-[#74877c]">
                      <span className="inline-flex items-center gap-1">
                        <Clock3 aria-hidden="true" className="size-3 text-[#94a39a]" />
                        {item.date}
                      </span>
                      {item.location && (
                        <span className="inline-flex items-center gap-1">
                          <MapPin aria-hidden="true" className="size-3 text-[#94a39a]" />
                          {item.location}
                        </span>
                      )}
                      {item.crop && (
                        <span className="inline-flex items-center gap-1 font-medium text-[#3b5e49]">
                          <Sprout aria-hidden="true" className="size-3" />
                          {item.crop}
                        </span>
                      )}
                    </span>
                  </span>

                  <div className="flex items-center gap-2">
                    {item.isAiConsultation && (
                      <button
                        type="button"
                        onClick={(e) => handleDelete(item.id, e)}
                        title="Delete from history"
                        aria-label="Delete advisory"
                        className="rounded-lg p-1 text-[#a0ada5] transition hover:bg-[#fee8e8] hover:text-[#b53a3a]"
                      >
                        <Trash2 aria-hidden="true" className="size-4" />
                      </button>
                    )}
                    {isExpanded ? (
                      <ChevronUp
                        aria-hidden="true"
                        className="size-5 shrink-0 text-[#758279]"
                      />
                    ) : (
                      <ChevronDown
                        aria-hidden="true"
                        className="size-5 shrink-0 text-[#758279]"
                      />
                    )}
                  </div>
                </button>

                {isExpanded && (
                  <div className="border-t border-[#edf3ee] bg-[#fbfdfb] p-4 text-xs sm:p-5">
                    {item.query && (
                      <div className="mb-4 rounded-xl border border-[#dfece2] bg-[#f4faf6] p-3 text-[#2a4d38]">
                        <p className="flex items-center gap-1.5 font-bold text-[#17834D]">
                          <MessageSquare className="size-3.5" />
                          Your Original Question
                        </p>
                        <p className="mt-1 text-sm font-semibold text-[#183b2b]">
                          &ldquo;{item.query}&rdquo;
                        </p>
                      </div>
                    )}

                    <div className="mb-4">
                      <p className="text-sm font-bold text-[#183b2b]">Key Guidance</p>
                      <p className="mt-1 text-xs leading-5 text-[#42594b]">{item.detail}</p>
                    </div>

                    {item.keyPoints && item.keyPoints.length > 0 && (
                      <div className="mb-4 rounded-xl border border-[#d8e8dc] bg-white p-3.5">
                        <p className="font-bold text-[#166534]">Key Observations</p>
                        <ul className="mt-2 space-y-1.5 pl-1">
                          {item.keyPoints.map((point: string, idx: number) => (
                            <li key={idx} className="flex items-start gap-2 text-[#2d4d3a]">
                              <span className="grid size-4 shrink-0 place-items-center rounded-full bg-[#e6f4ea] text-[10px] font-bold text-[#17834D]">
                                •
                              </span>
                              <span>{point}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {item.recommendations && item.recommendations.length > 0 && (
                      <div className="mb-4 rounded-xl border border-[#d8e8dc] bg-white p-3.5">
                        <p className="font-bold text-[#166534]">Recommended Action Steps</p>
                        <ul className="mt-2 space-y-1.5 pl-1">
                          {item.recommendations.map((step: string, idx: number) => (
                            <li key={idx} className="flex items-start gap-2 text-[#2d4d3a]">
                              <span className="grid size-4 shrink-0 place-items-center rounded-full bg-[#e6f4ea] text-[10px] font-bold text-[#17834D]">
                                {idx + 1}
                              </span>
                              <span>{step}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {item.sources && item.sources.length > 0 && (
                      <div className="border-t border-[#edf1ee] pt-3 text-[11px] text-[#718579]">
                        <p className="flex items-center gap-1 font-bold text-[#355342]">
                          <ShieldCheck className="size-3.5 text-[#17834D]" />
                          Verified Scientific & Market Citations
                        </p>
                        <div className="mt-1.5 space-y-1">
                          {item.sources.map((s, idx) => (
                            <p key={idx} className="text-[#456052]">
                              • <span className="font-semibold">{s.title || s.name}</span>
                              {s.institution ? ` · ${s.institution}` : ""}
                              {s.publication_year ? ` (${s.publication_year})` : ""}
                            </p>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="mt-4 flex items-center justify-between border-t border-[#edf1ee] pt-3 text-[11px] text-[#718579]">
                      <span className="flex items-center gap-1">
                        <CheckCircle2 className="size-3.5 text-[#17834D]" />
                        Source: {item.sourceAttribution}
                      </span>
                      {item.isAiConsultation && (
                        <button
                          type="button"
                          onClick={(e) => handleDelete(item.id, e)}
                          className="font-semibold text-[#b53a3a] hover:underline"
                        >
                          Remove from history
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </Card>
            );
          })
        ) : (
          <Card className="p-8 text-center">
            <p className="text-sm font-bold text-[#183b2b]">No advisories found</p>
            <p className="mt-1 text-xs text-[#718579]">
              {query
                ? `No advisories match "${query}". Try another search term.`
                : "No saved advisories in this category yet."}
            </p>
          </Card>
        )}
      </div>
    </>
  );
}
