"use client";

import { useEffect, useState } from "react";
import {
  AlertCircle,
  CheckCircle2,
  Crosshair,
  Info,
  Loader2,
  MapPin,
  RefreshCw,
  Search,
  Sparkles,
  X,
} from "lucide-react";
import { useLocation, type OnboardingTab } from "@/contexts/location-context";
import {
  fetchDistricts,
  fetchPlaces,
  fetchStates,
  fetchSubDistricts,
  resolveLocation,
  SIX_VILLAGE_STATES,
  type LocationRecord,
} from "@/lib/locations";

export function LocationOnboardingModal() {
  const {
    status,
    detectedPending,
    isOnboardingOpen,
    onboardingInitialTab,
    errorMessage,
    closeOnboarding,
    detectGpsLocation,
    confirmDetectedGps,
    confirmManualLocation,
    confirmSuggestedLocation,
  } = useLocation();

  const [activeTab, setActiveTab] = useState<OnboardingTab>("gps");

  // Cascading Manual selection states
  const [states, setStates] = useState<LocationRecord[]>([]);
  const [districts, setDistricts] = useState<LocationRecord[]>([]);
  const [subdistricts, setSubdistricts] = useState<LocationRecord[]>([]);
  const [places, setPlaces] = useState<LocationRecord[]>([]);

  const [selectedState, setSelectedState] = useState<LocationRecord | null>(null);
  const [selectedDistrict, setSelectedDistrict] = useState<LocationRecord | null>(null);
  const [selectedSubdistrict, setSelectedSubdistrict] = useState<LocationRecord | null>(null);
  const [selectedPlace, setSelectedPlace] = useState<LocationRecord | null>(null);
  const [placeQuery, setPlaceQuery] = useState("");

  const [loadingHierarchy, setLoadingHierarchy] = useState(false);
  const [loadingPlaces, setLoadingPlaces] = useState(false);
  const [resolvingCoordinates, setResolvingCoordinates] = useState(false);
  const [manualError, setManualError] = useState("");

  // Sync initial tab whenever modal opens
  useEffect(() => {
    if (isOnboardingOpen) {
      void Promise.resolve().then(() => {
        setActiveTab(onboardingInitialTab);
      });
    }
  }, [isOnboardingOpen, onboardingInitialTab]);

  // Handle closing modal via Escape key
  useEffect(() => {
    if (!isOnboardingOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        closeOnboarding();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOnboardingOpen, closeOnboarding]);

  // Load official states when modal opens or when Manual tab is active
  useEffect(() => {
    if (!isOnboardingOpen) return;
    let active = true;
    void fetchStates()
      .then((res) => {
        if (active) setStates(res.records);
      })
      .catch((err) => {
        if (active) {
          setManualError(
            err instanceof Error ? err.message : "Unable to load state directory."
          );
        }
      });
    return () => {
      active = false;
    };
  }, [isOnboardingOpen]);

  // Handle State selection
  const handleSelectState = (stateId: string) => {
    const st = states.find((s) => s.location_id === stateId) || null;
    setSelectedState(st);
    setSelectedDistrict(null);
    setSelectedSubdistrict(null);
    setSelectedPlace(null);
    setDistricts([]);
    setSubdistricts([]);
    setPlaces([]);
    setPlaceQuery("");
    setManualError("");

    if (st?.state_code) {
      setLoadingHierarchy(true);
      void fetchDistricts(st.state_code)
        .then((res) => {
          setDistricts(res.records);
          if (res.records.length === 0) {
            setManualError("No districts found for this state in the current snapshot.");
          }
        })
        .catch((err) => {
          setDistricts([]);
          setManualError(
            err instanceof Error
              ? `Unable to load districts: ${err.message}. Please retry.`
              : "Unable to load districts. Please retry."
          );
        })
        .finally(() => setLoadingHierarchy(false));
    }
  };

  // Handle District selection
  const handleSelectDistrict = (districtId: string) => {
    const dist = districts.find((d) => d.location_id === districtId) || null;
    setSelectedDistrict(dist);
    setSelectedSubdistrict(null);
    setSelectedPlace(null);
    setSubdistricts([]);
    setPlaces([]);
    setPlaceQuery("");
    setManualError("");

    if (dist?.district_code) {
      setLoadingHierarchy(true);
      void fetchSubDistricts(dist.district_code)
        .then((res) => setSubdistricts(res.records))
        .catch(() => setSubdistricts([]))
        .finally(() => setLoadingHierarchy(false));

      // Also pre-fetch places
      setLoadingPlaces(true);
      void fetchPlaces(dist.district_code, "")
        .then((res) => setPlaces(res.records))
        .catch(() => setPlaces([]))
        .finally(() => setLoadingPlaces(false));
    }
  };

  // Handle Place search/filter
  const handlePlaceSearch = (query: string) => {
    setPlaceQuery(query);
    if (!selectedDistrict?.district_code) return;
    setLoadingPlaces(true);
    void fetchPlaces(selectedDistrict.district_code, query)
      .then((res) => setPlaces(res.records))
      .catch(() => setPlaces([]))
      .finally(() => setLoadingPlaces(false));
  };

  // Submit manual location
  const handleConfirmManual = async () => {
    if (!selectedState) {
      setManualError("Please select a State or Union Territory.");
      return;
    }
    if (!selectedDistrict) {
      setManualError("Please select a District.");
      return;
    }

    setResolvingCoordinates(true);
    setManualError("");

    try {
      const targetRecord = selectedPlace || selectedDistrict || selectedState;
      const resolved = await resolveLocation(targetRecord.location_id);

      const lat = resolved?.latitude ?? targetRecord.latitude ?? 11.6643;
      const lon = resolved?.longitude ?? targetRecord.longitude ?? 78.146;

      const parts: string[] = [];
      if (selectedPlace) parts.push(selectedPlace.name_en);
      if (selectedSubdistrict && selectedSubdistrict.name_en !== selectedDistrict.name_en) {
        parts.push(selectedSubdistrict.name_en);
      }
      parts.push(selectedDistrict.name_en);
      parts.push(selectedState.name_en);

      confirmManualLocation({
        latitude: lat,
        longitude: lon,
        country: "India",
        state: selectedState.name_en,
        district: selectedDistrict.name_en,
        subdistrict: selectedSubdistrict?.name_en || null,
        village: selectedPlace?.name_en || null,
        locationId: targetRecord.location_id,
        stateCode: selectedState.state_code || null,
        districtCode: selectedDistrict.district_code || null,
        subdistrictCode: null,
        villageCode: selectedPlace?.lgd_code || null,
        formattedName: parts.join(", "),
        villageCoverageAvailable: SIX_VILLAGE_STATES.has(selectedState.name_en),
      });
    } catch (err) {
      setManualError(
        err instanceof Error
          ? err.message
          : "Unable to verify coordinates for this location. Please try again."
      );
    } finally {
      setResolvingCoordinates(false);
    }
  };

  if (!isOnboardingOpen) return null;

  const isDetectingGps =
    status === "requesting_permission" || status === "detecting";
  const isPermissionDenied = status === "permission_denied";
  const isGpsDetected = status === "detected_pending_confirmation" && detectedPending;
  const isStateWithVillages =
    selectedState ? SIX_VILLAGE_STATES.has(selectedState.name_en) : false;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="location-onboarding-title"
      onClick={closeOnboarding}
      className="fixed inset-0 z-50 flex items-end justify-center bg-[#101c18]/60 p-0 backdrop-blur-sm sm:items-center sm:p-4"
    >
      <div
        className="flex max-h-[94dvh] w-full max-w-2xl flex-col overflow-hidden rounded-t-3xl bg-white shadow-2xl sm:rounded-3xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="relative border-b border-[#e5ede7] bg-[#f7faf8] px-6 py-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="mb-1.5 flex items-center gap-2">
                <span className="grid size-6 place-items-center rounded-lg bg-[#A3E6B5] text-[#123D2B]">
                  <MapPin className="size-3.5" />
                </span>
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#17834D]">
                  Location Setup
                </span>
              </div>
              <h2
                id="location-onboarding-title"
                className="text-xl font-extrabold tracking-tight text-[#123D2B] sm:text-2xl"
              >
                Let&apos;s find your farming location
              </h2>
              <p className="mt-1 text-xs leading-5 text-[#546b5e] sm:text-sm">
                Select your location to get accurate local weather, mandi prices and agricultural recommendations.
              </p>
            </div>
            <button
              type="button"
              onClick={closeOnboarding}
              aria-label="Close location setup dialog"
              title="Close"
              className="grid size-10 shrink-0 place-items-center rounded-xl border border-[#dfe8e1] bg-white text-[#546b5e] shadow-sm transition hover:border-[#b8d1c1] hover:bg-[#eaf1ec] hover:text-[#123D2B] focus:outline-none focus:ring-2 focus:ring-[#17834D]"
            >
              <X className="size-5" />
            </button>
          </div>

          {/* Action Tabs */}
          <div className="mt-5 flex gap-2 border-b border-[#dfe8e1] pb-px">
            <button
              type="button"
              onClick={() => {
                setActiveTab("gps");
              }}
              className={`flex items-center gap-2 rounded-t-xl px-4 py-2 text-xs font-bold transition-colors ${
                activeTab === "gps"
                  ? "border-b-2 border-[#17834D] bg-white text-[#17834D]"
                  : "text-[#546b5e] hover:bg-white/60 hover:text-[#123D2B]"
              }`}
            >
              <Crosshair className="size-4" />
              Use Current Location
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveTab("manual");
              }}
              className={`flex items-center gap-2 rounded-t-xl px-4 py-2 text-xs font-bold transition-colors ${
                activeTab === "manual"
                  ? "border-b-2 border-[#17834D] bg-white text-[#17834D]"
                  : "text-[#546b5e] hover:bg-white/60 hover:text-[#123D2B]"
              }`}
            >
              <MapPin className="size-4" />
              Select Manually
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveTab("suggested");
              }}
              className={`flex items-center gap-2 rounded-t-xl px-4 py-2 text-xs font-bold transition-colors ${
                activeTab === "suggested"
                  ? "border-b-2 border-[#17834D] bg-white text-[#17834D]"
                  : "text-[#546b5e] hover:bg-white/60 hover:text-[#123D2B]"
              }`}
            >
              <Sparkles className="size-4" />
              Suggested Location
            </button>
          </div>
        </div>

        {/* Tab Content Body */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* TAB A: GPS CURRENT LOCATION */}
          {activeTab === "gps" && (
            <div className="space-y-4">
              {isPermissionDenied ? (
                /* Permission Denied Experience */
                <div className="rounded-2xl border border-[#fed7aa] bg-[#fffaf5] p-5">
                  <div className="flex items-start gap-3">
                    <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-[#ffedd5] text-[#c2410c]">
                      <AlertCircle className="size-5" />
                    </span>
                    <div>
                      <h3 className="text-sm font-bold text-[#9a3412]">
                        Location permission is unavailable
                      </h3>
                      <p className="mt-1 text-xs leading-5 text-[#7c2d12]">
                        Location permission is unavailable. You can still use AgriNex AI by selecting your farming location manually or using our benchmark suggested location.
                      </p>
                      <div className="mt-4 flex flex-wrap gap-2.5">
                        <button
                          type="button"
                          onClick={() => setActiveTab("manual")}
                          className="inline-flex min-h-10 items-center justify-center rounded-xl bg-[#17834D] px-3.5 text-xs font-bold text-white hover:bg-[#123D2B]"
                        >
                          Select Location Manually
                        </button>
                        <button
                          type="button"
                          onClick={() => confirmSuggestedLocation()}
                          className="inline-flex min-h-10 items-center justify-center rounded-xl border border-[#fed7aa] bg-white px-3.5 text-xs font-bold text-[#9a3412] hover:bg-[#fff7ed]"
                        >
                          Use Suggested: Salem, TN
                        </button>
                        <button
                          type="button"
                          onClick={() => void detectGpsLocation()}
                          className="inline-flex min-h-10 items-center justify-center gap-1.5 rounded-xl border border-[#d1d5db] bg-white px-3 text-xs font-medium text-[#4b5563] hover:bg-[#f9fafb]"
                        >
                          <RefreshCw className="size-3.5" />
                          Try Permission Again
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ) : isGpsDetected ? (
                /* GPS Detected Confirmation View */
                <div className="space-y-4">
                  <div className="rounded-2xl border border-[#c4e3cb] bg-[#eef8f0] p-5">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-[#16a34a]/15 px-2.5 py-0.5 text-[11px] font-bold text-[#15803d]">
                          <CheckCircle2 className="size-3.5" /> GPS Location Detected
                        </span>
                        <h3 className="mt-2 text-lg font-extrabold text-[#123D2B]">
                          {detectedPending.formatted_name}
                        </h3>
                        <p className="mt-1 text-xs text-[#526a5c]">
                          Coordinates: {detectedPending.latitude.toFixed(4)}°N, {detectedPending.longitude.toFixed(4)}°E
                        </p>
                      </div>
                      <span className="rounded-lg border border-[#c4e3cb] bg-white px-2 py-1 text-[10px] font-bold text-[#166534]">
                        {detectedPending.confidence.toUpperCase()}
                      </span>
                    </div>

                    <div className="mt-4 grid grid-cols-2 gap-2 text-xs sm:grid-cols-4">
                      <div className="rounded-xl border border-[#d2e7d8] bg-white p-2.5">
                        <span className="block text-[10px] font-bold uppercase text-[#73887c]">State</span>
                        <span className="font-semibold text-[#183b2b]">
                          {detectedPending.state_name || "—"}
                        </span>
                      </div>
                      <div className="rounded-xl border border-[#d2e7d8] bg-white p-2.5">
                        <span className="block text-[10px] font-bold uppercase text-[#73887c]">District</span>
                        <span className="font-semibold text-[#183b2b]">
                          {detectedPending.district_name || "—"}
                        </span>
                      </div>
                      <div className="rounded-xl border border-[#d2e7d8] bg-white p-2.5">
                        <span className="block text-[10px] font-bold uppercase text-[#73887c]">Taluk / Area</span>
                        <span className="font-semibold text-[#183b2b]">
                          {detectedPending.subdistrict?.name_en || detectedPending.place_name || "—"}
                        </span>
                      </div>
                      <div className="rounded-xl border border-[#d2e7d8] bg-white p-2.5">
                        <span className="block text-[10px] font-bold uppercase text-[#73887c]">Village Coverage</span>
                        <span className="font-semibold text-[#183b2b]">
                          {detectedPending.village_coverage_available ? "Available" : "District Level"}
                        </span>
                      </div>
                    </div>

                    <div className="mt-5 flex flex-wrap items-center gap-3">
                      <button
                        type="button"
                        onClick={confirmDetectedGps}
                        className="inline-flex min-h-11 flex-1 items-center justify-center gap-2 rounded-xl bg-[#17834D] px-5 text-sm font-bold text-white shadow-sm hover:bg-[#123D2B]"
                      >
                        <CheckCircle2 className="size-4" />
                        Confirm This Location
                      </button>
                      <button
                        type="button"
                        onClick={() => void detectGpsLocation()}
                        className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-[#c4e3cb] bg-white px-4 text-xs font-bold text-[#166534] hover:bg-[#f4fbf5]"
                      >
                        <RefreshCw className="size-3.5" />
                        Re-detect
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                /* Initial GPS Prompt View */
                <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-[#cddcd2] bg-[#f8faf8] px-6 py-10 text-center">
                  <span className="grid size-14 place-items-center rounded-2xl bg-[#e6f4ea] text-[#17834D]">
                    <Crosshair className="size-7" />
                  </span>
                  <h3 className="mt-4 text-base font-bold text-[#123D2B]">
                    Detect your farm via device GPS
                  </h3>
                  <p className="mt-1.5 max-w-md text-xs leading-5 text-[#5f7467]">
                    Click below to request GPS location. We only access your device location when you explicitly click this button, and we never track your background location.
                  </p>

                  {errorMessage && (
                    <div className="mt-4 flex items-center gap-2 rounded-xl border border-[#fecaca] bg-[#fef2f2] px-3.5 py-2 text-xs font-medium text-[#b91c1c]">
                      <AlertCircle className="size-4 shrink-0" />
                      {errorMessage}
                    </div>
                  )}

                  <button
                    type="button"
                    disabled={isDetectingGps}
                    onClick={() => void detectGpsLocation()}
                    className="mt-6 inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-[#17834D] px-6 text-sm font-bold text-white shadow-sm transition-all hover:bg-[#123D2B] disabled:opacity-60"
                  >
                    {isDetectingGps ? (
                      <>
                        <Loader2 className="size-4 animate-spin" />
                        Detecting Location…
                      </>
                    ) : (
                      <>
                        <Crosshair className="size-4" />
                        Detect My Current Location
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          )}

          {/* TAB B: SELECT LOCATION MANUALLY */}
          {activeTab === "manual" && (
            <div className="space-y-4">
              <div className="rounded-xl border border-[#dce9df] bg-[#f4faf6] p-3.5 text-xs leading-5 text-[#355342]">
                <div className="flex items-start gap-2">
                  <Info className="mt-0.5 size-4 shrink-0 text-[#17834D]" />
                  <div>
                    <strong className="font-bold">Official LGD Coverage:</strong> Village-level records are available for 6 states: <em>Maharashtra, Andhra Pradesh, Karnataka, Kerala, Tamil Nadu, and Telangana</em>. Other states and Union Territories currently have complete district-level coverage.
                  </div>
                </div>
              </div>

              {manualError && (
                <div className="flex items-center gap-2 rounded-xl border border-[#fecaca] bg-[#fef2f2] px-3.5 py-2 text-xs font-medium text-[#b91c1c]">
                  <AlertCircle className="size-4 shrink-0" />
                  {manualError}
                </div>
              )}

              <div className="grid gap-3.5 sm:grid-cols-2">
                {/* 1. Country */}
                <label className="block text-xs font-bold text-[#355141]">
                  Country
                  <input
                    type="text"
                    readOnly
                    value="India (National LGD Directory)"
                    className="mt-1.5 min-h-11 w-full rounded-xl border border-[#dfe8e2] bg-[#f8faf8] px-3 text-xs font-semibold text-[#546b5e] outline-none"
                  />
                </label>

                {/* 2. State */}
                <label className="block text-xs font-bold text-[#355141]">
                  State / Union Territory *
                  <select
                    value={selectedState?.location_id || ""}
                    onChange={(e) => handleSelectState(e.target.value)}
                    className="mt-1.5 min-h-11 w-full rounded-xl border border-[#dfe8e2] bg-white px-3 text-xs font-medium text-[#183b2b] outline-none focus:border-[#17834D] focus:ring-1 focus:ring-[#17834D]"
                  >
                    <option value="">Select State or Union Territory</option>
                    {states.map((s) => (
                      <option key={s.location_id} value={s.location_id}>
                        {s.name_en} {s.name_local ? `(${s.name_local})` : ""}
                      </option>
                    ))}
                  </select>
                </label>

                {/* 3. District */}
                <div>
                  <label className="block text-xs font-bold text-[#355141]">
                    District *
                    <select
                      disabled={!selectedState || loadingHierarchy}
                      value={selectedDistrict?.location_id || ""}
                      onChange={(e) => handleSelectDistrict(e.target.value)}
                      className="mt-1.5 min-h-11 w-full rounded-xl border border-[#dfe8e2] bg-white px-3 text-xs font-medium text-[#183b2b] outline-none focus:border-[#17834D] focus:ring-1 focus:ring-[#17834D] disabled:bg-[#f7f9f7] disabled:text-[#9ca3af]"
                    >
                      <option value="">
                        {loadingHierarchy ? "Loading districts…" : "Select District"}
                      </option>
                      {districts.map((d) => (
                        <option key={d.location_id} value={d.location_id}>
                          {d.name_en} {d.name_local ? `(${d.name_local})` : ""}
                        </option>
                      ))}
                    </select>
                  </label>
                  {selectedState && !districts.length && !loadingHierarchy && (
                    <button
                      type="button"
                      onClick={() => handleSelectState(selectedState.location_id)}
                      className="mt-1.5 inline-flex items-center gap-1 text-[11px] font-bold text-[#17834D] hover:underline"
                    >
                      <RefreshCw className="size-3" /> Retry loading districts
                    </button>
                  )}
                </div>

                {/* 4. Sub-district / Taluk */}
                <label className="block text-xs font-bold text-[#355141]">
                  Sub-district / Taluk {isStateWithVillages ? "" : "(Optional)"}
                  <select
                    disabled={!selectedDistrict || !subdistricts.length}
                    value={selectedSubdistrict?.location_id || ""}
                    onChange={(e) => {
                      const sub =
                        subdistricts.find((s) => s.location_id === e.target.value) ||
                        null;
                      setSelectedSubdistrict(sub);
                    }}
                    className="mt-1.5 min-h-11 w-full rounded-xl border border-[#dfe8e2] bg-white px-3 text-xs font-medium text-[#183b2b] outline-none focus:border-[#17834D] focus:ring-1 focus:ring-[#17834D] disabled:bg-[#f7f9f7] disabled:text-[#9ca3af]"
                  >
                    <option value="">
                      {subdistricts.length
                        ? "Select Sub-district / Taluk"
                        : "Sub-district list unavailable"}
                    </option>
                    {subdistricts.map((sub) => (
                      <option key={sub.location_id} value={sub.location_id}>
                        {sub.name_en}
                      </option>
                    ))}
                  </select>
                </label>
              </div>

              {/* 5. Village / Town Selection */}
              <div className="rounded-2xl border border-[#e2eae4] bg-[#fbfdfb] p-4">
                <div className="mb-2 flex items-center justify-between">
                  <label className="text-xs font-bold text-[#355141]">
                    City / Town / Village
                  </label>
                  {!isStateWithVillages && selectedState && (
                    <span className="text-[10px] font-semibold text-[#829589]">
                      District-level verified
                    </span>
                  )}
                </div>

                {isStateWithVillages ? (
                  <div className="space-y-2">
                    <div className="relative">
                      <Search className="absolute left-3 top-3 size-4 text-[#798e82]" />
                      <input
                        type="text"
                        value={placeQuery}
                        disabled={!selectedDistrict}
                        onChange={(e) => handlePlaceSearch(e.target.value)}
                        placeholder="Search village, panchayat or town…"
                        className="min-h-10 w-full rounded-xl border border-[#dfe8e2] bg-white pl-9 pr-3 text-xs font-medium text-[#183b2b] outline-none focus:border-[#17834D] disabled:bg-[#f7f9f7]"
                      />
                    </div>
                    <select
                      disabled={!selectedDistrict || !places.length}
                      value={selectedPlace?.location_id || ""}
                      onChange={(e) => {
                        const pl =
                          places.find((p) => p.location_id === e.target.value) ||
                          null;
                        setSelectedPlace(pl);
                      }}
                      className="min-h-10 w-full rounded-xl border border-[#dfe8e2] bg-white px-3 text-xs font-medium text-[#183b2b] outline-none focus:border-[#17834D] disabled:bg-[#f7f9f7] disabled:text-[#9ca3af]"
                    >
                      <option value="">
                        {loadingPlaces
                          ? "Loading places…"
                          : places.length
                          ? "Select specific place (optional)"
                          : "No places match search"}
                      </option>
                      {places.slice(0, 150).map((p) => (
                        <option key={p.location_id} value={p.location_id}>
                          {p.name_en} ({p.entity_type})
                        </option>
                      ))}
                    </select>
                  </div>
                ) : (
                  <p className="text-xs leading-5 text-[#63776b]">
                    {selectedState
                      ? `${selectedState.name_en} currently features verified district-level agricultural data. Select your district above to proceed.`
                      : "Select a State and District to see location coverage."}
                  </p>
                )}
              </div>

              {/* Action */}
              <div className="pt-2">
                <button
                  type="button"
                  disabled={!selectedState || !selectedDistrict || resolvingCoordinates}
                  onClick={() => void handleConfirmManual()}
                  className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-[#17834D] px-5 text-sm font-bold text-white shadow-sm hover:bg-[#123D2B] disabled:opacity-50"
                >
                  {resolvingCoordinates ? (
                    <>
                      <Loader2 className="size-4 animate-spin" />
                      Resolving Location & Coordinates…
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="size-4" />
                      Confirm Selected Location
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* TAB C: SUGGESTED LOCATION */}
          {activeTab === "suggested" && (
            <div className="space-y-4">
              <div className="rounded-2xl border border-[#c4e3cb] bg-[#f2f9f4] p-5">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-[#fef3c7] px-2.5 py-1 text-[11px] font-bold text-[#b45309]">
                    <Sparkles className="size-3.5" /> Suggested location — not detected
                  </span>
                  <span className="text-[11px] font-semibold text-[#526b5c]">
                    Coordinates: 11.6643°N, 78.1460°E
                  </span>
                </div>

                <h3 className="mt-3 text-lg font-extrabold text-[#123D2B]">
                  Salem, Tamil Nadu
                </h3>
                <p className="mt-1 text-xs leading-5 text-[#486353]">
                  Salem is AgriNex AI&apos;s benchmark agricultural intelligence region. It features live Open-Meteo weather forecasts, real-time AGMARKNET daily mandi prices, and verified agronomic advisories from Tamil Nadu Agricultural University (TNAU).
                </p>

                <div className="mt-4 grid grid-cols-2 gap-2 text-xs sm:grid-cols-3">
                  <div className="rounded-xl border border-[#d2e7d8] bg-white p-3">
                    <span className="block text-[10px] font-bold uppercase text-[#73887c]">Live Weather</span>
                    <span className="font-bold text-[#166534]">Connected</span>
                  </div>
                  <div className="rounded-xl border border-[#d2e7d8] bg-white p-3">
                    <span className="block text-[10px] font-bold uppercase text-[#73887c]">Mandi Prices</span>
                    <span className="font-bold text-[#166534]">Connected</span>
                  </div>
                  <div className="rounded-xl border border-[#d2e7d8] bg-white p-3 col-span-2 sm:col-span-1">
                    <span className="block text-[10px] font-bold uppercase text-[#73887c]">LGD Hierarchy</span>
                    <span className="font-bold text-[#166534]">Verified Level 4</span>
                  </div>
                </div>

                <div className="mt-5 rounded-xl border border-[#fed7aa] bg-[#fffaf5] p-3 text-[11px] leading-5 text-[#9a3412]">
                  <strong>Notice:</strong> Choosing this will set Salem, Tamil Nadu as your working farming location. It will not claim or assume Salem is your device&apos;s actual physical location.
                </div>

                <button
                  type="button"
                  onClick={confirmSuggestedLocation}
                  className="mt-5 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-[#17834D] px-5 text-sm font-bold text-white shadow-sm hover:bg-[#123D2B]"
                >
                  <CheckCircle2 className="size-4" />
                  Use Salem, Tamil Nadu as My Location
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
