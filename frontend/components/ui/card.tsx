import type { HTMLAttributes } from "react";
export function Card({ className = "", ...props }: HTMLAttributes<HTMLElement>) { return <section className={`rounded-2xl border border-[#e0e9e3] bg-white shadow-[0_1px_2px_rgba(16,28,24,0.04)] ${className}`} {...props} />; }
