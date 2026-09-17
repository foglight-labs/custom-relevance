import { describe, expect, it } from "vitest";
import {
  clamp01,
  compositeScore,
  normalizeRaw,
  rankDelta,
  rankRows,
} from "./scoring";

describe("normalizeRaw", () => {
  it("normalizes a score to 0-1 for higher-is-better", () => {
    expect(normalizeRaw(4, "score", "higher-is-better", 5)).toBe(1);
    expect(normalizeRaw(0, "score", "higher-is-better", 5)).toBe(0);
    expect(normalizeRaw(2, "score", "higher-is-better", 5)).toBe(0.5);
  });

  it("flips the axis for lower-is-better", () => {
    expect(normalizeRaw(4, "score", "lower-is-better", 5)).toBe(0);
    expect(normalizeRaw(0, "score", "lower-is-better", 5)).toBe(1);
    expect(normalizeRaw(2, "score", "lower-is-better", 5)).toBe(0.5);
  });

  it("treats noul as already 0-1", () => {
    expect(normalizeRaw(0.73, "noul", "higher-is-better")).toBeCloseTo(0.73);
    expect(normalizeRaw(0.73, "noul", "lower-is-better")).toBeCloseTo(0.27);
  });

  it("clamps out-of-range and NaN input", () => {
    expect(clamp01(-1)).toBe(0);
    expect(clamp01(1.5)).toBe(1);
    expect(clamp01(NaN)).toBe(0);
  });
});

describe("compositeScore", () => {
  it("computes a weighted average of normalized values", () => {
    const total = compositeScore(
      { cost: 0.2, safety: 0.8 },
      [
        { factorId: "cost", weight: 60 },
        { factorId: "safety", weight: 40 },
      ],
    );
    // 0.6*0.2 + 0.4*0.8 = 0.44
    expect(total).toBeCloseTo(0.44);
  });

  it("excludes factors with zero weight", () => {
    const total = compositeScore(
      { cost: 0.2, safety: 0.8 },
      [
        { factorId: "cost", weight: 0 },
        { factorId: "safety", weight: 100 },
      ],
    );
    expect(total).toBeCloseTo(0.8);
  });

  it("excludes cells that have not resolved yet, instead of treating them as 0", () => {
    const total = compositeScore(
      { safety: 0.8 }, // cost missing (still loading)
      [
        { factorId: "cost", weight: 50 },
        { factorId: "safety", weight: 50 },
      ],
    );
    expect(total).toBeCloseTo(0.8);
  });

  it("returns null when nothing is ready", () => {
    const total = compositeScore({}, [{ factorId: "cost", weight: 50 }]);
    expect(total).toBeNull();
  });
});

describe("rankRows", () => {
  it("ranks by total descending and puts nulls last, unranked", () => {
    const ranked = rankRows([
      { id: "a", total: 0.5 },
      { id: "b", total: 0.9 },
      { id: "c", total: null },
      { id: "d", total: 0.7 },
    ]);
    expect(ranked.map((r) => r.id)).toEqual(["b", "d", "a", "c"]);
    expect(ranked.find((r) => r.id === "b")?.rank).toBe(1);
    expect(ranked.find((r) => r.id === "d")?.rank).toBe(2);
    expect(ranked.find((r) => r.id === "a")?.rank).toBe(3);
    expect(ranked.find((r) => r.id === "c")?.rank).toBeNull();
  });
});

describe("rankDelta", () => {
  it("is positive when a row moved up relative to baseline", () => {
    expect(rankDelta(1, 4)).toBe(3);
  });

  it("is negative when a row moved down", () => {
    expect(rankDelta(4, 1)).toBe(-3);
  });

  it("is null when either rank is unavailable", () => {
    expect(rankDelta(null, 1)).toBeNull();
    expect(rankDelta(1, null)).toBeNull();
  });
});
