# Jev City Rerank Playground

A one-page search-engine playtool built to show off [Jev](https://docs.typesafe.ai),
TypeSafe's System One model. Ten hardcoded cities are scored live against factors you
pick, in an Excel-like table with realistic wait/error states, then reranked whenever you
type a search query.

## What it demonstrates

- **Composite scoring** — every factor (Cost of Living, Safety, Nightlife, a custom
  "Pet-Friendliness" question, ...) is one isolated Jev `Score` or `Noul` question. The
  weights and the final formula live entirely in this app's code (see the `fx` bar), never
  in a prompt.
- **Per-query reranking** — typing a search intent adds a live "Query Match" `Noul`
  column and reorders the table, with a ▲/▼ delta badge showing movement against a fixed
  Cost-of-Living + Safety baseline.
- **Wait / degraded states** — shimmering cells while a request is in flight, a dashed
  amber outline on low-confidence answers (with a hover breakdown of the probability
  distribution), and a red hatched retry state on failure.

## Setup

```bash
pnpm install
```

Put your key in `.env`:

```
TYPESAFE_API_KEY=sk-...
```

## Run

```bash
pnpm dev       # http://localhost:3000
```

## Validate

```bash
pnpm test      # vitest — scoring math (normalize, composite, ranking)
pnpm lint      # eslint
pnpm exec tsc --noEmit
pnpm build     # production build
```

## How it's structured

- `src/lib/cities.ts` — the 10 hardcoded cities and their neutral profile text (the `state`
  Jev evaluates).
- `src/lib/factors.ts` — preset factor definitions (Score rubrics / Noul criteria).
- `src/lib/scoring.ts` — pure functions: normalize a raw Jev answer to 0-1, compute the
  weighted composite, rank rows, and format the `fx` formula string. Covered by
  `scoring.test.ts`.
- `src/lib/jev-client.ts` — server-only wrapper around `@typesafe-ai/sdk`'s `systemOne`.
  One call per city, with every enabled factor asked as a parallel question.
- `src/app/api/score/route.ts` — the only place the API key is used; the browser never
  sees it.
- `src/hooks/use-scoring-run.ts` — client state: factors, weights, per-cell cache
  (factor answers persist across weight changes and are only refetched when a query or a
  brand-new factor requires it), and the fetch orchestration with `AbortController`.
- `src/components/` — `query-bar`, `formula-bar`, `factor-controls` (weights panel + add
  factor dialog), `factor-table` (the spreadsheet), `score-cell` (per-cell states),
  `status-bar`.
