import type { Project } from "@/data/seed";
import MarketCard from "./market-card";
import CountryChartWrapper from "./country-chart-wrapper";

interface Props { projects: Project[]; }

interface CountryRow {
  country: string;
  total: number;
  operational: number;
  underConstruction: number;
  approved: number;
  undecided: number;
  siemensCount: number;
  totalKm: number;
}

function buildCountryRows(projects: Project[]): CountryRow[] {
  const map = new Map<string, Project[]>();
  for (const p of projects) {
    const c = p.country.split(/\s*\/\s*/)[0];
    if (!map.has(c)) map.set(c, []);
    map.get(c)!.push(p);
  }
  return [...map.entries()]
    .map(([country, ps]) => ({
      country,
      total: ps.length,
      operational: ps.filter((p) => p.status === "operational").length,
      underConstruction: ps.filter((p) => p.status === "under-construction").length,
      approved: ps.filter((p) => p.status === "approved").length,
      undecided: ps.filter((p) => p.status === "undecided").length,
      siemensCount: ps.filter((p) => /siemens/i.test(p.note ?? "") && /incumbent/i.test(p.note ?? "")).length,
      totalKm: ps.reduce((sum, p) => sum + (p.lengthKm ?? 0), 0),
    }))
    .sort((a, b) => b.total - a.total);
}

// CountryChart is client-only (Recharts) — lazy import via CountryChartWrapper
export default function CountryBreakdown({ projects }: Props) {
  const byCountry = buildCountryRows(projects);

  return (
    <div className="space-y-6">
      {/* Chart */}
      <MarketCard title="Projects by market">
        <CountryChartWrapper data={byCountry} />
      </MarketCard>

      {/* Table */}
      <MarketCard title="Market breakdown">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead
              className="border-b"
              style={{ borderColor: "var(--theme-color-std-bdr)", background: "var(--theme-color-2)" }}
            >
              <tr>
                {["Market", "Total", "Operational", "Construction", "Approved", "Undecided", "Route km", "Siemens"].map((h) => (
                  <th
                    key={h}
                    className="px-3 py-2 text-left text-xs font-medium uppercase tracking-wider whitespace-nowrap"
                    style={{ color: "var(--theme-color-soft-text)" }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {byCountry.map((row) => (
                <tr
                  key={row.country}
                  className="border-b last:border-0"
                  style={{ borderColor: "var(--theme-color-x-weak-bdr)" }}
                >
                  <td className="px-3 py-2.5 font-medium" style={{ color: "var(--theme-color-std-text)" }}>{row.country}</td>
                  <td className="px-3 py-2.5 font-mono tabular-nums" style={{ color: "var(--theme-color-primary)" }}>{row.total}</td>
                  <td className="px-3 py-2.5 text-xs" style={{ color: "var(--theme-color-soft-text)" }}>{row.operational || "—"}</td>
                  <td className="px-3 py-2.5 text-xs" style={{ color: "var(--theme-color-soft-text)" }}>{row.underConstruction || "—"}</td>
                  <td className="px-3 py-2.5 text-xs" style={{ color: "var(--theme-color-soft-text)" }}>{row.approved || "—"}</td>
                  <td className="px-3 py-2.5 text-xs" style={{ color: "var(--theme-color-soft-text)" }}>{row.undecided || "—"}</td>
                  <td className="px-3 py-2.5 text-xs font-mono tabular-nums" style={{ color: "var(--theme-color-soft-text)" }}>
                    {row.totalKm > 0 ? row.totalKm.toLocaleString() : "—"}
                  </td>
                  <td className="px-3 py-2.5">
                    {row.siemensCount > 0 ? (
                      <span style={{ background: "var(--ix-primary)", color: "#fff", fontSize: "9px", fontWeight: 700, padding: "1px 5px", borderRadius: "2px", letterSpacing: "0.5px" }}>
                        {row.siemensCount} PROJ
                      </span>
                    ) : (
                      <span style={{ color: "var(--theme-color-weak-text)" }}>—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </MarketCard>
    </div>
  );
}
