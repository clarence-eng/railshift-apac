import type { Project } from "@/data/seed";
import { isSiemensIncumbent, extractYear } from "@/lib/project-utils";

interface Props { projects: Project[]; }

type SignalType = "PROTECT" | "PURSUE" | "MONITOR" | "WATCH";

interface Signal {
  project: Project;
  type: SignalType;
  urgency: "HIGH" | "MED" | "LOW";
  headline: string;
  action: string;
}

function truncateNote(note: string | null, max = 120): string {
  if (!note) return "";
  return note.length > max ? `${note.slice(0, max).trimEnd()}…` : note;
}

// Use a stable reference year so the component is deterministic for SSG.
// Update this when the dataset is refreshed.
const DATASET_YEAR = 2026;

function deriveSignals(projects: Project[]): Signal[] {
  const signals: Signal[] = [];

  for (const p of projects) {
    const isIncumbent = isSiemensIncumbent(p.note);
    const hasSiemens = /siemens/i.test(p.note ?? "");
    const year = extractYear(p.keyDate);
    const yearsOut = year != null ? year - DATASET_YEAR : null;

    if (isIncumbent && yearsOut != null && yearsOut <= 4) {
      const windowEnd = year != null && year > DATASET_YEAR ? year - 1 : DATASET_YEAR;
      signals.push({
        project: p,
        type: "PROTECT",
        urgency: yearsOut <= 2 ? "HIGH" : "MED",
        headline: `Delivery in ${year} — secure lifecycle contract before commissioning`,
        action: `Initiate multi-year APM/services negotiation now. Client procurement focus shifts post-delivery. Window: ${DATASET_YEAR}–${windowEnd}.`,
      });
    }

    if (!isIncumbent && (p.status === "approved" || p.status === "under-construction") && p.confidence === "MED") {
      signals.push({
        project: p,
        type: "PURSUE",
        urgency: p.status === "approved" ? "HIGH" : "MED",
        headline: "Pre-tender window — Siemens not confirmed; live pursuit opportunity",
        action: `Submit positioning paper. Map decision-maker landscape. ${truncateNote(p.note)}`,
      });
    }

    if (!hasSiemens && p.status === "approved" && p.confidence === "HIGH") {
      signals.push({
        project: p,
        type: "PURSUE",
        urgency: "HIGH",
        headline: "Approved, pre-tender — open competition for signalling/systems",
        action: `Register interest. Review technical specs. ${truncateNote(p.note)}`,
      });
    }

    if (p.status === "undecided" && p.value) {
      signals.push({
        project: p,
        type: "MONITOR",
        urgency: "LOW",
        headline: "No government decision — track political signals",
        action: `Set news alert. Engage with bilateral trade offices. ${truncateNote(p.note)}`,
      });
    }

    if (isIncumbent && p.status === "operational") {
      signals.push({
        project: p,
        type: "WATCH",
        urgency: "MED",
        headline: "Operational — services, software & capacity upgrade window",
        action: "Map upgrade cycle. Engage Asset Performance Management team. Quantify carbon value of next-gen rolling stock.",
      });
    }
  }

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

const SIGNAL_STYLE: Record<SignalType, { color: string; bg: string }> = {
  PROTECT: { color: "#fff",                          bg: "var(--ix-primary)" },
  PURSUE:  { color: "#fff",                          bg: "var(--theme-color-success)" },
  MONITOR: { color: "var(--theme-color-std-text)",   bg: "var(--theme-color-warning)" },
  WATCH:   { color: "var(--theme-color-soft-text)",  bg: "var(--theme-color-3)" },
};

const URGENCY_STYLE: Record<string, string> = {
  HIGH: "var(--theme-color-alarm)",
  MED:  "var(--theme-color-warning)",
  LOW:  "var(--theme-color-neutral)",
};

// Hoisted — not inside the render function to avoid remount on every render
function SignalCard({ signal }: { signal: Signal }) {
  const style = SIGNAL_STYLE[signal.type];
  return (
    <div
      className="rounded-sm border overflow-hidden"
      style={{ borderColor: "var(--theme-color-std-bdr)", boxShadow: "0 1px 4px rgba(0,0,0,0.14)" }}
    >
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
        {signal.project.keyDate && (
          <p className="text-xs" style={{ color: "var(--theme-color-weak-text)" }}>Key date: {signal.project.keyDate}</p>
        )}
      </div>
    </div>
  );
}

// Hoisted — not inside the render function
function SignalSection({ title, items, note }: { title: string; items: Signal[]; note: string }) {
  if (items.length === 0) return null;
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3">
        <h3 className="text-sm font-semibold uppercase tracking-wider" style={{ color: "var(--ix-primary)" }}>{title}</h3>
        <span className="font-mono text-xs" style={{ color: "var(--theme-color-weak-text)" }}>
          {items.length} signal{items.length !== 1 ? "s" : ""}
        </span>
      </div>
      <p className="text-xs" style={{ color: "var(--theme-color-soft-text)" }}>{note}</p>
      <div className="space-y-3">
        {items.map((s) => <SignalCard key={s.project.id} signal={s} />)}
      </div>
    </div>
  );
}

export default function MASignals({ projects }: Props) {
  const signals = deriveSignals(projects);
  const protect = signals.filter((s) => s.type === "PROTECT");
  const pursue  = signals.filter((s) => s.type === "PURSUE");
  const monitor = signals.filter((s) => s.type === "MONITOR");
  const watch   = signals.filter((s) => s.type === "WATCH");

  return (
    <div className="space-y-8">
      {/* Overview KPIs */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {[
          { label: "Protect",  count: protect.length,  color: "var(--ix-primary)",           sub: "Incumbent — secure lifecycle" },
          { label: "Pursue",   count: pursue.length,   color: "var(--theme-color-success)",   sub: "Open competition window" },
          { label: "Monitor",  count: monitor.length,  color: "var(--theme-color-warning)",   sub: "Undecided — track signals" },
          { label: "Watch",    count: watch.length,    color: "var(--theme-color-neutral)",   sub: "Operational — upgrade angle" },
        ].map(({ label, count, color, sub }) => (
          <div key={label} className="rounded-sm border overflow-hidden" style={{ background: "var(--theme-color-2)", borderColor: "var(--theme-color-std-bdr)", boxShadow: "0 1px 4px rgba(0,0,0,0.14)" }}>
            <div className="h-[4px] w-full" style={{ background: "var(--ix-gradient)" }} aria-hidden="true" />
            <div className="px-4 pt-3 pb-4 space-y-1">
              <p className="text-xs uppercase tracking-widest leading-4" style={{ color: "var(--theme-color-soft-text)" }}>{label}</p>
              <p className="font-mono text-3xl font-semibold tabular-nums leading-8" style={{ color }}>{count}</p>
              <p className="text-xs" style={{ color: "var(--theme-color-weak-text)" }}>{sub}</p>
            </div>
          </div>
        ))}
      </div>

      <SignalSection title="Protect" items={protect} note="Siemens is confirmed incumbent. Key milestone approaching — prioritise lifecycle and services negotiation before attention shifts post-delivery." />
      <SignalSection title="Pursue"  items={pursue}   note="Live pursuit window: project is approved or under construction with no confirmed Siemens incumbent. Tender decision likely within 12–24 months." />
      <SignalSection title="Monitor" items={monitor}  note="No government decision. Monitor political and procurement signals — do not commit resources, but maintain stakeholder awareness." />
      <SignalSection title="Watch"   items={watch}    note="Siemens is operational incumbent. Upgrade, services, and software renewal cycle is the next revenue event." />

      <p className="text-xs border-t pt-3" style={{ color: "var(--theme-color-weak-text)", borderColor: "var(--theme-color-x-weak-bdr)" }}>
        Signals derived from project status, analyst notes, and key dates. No external intelligence sources — treat as a starting framework for internal validation.
      </p>
    </div>
  );
}
