import { buildSeedScores } from "../score-cache";
import type { Collection } from "../types";

/**
 * Ten football clubs spanning trophy history, youth development reputation
 * and playing style, so each factor below splits the set differently.
 * `prompt.context` pins answers to the present day, since a club's identity
 * (squad, manager, style) drifts season to season.
 */
const ITEMS = [
  "Real Madrid",
  "Manchester City",
  "Bayern Munich",
  "Ajax",
  "Boca Juniors",
  "Celtic",
  "Athletic Bilbao",
  "Paris Saint-Germain",
  "Borussia Dortmund",
  "Inter Miami",
];

const FACTORS: Collection["factors"] = [
  { id: "trophies", text: "Rich history of trophies", weight: 3 },
  { id: "homegrown", text: "Known for developing homegrown players", weight: 3 },
  { id: "attacking", text: "Plays attractive attacking football", weight: 2 },
];

/**
 * [trophies, homegrown, attacking] per club. Values match what Jev returned
 * when this collection shipped; edit a factor's text (or add a new one) to
 * get fresh, live answers instead.
 */
const SEED_VALUES: Record<string, number[]> = {
  "Real Madrid": [98, 44, 76],
  "Manchester City": [84, 34, 92],
  "Bayern Munich": [97, 38, 80],
  Ajax: [95, 92, 84],
  "Boca Juniors": [96, 80, 52],
  Celtic: [96, 59, 74],
  "Athletic Bilbao": [66, 96, 50],
  "Paris Saint-Germain": [81, 17, 78],
  "Borussia Dortmund": [80, 81, 81],
  "Inter Miami": [12, 20, 63],
};

export const footballClubs: Collection = {
  id: "football-clubs",
  label: "Football Clubs",
  noun: "football club",
  prompt: {
    template: 'Is this true of the football club "{item}"? {factor}',
    context: "Evaluate the club as it is today.",
  },
  items: ITEMS,
  factors: FACTORS,
  seedScores: buildSeedScores(FACTORS, SEED_VALUES),
};
