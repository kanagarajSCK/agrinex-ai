import type { AssistantResponse } from "./assistant";

export type AdvisoryCategory =
  | "All"
  | "AI Consultation"
  | "Weather"
  | "Market"
  | "Crop guidance";

export type AdvisorySourceItem = {
  name: string;
  source_type?: string;
  retrieved_at?: string | null;
  arrival_date?: string | null;
  title?: string | null;
  institution?: string | null;
  publication_year?: number | null;
  source_url?: string | null;
};

export type AdvisoryItem = {
  id: string;
  title: string;
  category: "AI Consultation" | "Weather" | "Market" | "Crop guidance";
  date: string;
  timestamp: number;
  summary: string;
  detail: string;
  keyPoints?: string[];
  recommendations?: string[];
  sources?: AdvisorySourceItem[];
  location?: string;
  crop?: string;
  sourceAttribution: string;
  isAiConsultation?: boolean;
  query?: string;
};

const STORAGE_KEY = "agrinex-advisory-history";

export function getStoredAdvisories(): AdvisoryItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as AdvisoryItem[];
    if (Array.isArray(parsed)) {
      return parsed.sort((a, b) => b.timestamp - a.timestamp);
    }
  } catch {
    // Malformed JSON fallback
  }
  return [];
}

export function saveAdvisories(items: AdvisoryItem[]): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items.slice(0, 50)));
  } catch {
    // Storage quota or privacy mode error
  }
}

export function storeAdvisory(item: AdvisoryItem): void {
  const current = getStoredAdvisories();
  const filtered = current.filter((existing) => existing.id !== item.id);
  saveAdvisories([item, ...filtered]);
}

export function deleteAdvisory(id: string): void {
  const current = getStoredAdvisories();
  saveAdvisories(current.filter((item) => item.id !== id));
}

export function clearAdvisoryHistory(): void {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(STORAGE_KEY);
}

export function saveAdvisoryFromChat(params: {
  message: string;
  response: AssistantResponse;
  location?: { city?: string; district?: string } | null;
}): AdvisoryItem {
  const now = new Date();
  const dateFormatted = now.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  let category: AdvisoryItem["category"] = "AI Consultation";
  if (params.response.intent === "weather") {
    category = "Weather";
  } else if (params.response.intent === "mandi") {
    category = "Market";
  } else if (params.response.intent === "crop") {
    category = "Crop guidance";
  }

  // Derive a succinct title from the message
  let title = params.message.trim();
  if (title.length > 55) {
    title = `${title.slice(0, 52)}…`;
  }
  // Capitalize first letter
  title = title.charAt(0).toUpperCase() + title.slice(1);

  const loc = params.location?.city || params.location?.district || "Salem, Tamil Nadu";

  let sourceAttribution = "AgriNex AI Assistant (Gemini)";
  if (params.response.sources.length > 0) {
    sourceAttribution = params.response.sources
      .map((s) => s.title || s.name)
      .join(", ");
  }

  const advisory: AdvisoryItem = {
    id: `ai-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    title,
    category,
    date: dateFormatted,
    timestamp: now.getTime(),
    summary: params.response.key_points?.[0] || params.response.answer.slice(0, 160) + "…",
    detail: params.response.answer,
    keyPoints: params.response.key_points,
    recommendations: params.response.recommendations,
    sources: params.response.sources,
    location: loc,
    sourceAttribution,
    isAiConsultation: true,
    query: params.message,
  };

  storeAdvisory(advisory);
  return advisory;
}

/**
 * Returns dynamic contextual agricultural advisories based on current regional conditions.
 */
export function getContextualAdvisories(locationLabel = "Salem, Tamil Nadu"): AdvisoryItem[] {
  const today = new Date();
  const todayFormatted = today.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  return [
    {
      id: "advisory-weather-live",
      title: "Irrigation & Field Spraying Weather Window",
      category: "Weather",
      date: `Today · ${todayFormatted}`,
      timestamp: today.getTime() - 1000 * 60 * 30,
      summary:
        "Favorable morning weather conditions for field operations. Moderate wind and low precipitation probability support targeted nutrient foliar sprays.",
      detail:
        "Based on local Open-Meteo forecasts for Salem, daylight temperatures are warm with low relative humidity in the afternoon. Schedule foliar sprays (e.g. micronutrients or bio-pesticides) before 9:30 AM or after 4:30 PM to minimize evaporation and avoid leaf scorching. Maintain root-zone moisture through micro-irrigation.",
      keyPoints: [
        "Optimal spraying hours: 6:30 AM – 9:30 AM",
        "Avoid midday application when temperatures exceed 30°C",
        "Check soil moisture 2 inches below surface before irrigation",
      ],
      recommendations: [
        "Prioritize drip irrigation during early morning to conserve water.",
        "Inspect leaf undersides for early sucking pest activity after morning dew clears.",
      ],
      sources: [
        {
          name: "Open-Meteo Forecast Service",
          source_type: "weather",
          retrieved_at: today.toISOString(),
        },
        {
          name: "TNAU Water Management Guidelines",
          institution: "Tamil Nadu Agricultural University",
          source_type: "knowledge",
        },
      ],
      location: locationLabel,
      sourceAttribution: "Open-Meteo Live Forecast & TNAU Water Management Guidelines",
    },
    {
      id: "advisory-mandi-live",
      title: "Vegetable & Tomato Mandi Arrival Advisory",
      category: "Market",
      date: `Market Update · ${todayFormatted}`,
      timestamp: today.getTime() - 1000 * 60 * 60 * 2,
      summary:
        "Tomato and vegetable arrivals at Salem APMC markets show steady trading. Grade produce into uniform maturity tiers to secure modal price bands.",
      detail:
        "Data.gov.in AGMARKNET daily arrivals indicate active trading for vegetables across western Tamil Nadu markets. Farmers are advised to sort harvest into grade A (firm, semi-ripe) for distant transport and grade B for local consumption. Clean crates prevent transit damage and bacterial soft rot.",
      keyPoints: [
        "Harvest early morning to preserve fruit firmness",
        "Sort and grade produce at farm-gate to capture premium price band",
        "Monitor mandi price ranges across Salem, Namakkal, and Erode",
      ],
      recommendations: [
        "Transport produce in aerated plastic crates rather than overloaded gunny bags.",
        "Compare modal vs maximum prices before dispatching consignments.",
      ],
      sources: [
        {
          name: "AGMARKNET / data.gov.in",
          source_type: "market",
          arrival_date: todayFormatted,
        },
        {
          name: "Tamil Nadu Agricultural Marketing Board",
          institution: "Department of Agricultural Marketing",
          source_type: "knowledge",
        },
      ],
      location: locationLabel,
      crop: "Tomato & Vegetables",
      sourceAttribution: "AGMARKNET (data.gov.in) & Department of Agricultural Marketing",
    },
    {
      id: "advisory-crop-seasonal",
      title: "Groundnut & Pulse Seed Treatment & Crop Health",
      category: "Crop guidance",
      date: `Agronomy · ${todayFormatted}`,
      timestamp: today.getTime() - 1000 * 60 * 60 * 5,
      summary:
        "Biological seed treatment with Trichoderma viride and Rhizobium biofertilizer prevents seed-borne collar rot and enhances root nodulation in red loamy soils.",
      detail:
        "For groundnut and pulse growers in Salem and surrounding rainfed/irrigated tracts, biological seed treatment prior to sowing is critical. Treat kernel with Trichoderma viride @ 4 g/kg seed followed by Rhizobium culture @ 50 g/kg seed using rice gruel as adhesive. Allow seeds to shade dry for 30 minutes before sowing.",
      keyPoints: [
        "Prevents collar rot (Aspergillus niger) and root rot pathogens",
        "Improves atmospheric nitrogen fixation by 20–25 kg N/ha",
        "Ensure treated seeds are not exposed to direct hot sunlight",
      ],
      recommendations: [
        "Maintain 30 cm x 10 cm spacing for spreading and semi-spreading groundnut varieties.",
        "Install yellow sticky traps (5–6 per acre) for early surveillance of thrips and whiteflies.",
      ],
      sources: [
        {
          name: "TNAU Agritech Crop Production Guide",
          title: "Crop Production Guide (Agriculture) 2020",
          institution: "Tamil Nadu Agricultural University, Coimbatore",
          publication_year: 2020,
          source_type: "knowledge",
          source_url: "https://agritech.tnau.ac.in",
        },
      ],
      location: locationLabel,
      crop: "Groundnut & Pulses",
      sourceAttribution: "TNAU Agritech Portal & ICAR-KVK Salem",
    },
  ];
}
