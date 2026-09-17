import { describe, expect, it } from "vitest";
import { cacheKey, lookupScore, partitionCells, withScore } from "./score-cache";
import type { CellState, Factor, ScoreCache } from "./types";

describe("cacheKey", () => {
  it("normalizes case and surrounding whitespace", () => {
    expect(cacheKey("Cheap to live in")).toBe(cacheKey(" cheap to live in "));
  });

  it("treats different text as different keys", () => {
    expect(cacheKey("Cheap to live in")).not.toBe(cacheKey("Safe to walk at night"));
  });
});

describe("lookupScore", () => {
  const seed: ScoreCache = { Lisbon: { [cacheKey("Cheap to live in")]: 46 } };

  it("finds a value in the seed cache", () => {
    expect(lookupScore([{}, seed], "Lisbon", "Cheap to live in")).toBe(46);
  });

  it("prefers an earlier cache over a later one", () => {
    const stored: ScoreCache = { Lisbon: { [cacheKey("Cheap to live in")]: 99 } };
    expect(lookupScore([stored, seed], "Lisbon", "Cheap to live in")).toBe(99);
  });

  it("misses when the factor text has changed", () => {
    expect(lookupScore([seed], "Lisbon", "Cheap to live in, honestly")).toBeUndefined();
  });

  it("misses for an unknown item", () => {
    expect(lookupScore([seed], "Prague", "Cheap to live in")).toBeUndefined();
  });
});

describe("withScore", () => {
  it("adds a value without mutating the input cache", () => {
    const cache: ScoreCache = {};
    const next = withScore(cache, "Lisbon", "Cheap to live in", 46);
    expect(cache).toEqual({});
    expect(lookupScore([next], "Lisbon", "Cheap to live in")).toBe(46);
  });

  it("merges into an existing item without dropping other factors", () => {
    const cache: ScoreCache = { Lisbon: { [cacheKey("Cheap to live in")]: 46 } };
    const next = withScore(cache, "Lisbon", "Safe to walk at night", 59);
    expect(lookupScore([next], "Lisbon", "Cheap to live in")).toBe(46);
    expect(lookupScore([next], "Lisbon", "Safe to walk at night")).toBe(59);
  });
});

describe("partitionCells", () => {
  const cheap: Factor = { id: "cheap", text: "Cheap to live in", weight: 3 };
  const safe: Factor = { id: "safe", text: "Safe to walk at night", weight: 3 };
  const seed: ScoreCache = { Lisbon: { [cacheKey("Cheap to live in")]: 46 } };

  it("hits from the seed cache when nothing has been fetched yet", () => {
    const { hits, misses } = partitionCells(["Lisbon"], [cheap], {}, [seed]);
    expect(hits).toEqual([{ itemName: "Lisbon", factorId: "cheap", value: 46 }]);
    expect(misses).toEqual({});
  });

  it("misses a factor whose text isn't in any cache", () => {
    const { hits, misses } = partitionCells(["Lisbon"], [safe], {}, [seed]);
    expect(hits).toEqual([]);
    expect(misses).toEqual({ Lisbon: [safe] });
  });

  it("skips cells that already have any state (loading/ready/error)", () => {
    const cellsByItem: Record<string, Record<string, CellState>> = {
      Lisbon: { cheap: { status: "loading" } },
    };
    const { hits, misses } = partitionCells(["Lisbon"], [cheap], cellsByItem, [seed]);
    expect(hits).toEqual([]);
    expect(misses).toEqual({});
  });

  it("groups misses by item across multiple items and factors", () => {
    const { hits, misses } = partitionCells(["Lisbon", "Prague"], [cheap, safe], {}, [seed]);
    expect(hits).toEqual([{ itemName: "Lisbon", factorId: "cheap", value: 46 }]);
    expect(misses).toEqual({
      Lisbon: [safe],
      Prague: [cheap, safe],
    });
  });
});
