# Custom Relevance

A one-screen ranking tool built on [Jev](https://docs.typesafe.ai), TypeSafe's System One
model. Type in a list of things (cities, dishes, sports, websites, football clubs) and a
few plain-language factors, and Jev scores every (item, factor) pair live. Factors are
weighted 1-5 and combined into a ranking that updates as you type.

## What it demonstrates

- **Composite scoring** — each factor (e.g. "Cheap to live in") is one isolated Jev `Noul`
  (yes/no) question, asked independently per item. The weights and the weighted average
  live entirely in this app's code, never in a prompt.
- **Spreadsheet-style editing** — add a city or a factor by typing into the trailing empty
  row, the same way you'd add a row in a spreadsheet. No dialogs, no config screens.
- **A switcher built for more than one use case** — the UI is generic over "collections"
  (a noun + a list of items + a list of factors + a prompt template); each collection is a
  single, self-contained data file under `src/lib/collections/`.

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

## Deploy (Railway)

The repo ships a `Dockerfile` (Next.js `output: "standalone"`) and a `railway.json`, so
Railway just needs to build and run it:

1. Railway → **New Project** → **Deploy from GitHub repo** → pick this repo. Railway
   detects the `Dockerfile` automatically.
2. **Variables** → add `TYPESAFE_API_KEY`.
3. **Settings → Networking → Custom Domain** → add `jev.foglight.co`. Railway shows a
   CNAME target for it.
4. In Cloudflare DNS for `foglight.co`, add `CNAME jev → <target Railway gave you>`.
   Either proxy it (orange cloud, with SSL/TLS mode set to **Full (strict)**) or leave it
   DNS-only — both work.
5. `/api/health` is the healthcheck endpoint Railway polls during deploys.

A single always-on instance of this app is light (idles well under 512 MB RAM), so it
comfortably fits inside the Hobby plan's usage-based credit.

## How it's structured

- `src/lib/collections/` — the collections the switcher can pick between. Each file
  (`cities.ts`, `dishes.ts`, `sports.ts`, `websites.ts`, `football-clubs.ts`) is fully
  self-contained: default items, factors, the prompt template/context, and seed scores.
  `index.ts` just lists them as `COLLECTIONS`. Adding a category is a new file plus one
  line in `index.ts` — no UI code changes.
- `src/lib/types.ts` — shared domain types: `Factor` (a statement + a 1-5 weight),
  `Collection` (including its `prompt` — a `{item}`/`{factor}` template and optional extra
  `context`), and the `/api/score` request/response shapes. The client only ever sends a
  `collectionId` to `/api/score`, never a prompt string.
- `src/lib/prompt.ts` — `buildInstructions`, the pure `{item}`/`{factor}` substitution
  shared by `jev-client.ts` and `scripts/seed-collection.mts`.
- `src/lib/scoring.ts` — pure functions: the weighted average of a row's factor values,
  and ranking rows by total. Covered by `scoring.test.ts`.
- `src/lib/jev-client.ts` — server-only wrapper around `@typesafe-ai/sdk`'s `systemOne`.
  Looks up the collection named by `collectionId`, fills its prompt template, and asks
  every enabled factor as a parallel yes/no question in one call per item.
- `src/app/api/score/route.ts` — the only place the API key is used (the browser never
  sees it); also validates `collectionId` against `COLLECTIONS`.
- `src/hooks/use-ranking.ts` — client state: items, factors, per-cell cache, persisted to
  `localStorage` per collection. Adding an item or a factor fetches only the new cells;
  editing a factor's text re-fetches just that column. Every resolved score is cached
  (keyed by item + factor *text*) and saved alongside items/factors, so reloading the page
  or switching collections never re-asks a question it already has an answer for; a
  collection can also ship `seedScores` (see any file in `collections/`) so its defaults
  render with zero requests on a first visit. The explicit per-cell retry always re-asks
  live.
- `src/lib/score-cache.ts` — pure helpers for that cache: normalizing a factor's text into
  a cache key, splitting an (items × factors) grid into cells already answered (cache hit)
  versus cells that still need a live request, and `buildSeedScores` for turning a plain
  items → per-factor-value table into a collection's `seedScores`.
- `scripts/seed-collection.mts` — fetches real Jev answers for a collection's default
  items/factors and prints a `SEED_VALUES` block to paste into its data file. Run after
  adding a collection or changing its items/factors:
  ```bash
  node --env-file=.env --import ./scripts/register-ts-extension-loader.mjs \
    scripts/seed-collection.mts <collectionId>
  ```
  (The `--import` registers `scripts/ts-extension-loader.mjs`, a small Node loader hook
  that lets this script import extensionless from `src/`, matching the rest of the
  codebase, under Node's native TS support.)
- `src/components/site-header.tsx` — the brand bar: the Foglight mark linking to
  foglight.co, and a link to this repo with its star count from `src/lib/github.ts`
  (fetched server-side, revalidated hourly, and simply omitted if GitHub can't be
  reached).
- `src/components/collection-switcher.tsx` — the collection chip and its dropdown.
- `src/components/factor-strip.tsx` — the row of factor cards under the top bar: each
  card is an editable statement plus a 5-segment weight track (1-5, labelled
  Negligible → Essential), and the trailing dashed card adds one.
- `src/components/ranking-table.tsx` — the ranking itself: medals for the top three, the
  weighted total with its bar, one heat-mapped column per factor, and a trailing dashed
  input to add an item. Rows reorder with a spring animation as scores come in.
- `src/components/editable-cell.tsx` — the shared spreadsheet-style input used for both
  editing an existing value and adding a new row.
