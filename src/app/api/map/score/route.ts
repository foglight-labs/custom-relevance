import { NextResponse } from "next/server";
import { describeError, scoreCountries, statusForErrorCode } from "@/lib/jev-client";
import { MAX_FACTOR_TEXT_LENGTH } from "@/lib/limits";
import type { MapScoreErrorBody } from "@/lib/types";
import { clientIp } from "@/lib/usage-budget";

export const dynamic = "force-dynamic";

function invalid(error: string) {
  const body: MapScoreErrorBody = { error, code: "invalid" };
  return NextResponse.json(body, { status: 400 });
}

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return invalid("Invalid JSON body");
  }

  const factor = (body as { factor?: unknown } | null)?.factor;
  if (typeof factor !== "string" || factor.trim().length === 0) {
    return invalid("Enter a factor to score.");
  }
  const trimmed = factor.trim();
  if (trimmed.length > MAX_FACTOR_TEXT_LENGTH) {
    return invalid(`Keep the factor under ${MAX_FACTOR_TEXT_LENGTH} characters.`);
  }

  try {
    const result = await scoreCountries(trimmed, clientIp(request), request.signal);
    return NextResponse.json(result);
  } catch (err) {
    const errorBody = describeError(err);
    return NextResponse.json(errorBody, { status: statusForErrorCode(errorBody.code) });
  }
}
