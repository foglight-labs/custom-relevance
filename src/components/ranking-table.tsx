"use client";

import { motion } from "motion/react";
import { X } from "lucide-react";
import type { DisplayRow } from "@/hooks/use-ranking";
import type { CellState, Factor } from "@/lib/types";
import { EditableCell } from "@/components/editable-cell";
import { cn } from "@/lib/utils";

function gridTemplate(n: number): string {
  return `40px minmax(140px,1fr) 64px repeat(${n}, minmax(90px,1fr)) 28px`;
}

export function RankingTable({
  rows,
  factors,
  noun,
  onAddItem,
  onRemoveItem,
  onRetry,
}: {
  rows: DisplayRow[];
  factors: Factor[];
  noun: string;
  onAddItem: (name: string) => void;
  onRemoveItem: (name: string) => void;
  onRetry: (name: string, factorId: string) => void;
}) {
  const template = gridTemplate(factors.length);
  const nounCap = noun.charAt(0).toUpperCase() + noun.slice(1);

  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden">
      <div
        className="grid items-center gap-2 border-b border-neutral-200 px-3 py-2 text-[11px] font-semibold uppercase tracking-wide text-neutral-400"
        style={{ gridTemplateColumns: template }}
      >
        <span className="text-center">#</span>
        <span>{nounCap}</span>
        <span>Total</span>
        {factors.map((f) => (
          <span key={f.id} className="truncate normal-case">
            {f.text}
          </span>
        ))}
        <span />
      </div>

      <div className="flex min-h-0 flex-1 flex-col divide-y divide-neutral-100 overflow-y-auto">
        {rows.map((row) => (
          <motion.div
            key={row.name}
            layout
            transition={{ type: "spring", stiffness: 350, damping: 32 }}
            className={cn(
              "group grid items-center gap-2 px-3 py-2",
              row.rowStatus === "error" && "bg-red-50/60",
              row.rowStatus === "partial" && "bg-amber-50/50",
            )}
            style={{ gridTemplateColumns: template }}
          >
            <div className="text-center text-sm font-semibold tabular-nums text-neutral-700">
              {row.rank ?? "–"}
            </div>
            <div className="truncate text-sm font-medium text-neutral-900">{row.name}</div>
            <TotalCell total={row.total} loading={row.rowStatus === "loading"} />
            {factors.map((f) => (
              <Cell key={f.id} cell={row.cells[f.id]} onRetry={() => onRetry(row.name, f.id)} />
            ))}
            <button
              onClick={() => onRemoveItem(row.name)}
              className="invisible text-neutral-300 hover:text-red-500 group-hover:visible"
              aria-label={`Remove ${row.name}`}
            >
              <X className="size-3.5" />
            </button>
          </motion.div>
        ))}

        <div className="grid items-center gap-2 px-3 py-2" style={{ gridTemplateColumns: template }}>
          <span />
          <EditableCell defaultValue="" placeholder={`Add a ${noun}…`} onCommit={onAddItem} />
          <span />
          {factors.map((f) => (
            <span key={f.id} />
          ))}
          <span />
        </div>
      </div>
    </div>
  );
}

function TotalCell({ total, loading }: { total: number | null; loading: boolean }) {
  if (total === null) {
    return <span className="text-xs text-neutral-300">{loading ? "…" : "—"}</span>;
  }
  return <span className="text-sm font-semibold tabular-nums text-neutral-900">{Math.round(total)}</span>;
}

function Cell({ cell, onRetry }: { cell: CellState | undefined; onRetry: () => void }) {
  const status = cell?.status ?? "idle";

  if (status === "idle") {
    return <span className="text-xs text-neutral-300">—</span>;
  }

  if (status === "loading") {
    return (
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-neutral-100">
        <div className="h-full w-1/3 animate-[shimmer_1.2s_ease-in-out_infinite] rounded-full bg-neutral-300" />
      </div>
    );
  }

  if (status === "error") {
    return (
      <button
        onClick={onRetry}
        className="text-xs font-medium text-red-600 hover:underline"
        title={cell?.error}
      >
        retry
      </button>
    );
  }

  const value = cell?.value ?? 0;
  return (
    <div className="flex items-center gap-1.5">
      <span className="w-6 shrink-0 text-right text-xs tabular-nums text-neutral-600">{Math.round(value)}</span>
      <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-neutral-100">
        <div className="h-full rounded-full bg-neutral-700" style={{ width: `${Math.round(value)}%` }} />
      </div>
    </div>
  );
}
