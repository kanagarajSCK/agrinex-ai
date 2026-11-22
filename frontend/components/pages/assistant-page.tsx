"use client";

import { useEffect, useState, type FormEvent } from "react";
import { Bot, CircleHelp, Leaf, Mic, Send, Sparkles, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState, ErrorState, LoadingState } from "@/components/ui/states";
import { PageHeader } from "@/components/ui/primitives";
import {
  sendAssistantChat,
  type AssistantResponse,
  type AssistantLanguage,
  type ChatHistoryMessage,
} from "@/lib/assistant";

const suggestedQuestions: Record<AssistantLanguage, string[]> = {
  en: [
    "What is the weather forecast for my selected farm?",
    "Explain today's available mandi prices for tomato.",
    "How should I prepare my field before sowing?",
  ],
  ta: [
    "எனது தேர்ந்தெடுத்த பண்ணைக்கு வானிலை முன்னறிவிப்பு என்ன?",
    "தக்காளி மண்டி விலைகளை விளக்குங்கள்.",
  ],
  te: [
    "నా ఎంచుకున్న పొలం కోసం వాతావరణ సూచన ఏమిటి?",
    "టమాటా మండీ ధరలను వివరించండి.",
  ],
  hi: [
    "मेरे चुने हुए खेत के लिए मौसम पूर्वानुमान क्या है?",
    "टमाटर के उपलब्ध मंडी भाव समझाइए।",
  ],
};

type DisplayMessage =
  | { role: "user"; content: string }
  | { role: "assistant"; content: string; response: AssistantResponse };

export function AssistantPage() {
  const [language, setLanguage] = useState<AssistantLanguage>("en");
  const [draft, setDraft] = useState("");
  const [messages, setMessages] = useState<DisplayMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [location, setLocation] = useState<{
    latitude?: number;
    longitude?: number;
    city?: string;
    district?: string;
  } | null>(null);

  useEffect(() => {
    const saved = window.localStorage.getItem("agrinex-weather-location");
    if (!saved) return;
    try {
      const parsed = JSON.parse(saved) as {
        latitude?: number;
        longitude?: number;
        label?: string;
      };
      if (
        typeof parsed.latitude === "number" &&
        typeof parsed.longitude === "number"
      ) {
        void Promise.resolve().then(() =>
          setLocation({
            latitude: parsed.latitude,
            longitude: parsed.longitude,
            city: parsed.label,
          }),
        );
      }
    } catch {
      window.localStorage.removeItem("agrinex-weather-location");
    }
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const message = draft.trim();
    if (!message || loading) return;

    setError("");
    setLoading(true);
    setMessages((current) => [...current, { role: "user", content: message }]);
    setDraft("");

    const history: ChatHistoryMessage[] = messages
      .slice(-8)
      .map((item) =>
        item.role === "user"
          ? { role: "user", content: item.content }
          : { role: "assistant", content: item.content },
      );

    try {
      const response = await sendAssistantChat({
        message,
        language,
        history,
        location,
      });
      setMessages((current) => [
        ...current,
        { role: "assistant", content: response.answer, response },
      ]);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "The assistant is unavailable.");
    } finally {
      setLoading(false);
    }
  }

  function clearConversation() {
    setMessages([]);
    setError("");
  }

  return (
    <>
      <PageHeader
        eyebrow="AgriNex assistant"
        title="Ask a farming question"
        description="Gemini-powered assistance with verified weather and mandi tools. General agricultural guidance is not a diagnosis or a guaranteed recommendation."
        action={
          <label className="flex items-center gap-2 text-xs font-semibold text-[#66776d]">
            <span>Language</span>
            <select
              aria-label="Assistant language"
              value={language}
              onChange={(event) => setLanguage(event.target.value as AssistantLanguage)}
              className="min-h-11 rounded-xl border border-[#dfe8e2] bg-white px-3 text-sm text-[#365344] outline-none focus:border-[#17834D]"
            >
              <option value="en">English</option>
              <option value="ta">தமிழ்</option>
              <option value="te">తెలుగు</option>
              <option value="hi">हिन्दी</option>
            </select>
          </label>
        }
      />

      <div className="grid min-w-0 items-start gap-5 xl:grid-cols-[minmax(0,1.55fr)_minmax(290px,0.8fr)]">
        <Card className="min-w-0 overflow-hidden">
          <div className="flex items-center justify-between gap-3 border-b border-[#edf1ee] px-4 py-4 sm:px-5">
            <div className="flex min-w-0 items-center gap-3">
              <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-[#e6f4ea] text-[#17834D]"><Bot aria-hidden="true" className="size-5" /></span>
              <div className="min-w-0"><h2 className="truncate text-sm font-bold text-[#183b2b]">AgriNex AI Assistant</h2><p className="mt-0.5 text-[11px] text-[#79877f]">{location ? "Uses explicitly selected weather location context" : "No farm location supplied"}</p></div>
            </div>
            <button type="button" onClick={clearConversation} disabled={!messages.length} className="inline-flex min-h-10 items-center gap-1.5 rounded-xl border border-[#e0e9e3] px-3 text-xs font-bold text-[#587064] disabled:opacity-40"><Trash2 aria-hidden="true" className="size-3.5" />Clear</button>
          </div>

          <div aria-live="polite" className="min-h-[280px] space-y-4 bg-[#f8faf8] p-4 sm:min-h-[360px] sm:p-5">
            {!messages.length && !loading ? (
              <div className="mx-auto flex min-h-[245px] max-w-md flex-col items-center justify-center py-7 text-center">
                <span className="mb-4 grid size-14 place-items-center rounded-2xl bg-[#e6f4ea] text-[#17834D]"><Sparkles aria-hidden="true" className="size-6" /></span>
                <EmptyState title="Start with a farming question" />
                <p className="mt-3 text-xs leading-5 text-[#77857c]">Conversation is held only in this open page; it is not permanent memory.</p>
              </div>
            ) : (
              messages.map((message, index) =>
                message.role === "user" ? (
                  <div key={`user-${index}`} className="ml-auto max-w-[88%] rounded-2xl rounded-br-md bg-[#123D2B] px-4 py-3 text-sm leading-6 text-white">
                    <p>{message.content}</p>
                  </div>
                ) : (
                  <div key={`assistant-${index}`} className="mr-auto max-w-[92%] space-y-3 rounded-2xl rounded-bl-md border border-[#e1e9e3] bg-white px-4 py-3 text-sm leading-6 text-[#294535]">
                    <p>{message.response.answer}</p>
                    {message.response.key_points.length > 0 && (
                      <ul className="list-disc space-y-1 pl-5 text-xs">
                        {message.response.key_points.map((point) => <li key={point}>{point}</li>)}
                      </ul>
                    )}
                    {message.response.recommendations.length > 0 && (
                      <div className="rounded-xl bg-[#f7f9f7] p-3 text-xs"><p className="font-bold">General considerations</p><ul className="mt-1 list-disc pl-5">{message.response.recommendations.map((item) => <li key={item}>{item}</li>)}</ul></div>
                    )}
                    {message.response.warnings.length > 0 && (
                      <div className="rounded-xl border border-[#f0dfb8] bg-[#fff9eb] p-3 text-xs text-[#735b24]">{message.response.warnings.join(" ")}</div>
                    )}
                    {message.response.sources.length > 0 && (
                      <div className="border-t border-[#edf1ee] pt-3 text-[11px] text-[#748279]">
                        <p className="font-bold text-[#456052]">Verified sources used</p>
                        {message.response.sources.map((source, sourceIndex) => (
                          source.source_type === "knowledge" ? (
                            <p key={`${source.name}-${sourceIndex}`}>
                              {source.source_url ? (
                                <a href={source.source_url} target="_blank" rel="noreferrer" className="font-semibold text-[#17834D] underline">{source.title || source.name}</a>
                              ) : <span className="font-semibold">{source.title || source.name}</span>}
                              {source.institution ? ` · ${source.institution}` : ""}
                              {source.publication_year ? ` · ${source.publication_year}` : ""}
                              {source.page_number ? ` · page ${source.page_number}${source.page_end && source.page_end !== source.page_number ? `–${source.page_end}` : ""}` : ""}
                            </p>
                          ) : (
                            <p key={`${source.name}-${sourceIndex}`}>{source.name}{source.arrival_date ? ` · arrival ${source.arrival_date}` : ""}{source.retrieved_at ? ` · retrieved ${new Date(source.retrieved_at).toLocaleString("en-IN")}` : ""}</p>
                          )
                        ))}
                      </div>
                    )}
                  </div>
                ),
              )
            )}
            {loading && <LoadingState label="Sending question to AgriNex AI…" />}
            {error && <ErrorState title={error} />}
          </div>

          <form onSubmit={handleSubmit} className="border-t border-[#edf1ee] bg-white p-3 sm:p-4">
            <label htmlFor="assistant-question" className="sr-only">Type a farming question</label>
            <div className="flex items-end gap-2 rounded-2xl border border-[#dfe8e2] bg-white p-2 focus-within:border-[#17834D] focus-within:ring-2 focus-within:ring-[#17834D]/10">
              <textarea
                id="assistant-question"
                value={draft}
                onChange={(event) => setDraft(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" && !event.shiftKey) {
                    event.preventDefault();
                    event.currentTarget.form?.requestSubmit();
                  }
                }}
                rows={1}
                maxLength={2000}
                placeholder="Ask a farming question"
                className="max-h-28 min-h-10 min-w-0 flex-1 resize-y bg-transparent px-2 py-2 text-sm leading-5 text-[#20372b] outline-none placeholder:text-[#97a39c]"
              />
              <button type="button" disabled title="Voice input is not available in this phase" aria-label="Voice input unavailable" className="grid size-10 shrink-0 cursor-not-allowed place-items-center rounded-xl text-[#a2aca6]"><Mic aria-hidden="true" className="size-[18px]" /></button>
              <Button type="submit" disabled={!draft.trim() || loading} aria-label="Send question" className="size-10 shrink-0 rounded-xl p-0"><Send aria-hidden="true" className="size-4" /></Button>
            </div>
            <p className="mt-2 px-1 text-[10px] leading-4 text-[#849188]">Voice input is unavailable. Conversation is not permanently stored.</p>
          </form>
        </Card>

        <aside className="grid min-w-0 gap-4">
          <Card className="p-4 sm:p-5">
            <div className="mb-3 flex items-center gap-2"><Leaf aria-hidden="true" className="size-4 text-[#17834D]" /><h2 className="text-sm font-bold text-[#183b2b]">Suggested questions</h2></div>
            <div className="space-y-2">
              {suggestedQuestions[language].map((text) => (
                <button key={text} type="button" onClick={() => setDraft(text)} className="flex min-h-12 w-full items-center gap-3 rounded-xl border border-[#e5ece7] bg-white p-3 text-left text-xs leading-5 text-[#496153] transition hover:border-[#9fc9aa] hover:bg-[#f8fcf8] focus-visible:outline-2 focus-visible:outline-[#17834D]"><CircleHelp aria-hidden="true" className="size-4 shrink-0 text-[#17834D]" />{text}</button>
              ))}
            </div>
          </Card>
          <Card className="p-4 sm:p-5 text-xs leading-5 text-[#748279]">
            <p className="font-bold text-[#456052]">Response safety</p>
            <p className="mt-2">The assistant does not provide guaranteed yields, exact selling prices or exact pesticide/fertilizer doses. Consult a qualified local expert for field-specific decisions.</p>
          </Card>
        </aside>
      </div>
    </>
  );
}
