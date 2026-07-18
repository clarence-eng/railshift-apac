"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ThemeToggle } from "@/components/theme-toggle";
import MethodologyDrawer from "@/components/methodology-drawer";
import RailShiftWordmark from "@/components/railshift-wordmark";

const NAV_LINKS = [
  { href: "/",            label: "Pipeline"    },
  { href: "/decarbonise", label: "Decarbonise" },
  { href: "/brief",       label: "Brief"       },
];

export default function TopNav() {
  const pathname = usePathname();
  const [drawerOpen, setDrawerOpen] = useState(false);

  return (
    <>
      {/* 4px signature gradient band */}
      <div className="h-[4px] w-full shrink-0" style={{ background: "var(--ix-gradient)" }} aria-hidden="true" />

      <header
        className="border-b shrink-0"
        style={{ background: "var(--ix-surface-1)", borderColor: "var(--ix-border)", boxShadow: "0 2px 8px rgba(0,0,0,0.20)" }}
      >
        <div className="mx-auto flex max-w-7xl items-center px-4 sm:px-6 lg:px-8">
          {/* Wordmark */}
          <Link href="/" className="py-3 pr-5 shrink-0 sm:py-4 sm:pr-6 opacity-100 hover:opacity-80 transition-opacity duration-150" aria-label="RailShift APAC — home">
            <RailShiftWordmark height={28} width={207} className="hidden sm:block" />
            <RailShiftWordmark height={22} width={124} viewBox="0 0 210 50" className="sm:hidden" />
          </Link>

          {/* Nav links */}
          <nav className="flex flex-1 items-center min-w-0" aria-label="Main navigation">
            {NAV_LINKS.map(({ href, label }) => {
              const active = pathname === href;
              return (
                <Link
                  key={href}
                  href={href}
                  className="px-2 py-3 text-xs border-b-2 whitespace-nowrap transition-colors duration-150 sm:px-3 sm:py-4 sm:text-sm"
                  style={{
                    borderColor: active ? "var(--ix-primary)" : "transparent",
                    color: active ? "var(--ix-text)" : "var(--ix-text-soft)",
                    fontWeight: active ? 600 : 400,
                  }}
                >
                  {label}
                </Link>
              );
            })}
          </nav>

          {/* Right controls */}
          <div className="ml-2 flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => setDrawerOpen(true)}
              className="text-xs border rounded-sm px-2 py-1 transition-colors duration-150 sm:px-2.5"
              style={{ color: "var(--ix-text-soft)", borderColor: "var(--ix-border)", background: "transparent" }}
              aria-label="Open methodology and sources"
            >
              <span className="hidden sm:inline">Methodology</span>
              <span className="sm:hidden">Sources</span>
            </button>
            <ThemeToggle />
          </div>
        </div>
      </header>

      <MethodologyDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} />
    </>
  );
}
