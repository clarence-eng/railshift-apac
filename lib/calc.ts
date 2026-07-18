/**
 * RailShift APAC — pure calculator functions
 * -----------------------------------------------------------------------------
 * No side effects, no imports of app state. Every function returns its
 * intermediate values so the UI can "show the working".
 *
 * Units: emission factors are gCO2e/pkm; grid factors gCO2e/kWh; rail energy
 * intensity kWh/pkm. 1 tonne = 1,000,000 g.
 *
 * See build guide Section 6 for the model and defaults.
 */

const G_PER_TONNE = 1_000_000;

/** Clamp helper; guards against NaN and out-of-range slider inputs. */
function safe(n: number, fallback = 0): number {
  return Number.isFinite(n) ? n : fallback;
}

// ----------------------------------------------------------------------------
// Modal shift: car -> rail
// ----------------------------------------------------------------------------

export interface ModalShiftInput {
  dailyRidership: number; // riders/day on the line
  avgTripKm: number; // km per trip
  shareDivertedFromCar: number; // 0..1
  gridFactor: number; // gCO2e/kWh for the country grid
  railEnergyIntensity: number; // kWh/pkm
  baselineCarFactor: number; // gCO2e/pkm
  carbonPriceSGD: number; // S$/tCO2e
  assetLifeYears: number;
  /** If true, use a fixed EEA rail factor instead of grid-aware energy model. */
  simpleMode?: boolean;
  eeaRailAvgFactor?: number; // used only when simpleMode
}

export interface ModalShiftResult {
  annualPkmShifted: number;
  railFactor: number; // gCO2e/pkm actually used
  netFactorSaving: number; // gCO2e/pkm (baseline - rail)
  avoidedTCO2PerYear: number;
  carbonValueSGDPerYear: number;
  lifetimeValueSGD: number;
  /** Guard flag: true when inputs were degenerate and result is zeroed. */
  degenerate: boolean;
}

export function modalShiftAvoided(input: ModalShiftInput): ModalShiftResult {
  const dailyRidership = Math.max(0, safe(input.dailyRidership));
  const avgTripKm = Math.max(0, safe(input.avgTripKm));
  const share = Math.min(1, Math.max(0, safe(input.shareDivertedFromCar)));
  const gridFactor = Math.max(0, safe(input.gridFactor));
  const energy = Math.max(0, safe(input.railEnergyIntensity));
  const baseline = Math.max(0, safe(input.baselineCarFactor));
  const price = Math.max(0, safe(input.carbonPriceSGD));
  const life = Math.max(0, safe(input.assetLifeYears));

  const railFactor = input.simpleMode
    ? Math.max(0, safe(input.eeaRailAvgFactor ?? 39))
    : energy * gridFactor;

  const netFactorSaving = baseline - railFactor;
  const annualPkmShifted = dailyRidership * avgTripKm * 365 * share;

  const avoidedGrams = netFactorSaving * annualPkmShifted;
  const avoidedTCO2PerYear = avoidedGrams / G_PER_TONNE;
  const carbonValueSGDPerYear = avoidedTCO2PerYear * price;
  const lifetimeValueSGD = carbonValueSGDPerYear * life;

  const degenerate = annualPkmShifted === 0;

  return {
    annualPkmShifted,
    railFactor,
    netFactorSaving,
    avoidedTCO2PerYear,
    carbonValueSGDPerYear,
    lifetimeValueSGD,
    degenerate,
  };
}

// ----------------------------------------------------------------------------
// Electrification: diesel line -> electric
// ----------------------------------------------------------------------------

export interface ElectrificationInput {
  annualPkm: number; // annual passenger-km on the line
  dieselRailFactor: number; // gCO2e/pkm
  gridFactor: number; // gCO2e/kWh
  railEnergyIntensity: number; // kWh/pkm
  carbonPriceSGD: number;
  assetLifeYears: number;
}

export interface ElectrificationResult {
  electricFactor: number; // gCO2e/pkm
  netFactorSaving: number; // gCO2e/pkm
  /** Fractional reduction vs diesel, 0..1. Null if diesel factor is 0. */
  reductionFraction: number | null;
  avoidedTCO2PerYear: number;
  carbonValueSGDPerYear: number;
  lifetimeValueSGD: number;
}

export function electrificationAvoided(
  input: ElectrificationInput
): ElectrificationResult {
  const annualPkm = Math.max(0, safe(input.annualPkm));
  const diesel = Math.max(0, safe(input.dieselRailFactor));
  const gridFactor = Math.max(0, safe(input.gridFactor));
  const energy = Math.max(0, safe(input.railEnergyIntensity));
  const price = Math.max(0, safe(input.carbonPriceSGD));
  const life = Math.max(0, safe(input.assetLifeYears));

  const electricFactor = energy * gridFactor;
  const netFactorSaving = diesel - electricFactor;
  const reductionFraction = diesel > 0 ? netFactorSaving / diesel : null;

  const avoidedTCO2PerYear = (netFactorSaving * annualPkm) / G_PER_TONNE;
  const carbonValueSGDPerYear = avoidedTCO2PerYear * price;
  const lifetimeValueSGD = carbonValueSGDPerYear * life;

  return {
    electricFactor,
    netFactorSaving,
    reductionFraction,
    avoidedTCO2PerYear,
    carbonValueSGDPerYear,
    lifetimeValueSGD,
  };
}

// ----------------------------------------------------------------------------
// Helper: the "signature insight" three-country electrification comparison.
// ----------------------------------------------------------------------------

export interface CountryElectrificationRow {
  country: string;
  gridFactor: number;
  electricFactor: number;
  dieselFactor: number;
  reductionPct: number; // rounded to nearest integer, for display
}

export function electrificationByCountry(
  grids: { country: string; gridFactor: number }[],
  opts: { railEnergyIntensity: number; dieselRailFactor: number }
): CountryElectrificationRow[] {
  const energy = Math.max(0, safe(opts.railEnergyIntensity));
  const diesel = Math.max(0, safe(opts.dieselRailFactor));
  return grids.map((g) => {
    const electricFactor = energy * g.gridFactor;
    const reduction = diesel > 0 ? (diesel - electricFactor) / diesel : 0;
    return {
      country: g.country,
      gridFactor: g.gridFactor,
      electricFactor,
      dieselFactor: diesel,
      reductionPct: Math.round(reduction * 100),
    };
  });
}

/** Auto-generated takeaway sentence for the worst-grid case. */
export function gridDependencyTakeaway(
  rows: CountryElectrificationRow[]
): string {
  if (rows.length === 0) return "";
  const worst = rows.reduce((a, b) => (b.reductionPct < a.reductionPct ? b : a));
  return (
    `Electrifying rail on ${worst.country}'s current grid cuts only ` +
    `~${worst.reductionPct}% of diesel emissions. The decarbonisation case for ` +
    `rolling stock is a grid-decarbonisation case first: sequence electrification ` +
    `with grid transition, or the avoided-emissions story underdelivers.`
  );
}
