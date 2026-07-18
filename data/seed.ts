/**
 * RailShift APAC — seed dataset
 * -----------------------------------------------------------------------------
 * SINGLE SOURCE OF TRUTH for every figure in the app.
 *
 * HARD RULE (see CLAUDE.md): never fabricate. If a value is unknown, use `null`
 * and render "n/a". Do not add projects or edit figures without a source.
 *
 * Every figure carries `source` (an id in SOURCES) and `confidence`.
 * Compiled 18 Jul 2026. Cross-corroborated from primary filings + official
 * transport/energy sources. See the build guide, Section 11, for full URLs.
 */

// ----------------------------------------------------------------------------
// Types
// ----------------------------------------------------------------------------

export type Confidence = "HIGH" | "MED" | "LOW";

export type ProjectStatus =
  | "operational"
  | "under-construction"
  | "approved"
  | "undecided";

export interface Sourced {
  /** id into the SOURCES map */
  source: string;
  confidence: Confidence;
}

export interface Project extends Sourced {
  id: string;
  name: string;
  country: string;
  status: ProjectStatus;
  /** Human-readable value string as reported (currencies differ by country). */
  value: string | null;
  /** Route length in km, if reported. */
  lengthKm: number | null;
  stations: number | null;
  /** Key milestone as reported (opening / completion). */
  keyDate: string | null;
  /** Approximate map centroid. FLAGGED: verify each before shipping. */
  lat: number;
  lng: number;
  /** Analyst note: the strategic angle for a systems supplier. */
  note: string | null;
}

export interface EmissionFactor extends Sourced {
  mode: string;
  /** grams CO2-equivalent per passenger-km (well-to-wheel, EEA boundary). */
  gCO2ePerPkm: number;
}

export interface GridFactor extends Sourced {
  country: string;
  /** grams CO2-equivalent per kWh (Ember 2024, lifecycle). */
  gCO2ePerKWh: number;
  /** Optional alternative national factor (e.g. EMA generation-only for SG). */
  altGCO2ePerKWh: number | null;
  altNote: string | null;
}

export interface CalculatorDefaults {
  /** Baseline car emission factor, gCO2e/pkm (EEA car avg 1.6 occ). */
  baselineCarFactor: number;
  /** Electric rail specific energy, kWh/pkm. MED confidence; user-tunable. */
  railEnergyIntensity: number;
  railEnergyIntensityRange: [number, number];
  /** Diesel rail emission factor, gCO2e/pkm. MED confidence; user-tunable. */
  dieselRailFactor: number;
  /** EEA rail average, gCO2e/pkm — used in "simple mode". */
  eeaRailAvgFactor: number;
  /** Share of ridership genuinely diverted from private car (0..1). */
  shareDivertedFromCar: number;
  /** Average passenger trip length, km. */
  avgTripKm: number;
  /** Singapore carbon tax, S$/tCO2e (2026-2027). Slider 25..80. */
  carbonPriceSGD: number;
  carbonPriceRangeSGD: [number, number];
  /** Assumed asset life, years, for lifetime value. */
  assetLifeYears: number;
}

export interface Source {
  id: string;
  label: string;
  url: string;
}

// ----------------------------------------------------------------------------
// Emission factors by mode — EEA EU-27, well-to-wheel, 2018
// Label the boundary. Do NOT mix with tank-to-wheel numbers.
// ----------------------------------------------------------------------------

export const EMISSION_FACTORS: EmissionFactor[] = [
  { mode: "Passenger car (avg 1.6 occ)", gCO2ePerPkm: 143, source: "eea", confidence: "HIGH" },
  { mode: "Bus", gCO2ePerPkm: 80, source: "eea", confidence: "HIGH" },
  { mode: "Aviation (1.7x uplift)", gCO2ePerPkm: 126, source: "eea", confidence: "HIGH" },
  { mode: "Rail (all services avg)", gCO2ePerPkm: 39, source: "eea", confidence: "HIGH" },
  { mode: "Rail (high-speed electric)", gCO2ePerPkm: 20, source: "eea", confidence: "HIGH" },
];

// ----------------------------------------------------------------------------
// Grid emission factors — Ember 2024, lifecycle gCO2e/kWh
// SG has an alternative EMA generation-only factor; label which you use.
// ----------------------------------------------------------------------------

export const GRID_FACTORS: GridFactor[] = [
  { country: "Singapore", gCO2ePerKWh: 497, altGCO2ePerKWh: 417, altNote: "EMA generation-only, 2022", source: "ember", confidence: "HIGH" },
  { country: "Australia", gCO2ePerKWh: 525, altGCO2ePerKWh: null, altNote: null, source: "ember", confidence: "HIGH" },
  { country: "Malaysia", gCO2ePerKWh: 602, altGCO2ePerKWh: null, altNote: null, source: "ember", confidence: "HIGH" },
  { country: "India", gCO2ePerKWh: 670, altGCO2ePerKWh: null, altNote: null, source: "ember", confidence: "HIGH" },
  { country: "Indonesia", gCO2ePerKWh: 680, altGCO2ePerKWh: null, altNote: null, source: "ember", confidence: "HIGH" },
  { country: "World avg", gCO2ePerKWh: 480, altGCO2ePerKWh: null, altNote: null, source: "ember", confidence: "HIGH" },
];

/** Convenience lookup: country -> lifecycle grid factor. */
export const GRID_BY_COUNTRY: Record<string, number> = Object.fromEntries(
  GRID_FACTORS.map((g) => [g.country, g.gCO2ePerKWh])
);

// ----------------------------------------------------------------------------
// Calculator defaults — see build guide Section 6
// ----------------------------------------------------------------------------

export const CALC_DEFAULTS: CalculatorDefaults = {
  baselineCarFactor: 143,
  railEnergyIntensity: 0.09,
  railEnergyIntensityRange: [0.05, 0.15],
  dieselRailFactor: 70,
  eeaRailAvgFactor: 39,
  shareDivertedFromCar: 0.5,
  avgTripKm: 12,
  carbonPriceSGD: 45, // Singapore carbon tax 2026-2027 (NCCS, verified 18 Jul 2026)
  carbonPriceRangeSGD: [25, 80], // -> S$50-80 target by 2030
  assetLifeYears: 40,
};

// ----------------------------------------------------------------------------
// APAC pipeline. lat/lng are indicative centroids — verify before using in
// any map-critical context. sg-tel updated Jul 2026.
// ----------------------------------------------------------------------------

export const PROJECTS: Project[] = [
  {
    id: "sg-crl",
    name: "Cross Island Line",
    country: "Singapore",
    status: "under-construction",
    value: "~S$300m+ (Siemens CBTC scope ~EUR 310m)",
    lengthKm: 50,
    stations: 21,
    keyDate: "Phase 1 2030, Phase 2 2032",
    lat: 1.35,
    lng: 103.87,
    note: "Trainguard CBTC at GoA 4; Siemens incumbent on signalling.",
    source: "siemens-crl",
    confidence: "HIGH",
  },
  {
    id: "sg-jrl",
    name: "Jurong Region Line",
    country: "Singapore",
    status: "under-construction",
    value: "~EUR 135m (Siemens signalling scope)",
    lengthKm: 24,
    stations: 24,
    keyDate: "Stage 1 mid-2028",
    lat: 1.34,
    lng: 103.7,
    note: "Sirius CBTC, GoA 4, fully elevated; Siemens incumbent.",
    source: "siemens-jrl",
    confidence: "HIGH",
  },
  {
    id: "sg-tel",
    name: "Thomson-East Coast Line",
    country: "Singapore",
    status: "under-construction",
    value: null,
    lengthKm: 43,
    stations: 32,
    keyDate: "Stage 5 2H2026",
    lat: 1.36,
    lng: 103.85,
    note: "Final stages; adjacent opportunity for services/software.",
    source: "lta",
    confidence: "HIGH",
  },
  {
    id: "in-mahsr",
    name: "Mumbai-Ahmedabad HSR",
    country: "India",
    status: "under-construction",
    value: "~US$13bn+ (escalating)",
    lengthKm: 508,
    stations: null,
    keyDate: "Full line Dec 2029",
    lat: 21.0,
    lng: 72.7,
    note: "320 km/h; JICA-financed. Flagship HSR reference in region.",
    source: "pib-in",
    confidence: "HIGH",
  },
  {
    id: "id-whoosh",
    name: "Whoosh Jakarta-Bandung HSR",
    country: "Indonesia",
    status: "operational",
    value: "~US$7.3bn",
    lengthKm: 142.8,
    stations: null,
    keyDate: "Launched Oct 2023",
    lat: -6.55,
    lng: 107.2,
    note: "Financially stressed: show ridership next to operating losses.",
    source: "id-hsr",
    confidence: "HIGH",
  },
  {
    id: "id-jmrt-ew",
    name: "Jakarta MRT East-West",
    country: "Indonesia",
    status: "under-construction",
    value: "~US$10.6bn (all phases)",
    lengthKm: 84,
    stations: null,
    keyDate: "From 2024, phased",
    lat: -6.2,
    lng: 106.85,
    note: "Large multi-phase metro build; systems + rolling stock demand.",
    source: "id-mrt",
    confidence: "MED",
  },
  {
    id: "my-ecrl",
    name: "East Coast Rail Link",
    country: "Malaysia",
    status: "under-construction",
    value: "RM50.27bn",
    lengthKm: 665,
    stations: 20,
    keyDate: "Target 2027 (subject to revision)",
    lat: 3.8,
    lng: 102.5,
    note: "~92% built; China EXIM financed. Near-term commissioning.",
    source: "my-ecrl",
    confidence: "HIGH",
  },
  {
    id: "my-mrt3",
    name: "MRT3 Circle Line (KL)",
    country: "Malaysia",
    status: "approved",
    value: "~RM31bn",
    lengthKm: 51.6,
    stations: 31,
    keyDate: "Operations ~2030",
    lat: 3.14,
    lng: 101.69,
    note: "Approved, pre-tender: live pursuit window for signalling/systems.",
    source: "my-mrt3",
    confidence: "MED",
  },
  {
    id: "my-sg-hsr",
    name: "KL-Singapore HSR",
    country: "Malaysia / Singapore",
    status: "undecided",
    value: "~US$21bn (est.)",
    lengthKm: 350,
    stations: null,
    keyDate: "No government decision as of mid-2026",
    lat: 2.5,
    lng: 102.5,
    note: "Revival premise is private-funded. Treat headlines as speculative.",
    source: "my-sg-hsr",
    confidence: "MED",
  },
  {
    id: "th-china-hsr1",
    name: "Thai-China HSR Phase 1",
    country: "Thailand",
    status: "under-construction",
    value: "~US$5.5bn",
    lengthKm: 250.8,
    stations: null,
    keyDate: "Opening 2030 (risk 2031)",
    lat: 14.5,
    lng: 101.0,
    note: "Bangkok-Nakhon Ratchasima; ETCS-relevant mainline.",
    source: "th-hsr",
    confidence: "HIGH",
  },
  {
    id: "vn-ns-hsr",
    name: "Vietnam North-South HSR",
    country: "Vietnam",
    status: "approved",
    value: "US$67.6bn",
    lengthKm: 1541,
    stations: null,
    keyDate: "Approved Nov 2024; completion 2035",
    lat: 16.0,
    lng: 107.5,
    note: "Largest single pipeline item; state-led after private bid withdrawn.",
    source: "vn-hsr",
    confidence: "HIGH",
  },
  {
    id: "ph-mms",
    name: "Metro Manila Subway",
    country: "Philippines",
    status: "under-construction",
    value: "~PHP 488.5bn",
    lengthKm: 33,
    stations: 17,
    keyDate: "Full ops 2031-32",
    lat: 14.6,
    lng: 121.03,
    note: "JICA-financed; first subway. Delayed by right-of-way.",
    source: "ph-mms",
    confidence: "MED",
  },
  {
    id: "au-mmt",
    name: "Melbourne Metro Tunnel",
    country: "Australia",
    status: "operational",
    value: "A$12.8bn",
    lengthKm: 9,
    stations: 5,
    keyDate: "Opened Nov 2025",
    lat: -37.81,
    lng: 144.96,
    note: "Recently opened; services/upgrade reference in a legislated net-zero market.",
    source: "au-mmt",
    confidence: "HIGH",
  },
  {
    id: "au-inland",
    name: "Inland Rail (Melbourne-Brisbane freight)",
    country: "Australia",
    status: "under-construction",
    value: ">A$45bn",
    lengthKm: 1600,
    stations: null,
    keyDate: "Beveridge-Parkes by 2027; full line >=2036",
    lat: -30.0,
    lng: 148.0,
    note: "Freight decarbonisation angle; northern section paused.",
    source: "au-inland",
    confidence: "HIGH",
  },
];

// ----------------------------------------------------------------------------
// Sources
// ----------------------------------------------------------------------------

export const SOURCES: Source[] = [
  { id: "eea", label: "EEA transport emission factors (EU-27, WtW, 2018)", url: "https://www.eea.europa.eu/publications/transport-and-environment-report-2020" },
  { id: "ember", label: "Ember / Our World in Data — carbon intensity of electricity 2024", url: "https://ourworldindata.org/grapher/carbon-intensity-electricity" },
  { id: "ema", label: "Energy Market Authority Singapore — grid emission factor", url: "https://www.ema.gov.sg" },
  { id: "nccs-tax", label: "NCCS — Singapore carbon tax (verified 18 Jul 2026)", url: "https://www.nccs.gov.sg/singapores-climate-action/mitigation-efforts/carbontax/" },
  { id: "lta", label: "Land Transport Authority Singapore — rail network & LTMP 2040", url: "https://www.lta.gov.sg" },
  { id: "siemens-crl", label: "Siemens Mobility — Cross Island Line CBTC award", url: "https://press.siemens.com/global/en/pressrelease/siemens-mobility-awarded-contract-deliver-cbtc-singapores-8th-longest-fully" },
  { id: "siemens-jrl", label: "Siemens Mobility — Jurong Region Line CBTC award", url: "https://press.siemens.com/global/en/pressrelease/siemens-mobility-install-cbtc-jurong-region-line-singapore" },
  { id: "pib-in", label: "NHSRCL — Mumbai-Ahmedabad HSR project page", url: "https://nhsrcl.in/en/home" },
  { id: "id-hsr", label: "KCIC / Whoosh — official operator site", url: "https://www.kcic.co.id" },
  { id: "id-mrt", label: "PT MRT Jakarta — official project site", url: "https://www.jakartamrt.co.id" },
  { id: "my-ecrl", label: "Malaysia Rail Link — East Coast Rail Link", url: "https://www.mrl.com.my" },
  { id: "my-mrt3", label: "MRT Corp — MRT3 Circle Line", url: "https://www.mymrt.com.my" },
  { id: "my-sg-hsr", label: "Malaysian PM Dept — Johor Bahru–Singapore RTS Link (closest confirmed bilateral project)", url: "https://www.pmo.gov.my" },
  { id: "th-hsr", label: "State Railway of Thailand — Thai-Chinese HSR project", url: "https://www.railway.co.th" },
  { id: "vn-hsr", label: "Vietnam North-South HSR approval (Government Portal)", url: "https://en.baochinhphu.vn" },
  { id: "ph-mms", label: "DOTr Philippines — Metro Manila Subway project", url: "https://www.dotr.gov.ph" },
  { id: "au-mmt", label: "Melbourne Metro Tunnel (Victoria's Big Build)", url: "https://bigbuild.vic.gov.au" },
  { id: "au-inland", label: "Inland Rail (Australian Rail Track Corporation)", url: "https://inlandrail.artc.com.au" },
];

/** Convenience lookup: source id -> url. */
export const SOURCE_URL: Record<string, string> = Object.fromEntries(
  SOURCES.map((s) => [s.id, s.url])
);
