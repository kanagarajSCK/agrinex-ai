"use client";

import { useState, type FormEvent } from "react";
import {
  Bot,
  ChartNoAxesCombined,
  Check,
  CircleHelp,
  CloudSun,
  Leaf,
  Mic,
  Send,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState, ErrorState, LoadingState } from "@/components/ui/states";
import { DemoBadge, PageHeader } from "@/components/ui/primitives";

const suggestedQuestions = [
  "What should I check before watering my field?",
  "How can I compare nearby market prices?",
  "What information should I note about my crop?",
];

export function AssistantPage() {
  const [language, setLanguage] = useState("English");
  const [draft, setDraft] = useState("");
  const [question, setQuestion] = useState("");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmed = draft.trim();
    if (!trimmed) return;
    setQuestion(trimmed);
    setDraft("");
  }

  return (
    <>
      <PageHeader
        eyebrow="AgriNex assistant"
        title="Ask a farming question"
        description="A multilingual assistant interface preview. No AI service is connected, and questions are not sent or answered."
        action={<label className="flex items-center gap-2 text-xs font-semibold text-[#66776d]"><span>Language</span><select aria-label="Assistant language" value={language} onChange={(event) => setLanguage(event.target.value)} className="min-h-11 rounded-xl border border-[#dfe8e2] bg-white px-3 text-sm text-[#365344] outline-none focus:border-[#17834D]"><option>English</option><option>தமிழ் · Preview</option><option>తెలుగు · Preview</option><option>हिन्दी · Preview</option></select></label>}
      />

      <div className="grid min-w-0 items-start gap-5 xl:grid-cols-[minmax(0,1.55fr)_minmax(290px,0.8fr)]">
        <Card className="min-w-0 overflow-hidden">
          <div className="flex items-center justify-between gap-3 border-b border-[#edf1ee] px-4 py-4 sm:px-5">
            <div className="flex min-w-0 items-center gap-3">
              <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-[#e6f4ea] text-[#17834D]"><Bot aria-hidden="true" className="size-5" /></span>
              <div className="min-w-0"><h2 className="truncate text-sm font-bold text-[#183b2b]">AgriNex AI Assistant</h2><p className="mt-0.5 text-[11px] text-[#79877f]">Preview mode · not connected</p></div>
            </div>
            <DemoBadge>PREVIEW</DemoBadge>
          </div>

          <div aria-live="polite" className="min-h-[280px] space-y-4 bg-[#f8faf8] p-4 sm:min-h-[360px] sm:p-5">
            {!question ? (
              <div className="mx-auto flex min-h-[245px] max-w-md flex-col items-center justify-center py-7 text-center">
                <span className="mb-4 grid size-14 place-items-center rounded-2xl bg-[#e6f4ea] text-[#17834D]"><Sparkles aria-hidden="true" className="size-6" /></span>
                <EmptyState title="Start with a question or choose an example" />
                <p className="mt-3 text-xs leading-5 text-[#77857c]">Your message will stay in this browser preview and will not be sent to a service.</p>
              </div>
            ) : (
              <>
                <div className="ml-auto max-w-[88%] rounded-2xl rounded-br-md bg-[#123D2B] px-4 py-3 text-sm leading-6 text-white">
                  <p>{question}</p>
                  <span className="mt-1 block text-right text-[10px] text-[#c8dfd0]">Local preview · {language}</span>
                </div>
                <ErrorState title="AI service unavailable. Your question was not sent, and no answer was generated." />
              </>
            )}
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
                placeholder="Ask a question (kept in this preview)"
                className="max-h-28 min-h-10 min-w-0 flex-1 resize-y bg-transparent px-2 py-2 text-sm leading-5 text-[#20372b] outline-none placeholder:text-[#97a39c]"
              />
              <button type="button" disabled title="Voice input is not available in this phase" aria-label="Voice input unavailable" className="grid size-10 shrink-0 cursor-not-allowed place-items-center rounded-xl text-[#a2aca6] disabled:opacity-70"><Mic aria-hidden="true" className="size-[18px]" /></button>
              <Button type="submit" disabled={!draft.trim()} aria-label="Show local question preview" className="size-10 shrink-0 rounded-xl p-0 disabled:cursor-not-allowed"><Send aria-hidden="true" className="size-4" /></Button>
            </div>
            <p className="mt-2 px-1 text-[10px] leading-4 text-[#849188]">Voice input is unavailable. Submitting only displays your message locally; no AI request is made.</p>
          </form>
        </Card>

        <aside className="grid min-w-0 gap-4">
          <Card className="p-4 sm:p-5">
            <div className="mb-3 flex items-center justify-between gap-2"><h2 className="text-sm font-bold text-[#183b2b]">Suggested questions</h2><DemoBadge>EXAMPLES</DemoBadge></div>
            <div className="space-y-2">
              {suggestedQuestions.map((text) => (
                <button key={text} type="button" onClick={() => setDraft(text)} className="flex min-h-12 w-full items-center gap-3 rounded-xl border border-[#e5ece7] bg-white p-3 text-left text-xs leading-5 text-[#496153] transition hover:border-[#9fc9aa] hover:bg-[#f8fcf8] focus-visible:outline-2 focus-visible:outline-[#17834D]">
                  <CircleHelp aria-hidden="true" className="size-4 shrink-0 text-[#17834D]" />{text}
                </button>
              ))}
            </div>
          </Card>

          <Card className="p-4 sm:p-5">
            <div className="mb-3 flex items-center gap-2"><Leaf aria-hidden="true" className="size-4 text-[#17834D]" /><h2 className="text-sm font-bold text-[#183b2b]">Future response format</h2></div>
            <p className="mb-4 text-xs leading-5 text-[#758279]">Structured response components are visual placeholders only.</p>
            <div className="space-y-3">
              <div className="rounded-xl bg-[#f7f9f7] p-3"><p className="text-[10px] font-bold uppercase tracking-wider text-[#86948b]">Answer text · placeholder</p><p className="mt-1 text-xs text-[#607268]">A sourced explanation would appear here.</p></div>
              <div className="grid grid-cols-2 gap-2">
                <div className="rounded-xl border border-[#e5ece7] p-3"><p className="text-[10px] font-semibold text-[#7b8980]">Metric card</p><p className="mt-1 text-xs font-bold text-[#41614c]">Unavailable</p></div>
                <div className="rounded-xl border border-[#e5ece7] p-3"><p className="text-[10px] font-semibold text-[#7b8980]">Chart container</p><p className="mt-1 flex items-center gap-1 text-xs font-bold text-[#41614c]"><ChartNoAxesCombined aria-hidden="true" className="size-3.5" /> Placeholder</p></div>
              </div>
              <ul className="space-y-1 rounded-xl bg-[#f7f9f7] p-3 text-xs text-[#607268]"><li className="font-bold text-[#456052]">Recommendation list · placeholder</li><li className="flex gap-2"><Check aria-hidden="true" className="size-3.5 shrink-0 text-[#9ba79f]" />Verified recommendations unavailable</li></ul>
              <div className="rounded-xl border border-dashed border-[#d8e2dc] p-3 text-[11px] leading-5 text-[#7a8880]">Source attribution placeholder · no sources connected</div>
            </div>
          </Card>

          <Card className="p-4 sm:p-5">
            <h2 className="mb-3 text-sm font-bold text-[#183b2b]">Interface states</h2>
            <div className="space-y-2">
              <LoadingState label="Loading state preview · no request running" />
              <ErrorState title="Error state preview: AI service is not connected." />
              <div className="flex items-center gap-2 text-[10px] text-[#829087]"><CloudSun aria-hidden="true" className="size-3.5" />Weather and market details are separate sample modules.</div>
            </div>
          </Card>
        </aside>
      </div>
    </>
  );
}
