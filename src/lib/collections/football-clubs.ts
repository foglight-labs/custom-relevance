import { buildSeedScores } from "../score-cache";
import type { Collection } from "../types";

/**
 * Ten widely known football clubs spanning trophy history, youth development
 * reputation and playing style, so each factor below splits the set
 * differently. `prompt.context` pins answers to the present day, since a
 * club's identity (squad, manager, style) drifts season to season.
 */
const ITEMS = [
  "Real Madrid",
  "Barcelona",
  "Manchester United",
  "Liverpool",
  "Bayern Munich",
  "Juventus",
  "PSG",
  "Chelsea",
  "Arsenal",
  "AC Milan",
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
  "Real Madrid": [98, 44, 77],
  Barcelona: [97, 87, 85],
  "Manchester United": [97, 57, 48],
  Liverpool: [97, 53, 82],
  "Bayern Munich": [97, 39, 80],
  Juventus: [97, 40, 45],
  PSG: [73, 18, 76],
  Chelsea: [94, 33, 53],
  Arsenal: [95, 65, 78],
  "AC Milan": [96, 43, 65],
};

export const footballClubs: Collection = {
  id: "football-clubs",
  label: "Football Clubs",
  defaultsRevision: 2,
  noun: "football club",
  prompt: {
    template: 'Is this true of the football club "{item}"? {factor}',
    context: "Evaluate the club as it is today.",
  },
  items: ITEMS,
  factors: FACTORS,
  seedScores: buildSeedScores(FACTORS, SEED_VALUES),
};
