import type { InputHTMLAttributes, ReactNode, SelectHTMLAttributes } from "react";
import type { LucideIcon } from "lucide-react";
import { Search } from "lucide-react";
import { Card } from "@/components/ui/card";

export function DemoBadge({ children = "DEMO DATA" }: { children?: ReactNode }) {
  return (
    <span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-[#fff6df] px-2.5 py-1 text-[10px] font-bold tracking-[0.08em] text-[#795c18]">
      <span aria-hidden="true" className="size-1.5 rounded-full bg-[#ca961c]" />
      {children}
    </span>
  );
}

export interface PageHeaderProps {
  eyebrow?: string;
  title: string;
  description: string;
  action?: ReactNode;
}

export function PageHeader({ eyebrow, title, description, action }: PageHeaderProps) {
  return (
    <div className="mb-6 flex flex-col gap-4 sm:mb-7 sm:flex-row sm:items-end sm:justify-between">
      <div className="min-w-0">
        <div className="mb-2 flex flex-wrap items-center gap-2">
          {eyebrow && <span className="text-[11px] font-bold uppercase tracking-[0.13em] text-[#17834D]">{eyebrow}</span>}
          <DemoBadge />
        </div>
        <h1 className="text-[26px] font-extrabold leading-tight tracking-[-0.035em] text-[#101C18] sm:text-[32px]">{title}</h1>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-[#587064]">{description}</p>
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}

export interface MetricCardProps {
  label: string;
  value: string;
  detail: string;
  icon: LucideIcon;
  accent?: "green" | "blue" | "amber" | "violet";
  demo?: boolean;
}

const accentStyles = {
  green: "bg-[#e5f4e9] text-[#168049]",
  blue: "bg-[#e8f1fb] text-[#3774a6]",
  amber: "bg-[#fff4dd] text-[#9b741f]",
  violet: "bg-[#f0eafa] text-[#7252a3]",
};

export function MetricCard({ label, value, detail, icon: Icon, accent = "green", demo = true }: MetricCardProps) {
  return (
    <Card className="min-w-0 p-4 sm:p-5">
      <div className="flex items-start justify-between gap-2">
        <span className="text-[12px] font-semibold leading-5 text-[#62756b]">{label}</span>
        <span className={`grid size-9 shrink-0 place-items-center rounded-xl ${accentStyles[accent]}`}>
          <Icon aria-hidden="true" className="size-[17px]" />
        </span>
      </div>
      <p className="mt-3 truncate text-2xl font-extrabold tracking-tight text-[#12271c] sm:text-[27px]">{value}</p>
      <div className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1">
        {demo && <DemoBadge>DEMO</DemoBadge>}
        <span className="text-[11px] leading-4 text-[#738279]">{detail}</span>
      </div>
    </Card>
  );
}

export function ChartCard({
  title,
  subtitle,
  children,
  action,
  className = "",
  demo = true,
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
  action?: ReactNode;
  className?: string;
  demo?: boolean;
}) {
  return (
    <Card className={`min-w-0 overflow-hidden p-4 sm:p-5 ${className}`}>
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-[15px] font-bold text-[#183b2b]">{title}</h2>
            {demo && <DemoBadge>DEMO</DemoBadge>}
          </div>
          {subtitle && <p className="mt-1 text-xs leading-5 text-[#758279]">{subtitle}</p>}
        </div>
        {action}
      </div>
      {children}
    </Card>
  );
}

export function SearchInput({
  className = "",
  ...props
}: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className={`flex min-h-11 items-center gap-2.5 rounded-xl border border-[#dfe8e2] bg-white px-3.5 focus-within:border-[#17834D] focus-within:ring-2 focus-within:ring-[#17834D]/10 ${className}`}>
      <Search aria-hidden="true" className="size-4 shrink-0 text-[#718278]" />
      <input {...props} className="min-w-0 flex-1 bg-transparent text-sm text-[#20372b] outline-none placeholder:text-[#97a39c]" />
    </label>
  );
}

export function DemoSelect({ className = "", ...props }: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select {...props} className={`min-h-11 rounded-xl border border-[#dfe8e2] bg-white px-3 text-sm font-medium text-[#365344] outline-none focus:border-[#17834D] focus:ring-2 focus:ring-[#17834D]/10 ${className}`} />
  );
}

export function SectionTitle({ title, action }: { title: string; action?: ReactNode }) {
  return (
    <div className="mb-3 flex items-center justify-between gap-3">
      <h2 className="text-base font-bold tracking-tight text-[#183b2b]">{title}</h2>
      {action}
    </div>
  );
}
