/**
 * RailShift APAC — precomputed fallback briefs
 * -----------------------------------------------------------------------------
 * Served when Gemini is rate-limited or unavailable. Every figure is sourced
 * from data/seed.ts; no values were invented.
 *
 * Generated: 18 Jul 2026. Refresh when seed data changes.
 */

export interface PrecomputedBrief {
  projectId: string;
  generatedAt: string; // ISO date
  markdown: string;
}

const CRL: PrecomputedBrief = {
  projectId: "sg-crl",
  generatedAt: "2026-07-18",
  markdown: `# Executive Strategy Memo — Cross Island Line (CRL), Singapore

**Classification:** Work sample — independent analytical prototype.
**Not affiliated with or endorsed by Siemens.**

---

## Market Opportunity

The Cross Island Line is Singapore's eighth and longest fully automated metro line: 50 km, 21 stations, targeting Phase 1 opening in 2030 and Phase 2 in 2032. The signalling scope alone has been confirmed at approximately EUR 310 million (Siemens press release, HIGH confidence). At GoA 4 (full driverless automation), this is a high-complexity, high-value systems contract — the type that establishes a multi-decade service, software, and upgrade relationship with LTA.

Singapore's grid emits 497 gCO₂e/kWh (Ember 2024, lifecycle). At the default rail energy intensity of 0.09 kWh/pkm, CRL electric operations emit approximately 44.7 gCO₂e/pkm against a car baseline of 143 gCO₂e/pkm — a net saving of ~98 gCO₂e/pkm per diverted passenger. Assuming 500,000 daily riders and 50% diversion from car, the line avoids roughly **107,600 tCO₂e per year**, with a carbon value of **~S$4.8 million/year** at Singapore's 2026–27 carbon tax of S$45/tCO₂e.

---

## Competitive Context

**Siemens Mobility** is the incumbent: the Trainguard CBTC contract is awarded and confirmed (HIGH confidence). The strategic question is whether Siemens can convert incumbency into a long-duration asset management, software subscription, and GoA upgrade relationship — the recurring revenue layer that justifies the initial capital investment.

**Alstom** (Urbalis CBTC) and **Hitachi Rail** (ATC/CBTC platforms) are credible challengers for any scope extensions, Phase 2 addenda, or LTA fleet decisions, given both hold references in Singapore's broader network (NSL, EWL signalling history). **CRRC** is less relevant at the signalling layer for Singapore but competes for rolling stock — worth monitoring for bundled proposals in other APAC markets.

The decisive competitive risk is not contract loss (already awarded) but scope erosion: LTA has historically disaggregated software and maintenance contracts at renewal.

---

## DEGREE Decarbonisation Alignment

CRL's electric-over-grid proposition is strong at the commuter layer but constrained by Singapore's current grid intensity (497 gCO₂e/kWh, one of the higher Ember 2024 values in the dataset). The decarbonisation case is real — 44.7 gCO₂e/pkm versus 143 gCO₂e/pkm for a car — but the narrative must be sequenced carefully: **modal shift** is the near-term story; **grid transition** (Singapore targets 2 GW solar + imports by 2030) is the medium-term story that improves the electric-rail case further.

The Singapore carbon price path (S$45 today, target S$50–80 by 2030) provides an escalating quantified value to the avoided-emissions argument — a number that grows as the tax rises, without any operational change.

---

## Recommendation

**Protect and deepen the incumbent position.** The immediate priority is to convert the signalling contract into a multi-year Asset Performance Management (APM) agreement before Phase 2 delivery, when LTA's procurement attention shifts to the next network. A bundled Phase 1 + Phase 2 lifecycle service offering, priced against the avoided carbon value trajectory, is the strongest value narrative available. Quantify the 40-year lifetime carbon value (approximately **S$193 million undiscounted at current carbon price**) in commercial conversations — it is a credible, citable anchor that Alstom and Hitachi cannot match with the same source rigour on this specific line.

*All figures from data/seed.ts and lib/calc.ts. Confidence ratings per seed.ts conventions.*`,
};

const JRL: PrecomputedBrief = {
  projectId: "sg-jrl",
  generatedAt: "2026-07-18",
  markdown: `# Executive Strategy Memo — Jurong Region Line (JRL), Singapore

**Classification:** Work sample — independent analytical prototype.
**Not affiliated with or endorsed by Siemens.**

---

## Market Opportunity

The Jurong Region Line covers 24 km with 24 stations, fully elevated, GoA 4 driverless. The Siemens Sirius CBTC signalling scope is confirmed at approximately EUR 135 million (Siemens press release, HIGH confidence), with Stage 1 opening targeted mid-2028. Like CRL, the line is fully electric — operating on Singapore's grid at 497 gCO₂e/kWh (Ember 2024).

JRL is shorter and lower-ridership than CRL, but it anchors Jurong Innovation District and the Tuas mega-port — giving it industrial freight adjacency unusual for a metro line. Any future autonomous freight shuttle capability on the western corridor would flow through this infrastructure.

---

## Competitive Context

**Siemens Mobility** is incumbent on signalling (Sirius CBTC, GoA 4 awarded, HIGH confidence). The EUR 135 million contract is smaller than CRL but the strategic logic is identical: incumbency creates a preferred-bidder position for lifecycle services, software updates, and any capacity extension west to Tuas.

**Alstom** and **Hitachi** are the credible alternatives at contract renewal. CRRC holds no Singapore metro signalling references and is not a near-term threat at this layer. The risk, as with CRL, is LTA disaggregating the software and maintenance layers at first renewal — typically 5–7 years post-opening.

---

## DEGREE Decarbonisation Alignment

At 0.09 kWh/pkm and Singapore's 497 gCO₂e/kWh grid, JRL's electric operations run at ~44.7 gCO₂e/pkm — a 69% improvement over the car baseline (143 gCO₂e/pkm). The line's role in serving the Jurong industrial cluster adds a freight decarbonisation angle that standard metro analysis ignores: electrified last-mile industrial logistics, if scope ever extends there, is a strong DEGREE alignment story.

The carbon value at Singapore's 2026–27 tax rate (S$45/tCO₂e) is modest for a 24 km line, but the tax escalation path to S$50–80 by 2030 improves this materially by the time lifecycle contract negotiations open.

---

## Recommendation

**Treat JRL and CRL as a single relationship asset.** LTA manages both under the same signalling procurement framework, and both carry Siemens incumbency. The strategic play is a unified lifecycle services contract that covers both lines, amortising account management cost while locking in a longer-term software relationship. A joint presentation quantifying the combined avoided-emissions value (CRL + JRL together avoid well over 100,000 tCO₂e/year at scale) strengthens the public-interest narrative for any renewal negotiation.

Near-term action: establish a JRL Digital Operations Centre capability ahead of Stage 1 opening — this creates switching costs before Alstom or Hitachi can establish a competing service reference.

*All figures from data/seed.ts and lib/calc.ts. Confidence ratings per seed.ts conventions.*`,
};

const TEL: PrecomputedBrief = {
  projectId: "sg-tel",
  generatedAt: "2026-07-18",
  markdown: `# Executive Strategy Memo — Thomson-East Coast Line (TEL), Singapore

**Classification:** Work sample — independent analytical prototype.
**Not affiliated with or endorsed by Siemens.**

---

## Market Opportunity

The Thomson-East Coast Line is a 43 km, 32-station fully automated line reaching its final configuration with Stage 5 completion targeted for the second half of 2026. Contract value is not publicly confirmed (null in the dataset, LOW confidence for this figure — render n/a). TEL is the most imminent near-term event in Singapore's pipeline: Stage 5 opens this year.

Post-opening, TEL moves from construction phase to operational phase — which shifts the procurement activity from civil and systems to **operations, software upgrades, and capacity management**. This is the revenue transition that matters for a systems supplier.

---

## Competitive Context

TEL's signalling architecture is not publicly attributed in the same way as CRL or JRL. This is a material intelligence gap. Without confirmed incumbent data (confidence: LOW), the competitive position must be treated as open. The three credible contenders for any TEL services or signalling upgrade work are **Siemens** (Trainguard ecosystem present on CRL and JRL), **Alstom** (Urbalis, active in the region), and **Hitachi Rail** (established Singapore presence).

**CRRC** is relevant for rolling stock but not for the CBTC/ATC layer at this specification level.

The absence of a confirmed supplier creates an opportunity: the first party to publish a credible, quantified lifecycle value proposition for TEL's operational phase — before LTA opens any services procurement — establishes the reference frame for competitors.

---

## DEGREE Decarbonisation Alignment

TEL is fully electric, operating on Singapore's 497 gCO₂e/kWh grid (Ember 2024, lifecycle, HIGH confidence). At the default 0.09 kWh/pkm energy intensity, TEL runs at ~44.7 gCO₂e/pkm — a 69% reduction versus a car (143 gCO₂e/pkm). At 43 km serving central, eastern, and northern Singapore, TEL is a high-ridership corridor; even conservative ridership assumptions produce material avoided-emissions figures.

Singapore's carbon price trajectory (S$45 in 2026–27, target S$50–80 by 2030) means the carbon value of TEL's avoided emissions grows in real terms over the next four years — a compelling framing for a multi-year services agreement priced today.

---

## Recommendation

**Move fast on the services intelligence gap.** TEL's supplier attribution is unconfirmed — this is the only Singapore line in the dataset where the incumbent is not established with HIGH confidence. A targeted intelligence effort (LTA tender notices, Gazetteer, annual reports) before Stage 5 opens in 2H 2026 is the immediate priority.

If Siemens is not the TEL signalling incumbent, the strategic case for a services pursuit is still strong: LTA is a single client managing three lines (TEL, JRL, CRL) with two confirmed Siemens relationships. A cross-line Digital Fleet Management proposal — covering all three — gives Siemens a service breadth argument no single-line supplier can match, regardless of TEL's original signalling vendor.

*All figures from data/seed.ts and lib/calc.ts. Confidence ratings per seed.ts conventions. TEL contract value listed as n/a — not publicly confirmed.*`,
};

export const PRECOMPUTED_BRIEFS: PrecomputedBrief[] = [CRL, JRL, TEL];

export const PRECOMPUTED_BY_ID: Record<string, PrecomputedBrief> = Object.fromEntries(
  PRECOMPUTED_BRIEFS.map((b) => [b.projectId, b])
);
