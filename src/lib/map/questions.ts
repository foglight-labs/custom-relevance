import type { ScoreQuestion, ScoreResponse } from "@typesafe-ai/sdk";
import type { Country } from "./countries";

/** The rubric every country is scored on, lowest (0) to highest (4). */
export const LEVELS = [
  "Among the lowest in the world",
  "Below the global average",
  "Around the global average",
  "Above the global average",
  "Among the highest in the world",
] as const;

export const MAX_LEVEL = LEVELS.length - 1;

export interface CountryScore {
  key: string;
  name: string;
  /** Jev's expected score on the 0..MAX_LEVEL rubric. */
  score: number;
  confidence: number;
  level: string;
}

export function buildState(factor: string) {
  return { factor };
}

export function buildQuestions(
  countries: Country[],
): Record<string, ScoreQuestion<typeof LEVELS>> {
  return Object.fromEntries(
    countries.map((c) => [
      c.key,
      {
        type: "score",
        instructions: {
          country: c.name,
          question:
            "How does `country` rank on the `factor`, compared with other countries worldwide?",
        },
        criteria: LEVELS,
      },
    ]),
  );
}

export function levelFor(score: number): string {
  return LEVELS[Math.min(MAX_LEVEL, Math.max(0, Math.round(score)))];
}

export function parseAnswers(
  countries: Country[],
  answers: Record<string, ScoreResponse | { type: string } | undefined>,
): CountryScore[] {
  return countries.flatMap((c) => {
    const answer = answers[c.key];
    if (!answer || answer.type !== "score") return [];
    const { score, confidence } = answer as ScoreResponse;
    if (typeof score !== "number") return [];
    return [{ key: c.key, name: c.name, score, confidence, level: levelFor(score) }];
  });
}

/** The rubric score as a 0-100 number for display. */
export function toPercentScore(score: number): number {
  return Math.round((score / MAX_LEVEL) * 100);
}

export function toPercent(value: number): string {
  return `${Math.round(value * 100)}%`;
}
