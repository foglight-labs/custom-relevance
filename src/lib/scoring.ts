export interface WeightInput {
  factorId: string;
  weight: number;
}

/**
 * Weighted average of 0-100 factor values. Missing/unready cells are
 * excluded from both numerator and denominator rather than treated as 0,
 * so a slow factor doesn't drag rows down before it has finished loading.
 */
export function compositeScore(
  values: Record<string, number | undefined>,
  weights: WeightInput[],
): number | null {
  let weightSum = 0;
  let valueSum = 0;
  let anyReady = false;
  for (const { factorId, weight } of weights) {
    if (weight <= 0) continue;
    const value = values[factorId];
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
