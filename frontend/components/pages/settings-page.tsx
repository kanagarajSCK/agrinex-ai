"use client";

import { useState } from "react";
import { Bell, Globe2, Languages, Leaf, ShieldCheck, UserRound } from "lucide-react";
import { Card } from "@/components/ui/card";
import { DemoBadge, DemoSelect, PageHeader } from "@/components/ui/primitives";
import { LocationSelector } from "@/components/location/location-selector";
import { languageLabels, type AppLanguage } from "@/lib/i18n";
import { useLanguage } from "@/contexts/language-context";

export function SettingsPage() {
  const { language, setLanguage, t } = useLanguage();
  const [weatherAlerts, setWeatherAlerts] = useState(false);
  const [marketUpdates, setMarketUpdates] = useState(false);
  const [units, setUnits] = useState("Metric");

  const notificationPreferences = [
    { label: t("sampleWeatherAlerts", "Weather alerts"), checked: weatherAlerts, setChecked: setWeatherAlerts },
    { label: t("sampleMarketUpdates", "Market price updates"), checked: marketUpdates, setChecked: setMarketUpdates },
  ];

  return (
    <>
      <PageHeader
        eyebrow={t("settingsEyebrow", "Your workspace")}
        title={t("settingsTitle", "Profile & settings")}
        description={t(
          "settingsSubtitle",
          "Manage your farm location, display language, and application preferences."
        )}
      />

      <div className="grid min-w-0 items-start gap-4 xl:grid-cols-[minmax(0,1.2fr)_minmax(280px,0.8fr)]">
        <div className="grid min-w-0 gap-4">
          <Card className="p-5 sm:p-6">
            <div className="mb-5 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <span className="grid size-11 place-items-center rounded-xl bg-[#e6f4ea] text-[#17834D]">
                  <UserRound aria-hidden="true" className="size-5" />
                </span>
                <div>
                  <h2 className="text-sm font-bold text-[#183b2b]">
                    {t("profilePreview", "Profile preview")}
                  </h2>
                  <p className="mt-1 text-xs text-[#829087]">
                    {t("localProfileDesc", "Local demonstration profile")}
                  </p>
                </div>
              </div>
              <DemoBadge>NO ACCOUNT REQUIRED</DemoBadge>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="block text-xs font-semibold text-[#526b5b]">
                {t("displayName", "Display name")}
                <input
                  value="Farmer Session"
                  readOnly
                  className="mt-1.5 min-h-11 w-full rounded-xl border border-[#dfe8e2] bg-[#f7f9f7] px-3 text-sm text-[#607268]"
                />
              </label>
              <label className="block text-xs font-semibold text-[#526b5b]">
                {t("primaryLocation", "Primary location")}
                <input
                  value="Salem, Tamil Nadu"
                  readOnly
                  className="mt-1.5 min-h-11 w-full rounded-xl border border-[#dfe8e2] bg-[#f7f9f7] px-3 text-sm text-[#607268]"
                />
              </label>
            </div>
            <p className="mt-3 text-[11px] leading-5 text-[#829087]">
              {t("privacyBullet2", "Preferences stay private in your browser localStorage.")}
            </p>
          </Card>

          <Card className="p-5 sm:p-6">
            <div className="mb-5 flex items-center gap-3">
              <span className="grid size-10 place-items-center rounded-xl bg-[#e8f1fb] text-[#3774a6]">
                <Globe2 aria-hidden="true" className="size-[18px]" />
              </span>
              <div>
                <h2 className="text-sm font-bold text-[#183b2b]">
                  {t("officialLocation", "Official India location")}
                </h2>
                <p className="mt-1 text-xs text-[#829087]">
                  {t("locationDesc", "Uses verified Indian government LGD hierarchy with offline fallback")}
                </p>
              </div>
            </div>
            <LocationSelector />
            <button
              type="button"
              onClick={() => window.localStorage.removeItem("agrinex-selected-location")}
              className="mt-3 min-h-10 rounded-xl border border-[#dfe8e2] px-3 text-xs font-bold text-[#587064] hover:bg-[#f2f5f3]"
            >
              {t("clearLocationBtn", "Clear selected location")}
            </button>
          </Card>

          <Card className="p-5 sm:p-6">
            <div className="mb-5 flex items-center gap-3">
              <span className="grid size-10 place-items-center rounded-xl bg-[#eff5f0] text-[#17834D]">
                <Languages aria-hidden="true" className="size-[18px]" />
              </span>
              <div>
                <h2 className="text-sm font-bold text-[#183b2b]">
                  {t("languagePreference", "Language preference")}
                </h2>
                <p className="mt-1 text-xs text-[#829087]">
                  {t("languageActiveNote", "Changes apply immediately across all navigation, controls, and features.")}
                </p>
              </div>
            </div>
            <label className="block max-w-sm text-xs font-semibold text-[#526b5b]">
              {t("displayLanguage", "Display language")}
              <DemoSelect
                aria-label={t("displayLanguage", "Display language")}
                value={language}
                onChange={(event) => {
                  const nextLanguage = event.target.value as AppLanguage;
                  setLanguage(nextLanguage);
                }}
                className="mt-1.5 w-full cursor-pointer"
              >
                <option value="en">{languageLabels.en}</option>
                <option value="ta">{languageLabels.ta}</option>
                <option value="te">{languageLabels.te}</option>
                <option value="hi">{languageLabels.hi}</option>
              </DemoSelect>
            </label>
            <p className="mt-3 text-[11px] text-[#829087]">
              {t("activeLanguage", "Active language across AgriNex AI:")}{" "}
              <strong className="text-[#17834D]">{languageLabels[language]}</strong>
            </p>
          </Card>

          <Card className="p-5 sm:p-6">
            <div className="mb-5 flex items-center gap-3">
              <span className="grid size-10 place-items-center rounded-xl bg-[#fff4dd] text-[#9b741f]">
                <Bell aria-hidden="true" className="size-[18px]" />
              </span>
              <div>
                <h2 className="text-sm font-bold text-[#183b2b]">
                  {t("notificationPreferences", "Notification preferences")}
                </h2>
                <p className="mt-1 text-xs text-[#829087]">
                  {t("privacyBullet2")}
                </p>
              </div>
            </div>
            <div className="space-y-3">
              {notificationPreferences.map(({ label, checked, setChecked }) => (
                <label
                  key={label}
                  className="flex min-h-12 cursor-pointer items-center justify-between gap-3 rounded-xl border border-[#e6ece7] px-3.5 py-2.5 hover:bg-[#fafffb]"
                >
                  <span className="text-xs font-semibold text-[#526b5b]">{label}</span>
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={(event) => setChecked(event.target.checked)}
                    className="size-4 accent-[#17834D]"
                  />
                </label>
              ))}
            </div>
          </Card>
        </div>

        <div className="grid min-w-0 gap-4">
          <Card className="p-5 sm:p-6">
            <div className="mb-4 flex items-center gap-3">
              <span className="grid size-10 place-items-center rounded-xl bg-[#e8f1fb] text-[#3774a6]">
                <Globe2 aria-hidden="true" className="size-[18px]" />
              </span>
              <div>
                <h2 className="text-sm font-bold text-[#183b2b]">
                  {t("regionalPreferences", "Regional preferences")}
                </h2>
                <p className="mt-1 text-xs text-[#829087]">Units & standards</p>
              </div>
            </div>
            <label className="block text-xs font-semibold text-[#526b5b]">
              {t("measurementUnits", "Measurement units")}
              <DemoSelect
                aria-label={t("measurementUnits", "Measurement units")}
                value={units}
                onChange={(event) => setUnits(event.target.value)}
                className="mt-1.5 w-full"
              >
                <option>Metric (Celsius, mm, km/h, Quintal)</option>
                <option>Imperial (Fahrenheit, in, mph, lbs)</option>
              </DemoSelect>
            </label>
            <p className="mt-3 text-[11px] text-[#829087]">
              Current: {units}
            </p>
          </Card>

          <Card className="p-5 sm:p-6">
            <div className="mb-4 flex items-center gap-3">
              <span className="grid size-10 place-items-center rounded-xl bg-[#e6f4ea] text-[#17834D]">
                <ShieldCheck aria-hidden="true" className="size-[18px]" />
              </span>
              <div>
                <h2 className="text-sm font-bold text-[#183b2b]">
                  {t("privacyAndData", "Privacy & data protection")}
                </h2>
                <p className="mt-1 text-xs text-[#829087]">Zero-login design</p>
              </div>
            </div>
            <ul className="space-y-3 text-xs leading-5 text-[#63756a]">
              <li className="flex gap-2">
                <span className="mt-1 size-1.5 shrink-0 rounded-full bg-[#17834D]" />
                {t("privacyBullet1", "No sign-in or account is required.")}
              </li>
              <li className="flex gap-2">
                <span className="mt-1 size-1.5 shrink-0 rounded-full bg-[#17834D]" />
                {t("privacyBullet2", "Preferences stay private in your browser localStorage.")}
              </li>
              <li className="flex gap-2">
                <span className="mt-1 size-1.5 shrink-0 rounded-full bg-[#17834D]" />
                {t("privacyBullet3", "Live weather, mandi prices, and Gemini AI operate securely without tracking.")}
              </li>
            </ul>
          </Card>

          <Card style={{ backgroundColor: "#fafffb" }} className="p-5 sm:p-6">
            <div className="flex items-center gap-2">
              <Leaf aria-hidden="true" className="size-4 text-[#17834D]" />
              <h2 className="text-sm font-bold text-[#183b2b]">AgriNex AI</h2>
              <DemoBadge>LIVE</DemoBadge>
            </div>
            <p className="mt-2 text-xs leading-5 text-[#728177]">
              {t("tagline", "Smarter Farming. Better Decisions.")}
            </p>
          </Card>
        </div>
      </div>
    </>
  );
}
