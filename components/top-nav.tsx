"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import MethodologyDrawer from "@/components/methodology-drawer";

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
      <header className="border-b border-border bg-card">
        <div className="mx-auto flex max-w-7xl items-center px-4 sm:px-6 lg:px-8">
          {/* Brand */}
          <span className="py-3 pr-4 text-xs font-semibold tracking-widest text-foreground uppercase shrink-0 sm:text-sm sm:pr-6 sm:py-4">
            RailShift<span className="hidden sm:inline"> APAC</span>
          </span>

          {/* Nav links */}
          <nav className="flex flex-1 items-center min-w-0">
            {NAV_LINKS.map(({ href, label }) => {
              const active = pathname === href;
              return (
                <Link
                  key={href}
                  href={href}
                  className={[
                    "px-2 py-3 text-xs transition-colors border-b-2 whitespace-nowrap sm:px-3 sm:py-4 sm:text-sm",
                    active
                      ? "border-primary text-foreground font-medium"
                      : "border-transparent text-muted-foreground hover:text-foreground hover:border-border",
                  ].join(" ")}
                >
                  {label}
                </Link>
              );
            })}
          </nav>

          {/* Methodology button */}
          <button
            type="button"
            onClick={() => setDrawerOpen(true)}
            className="ml-2 shrink-0 text-xs text-muted-foreground hover:text-foreground transition-colors border border-border rounded px-2 py-1 sm:px-2.5"
            aria-label="Open methodology and sources"
          >
            <span className="hidden sm:inline">Methodology</span>
            <span className="sm:hidden">Sources</span>
          </button>
        </div>
      </header>

      <MethodologyDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} />
    </>
  );
}
