import type { Metadata } from "next";
import { AppShell } from "@/components/layout/app-shell";
import "./globals.css";

export const metadata: Metadata = {
  title: "AgriNex AI | Smarter Farming. Better Decisions.",
  description: "Multilingual agricultural intelligence for Indian farmers.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en" className="h-full"><body className="min-h-full"><AppShell>{children}</AppShell></body></html>;
}
