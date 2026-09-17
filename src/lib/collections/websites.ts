import { buildSeedScores } from "../score-cache";
import type { Collection } from "../types";

/**
 * Ten widely known websites spanning business models (ad-funded, subscription,
 * open/nonprofit, AI), so "free", "privacy" and "useful for learning" each
 * split the set differently. One product per company.
 */
const ITEMS = [
  "YouTube",
  "Instagram",
  "Wikipedia",
  "Claude",
  "LinkedIn",
  "ChatGPT",
  "Netflix",
  "Reddit",
  "X",
  "Spotify",
];

const FACTORS: Collection["factors"] = [
  { id: "free", text: "Free to use", weight: 3 },
  { id: "privacy", text: "Respects user privacy", weight: 3 },
  { id: "learning", text: "Useful for learning", weight: 2 },
];

/**
 * [free, privacy, learning] per website. Values match what Jev returned when
 * this collection shipped; edit a factor's text (or add a new one) to get
 * fresh, live answers instead.
 */
const SEED_VALUES: Record<string, number[]> = {
  YouTube: [92, 41, 83],
  Instagram: [93, 51, 37],
  Wikipedia: [93, 60, 94],
  Claude: [49, 71, 57],
  LinkedIn: [87, 62, 77],
  ChatGPT: [67, 54, 75],
  Netflix: [4, 61, 34],
  Reddit: [94, 49, 63],
  X: [74, 44, 38],
  Spotify: [79, 63, 41],
};

export const websites: Collection = {
  id: "websites",
  label: "Websites",
  defaultsRevision: 2,
  noun: "website",
  prompt: {
    template: 'Is this true of the website "{item}"? {factor}',
  },
  items: ITEMS,
  factors: FACTORS,
  seedScores: buildSeedScores(FACTORS, SEED_VALUES),
};
