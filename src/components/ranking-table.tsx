"use client";

import { motion } from "motion/react";
import { X } from "lucide-react";
import { EditableCell } from "@/components/editable-cell";
import { Medal, isMedalRank } from "@/components/medal";
import type { DisplayRow } from "@/hooks/use-ranking";
import { MAX_ITEM_NAME_LENGTH } from "@/lib/limits";
import type { CellState, Factor } from "@/lib/types";
import { cn } from "@/lib/utils";

function gridTemplate(factorCount: number): string {
  return `56px minmax(180px,25fr) 100px repeat(${factorCount}, minmax(120px,20fr)) 40px`;
}

export function RankingTable({
  rows,
  factors,
  noun,
  maxItems,
  onAddItem,
  onRemoveItem,
  onRetry,
}: {
  rows: DisplayRow[];
  factors: Factor[];
  noun: string;
  maxItems: number;
  onAddItem: (name: string) => void;
  onRemoveItem: (name: string) => void;
  onRetry: (name: string, factorId: string) => void;
}) {
  const nounCap = noun.charAt(0).toUpperCase() + noun.slice(1);
  const full = rows.length >= maxItems;

  return (
    <main className="bg-page px-4 pt-5 pb-[max(4rem,env(safe-area-inset-bottom))] sm:px-8 sm:pt-6">
      <div className="md:hidden">
        <MobileRankingCards
          rows={rows}
          factors={factors}
          noun={noun}
          maxItems={maxItems}
          onAddItem={onAddItem}
          onRemoveItem={onRemoveItem}
          onRetry={onRetry}
        />
      </div>

      <div className="hidden overflow-x-auto md:block">
        <DesktopRankingTable
          rows={rows}
          factors={factors}
          noun={noun}
          nounCap={nounCap}
          maxItems={maxItems}
          full={full}
          onAddItem={onAddItem}
          onRemoveItem={onRemoveItem}
          onRetry={onRetry}
        />
      </div>
    </main>
  );
}

interface RankingViewProps {
  rows: DisplayRow[];
  factors: Factor[];
  noun: string;
  maxItems: number;
  onAddItem: (name: string) => void;
  onRemoveItem: (name: string) => void;
  onRetry: (name: string, factorId: string) => void;
}

function DesktopRankingTable({
  rows,
  factors,
  noun,
  nounCap,
  maxItems,
  full,
  onAddItem,
  onRemoveItem,
  onRetry,
}: RankingViewProps & { nounCap: string; full: boolean }) {
  const template = gridTemplate(factors.length);

  return (
    <div className="min-w-[960px] overflow-hidden rounded-[10px] border border-hairline bg-panel">
        <div
          className="grid h-[34px] items-center border-b border-hairline text-[13px] font-medium text-muted select-none"
          style={{ gridTemplateColumns: template }}
        >
          <span className="text-center">#</span>
          <span className="pl-3">{nounCap}</span>
          <span className="px-2">Total</span>
          {factors.map((f) => (
            <span key={f.id} className="truncate px-1.5 text-center" title={f.text}>
              {f.text}
            </span>
          ))}
          <span />
        </div>

        {rows.map((row) => (
          <motion.div
            key={row.name}
            layout
            transition={{ type: "spring", stiffness: 350, damping: 32 }}
            className="group grid h-[60px] items-center border-b border-hairline transition-colors hover:bg-soft"
            style={{ gridTemplateColumns: template }}
          >
            <div className="flex justify-center">
              {row.rank !== null && isMedalRank(row.rank) ? (
                <Medal rank={row.rank} />
              ) : (
                <span className="text-sm font-medium text-muted tabular-nums">{row.rank ?? "—"}</span>
              )}
            </div>

            <div className="truncate pl-3 font-display text-[17px] leading-tight font-semibold text-main">
              {row.name}
            </div>

            <TotalCell total={row.total} />

            {factors.map((f) => (
              <div key={f.id} className="px-1.5">
                <Cell cell={row.cells[f.id]} onRetry={() => onRetry(row.name, f.id)} />
              </div>
            ))}

            <div className="flex justify-center">
              <button
                type="button"
                onClick={() => onRemoveItem(row.name)}
                aria-label={`Remove ${row.name}`}
                className="invisible flex size-7 items-center justify-center rounded-md text-dim transition-colors group-focus-within:visible group-hover:visible hover:bg-red-100 hover:text-red-500 focus:visible"
              >
                <X className="size-4" />
              </button>
            </div>
          </motion.div>
        ))}

        <div className="grid h-[60px] items-center" style={{ gridTemplateColumns: template }}>
          <span className="text-center text-base text-dim">{full ? "" : "+"}</span>
          <div className="flex items-center gap-2.5 pl-3">
            {full ? (
              <span className="text-[13px] text-muted">
                Limit of {maxItems} — remove a {noun} to add another.
              </span>
            ) : (
              <>
                <EditableCell
                  defaultValue=""
                  placeholder={`Add a ${noun}…`}
                  maxLength={MAX_ITEM_NAME_LENGTH}
                  onCommit={onAddItem}
                  className="h-9 w-[220px] shrink-0 rounded-md border border-dashed border-[#d1d5db] px-3 text-sm transition-colors hover:border-[#9ca3af] hover:bg-white focus:border-[#9ca3af] focus:bg-white"
                />
                <span className="text-xs text-dim tabular-nums">
                  {rows.length}/{maxItems}
                </span>
              </>
            )}
          </div>
        </div>
      </div>
  );
}

function MobileRankingCards({
  rows,
  factors,
  noun,
  maxItems,
  onAddItem,
  onRemoveItem,
  onRetry,
}: RankingViewProps) {
  const full = rows.length >= maxItems;

  return (
    <div className="flex flex-col gap-3">
      {rows.map((row) => (
        <motion.article
          key={row.name}
          layout
          transition={{ type: "spring", stiffness: 350, damping: 32 }}
          className="overflow-hidden rounded-[10px] border border-hairline bg-panel"
        >
          <div className="flex min-h-[72px] items-center gap-2.5 px-3">
            <div className="flex w-9 shrink-0 justify-center">
              {row.rank !== null && isMedalRank(row.rank) ? (
                <Medal rank={row.rank} />
              ) : (
                <span className="text-sm font-medium text-muted tabular-nums">{row.rank ?? "—"}</span>
              )}
            </div>

            <div className="min-w-0 flex-1 font-display text-[17px] leading-tight font-semibold text-main">
              {row.name}
            </div>

            <MobileTotalCell total={row.total} />

            <button
              type="button"
              onClick={() => onRemoveItem(row.name)}
              aria-label={`Remove ${row.name}`}
              className="flex size-10 shrink-0 items-center justify-center rounded-md text-dim transition-colors hover:bg-red-100 hover:text-red-500"
            >
              <X className="size-4" />
            </button>
          </div>

          {factors.length > 0 && (
            <div aria-label={`Scores for ${row.name}`}>
              {factors.map((factor) => (
                <div
                  key={factor.id}
                  className="flex min-h-[54px] items-center gap-3 border-t border-hairline px-3.5 py-2"
                >
                  <span className="min-w-0 flex-1 text-[13px] leading-snug font-medium text-muted">
                    {factor.text}
                  </span>
                  <div className="w-[88px] shrink-0">
                    <Cell cell={row.cells[factor.id]} onRetry={() => onRetry(row.name, factor.id)} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </motion.article>
      ))}

      <div className="rounded-[10px] border border-hairline bg-panel p-3">
        {full ? (
          <p className="px-1 py-2 text-[13px] text-muted">
            Limit of {maxItems} — remove a {noun} to add another.
          </p>
        ) : (
          <div className="flex items-center gap-2.5">
            <span className="flex size-8 shrink-0 items-center justify-center text-lg text-dim">+</span>
            <EditableCell
              defaultValue=""
              placeholder={`Add a ${noun}…`}
              maxLength={MAX_ITEM_NAME_LENGTH}
              onCommit={onAddItem}
              className="h-11 min-w-0 flex-1 rounded-md border border-dashed border-[#d1d5db] px-3 text-base transition-colors hover:border-[#9ca3af] focus:border-[#9ca3af] focus:bg-white"
            />
            <span className="shrink-0 text-xs text-dim tabular-nums">
              {rows.length}/{maxItems}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

function MobileTotalCell({ total }: { total: number | null }) {
  return (
    <div className="flex w-[62px] shrink-0 flex-col items-end gap-1">
      <span
        className={cn(
          "font-display text-[20px] leading-[1.1] font-semibold tabular-nums",
          total === null ? "text-dim" : "text-main",
        )}
      >
        {total === null ? "—" : total.toFixed(1)}
      </span>
      {total !== null && (
        <div className="h-[3px] w-full overflow-hidden rounded-sm bg-track">
          <div className="h-full rounded-sm bg-accent" style={{ width: `${Math.min(100, total)}%` }} />
        </div>
      )}
    </div>
  );
}

function TotalCell({ total }: { total: number | null }) {
  return (
    <div className="flex w-[84px] flex-col items-start gap-1 px-2">
      <span
        className={cn(
          "font-display text-[20px] leading-[1.1] font-semibold tabular-nums",
          total === null ? "text-dim" : "text-main",
        )}
      >
        {total === null ? "—" : total.toFixed(1)}
      </span>
      {total !== null && (
        <div className="h-[3px] w-full overflow-hidden rounded-sm bg-track">
          <div className="h-full rounded-sm bg-accent" style={{ width: `${Math.min(100, total)}%` }} />
        </div>
      )}
    </div>
  );
}

const TILE = "flex h-[38px] items-center justify-center rounded-md text-sm font-semibold tabular-nums select-none";

function Cell({ cell, onRetry }: { cell: CellState | undefined; onRetry: () => void }) {
  const status = cell?.status ?? "idle";

  if (status === "loading" || status === "idle") {
    return (
      <div
        className={cn(TILE, "animate-[pulseLoading_1.6s_ease-in-out_infinite_alternate] tracking-[2px] text-dim")}
        title="Scoring factor…"
      >
        ···
      </div>
    );
  }

  if (status === "error") {
    // A spent budget won't clear until tomorrow, so offering a retry would
    // only invite a click that can't work.
    if (cell?.code === "quota_exceeded") {
      return (
        <div
          title={cell.error ?? "The demo's daily Jev budget is used up."}
          className={cn(TILE, "w-full border border-hairline bg-soft text-xs text-muted")}
        >
          Limit
        </div>
      );
    }
    return (
      <button
        type="button"
        onClick={onRetry}
        title={cell?.error ?? "Scoring failed. Click to retry."}
        className={cn(
          TILE,
          "w-full cursor-pointer border border-[#fee2e2] bg-[#fef2f2] text-xs text-[#dc2626] transition-colors hover:border-[#fca5a5] hover:bg-[#fee2e2]",
        )}
      >
        Retry
      </button>
    );
  }

  const value = cell?.value ?? 0;
  return (
    <div className={TILE} style={{ backgroundColor: heatmapTint(value) }}>
      {Math.round(value)}
    </div>
  );
}

/** 0 reads as a barely-there tint, 100 as the strongest one the paper carries. */
function heatmapTint(value: number): string {
  const alpha = 0.05 + 0.35 * (Math.max(0, Math.min(100, value)) / 100);
  return `rgba(15, 118, 110, ${alpha.toFixed(3)})`;
}
