import { describe, expect, it } from "vitest";
import { createUsageBudget, QuotaExceededError } from "./usage-budget";

/** $0.042 / 1M input tokens, so 1M tokens is worth about four cents. */
const TOKENS_PER_CENT = 1_000_000 / 4.2;

function fixedClock(iso: string) {
  let nowMs = Date.parse(iso);
  return {
    now: () => nowMs,
    advanceDays(days: number) {
      nowMs += days * 24 * 60 * 60 * 1000;
    },
  };
}

describe("usage budget", () => {
  it("charges recorded input tokens against the daily dollar budget", () => {
    const budget = createUsageBudget({ dailyBudgetUsd: 0.01, ipDailyCalls: 100 });

    budget.reserve("1.1.1.1");
    budget.record(Math.round(TOKENS_PER_CENT / 2));
    expect(budget.snapshot().spentUsd).toBeCloseTo(0.005, 4);

    // Still under budget, so the next call is allowed and takes it over.
    budget.reserve("1.1.1.1");
    budget.record(Math.round(TOKENS_PER_CENT));

    expect(() => budget.reserve("1.1.1.1")).toThrow(QuotaExceededError);
    expect(() => budget.reserve("2.2.2.2")).toThrow(/daily Jev budget/);
  });

  it("caps calls per IP without touching other IPs", () => {
    const budget = createUsageBudget({ dailyBudgetUsd: 100, ipDailyCalls: 2 });

    budget.reserve("1.1.1.1");
    budget.reserve("1.1.1.1");
    expect(() => budget.reserve("1.1.1.1")).toThrow(/from your network/);

    expect(() => budget.reserve("2.2.2.2")).not.toThrow();
  });

  it("counts a reservation before the call resolves, so bursts can't overshoot", () => {
    const budget = createUsageBudget({ dailyBudgetUsd: 100, ipDailyCalls: 1 });

    // Reserved but not yet recorded — the in-flight call still occupies the slot.
    budget.reserve("1.1.1.1");
    expect(() => budget.reserve("1.1.1.1")).toThrow(QuotaExceededError);
    expect(budget.snapshot().calls).toBe(1);
  });

  it("resets both counters when the UTC day rolls over", () => {
    const clock = fixedClock("2026-09-17T23:59:00Z");
    const budget = createUsageBudget({
      dailyBudgetUsd: 0.01,
      ipDailyCalls: 1,
      now: clock.now,
    });

    budget.reserve("1.1.1.1");
    budget.record(Math.round(TOKENS_PER_CENT * 2));
    expect(budget.snapshot().day).toBe("2026-09-17");
    expect(() => budget.reserve("1.1.1.1")).toThrow(QuotaExceededError);

    clock.advanceDays(1);

    const next = budget.snapshot();
    expect(next.day).toBe("2026-09-18");
    expect(next.spentUsd).toBe(0);
    expect(next.calls).toBe(0);
    expect(() => budget.reserve("1.1.1.1")).not.toThrow();
  });
});
