"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import {
  IxApplication,
  IxApplicationHeader,
  IxMenu,
  IxMenuItem,
  IxContent,
} from "@siemens/ix-react";
import { themeSwitcher } from "@siemens/ix";
import RailShiftWordmark from "@/components/railshift-wordmark";

let registered = false;
async function registerIx() {
  if (registered || typeof window === "undefined") return;
  registered = true;
  const { defineCustomElements } = await import("@siemens/ix/loader");
  await defineCustomElements();
}

const NAV_ITEMS = [
  { href: "/",            label: "Pipeline",    icon: "asset-network" },
  { href: "/decarbonise", label: "Decarbonise", icon: "analysis"      },
  { href: "/brief",       label: "Brief",       icon: "document"      },
];

interface Props {
  children: React.ReactNode;
  initialTheme: "dark" | "light";
}

export default function IxAppShell({ children, initialTheme }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const [colorSchema, setColorSchema] = useState<"dark" | "light">(initialTheme);

  useEffect(() => {
    registerIx();

    const unsub = themeSwitcher.themeChanged.on((detail) => {
      const mode = detail.mode === "light" ? "light" : "dark";
      setColorSchema(mode);
      document.documentElement.setAttribute("data-ix-color-schema", mode);
      document.documentElement.classList.toggle("dark", mode === "dark");
      document.documentElement.classList.toggle("light", mode === "light");
    });

    themeSwitcher.setColorSchema(initialTheme);
    return () => { unsub.dispose?.(); };
  }, [initialTheme]);

  return (
    <IxApplication theme="theme-classic" colorSchema={colorSchema}>

      {/* ── Application header ───────────────────────────────────── */}
      <IxApplicationHeader
        name="RailShift APAC"
        nameSuffix="Strategy & Sustainability concept · Siemens Mobility Asia-Pacific"
      >
        {/*
          slot="logo" — our wordmark replaces any company logo.
          currentColor resolves to the header's text token so "RailShift"
          reads correctly in both themes; the tile and "APAC" use --primary.
        */}
        <RailShiftWordmark
          slot="logo"
          height={30}
          width={168}
          style={{ color: "var(--theme-color-std-text)" }}
        />
      </IxApplicationHeader>

      {/* ── Left navigation rail ─────────────────────────────────── */}
      <IxMenu enableToggleTheme applicationName="RailShift APAC">
        {NAV_ITEMS.map(({ href, label, icon }) => (
          <IxMenuItem
            key={href}
            icon={icon}
            label={label}
            active={pathname === href}
            onClick={() => router.push(href)}
          >
            {label}
          </IxMenuItem>
        ))}
      </IxMenu>

      {/* ── Page content ─────────────────────────────────────────── */}
      <IxContent style={{ overflow: "auto" }}>
        {children}
      </IxContent>

      {/*
        slot="bottom" — IxApplication renders this inside its <footer> element.
        Persistent disclaimer, always visible, never inside scrollable content.
      */}
      <footer
        slot="bottom"
        style={{
          padding: "6px 20px",
          borderTop: "1px solid var(--theme-color-x-weak-bdr)",
          background: "var(--theme-color-1)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "16px",
          flexWrap: "wrap",
        }}
      >
        <span
          style={{
            fontSize: "11px",
            color: "var(--theme-color-soft-text)",
            fontFamily: "'Siemens Sans', Arial, Helvetica, sans-serif",
          }}
        >
          Independent concept prototype. Not affiliated with or endorsed by Siemens AG.
          Built by Clarence Ng as a work sample.
        </span>
        <span
          style={{
            fontSize: "11px",
            color: "var(--theme-color-weak-text)",
            fontFamily: "'Siemens Sans', Arial, Helvetica, sans-serif",
            whiteSpace: "nowrap",
          }}
        >
          Data: EEA 2018 · Ember 2024 · NCCS 2026
        </span>
      </footer>

    </IxApplication>
  );
}
