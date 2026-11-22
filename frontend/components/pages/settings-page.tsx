"use client";

import { useState } from "react";
import { Bell, Globe2, Languages, Leaf, ShieldCheck, UserRound } from "lucide-react";
import { Card } from "@/components/ui/card";
import { DemoBadge, DemoSelect, PageHeader } from "@/components/ui/primitives";

export function SettingsPage() {
  const [language, setLanguage] = useState("English");
  const [weatherAlerts, setWeatherAlerts] = useState(false);
  const [marketUpdates, setMarketUpdates] = useState(false);
  const [units, setUnits] = useState("Metric");
  const notificationPreferences = [
    { label: "Sample weather alerts", checked: weatherAlerts, setChecked: setWeatherAlerts },
    { label: "Sample market updates", checked: marketUpdates, setChecked: setMarketUpdates },
  ];

  return (
    <>
      <PageHeader
        eyebrow="Your workspace"
        title="Profile & settings"
        description="Adjust local preview controls. Nothing here is saved to an account, and language options do not activate translations."
      />

      <div className="grid min-w-0 items-start gap-4 xl:grid-cols-[minmax(0,1.2fr)_minmax(280px,0.8fr)]">
        <div className="grid min-w-0 gap-4">
          <Card className="p-5 sm:p-6">
            <div className="mb-5 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3"><span className="grid size-11 place-items-center rounded-xl bg-[#e6f4ea] text-[#17834D]"><UserRound aria-hidden="true" className="size-5" /></span><div><h2 className="text-sm font-bold text-[#183b2b]">Profile preview</h2><p className="mt-1 text-xs text-[#829087]">Local demonstration profile</p></div></div>
              <DemoBadge>NOT AN ACCOUNT</DemoBadge>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="block text-xs font-semibold text-[#526b5b]">Display name<input value="Demo Farmer" readOnly className="mt-1.5 min-h-11 w-full rounded-xl border border-[#dfe8e2] bg-[#f7f9f7] px-3 text-sm text-[#607268]" /></label>
              <label className="block text-xs font-semibold text-[#526b5b]">Primary location<input value="Salem, Tamil Nadu · Sample" readOnly className="mt-1.5 min-h-11 w-full rounded-xl border border-[#dfe8e2] bg-[#f7f9f7] px-3 text-sm text-[#607268]" /></label>
            </div>
            <p className="mt-3 text-[11px] leading-5 text-[#829087]">Profile information is illustrative and cannot be changed or persisted in this preview.</p>
          </Card>

          <Card className="p-5 sm:p-6">
            <div className="mb-5 flex items-center gap-3"><span className="grid size-10 place-items-center rounded-xl bg-[#eff5f0] text-[#17834D]"><Languages aria-hidden="true" className="size-[18px]" /></span><div><h2 className="text-sm font-bold text-[#183b2b]">Language preference</h2><p className="mt-1 text-xs text-[#829087]">Selector is interactive; localized content is not included</p></div></div>
            <label className="block max-w-sm text-xs font-semibold text-[#526b5b]">Display language
              <DemoSelect aria-label="Display language" value={language} onChange={(event) => setLanguage(event.target.value)} className="mt-1.5 w-full">
                <option>English</option><option>தமிழ் · Preview</option><option>తెలుగు · Preview</option><option>हिन्दी · Preview</option>
              </DemoSelect>
            </label>
            <p className="mt-3 text-[11px] text-[#829087]">Selected in this page only: <strong className="text-[#526b5b]">{language}</strong></p>
          </Card>

          <Card className="p-5 sm:p-6">
            <div className="mb-5 flex items-center gap-3"><span className="grid size-10 place-items-center rounded-xl bg-[#fff4dd] text-[#9b741f]"><Bell aria-hidden="true" className="size-[18px]" /></span><div><h2 className="text-sm font-bold text-[#183b2b]">Notification preferences</h2><p className="mt-1 text-xs text-[#829087]">Local toggles only · no alerts are sent</p></div></div>
            <div className="space-y-3">
              {notificationPreferences.map(({ label, checked, setChecked }) => (
                <label key={label} className="flex min-h-12 cursor-pointer items-center justify-between gap-3 rounded-xl border border-[#e6ece7] px-3.5 py-2.5">
                  <span className="text-xs font-semibold text-[#526b5b]">{label} <span className="font-normal text-[#8b978f]">· preview only</span></span>
                  <input type="checkbox" checked={checked} onChange={(event) => setChecked(event.target.checked)} className="size-4 accent-[#17834D]" />
                </label>
              ))}
            </div>
          </Card>
        </div>

        <div className="grid min-w-0 gap-4">
          <Card className="p-5 sm:p-6">
            <div className="mb-4 flex items-center gap-3"><span className="grid size-10 place-items-center rounded-xl bg-[#e8f1fb] text-[#3774a6]"><Globe2 aria-hidden="true" className="size-[18px]" /></span><div><h2 className="text-sm font-bold text-[#183b2b]">Regional preferences</h2><p className="mt-1 text-xs text-[#829087]">Preview display options</p></div></div>
            <label className="block text-xs font-semibold text-[#526b5b]">Measurement units
              <DemoSelect aria-label="Measurement units" value={units} onChange={(event) => setUnits(event.target.value)} className="mt-1.5 w-full">
                <option>Metric</option><option>Imperial · preview</option>
              </DemoSelect>
            </label>
            <p className="mt-3 text-[11px] text-[#829087]">Current: {units} · changing this does not convert data.</p>
          </Card>

          <Card className="p-5 sm:p-6">
            <div className="mb-4 flex items-center gap-3"><span className="grid size-10 place-items-center rounded-xl bg-[#e6f4ea] text-[#17834D]"><ShieldCheck aria-hidden="true" className="size-[18px]" /></span><div><h2 className="text-sm font-bold text-[#183b2b]">Privacy & data</h2><p className="mt-1 text-xs text-[#829087]">Phase 02 boundaries</p></div></div>
            <ul className="space-y-3 text-xs leading-5 text-[#63756a]">
              <li className="flex gap-2"><span className="mt-1 size-1.5 shrink-0 rounded-full bg-[#17834D]" />No sign-in or account is active.</li>
              <li className="flex gap-2"><span className="mt-1 size-1.5 shrink-0 rounded-full bg-[#17834D]" />No profile or farm information is sent to a service.</li>
              <li className="flex gap-2"><span className="mt-1 size-1.5 shrink-0 rounded-full bg-[#17834D]" />No live weather, market or AI provider is connected.</li>
            </ul>
          </Card>

          <Card style={{ backgroundColor: "#fafffb" }} className="p-5 sm:p-6">
            <div className="flex items-center gap-2"><Leaf aria-hidden="true" className="size-4 text-[#17834D]" /><h2 className="text-sm font-bold text-[#183b2b]">AgriNex AI</h2><DemoBadge>PREVIEW</DemoBadge></div>
            <p className="mt-2 text-xs leading-5 text-[#728177]">Smarter Farming. Better Decisions. A sample interface for evidence-based agricultural decision support.</p>
          </Card>
        </div>
      </div>
    </>
  );
}
