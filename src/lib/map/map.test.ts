import { interpolateRdYlGn } from "d3-scale-chromatic";
import { describe, expect, it } from "vitest";
import { MAP_CACHE_LIMIT, parseMapCache, readCachedScores, withCachedScores } from "./cache";
import { NO_DATA_COLOR, relativeColorScale } from "./color";
import { COUNTRIES, toKey } from "./countries";
import { LEVELS, buildQuestions, buildState, parseAnswers, toPercentScore } from "./questions";

describe("countries", () => {
  it("excludes Antarctica and expands abbreviated names", () => {
    const names = COUNTRIES.map((c) => c.name);
    expect(COUNTRIES).toHaveLength(176);
    expect(names).not.toContain("Antarctica");
    expect(names).toContain("Democratic Republic of the Congo");
    expect(names).toContain("Bosnia and Herzegovina");
    expect(names).not.toContain("Dem. Rep. Congo");
  });

  it("has unique keys", () => {
    const keys = new Set(COUNTRIES.map((c) => c.key));
    expect(keys.size).toBe(COUNTRIES.length);
  });

  it("slugifies names", () => {
    expect(toKey("Côte d'Ivoire")).toBe("cote-d-ivoire");
  });
});

describe("jev request", () => {
  it("puts the factor in state and one score question per country", () => {
    const sample = COUNTRIES.slice(0, 3);
    expect(buildState("street food")).toEqual({ factor: "street food" });
    const questions = buildQuestions(sample);
    expect(Object.keys(questions)).toEqual(sample.map((c) => c.key));
    const q = questions[sample[0].key];
    expect(q.type).toBe("score");
    expect(q.criteria).toEqual(LEVELS);
    expect(q.instructions).toMatchObject({ country: sample[0].name });
  });
});

const countries = [
  { key: "a", name: "A" },
  { key: "b", name: "B" },
  { key: "c", name: "C" },
];

const answer = (score: number, confidence: number) => ({
  type: "score" as const,
  score,
  confidence,
  legend: {},
  probabilities: {},
});

describe("parseAnswers", () => {
  it("maps answers, picks the nearest level, and skips missing ones", () => {
    const result = parseAnswers(countries, { a: answer(3.6, 0.8), b: answer(0.2, 0.5) });
    expect(result).toEqual([
      { key: "a", name: "A", score: 3.6, confidence: 0.8, level: LEVELS[4] },
      { key: "b", name: "B", score: 0.2, confidence: 0.5, level: LEVELS[0] },
    ]);
  });

  it("converts the rubric score to 0-100", () => {
    expect(toPercentScore(0)).toBe(0);
    expect(toPercentScore(2)).toBe(50);
    expect(toPercentScore(4)).toBe(100);
  });
});

describe("relativeColorScale", () => {
  it("maps min to red end and max to green end", () => {
    const color = relativeColorScale([1, 2, 3]);
    expect(color(1)).toBe(interpolateRdYlGn(0));
    expect(color(3)).toBe(interpolateRdYlGn(1));
    expect(color(2)).toBe(interpolateRdYlGn(0.5));
  });

  it("uses the middle color when all values are equal", () => {
    expect(relativeColorScale([2, 2])(2)).toBe(interpolateRdYlGn(0.5));
  });

  it("returns the no-data color for empty input", () => {
    expect(relativeColorScale([])(1)).toBe(NO_DATA_COLOR);
  });
});

describe("map cache", () => {
  const scores = parseAnswers(countries, { a: answer(3.6, 0.8), b: answer(0.2, 0.5) });

  it("round-trips scores under a normalized factor key", () => {
    const cache = withCachedScores({}, "Street Food", scores, 1);
    const restored = parseMapCache(JSON.stringify(cache));
    expect(readCachedScores(restored, "  street food ", countries)).toEqual(scores);
    expect(readCachedScores(restored, "coffee", countries)).toBeNull();
  });

  it("keeps only the most recent entries", () => {
    let cache = {};
    for (let i = 0; i < MAP_CACHE_LIMIT + 5; i++) {
      cache = withCachedScores(cache, `factor ${i}`, scores, i);
    }
    expect(Object.keys(cache)).toHaveLength(MAP_CACHE_LIMIT);
    expect(readCachedScores(cache, "factor 0", countries)).toBeNull();
    expect(readCachedScores(cache, `factor ${MAP_CACHE_LIMIT + 4}`, countries)).not.toBeNull();
  });

  it("ignores corrupt storage and unknown countries", () => {
    expect(parseMapCache("not json")).toEqual({});
    expect(parseMapCache("[1,2]")).toEqual({});
    const cache = parseMapCache(
      JSON.stringify({ x: { factor: "x", savedAt: 1, scores: [["zz", 1, 1], ["a", "bad", 1]] } }),
    );
    expect(readCachedScores(cache, "x", countries)).toBeNull();
  });
});
