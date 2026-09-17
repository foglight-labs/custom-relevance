/**
 * Shared domain types for the Jev ranking playground.
 *
 * A "collection" is a set of items (e.g. cities) ranked against a set of
 * factors. Each factor is one plain statement sent to Jev as an isolated
 * yes/no question per item; the probability of "yes" becomes that cell's
 * 0-100 value. Weights (1-5) and the final weighted average live entirely in
 * this app, never in a prompt.
 */

export interface Factor {
  id: string;
  /** The statement Jev is asked about each item, e.g. "Safe to walk at night". */
  text: string;
  /** 1 (barely matters) to 5 (matters a lot). */
  weight: 1 | 2 | 3 | 4 | 5;
}

export interface Collection {
  id: string;
  label: string;
  /** Singular noun used in prompts and UI copy, e.g. "city". */
  noun: string;
  /** Default item names. */
  items: string[];
  /** Default factors. */
  factors: Factor[];
}

export type CellStatus = "idle" | "loading" | "ready" | "error";

export interface CellState {
  status: CellStatus;
  /** 0-100, only set once status is "ready". */
  value?: number;
  error?: string;
}

/** Payload sent from the client to /api/score for one item. */
export interface ScoreRequestBody {
  noun: string;
  itemName: string;
  factors: { id: string; text: string }[];
}

export interface ScoreResponseBody {
  itemName: string;
  /** factorId -> 0-100 value. */
  answers: Record<string, number>;
}

export interface ScoreErrorBody {
  itemName: string;
  error: string;
  code: "rate_limited" | "overloaded" | "invalid" | "connection" | "unknown";
  retryAfterMs?: number;
}
