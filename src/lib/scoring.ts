import type { FactorAnswer, FactorDef, FactorDirection } from "./types";

/**
 * Normalize a raw Jev answer to 0-1, flipping the axis for
 * "lower-is-better" factors so every normalized value can be summed the
 * same way: bigger normalized value always means "better" for the query.
 */
export function normalizeRaw(
  raw: number,
  kind: "score" | "noul",
  direction: FactorDirection,
  levelCount?: number,
): number {
  let value: number;
  if (kind === "noul") {
    value = clamp01(raw);
  } else {
    const top = Math.max((levelCount ?? 2) - 1, 1);
    value = clamp01(raw / top);
  }
  return direction === "lower-is-better" ? 1 - value : value;
}

export function clamp01(n: number): number {
  if (Number.isNaN(n)) return 0;
  return Math.min(1, Math.max(0, n));
}

export interface WeightInput {
  factorId: string;
  weight: number;
}

/**
 * Weighted average of normalized 0-1 factor values. Missing/unready cells
 * are excluded from both numerator and denominator rather than treated as 0,
 * so a slow factor doesn't drag rows down before it has finished loading.
 */
export function compositeScore(
  normalizedByFactor: Record<string, number | undefined>,
  weights: WeightInput[],
): number | null {
  let weightSum = 0;
  let valueSum = 0;
  let anyReady = false;
  for (const { factorId, weight } of weights) {
    if (weight <= 0) continue;
    const value = normalizedByFactor[factorId];
    if (value === undefined) continue;
    anyReady = true;
    weightSum += weight;
    valueSum += value * weight;
  }
  if (!anyReady || weightSum === 0) return null;
  return valueSum / weightSum;
}

export interface RankedRow {
  id: string;
  total: number | null;
}

/** Ranks rows by total descending; nulls (still loading) sort last, unranked. */
export function rankRows<T extends RankedRow>(
  rows: T[],
): Array<T & { rank: number | null }> {
  const ranked = rows.filter((r) => r.total !== null).sort((a, b) => (b.total as number) - (a.total as number));
  const unranked = rows.filter((r) => r.total === null);
  const withRank = ranked.map((r, i) => ({ ...r, rank: i + 1 }));
  const withoutRank = unranked.map((r) => ({ ...r, rank: null }));
  return [...withRank, ...withoutRank];
}

/** Positive = moved up (improved) relative to baseline; negative = moved down. */
export function rankDelta(
  currentRank: number | null,
  baselineRank: number | null,
): number | null {
  if (currentRank === null || baselineRank === null) return null;
  return baselineRank - currentRank;
}

export const LOW_CONFIDENCE_THRESHOLD = 0.5;

export function isLowConfidence(answer: FactorAnswer | undefined): boolean {
  if (!answer) return false;
  return answer.confidence < LOW_CONFIDENCE_THRESHOLD;
}

/** Builds the `= 0.4·(1 − cost) + 0.3·safety + ...` formula-bar string. */
export function formatFormula(
  factors: FactorDef[],
  weights: Record<string, { enabled: boolean; weight: number }>,
): string {
  const active = factors.filter((f) => weights[f.id]?.enabled && weights[f.id].weight > 0);
  if (active.length === 0) return "= (no factors selected)";
  const weightSum = active.reduce((s, f) => s + weights[f.id].weight, 0);
  const terms = active.map((f) => {
    const w = weights[f.id].weight;
    const coeff = weightSum > 0 ? (w / weightSum).toFixed(2) : "0.00";
    const varName = shortVar(f);
    const term = f.direction === "lower-is-better" ? `(1 − ${varName})` : varName;
    return `${coeff}·${term}`;
  });
  return `= ${terms.join(" + ")}`;
}

function shortVar(f: FactorDef): string {
  return f.id
    .split("_")
    .map((p) => p[0])
    .join("")
    .slice(0, 4);
}
