import "server-only";
import {
  APIConnectionError,
  APIError,
  RateLimitError,
  TypeSafeClient,
  type JsonValue,
  type NoulQuestion,
  type Questions,
  type ScoreQuestion,
} from "@typesafe-ai/sdk";
import type { ScoreErrorBody, ScoreRequestBody, ScoreResponseBody } from "./types";

let client: TypeSafeClient | null = null;

function getClient(): TypeSafeClient {
  if (!client) {
    client = new TypeSafeClient({ timeout: 20_000 });
  }
  return client;
}

function buildQuestions(factors: ScoreRequestBody["factors"]): Questions {
  const questions: Questions = {};
  for (const f of factors) {
    if (f.kind === "score") {
      const criteria = (f.levels ?? []) as unknown as ScoreQuestion["criteria"];
      questions[f.id] = { type: "score", instructions: f.instructions, criteria };
    } else {
      const q: NoulQuestion = { type: "noul", instructions: f.instructions };
      if (f.noulCriteria) q.criteria = f.noulCriteria;
      questions[f.id] = q;
    }
  }
  return questions;
}

/** Calls Jev once per city with every enabled factor as a parallel question. */
export async function scoreCity(
  body: ScoreRequestBody,
  signal?: AbortSignal,
): Promise<ScoreResponseBody> {
  const started = Date.now();
  const questions = buildQuestions(body.factors);

  const state: Record<string, JsonValue> = {
    city: body.cityName,
    profile: body.cityProfile,
  };
  if (body.query.trim()) state.search_query = body.query.trim();

  const result = await getClient().systemOne(
    { state, questions },
    signal ? { signal } : undefined,
  );

  const answers: ScoreResponseBody["answers"] = {};
  for (const f of body.factors) {
    const a = result.answers[f.id];
    if (!a) continue;
    if (a.type === "noul") {
      answers[f.id] = { kind: "noul", raw: a.noul, confidence: 1, probabilities: { true: a.noul, false: 1 - a.noul } };
    } else if (a.type === "score") {
      answers[f.id] = {
        kind: "score",
        raw: a.score,
        confidence: a.confidence,
        probabilities: a.probabilities as Record<string, number>,
        legend: a.legend as Record<string, string>,
      };
    }
  }

  return {
    cityId: body.cityId,
    model: result.model,
    latencyMs: Date.now() - started,
    usage: {
      inputTokens: result.usage.input_tokens,
      outputTokens: result.usage.output_tokens,
    },
    answers,
  };
}

export function toErrorBody(cityId: string, err: unknown): ScoreErrorBody {
  if (err instanceof RateLimitError) {
    return {
      cityId,
      error: "Jev is rate-limiting requests. Retrying shortly.",
      code: "rate_limited",
      retryAfterMs: err.retryAfterMs,
    };
  }
  if (err instanceof APIError) {
    if (err.status === 529 || err.status >= 500) {
      return { cityId, error: "Jev is temporarily overloaded.", code: "overloaded" };
    }
    return { cityId, error: err.message || "Jev rejected the request.", code: "invalid" };
  }
  if (err instanceof APIConnectionError) {
    return { cityId, error: "Could not reach Jev.", code: "connection" };
  }
  const message = err instanceof Error ? err.message : "Unknown error";
  return { cityId, error: message, code: "unknown" };
}
