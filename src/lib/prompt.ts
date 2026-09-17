/**
 * Pure prompt-template filling, split out from `jev-client.ts` so it can be
 * imported by `scripts/seed-collection.ts` without pulling in the
 * `server-only` guard (that script runs under plain Node, not a Server
 * Component).
 */

/**
 * A leading national flag (two regional-indicator symbols) or a single
 * pictographic emoji (with an optional emoji-presentation selector), plus
 * the space that follows it. Display prefixes like "🇦🇲 Yerevan" stay in
 * the UI and cache keys; Jev is asked about "Yerevan".
 */
const LEADING_EMOJI = /^(?:[\u{1F1E6}-\u{1F1FF}]{2}|\p{Extended_Pictographic}\uFE0F?)\s+/u;

/** Item name as Jev should see it. */
export function bareItemName(itemName: string): string {
  return itemName.replace(LEADING_EMOJI, "");
}

/** Fills a collection's prompt template for one (item, factor) pair. */
export function buildInstructions(template: string, itemName: string, factorText: string): string {
  return template.replace("{item}", bareItemName(itemName)).replace("{factor}", factorText);
}
