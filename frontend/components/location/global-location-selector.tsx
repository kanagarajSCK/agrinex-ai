"use client";

import { ChevronDown, Crosshair, MapPin, Sparkles } from "lucide-react";
import { useLocation } from "@/contexts/location-context";

export function GlobalLocationSelector({ compact = false }: { compact?: boolean }) {
  const { location, openOnboarding } = useLocation();

  if (!location) {
    return (
      <button
        type="button"
        onClick={() => openOnboarding("gps")}
        className={`flex items-center gap-2 rounded-xl border border-[#fed7aa] bg-[#fffaf5] px-3 py-1.5 text-left transition hover:bg-[#fff7ed] focus-visible:outline-2 focus-visible:outline-[#17834D] ${
          compact ? "w-full justify-between" : ""
        }`}
      >
        <span className="grid size-6 shrink-0 place-items-center rounded-lg bg-[#ffedd5] text-[#c2410c]">
          <MapPin className="size-3.5" />
        </span>
        <div className="min-w-0">
          <span className="block truncate text-xs font-bold text-[#9a3412]">
            Location not selected
          </span>
          <span className="block text-[10px] text-[#c2410c]">
            Select your farming location
          </span>
        </div>
        <ChevronDown className="size-3.5 shrink-0 text-[#ea580c]" />
      </button>
    );
  }

  // Has confirmed location
  const isGps = location.source === "gps";
  const isSuggested = location.source === "suggested";

  const sourceLabel = isGps
    ? "GPS detected"
    : isSuggested
    ? "Suggested — not confirmed"
    : "Manually selected";

  const sourceBadgeColor = isGps
    ? "bg-[#e6f4ea] text-[#15803d]"
    : isSuggested
    ? "bg-[#fef3c7] text-[#b45309]"
    : "bg-[#eef2ff] text-[#4338ca]";

  return (
    <button
      type="button"
      onClick={() => openOnboarding()}
      className={`group flex items-center gap-2 rounded-xl border border-[#dfe8e2] bg-white px-2.5 py-1.5 text-left transition hover:border-[#17834D] hover:bg-[#f8faf8] focus-visible:outline-2 focus-visible:outline-[#17834D] ${
        compact ? "w-full justify-between" : ""
      }`}
    >
      <span
        className={`grid size-7 shrink-0 place-items-center rounded-lg ${
          isGps
            ? "bg-[#e6f4ea] text-[#17834D]"
            : isSuggested
            ? "bg-[#fef3c7] text-[#b45309]"
            : "bg-[#e1f2e5] text-[#123D2B]"
        }`}
      >
        {isGps ? (
          <Crosshair className="size-3.5" />
        ) : isSuggested ? (
          <Sparkles className="size-3.5" />
        ) : (
          <MapPin className="size-3.5" />
        )}
      </span>

      <div className="min-w-0 text-left">
        <span className="block max-w-[140px] truncate text-xs font-extrabold text-[#183b2b] sm:max-w-[200px]">
          {location.formattedName || `${location.district}, ${location.state}`}
        </span>
        <span className={`inline-block rounded-md px-1.5 py-0.2 text-[9px] font-bold ${sourceBadgeColor}`}>
          {sourceLabel}
        </span>
      </div>

      <ChevronDown className="size-3 shrink-0 text-[#61746a] transition-transform group-hover:translate-y-0.5" />
    </button>
  );
}
