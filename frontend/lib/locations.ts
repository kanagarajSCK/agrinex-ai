export type LocationEntityType =
  | "state"
  | "union_territory"
  | "district"
  | "sub-district"
  | "city"
  | "town"
  | "village"
  | "local-body"
  | "panchayat";

export type LocationRecord = {
  location_id: string;
  lgd_code?: string | null;
  name_en: string;
  name_local?: string | null;
  parent_location_id?: string | null;
  entity_type: LocationEntityType;
  state_code?: string | null;
  district_code?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  source: string;
  source_update_date?: string | null;
  active: boolean;
};

export type LocationList = {
  records: LocationRecord[];
  snapshot_id?: string | null;
  source_update_date?: string | null;
  count: number;
};

export type LocationStatus =
  | "not_configured"
  | "requesting_permission"
  | "detecting"
  | "detected_pending_confirmation"
  | "selected_gps"
  | "selected_manual"
  | "selected_suggested"
  | "permission_denied"
  | "unavailable"
  | "error";

export type LocationSource = "gps" | "manual" | "suggested";

export type ConfirmedLocation = {
  latitude: number;
  longitude: number;
  country: string;
  state: string;
  district: string;
  subdistrict?: string | null;
  village?: string | null;
  locationId?: string | null;
  stateCode?: string | null;
  districtCode?: string | null;
  subdistrictCode?: string | null;
  villageCode?: string | null;
  formattedName: string;
  source: LocationSource;
  isConfirmed: boolean;
  villageCoverageAvailable: boolean;
  updatedAt: number;
};

export type ReverseGeocodeResult = {
  latitude: number;
  longitude: number;
  state: LocationRecord | null;
  district: LocationRecord | null;
  subdistrict: LocationRecord | null;
  village: LocationRecord | null;
  state_name: string;
  district_name: string;
  place_name: string;
  formatted_name: string;
  village_coverage_available: boolean;
  confidence: "verified" | "ambiguous" | "approximate";
  provider: string;
  retrieved_at: string;
};

export const SIX_VILLAGE_STATES = new Set([
  "Maharashtra",
  "Andhra Pradesh",
  "Karnataka",
  "Kerala",
  "Tamil Nadu",
  "Telangana",
]);

export const CONFIRMED_LOCATION_KEY = "agrinex-confirmed-location";
export const SELECTED_LOCATION_KEY = "agrinex-selected-location";
export const WEATHER_LOCATION_KEY = "agrinex-weather-location";

export function getSuggestedLocation(): ConfirmedLocation {
  return {
    latitude: 11.6643,
    longitude: 78.146,
    country: "India",
    state: "Tamil Nadu",
    district: "Salem",
    subdistrict: "Salem",
    village: null,
    locationId: "suggested-salem",
    stateCode: "33",
    districtCode: "607",
    formattedName: "Salem, Tamil Nadu",
    source: "suggested",
    isConfirmed: false,
    villageCoverageAvailable: true,
    updatedAt: Date.now(),
  };
}

const baseUrl = () => {
  if (process.env.NEXT_PUBLIC_AGRINEX_API_URL) {
    return process.env.NEXT_PUBLIC_AGRINEX_API_URL.replace(/\/$/, "");
  }
  if (typeof window !== "undefined" && window.location.hostname === "localhost") {
    return "http://localhost:8000";
  }
  return "http://127.0.0.1:8000";
};

async function getLocationList(path: string): Promise<LocationList> {
  const targetUrl = `${baseUrl()}${path}`;
  try {
    const response = await fetch(targetUrl, {
      cache: "no-store",
      headers: { Accept: "application/json" },
    });
    if (!response.ok) throw new Error(`Location service returned ${response.status}`);
    const envelope = (await response.json()) as { data: LocationList };
    return envelope.data;
  } catch (err) {
    const detail = err instanceof Error ? err.message : String(err);
    throw new Error(`Location service unavailable (${detail})`);
  }
}

export const fetchStates = () => getLocationList("/api/v1/locations/states");

export const fetchDistricts = (stateCode: string) =>
  getLocationList(`/api/v1/locations/districts?state_code=${encodeURIComponent(stateCode)}`);

export const fetchSubDistricts = (districtCode: string) =>
  getLocationList(`/api/v1/locations/sub-districts?district_code=${encodeURIComponent(districtCode)}`);

export const fetchPlaces = (districtCode: string, query = "") =>
  getLocationList(
    `/api/v1/locations/places?district_code=${encodeURIComponent(districtCode)}&query=${encodeURIComponent(query)}`
  );

export const searchLocations = (query: string) =>
  getLocationList(`/api/v1/locations/search?query=${encodeURIComponent(query)}`);

export async function resolveLocation(locationId: string) {
  try {
    const response = await fetch(
      `${baseUrl()}/api/v1/locations/${encodeURIComponent(locationId)}/resolve`,
      { cache: "no-store", headers: { Accept: "application/json" } }
    );
    if (!response.ok) return null;
    const envelope = (await response.json()) as {
      data: {
        location: LocationRecord;
        latitude: number;
        longitude: number;
        resolved_by: "snapshot" | "open-meteo-geocoding";
        provider: string;
        retrieved_at: string;
        confidence: "verified" | "ambiguous" | "not_resolved";
      };
    };
    return envelope.data;
  } catch {
    return null;
  }
}

/**
 * Reverse-geocodes GPS coordinates into verified Indian administrative hierarchy.
 * Tries the backend reverse-geocode endpoint first, with fallback to BigDataCloud client API.
 */
export async function reverseGeocodeLocation(
  latitude: number,
  longitude: number
): Promise<ReverseGeocodeResult> {
  const targetUrl = `${baseUrl()}/api/v1/locations/reverse-geocode?latitude=${encodeURIComponent(latitude)}&longitude=${encodeURIComponent(longitude)}`;

  try {
    const res = await fetch(targetUrl, {
      cache: "no-store",
      headers: { Accept: "application/json" },
    });
    if (res.ok) {
      const envelope = (await res.json()) as { data: ReverseGeocodeResult };
      return envelope.data;
    }
  } catch {
    // Fall back to client-side reverse geocoding
  }

  // Resilient direct fallback via BigDataCloud client reverse geocoder
  const fallbackUrl = `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`;
  const fallbackRes = await fetch(fallbackUrl, { cache: "no-store" });
  if (!fallbackRes.ok) {
    throw new Error("Unable to identify location from GPS coordinates.");
  }

  const raw = (await fallbackRes.json()) as {
    countryCode?: string;
    countryName?: string;
    principalSubdivision?: string;
    city?: string;
    locality?: string;
    localityInfo?: { administrative?: { name?: string; description?: string }[] };
  };

  if (raw.countryCode && raw.countryCode.toUpperCase() !== "IN") {
    throw new Error(
      `Detected location (${raw.countryName || "Outside India"}) is outside the supported territory of India.`
    );
  }

  const stateName = raw.principalSubdivision || "";
  const city = raw.city || "";
  const locality = raw.locality || "";

  let districtName = "";
  let subdistrictName = "";
  for (const admin of raw.localityInfo?.administrative || []) {
    const desc = (admin.description || "").toLowerCase();
    const name = admin.name || "";
    if (desc.includes("district") || name.toLowerCase().includes("district")) {
      districtName = name.replace(/\s+district/i, "").trim();
    } else if (desc.includes("taluk") || name.toLowerCase().includes("taluk") || desc.includes("tehsil")) {
      subdistrictName = name.replace(/\s+taluk/i, "").replace(/\s+tehsil/i, "").trim();
    }
  }
  if (!districtName && city) districtName = city;

  const placeName = locality || city || districtName || "Local Area";
  const parts = [placeName];
  if (subdistrictName && subdistrictName !== districtName && !placeName.toLowerCase().includes(subdistrictName.toLowerCase())) {
    parts.push(subdistrictName);
  }
  if (districtName && !placeName.toLowerCase().includes(districtName.toLowerCase())) {
    parts.push(districtName);
  }
  if (stateName && !parts[parts.length - 1].toLowerCase().includes(stateName.toLowerCase())) {
    parts.push(stateName);
  }

  return {
    latitude,
    longitude,
    state: null,
    district: null,
    subdistrict: null,
    village: null,
    state_name: stateName,
    district_name: districtName,
    place_name: placeName,
    formatted_name: parts.join(", "),
    village_coverage_available: SIX_VILLAGE_STATES.has(stateName),
    confidence: "approximate",
    provider: "Client Reverse Geocoding",
    retrieved_at: new Date().toISOString(),
  };
}

export function getStoredLocation(): ConfirmedLocation | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(CONFIRMED_LOCATION_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as ConfirmedLocation;
    if (
      parsed &&
      typeof parsed.latitude === "number" &&
      typeof parsed.longitude === "number" &&
      parsed.formattedName
    ) {
      return parsed;
    }
  } catch {
    // ignore
  }
  return null;
}

export function storeConfirmedLocation(loc: ConfirmedLocation): void {
  if (typeof window === "undefined") return;
  try {
    // 1. Primary unified confirmed location
    window.localStorage.setItem(CONFIRMED_LOCATION_KEY, JSON.stringify(loc));

    // 2. Backwards-compatible selected location for markets and farms
    window.localStorage.setItem(
      SELECTED_LOCATION_KEY,
      JSON.stringify({
        locationId: loc.locationId,
        name: loc.formattedName,
        stateCode: loc.stateCode,
        districtCode: loc.districtCode,
        stateName: loc.state,
        districtName: loc.district,
        latitude: loc.latitude,
        longitude: loc.longitude,
        source: loc.source,
        coordinateResolution: "verified",
      })
    );

    // 3. Backwards-compatible weather location
    window.localStorage.setItem(
      WEATHER_LOCATION_KEY,
      JSON.stringify({
        latitude: loc.latitude,
        longitude: loc.longitude,
        label: loc.formattedName,
        source: loc.source,
      })
    );
  } catch {
    // Storage quota or privacy mode error
  }
}

export function clearStoredLocation(): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(CONFIRMED_LOCATION_KEY);
    window.localStorage.removeItem(SELECTED_LOCATION_KEY);
    window.localStorage.removeItem(WEATHER_LOCATION_KEY);
  } catch {
    // ignore
  }
}
