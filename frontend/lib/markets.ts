export type MarketPrice = {
  state: string;
  district: string;
  market: string;
  commodity: string;
  variety?: string | null;
  grade?: string | null;
  arrival_date: string;
  min_price_per_quintal?: number | string | null;
  max_price_per_quintal?: number | string | null;
  modal_price_per_quintal: number | string;
  price_unit: string;
  retrieved_at: string;
  stale: boolean;
  source: {
    provider: string;
    source_name: string;
    source_url?: string | null;
    observed_at?: string | null;
  };
};

export type MarketSearchResponse = {
  prices: MarketPrice[];
  record_count: number;
  latest_arrival_date?: string | null;
  retrieved_at: string;
  stale: boolean;
  source: MarketPrice["source"];
  upstream_total?: number | null;
};

export type MarketSummary = {
  commodity: string;
  variety?: string | null;
  grade?: string | null;
  compatible_record_count: number;
  highest_modal_price_per_quintal?: number | string | null;
  highest_modal_market?: string | null;
  lowest_modal_price_per_quintal?: number | string | null;
  lowest_modal_market?: string | null;
  reported_price_range_per_quintal?: [number | string, number | string] | null;
  latest_arrival_date?: string | null;
  price_unit: string;
  stale: boolean;
};

export const DEFAULT_BACKEND_URL = "https://agrinex-backend-c4w8.onrender.com";

const baseUrl = () =>
  process.env.NEXT_PUBLIC_AGRINEX_API_URL?.replace(/\/$/, "") ||
  (typeof window !== "undefined"
    ? (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1"
        ? "http://localhost:8000"
        : DEFAULT_BACKEND_URL)
    : "http://127.0.0.1:8000");

async function getJson<T>(path: string): Promise<T> {
  const url = `${baseUrl()}${path}`;
  let response: Response;
  try {
    response = await fetch(url, { cache: "no-store" });
  } catch (err) {
    const detail = err instanceof Error ? err.message : String(err);
    throw new Error(`Market service connection failed at ${baseUrl()} (${detail}).`);
  }
  if (!response.ok) {
    const body = await response.json().catch(() => null) as
      | { error?: { code?: string; message?: string } }
      | null;
    throw new Error(body?.error?.message || `Market service returned ${response.status}`);
  }
  const envelope = await response.json() as { data: T };
  return envelope.data;
}

export function fetchMarketPrices(params: {
  state?: string;
  district?: string;
  market?: string;
  commodity?: string;
  variety?: string;
  grade?: string;
  limit?: number;
}) {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== "" && value !== "All") {
      query.set(key, String(value));
    }
  });
  return getJson<MarketSearchResponse>(`/api/v1/markets/prices?${query.toString()}`);
}

export function fetchCommodities(state = "Tamil Nadu") {
  const query = new URLSearchParams({ state, limit: "100" });
  return getJson<{ commodities: string[]; retrieved_at: string; source: MarketSearchResponse["source"] }>(
    `/api/v1/markets/commodities?${query.toString()}`,
  );
}

export function fetchGeographies(state = "Tamil Nadu") {
  const query = new URLSearchParams({ state, limit: "100" });
  return getJson<{
    states: string[];
    districts: string[];
    markets: string[];
    retrieved_at: string;
    source: MarketSearchResponse["source"];
  }>(`/api/v1/markets/geographies?${query.toString()}`);
}

export function fetchMarketSummary(params: {
  state?: string;
  district?: string;
  market?: string;
  commodity: string;
  variety?: string;
  grade?: string;
}) {
  const query = new URLSearchParams({ commodity: params.commodity });
  Object.entries(params).forEach(([key, value]) => {
    if (key !== "commodity" && value && value !== "All") query.set(key, value);
  });
  return getJson<{ summary: MarketSummary; retrieved_at: string; source: MarketSearchResponse["source"] }>(
    `/api/v1/markets/summary?${query.toString()}`,
  );
}
