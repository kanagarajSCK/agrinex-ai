"use client";

import { useState, type FormEvent } from "react";
import { MapPin, Pencil, Plus, Ruler, Sprout, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { DemoBadge, PageHeader } from "@/components/ui/primitives";

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
  { id: 1, name: "Riverside plot", state: "Tamil Nadu", district: "Salem", taluk: "Salem", village: "Sample village", size: "2.5 acres · sample", crops: "Rice, Tomato · sample" },
  { id: 2, name: "East field", state: "Tamil Nadu", district: "Salem", taluk: "Attur", village: "Sample village", size: "1.2 acres · sample", crops: "Groundnut · sample" },
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
  const [form, setForm] = useState<Farm>(initialFarm ?? {
    id: -1,
    name: "",
    state: "Tamil Nadu",
    district: "",
    taluk: "",
    village: "",
    size: "",
    crops: "",
  });
  const [locationMode, setLocationMode] = useState<"manual" | "detect">("manual");
  const [gpsNote, setGpsNote] = useState("");

  function updateField(key: keyof Farm, value: string) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    onSave(form);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-[#101c18]/45 p-0 sm:items-center sm:p-5" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
      <section role="dialog" aria-modal="true" aria-labelledby="farm-dialog-title" className="max-h-[92dvh] w-full max-w-xl overflow-y-auto rounded-t-3xl bg-white p-5 shadow-2xl sm:rounded-3xl sm:p-6">
        <div className="mb-5 flex items-start justify-between gap-3">
          <div><div className="mb-2"><DemoBadge>LOCAL PREVIEW ONLY</DemoBadge></div><h2 id="farm-dialog-title" className="text-xl font-extrabold text-[#183b2b]">{initialFarm ? "Edit farm details" : "Add a farm"}</h2><p className="mt-1 text-xs leading-5 text-[#758279]">Changes stay in this page session; no farm data is saved to a server.</p></div>
          <button type="button" aria-label="Close dialog" onClick={onClose} className="grid size-10 shrink-0 place-items-center rounded-xl text-[#68796f] hover:bg-[#f2f5f3]"><X className="size-5" /></button>
        </div>

        <div className="mb-4 grid grid-cols-2 gap-2">
          <button type="button" aria-pressed={locationMode === "manual"} onClick={() => setLocationMode("manual")} className={`min-h-11 rounded-xl border px-3 text-xs font-bold ${locationMode === "manual" ? "border-[#17834D] bg-[#eff8f1] text-[#176d3f]" : "border-[#dfe8e2] text-[#61746a]"}`}><MapPin aria-hidden="true" className="mr-1 inline size-3.5" />Enter location</button>
          <button type="button" aria-pressed={locationMode === "detect"} onClick={() => { setLocationMode("detect"); setGpsNote("Location detection is not available in this phase. No GPS permission was requested."); }} className={`min-h-11 rounded-xl border px-3 text-xs font-bold ${locationMode === "detect" ? "border-[#17834D] bg-[#eff8f1] text-[#176d3f]" : "border-[#dfe8e2] text-[#61746a]"}`}><MapPin aria-hidden="true" className="mr-1 inline size-3.5" />Detect location · unavailable</button>
        </div>
        {gpsNote && <p role="status" className="mb-3 rounded-lg bg-[#f7f9f7] p-3 text-xs leading-5 text-[#68796f]">{gpsNote}</p>}

        <form onSubmit={handleSubmit} className="space-y-3">
          <label className="block text-xs font-semibold text-[#526b5b]">Farm name<input required value={form.name} onChange={(event) => updateField("name", event.target.value)} placeholder="e.g. North field" className="mt-1.5 min-h-11 w-full rounded-xl border border-[#dfe8e2] px-3 text-sm text-[#20372b] outline-none focus:border-[#17834D] focus:ring-2 focus:ring-[#17834D]/10" /></label>
          <div className="grid gap-3 sm:grid-cols-2">
            {([["state", "State"], ["district", "District"], ["taluk", "Taluk"], ["village", "Village"]] as const).map(([key, label]) => (
              <label key={key} className="block text-xs font-semibold text-[#526b5b]">{label}<input required value={form[key]} onChange={(event) => updateField(key, event.target.value)} placeholder={`Enter ${label.toLowerCase()}`} className="mt-1.5 min-h-11 w-full rounded-xl border border-[#dfe8e2] px-3 text-sm text-[#20372b] outline-none focus:border-[#17834D] focus:ring-2 focus:ring-[#17834D]/10" /></label>
            ))}
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="block text-xs font-semibold text-[#526b5b]">Land size<input value={form.size.replace(" · sample", "")} onChange={(event) => updateField("size", event.target.value)} placeholder="e.g. 2 acres (optional)" className="mt-1.5 min-h-11 w-full rounded-xl border border-[#dfe8e2] px-3 text-sm text-[#20372b] outline-none focus:border-[#17834D]" /></label>
            <label className="block text-xs font-semibold text-[#526b5b]">Associated crops<input value={form.crops.replace(" · sample", "")} onChange={(event) => updateField("crops", event.target.value)} placeholder="e.g. Rice (optional)" className="mt-1.5 min-h-11 w-full rounded-xl border border-[#dfe8e2] px-3 text-sm text-[#20372b] outline-none focus:border-[#17834D]" /></label>
          </div>
          <div className="flex flex-col-reverse gap-2 border-t border-[#edf1ee] pt-4 sm:flex-row sm:justify-end">
            <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
            <Button type="submit">{initialFarm ? "Update preview" : "Add to preview"}</Button>
          </div>
        </form>
      </section>
    </div>
  );
}

export function FarmsPage() {
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
        description="Manage sample farm cards and location details in this browser session. This preview does not save farm information or request device location."
        action={<Button className="min-h-11" onClick={() => setDialogFarm(null)}><Plus aria-hidden="true" className="mr-2 size-4" />Add farm</Button>}
      />

      <div className="mb-5 flex flex-wrap items-center gap-2 rounded-2xl border border-[#e0e9e3] bg-white p-4">
        <MapPin aria-hidden="true" className="size-4 text-[#17834D]" />
        <p className="text-xs leading-5 text-[#66776d]"><strong className="text-[#365344]">Location options:</strong> manual state, district, taluk and village fields are available. Device location detection is unavailable and will not request GPS permission.</p>
        <DemoBadge>EXAMPLE FARMS</DemoBadge>
      </div>

      <section aria-label="Farm cards" className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {farms.map((farm) => (
          <Card key={farm.id} className="overflow-hidden">
            <div className="h-1.5 bg-[#17834D]" />
            <div className="p-4 sm:p-5">
              <div className="flex items-start justify-between gap-3">
                <div className="flex min-w-0 items-center gap-3">
                  <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-[#e6f4ea] text-[#17834D]"><Sprout aria-hidden="true" className="size-5" /></span>
                  <div className="min-w-0"><h2 className="truncate text-base font-bold text-[#183b2b]">{farm.name}</h2><p className="mt-1 text-[10px] text-[#87938b]">Demo farm · session only</p></div>
                </div>
                <DemoBadge />
              </div>
              <p className="mt-4 flex items-start gap-2 text-xs leading-5 text-[#607268]"><MapPin aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-[#17834D]" /><span>{farm.village}, {farm.taluk}, {farm.district}, {farm.state}</span></p>
              <div className="mt-4 grid grid-cols-2 gap-3 border-t border-[#edf1ee] pt-4">
                <div><p className="flex items-center gap-1 text-[10px] text-[#87938b]"><Ruler aria-hidden="true" className="size-3" />Land size</p><p className="mt-1 text-xs font-semibold text-[#456052]">{farm.size || "Not entered"}{!farm.size.includes("sample") ? " · demo" : ""}</p></div>
                <div><p className="flex items-center gap-1 text-[10px] text-[#87938b]"><Sprout aria-hidden="true" className="size-3" />Crop association</p><p className="mt-1 truncate text-xs font-semibold text-[#456052]">{farm.crops || "Not entered"}{!farm.crops.includes("sample") ? " · demo" : ""}</p></div>
              </div>
              <div className="mt-4 border-t border-[#edf1ee] pt-3">
                <Button type="button" variant="secondary" className="min-h-10 w-full" onClick={() => setDialogFarm(farm)}><Pencil aria-hidden="true" className="mr-2 size-3.5" />Edit farm preview</Button>
              </div>
            </div>
          </Card>
        ))}
        <button type="button" onClick={() => setDialogFarm(null)} className="flex min-h-48 flex-col items-center justify-center rounded-2xl border border-dashed border-[#cbd9d0] bg-white/70 p-6 text-center transition hover:border-[#86b99a] hover:bg-white focus-visible:outline-2 focus-visible:outline-[#17834D]">
          <span className="mb-3 grid size-11 place-items-center rounded-xl bg-[#e6f4ea] text-[#17834D]"><Plus aria-hidden="true" className="size-5" /></span><span className="text-sm font-bold text-[#365344]">Add another farm</span><span className="mt-1 text-xs text-[#7b8980]">Create a local sample card</span>
        </button>
      </section>

      <p className="mt-5 rounded-xl border border-[#e5ece7] bg-white p-4 text-xs leading-5 text-[#748279]">Farm details are temporary interface state. There is no account, database, persistence or GPS integration in this phase.</p>

      {dialogFarm !== undefined && <FarmDialog key={dialogFarm?.id ?? "new-farm"} initialFarm={dialogFarm ?? undefined} onClose={() => setDialogFarm(undefined)} onSave={saveFarm} />}
    </>
  );
}
