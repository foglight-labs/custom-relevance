import "server-only";
import {
  APIConnectionError,
  APIError,
  RateLimitError,
  TypeSafeClient,
  type Questions,
} from "@typesafe-ai/sdk";
import type { ScoreErrorBody, ScoreRequestBody, ScoreResponseBody } from "./types";

let client: TypeSafeClient | null = null;

function getClient(): TypeSafeClient {
  if (!client) {
    client = new TypeSafeClient({ timeout: 20_000 });
  }
  return client;
}

/** Calls Jev once per item, asking every factor as an isolated yes/no question. */
export async function scoreItem(
  body: ScoreRequestBody,
  signal?: AbortSignal,
): Promise<ScoreResponseBody> {
  const questions: Questions = {};
  for (const f of body.factors) {
    questions[f.id] = {
      type: "noul",
      instructions: `Is this true of the ${body.noun} "${body.itemName}"? ${f.text}`,
    };
  }

  const result = await getClient().systemOne(
    { state: { [body.noun]: body.itemName }, questions },
    signal ? { signal } : undefined,
  );

  const answers: ScoreResponseBody["answers"] = {};
  for (const f of body.factors) {
    const a = result.answers[f.id];
    if (a?.type === "noul") answers[f.id] = Math.round(a.noul * 100);
  }

  return { itemName: body.itemName, answers };
}

export function toErrorBody(itemName: string, err: unknown): ScoreErrorBody {
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
