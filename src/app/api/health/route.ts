import { NextResponse } from "next/server";
import { usageBudget } from "@/lib/usage-budget";

export const dynamic = "force-dynamic";

// Railway's healthcheck and zero-downtime deploy readiness probe. Also reports
// today's Jev spend, which is the only place these in-memory counters surface.
export function GET() {
  return NextResponse.json({ ok: true, usage: usageBudget.snapshot() });
}
