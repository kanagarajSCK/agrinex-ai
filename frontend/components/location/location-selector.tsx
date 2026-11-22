"use client";

import { useEffect, useMemo, useState } from "react";
import { MapPin } from "lucide-react";
import { fetchDistricts, fetchPlaces, fetchStates, resolveLocation, type LocationRecord } from "@/lib/locations";

export type SelectedLocation = {
  state?: LocationRecord;
  district?: LocationRecord;
  place?: LocationRecord;
};

const LOCATION_STORAGE_KEY = "agrinex-selected-location";

export function LocationSelector({
  onChange,
  compact = false,
}: {
  onChange?: (selection: SelectedLocation) => void;
  compact?: boolean;
}) {
  const [states, setStates] = useState<LocationRecord[]>([]);
  const [districts, setDistricts] = useState<LocationRecord[]>([]);
  const [places, setPlaces] = useState<LocationRecord[]>([]);
  const [state, setState] = useState<LocationRecord>();
  const [district, setDistrict] = useState<LocationRecord>();
  const [place, setPlace] = useState<LocationRecord>();
  const [placeQuery, setPlaceQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    void fetchStates()
      .then((data) => {
        if (!active) return;
        setStates(data.records);
        if (!data.count) setError("No verified LGD snapshot is currently installed.");
      })
      .catch((caught) => {
        if (active) setError(caught instanceof Error ? caught.message : "Location service unavailable.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => { active = false; };
  }, []);

  useEffect(() => {
    if (!district?.district_code) {
      return;
    }
    let active = true;
    void fetchPlaces(district.district_code, placeQuery)
      .then((data) => {
        if (active) setPlaces(data.records);
      })
      .catch(() => {
        if (active) setPlaces([]);
      });
    return () => { active = false; };
  }, [district, placeQuery]);

  const summary = useMemo(() => {
    const names = [place?.name_en, district?.name_en, state?.name_en].filter(Boolean);
    return names.join(", ");
  }, [place, district, state]);

  function selectState(location: LocationRecord) {
    setState(location);
    setDistrict(undefined);
    setPlace(undefined);
    setPlaceQuery("");
    setDistricts([]);
    setPlaces([]);
    onChange?.({ state: location });
    if (location.state_code) {
      void fetchDistricts(location.state_code)
        .then((data) => setDistricts(data.records))
        .catch(() => setDistricts([]));
    }
  }

  function selectDistrict(location: LocationRecord) {
    setDistrict(location);
    setPlace(undefined);
    setPlaceQuery("");
    setPlaces([]);
    onChange?.({ state, district: location });
  }

  function selectPlace(location: LocationRecord) {
    setPlace(location);
    const selection = { state, district, place: location };
    onChange?.(selection);
    void resolveLocation(location.location_id).then((resolved) => {
      window.localStorage.setItem(LOCATION_STORAGE_KEY, JSON.stringify({
        locationId: location.location_id,
        name: resolved
          ? `${location.name_en}, ${district?.name_en || ""}, ${state?.name_en || ""}`
          : `${location.name_en}, ${district?.name_en || ""}, ${state?.name_en || ""}`,
        stateCode: state?.state_code,
        districtCode: district?.district_code,
        stateName: state?.name_en,
        districtName: district?.name_en,
        latitude: resolved?.latitude,
        longitude: resolved?.longitude,
        coordinateResolution: resolved
          ? resolved.resolved_by
          : "unavailable",
      }));
    }).catch(() => {
      window.localStorage.setItem(LOCATION_STORAGE_KEY, JSON.stringify({
        locationId: location.location_id,
        name: `${location.name_en}, ${district?.name_en || ""}, ${state?.name_en || ""}`,
        stateCode: state?.state_code,
        districtCode: district?.district_code,
        stateName: state?.name_en,
        districtName: district?.name_en,
        coordinateResolution: "unavailable",
      }));
    });
  }

  return (
    <div>
      <p className="mb-3 rounded-xl border border-[#dce9df] bg-[#f5faf6] px-3 py-2 text-xs leading-5 text-[#456052]">National state, district and sub-district directory available. Village-level records currently available for Maharashtra, Andhra Pradesh, Karnataka, Kerala, Tamil Nadu and Telangana.</p>
      <div className={`grid gap-3 ${compact ? "md:grid-cols-3" : "md:grid-cols-2 xl:grid-cols-4"}`}>
      <label className="text-xs font-bold text-[#486056]">State / Union Territory
        <select
          value={state?.location_id || ""}
          onChange={(event) => {
            const selected = states.find((item) => item.location_id === event.target.value);
            if (selected) selectState(selected);
          }}
          className="mt-1.5 min-h-11 w-full rounded-xl border border-[#dfe8e2] bg-white px-3 text-sm outline-none"
        >
          <option value="">Select official state</option>
          {states.map((item) => <option key={item.location_id} value={item.location_id}>{item.name_en}{item.name_local ? ` · ${item.name_local}` : ""}</option>)}
        </select>
      </label>
      <label className="text-xs font-bold text-[#486056]">District
        <select
          value={district?.location_id || ""}
          onChange={(event) => {
            const selected = districts.find((item) => item.location_id === event.target.value);
            if (selected) selectDistrict(selected);
          }}
          disabled={!districts.length}
          className="mt-1.5 min-h-11 w-full rounded-xl border border-[#dfe8e2] bg-white px-3 text-sm outline-none disabled:bg-[#f7f9f7]"
        >
          <option value="">Select district</option>
          {districts.map((item) => <option key={item.location_id} value={item.location_id}>{item.name_en}{item.name_local ? ` · ${item.name_local}` : ""}</option>)}
        </select>
      </label>
      <label className="text-xs font-bold text-[#486056]">City / Town / Village
        <input
          value={placeQuery}
          onChange={(event) => setPlaceQuery(event.target.value)}
          disabled={!district}
          placeholder="Search official place"
          className="mt-1.5 min-h-11 w-full rounded-xl border border-[#dfe8e2] bg-white px-3 text-sm outline-none disabled:bg-[#f7f9f7]"
        />
        <select
          value={place?.location_id || ""}
          onChange={(event) => {
            const selected = places.find((item) => item.location_id === event.target.value);
            if (selected) selectPlace(selected);
          }}
          disabled={!places.length}
          className="mt-2 min-h-11 w-full rounded-xl border border-[#dfe8e2] bg-white px-3 text-sm outline-none disabled:bg-[#f7f9f7]"
        >
          <option value="">Select place</option>
          {places.map((item) => <option key={item.location_id} value={item.location_id}>{item.name_en} · {item.entity_type}{item.name_local ? ` · ${item.name_local}` : ""}</option>)}
        </select>
      </label>
      <div className="flex items-end">
        <div className="min-h-11 w-full rounded-xl border border-[#e1e9e3] bg-[#f8faf8] px-3 py-2 text-xs text-[#607268]"><span className="flex items-center gap-1.5 font-bold"><MapPin className="size-3.5" />Selected hierarchy</span><span className="mt-1 block">{summary || "No verified location selected"}</span></div>
      </div>
      {loading && <p className="text-xs text-[#748279] md:col-span-full">Loading official location snapshot…</p>}
      {error && <p role="alert" className="text-xs text-[#9b741f] md:col-span-full">{error}</p>}
      </div>
    </div>
  );
}
