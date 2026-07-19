import type { Metadata } from "next";
import "./globals.css";
import TopNav from "@/components/top-nav";
import { ThemeProvider } from "@/components/theme-provider";
import { ThemeSync } from "@/components/theme-sync";

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : "http://localhost:3000"
  ),
  title: "RailShift APAC — Siemens Mobility Rail Strategy",
  description: "Rail strategy and decarbonisation cockpit for Asia-Pacific. Pipeline tracking, emission calculators, and AI-generated executive briefs for APAC rail infrastructure.",
  keywords: ["rail strategy", "APAC rail", "decarbonisation", "Siemens Mobility", "rail infrastructure", "emission calculator", "Singapore", "HSR", "CBTC", "DEGREE"],
  authors: [{ name: "Clarence Eng" }],
  creator: "Clarence Eng",
  openGraph: {
    title: "RailShift APAC — Siemens Mobility Rail Strategy",
    description: "Rail strategy and decarbonisation cockpit for Asia-Pacific.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "RailShift APAC — Siemens Mobility Rail Strategy",
    description: "Rail strategy and decarbonisation cockpit for Asia-Pacific.",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      data-ix-theme="classic"
      data-ix-color-schema="dark"
      suppressHydrationWarning
    >
      <body
        className="min-h-screen flex flex-col antialiased"
        style={{ background: "var(--ix-bg)", color: "var(--ix-text)" }}
      >
        <ThemeProvider>
          <ThemeSync />
          <TopNav />
          <main className="ix-page-enter flex-1 mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
            {children}
          </main>
          <footer
            className="shrink-0"
            style={{ borderTop: "1px solid var(--ix-border)", background: "var(--ix-surface-1)", boxShadow: "0 -2px 8px rgba(0,0,0,0.12)" }}
          >
            <div
              className="h-[4px] w-full"
              style={{ background: "var(--ix-gradient)" }}
              aria-hidden="true"
            />
            <div className="mx-auto max-w-7xl px-4 py-3 sm:px-6 lg:px-8 flex flex-wrap items-center justify-between gap-x-6 gap-y-2">
              <p className="text-xs" style={{ color: "var(--ix-text-soft)" }}>
                Built by Clarence Eng.
              </p>
              <div className="flex flex-wrap items-center gap-2">
                {["EEA 2018", "Ember 2024", "NCCS 2026"].map((src) => (
                  <span
                    key={src}
                    className="text-xs border rounded-sm px-2 py-0.5 font-mono"
                    style={{ borderColor: "var(--ix-border)", color: "var(--ix-text-weak)" }}
                  >
                    {src}
                  </span>
                ))}
              </div>
            </div>
          </footer>
        </ThemeProvider>
      </body>
    </html>
  );
}
