import { NextResponse } from "next/server";
import { scoreCity, toErrorBody } from "@/lib/jev-client";
import type { ScoreRequestBody } from "@/lib/types";

export const dynamic = "force-dynamic";

function isValidBody(body: unknown): body is ScoreRequestBody {
  if (!body || typeof body !== "object") return false;
  const b = body as Record<string, unknown>;
  return (
    typeof b.cityId === "string" &&
    typeof b.cityName === "string" &&
    typeof b.cityProfile === "string" &&
    typeof b.query === "string" &&
    Array.isArray(b.factors) &&
    b.factors.length > 0
  );
}

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  if (!isValidBody(body)) {
    return NextResponse.json({ error: "Malformed request body" }, { status: 400 });
  }

  try {
    const result = await scoreCity(body, request.signal);
    return NextResponse.json(result);
  } catch (err) {
    const errorBody = toErrorBody(body.cityId, err);
    const status =
      errorBody.code === "rate_limited"
        ? 429
        : errorBody.code === "overloaded"
          ? 529
          : errorBody.code === "invalid"
            ? 422
            : 502;
    return NextResponse.json(errorBody, { status });
  }
}
