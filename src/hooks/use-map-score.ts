"use client";

import { useCallback, useEffect, useState } from "react";
import { loadMapCache, readCachedScores, saveMapCache, withCachedScores } from "@/lib/map/cache";
import { COUNTRIES } from "@/lib/map/countries";
import type { CountryScore } from "@/lib/map/questions";
import type { MapScoreErrorBody, MapScoreResponseBody, ScoreErrorCode } from "@/lib/types";

export type MapStatus = "idle" | "loading" | "ready" | "error";

interface MapScoreState {
  /** The factor these scores (or this error) belong to. */
  factor: string;
  status: MapStatus;
  scores: CountryScore[] | null;
  error?: string;
  code?: ScoreErrorCode;
}

/**
 * Scores every country on `factor`: from the browser cache when this factor
 * was scored before, otherwise with one live request. Changing the factor (or
 * unmounting) aborts a request still in flight.
 */
export function useMapScore(factor: string) {
  const [state, setState] = useState<MapScoreState>({ factor: "", status: "idle", scores: null });
  const [attempt, setAttempt] = useState(0);

  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    if (!factor) {
      setState({ factor: "", status: "idle", scores: null });
      return;
    }

    const cached = readCachedScores(loadMapCache(), factor, COUNTRIES);
    if (cached) {
      setState({ factor, status: "ready", scores: cached });
      return;
    }

    // Keep the previous map on screen (dimmed) while the new one loads.
    setState((prev) => ({ factor, status: "loading", scores: prev.scores }));
    const controller = new AbortController();

    (async () => {
      try {
        const res = await fetch("/api/map/score", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ factor }),
          signal: controller.signal,
        });
        const json: unknown = await res.json().catch(() => null);
        if (!res.ok) {
          const err = json as Partial<MapScoreErrorBody> | null;
          setState({
            factor,
            status: "error",
            scores: null,
            error: err?.error ?? `Scoring failed (HTTP ${res.status}).`,
            code: err?.code ?? "unknown",
          });
          return;
        }
        const { scores } = json as MapScoreResponseBody;
        if (!Array.isArray(scores) || scores.length === 0) {
          setState({ factor, status: "error", scores: null, error: "Jev returned no scores.", code: "unknown" });
          return;
        }
        saveMapCache(withCachedScores(loadMapCache(), factor, scores, Date.now()));
        setState({ factor, status: "ready", scores });
      } catch {
        if (controller.signal.aborted) return;
        setState({ factor, status: "error", scores: null, error: "Could not reach the server.", code: "connection" });
      }
    })();

    return () => controller.abort();
  }, [factor, attempt]);
  /* eslint-enable react-hooks/set-state-in-effect */

  const retry = useCallback(() => setAttempt((n) => n + 1), []);

  return { ...state, retry };
}
