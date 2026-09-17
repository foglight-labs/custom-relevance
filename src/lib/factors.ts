import type { FactorDef } from "./types";

/**
 * Preset factor library. Each one becomes a single isolated Jev question
 * (Score or Noul) evaluated against a city's profile text. Cost of Living and
 * Safety are enabled by default — the "fixed schema" baseline the reranking
 * story compares against once a query and extra factors are introduced.
 */
export const PRESET_FACTORS: FactorDef[] = [
  {
    id: "cost_of_living",
    title: "Cost of Living",
    summary: "Cheaper is better",
    kind: "score",
    direction: "lower-is-better",
    origin: "preset",
    color: "amber",
    instructions:
      "How expensive is it to live in this city day-to-day (rent, groceries, dining out, transport)?",
    levels: [
      { label: "Very cheap" },
      { label: "Cheap" },
      { label: "Moderate" },
      { label: "Expensive" },
      { label: "Very expensive" },
    ],
  },
  {
    id: "safety",
    title: "Safety",
    summary: "Higher is better",
    kind: "score",
    direction: "higher-is-better",
    origin: "preset",
    color: "emerald",
    instructions:
      "How safe does this city feel for a resident walking around, including at night?",
    levels: [
      { label: "Not safe" },
      { label: "Somewhat unsafe" },
      { label: "Mixed by area" },
      { label: "Safe" },
      { label: "Very safe" },
    ],
  },
  {
    id: "climate_warmth",
    title: "Climate Warmth",
    summary: "Warmer & sunnier is better",
    kind: "score",
    direction: "higher-is-better",
    origin: "preset",
    color: "orange",
    instructions:
      "How warm and sunny is this city's overall climate, considering both summer and winter?",
    levels: [
      { label: "Cold / harsh" },
      { label: "Cool" },
      { label: "Mild / temperate" },
      { label: "Warm" },
      { label: "Hot & sunny" },
    ],
  },
  {
    id: "food_scene",
    title: "Food Scene",
    summary: "Higher is better",
    kind: "score",
    direction: "higher-is-better",
    origin: "preset",
    color: "rose",
    instructions:
      "How strong and varied is this city's food and dining scene?",
    levels: [
      { label: "Very limited" },
      { label: "Basic" },
      { label: "Decent" },
      { label: "Great" },
      { label: "World-class" },
    ],
  },
  {
    id: "walkability",
    title: "Walkability",
    summary: "Higher is better",
    kind: "score",
    direction: "higher-is-better",
    origin: "preset",
    color: "sky",
    instructions:
      "How easy and pleasant is it to get around this city on foot day-to-day?",
    levels: [
      { label: "Car-dependent" },
      { label: "Mostly car-dependent" },
      { label: "Somewhat walkable" },
      { label: "Walkable" },
      { label: "Extremely walkable" },
    ],
  },
  {
    id: "nightlife",
    title: "Nightlife",
    summary: "Higher is better",
    kind: "score",
    direction: "higher-is-better",
    origin: "preset",
    color: "fuchsia",
    instructions:
      "How strong is this city's nightlife (bars, clubs, live music, late-night culture)?",
    levels: [
      { label: "Very quiet" },
      { label: "Modest" },
      { label: "Decent" },
      { label: "Lively" },
      { label: "Legendary" },
    ],
  },
  {
    id: "nature_access",
    title: "Nature Access",
    summary: "Higher is better",
    kind: "score",
    direction: "higher-is-better",
    origin: "preset",
    color: "lime",
    instructions:
      "How easy is it to access nature (parks, mountains, coast, wilderness) from this city?",
    levels: [
      { label: "Very limited" },
      { label: "Some parks" },
      { label: "Decent access" },
      { label: "Good access" },
      { label: "Exceptional access" },
    ],
  },
  {
    id: "english_friendliness",
    title: "English-Friendliness",
    summary: "Higher is better",
    kind: "score",
    direction: "higher-is-better",
    origin: "preset",
    color: "indigo",
    instructions:
      "How easy would it be for an English-only speaker to get by day-to-day in this city?",
    levels: [
      { label: "Very hard" },
      { label: "Hard" },
      { label: "Manageable" },
      { label: "Easy" },
      { label: "Effortless" },
    ],
  },
  {
    id: "public_transit",
    title: "Public Transit",
    summary: "Higher is better",
    kind: "score",
    direction: "higher-is-better",
    origin: "preset",
    color: "cyan",
    instructions:
      "How good is this city's public transit for getting around without a car?",
    levels: [
      { label: "Very poor" },
      { label: "Limited" },
      { label: "Adequate" },
      { label: "Good" },
      { label: "Excellent" },
    ],
  },
  {
    id: "remote_work_friendliness",
    title: "Remote-Work Friendly",
    summary: "Higher is better",
    kind: "score",
    direction: "higher-is-better",
    origin: "preset",
    color: "violet",
    instructions:
      "How well does this city support remote workers (fast internet, coworking spaces, cafe culture, a nomad/remote community)?",
    levels: [
      { label: "Not set up for it" },
      { label: "Limited support" },
      { label: "Workable" },
      { label: "Well supported" },
      { label: "Ideal for remote work" },
    ],
  },
];

export const DEFAULT_ENABLED_IDS = new Set(["cost_of_living", "safety"]);

export const FACTOR_COLORS = [
  "amber",
  "emerald",
  "orange",
  "rose",
  "sky",
  "fuchsia",
  "lime",
  "indigo",
  "cyan",
  "violet",
  "teal",
  "pink",
] as const;

/** Builds the query-relevance factor: a Noul question scoped to the user's free-text query. */
export function buildQueryFactor(query: string): FactorDef {
  const trimmed = query.trim();
  return {
    id: "query_relevance",
    title: "Query Match",
    summary: `Matches: "${trimmed}"`,
    kind: "noul",
    direction: "higher-is-better",
    origin: "query",
    color: "blue",
    instructions: `Someone searching for a city said: "${trimmed}". Based only on this city's profile, could this city be a good match for what they're looking for?`,
    noulCriteria: {
      true: "The city's profile clearly supports what the searcher is looking for.",
      false: "The city's profile does not support it, or contradicts it.",
    },
  };
}
