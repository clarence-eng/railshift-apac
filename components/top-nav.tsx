"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import MethodologyDrawer from "@/components/methodology-drawer";
import { ThemeToggle } from "@/components/theme-toggle";
import RailShiftWordmark from "@/components/railshift-wordmark";

const NAV_LINKS = [
  { href: "/", label: "Pipeline" },
  { href: "/decarbonise", label: "Decarbonise" },
  { href: "/brief", label: "Brief" },
];

export default function TopNav() {
  const pathname = usePathname();
  const [drawerOpen, setDrawerOpen] = useState(false);

  return (
    <>
      {/* Gradient accent band — single use of signature gradient, 3px */}
      <div
        className="h-[3px] w-full shrink-0"
        style={{ background: "var(--ix-gradient)" }}
        aria-hidden="true"
      />

      <header className="border-b border-border bg-card">
        <div className="mx-auto flex max-w-7xl items-center px-4 sm:px-6 lg:px-8">

          {/* Wordmark — inline SVG, petrol tile + APAC via --primary, RailShift via currentColor */}
          <Link
            href="/"
            className="py-3 pr-4 shrink-0 sm:py-4 sm:pr-6 transition-opacity duration-150 hover:opacity-80"
            aria-label="RailShift APAC — home"
          >
            {/* Full wordmark on sm+, tile-only on xs */}
            <RailShiftWordmark
              height={28}
              width={175}
              className="hidden sm:block"
              style={{ color: "var(--foreground)" }}
            />
            {/* Tile + "RS" abbreviation on narrow screens */}
            <RailShiftWordmark
              height={28}
              width={47}
              viewBox="0 0 47 48"
              className="sm:hidden"
              style={{ color: "var(--foreground)" }}
            />
          </Link>

          {/* Nav links */}
          <nav className="flex flex-1 items-center min-w-0" aria-label="Main navigation">
            {NAV_LINKS.map(({ href, label }) => {
              const active = pathname === href;
              return (
                <Link
                  key={href}
                  href={href}
                  className={[
                    "px-2 py-3 text-xs border-b-2 whitespace-nowrap",
                    "transition-colors duration-150",
                    "sm:px-3 sm:py-4 sm:text-sm",
                    active
                      ? "border-primary text-foreground font-medium"
                      : "border-transparent text-muted-foreground hover:text-foreground hover:border-border-soft",
                  ].join(" ")}
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
              className={[
                "text-xs text-muted-foreground border border-border rounded-sm px-2 py-1",
                "transition-colors duration-150",
                "hover:text-foreground hover:border-border-soft hover:bg-surface-2",
                "sm:px-2.5",
              ].join(" ")}
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
