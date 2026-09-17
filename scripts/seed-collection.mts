/**
 * Fetches real Jev answers for one collection's default items/factors and
 * prints a `SEED_VALUES` block ready to paste into that collection's data
 * file (see e.g. `src/lib/collections/cities.ts`).
 *
 * Run from the repo root, with `TYPESAFE_API_KEY` available:
 *
 *   node --env-file=.env --import ./scripts/register-ts-extension-loader.mjs \
 *     scripts/seed-collection.mts <collectionId>
 *
 * This runs under plain Node, not a Server Component, so it talks to the SDK
 * directly instead of importing the `server-only`-guarded `jev-client.ts`.
 */
import { TypeSafeClient, type Questions } from "@typesafe-ai/sdk";
import { COLLECTIONS } from "../src/lib/collections";
import { bareItemName, buildInstructions } from "../src/lib/prompt";

const collectionId = process.argv[2];
if (!collectionId) {
  console.error("Usage: node --env-file=.env scripts/seed-collection.mts <collectionId>");
  console.error(`Known collections: ${COLLECTIONS.map((c) => c.id).join(", ")}`);
  process.exit(1);
}

const collection = COLLECTIONS.find((c) => c.id === collectionId);
if (!collection) {
  console.error(`Unknown collection "${collectionId}". Known: ${COLLECTIONS.map((c) => c.id).join(", ")}`);
  process.exit(1);
}

/** Quotes an object key only when it isn't a bare JS identifier, matching the existing data files' style. */
function formatKey(key: string): string {
  return /^[A-Za-z_$][A-Za-z0-9_$]*$/.test(key) ? key : JSON.stringify(key);
}

async function main() {
  const client = new TypeSafeClient({ timeout: 20_000 });
  const lines: string[] = [];

  for (const itemName of collection!.items) {
    const questions: Questions = {};
    for (const f of collection!.factors) {
      questions[f.id] = {
        type: "noul",
        instructions: buildInstructions(collection!.prompt.template, itemName, f.text),
      };
    }
    const state: Record<string, string> = { [collection!.noun]: bareItemName(itemName) };
    if (collection!.prompt.context) state.context = collection!.prompt.context;

    const result = await client.systemOne({ state, questions });
    const values = collection!.factors.map((f) => {
      const a = result.answers[f.id];
      return a?.type === "noul" ? Math.round(a.noul * 100) : 0;
    });

    lines.push(`  ${formatKey(itemName)}: [${values.join(", ")}],`);
    console.error(`${itemName}: [${values.join(", ")}]`);
  }

  console.log("\nconst SEED_VALUES: Record<string, number[]> = {");
  console.log(lines.join("\n"));
  console.log("};");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
