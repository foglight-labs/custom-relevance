import { cacheKey } from "./score-cache";
import type { Collection, ScoreCache } from "./types";

/**
 * Ten hardcoded cities, deliberately spread across cost, safety and climate
 * so that changing factors/weights actually reshuffles the ranking. Jev is
 * asked about each one by name only — no profile text, it relies on its own
 * knowledge of the city.
 */
const DEFAULT_CITIES = [
  "Yerevan",
  "Tbilisi",
  "Lisbon",
  "Tokyo",
  "Mexico City",
  "Reykjavik",
  "Nairobi",
  "Melbourne",
  "Prague",
  "Buenos Aires",
];

const DEFAULT_CITY_FACTORS: Collection["factors"] = [
  { id: "cheap", text: "Cheap to live in", weight: 3 },
  { id: "safe", text: "Safe to walk at night", weight: 3 },
  { id: "warm", text: "Warm and sunny climate", weight: 2 },
];

/**
 * Precomputed answers for the default cities/factors above, so the default
 * ranking renders with zero /api/score requests on first load. [cheap, safe,
 * warm] per city, in DEFAULT_CITIES order. Values match what Jev returned
 * when this collection shipped; edit a factor's text (or add a new one) to
 * get fresh, live answers instead.
 */
const DEFAULT_CITY_SEED_VALUES: Record<string, [number, number, number]> = {
  Yerevan: [70, 62, 53],
  Tbilisi: [71, 56, 53],
  Lisbon: [46, 59, 81],
  Tokyo: [12, 76, 32],
  "Mexico City": [55, 31, 45],
  Reykjavik: [16, 82, 5],
  Nairobi: [55, 26, 69],
  Melbourne: [23, 55, 33],
  Prague: [53, 68, 17],
  "Buenos Aires": [51, 36, 47],
};

const DEFAULT_CITY_SEED_SCORES: ScoreCache = Object.fromEntries(
  Object.entries(DEFAULT_CITY_SEED_VALUES).map(([city, [cheap, safe, warm]]) => [
    city,
    {
      [cacheKey(DEFAULT_CITY_FACTORS[0].text)]: cheap,
      [cacheKey(DEFAULT_CITY_FACTORS[1].text)]: safe,
      [cacheKey(DEFAULT_CITY_FACTORS[2].text)]: warm,
    },
  ]),
);

/**
 * Collections the switcher can pick between. Cities is the only one that
 * ships today; a second use case is a data-only addition here.
 */
export const COLLECTIONS: Collection[] = [
  {
    id: "cities",
    label: "Cities",
    noun: "city",
    items: DEFAULT_CITIES,
    factors: DEFAULT_CITY_FACTORS,
    seedScores: DEFAULT_CITY_SEED_SCORES,
  },
];
