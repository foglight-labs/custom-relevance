import type { CellState, Factor, ScoreCache } from "./types";

/**
 * Normalizes factor text into a cache key. Matches the dedupe rule in
 * `useRanking.addFactor` (case-insensitive), plus trimming so incidental
 * whitespace doesn't create a spurious cache miss.
 */
export function cacheKey(factorText: string): string {
  return factorText.trim().toLowerCase();
}

/**
 * Builds a collection's `seedScores` from a plain items -> per-factor-value
 * array, in the same order as `factors`. Keeps each category's data file
 * free of the cache-key plumbing.
 */
export function buildSeedScores(factors: Factor[], values: Record<string, number[]>): ScoreCache {
  return Object.fromEntries(
    Object.entries(values).map(([itemName, itemValues]) => [
      itemName,
      Object.fromEntries(
        factors.map((factor, i) => [cacheKey(factor.text), itemValues[i]]),
      ),
    ]),
  );
}

/** Looks up a cached value for (item, factor text) across caches, first match wins. */
export function lookupScore(
  caches: ScoreCache[],
  itemName: string,
  factorText: string,
): number | undefined {
  const key = cacheKey(factorText);
  for (const cache of caches) {
    const value = cache[itemName]?.[key];
    if (value !== undefined) return value;
  }
  return undefined;
}

/** Returns a new cache with (item, factor text) -> value recorded. */
export function withScore(
  cache: ScoreCache,
  itemName: string,
  factorText: string,
  value: number,
): ScoreCache {
  const key = cacheKey(factorText);
  return {
    ...cache,
    [itemName]: { ...(cache[itemName] ?? {}), [key]: value },
  };
}

export interface CellHit {
  itemName: string;
  factorId: string;
  value: number;
}

/**
 * Splits every (item, factor) pair that has never been fetched (no entry in
 * `cellsByItem` yet) into cache hits, which can be applied immediately, and
 * misses, which still need a live request. `caches` is checked in order, so
 * pass the persisted cache before any collection seed data.
 */
export function partitionCells(
  items: string[],
  factors: Factor[],
  cellsByItem: Record<string, Record<string, CellState>>,
  caches: ScoreCache[],
): { hits: CellHit[]; misses: Record<string, Factor[]> } {
  const hits: CellHit[] = [];
  const misses: Record<string, Factor[]> = {};

  for (const itemName of items) {
    const existing = cellsByItem[itemName] ?? {};
    for (const factor of factors) {
      if (existing[factor.id]) continue; // already fetched, loading, or errored
      const cached = lookupScore(caches, itemName, factor.text);
      if (cached !== undefined) {
        hits.push({ itemName, factorId: factor.id, value: cached });
      } else {
        (misses[itemName] ??= []).push(factor);
      }
    }
  }

  return { hits, misses };
}
