import type { Project } from "@/data/seed";
import MarketCard from "./market-card";

interface Props { projects: Project[]; }

type SignalType = "PROTECT" | "PURSUE" | "MONITOR" | "WATCH";

interface Signal {
  project: Project;
  type: SignalType;
  urgency: "HIGH" | "MED" | "LOW";
  headline: string;
  action: string;
}

function extractYear(keyDate: string | null): number | null {
  if (!keyDate) return null;
  const m = keyDate.match(/\b(202[0-9]|203[0-9]|204[0-9])\b/);
  return m ? parseInt(m[1], 10) : null;
}

const CURRENT_YEAR = 2026;

function deriveSignals(projects: Project[]): Signal[] {
  const signals: Signal[] = [];

  for (const p of projects) {
    const isIncumbent = /siemens.*incumbent|incumbent.*siemens/i.test(p.note ?? "");
    const hasSiemens = /siemens/i.test(p.note ?? "");
    const year = extractYear(p.keyDate);
    const yearsOut = year ? year - CURRENT_YEAR : null;

    // PROTECT signals — Siemens is incumbent, key date approaching
    if (isIncumbent && yearsOut !== null && yearsOut <= 4) {
      signals.push({
        project: p,
        type: "PROTECT",
        urgency: yearsOut <= 2 ? "HIGH" : "MED",
        headline: `Delivery in ${year} — secure lifecycle contract before commissioning`,
        action: `Initiate multi-year APM/services negotiation now. LTA/client procurement focus shifts post-delivery. Window: ${CURRENT_YEAR}–${(year ?? CURRENT_YEAR) - 1}.`,
      });
    }

    // PURSUE signals — high-value, approved/under-construction, Siemens not confirmed incumbent
    if (!isIncumbent && (p.status === "approved" || p.status === "under-construction") && p.confidence === "MED") {
      signals.push({
        project: p,
        type: "PURSUE",
        urgency: p.status === "approved" ? "HIGH" : "MED",
        headline: `Pre-tender window — Siemens not confirmed; live pursuit opportunity`,
        action: `Submit positioning paper. Map decision-maker landscape. ${p.note ?? ""}`,
      });
    }

    // PURSUE signals — approved projects anywhere
    if (!hasSiemens && p.status === "approved" && p.confidence === "HIGH") {
      signals.push({
        project: p,
        type: "PURSUE",
        urgency: "HIGH",
        headline: `Approved, pre-tender — open competition for signalling/systems`,
        action: `Register interest. Review technical specs. ${p.note ?? ""}`,
      });
    }

    // MONITOR — undecided but high value
    if (p.status === "undecided" && p.value) {
      signals.push({
        project: p,
        type: "MONITOR",
        urgency: "LOW",
        headline: `No government decision — track political signals`,
        action: `Set news alert. Engage with bilateral trade offices. ${p.note ?? ""}`,
      });
    }

    // WATCH — operational, Siemens incumbent, services/upgrade potential
    if (isIncumbent && p.status === "operational") {
      signals.push({
        project: p,
        type: "WATCH",
        urgency: "MED",
        headline: `Operational — services, software & capacity upgrade window`,
        action: `Map upgrade cycle. Engage Asset Performance Management team. Quantify carbon value of next-gen rolling stock.`,
      });
    }
  }

  // Deduplicate — one signal per project (highest urgency)
  const seen = new Set<string>();
  const urgencyRank = { HIGH: 0, MED: 1, LOW: 2 };
  return signals
    .sort((a, b) => urgencyRank[a.urgency] - urgencyRank[b.urgency])
    .filter((s) => {
      if (seen.has(s.project.id)) return false;
      seen.add(s.project.id);
      return true;
    });
}

const SIGNAL_STYLE: Record<SignalType, { color: string; bg: string; border: string }> = {
  PROTECT: { color: "#fff",                             bg: "var(--ix-primary)",        border: "var(--ix-primary)" },
  PURSUE:  { color: "#fff",                             bg: "var(--theme-color-success)", border: "var(--theme-color-success)" },
  MONITOR: { color: "var(--theme-color-std-text)",      bg: "var(--theme-color-warning)", border: "var(--theme-color-warning)" },
  WATCH:   { color: "var(--theme-color-soft-text)",     bg: "var(--theme-color-3)",       border: "var(--theme-color-std-bdr)" },
};

const URGENCY_STYLE: Record<string, string> = {
  HIGH: "var(--theme-color-alarm)",
  MED:  "var(--theme-color-warning)",
  LOW:  "var(--theme-color-neutral)",
};

export default function MASignals({ projects }: Props) {
  const signals = deriveSignals(projects);
  const protect = signals.filter((s) => s.type === "PROTECT");
  const pursue  = signals.filter((s) => s.type === "PURSUE");
  const monitor = signals.filter((s) => s.type === "MONITOR");
  const watch   = signals.filter((s) => s.type === "WATCH");

  function SignalCard({ signal }: { signal: Signal }) {
    const style = SIGNAL_STYLE[signal.type];
    return (
      <div className="rounded-sm border overflow-hidden" style={{ borderColor: "var(--theme-color-std-bdr)", boxShadow: "0 1px 4px rgba(0,0,0,0.14)" }}>
        <div className="h-[4px] w-full" style={{ background: "var(--ix-gradient)" }} aria-hidden="true" />
        <div className="p-4 space-y-2">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-2 min-w-0">
              <span style={{ background: style.bg, color: style.color, fontSize: "9px", fontWeight: 700, padding: "2px 6px", borderRadius: "2px", letterSpacing: "0.5px", flexShrink: 0, marginTop: "2px" }}>
                {signal.type}
              </span>
              <div className="min-w-0">
                <p className="text-sm font-semibold leading-5" style={{ color: "var(--theme-color-std-text)" }}>{signal.project.name}</p>
                <p className="text-xs" style={{ color: "var(--theme-color-soft-text)" }}>{signal.project.country} · {signal.project.status}</p>
              </div>
            </div>
            <span style={{ background: URGENCY_STYLE[signal.urgency], color: "#fff", fontSize: "8px", fontWeight: 700, padding: "2px 5px", borderRadius: "2px", flexShrink: 0 }}>
              {signal.urgency}
            </span>
          </div>
          <p className="text-xs font-medium" style={{ color: "var(--theme-color-std-text)" }}>{signal.headline}</p>
          <p className="text-xs leading-relaxed" style={{ color: "var(--theme-color-soft-text)" }}>{signal.action}</p>
          {signal.project.value && (
            <p className="text-xs font-mono" style={{ color: "var(--theme-color-weak-text)" }}>Value: {signal.project.value}</p>
          )}
        </div>
      </div>
    );
  }

  function Section({ title, items, note }: { title: string; items: Signal[]; note: string }) {
    if (items.length === 0) return null;
    return (
      <div className="space-y-3">
        <div className="flex items-center gap-3">
          <h3 className="text-sm font-semibold uppercase tracking-wider" style={{ color: "var(--ix-primary)" }}>{title}</h3>
          <span className="font-mono text-xs" style={{ color: "var(--theme-color-weak-text)" }}>{items.length} signal{items.length !== 1 ? "s" : ""}</span>
        </div>
        <p className="text-xs" style={{ color: "var(--theme-color-soft-text)" }}>{note}</p>
        <div className="space-y-3">
          {items.map((s) => <SignalCard key={s.project.id} signal={s} />)}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Overview */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {[
          { label: "Protect",  count: protect.length,  color: "var(--ix-primary)",          note: "Incumbent — secure lifecycle" },
          { label: "Pursue",   count: pursue.length,   color: "var(--theme-color-success)",  note: "Open competition window" },
          { label: "Monitor",  count: monitor.length,  color: "var(--theme-color-warning)",  note: "Undecided — track signals" },
          { label: "Watch",    count: watch.length,    color: "var(--theme-color-neutral)",   note: "Operational — upgrade angle" },
        ].map(({ label, count, color, note }) => (
          <div key={label} className="rounded-sm border overflow-hidden" style={{ background: "var(--theme-color-2)", borderColor: "var(--theme-color-std-bdr)", boxShadow: "0 1px 4px rgba(0,0,0,0.14)" }}>
            <div className="h-[4px] w-full" style={{ background: "var(--ix-gradient)" }} aria-hidden="true" />
            <div className="px-4 pt-3 pb-4 space-y-1">
              <p className="text-xs uppercase tracking-widest leading-4" style={{ color: "var(--theme-color-soft-text)" }}>{label}</p>
              <p className="font-mono text-2xl font-semibold tabular-nums leading-7" style={{ color }}>{count}</p>
              <p className="text-xs" style={{ color: "var(--theme-color-weak-text)" }}>{note}</p>
            </div>
          </div>
        ))}
      </div>

      <Section title="Protect" items={protect} note="Siemens is confirmed incumbent. Key milestone approaching — prioritise lifecycle and services negotiation before attention shifts post-delivery." />
      <Section title="Pursue" items={pursue}  note="Live pursuit window: project is approved or under construction with no confirmed Siemens incumbent. Tender decision likely within 12–24 months." />
      <Section title="Monitor" items={monitor} note="No government decision. Monitor political and procurement signals — do not commit resources, but maintain stakeholder awareness." />
      <Section title="Watch"  items={watch}   note="Siemens is operational incumbent. Upgrade, services, and software renewal cycle is the next revenue event." />

      <p className="text-xs border-t pt-3" style={{ color: "var(--theme-color-weak-text)", borderColor: "var(--theme-color-x-weak-bdr)" }}>
        Signals derived from project status, analyst notes, and key dates in the dataset. No external intelligence sources — treat as a starting framework for internal validation.
      </p>
    </div>
  );
}
