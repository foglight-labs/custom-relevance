import type { Collection } from "./types";

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
  },
];
