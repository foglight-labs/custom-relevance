import { buildSeedScores } from "../score-cache";
import type { Collection } from "../types";

/**
 * Ten sports spanning cost, contact and cardio demand, so each factor below
 * splits the set differently.
 */
const ITEMS = [
  "Football",
  "Basketball",
  "Tennis",
  "Golf",
  "Swimming",
  "Chess",
  "Boxing",
  "Formula 1",
  "Cricket",
  "Rock Climbing",
];

const FACTORS: Collection["factors"] = [
  { id: "cheap_to_start", text: "Cheap to start playing", weight: 3 },
  { id: "low_injury_risk", text: "Low injury risk", weight: 2 },
  { id: "cardio", text: "Great cardio workout", weight: 3 },
];

/**
 * [cheap_to_start, low_injury_risk, cardio] per sport. Values match what Jev
 * returned when this collection shipped; edit a factor's text (or add a new
 * one) to get fresh, live answers instead.
 */
const SEED_VALUES: Record<string, number[]> = {
  Football: [75, 16, 75],
  Basketball: [68, 22, 76],
  Tennis: [42, 30, 83],
  Golf: [30, 65, 26],
  Swimming: [61, 55, 95],
  Chess: [89, 95, 5],
  Boxing: [50, 7, 87],
  "Formula 1": [6, 13, 46],
  Cricket: [58, 36, 54],
  "Rock Climbing": [35, 18, 66],
};

export const sports: Collection = {
  id: "sports",
  label: "Sports",
  noun: "sport",
  prompt: {
    template: 'Is this true of the sport "{item}"? {factor}',
  },
  items: ITEMS,
  factors: FACTORS,
  seedScores: buildSeedScores(FACTORS, SEED_VALUES),
};
