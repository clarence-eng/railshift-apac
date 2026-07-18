import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import TopNav from "@/components/top-nav";

const geistSans = Geist({ variable: "--font-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "RailShift APAC",
  description: "Rail strategy and decarbonisation cockpit for Asia-Pacific",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} dark`}>
      <body className="min-h-screen bg-background text-foreground antialiased flex flex-col">
        <TopNav />
        <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-6 lg:px-8">{children}</main>
        <footer className="border-t border-border bg-card mt-auto">
          <p className="mx-auto max-w-7xl px-4 py-3 text-xs text-muted-foreground sm:px-6 lg:px-8">
            Independent analytical prototype. Not affiliated with or endorsed by Siemens. Built as a work sample.
          </p>
        </footer>
      </body>
    </html>
  );
}
