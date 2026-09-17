import { buildSeedScores } from "../score-cache";
import type { Collection } from "../types";

/**
 * Ten dishes with a distinct food emoji each, spanning cuisines so "quick to
 * cook", "healthy" and "spicy" each split the set differently. Jev is asked
 * about the bare dish name (see `bareItemName`).
 */
const ITEMS = [
  "🍕 Pizza",
  "🍔 Burger",
  "🍣 Sushi",
  "🌮 Tacos",
  "🍜 Ramen",
  "🍝 Pasta",
  "🥗 Salad",
  "🥟 Dumplings",
  "🍛 Curry",
  "🥩 Steak",
];

const FACTORS: Collection["factors"] = [
  { id: "quick", text: "Quick to cook at home", weight: 3 },
  { id: "healthy", text: "Healthy and light", weight: 3 },
  { id: "spicy", text: "Spicy", weight: 2 },
];

/**
 * [quick, healthy, spicy] per dish. Values match what Jev returned when this
 * collection shipped; edit a factor's text (or add a new one) to get fresh,
 * live answers instead.
 */
const SEED_VALUES: Record<string, number[]> = {
  "🍕 Pizza": [48, 12, 31],
  "🍔 Burger": [68, 11, 24],
  "🍣 Sushi": [30, 68, 24],
  "🌮 Tacos": [70, 20, 46],
  "🍜 Ramen": [57, 12, 34],
  "🍝 Pasta": [62, 21, 22],
  "🥗 Salad": [61, 85, 18],
  "🥟 Dumplings": [60, 24, 26],
  "🍛 Curry": [36, 17, 75],
  "🥩 Steak": [52, 16, 17],
};

export const dishes: Collection = {
  id: "dishes",
  label: "Dishes",
  defaultsRevision: 2,
  noun: "dish",
  prompt: {
    template: 'Is this true of the dish "{item}"? {factor}',
  },
  items: ITEMS,
  factors: FACTORS,
  seedScores: buildSeedScores(FACTORS, SEED_VALUES),
};
