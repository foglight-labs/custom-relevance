import { cacheKey } from "../score-cache";
import type { Country } from "./countries";
import { levelFor, type CountryScore } from "./questions";

/** Bump when the rubric or prompt changes, so stale answers are ignored. */
export const MAP_CACHE_STORAGE_KEY = "jev-map:v1";
export const MAP_CACHE_LIMIT = 20;

/** [country key, score, confidence], compact so 20 maps stay well under storage quotas. */
type StoredScore = [string, number, number];

interface StoredEntry {
  factor: string;
  savedAt: number;
  scores: StoredScore[];
}

/** Normalized factor -> entry. */
export type MapCache = Record<string, StoredEntry>;

export function parseMapCache(raw: string | null): MapCache {
  if (!raw) return {};
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) return {};
    const cache: MapCache = {};
    for (const [key, entry] of Object.entries(parsed as Record<string, unknown>)) {
      const e = entry as Partial<StoredEntry> | null;
      if (
        e &&
        typeof e.factor === "string" &&
        typeof e.savedAt === "number" &&
        Array.isArray(e.scores)
      ) {
        cache[key] = { factor: e.factor, savedAt: e.savedAt, scores: e.scores };
      }
    }
    return cache;
  } catch {
    return {};
  }
}

export function readCachedScores(
  cache: MapCache,
  factor: string,
  countries: Country[],
): CountryScore[] | null {
  const entry = cache[cacheKey(factor)];
  if (!entry) return null;
  const names = new Map(countries.map((c) => [c.key, c.name]));
  const scores: CountryScore[] = [];
  for (const item of entry.scores) {
    if (!Array.isArray(item) || item.length !== 3) continue;
    const [key, score, confidence] = item;
    const name = names.get(key);
    if (name === undefined || typeof score !== "number" || typeof confidence !== "number") continue;
    scores.push({ key, name, score, confidence, level: levelFor(score) });
  }
  return scores.length > 0 ? scores : null;
}

/** Adds (or refreshes) one factor's scores, keeping only the most recent entries. */
export function withCachedScores(
  cache: MapCache,
  factor: string,
  scores: CountryScore[],
  now: number,
  limit = MAP_CACHE_LIMIT,
): MapCache {
  const next: MapCache = {
    ...cache,
    [cacheKey(factor)]: {
      factor,
      savedAt: now,
      scores: scores.map((s) => [s.key, s.score, s.confidence]),
    },
  };
  const keep = Object.entries(next)
    .sort(([, a], [, b]) => b.savedAt - a.savedAt)
    .slice(0, limit);
  return Object.fromEntries(keep);
}

export function loadMapCache(): MapCache {
  if (typeof window === "undefined") return {};
  try {
    return parseMapCache(window.localStorage.getItem(MAP_CACHE_STORAGE_KEY));
  } catch {
    return {};
  }
}

export function saveMapCache(cache: MapCache) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(MAP_CACHE_STORAGE_KEY, JSON.stringify(cache));
  } catch {
    // localStorage unavailable (private mode, quota). Maps just won't persist.
  }
}
