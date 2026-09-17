import { NextResponse } from "next/server";
import { COLLECTIONS } from "@/lib/collections";
import { scoreItem, toErrorBody } from "@/lib/jev-client";
import { MAX_FACTORS, MAX_FACTOR_TEXT_LENGTH, MAX_ITEM_NAME_LENGTH } from "@/lib/limits";
import type { ScoreRequestBody } from "@/lib/types";
import { clientIp } from "@/lib/usage-budget";

export const dynamic = "force-dynamic";

function isValidFactor(value: unknown, maxTextLength: number): boolean {
  if (!value || typeof value !== "object") return false;
  const f = value as Record<string, unknown>;
  return (
    typeof f.id === "string" &&
    f.id.length > 0 &&
    f.id.length <= 64 &&
    typeof f.text === "string" &&
    f.text.trim().length > 0 &&
    f.text.length <= maxTextLength
  );
}

/**
 * Enforces the same grid caps the UI does, so the shared key can't be asked a
 * bigger (costlier) question than the app itself can pose.
 */
function isValidBody(body: unknown): body is ScoreRequestBody {
  if (!body || typeof body !== "object") return false;
  const b = body as Record<string, unknown>;
  return (
    typeof b.collectionId === "string" &&
    COLLECTIONS.some((c) => c.id === b.collectionId) &&
    typeof b.itemName === "string" &&
    b.itemName.trim().length > 0 &&
    b.itemName.length <= MAX_ITEM_NAME_LENGTH &&
    Array.isArray(b.factors) &&
    b.factors.length > 0 &&
    b.factors.length <= MAX_FACTORS &&
    b.factors.every((f) => isValidFactor(f, MAX_FACTOR_TEXT_LENGTH))
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
    const result = await scoreItem(body, clientIp(request), request.signal);
    return NextResponse.json(result);
  } catch (err) {
    const errorBody = toErrorBody(body.itemName, err);
    const status =
      errorBody.code === "rate_limited" || errorBody.code === "quota_exceeded"
        ? 429
        : errorBody.code === "overloaded"
          ? 529
          : errorBody.code === "invalid"
            ? 422
            : 502;
    return NextResponse.json(errorBody, { status });
  }
}
