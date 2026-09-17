/**
 * Size caps on a ranking grid. Shared by the client (which stops offering the
 * "add" affordance at the cap) and `/api/score` (which rejects anything over
 * it), so a hand-rolled request can't ask Jev a bigger question than the UI can.
 */

/** Rows. Every collection ships 10 items by default. */
export const MAX_ITEMS = 20;
/** Columns. Every collection ships 4 factors by default. */
export const MAX_FACTORS = 6;

export const MAX_ITEM_NAME_LENGTH = 80;
export const MAX_FACTOR_TEXT_LENGTH = 160;

/** Trims and truncates one user-typed value to its cap. */
export function clampText(value: string, maxLength: number): string {
  return value.trim().slice(0, maxLength);
}
