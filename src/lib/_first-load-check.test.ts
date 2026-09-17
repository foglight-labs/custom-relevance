import { describe, expect, it } from "vitest";
import { COLLECTIONS } from "./collections";
import {
  MAX_FACTORS,
  MAX_FACTOR_TEXT_LENGTH,
  MAX_ITEMS,
  MAX_ITEM_NAME_LENGTH,
} from "./limits";
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

  // A collection shipping more than the caps allow would be silently
  // truncated on load, hiding items its seed scores already cover.
  it.each(COLLECTIONS)("fits inside the grid caps for $label", (collection) => {
    expect(collection.items.length).toBeLessThanOrEqual(MAX_ITEMS);
    expect(collection.factors.length).toBeLessThanOrEqual(MAX_FACTORS);
    for (const item of collection.items) {
      expect(item.length).toBeLessThanOrEqual(MAX_ITEM_NAME_LENGTH);
    }
    for (const factor of collection.factors) {
      expect(factor.text.length).toBeLessThanOrEqual(MAX_FACTOR_TEXT_LENGTH);
    }
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
