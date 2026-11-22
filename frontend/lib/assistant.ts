export type AssistantLanguage = "en" | "ta" | "te" | "hi";

export type AssistantSource = {
  name: string;
  source_type: "weather" | "market" | "general";
  retrieved_at?: string | null;
  arrival_date?: string | null;
  fields_used: string[];
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

const baseUrl = () =>
  process.env.NEXT_PUBLIC_AGRINEX_API_URL?.replace(/\/$/, "") ||
  "http://127.0.0.1:8000";

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
  const response = await fetch(`${baseUrl()}/api/v1/assistant/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    cache: "no-store",
    body: JSON.stringify(payload),
  });
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
