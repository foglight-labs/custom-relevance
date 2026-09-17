import { describe, expect, it } from "vitest";
import { COLLECTIONS } from "./collections";
import { partitionCells } from "./score-cache";

describe("first load (no localStorage yet)", () => {
  it.each(COLLECTIONS)("has zero misses for $label", (collection) => {
    // Mirrors useRanking's first-render state: no cellsByItem, no stored
    // `scores` cache, only the collection's hardcoded seedScores.
    const { hits, misses } = partitionCells(collection.items, collection.factors, {}, [
      {},
      collection.seedScores ?? {},
    ]);
    expect(Object.keys(misses)).toEqual([]);
    expect(hits.length).toBe(collection.items.length * collection.factors.length);
  });

  it("has a unique id, and a {item}/{factor} prompt template, for every collection", () => {
    const ids = COLLECTIONS.map((c) => c.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const collection of COLLECTIONS) {
      expect(collection.prompt.template).toContain("{item}");
      expect(collection.prompt.template).toContain("{factor}");
    }
  });
});
