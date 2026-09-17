import { buildSeedScores } from "../score-cache";
import type { Collection } from "../types";

/**
 * Ten dishes spanning cuisines and cook times, so "quick to cook", "healthy"
 * and "spicy" each split the set differently.
 */
const ITEMS = [
  "Pad Thai",
  "Margherita Pizza",
  "Sushi",
  "Beef Wellington",
  "Khachapuri",
  "Pho",
  "Tacos al Pastor",
  "Ratatouille",
  "Biryani",
  "Caesar Salad",
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
  "Pad Thai": [54, 16, 26],
  "Margherita Pizza": [61, 25, 7],
  Sushi: [31, 68, 23],
  "Beef Wellington": [7, 5, 9],
  Khachapuri: [37, 11, 14],
  Pho: [21, 38, 25],
  "Tacos al Pastor": [41, 11, 57],
  Ratatouille: [29, 84, 14],
  Biryani: [13, 10, 65],
  "Caesar Salad": [63, 35, 9],
};

export const dishes: Collection = {
  id: "dishes",
  label: "Dishes",
  noun: "dish",
  prompt: {
    template: 'Is this true of the dish "{item}"? {factor}',
  },
  items: ITEMS,
  factors: FACTORS,
  seedScores: buildSeedScores(FACTORS, SEED_VALUES),
};
