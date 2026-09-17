/**
 * Pure prompt-template filling, split out from `jev-client.ts` so it can be
 * imported by `scripts/seed-collection.ts` without pulling in the
 * `server-only` guard (that script runs under plain Node, not a Server
 * Component).
 */

/** Fills a collection's prompt template for one (item, factor) pair. */
export function buildInstructions(template: string, itemName: string, factorText: string): string {
  return template.replace("{item}", itemName).replace("{factor}", factorText);
}
