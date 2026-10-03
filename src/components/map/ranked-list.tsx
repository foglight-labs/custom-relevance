"use client";

import { Medal, isMedalRank } from "@/components/medal";
import { toPercent, toPercentScore, type CountryScore } from "@/lib/map/questions";
import { cn } from "@/lib/utils";

export interface RankedCountry extends CountryScore {
  rank: number;
}

export function RankedList({
  title,
  items,
  colorFor,
  selectedKey,
  onHighlight,
  onSelect,
}: {
  title: string;
  items: RankedCountry[];
  colorFor: (score: number) => string;
  selectedKey: string | null;
  onHighlight: (key: string | null) => void;
  onSelect: (key: string) => void;
}) {
  return (
    <section className="overflow-hidden rounded-[10px] border border-hairline bg-panel">
      <h2 className="flex h-[34px] items-center border-b border-hairline px-4 text-[13px] font-medium text-muted">
        {title}
      </h2>
      <ol onMouseLeave={() => onHighlight(null)}>
        {items.map((c) => (
          <li key={c.key} className="border-b border-hairline last:border-b-0">
            <button
              type="button"
              onMouseEnter={() => onHighlight(c.key)}
              onFocus={() => onHighlight(c.key)}
              onBlur={() => onHighlight(null)}
              onClick={() => onSelect(c.key)}
              aria-pressed={selectedKey === c.key}
              className={cn(
                "grid h-[46px] w-full cursor-pointer grid-cols-[36px_12px_1fr_auto_auto] items-center gap-2.5 pr-4 pl-2 text-left transition-colors hover:bg-soft focus-visible:bg-soft focus-visible:outline-none",
                selectedKey === c.key && "bg-soft",
              )}
            >
              <span className="flex justify-center">
                {isMedalRank(c.rank) ? (
                  <Medal rank={c.rank} />
                ) : (
                  <span className="text-[13px] font-medium text-muted tabular-nums">{c.rank}</span>
                )}
              </span>
              <span className="size-3 rounded-[3px]" style={{ backgroundColor: colorFor(c.score) }} />
              <span className="truncate font-display text-[15px] font-semibold text-main">{c.name}</span>
              <span className="font-display text-[16px] font-semibold text-main tabular-nums">
                {toPercentScore(c.score)}
              </span>
              <span className="min-w-[64px] text-right text-xs whitespace-nowrap text-dim tabular-nums">{toPercent(c.confidence)} conf.</span>
            </button>
          </li>
        ))}
      </ol>
    </section>
  );
}
