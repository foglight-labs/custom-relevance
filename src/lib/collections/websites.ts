import { buildSeedScores } from "../score-cache";
import type { Collection } from "../types";

/**
 * Ten widely known websites spanning business models (ad-funded, subscription,
 * open/nonprofit), so "free", "privacy" and "useful for learning" each split
 * the set differently.
 */
const ITEMS = [
  "Wikipedia",
  "YouTube",
  "Reddit",
  "Amazon",
  "GitHub",
  "Netflix",
  "Craigslist",
  "Stack Overflow",
  "TikTok",
  "BBC News",
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
  Wikipedia: [94, 58, 95],
  YouTube: [93, 41, 83],
  Reddit: [94, 49, 64],
  Amazon: [62, 50, 42],
  GitHub: [83, 60, 86],
  Netflix: [4, 60, 35],
  Craigslist: [76, 45, 35],
  "Stack Overflow": [91, 62, 92],
  TikTok: [94, 38, 49],
  "BBC News": [84, 73, 84],
};

export const websites: Collection = {
  id: "websites",
  label: "Websites",
  noun: "website",
  prompt: {
    template: 'Is this true of the website "{item}"? {factor}',
  },
  items: ITEMS,
  factors: FACTORS,
  seedScores: buildSeedScores(FACTORS, SEED_VALUES),
};
