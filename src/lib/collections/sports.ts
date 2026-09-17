import { buildSeedScores } from "../score-cache";
import type { Collection } from "../types";

/**
 * Ten sports that each have a dedicated ball/equipment emoji, spanning cost,
 * contact and cardio demand so each factor below splits the set differently.
 * Jev is asked about the bare sport name (see `bareItemName`).
 */
const ITEMS = [
  "⚽ Football",
  "🏀 Basketball",
  "🏈 American football",
  "⚾ Baseball",
  "🎾 Tennis",
  "🏐 Volleyball",
  "🏉 Rugby",
  "🏏 Cricket",
  "⛳ Golf",
  "🥊 Boxing",
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
  "⚽ Football": [73, 15, 75],
  "🏀 Basketball": [66, 23, 72],
  "🏈 American football": [29, 7, 34],
  "⚾ Baseball": [56, 28, 44],
  "🎾 Tennis": [43, 30, 82],
  "🏐 Volleyball": [71, 46, 71],
  "🏉 Rugby": [49, 9, 74],
  "🏏 Cricket": [58, 38, 53],
  "⛳ Golf": [27, 62, 26],
  "🥊 Boxing": [46, 7, 87],
};

export const sports: Collection = {
  id: "sports",
  label: "Sports",
  defaultsRevision: 2,
  noun: "sport",
  prompt: {
    template: 'Is this true of the sport "{item}"? {factor}',
  },
  items: ITEMS,
  factors: FACTORS,
  seedScores: buildSeedScores(FACTORS, SEED_VALUES),
};
