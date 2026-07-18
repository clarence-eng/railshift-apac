/**
 * RailShift APAC — calculator tests (Vitest)
 * Run: npx vitest run
 *
 * These tests LOCK the numbers. If the model changes, they must be updated
 * deliberately, not silently. This is the verification gate before building UI.
 */

import { describe, it, expect } from "vitest";
import {
  modalShiftAvoided,
  electrificationAvoided,
  electrificationByCountry,
  gridDependencyTakeaway,
} from "./calc";

describe("modalShiftAvoided — Singapore base case", () => {
  const result = modalShiftAvoided({
    dailyRidership: 500_000,
    avgTripKm: 12,
    shareDivertedFromCar: 0.5,
    gridFactor: 497, // Singapore, Ember 2024
    railEnergyIntensity: 0.09,
    baselineCarFactor: 143,
    carbonPriceSGD: 45,
    assetLifeYears: 40,
  });

  it("computes rail factor from grid (grid-aware mode)", () => {
    expect(result.railFactor).toBeCloseTo(44.73, 2);
  });

  it("computes annual pkm shifted", () => {
    expect(result.annualPkmShifted).toBe(1_095_000_000);
  });

  it("computes avoided tCO2 per year", () => {
    expect(result.avoidedTCO2PerYear).toBeCloseTo(107_605.65, 1);
  });

  it("prices the carbon value in SGD per year", () => {
    expect(result.carbonValueSGDPerYear).toBeCloseTo(4_842_254.25, 1);
  });

  it("computes lifetime value over asset life", () => {
    expect(result.lifetimeValueSGD).toBeCloseTo(193_690_170, 0);
  });
});

describe("modalShiftAvoided — simple mode uses EEA rail factor", () => {
  const result = modalShiftAvoided({
    dailyRidership: 500_000,
    avgTripKm: 12,
    shareDivertedFromCar: 0.5,
    gridFactor: 497,
    railEnergyIntensity: 0.09,
    baselineCarFactor: 143,
    carbonPriceSGD: 45,
    assetLifeYears: 40,
    simpleMode: true,
    eeaRailAvgFactor: 39,
  });

  it("ignores grid and uses the fixed EEA rail factor", () => {
    expect(result.railFactor).toBe(39);
    // net saving 143 - 39 = 104; x 1.095e9 / 1e6 = 113,880 tCO2
    expect(result.avoidedTCO2PerYear).toBeCloseTo(113_880, 0);
  });
});

describe("modalShiftAvoided — guards", () => {
  it("zeroes out when ridership is zero and flags degenerate", () => {
    const r = modalShiftAvoided({
      dailyRidership: 0,
      avgTripKm: 12,
      shareDivertedFromCar: 0.5,
      gridFactor: 497,
      railEnergyIntensity: 0.09,
      baselineCarFactor: 143,
      carbonPriceSGD: 45,
      assetLifeYears: 40,
    });
    expect(r.avoidedTCO2PerYear).toBe(0);
    expect(r.degenerate).toBe(true);
  });

  it("clamps share above 1 and never returns NaN", () => {
    const r = modalShiftAvoided({
      dailyRidership: 100_000,
      avgTripKm: 10,
      shareDivertedFromCar: 5, // absurd input, clamps to 1
      gridFactor: 497,
      railEnergyIntensity: 0.09,
      baselineCarFactor: 143,
      carbonPriceSGD: 45,
      assetLifeYears: 40,
    });
    // share clamps to 1 -> pkm = 100000 * 10 * 365 = 365,000,000
    expect(r.annualPkmShifted).toBe(365_000_000);
    expect(Number.isFinite(r.avoidedTCO2PerYear)).toBe(true);
  });

  it("survives NaN inputs without throwing", () => {
    const r = modalShiftAvoided({
      dailyRidership: NaN,
      avgTripKm: NaN,
      shareDivertedFromCar: NaN,
      gridFactor: NaN,
      railEnergyIntensity: NaN,
      baselineCarFactor: NaN,
      carbonPriceSGD: NaN,
      assetLifeYears: NaN,
    });
    expect(r.avoidedTCO2PerYear).toBe(0);
    expect(r.degenerate).toBe(true);
  });
});

describe("electrificationAvoided — reproduces the signature insight", () => {
  const rows = electrificationByCountry(
    [
      { country: "Singapore", gridFactor: 497 },
      { country: "India", gridFactor: 670 },
      { country: "Indonesia", gridFactor: 680 },
    ],
    { railEnergyIntensity: 0.09, dieselRailFactor: 70 }
  );

  it("Singapore ~ -36%", () => {
    expect(rows[0].reductionPct).toBe(36);
  });

  it("India ~ -14%", () => {
    expect(rows[1].reductionPct).toBe(14);
  });

  it("Indonesia ~ -13% (note: guide prose rounds to 12; exact is 12.6% -> 13)", () => {
    expect(rows[2].reductionPct).toBe(13);
  });

  it("generates a grid-dependency takeaway naming the worst grid", () => {
    const takeaway = gridDependencyTakeaway(rows);
    expect(takeaway).toContain("Indonesia");
    expect(takeaway).toContain("grid-decarbonisation");
  });
});

describe("electrificationAvoided — division guard", () => {
  it("returns null reductionFraction when diesel factor is 0", () => {
    const r = electrificationAvoided({
      annualPkm: 1_000_000_000,
      dieselRailFactor: 0,
      gridFactor: 497,
      railEnergyIntensity: 0.09,
      carbonPriceSGD: 45,
      assetLifeYears: 40,
    });
    expect(r.reductionFraction).toBeNull();
    expect(Number.isFinite(r.avoidedTCO2PerYear)).toBe(true);
  });

  it("computes avoided tCO2 for a clean-grid line", () => {
    // Singapore: electric 44.73, saving 25.27 gCO2/pkm over 1e9 pkm = 25,270 t
    const r = electrificationAvoided({
      annualPkm: 1_000_000_000,
      dieselRailFactor: 70,
      gridFactor: 497,
      railEnergyIntensity: 0.09,
      carbonPriceSGD: 45,
      assetLifeYears: 40,
    });
    expect(r.electricFactor).toBeCloseTo(44.73, 2);
    expect(r.avoidedTCO2PerYear).toBeCloseTo(25_270, 0);
  });
});
