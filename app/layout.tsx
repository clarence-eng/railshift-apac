import type { Metadata } from "next";
import { Geist_Mono } from "next/font/google";
import "./globals.css";
import IxAppShell from "@/components/ix-app-shell";

const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : "http://localhost:3000"
  ),
  title: "RailShift APAC",
  description: "Rail strategy and decarbonisation cockpit for Asia-Pacific",
  openGraph: {
    title: "RailShift APAC",
    description: "Rail strategy and decarbonisation cockpit for Asia-Pacific",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "RailShift APAC",
    description: "Rail strategy and decarbonisation cockpit for Asia-Pacific",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    // data-ix-theme + data-ix-color-schema activate iX CSS token blocks.
    // IxAppShell keeps data-ix-color-schema current via themeSwitcher.
    <html
      lang="en"
      className={`${geistMono.variable} dark`}
      data-ix-theme="classic"
      data-ix-color-schema="dark"
      suppressHydrationWarning
    >
      <body className="h-screen w-screen overflow-hidden bg-[var(--theme-color-1)] text-[var(--theme-color-std-text)] antialiased">
        <IxAppShell initialTheme="dark">
          {children}
        </IxAppShell>
      </body>
    </html>
  );
}
