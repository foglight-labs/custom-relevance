"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import { CITIES } from "@/lib/cities";
import { PRESET_FACTORS, DEFAULT_ENABLED_IDS, buildQueryFactor } from "@/lib/factors";
import { compositeScore, normalizeRaw, rankDelta, rankRows } from "@/lib/scoring";
import type {
  CellState,
  City,
  FactorDef,
  ScoreErrorBody,
  ScoreRequestBody,
  ScoreRequestFactor,
  ScoreResponseBody,
} from "@/lib/types";

/** Always fetched for every city, even when hidden, so there's a stable
 * "fixed schema" ranking to compare the live query + custom factors against. */
const BASELINE_FACTOR_IDS = ["cost_of_living", "safety"];
const DEFAULT_QUERY_WEIGHT = 45;

interface WeightEntry {
  enabled: boolean;
  weight: number;
}

export interface DisplayRow {
  city: City;
  cells: Record<string, CellState>;
  total: number | null;
  rank: number | null;
  baselineTotal: number | null;
  baselineRank: number | null;
  delta: number | null;
  rowStatus: "idle" | "loading" | "ready" | "partial" | "error";
}

export interface RunStats {
  totalTokens: number;
  requestCount: number;
  errorCount: number;
  lastLatencyMs: number | null;
  model: string | null;
}

function toRequestFactor(f: FactorDef): ScoreRequestFactor {
  if (f.kind === "score") {
    return {
      id: f.id,
      kind: "score",
      instructions: f.instructions,
      levels: (f.levels ?? []).map((l) => l.label),
    };
  }
  return {
    id: f.id,
    kind: "noul",
    instructions: f.instructions,
    noulCriteria: f.noulCriteria,
  };
}

function levelCount(f: FactorDef): number | undefined {
  return f.kind === "score" ? f.levels?.length : undefined;
}

export function useScoringRun() {
  const [customFactors, setCustomFactors] = useState<FactorDef[]>([]);
  const [queryFactor, setQueryFactor] = useState<FactorDef | null>(null);
  const [weights, setWeights] = useState<Record<string, WeightEntry>>(() => {
    const w: Record<string, WeightEntry> = {};
    for (const f of PRESET_FACTORS) {
      w[f.id] = { enabled: DEFAULT_ENABLED_IDS.has(f.id), weight: 50 };
    }
    return w;
  });
  const [queryDraft, setQueryDraft] = useState("");
  const [appliedQuery, setAppliedQuery] = useState("");
  const [cellsByCity, setCellsByCity] = useState<Record<string, Record<string, CellState>>>({});
  const [isRunning, setIsRunning] = useState(false);
  const [runStats, setRunStats] = useState<RunStats>({
    totalTokens: 0,
    requestCount: 0,
    errorCount: 0,
    lastLatencyMs: null,
    model: null,
  });

  const controllersRef = useRef<Map<string, AbortController>>(new Map());

  const factors = useMemo<FactorDef[]>(
    () => (queryFactor ? [queryFactor, ...PRESET_FACTORS, ...customFactors] : [...PRESET_FACTORS, ...customFactors]),
    [queryFactor, customFactors],
  );
  const factorsById = useMemo(() => new Map(factors.map((f) => [f.id, f])), [factors]);

  const addFactor = useCallback((def: FactorDef) => {
    setCustomFactors((prev) => [...prev, def]);
    setWeights((prev) => ({ ...prev, [def.id]: { enabled: true, weight: 50 } }));
  }, []);

  const removeFactor = useCallback((id: string) => {
    setCustomFactors((prev) => prev.filter((f) => f.id !== id));
    setWeights((prev) => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
  }, []);

  const toggleFactor = useCallback((id: string, enabled: boolean) => {
    setWeights((prev) => ({ ...prev, [id]: { enabled, weight: prev[id]?.weight ?? 50 } }));
  }, []);

  const setWeight = useCallback((id: string, weight: number) => {
    setWeights((prev) => ({ ...prev, [id]: { enabled: prev[id]?.enabled ?? true, weight } }));
  }, []);

  const setCellStatus = useCallback((cityId: string, factorId: string, cell: CellState) => {
    setCellsByCity((prev) => ({
      ...prev,
      [cityId]: { ...(prev[cityId] ?? {}), [factorId]: cell },
    }));
  }, []);

  const fetchOne = useCallback(
    async (city: City, factorDefs: FactorDef[], query: string) => {
      if (factorDefs.length === 0) return;
      for (const f of factorDefs) setCellStatus(city.id, f.id, { status: "loading" });

      const controller = new AbortController();
      const key = `${city.id}:${factorDefs.map((f) => f.id).join(",")}:${Date.now()}`;
      controllersRef.current.set(key, controller);

      const body: ScoreRequestBody = {
        cityId: city.id,
        cityName: city.name,
        cityProfile: city.profile,
        query,
        factors: factorDefs.map(toRequestFactor),
      };

      try {
        const res = await fetch("/api/score", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
          signal: controller.signal,
        });
        const json = await res.json();
        if (!res.ok) {
          const err = json as ScoreErrorBody;
          for (const f of factorDefs) {
            setCellStatus(city.id, f.id, { status: "error", error: err.error });
          }
          setRunStats((prev) => ({ ...prev, errorCount: prev.errorCount + 1 }));
          return;
        }
        const data = json as ScoreResponseBody;
        for (const f of factorDefs) {
          const a = data.answers[f.id];
          if (!a) {
            setCellStatus(city.id, f.id, { status: "error", error: "No answer returned" });
            continue;
          }
          const normalized = normalizeRaw(a.raw, a.kind, f.direction, levelCount(f));
          setCellStatus(city.id, f.id, {
            status: "ready",
            answer: {
              factorId: f.id,
              cityId: city.id,
              kind: a.kind,
              raw: a.raw,
              confidence: a.confidence,
              probabilities: a.probabilities,
              legend: a.legend,
              normalized,
            },
          });
        }
        setRunStats((prev) => ({
          totalTokens: prev.totalTokens + data.usage.inputTokens + data.usage.outputTokens,
          requestCount: prev.requestCount + 1,
          errorCount: prev.errorCount,
          lastLatencyMs: data.latencyMs,
          model: data.model,
        }));
      } catch (err) {
        if (controller.signal.aborted) {
          for (const f of factorDefs) setCellStatus(city.id, f.id, { status: "idle" });
          return;
        }
        const message = err instanceof Error ? err.message : "Network error";
        for (const f of factorDefs) setCellStatus(city.id, f.id, { status: "error", error: message });
        setRunStats((prev) => ({ ...prev, errorCount: prev.errorCount + 1 }));
      } finally {
        controllersRef.current.delete(key);
      }
    },
    [setCellStatus],
  );

  const run = useCallback(async () => {
    for (const controller of controllersRef.current.values()) controller.abort();
    controllersRef.current.clear();

    const nextQuery = queryDraft.trim();
    const queryChanged = nextQuery !== appliedQuery;
    const nextQueryFactor = nextQuery ? buildQueryFactor(nextQuery) : null;

    if (queryChanged) {
      setCellsByCity((prev) => {
        const next: typeof prev = {};
        for (const [cityId, cells] of Object.entries(prev)) {
          const rest = { ...cells };
          delete rest.query_relevance;
          next[cityId] = rest;
        }
        return next;
      });
    }

    setAppliedQuery(nextQuery);
    setQueryFactor(nextQueryFactor);
    if (nextQueryFactor) {
      setWeights((prev) => ({
        ...prev,
        query_relevance: prev.query_relevance ?? { enabled: true, weight: DEFAULT_QUERY_WEIGHT },
      }));
    }

    const allFactors = nextQueryFactor
      ? [nextQueryFactor, ...PRESET_FACTORS, ...customFactors]
      : [...PRESET_FACTORS, ...customFactors];
    const enabledIds = new Set(
      Object.entries(weights)
        .filter(([, w]) => w.enabled)
        .map(([id]) => id),
    );
    if (nextQueryFactor) enabledIds.add("query_relevance");
    for (const id of BASELINE_FACTOR_IDS) enabledIds.add(id);

    const factorsToFetch = allFactors.filter((f) => enabledIds.has(f.id));

    setIsRunning(true);
    await Promise.allSettled(
      CITIES.map((city) => {
        const cityCells = cellsByCity[city.id] ?? {};
        const missing = factorsToFetch.filter((f) => {
          if (queryChanged && f.id === "query_relevance") return true;
          const cell = cityCells[f.id];
          return !cell || cell.status !== "ready";
        });
        return fetchOne(city, missing, nextQuery);
      }),
    );
    setIsRunning(false);
  }, [queryDraft, appliedQuery, customFactors, weights, cellsByCity, fetchOne]);

  const retryCell = useCallback(
    (cityId: string, factorId: string) => {
      const def = factorsById.get(factorId);
      const city = CITIES.find((c) => c.id === cityId);
      if (!def || !city) return;
      void fetchOne(city, [def], appliedQuery);
    },
    [factorsById, fetchOne, appliedQuery],
  );

  const isQueryDirty = queryDraft.trim() !== appliedQuery.trim();

  const rows = useMemo<DisplayRow[]>(() => {
    const visibleFactors = factors.filter((f) => weights[f.id]?.enabled && weights[f.id].weight > 0);
    const weightInputs = visibleFactors.map((f) => ({ factorId: f.id, weight: weights[f.id].weight }));
    const baselineInputs = BASELINE_FACTOR_IDS.map((id) => ({ factorId: id, weight: 50 }));

    const base = CITIES.map((city) => {
      const cells = cellsByCity[city.id] ?? {};
      const normalizedByFactor: Record<string, number | undefined> = {};
      for (const f of factors) {
        const cell = cells[f.id];
        normalizedByFactor[f.id] = cell?.status === "ready" ? cell.answer?.normalized : undefined;
      }
      const total = compositeScore(normalizedByFactor, weightInputs);
      const baselineTotal = compositeScore(normalizedByFactor, baselineInputs);

      return { city, cells, total, baselineTotal };
    });

    const ranked = rankRows(base.map((r) => ({ id: r.city.id, total: r.total })));
    const rankById = new Map(ranked.map((r) => [r.id, r.rank]));
    const baselineRanked = rankRows(base.map((r) => ({ id: r.city.id, total: r.baselineTotal })));
    const baselineRankById = new Map(baselineRanked.map((r) => [r.id, r.rank]));

    return base
      .map((r) => {
        const cells = cellsByCity[r.city.id] ?? {};
        const visibleStatuses = visibleFactors.map((f) => cells[f.id]?.status ?? "idle");
        let rowStatus: DisplayRow["rowStatus"] = "idle";
        if (visibleStatuses.some((s) => s === "loading")) rowStatus = "loading";
        else if (visibleStatuses.length > 0 && visibleStatuses.every((s) => s === "ready")) rowStatus = "ready";
        else if (visibleStatuses.some((s) => s === "error")) {
          rowStatus = visibleStatuses.some((s) => s === "ready") ? "partial" : "error";
        }
        const rank = rankById.get(r.city.id) ?? null;
        const baselineRank = baselineRankById.get(r.city.id) ?? null;
        return {
          city: r.city,
          cells,
          total: r.total,
          rank,
          baselineTotal: r.baselineTotal,
          baselineRank,
          delta: rankDelta(rank, baselineRank),
          rowStatus,
        };
      })
      .sort((a, b) => {
        if (a.rank === null && b.rank === null) return 0;
        if (a.rank === null) return 1;
        if (b.rank === null) return -1;
        return a.rank - b.rank;
      });
  }, [cellsByCity, factors, weights]);

  return {
    factors,
    weights,
    addFactor,
    removeFactor,
    toggleFactor,
    setWeight,
    queryDraft,
    setQueryDraft,
    appliedQuery,
    isQueryDirty,
    run,
    isRunning,
    rows,
    runStats,
    retryCell,
  };
}
