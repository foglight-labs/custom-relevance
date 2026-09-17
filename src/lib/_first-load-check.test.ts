import { describe, expect, it } from "vitest";
import { COLLECTIONS } from "./collections";
import { partitionCells } from "./score-cache";

describe("first load (no localStorage yet)", () => {
  it("has zero misses for the default collection", () => {
    const cities = COLLECTIONS[0];
    // Mirrors useRanking's first-render state: no cellsByItem, no stored
    // `scores` cache, only the collection's hardcoded seedScores.
    const { hits, misses } = partitionCells(cities.items, cities.factors, {}, [
      {},
      cities.seedScores ?? {},
    ]);
    expect(Object.keys(misses)).toEqual([]);
    expect(hits.length).toBe(cities.items.length * cities.factors.length);
  });
});
