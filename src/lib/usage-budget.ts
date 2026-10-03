/**
 * Spend guard for the shared Jev key. Jev has no per-key dollar limit of its
 * own, so this app counts its own: every `systemOne` call reports the input
 * tokens it billed, and input tokens are the only thing Jev charges for
 * ($0.042 / 1M, output free), so the running spend is exactly derivable.
 *
 * Deliberately in-memory: the app is one always-on Node process on Railway
 * with no database, so a module-level counter is consistent for every request
 * it serves. The trade-off is that counters reset on redeploy or restart —
 * which can only ever under-count, and is a deliberate act by the owner.
 *
 * Server-side only (it is meaningless per-browser), but holds no secret.
 */

const USD_PER_INPUT_TOKEN = 0.042 / 1_000_000;

export type QuotaScope = "global" | "ip";

/** "item" scores one ranking row; "map" scores every country at once (~12k tokens). */
export type CallKind = "item" | "map";

export class QuotaExceededError extends Error {
  constructor(
    readonly scope: QuotaScope,
    message: string,
  ) {
    super(message);
    this.name = "QuotaExceededError";
  }
}

export interface UsageBudgetConfig {
  /** Dollars of Jev input tokens this deployment may spend per UTC day. */
  dailyBudgetUsd: number;
  /** Calls one client IP may make per UTC day. One call scores one item. */
  ipDailyCalls: number;
  /** World-map scores one client IP may request per UTC day. */
  ipDailyMapCalls: number;
  /** Injectable clock, for tests. */
  now?: () => number;
}

export interface UsageSnapshot {
  /** The UTC day these counters cover, as YYYY-MM-DD. */
  day: string;
  calls: number;
  mapCalls: number;
  inputTokens: number;
  spentUsd: number;
  budgetUsd: number;
  ipDailyCalls: number;
  ipDailyMapCalls: number;
}

export interface UsageBudget {
  /**
   * Claims one call's worth of quota before the Jev request goes out, so
   * concurrent requests can't all read a stale count and sail past the cap.
   * @throws {QuotaExceededError} The day's dollar budget, or this IP's call
   * allowance for this kind of call, is already used up.
   */
  reserve(ip: string, kind?: CallKind): void;
  /** Records what a completed call actually billed. */
  record(inputTokens: number): void;
  snapshot(): UsageSnapshot;
}

function utcDay(nowMs: number): string {
  return new Date(nowMs).toISOString().slice(0, 10);
}

export function createUsageBudget(config: UsageBudgetConfig): UsageBudget {
  const now = config.now ?? Date.now;

  let day = utcDay(now());
  let calls = 0;
  let mapCalls = 0;
  let inputTokens = 0;
  let spentUsd = 0;
  let callsByIp = new Map<string, number>();
  let mapCallsByIp = new Map<string, number>();

  function rollOver() {
    const today = utcDay(now());
    if (today === day) return;
    day = today;
    calls = 0;
    mapCalls = 0;
    inputTokens = 0;
    spentUsd = 0;
    callsByIp = new Map();
    mapCallsByIp = new Map();
  }

  return {
    reserve(ip, kind = "item") {
      rollOver();
      if (spentUsd >= config.dailyBudgetUsd) {
        throw new QuotaExceededError(
          "global",
          "This demo's daily Jev budget is used up. Try again tomorrow.",
        );
      }
      const counter = kind === "map" ? mapCallsByIp : callsByIp;
      const limit = kind === "map" ? config.ipDailyMapCalls : config.ipDailyCalls;
      const used = counter.get(ip) ?? 0;
      if (used >= limit) {
        throw new QuotaExceededError(
          "ip",
          kind === "map"
            ? "Too many maps scored from your network today. Try again tomorrow."
            : "Too many scores requested from your network today. Try again tomorrow.",
        );
      }
      counter.set(ip, used + 1);
      if (kind === "map") mapCalls += 1;
      else calls += 1;
    },

    record(tokens) {
      rollOver();
      inputTokens += tokens;
      spentUsd += tokens * USD_PER_INPUT_TOKEN;
    },

    snapshot() {
      rollOver();
      return {
        day,
        calls,
        mapCalls,
        inputTokens,
        spentUsd: Number(spentUsd.toFixed(6)),
        budgetUsd: config.dailyBudgetUsd,
        ipDailyCalls: config.ipDailyCalls,
        ipDailyMapCalls: config.ipDailyMapCalls,
      };
    },
  };
}

function positiveNumberFromEnv(name: string, fallback: number): number {
  const raw = process.env[name];
  if (!raw) return fallback;
  const parsed = Number(raw);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

/**
 * The deployment's budget. $1/day is ~24M input tokens, orders of magnitude
 * above what a day of genuine use costs; 300 calls is 300 items scored, far
 * more than the 20-row grid needs even with heavy editing. 30 maps is ~360k
 * tokens (~$0.015) per IP, and repeat factors are cached in the browser.
 */
export const usageBudget = createUsageBudget({
  dailyBudgetUsd: positiveNumberFromEnv("JEV_DAILY_BUDGET_USD", 1),
  ipDailyCalls: positiveNumberFromEnv("JEV_IP_DAILY_CALLS", 300),
  ipDailyMapCalls: positiveNumberFromEnv("JEV_IP_DAILY_MAP_CALLS", 30),
});

/** First hop of `x-forwarded-for` (what Railway's proxy sets), else a shared bucket. */
export function clientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  const first = forwarded?.split(",")[0]?.trim();
  return first || "unknown";
}
