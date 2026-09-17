"use client";

import { motion } from "motion/react";
import { ArrowDown, ArrowUp, Minus } from "lucide-react";
import type { DisplayRow } from "@/hooks/use-scoring-run";
import type { FactorDef } from "@/lib/types";
import { colorClasses } from "@/lib/colors";
import { ScoreCell } from "@/components/score-cell";
import { cn } from "@/lib/utils";

function gridTemplate(n: number) {
  return `56px 64px minmax(170px,1fr) 140px repeat(${n}, minmax(120px,150px))`;
}

export function FactorTable({
  rows,
  factors,
  weights,
  onRetry,
}: {
  rows: DisplayRow[];
  factors: FactorDef[];
  weights: Record<string, { enabled: boolean; weight: number }>;
  onRetry: (cityId: string, factorId: string) => void;
}) {
  const visibleFactors = factors.filter((f) => weights[f.id]?.enabled);
  const template = gridTemplate(visibleFactors.length);

  return (
    <div className="overflow-x-auto rounded-lg border border-neutral-200 dark:border-neutral-800">
      <div className="min-w-max">
        <div
          className="sticky top-0 z-10 grid items-center gap-2 border-b border-neutral-200 bg-neutral-50/95 px-2 py-2 text-[11px] font-semibold uppercase tracking-wide text-neutral-500 backdrop-blur dark:border-neutral-800 dark:bg-neutral-900/95"
          style={{ gridTemplateColumns: template }}
        >
          <div className="text-center">#</div>
          <div className="text-center">Δ</div>
          <div>City</div>
          <div>Total</div>
          {visibleFactors.map((f) => {
            const colors = colorClasses(f.color);
            const w = weights[f.id]?.weight ?? 0;
            return (
              <div key={f.id} className="min-w-0">
                <div className={cn("flex items-center gap-1.5 truncate", colors.headerText)}>
                  <span className={cn("size-1.5 shrink-0 rounded-full", colors.dot)} />
                  <span className="truncate normal-case">{f.title}</span>
                </div>
                <span className="text-[10px] font-normal normal-case text-neutral-400">weight {w}</span>
              </div>
            );
          })}
        </div>

        <div className="flex flex-col divide-y divide-neutral-100 dark:divide-neutral-900">
          {rows.map((row) => (
            <motion.div
              key={row.city.id}
              layout
              transition={{ type: "spring", stiffness: 350, damping: 32 }}
              className={cn(
                "grid items-center gap-2 px-2 py-2",
                row.rowStatus === "error" && "bg-red-50/60 dark:bg-red-950/20",
                row.rowStatus === "partial" && "bg-amber-50/50 dark:bg-amber-950/10",
              )}
              style={{ gridTemplateColumns: template }}
            >
              <div className="text-center text-sm font-semibold tabular-nums text-neutral-700 dark:text-neutral-300">
                {row.rank ?? "–"}
              </div>
              <div className="flex justify-center">
                <DeltaBadge delta={row.delta} />
              </div>
              <div className="flex min-w-0 items-center gap-2">
                <span className="text-lg leading-none">{row.city.flag}</span>
                <div className="min-w-0">
                  <div className="truncate text-sm font-medium">{row.city.name}</div>
                  <div className="truncate text-[11px] text-neutral-400">
                    {row.city.country} · {row.city.population}
                  </div>
                </div>
              </div>
              <div>
                <TotalCell total={row.total} status={row.rowStatus} />
              </div>
              {visibleFactors.map((f) => (
                <ScoreCell
                  key={f.id}
                  factor={f}
                  cell={row.cells[f.id]}
                  onRetry={() => onRetry(row.city.id, f.id)}
                />
              ))}
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}

function DeltaBadge({ delta }: { delta: number | null }) {
  if (delta === null || delta === 0) {
    return <Minus className="size-3.5 text-neutral-300" />;
  }
  const up = delta > 0;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-[11px] font-semibold tabular-nums",
        up
          ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400"
          : "bg-red-50 text-red-700 dark:bg-red-950/50 dark:text-red-400",
      )}
    >
      {up ? <ArrowUp className="size-3" /> : <ArrowDown className="size-3" />}
      {Math.abs(delta)}
    </span>
  );
}

function TotalCell({ total, status }: { total: number | null; status: DisplayRow["rowStatus"] }) {
  if (total === null) {
    return (
      <span className="text-xs text-neutral-300">
        {status === "loading" ? "scoring…" : "—"}
      </span>
    );
  }
  const pct = Math.round(total * 100);
  return (
    <div className="flex flex-col gap-1">
      <span className="text-sm font-semibold tabular-nums">{pct}</span>
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-neutral-100 dark:bg-neutral-800">
        <div
          className="h-full rounded-full bg-neutral-800 transition-all duration-500 dark:bg-neutral-200"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
