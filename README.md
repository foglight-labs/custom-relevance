# Jev Ranking

A one-screen ranking tool built on [Jev](https://docs.typesafe.ai), TypeSafe's System One
model. Type in a list of things (cities, to start) and a few plain-language factors, and
Jev scores every (item, factor) pair live. Factors are weighted 1-5 and combined into a
ranking that updates as you type.

## What it demonstrates

- **Composite scoring** — each factor (e.g. "Cheap to live in") is one isolated Jev `Noul`
  (yes/no) question, asked independently per item. The weights and the weighted average
  live entirely in this app's code, never in a prompt.
- **Spreadsheet-style editing** — add a city or a factor by typing into the trailing empty
  row, the same way you'd add a row in a spreadsheet. No dialogs, no config screens.
- **A switcher built for more than one use case** — the UI is generic over "collections"
  (a noun + a list of items + a list of factors); Cities ships today, but a second
  collection is a data-only addition in `src/lib/collections.ts`.

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
pnpm test      # vitest — scoring math (weighted average, ranking)
pnpm lint      # eslint
pnpm exec tsc --noEmit
pnpm build     # production build
```

## How it's structured

- `src/lib/collections.ts` — the collections the switcher can pick between (just Cities
  today) with their default items and factors.
- `src/lib/types.ts` — shared domain types: `Factor` (a statement + a 1-5 weight),
  `Collection`, and the `/api/score` request/response shapes.
- `src/lib/scoring.ts` — pure functions: the weighted average of a row's factor values,
  and ranking rows by total. Covered by `scoring.test.ts`.
- `src/lib/jev-client.ts` — server-only wrapper around `@typesafe-ai/sdk`'s `systemOne`.
  One call per item, asking every enabled factor as a parallel yes/no question.
- `src/app/api/score/route.ts` — the only place the API key is used; the browser never
  sees it.
- `src/hooks/use-ranking.ts` — client state: items, factors, per-cell cache, persisted to
  `localStorage` per collection. Adding an item or a factor fetches only the new cells;
  editing a factor's text re-fetches just that column. Every resolved score is cached
  (keyed by item + factor *text*) and saved alongside items/factors, so reloading the page
  or switching collections never re-asks a question it already has an answer for; a
  collection can also ship `seedScores` (see `collections.ts`) so its defaults render with
  zero requests on a first visit. The explicit per-cell retry always re-asks live.
- `src/lib/score-cache.ts` — pure helpers for that cache: normalizing a factor's text into
  a cache key, and splitting an (items × factors) grid into cells already answered
  (cache hit) versus cells that still need a live request.
- `src/components/sidebar.tsx` — the left panel: collection switcher, factor sheet
  (weight + statement, editable in place), and a short status line.
- `src/components/ranking-table.tsx` — the right panel: the live ranking, one column per
  factor, reordering with a spring animation as scores come in.
- `src/components/editable-cell.tsx` — the shared spreadsheet-style input used for both
  editing an existing value and adding a new row.
