export type LocationRecord = {
  location_id: string;
  lgd_code?: string | null;
  name_en: string;
  name_local?: string | null;
  parent_location_id?: string | null;
  entity_type: "state" | "union_territory" | "district" | "sub-district" | "city" | "town" | "village" | "local-body" | "panchayat";
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

const baseUrl = () =>
  process.env.NEXT_PUBLIC_AGRINEX_API_URL?.replace(/\/$/, "") ||
  "http://127.0.0.1:8000";

async function getLocationList(path: string): Promise<LocationList> {
  const response = await fetch(`${baseUrl()}${path}`, { cache: "no-store" });
  if (!response.ok) throw new Error(`Location service returned ${response.status}`);
  const envelope = await response.json() as { data: LocationList };
  return envelope.data;
}

export const fetchStates = () => getLocationList("/api/v1/locations/states");
export const fetchDistricts = (stateCode: string) =>
  getLocationList(`/api/v1/locations/districts?state_code=${encodeURIComponent(stateCode)}`);
export const fetchPlaces = (districtCode: string, query = "") =>
  getLocationList(`/api/v1/locations/places?district_code=${encodeURIComponent(districtCode)}&query=${encodeURIComponent(query)}`);

export async function resolveLocation(locationId: string) {
  const response = await fetch(
    `${baseUrl()}/api/v1/locations/${encodeURIComponent(locationId)}/resolve`,
    { cache: "no-store" },
  );
  if (!response.ok) return null;
  const envelope = await response.json() as {
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
}
