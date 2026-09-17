import "server-only";
import {
  APIConnectionError,
  APIError,
  RateLimitError,
  TypeSafeClient,
  type Questions,
} from "@typesafe-ai/sdk";
import { COLLECTIONS } from "./collections";
import { bareItemName, buildInstructions } from "./prompt";
import type { ScoreErrorBody, ScoreRequestBody, ScoreResponseBody } from "./types";
import { QuotaExceededError, usageBudget } from "./usage-budget";

let client: TypeSafeClient | null = null;

function getClient(): TypeSafeClient {
  if (!client) {
    client = new TypeSafeClient({ timeout: 20_000 });
  }
  return client;
}

/**
 * Calls Jev once per item, asking every factor as an isolated yes/no
 * question. The instruction template and any extra context come from the
 * collection named by `body.collectionId` — the client never sends a prompt
 * string itself, only which collection it's asking about.
 *
 * Every call is charged against the shared key's daily budget, keyed by `ip`.
 * @throws {QuotaExceededError} The budget for today is spent.
 */
export async function scoreItem(
  body: ScoreRequestBody,
  ip: string,
  signal?: AbortSignal,
): Promise<ScoreResponseBody> {
  // The route validates collectionId against COLLECTIONS before calling this;
  // this is just a defensive fallback, so a plain Error (-> "unknown" code) is fine.
  const collection = COLLECTIONS.find((c) => c.id === body.collectionId);
  if (!collection) {
    throw new Error(`Unknown collection "${body.collectionId}"`);
  }

  const questions: Questions = {};
  for (const f of body.factors) {
    questions[f.id] = {
      type: "noul",
      instructions: buildInstructions(collection.prompt.template, body.itemName, f.text),
    };
  }

  const state: Record<string, string> = { [collection.noun]: bareItemName(body.itemName) };
  if (collection.prompt.context) state.context = collection.prompt.context;

  usageBudget.reserve(ip);
  const result = await getClient().systemOne(
    { state, questions },
    signal ? { signal } : undefined,
  );
  usageBudget.record(result.usage.input_tokens);

  const answers: ScoreResponseBody["answers"] = {};
  for (const f of body.factors) {
    const a = result.answers[f.id];
    if (a?.type === "noul") answers[f.id] = Math.round(a.noul * 100);
  }

  return { itemName: body.itemName, answers };
}

export function toErrorBody(itemName: string, err: unknown): ScoreErrorBody {
  if (err instanceof QuotaExceededError) {
    return { itemName, error: err.message, code: "quota_exceeded" };
  }
  if (err instanceof RateLimitError) {
    return {
      itemName,
      error: "Jev is rate-limiting requests. Retrying shortly.",
      code: "rate_limited",
      retryAfterMs: err.retryAfterMs,
    };
  }
  if (err instanceof APIError) {
    if (err.status === 529 || err.status >= 500) {
      return { itemName, error: "Jev is temporarily overloaded.", code: "overloaded" };
    }
    return { itemName, error: err.message || "Jev rejected the request.", code: "invalid" };
  }
  if (err instanceof APIConnectionError) {
    return { itemName, error: "Could not reach Jev.", code: "connection" };
  }
  const message = err instanceof Error ? err.message : "Unknown error";
  return { itemName, error: message, code: "unknown" };
}
