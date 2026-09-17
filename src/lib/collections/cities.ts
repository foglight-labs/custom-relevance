import { buildSeedScores } from "../score-cache";
import type { Collection } from "../types";

/**
 * Ten cities, each prefixed with its national flag for the table. Jev is
 * asked about the bare city name (see `bareItemName`) — no profile text, it
 * relies on its own knowledge of the city. Spread across cost, safety and
 * climate so that changing factors/weights actually reshuffles the ranking.
 */
const ITEMS = [
  "🇦🇲 Yerevan",
  "🇺🇸 San Francisco",
  "🇬🇧 London",
  "🇪🇸 Barcelona",
  "🇳🇱 Amsterdam",
  "🇵🇹 Porto",
  "🇺🇾 Montevideo",
  "🇮🇹 Rome",
  "🇸🇬 Singapore",
  "🇦🇪 Dubai",
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
  "🇦🇲 Yerevan": [68, 62, 54],
  "🇺🇸 San Francisco": [5, 41, 39],
  "🇬🇧 London": [12, 58, 16],
  "🇪🇸 Barcelona": [32, 58, 82],
  "🇳🇱 Amsterdam": [21, 69, 18],
  "🇵🇹 Porto": [62, 65, 46],
  "🇺🇾 Montevideo": [51, 50, 59],
  "🇮🇹 Rome": [30, 50, 64],
  "🇸🇬 Singapore": [11, 82, 86],
  "🇦🇪 Dubai": [14, 75, 94],
};

export const cities: Collection = {
  id: "cities",
  label: "Cities",
  defaultsRevision: 2,
  noun: "city",
  prompt: {
    template: 'Is this true of the city "{item}"? {factor}',
  },
  items: ITEMS,
  factors: FACTORS,
  seedScores: buildSeedScores(FACTORS, SEED_VALUES),
};
