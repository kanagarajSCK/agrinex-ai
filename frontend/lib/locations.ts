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

export const DEFAULT_BACKEND_URL = "https://agrinex-backend-c4w8.onrender.com";

const baseUrl = () => {
  if (process.env.NEXT_PUBLIC_AGRINEX_API_URL) {
    return process.env.NEXT_PUBLIC_AGRINEX_API_URL.replace(/\/$/, "");
  }
  if (typeof window !== "undefined") {
    const host = window.location.hostname;
    if (host === "localhost" || host === "127.0.0.1") {
      return "http://localhost:8000";
    }
    // Remote / deployed production host fallback (e.g. Vercel)
    return DEFAULT_BACKEND_URL;
  }
  return "http://127.0.0.1:8000";
};

export const STATIC_INDIAN_STATES: LocationRecord[] = [
  { location_id: "lgd:state:35", state_code: "35", name_en: "Andaman And Nicobar Islands", entity_type: "union_territory", source: "LGD", active: true },
  { location_id: "lgd:state:28", state_code: "28", name_en: "Andhra Pradesh", entity_type: "state", source: "LGD", active: true },
  { location_id: "lgd:state:12", state_code: "12", name_en: "Arunachal Pradesh", entity_type: "state", source: "LGD", active: true },
  { location_id: "lgd:state:18", state_code: "18", name_en: "Assam", entity_type: "state", source: "LGD", active: true },
  { location_id: "lgd:state:10", state_code: "10", name_en: "Bihar", entity_type: "state", source: "LGD", active: true },
  { location_id: "lgd:state:4", state_code: "4", name_en: "Chandigarh", entity_type: "union_territory", source: "LGD", active: true },
  { location_id: "lgd:state:22", state_code: "22", name_en: "Chhattisgarh", entity_type: "state", source: "LGD", active: true },
  { location_id: "lgd:state:7", state_code: "7", name_en: "Delhi", entity_type: "union_territory", source: "LGD", active: true },
  { location_id: "lgd:state:30", state_code: "30", name_en: "Goa", entity_type: "state", source: "LGD", active: true },
  { location_id: "lgd:state:24", state_code: "24", name_en: "Gujarat", entity_type: "state", source: "LGD", active: true },
  { location_id: "lgd:state:6", state_code: "6", name_en: "Haryana", entity_type: "state", source: "LGD", active: true },
  { location_id: "lgd:state:2", state_code: "2", name_en: "Himachal Pradesh", entity_type: "state", source: "LGD", active: true },
  { location_id: "lgd:state:1", state_code: "1", name_en: "Jammu And Kashmir", entity_type: "union_territory", source: "LGD", active: true },
  { location_id: "lgd:state:20", state_code: "20", name_en: "Jharkhand", entity_type: "state", source: "LGD", active: true },
  { location_id: "lgd:state:29", state_code: "29", name_en: "Karnataka", entity_type: "state", source: "LGD", active: true },
  { location_id: "lgd:state:32", state_code: "32", name_en: "Kerala", entity_type: "state", source: "LGD", active: true },
  { location_id: "lgd:state:37", state_code: "37", name_en: "Ladakh", entity_type: "union_territory", source: "LGD", active: true },
  { location_id: "lgd:state:31", state_code: "31", name_en: "Lakshadweep", entity_type: "union_territory", source: "LGD", active: true },
  { location_id: "lgd:state:23", state_code: "23", name_en: "Madhya Pradesh", entity_type: "state", source: "LGD", active: true },
  { location_id: "lgd:state:27", state_code: "27", name_en: "Maharashtra", entity_type: "state", source: "LGD", active: true },
  { location_id: "lgd:state:14", state_code: "14", name_en: "Manipur", entity_type: "state", source: "LGD", active: true },
  { location_id: "lgd:state:17", state_code: "17", name_en: "Meghalaya", entity_type: "state", source: "LGD", active: true },
  { location_id: "lgd:state:15", state_code: "15", name_en: "Mizoram", entity_type: "state", source: "LGD", active: true },
  { location_id: "lgd:state:13", state_code: "13", name_en: "Nagaland", entity_type: "state", source: "LGD", active: true },
  { location_id: "lgd:state:21", state_code: "21", name_en: "Odisha", entity_type: "state", source: "LGD", active: true },
  { location_id: "lgd:state:34", state_code: "34", name_en: "Puducherry", entity_type: "union_territory", source: "LGD", active: true },
  { location_id: "lgd:state:3", state_code: "3", name_en: "Punjab", entity_type: "state", source: "LGD", active: true },
  { location_id: "lgd:state:8", state_code: "8", name_en: "Rajasthan", entity_type: "state", source: "LGD", active: true },
  { location_id: "lgd:state:11", state_code: "11", name_en: "Sikkim", entity_type: "state", source: "LGD", active: true },
  { location_id: "lgd:state:33", state_code: "33", name_en: "Tamil Nadu", entity_type: "state", source: "LGD", active: true },
  { location_id: "lgd:state:36", state_code: "36", name_en: "Telangana", entity_type: "state", source: "LGD", active: true },
  { location_id: "lgd:state:38", state_code: "38", name_en: "The Dadra And Nagar Haveli And Daman And Diu", entity_type: "union_territory", source: "LGD", active: true },
  { location_id: "lgd:state:16", state_code: "16", name_en: "Tripura", entity_type: "state", source: "LGD", active: true },
  { location_id: "lgd:state:9", state_code: "9", name_en: "Uttar Pradesh", entity_type: "state", source: "LGD", active: true },
  { location_id: "lgd:state:5", state_code: "5", name_en: "Uttarakhand", entity_type: "state", source: "LGD", active: true },
  { location_id: "lgd:state:19", state_code: "19", name_en: "West Bengal", entity_type: "state", source: "LGD", active: true },
];

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

export const fetchStates = async (): Promise<LocationList> => {
  try {
    const remote = await getLocationList("/api/v1/locations/states");
    if (remote.records && remote.records.length > 0) {
      return remote;
    }
  } catch {
    // If backend is waking up or network latency, use embedded verified states
  }
  return {
    records: STATIC_INDIAN_STATES,
    snapshot_id: "lgd-verified-states-bundle",
    source_update_date: "2024-10-07",
    count: STATIC_INDIAN_STATES.length,
  };
};

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
