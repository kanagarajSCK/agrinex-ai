"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Bell,
  Bot,
  ChartNoAxesCombined,
  ChevronDown,
  CloudSun,
  History,
  House,
  Languages,
  Leaf,
  Menu,
  Settings,
  Sprout,
  X,
} from "lucide-react";
import { useState, type ReactNode } from "react";
import { languageLabels, type AppLanguage } from "@/lib/i18n";
import { LanguageProvider, useLanguage } from "@/contexts/language-context";
import { LocationProvider } from "@/contexts/location-context";
import { LocationOnboardingModal } from "@/components/location/location-onboarding-modal";
import { GlobalLocationSelector } from "@/components/location/global-location-selector";

function MapPinIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      viewBox="0 0 24 24"
      {...props}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 21s-8-7.5-8-12a8 8 0 1116 0c0 4.5-8 12-8 12z"
      />
      <circle cx="12" cy="9" r="3" />
    </svg>
  );
}

function NavigationLink({
  href,
  label,
  icon: Icon,
  active,
  onClick,
}: {
  href: string;
  label: string;
  icon: typeof House | typeof MapPinIcon;
  active: boolean;
  onClick?: () => void;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      aria-current={active ? "page" : undefined}
      className={`flex min-h-11 items-center gap-3 rounded-xl px-3 text-sm font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#A3E6B5] ${
        active
          ? "bg-white/12 text-white"
          : "text-[#c2d6ca] hover:bg-white/8 hover:text-white"
      }`}
    >
      <Icon aria-hidden="true" className="size-[18px] shrink-0" />
      <span>{label}</span>
    </Link>
  );
}

function Brand() {
  return (
    <Link
      href="/dashboard"
      className="flex items-center gap-3 rounded-lg focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#A3E6B5]"
    >
      <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-[#A3E6B5] text-[#123D2B]">
        <Leaf aria-hidden="true" className="size-5" />
      </span>
      <span>
        <span className="block text-lg font-extrabold tracking-tight text-white">
          AgriNex AI
        </span>
        <span className="block text-[11px] text-[#b8d0c1]">
          Smarter Farming. Better Decisions.
        </span>
      </span>
    </Link>
  );
}

function SystemStatusBadge({
  compact = false,
  label,
}: {
  compact?: boolean;
  label?: string;
}) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-[#c4e3cb] bg-[#eef8f0] px-2.5 py-1 text-[10px] font-bold tracking-[0.08em] text-[#166534]">
      <span className="size-1.5 rounded-full bg-[#16a34a]" />
      {label ?? (compact ? "LIVE INTEGRATIONS" : "LIVE WEATHER, MARKETS & AI")}
    </span>
  );
}

function AppShellContent({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const { language, setLanguage, t } = useLanguage();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const navigation = [
    { href: "/dashboard", label: t("dashboard", "Overview"), icon: House },
    { href: "/assistant", label: t("assistant", "AI Assistant"), icon: Bot },
    { href: "/weather", label: t("weather", "Weather intelligence"), icon: CloudSun },
    { href: "/markets", label: t("markets", "Market intelligence"), icon: ChartNoAxesCombined },
    { href: "/crops", label: t("crops", "Crop intelligence"), icon: Sprout },
    { href: "/farms", label: t("farms", "My farms"), icon: MapPinIcon },
    { href: "/advisories", label: t("advisories", "Advisory history"), icon: History },
    { href: "/settings", label: t("settings", "Profile & settings"), icon: Settings },
  ];

  const mobileNavigation = [
    { href: "/dashboard", label: t("dashboard", "Overview"), icon: House },
    { href: "/assistant", label: t("assistant", "AI Assistant"), icon: Bot },
    { href: "/weather", label: t("weatherShort", "Weather"), icon: CloudSun },
    { href: "/markets", label: t("marketsShort", "Markets"), icon: ChartNoAxesCombined },
  ];

  const isActive = (href: string) =>
    pathname === href || (href === "/dashboard" && pathname === "/");

  return (
    <div className="min-h-screen bg-[#f2f5f3]">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-[260px] flex-col bg-[#123D2B] px-5 py-6 text-white lg:flex">
        <div className="mb-9 px-1">
          <Brand />
        </div>
        <p className="mb-3 px-3 text-[10px] font-bold uppercase tracking-[0.15em] text-[#83a993]">
          {t("workspace", "Workspace")}
        </p>
        <nav aria-label="Main navigation" className="space-y-1">
          {navigation.map((item) => (
            <NavigationLink
              key={item.href}
              {...item}
              active={isActive(item.href)}
            />
          ))}
        </nav>
        <div className="mt-auto rounded-2xl border border-white/10 bg-white/5 p-4">
          <div className="mb-2 flex items-center gap-2 text-xs font-bold text-[#d3ebda]">
            <span className="size-2 rounded-full bg-[#A3E6B5]" />
            {t("activePlatform", "Active Platform")}
          </div>
          <p className="text-xs leading-5 text-[#b9d1c2]">
            {t("activePlatformDesc")}
          </p>
        </div>
      </aside>

      <div className="min-h-screen lg:ml-[260px]">
        <header className="sticky top-0 z-20 border-b border-[#e1e9e3] bg-white/95 backdrop-blur">
          <div className="flex h-[68px] items-center justify-between gap-3 px-4 sm:px-7">
            <div className="flex min-w-0 items-center gap-3 lg:hidden">
              <button
                type="button"
                aria-label={mobileMenuOpen ? "Close navigation" : "Open navigation"}
                aria-expanded={mobileMenuOpen}
                onClick={() => setMobileMenuOpen((open) => !open)}
                className="grid size-10 shrink-0 place-items-center rounded-xl text-[#244b38] hover:bg-[#eff5f0] focus-visible:outline-2 focus-visible:outline-[#17834D]"
              >
                {mobileMenuOpen ? (
                  <X className="size-5" />
                ) : (
                  <Menu className="size-5" />
                )}
              </button>
              <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-[#e1f2e5] text-[#123D2B]">
                <Leaf aria-hidden="true" className="size-[18px]" />
              </span>
              <span className="truncate text-sm font-extrabold text-[#123D2B] sm:text-base">
                AgriNex AI
              </span>
            </div>
            <div className="hidden min-w-0 items-center gap-3 lg:flex">
              <p className="truncate text-sm font-semibold text-[#456052]">
                {t("tagline", "Smarter Farming. Better Decisions.")}
              </p>
              <SystemStatusBadge compact label={t("liveBadge")} />
            </div>

            <div className="flex items-center gap-1.5 sm:gap-2">
              {/* Global Location Selector (Desktop / Tablet) */}
              <div className="hidden md:block">
                <GlobalLocationSelector />
              </div>

              {/* Language Selector */}
              <label className="hidden items-center gap-1.5 rounded-xl border border-[#e0e9e3] bg-white px-3 py-2 text-xs text-[#456052] sm:flex">
                <Languages
                  aria-hidden="true"
                  className="size-4 text-[#17834D]"
                />
                <span className="sr-only">{t("language", "Language")}</span>
                <select
                  aria-label={t("language", "Language")}
                  value={language}
                  onChange={(event) => {
                    const nextLanguage = event.target.value as AppLanguage;
                    setLanguage(nextLanguage);
                  }}
                  className="max-w-28 bg-transparent font-semibold outline-none cursor-pointer"
                >
                  <option value="en">{languageLabels.en}</option>
                  <option value="ta">{languageLabels.ta}</option>
                  <option value="te">{languageLabels.te}</option>
                  <option value="hi">{languageLabels.hi}</option>
                </select>
              </label>

              {/* Notifications */}
              <div className="relative">
                <button
                  type="button"
                  aria-label={t("notifications", "Notifications")}
                  aria-expanded={notificationsOpen}
                  onClick={() => {
                    setNotificationsOpen((open) => !open);
                    setProfileOpen(false);
                  }}
                  className="grid size-10 place-items-center rounded-xl text-[#456052] hover:bg-[#eff5f0] focus-visible:outline-2 focus-visible:outline-[#17834D]"
                >
                  <Bell aria-hidden="true" className="size-[18px]" />
                </button>
                {notificationsOpen && (
                  <div className="absolute right-0 top-12 z-40 w-64 rounded-2xl border border-[#e0e9e3] bg-white p-4 shadow-xl">
                    <p className="text-sm font-bold text-[#173c2b]">
                      {t("notifications", "Notifications")}
                    </p>
                    <p className="mt-2 text-xs leading-5 text-[#61746a]">
                      {t("noNotifications")}
                    </p>
                  </div>
                )}
              </div>

              {/* Farmer Profile */}
              <div className="relative">
                <button
                  type="button"
                  aria-label="Open profile menu"
                  aria-expanded={profileOpen}
                  onClick={() => {
                    setProfileOpen((open) => !open);
                    setNotificationsOpen(false);
                  }}
                  className="flex h-10 items-center gap-2 rounded-xl px-1.5 text-left hover:bg-[#eff5f0] focus-visible:outline-2 focus-visible:outline-[#17834D]"
                >
                  <span className="grid size-8 place-items-center rounded-full bg-[#dceee1] text-xs font-extrabold text-[#123D2B]">
                    DE
                  </span>
                  <span className="hidden text-xs font-semibold text-[#355141] xl:block">
                    {t("farmerSession", "Farmer Session")}
                  </span>
                  <ChevronDown
                    aria-hidden="true"
                    className="hidden size-3 text-[#61746a] xl:block"
                  />
                </button>
                {profileOpen && (
                  <div className="absolute right-0 top-12 z-40 w-56 rounded-2xl border border-[#e0e9e3] bg-white p-2 shadow-xl">
                    <Link
                      onClick={() => setProfileOpen(false)}
                      href="/settings"
                      className="block rounded-lg px-3 py-2 text-sm text-[#355141] hover:bg-[#f2f5f3]"
                    >
                      {t("settings", "Profile & settings")}
                    </Link>
                    <Link
                      onClick={() => setProfileOpen(false)}
                      href="/farms"
                      className="block rounded-lg px-3 py-2 text-sm text-[#355141] hover:bg-[#f2f5f3]"
                    >
                      {t("farms", "My farms")}
                    </Link>
                    <p className="px-3 py-1 text-[10px] text-[#809087]">
                      {t("noLogin")}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Mobile Secondary Bar */}
          <div className="flex items-center justify-between gap-2 border-t border-[#edf1ee] px-4 py-2 md:hidden">
            <div className="min-w-0 flex-1">
              <GlobalLocationSelector compact />
            </div>
            <label className="flex items-center gap-1 text-xs font-semibold text-[#486056]">
              <Languages aria-hidden="true" className="size-3.5 text-[#17834D]" />
              <select
                aria-label={t("language", "Language")}
                value={language}
                onChange={(event) => {
                  const nextLanguage = event.target.value as AppLanguage;
                  setLanguage(nextLanguage);
                }}
                className="max-w-24 bg-transparent outline-none text-xs cursor-pointer font-semibold"
              >
                <option value="en">{languageLabels.en}</option>
                <option value="ta">{languageLabels.ta}</option>
                <option value="te">{languageLabels.te}</option>
                <option value="hi">{languageLabels.hi}</option>
              </select>
            </label>
            <SystemStatusBadge compact label={t("liveBadge")} />
          </div>

          <nav
            aria-label="Tablet navigation"
            className="hidden gap-1 overflow-x-auto border-t border-[#edf1ee] px-5 py-2 md:flex lg:hidden"
          >
            {navigation.map(({ href, label, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                aria-current={isActive(href) ? "page" : undefined}
                className={`flex shrink-0 items-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold ${
                  isActive(href)
                    ? "bg-[#e6f4ea] text-[#123D2B]"
                    : "text-[#587064] hover:bg-[#f2f5f3]"
                }`}
              >
                <Icon aria-hidden="true" className="size-4" />
                {label}
              </Link>
            ))}
          </nav>
        </header>

        {mobileMenuOpen && (
          <div
            className="fixed inset-0 z-40 bg-[#101c18]/40 lg:hidden"
            onClick={() => setMobileMenuOpen(false)}
          >
            <div
              className="w-[min(84vw,340px)] rounded-br-3xl bg-[#123D2B] p-5 pb-8 text-white shadow-2xl"
              onClick={(event) => event.stopPropagation()}
            >
              <div className="mb-8 flex items-center justify-between">
                <Brand />
                <button
                  type="button"
                  aria-label="Close navigation"
                  onClick={() => setMobileMenuOpen(false)}
                  className="grid size-10 place-items-center rounded-xl text-white hover:bg-white/10"
                >
                  <X className="size-5" />
                </button>
              </div>
              <nav aria-label="Mobile navigation" className="space-y-1">
                {navigation.map((item) => (
                  <NavigationLink
                    key={item.href}
                    {...item}
                    active={isActive(item.href)}
                    onClick={() => setMobileMenuOpen(false)}
                  />
                ))}
              </nav>
              <div className="mt-7">
                <SystemStatusBadge label={t("liveBadgeFull")} />
              </div>
            </div>
          </div>
        )}

        <main className="mx-auto min-h-[calc(100vh-68px)] w-full max-w-[1600px] px-4 pb-28 pt-5 sm:px-6 sm:pt-7 md:pb-10 lg:px-8 xl:px-10">
          {children}
          <footer className="mt-9 border-t border-[#e0e9e3] py-5 text-center text-[11px] leading-5 text-[#738279]">
            {t("footerText")}
          </footer>
        </main>
      </div>

      <nav
        aria-label="Bottom navigation"
        className="fixed inset-x-0 bottom-0 z-30 grid grid-cols-4 border-t border-[#dfe8e2] bg-white/95 px-1 pb-[env(safe-area-inset-bottom)] pt-1.5 shadow-[0_-8px_24px_rgba(16,28,24,0.07)] backdrop-blur md:hidden"
      >
        {mobileNavigation.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            aria-current={isActive(href) ? "page" : undefined}
            className={`flex min-h-14 flex-col items-center justify-center gap-1 rounded-xl text-[10px] font-semibold ${
              isActive(href) ? "text-[#147345]" : "text-[#748279]"
            }`}
          >
            <Icon aria-hidden="true" className="size-[19px]" />
            <span className="max-w-full truncate px-1">
              {label}
            </span>
          </Link>
        ))}
      </nav>
    </div>
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <LanguageProvider>
      <LocationProvider>
        <AppShellContent>{children}</AppShellContent>
        <LocationOnboardingModal />
      </LocationProvider>
    </LanguageProvider>
  );
}
