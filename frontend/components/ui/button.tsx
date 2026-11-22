import type { ButtonHTMLAttributes } from "react";
type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "primary" | "secondary" | "ghost" };
const variants = { primary: "bg-[#17834D] text-white shadow-sm hover:bg-[#123D2B]", secondary: "border border-[#d9e4dd] bg-white text-[#123D2B] hover:bg-[#f2f5f3]", ghost: "text-[#486056] hover:bg-[#edf3ef]" };
export function Button({ className = "", variant = "primary", ...props }: ButtonProps) { return <button className={`inline-flex items-center justify-center rounded-xl px-4 py-2.5 text-sm font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#17834D] disabled:opacity-50 ${variants[variant]} ${className}`} {...props} />; }
