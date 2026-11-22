"use client";

import { useEffect, useMemo, useState } from "react";
import { Clock3, MapPin, RefreshCw, ShoppingBasket } from "lucide-react";
import { MarketComparisonChart } from "@/components/charts/intelligence-charts";
import { Card } from "@/components/ui/card";
import { ChartCard, PageHeader, SearchInput } from "@/components/ui/primitives";
import { EmptyState, ErrorState, LoadingState } from "@/components/ui/states";
import {
  fetchCommodities,
  fetchGeographies,
  fetchMarketPrices,
  fetchMarketSummary,
  type MarketPrice,
  type MarketSummary,
  type MarketSearchResponse,
} from "@/lib/markets";
import { useLocation } from "@/contexts/location-context";

function asNumber(value: number | string | null | undefined) {
  if (value == null) return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

export function MarketsPage() {
  const { location, openOnboarding } = useLocation();

  const [state, setState] = useState(() => location?.state || "Tamil Nadu");
  const [district, setDistrict] = useState(() => location?.district || "Salem");
  const [market, setMarket] = useState("All");
  const [commodity, setCommodity] = useState("Tomato");
  const [search, setSearch] = useState("Tomato");
  const [variety, setVariety] = useState("All");
  const [grade, setGrade] = useState("All");
  const [commodities, setCommodities] = useState<string[]>(["Tomato"]);
  const [districts, setDistricts] = useState<string[]>([]);
  const [markets, setMarkets] = useState<string[]>([]);
  const [data, setData] = useState<MarketSearchResponse | null>(null);
  const [summary, setSummary] = useState<MarketSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Sync state & district whenever location changes in context
  useEffect(() => {
    void Promise.resolve().then(() => {
      if (location?.state && location.state !== state) {
        setState(location.state);
      }
      if (location?.district && location.district !== district) {
        setDistrict(location.district);
      }
    });
  }, [location?.state, location?.district, state, district]);

  async function load(nextCommodity = commodity, nextState = state, nextDistrict = district) {
    setLoading(true);
    setError("");
    try {
      const [geographies, commodityList, prices] = await Promise.all([
        fetchGeographies(nextState),
        fetchCommodities(nextState),
        fetchMarketPrices({
          state: nextState,
          district: nextDistrict,
          market,
          commodity: nextCommodity,
          variety,
          grade,
          limit: 100,
        }),
      ]);
      setDistricts(geographies.districts);
      setMarkets(geographies.markets);
      setCommodities(commodityList.commodities);
      setData(prices);

      if (nextCommodity && prices.record_count) {
        const summaryResponse = await fetchMarketSummary({
          state: nextState,
          district: nextDistrict,
          market,
          commodity: nextCommodity,
          variety,
          grade,
        });
        setSummary(summaryResponse.summary);
      } else {
        setSummary(null);
      }
    } catch (caught) {
      setData(null);
      setSummary(null);
      setError(caught instanceof Error ? caught.message : "Market data is currently unavailable.");
    } finally {
      setLoading(false);
    }
  }

  // Reload when state or district change
  useEffect(() => {
    void Promise.resolve().then(() => load(commodity, state, district));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state, district]);

  const varieties = useMemo(
    () => Array.from(new Set((data?.prices ?? []).map((record) => record.variety).filter((value): value is string => Boolean(value)))).sort(),
    [data],
  );
  const grades = useMemo(
    () => Array.from(new Set((data?.prices ?? []).map((record) => record.grade).filter((value): value is string => Boolean(value)))).sort(),
    [data],
  );

  const chartData = (data?.prices ?? [])
    .map((record) => ({
      market: record.market,
      modal: asNumber(record.modal_price_per_quintal) ?? 0,
    }))
    .filter((item) => item.modal > 0);

  function applySearch() {
    const nextCommodity = search.trim();
    if (!nextCommodity) return;
    setCommodity(nextCommodity);
    void load(nextCommodity, state, district);
  }

  return (
    <>
      <PageHeader
        eyebrow="Market intelligence"
        title="Compare mandi prices"
        description={`Genuine AGMARKNET / data.gov.in records for ${district || state}. A configured API key is required; no estimated or sample market prices are shown.`}
        action={
          <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
            <button
              type="button"
              onClick={() => openOnboarding()}
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-[#dfe8e2] bg-white px-3.5 text-sm font-semibold text-[#42604e] hover:bg-[#f8faf8]"
            >
              <MapPin aria-hidden="true" className="size-4 text-[#17834D]" /> Change Location
            </button>
            <button
              type="button"
              onClick={() => void load()}
              disabled={loading}
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-[#17834D] px-3.5 text-sm font-semibold text-white disabled:opacity-60"
            >
              <RefreshCw aria-hidden="true" className={`size-4 ${loading ? "animate-spin" : ""}`} /> Refresh
            </button>
          </div>
        }
      />

      <Card className="mb-5 p-4 sm:p-5">
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-bold text-[#183b2b]">Search and filter</h2>
            <span className="text-xs text-[#75887c]">({district ? `${district}, ${state}` : state})</span>
          </div>
          <button
            type="button"
            onClick={() => openOnboarding()}
            className="text-xs font-semibold text-[#17834D] hover:underline"
          >
            Use my confirmed location →
          </button>
        </div>
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-6">
          <div className="md:col-span-2">
            <SearchInput
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              onKeyDown={(event) => { if (event.key === "Enter") applySearch(); }}
              placeholder="Search commodity (e.g. Tomato, Onion)"
              aria-label="Search commodity"
            />
          </div>
          <label className="text-xs font-bold text-[#486056]">State
            <input value={state} onChange={(event) => setState(event.target.value)} className="mt-1.5 min-h-11 w-full rounded-xl border border-[#dfe8e2] px-3 text-sm outline-none" />
          </label>
          <label className="text-xs font-bold text-[#486056]">District
            <select value={district} onChange={(event) => setDistrict(event.target.value)} className="mt-1.5 min-h-11 w-full rounded-xl border border-[#dfe8e2] bg-white px-3 text-sm outline-none">
              <option value="">All districts</option>
              {[...new Set([district, ...districts].filter(Boolean))].map((item) => (
                <option key={item} value={item}>{item}</option>
              ))}
            </select>
          </label>
          <label className="text-xs font-bold text-[#486056]">Market
            <select value={market} onChange={(event) => setMarket(event.target.value)} className="mt-1.5 min-h-11 w-full rounded-xl border border-[#dfe8e2] bg-white px-3 text-sm outline-none">
              <option value="All">All markets</option>
              {markets.map((item) => <option key={item} value={item}>{item}</option>)}
            </select>
          </label>
          <button type="button" onClick={applySearch} className="min-h-11 self-end rounded-xl bg-[#17834D] px-4 text-sm font-bold text-white shadow-sm hover:bg-[#123D2B]">Apply</button>
          <label className="text-xs font-bold text-[#486056]">Commodity
            <select value={commodity} onChange={(event) => { setCommodity(event.target.value); setSearch(event.target.value); }} className="mt-1.5 min-h-11 w-full rounded-xl border border-[#dfe8e2] bg-white px-3 text-sm outline-none">
              {[...new Set([commodity, ...commodities].filter(Boolean))].map((item) => (
                <option key={item} value={item}>{item}</option>
              ))}
            </select>
          </label>
          <label className="text-xs font-bold text-[#486056]">Variety
            <select value={variety} onChange={(event) => setVariety(event.target.value)} className="mt-1.5 min-h-11 w-full rounded-xl border border-[#dfe8e2] bg-white px-3 text-sm outline-none">
              <option value="All">All varieties</option>
              {varieties.map((item) => <option key={item} value={item}>{item}</option>)}
            </select>
          </label>
          <label className="text-xs font-bold text-[#486056]">Grade
            <select value={grade} onChange={(event) => setGrade(event.target.value)} className="mt-1.5 min-h-11 w-full rounded-xl border border-[#dfe8e2] bg-white px-3 text-sm outline-none">
              <option value="All">All grades</option>
              {grades.map((item) => <option key={item} value={item}>{item}</option>)}
            </select>
          </label>
        </div>
      </Card>

      {loading && <LoadingState label="Loading verified mandi records…" />}
      {error && (
        <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-start">
          <ErrorState title={error} />
          <button type="button" onClick={() => void load()} className="min-h-11 rounded-xl border border-[#17834D] px-4 text-sm font-bold text-[#17834D]">Retry</button>
        </div>
      )}

      {!loading && !error && data && (
        <>
          {data.record_count === 0 ? (
            <EmptyState title={`No AGMARKNET records returned for ${commodity} in ${district || state}.`} />
          ) : (
            <>
              {summary && (
                <section aria-label="Market comparison summary" className="mb-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                  <Card className="p-4"><p className="text-xs font-bold text-[#62756b]">Highest modal</p><p className="mt-2 text-xl font-extrabold text-[#183b2b]">{summary.highest_modal_price_per_quintal == null ? "—" : `₹${Number(summary.highest_modal_price_per_quintal).toLocaleString("en-IN")}`}</p><p className="mt-1 text-xs text-[#748279]">{summary.highest_modal_market || "No market"}</p></Card>
                  <Card className="p-4"><p className="text-xs font-bold text-[#62756b]">Lowest modal</p><p className="mt-2 text-xl font-extrabold text-[#183b2b]">{summary.lowest_modal_price_per_quintal == null ? "—" : `₹${Number(summary.lowest_modal_price_per_quintal).toLocaleString("en-IN")}`}</p><p className="mt-1 text-xs text-[#748279]">{summary.lowest_modal_market || "No market"}</p></Card>
                  <Card className="p-4"><p className="text-xs font-bold text-[#62756b]">Reported range</p><p className="mt-2 text-xl font-extrabold text-[#183b2b]">{summary.reported_price_range_per_quintal ? `₹${Number(summary.reported_price_range_per_quintal[0]).toLocaleString("en-IN")}–₹${Number(summary.reported_price_range_per_quintal[1]).toLocaleString("en-IN")}` : "—"}</p><p className="mt-1 text-xs text-[#748279]">Per quintal</p></Card>
                  <Card className="p-4"><p className="text-xs font-bold text-[#62756b]">Valid records / latest arrival</p><p className="mt-2 text-xl font-extrabold text-[#183b2b]">{summary.compatible_record_count}</p><p className="mt-1 text-xs text-[#748279]">{summary.latest_arrival_date || "No arrival date"}</p></Card>
                </section>
              )}

              <div className="mb-5 grid min-w-0 gap-4 xl:grid-cols-[minmax(0,1.4fr)_minmax(280px,0.8fr)]">
                <ChartCard title="Market modal prices" subtitle="Reported modal price · ₹ per quintal" demo={false}>
                  <MarketComparisonChart data={chartData} />
                </ChartCard>
                <Card className="p-5">
                  <div className="mb-4 flex items-center gap-2"><span className="grid size-9 place-items-center rounded-xl bg-[#fff4dd] text-[#9b741f]"><ShoppingBasket aria-hidden="true" className="size-[18px]" /></span><div><h2 className="text-sm font-bold text-[#183b2b]">Source status</h2><p className="text-[11px] text-[#829087]">AGMARKNET / data.gov.in</p></div></div>
                  <div className="space-y-3 text-xs text-[#6e7c73]">
                    <p className="flex items-center justify-between gap-2"><span>Retrieved</span><strong className="text-right text-[#456052]">{new Date(data.retrieved_at).toLocaleString("en-IN")}</strong></p>
                    <p className="flex items-center justify-between gap-2"><span>Latest arrival</span><strong className="text-[#456052]">{data.latest_arrival_date || "Not returned"}</strong></p>
                    <p className="flex items-center justify-between gap-2"><span>Record status</span><strong className={data.stale ? "text-[#9b741f]" : "text-[#17834D]"}>{data.stale ? "Stale arrival date" : "Reported arrival date"}</strong></p>
                    <a href={data.source.source_url || "https://data.gov.in"} target="_blank" rel="noreferrer" className="block text-[#17834D] underline">Official data.gov.in catalog</a>
                  </div>
                </Card>
              </div>

              <div className="mb-3 flex items-center justify-between"><h2 className="text-base font-bold text-[#183b2b]">Market price records</h2><span className="text-xs text-[#7b8980]">{data.record_count} valid records</span></div>
              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                {data.prices.map((record: MarketPrice) => {
                  const modal = asNumber(record.modal_price_per_quintal);
                  const minimum = asNumber(record.min_price_per_quintal);
                  const maximum = asNumber(record.max_price_per_quintal);
                  return (
                    <Card key={`${record.market}-${record.commodity}-${record.variety}-${record.arrival_date}`} className="p-4 sm:p-5">
                      <div className="flex items-start justify-between gap-3"><div><p className="text-sm font-bold text-[#183b2b]">{record.commodity}</p><p className="mt-1 flex items-center gap-1 text-xs text-[#758279]"><MapPin aria-hidden="true" className="size-3.5" />{record.market}, {record.district}</p></div>{record.stale && <span className="rounded-full bg-[#fff4dd] px-2 py-1 text-[10px] font-bold text-[#795c18]">STALE</span>}</div>
                      <p className="mt-4 text-2xl font-extrabold text-[#183b2b]">{modal == null ? "Unavailable" : `₹${modal.toLocaleString("en-IN")}`}</p>
                      <p className="mt-1 text-[11px] text-[#829087]">Modal · INR per quintal</p>
                      <div className="mt-4 grid grid-cols-2 gap-2 border-t border-[#edf1ee] pt-3 text-[11px] text-[#6e7c73]"><span>Minimum <strong className="block text-[#456052]">{minimum == null ? "Not reported" : `₹${minimum.toLocaleString("en-IN")}`}</strong></span><span>Maximum <strong className="block text-[#456052]">{maximum == null ? "Not reported" : `₹${maximum.toLocaleString("en-IN")}`}</strong></span></div>
                      <p className="mt-3 flex items-center gap-1 text-[10px] text-[#829087]"><Clock3 aria-hidden="true" size={12} />Arrival: {record.arrival_date}</p>
                    </Card>
                  );
                })}
              </div>
            </>
          )}

          <p className="mt-5 rounded-xl border border-[#f0dfb8] bg-[#fff9eb] p-4 text-xs leading-5 text-[#735b24]">A high or low reported modal price is a market observation, not a guaranteed earning or selling recommendation. Transport, quality, fees and final sale terms are not represented.</p>
        </>
      )}
    </>
  );
}
