// Shared card primitive for all Market tab sections.
// No client hooks — safe to import from both server and client components.

interface Props {
  title: string;
  note?: string;
  children: React.ReactNode;
}

export default function MarketCard({ title, note, children }: Props) {
  return (
    <div
      className="rounded-sm border overflow-hidden"
      style={{
        background: "var(--theme-color-2)",
        borderColor: "var(--theme-color-std-bdr)",
        boxShadow: "0 2px 8px rgba(0,0,0,0.18)",
      }}
    >
      <div className="h-[4px] w-full" style={{ background: "var(--ix-gradient)" }} aria-hidden="true" />
      <div className="px-4 py-3 border-b" style={{ borderColor: "var(--theme-color-std-bdr)" }}>
        <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: "var(--ix-primary)" }}>
          {title}
        </p>
        {note && (
          <p className="text-xs mt-0.5" style={{ color: "var(--theme-color-weak-text)" }}>{note}</p>
        )}
      </div>
      <div className="p-4">{children}</div>
    </div>
  );
}
