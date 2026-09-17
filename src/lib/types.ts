/**
 * Shared domain types for the Jev reranking playground.
 *
 * A "factor" is one typed question sent to Jev (Score or Noul). Every enabled
 * factor becomes a column in the table; every city becomes a row. The raw
 * per-factor answers Jev returns are normalized to 0-1 in the browser and
 * combined with user-chosen weights to produce the final ranking. Jev never
 * sees the weights or the formula: it only ever answers one isolated question
 * per factor, exactly as the "composite scoring" pattern recommends.
 */

export type FactorKind = "score" | "noul";

/** Whether a higher raw answer is good (safety) or bad (cost of living). */
export type FactorDirection = "higher-is-better" | "lower-is-better";

export interface ScoreCriterion {
  /** Short label shown in tooltips/legends, e.g. "Very expensive". */
  label: string;
}

/**
 * A single factor definition: the question Jev is asked, independent of any
 * particular city. The same definition is reused for every row.
 */
export interface FactorDef {
  id: string;
  /** Column header. */
  title: string;
  /** One-line description shown under the header / in the add-factor list. */
  summary: string;
  kind: FactorKind;
  direction: FactorDirection;
  /** The question text sent to Jev as `instructions`. */
  instructions: string;
  /** Score levels, low to high (only for kind: "score"). Min 2, max 10. */
  levels?: ScoreCriterion[];
  /** Noul true/false descriptions (only for kind: "noul"). */
  noulCriteria?: { true: string; false: string };
  /** Preset factors ship with the app; custom ones are user-authored this session. */
  origin: "preset" | "custom" | "query";
  /** Accent color used for the column header + weight chip. */
  color: string;
}

/** Per-factor knobs the user controls entirely client-side. */
export interface FactorWeightState {
  factorId: string;
  enabled: boolean;
  /** 0-100 slider value. */
  weight: number;
}

export interface City {
  id: string;
  name: string;
  country: string;
  flag: string;
  population: string;
  /** ~100-150 word neutral profile: the `state` Jev evaluates every factor against. */
  profile: string;
}

/** Raw Jev answer for one (city, factor) cell, normalized for scoring. */
export interface FactorAnswer {
  factorId: string;
  cityId: string;
  kind: FactorKind;
  /** Raw score (0..levels-1) or noul (0..1) as returned by Jev. */
  raw: number;
  confidence: number;
  /** Probability distribution, keyed by level index (score) or "true"/"false" (noul). */
  probabilities: Record<string, number>;
  legend?: Record<string, string>;
  /** Raw value normalized to 0-1, direction-adjusted. This is what the formula consumes. */
  normalized: number;
}

export type CellStatus = "idle" | "loading" | "ready" | "error";

export interface CellState {
  status: CellStatus;
  answer?: FactorAnswer;
  error?: string;
}

export interface RowResult {
  cityId: string;
  status: CellStatus;
  latencyMs?: number;
  error?: string;
  cells: Record<string, CellState>;
  /** Weighted composite score, 0-1, once all enabled cells are ready. */
  total: number | null;
  rank: number | null;
  baselineRank: number | null;
}

/** Payload shape sent from the client to /api/score for one city. */
export interface ScoreRequestFactor {
  id: string;
  kind: FactorKind;
  instructions: string;
  levels?: string[];
  noulCriteria?: { true: string; false: string };
}

export interface ScoreRequestBody {
  cityId: string;
  cityName: string;
  cityProfile: string;
  query: string;
  factors: ScoreRequestFactor[];
}

export interface ScoreResponseBody {
  cityId: string;
  model: string;
  latencyMs: number;
  usage: { inputTokens: number; outputTokens: number };
  answers: Record<
    string,
    {
      kind: FactorKind;
      raw: number;
      confidence: number;
      probabilities: Record<string, number>;
      legend?: Record<string, string>;
    }
  >;
}

export interface ScoreErrorBody {
  cityId: string;
  error: string;
  code: "rate_limited" | "overloaded" | "invalid" | "connection" | "unknown";
  retryAfterMs?: number;
}
