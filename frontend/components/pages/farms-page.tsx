"use client";

import { useState, type FormEvent } from "react";
import { MapPin, Pencil, Plus, Ruler, Sprout, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/primitives";
import { useLocation } from "@/contexts/location-context";

interface Farm {
  id: number;
  name: string;
  state: string;
  district: string;
  taluk: string;
  village: string;
  size: string;
  crops: string;
}

const initialFarms: Farm[] = [
  { id: 1, name: "Riverside plot", state: "Tamil Nadu", district: "Salem", taluk: "Salem", village: "Seelanaickenpatti", size: "2.5 acres", crops: "Rice, Tomato" },
  { id: 2, name: "East field", state: "Tamil Nadu", district: "Salem", taluk: "Attur", village: "Kallakurichi road", size: "1.2 acres", crops: "Groundnut" },
];

function FarmDialog({
  initialFarm,
  onClose,
  onSave,
}: {
  initialFarm?: Farm;
  onClose: () => void;
  onSave: (farm: Farm) => void;
}) {
  const { location, openOnboarding } = useLocation();

  const [form, setForm] = useState<Farm>(() => {
    if (initialFarm) return initialFarm;
    return {
      id: -1,
      name: "",
      state: location?.state || "Tamil Nadu",
      district: location?.district || "Salem",
      taluk: location?.subdistrict || location?.district || "Salem",
      village: location?.village || "",
      size: "",
      crops: "",
    };
  });

  function updateField(key: keyof Farm, value: string) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function fillFromConfirmedLocation() {
    if (!location) {
      openOnboarding();
      return;
    }
    setForm((current) => ({
      ...current,
      state: location.state,
      district: location.district,
      taluk: location.subdistrict || location.district,
      village: location.village || current.village,
    }));
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    onSave(form);
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-[#101c18]/50 p-0 backdrop-blur-sm sm:items-center sm:p-5"
      onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="farm-dialog-title"
        className="max-h-[92dvh] w-full max-w-xl overflow-y-auto rounded-t-3xl bg-white p-5 shadow-2xl sm:rounded-3xl sm:p-6"
      >
        <div className="mb-5 flex items-start justify-between gap-3">
          <div>
            <div className="mb-2">
              <span className="rounded-full bg-[#e6f4ea] px-2.5 py-0.5 text-[10px] font-bold text-[#17834D]">
                SESSION PREVIEW
              </span>
            </div>
            <h2 id="farm-dialog-title" className="text-xl font-extrabold text-[#183b2b]">
              {initialFarm ? "Edit farm details" : "Add a farm"}
            </h2>
            <p className="mt-1 text-xs leading-5 text-[#758279]">
              Manage farm details in this browser session.
            </p>
          </div>
          <button
            type="button"
            aria-label="Close dialog"
            onClick={onClose}
            className="grid size-10 shrink-0 place-items-center rounded-xl text-[#68796f] hover:bg-[#f2f5f3]"
          >
            <X className="size-5" />
          </button>
        </div>

        {location && (
          <div className="mb-4 flex items-center justify-between rounded-xl border border-[#c4e3cb] bg-[#f2f9f4] p-3 text-xs">
            <div className="flex items-center gap-2">
              <MapPin className="size-4 text-[#17834D]" />
              <span className="font-semibold text-[#166534]">
                Confirmed location: {location.formattedName}
              </span>
            </div>
            <button
              type="button"
              onClick={fillFromConfirmedLocation}
              className="rounded-lg bg-[#17834D] px-2.5 py-1 text-[11px] font-bold text-white hover:bg-[#123D2B]"
            >
              Fill Details
            </button>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3">
          <label className="block text-xs font-semibold text-[#526b5b]">
            Farm name *
            <input
              required
              value={form.name}
              onChange={(event) => updateField("name", event.target.value)}
              placeholder="e.g. North field"
              className="mt-1.5 min-h-11 w-full rounded-xl border border-[#dfe8e2] px-3 text-sm text-[#20372b] outline-none focus:border-[#17834D] focus:ring-2 focus:ring-[#17834D]/10"
            />
          </label>
          <div className="grid gap-3 sm:grid-cols-2">
            {([["state", "State"], ["district", "District"], ["taluk", "Taluk"], ["village", "Village"]] as const).map(([key, label]) => (
              <label key={key} className="block text-xs font-semibold text-[#526b5b]">
                {label} *
                <input
                  required
                  value={form[key]}
                  onChange={(event) => updateField(key, event.target.value)}
                  placeholder={`Enter ${label.toLowerCase()}`}
                  className="mt-1.5 min-h-11 w-full rounded-xl border border-[#dfe8e2] px-3 text-sm text-[#20372b] outline-none focus:border-[#17834D] focus:ring-2 focus:ring-[#17834D]/10"
                />
              </label>
            ))}
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="block text-xs font-semibold text-[#526b5b]">
              Land size
              <input
                value={form.size}
                onChange={(event) => updateField("size", event.target.value)}
                placeholder="e.g. 2 acres (optional)"
                className="mt-1.5 min-h-11 w-full rounded-xl border border-[#dfe8e2] px-3 text-sm text-[#20372b] outline-none focus:border-[#17834D]"
              />
            </label>
            <label className="block text-xs font-semibold text-[#526b5b]">
              Associated crops
              <input
                value={form.crops}
                onChange={(event) => updateField("crops", event.target.value)}
                placeholder="e.g. Rice, Tomato (optional)"
                className="mt-1.5 min-h-11 w-full rounded-xl border border-[#dfe8e2] px-3 text-sm text-[#20372b] outline-none focus:border-[#17834D]"
              />
            </label>
          </div>
          <div className="flex flex-col-reverse gap-2 border-t border-[#edf1ee] pt-4 sm:flex-row sm:justify-end">
            <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
            <Button type="submit">{initialFarm ? "Update Farm" : "Save Farm"}</Button>
          </div>
        </form>
      </section>
    </div>
  );
}

export function FarmsPage() {
  const { location, openOnboarding } = useLocation();
  const [farms, setFarms] = useState(initialFarms);
  const [dialogFarm, setDialogFarm] = useState<Farm | null | undefined>(undefined);

  function saveFarm(farm: Farm) {
    const savedFarm = farm.id === -1 ? { ...farm, id: Date.now() } : farm;
    setFarms((current) => {
      const exists = current.some((item) => item.id === savedFarm.id);
      return exists ? current.map((item) => item.id === savedFarm.id ? savedFarm : item) : [...current, savedFarm];
    });
    setDialogFarm(undefined);
  }

  return (
    <>
      <PageHeader
        eyebrow="Farm workspace"
        title="My farms"
        description="Manage farm plots and location details. Seamlessly prefill farm information using your verified agricultural location."
        action={
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => openOnboarding()}
              className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-[#dfe8e2] bg-white px-3.5 text-xs font-semibold text-[#456052] hover:bg-[#f8faf8]"
            >
              <MapPin className="size-3.5 text-[#17834D]" />
              <span className="max-w-[150px] truncate">
                {location?.formattedName || "Select Location"}
              </span>
            </button>
            <Button className="min-h-11" onClick={() => setDialogFarm(null)}>
              <Plus aria-hidden="true" className="mr-2 size-4" />Add farm
            </Button>
          </div>
        }
      />

      <div className="mb-5 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[#e0e9e3] bg-white p-4">
        <div className="flex items-center gap-2">
          <MapPin aria-hidden="true" className="size-4 text-[#17834D]" />
          <p className="text-xs leading-5 text-[#66776d]">
            <strong className="text-[#365344]">Connected Location:</strong>{" "}
            {location ? `${location.formattedName} (${location.source.toUpperCase()})` : "Salem, Tamil Nadu (Suggested benchmark)"}
          </p>
        </div>
        <button
          type="button"
          onClick={() => openOnboarding()}
          className="text-xs font-bold text-[#17834D] hover:underline"
        >
          Change Farming Location →
        </button>
      </div>

      <section aria-label="Farm cards" className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {farms.map((farm) => (
          <Card key={farm.id} className="overflow-hidden">
            <div className="h-1.5 bg-[#17834D]" />
            <div className="p-4 sm:p-5">
              <div className="flex items-start justify-between gap-3">
                <div className="flex min-w-0 items-center gap-3">
                  <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-[#e6f4ea] text-[#17834D]">
                    <Sprout aria-hidden="true" className="size-5" />
                  </span>
                  <div className="min-w-0">
                    <h2 className="truncate text-base font-bold text-[#183b2b]">{farm.name}</h2>
                    <p className="mt-1 text-[10px] text-[#87938b]">Farm profile · browser session</p>
                  </div>
                </div>
              </div>
              <p className="mt-4 flex items-start gap-2 text-xs leading-5 text-[#607268]">
                <MapPin aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-[#17834D]" />
                <span>{farm.village ? `${farm.village}, ` : ""}{farm.taluk ? `${farm.taluk}, ` : ""}{farm.district}, {farm.state}</span>
              </p>
              <div className="mt-4 grid grid-cols-2 gap-3 border-t border-[#edf1ee] pt-4">
                <div>
                  <p className="flex items-center gap-1 text-[10px] text-[#87938b]">
                    <Ruler aria-hidden="true" className="size-3" />Land size
                  </p>
                  <p className="mt-1 text-xs font-semibold text-[#456052]">{farm.size || "Not entered"}</p>
                </div>
                <div>
                  <p className="flex items-center gap-1 text-[10px] text-[#87938b]">
                    <Sprout aria-hidden="true" className="size-3" />Crop association
                  </p>
                  <p className="mt-1 truncate text-xs font-semibold text-[#456052]">{farm.crops || "Not entered"}</p>
                </div>
              </div>
              <div className="mt-4 border-t border-[#edf1ee] pt-3">
                <Button type="button" variant="secondary" className="min-h-10 w-full" onClick={() => setDialogFarm(farm)}>
                  <Pencil aria-hidden="true" className="mr-2 size-3.5" />Edit farm details
                </Button>
              </div>
            </div>
          </Card>
        ))}
        <button
          type="button"
          onClick={() => setDialogFarm(null)}
          className="flex min-h-48 flex-col items-center justify-center rounded-2xl border border-dashed border-[#cbd9d0] bg-white/70 p-6 text-center transition hover:border-[#86b99a] hover:bg-white focus-visible:outline-2 focus-visible:outline-[#17834D]"
        >
          <span className="mb-3 grid size-11 place-items-center rounded-xl bg-[#e6f4ea] text-[#17834D]">
            <Plus aria-hidden="true" className="size-5" />
          </span>
          <span className="text-sm font-bold text-[#365344]">Add another farm</span>
          <span className="mt-1 text-xs text-[#7b8980]">Add a plot with your local details</span>
        </button>
      </section>

      <p className="mt-5 rounded-xl border border-[#e5ece7] bg-white p-4 text-xs leading-5 text-[#748279]">
        Farm details are kept in browser-local session state in accordance with AgriNex AI no-account privacy guidelines.
      </p>

      {dialogFarm !== undefined && (
        <FarmDialog
          key={dialogFarm?.id ?? "new-farm"}
          initialFarm={dialogFarm ?? undefined}
          onClose={() => setDialogFarm(undefined)}
          onSave={saveFarm}
        />
      )}
    </>
  );
}
