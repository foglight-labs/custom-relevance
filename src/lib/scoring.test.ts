import { describe, expect, it } from "vitest";
import { compositeScore, rankRows } from "./scoring";

describe("compositeScore", () => {
  it("computes a weighted average of 0-100 values", () => {
    const total = compositeScore(
      { cost: 20, safety: 80 },
      [
        { factorId: "cost", weight: 3 },
        { factorId: "safety", weight: 2 },
      ],
    );
    // (3*20 + 2*80) / 5 = 44
    expect(total).toBeCloseTo(44);
  });

  it("excludes factors with zero weight", () => {
    const total = compositeScore(
      { cost: 20, safety: 80 },
      [
        { factorId: "cost", weight: 0 },
        { factorId: "safety", weight: 5 },
      ],
    );
    expect(total).toBeCloseTo(80);
  });

  it("excludes cells that have not resolved yet, instead of treating them as 0", () => {
    const total = compositeScore(
      { safety: 80 }, // cost missing (still loading)
      [
        { factorId: "cost", weight: 3 },
        { factorId: "safety", weight: 3 },
      ],
    );
    expect(total).toBeCloseTo(80);
  });

  it("returns null when nothing is ready", () => {
    const total = compositeScore({}, [{ factorId: "cost", weight: 3 }]);
    expect(total).toBeNull();
  });
});

describe("rankRows", () => {
  it("ranks by total descending and puts nulls last, unranked", () => {
    const ranked = rankRows([
      { id: "a", total: 50 },
      { id: "b", total: 90 },
      { id: "c", total: null },
      { id: "d", total: 70 },
    ]);
    expect(ranked.map((r) => r.id)).toEqual(["b", "d", "a", "c"]);
    expect(ranked.find((r) => r.id === "b")?.rank).toBe(1);
    expect(ranked.find((r) => r.id === "d")?.rank).toBe(2);
    expect(ranked.find((r) => r.id === "a")?.rank).toBe(3);
    expect(ranked.find((r) => r.id === "c")?.rank).toBeNull();
  });
});
