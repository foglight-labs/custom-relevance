"use client";

import { useState } from "react";
import { MAX_FACTOR_TEXT_LENGTH } from "@/lib/limits";
import { cacheKey } from "@/lib/score-cache";
import { cn } from "@/lib/utils";

export const SUGGESTED_FACTORS = [
  "Quality of street food",
  "Safety walking at night",
  "Cost of living",
  "Internet speed",
  "Coffee culture",
] as const;

export function MapFactorBar({
  factor,
  loading,
  onSubmit,
}: {
  factor: string;
  loading: boolean;
  onSubmit: (factor: string) => void;
}) {
  const [draft, setDraft] = useState(factor);
  const trimmed = draft.trim();

  return (
    <section
      aria-label="Map factor"
      className="border-b border-hairline bg-page px-4 py-4 sm:px-8 sm:py-5"
    >
      <div className="mx-auto flex max-w-[1200px] flex-col gap-3">
        <form
          className="flex gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            if (trimmed) onSubmit(trimmed);
          }}
        >
          <input
            type="text"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            maxLength={MAX_FACTOR_TEXT_LENGTH}
            placeholder="Score countries by…"
            aria-label="Factor to score every country by"
            enterKeyHint="go"
            className="h-11 min-w-0 flex-1 rounded-lg border border-hairline bg-panel px-3.5 text-base font-medium text-main transition-colors placeholder:font-normal placeholder:text-dim hover:border-[#d8d2c7] focus:border-accent focus:shadow-[0_0_0_2px_var(--accent-ring)] focus:outline-none sm:h-[38px] sm:max-w-[520px] sm:text-[14px]"
          />
          <button
            type="submit"
            disabled={!trimmed || loading}
            className="inline-flex h-11 shrink-0 cursor-pointer items-center rounded-lg bg-accent px-4 text-[14px] font-semibold text-white transition-colors hover:bg-[#0c625b] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent disabled:cursor-not-allowed disabled:bg-accent/40 sm:h-[38px] sm:text-[13.5px]"
          >
            {loading ? "Scoring…" : "Score"}
          </button>
        </form>

        <div className="-mx-4 flex items-center gap-2 overflow-x-auto px-4 sm:mx-0 sm:flex-wrap sm:px-0">
          <span className="shrink-0 text-[13px] text-dim">Try</span>
          {SUGGESTED_FACTORS.map((suggestion) => {
            const active = cacheKey(suggestion) === cacheKey(factor);
            return (
              <button
                key={suggestion}
                type="button"
                disabled={loading && active}
                aria-pressed={active}
                onClick={() => {
                  setDraft(suggestion);
                  onSubmit(suggestion);
                }}
                className={cn(
                  "inline-flex h-8 shrink-0 cursor-pointer items-center rounded-full border px-3 text-[13px] font-medium whitespace-nowrap transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent",
                  active
                    ? "border-accent/40 bg-accent/8 text-accent"
                    : "border-hairline bg-panel text-muted hover:border-accent/50 hover:text-accent",
                )}
              >
                {suggestion}
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}
