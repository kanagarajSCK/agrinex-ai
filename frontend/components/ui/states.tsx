import { AlertCircle, Inbox, LoaderCircle } from "lucide-react";

export function LoadingState({ label = "Loading…" }: { label?: string }) {
  return <div className="flex items-center gap-2 rounded-xl bg-white p-3 text-xs leading-5 text-[#486056]"><LoaderCircle aria-hidden="true" className="size-4 shrink-0 animate-spin" />{label}</div>;
}

export function EmptyState({ title = "Nothing here yet" }: { title?: string }) {
  return <div className="rounded-xl border border-dashed border-[#cbd9d0] bg-white p-5 text-center text-sm text-[#486056]"><Inbox aria-hidden="true" className="mx-auto mb-2 size-5" />{title}</div>;
}

export function ErrorState({ title = "Something went wrong" }: { title?: string }) {
  return <div role="alert" className="flex gap-2 rounded-xl border border-red-100 bg-red-50 p-3 text-xs leading-5 text-red-800"><AlertCircle aria-hidden="true" className="size-4 shrink-0" />{title}</div>;
}
