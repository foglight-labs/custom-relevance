"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { COLLECTIONS } from "@/lib/collections";
import { partitionCells, withScore } from "@/lib/score-cache";
import { compositeScore, rankRows } from "@/lib/scoring";
import type {
  CellState,
  Factor,
  ScoreCache,
  ScoreErrorBody,
  ScoreRequestBody,
  ScoreResponseBody,
} from "@/lib/types";

interface StoredState {
  items: string[];
  factors: Factor[];
  /** Every score ever fetched for this collection, so reloads don't refetch. */
  scores: ScoreCache;
}

function storageKey(collectionId: string, revision = 1): string {
  return revision > 1 ? `jev-ranking:${collectionId}:r${revision}` : `jev-ranking:${collectionId}`;
}

function loadStored(collectionId: string, revision = 1): StoredState | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(storageKey(collectionId, revision));
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<StoredState>;
    if (!Array.isArray(parsed.items) || !Array.isArray(parsed.factors)) return null;
    const scores =
      parsed.scores && typeof parsed.scores === "object" ? parsed.scores : {};
    return { items: parsed.items, factors: parsed.factors, scores };
  } catch {
    return null;
  }
}

function saveStored(collectionId: string, state: StoredState) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(storageKey(collectionId), JSON.stringify(state));
  } catch {
    // localStorage unavailable (private mode, quota) — state just won't persist.
  }
}

function slugify(text: string): string {
  return (
    text
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "_")
      .replace(/^_+|_+$/g, "")
      .slice(0, 24) || "factor"
  );
}

function makeFactorId(text: string, existingIds: string[]): string {
  const base = slugify(text);
  if (!existingIds.includes(base)) return base;
  let n = 2;
  while (existingIds.includes(`${base}_${n}`)) n++;
  return `${base}_${n}`;
}

function clampWeight(weight: number): Factor["weight"] {
  return Math.min(5, Math.max(1, Math.round(weight))) as Factor["weight"];
}

export interface DisplayRow {
  name: string;
  cells: Record<string, CellState>;
  total: number | null;
  rank: number | null;
  rowStatus: "idle" | "loading" | "ready" | "partial" | "error";
}

export function useRanking() {
  const [collectionId, setCollectionId] = useState(COLLECTIONS[0].id);
  const collection = useMemo(
    () => COLLECTIONS.find((c) => c.id === collectionId) ?? COLLECTIONS[0],
    [collectionId],
  );

  const [items, setItems] = useState<string[]>(collection.items);
  const [factors, setFactors] = useState<Factor[]>(collection.factors);
  const [scores, setScores] = useState<ScoreCache>({});
  const [cellsByItem, setCellsByItem] = useState<Record<string, Record<string, CellState>>>({});
  // Which collectionId's storage has actually been loaded into items/factors/
  // scores above. Until this matches collectionId, the fetch and save effects
  // below stay out of the way, so they never see the initial-render defaults
  // and mistake them for "the user's real data" (which would otherwise fire a
  // wasted fetch wave, or overwrite storage, before the load effect runs).
  const [hydratedFor, setHydratedFor] = useState<string | null>(null);

  // Swap in persisted (or default) items/factors/scores whenever the
  // collection changes. Reads localStorage, so it must stay client-only (an
  // effect) rather than computed during render, to avoid a server/client
  // hydration mismatch.
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    const stored = loadStored(collectionId);
    const base = COLLECTIONS.find((c) => c.id === collectionId) ?? COLLECTIONS[0];
    setItems(stored?.items ?? base.items);
    setFactors(stored?.factors ?? base.factors);
    setScores(stored?.scores ?? {});
    setCellsByItem({});
    setHydratedFor(collectionId);
  }, [collectionId]);
  /* eslint-enable react-hooks/set-state-in-effect */

  useEffect(() => {
    if (hydratedFor !== collectionId) return;
    saveStored(collectionId, { items, factors, scores });
  }, [collectionId, hydratedFor, items, factors, scores]);

  const setCellStatus = useCallback((itemName: string, factorId: string, cell: CellState) => {
    setCellsByItem((prev) => ({
      ...prev,
      [itemName]: { ...(prev[itemName] ?? {}), [factorId]: cell },
    }));
  }, []);

  // Removes a cell entirely (rather than marking it "idle") so the "missing
  // cell" effect below treats it as never-fetched and retries it. Used when
  // a request is aborted, e.g. by Strict Mode's mount/cleanup/remount cycle.
  const clearCellStatus = useCallback((itemName: string, factorId: string) => {
    setCellsByItem((prev) => {
      const existing = prev[itemName];
      if (!existing || !(factorId in existing)) return prev;
      const rest = { ...existing };
      delete rest[factorId];
      return { ...prev, [itemName]: rest };
    });
  }, []);

  const fetchOne = useCallback(
    async (itemName: string, factorDefs: Factor[], signal: AbortSignal) => {
      if (factorDefs.length === 0) return;
      for (const f of factorDefs) setCellStatus(itemName, f.id, { status: "loading" });

      const body: ScoreRequestBody = {
        collectionId,
        itemName,
        factors: factorDefs.map((f) => ({ id: f.id, text: f.text })),
      };

      try {
        const res = await fetch("/api/score", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
          signal,
        });
        const json = await res.json();
        if (!res.ok) {
          const err = json as ScoreErrorBody;
          for (const f of factorDefs) setCellStatus(itemName, f.id, { status: "error", error: err.error });
          return;
        }
        const data = json as ScoreResponseBody;
        for (const f of factorDefs) {
          const value = data.answers[f.id];
          if (value === undefined) {
            setCellStatus(itemName, f.id, { status: "error", error: "No answer returned" });
            continue;
          }
          setCellStatus(itemName, f.id, { status: "ready", value });
          setScores((prev) => withScore(prev, itemName, f.text, value));
        }
      } catch (err) {
        if (signal.aborted) {
          for (const f of factorDefs) clearCellStatus(itemName, f.id);
          return;
        }
        const message = err instanceof Error ? err.message : "Network error";
        for (const f of factorDefs) setCellStatus(itemName, f.id, { status: "error", error: message });
      }
    },
    [collectionId, setCellStatus, clearCellStatus],
  );

  // Resolve any (item, factor) cell that has never been requested: from the
  // score cache (persisted scores, falling back to the collection's seed
  // data) when available, otherwise from a live request. Cells that already
  // errored are left alone until the user retries them explicitly. The
  // cleanup aborts this batch's still-in-flight requests: React (in
  // development, via Strict Mode) can invoke an effect, clean it up, and
  // re-invoke it right away, and without this every add/edit would fire two
  // overlapping waves of fetches.
  // Applying cache hits, and fetchOne marking cells "loading" synchronously
  // before its first await, are both read by this rule as setState-in-effect;
  // that immediate feedback (skip the request, or show a spinner) is intended.
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    if (hydratedFor !== collectionId) return;
    const { hits, misses } = partitionCells(items, factors, cellsByItem, [
      scores,
      collection.seedScores ?? {},
    ]);

    if (hits.length > 0) {
      setCellsByItem((prev) => {
        const next = { ...prev };
        for (const hit of hits) {
          next[hit.itemName] = {
            ...(next[hit.itemName] ?? {}),
            [hit.factorId]: { status: "ready", value: hit.value },
          };
        }
        return next;
      });
    }

    const controller = new AbortController();
    for (const [itemName, missingFactors] of Object.entries(misses)) {
      void fetchOne(itemName, missingFactors, controller.signal);
    }
    return () => controller.abort();
    // cellsByItem and scores are read for the "already resolved?" check, not
    // to decide when to re-run — only a new item or factor (or the collection
    // finishing hydration) should trigger this.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items, factors, hydratedFor, collectionId, collection.seedScores, fetchOne]);
  /* eslint-enable react-hooks/set-state-in-effect */

  const addFactor = useCallback((text: string, weight: number) => {
    const trimmed = text.trim();
    if (!trimmed) return;
    setFactors((prev) => {
      if (prev.some((f) => f.text.toLowerCase() === trimmed.toLowerCase())) return prev;
      const id = makeFactorId(trimmed, prev.map((f) => f.id));
      return [...prev, { id, text: trimmed, weight: clampWeight(weight) }];
    });
  }, []);

  const editFactor = useCallback((id: string, text: string) => {
    const trimmed = text.trim();
    if (!trimmed) return;
    setFactors((prev) => prev.map((f) => (f.id === id ? { ...f, text: trimmed } : f)));
    setCellsByItem((prev) => {
      const next: typeof prev = {};
      for (const [itemName, cells] of Object.entries(prev)) {
        const rest = { ...cells };
        delete rest[id];
        next[itemName] = rest;
      }
      return next;
    });
  }, []);

  const removeFactor = useCallback((id: string) => {
    setFactors((prev) => prev.filter((f) => f.id !== id));
  }, []);

  const setWeight = useCallback((id: string, weight: number) => {
    setFactors((prev) => prev.map((f) => (f.id === id ? { ...f, weight: clampWeight(weight) } : f)));
  }, []);

  const addItem = useCallback((name: string) => {
    const trimmed = name.trim();
    if (!trimmed) return;
    setItems((prev) => {
      if (prev.some((n) => n.toLowerCase() === trimmed.toLowerCase())) return prev;
      return [...prev, trimmed];
    });
  }, []);

  const removeItem = useCallback((name: string) => {
    setItems((prev) => prev.filter((n) => n !== name));
    setCellsByItem((prev) => {
      const next = { ...prev };
      delete next[name];
      return next;
    });
  }, []);

  const factorsById = useMemo(() => new Map(factors.map((f) => [f.id, f])), [factors]);

  const retryCell = useCallback(
    (itemName: string, factorId: string) => {
      const def = factorsById.get(factorId);
      if (!def) return;
      void fetchOne(itemName, [def], new AbortController().signal);
    },
    [factorsById, fetchOne],
  );

  const rows = useMemo<DisplayRow[]>(() => {
    const weightInputs = factors.map((f) => ({ factorId: f.id, weight: f.weight }));

    const base = items.map((name) => {
      const cells = cellsByItem[name] ?? {};
      const values: Record<string, number | undefined> = {};
      for (const f of factors) {
        const cell = cells[f.id];
        values[f.id] = cell?.status === "ready" ? cell.value : undefined;
      }
      const total = compositeScore(values, weightInputs);
      return { name, cells, total };
    });

    const ranked = rankRows(base.map((r) => ({ id: r.name, total: r.total })));
    const rankByName = new Map(ranked.map((r) => [r.id, r.rank]));

    return base
      .map((r) => {
        const statuses = factors.map((f) => r.cells[f.id]?.status ?? "idle");
        let rowStatus: DisplayRow["rowStatus"] = "idle";
        if (statuses.some((s) => s === "loading")) rowStatus = "loading";
        else if (statuses.length > 0 && statuses.every((s) => s === "ready")) rowStatus = "ready";
        else if (statuses.some((s) => s === "error")) {
          rowStatus = statuses.some((s) => s === "ready") ? "partial" : "error";
        }
        return {
          name: r.name,
          cells: r.cells,
          total: r.total,
          rank: rankByName.get(r.name) ?? null,
          rowStatus,
        };
      })
      .sort((a, b) => {
        if (a.rank === null && b.rank === null) return 0;
        if (a.rank === null) return 1;
        if (b.rank === null) return -1;
        return a.rank - b.rank;
      });
  }, [items, cellsByItem, factors]);

  return {
    collectionId,
    setCollectionId,
    noun: collection.noun,
    factors,
    addFactor,
    editFactor,
    removeFactor,
    setWeight,
    addItem,
    removeItem,
    retryCell,
    rows,
  };
}
