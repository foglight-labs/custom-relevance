import { buildSeedScores } from "../score-cache";
import type { Collection } from "../types";

/**
 * Ten hardcoded cities, deliberately spread across cost, safety and climate
 * so that changing factors/weights actually reshuffles the ranking. Jev is
 * asked about each one by name only — no profile text, it relies on its own
 * knowledge of the city.
 */
const ITEMS = [
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

const FACTORS: Collection["factors"] = [
  { id: "cheap", text: "Cheap to live in", weight: 3 },
  { id: "safe", text: "Safe to walk at night", weight: 3 },
  { id: "warm", text: "Warm and sunny climate", weight: 2 },
];

/**
 * Precomputed answers for the default items/factors above, so the default
 * ranking renders with zero /api/score requests on first load. [cheap, safe,
 * warm] per city. Values match what Jev returned when this collection
 * shipped; edit a factor's text (or add a new one) to get fresh, live
 * answers instead.
 */
const SEED_VALUES: Record<string, number[]> = {
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

export const cities: Collection = {
  id: "cities",
  label: "Cities",
  noun: "city",
  prompt: {
    template: 'Is this true of the city "{item}"? {factor}',
  },
  items: ITEMS,
  factors: FACTORS,
  seedScores: buildSeedScores(FACTORS, SEED_VALUES),
};
