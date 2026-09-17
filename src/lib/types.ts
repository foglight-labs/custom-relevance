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

/**
 * How a collection's (item, factor) pairs get turned into the instruction Jev
 * is asked. Lives entirely in the collection's data file — the client only
 * ever sends a collection id, never a prompt string, to /api/score.
 */
export interface CollectionPrompt {
  /** Instruction template; "{item}" and "{factor}" are substituted per cell. */
  template: string;
  /**
   * Extra framing added to the Jev call's state alongside the item itself,
   * e.g. "Evaluate the club as it is today." Use for collections whose
   * answers would otherwise drift with era or context.
   */
  context?: string;
}

export interface Collection {
  id: string;
  label: string;
  /** Singular noun used in prompts and UI copy, e.g. "city". */
  noun: string;
  /** How this collection's cells are turned into a Jev instruction. */
  prompt: CollectionPrompt;
  /** Default item names. */
  items: string[];
  /** Default factors. */
  factors: Factor[];
  /**
   * Precomputed scores for the default items/factors, so a first-time visitor
   * sees the default ranking without sending a single /api/score request.
   * Keyed by factor text (not id) since the text is what was actually asked.
   */
  seedScores?: ScoreCache;
}

/** item name -> factor text -> 0-100 value. Keyed by text, not id: the text is the question. */
export type ScoreCache = Record<string, Record<string, number>>;

export type CellStatus = "idle" | "loading" | "ready" | "error";

export interface CellState {
  status: CellStatus;
  /** 0-100, only set once status is "ready". */
  value?: number;
  error?: string;
}

/** Payload sent from the client to /api/score for one item. */
export interface ScoreRequestBody {
  /** Which collection's prompt template/context to use — never the template itself. */
  collectionId: string;
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
