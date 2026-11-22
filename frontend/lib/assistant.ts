export type AssistantLanguage = "en" | "ta" | "te" | "hi";

export type AssistantSource = {
  name: string;
  source_type: "weather" | "market" | "general" | "knowledge";
  retrieved_at?: string | null;
  arrival_date?: string | null;
  fields_used: string[];
  title?: string | null;
  institution?: string | null;
  publication_year?: number | null;
  document_version?: string | null;
  page_number?: number | null;
  page_end?: number | null;
  source_url?: string | null;
  document_id?: string | null;
};

export type AssistantResponse = {
  answer: string;
  language: AssistantLanguage;
  intent: "general" | "weather" | "mandi" | "crop" | "safety" | "clarification";
  confidence: "low" | "medium" | "high";
  needs_clarification: boolean;
  follow_up_question?: string | null;
  key_points: string[];
  recommendations: string[];
  sources: AssistantSource[];
  data_status: "live" | "general" | "unavailable" | "mixed";
  warnings: string[];
};

export type ChatHistoryMessage = {
  role: "user" | "assistant";
  content: string;
};

const baseUrl = () => {
  if (process.env.NEXT_PUBLIC_AGRINEX_API_URL) {
    return process.env.NEXT_PUBLIC_AGRINEX_API_URL.replace(/\/$/, "");
  }
  if (typeof window !== "undefined" && window.location.hostname === "localhost") {
    return "http://localhost:8000";
  }
  return "http://127.0.0.1:8000";
};

export async function sendAssistantChat(payload: {
  message: string;
  language: AssistantLanguage;
  history: ChatHistoryMessage[];
  location?: {
    latitude?: number;
    longitude?: number;
    city?: string;
    district?: string;
  } | null;
}) {
  const targetUrl = `${baseUrl()}/api/v1/assistant/chat`;
  let response: Response;
  try {
    response = await fetch(targetUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
      },
      cache: "no-store",
      body: JSON.stringify(payload),
    });
  } catch (err) {
    const detail = err instanceof Error ? err.message : String(err);
    throw new Error(
      `Cannot connect to AgriNex backend at ${targetUrl}. Ensure the FastAPI server is running on port 8000 (${detail}).`
    );
  }
  const body = await response.json().catch(() => null) as
    | { data?: AssistantResponse; error?: { code?: string; message?: string } }
    | null;
  if (!response.ok) {
    throw new Error(
      body?.error?.message ||
        `Assistant service returned ${response.status}`,
    );
  }
  if (!body?.data) throw new Error("The assistant returned an invalid response.");
  return body.data;
}
