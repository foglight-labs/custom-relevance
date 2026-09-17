"use client";

import { AlertTriangle, RotateCw } from "lucide-react";
import { colorClasses } from "@/lib/colors";
import { isLowConfidence } from "@/lib/scoring";
import type { CellState, FactorDef } from "@/lib/types";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

export function ScoreCell({
  factor,
  cell,
  onRetry,
}: {
  factor: FactorDef;
  cell: CellState | undefined;
  onRetry: () => void;
}) {
  const status = cell?.status ?? "idle";
  const colors = colorClasses(factor.color);

  if (status === "idle") {
    return (
      <div className="flex h-10 items-center justify-center text-neutral-300 dark:text-neutral-700">
        <span className="text-xs">not run</span>
      </div>
    );
  }

  if (status === "loading") {
    return (
      <div className="flex h-10 flex-col justify-center gap-1 px-2" aria-label="Loading">
        <div className="h-2 w-full overflow-hidden rounded-full bg-neutral-100 dark:bg-neutral-800">
          <div className="h-full w-1/3 animate-[shimmer_1.2s_ease-in-out_infinite] rounded-full bg-neutral-300 dark:bg-neutral-600" />
        </div>
      </div>
    );
  }

  if (status === "error") {
    return (
      <button
        onClick={onRetry}
        className="flex h-10 w-full items-center justify-center gap-1.5 rounded px-2 text-xs font-medium text-red-700 transition-opacity hover:opacity-80 dark:text-red-300"
        style={{
          backgroundImage:
            "repeating-linear-gradient(135deg, rgba(248,113,113,0.18) 0px, rgba(248,113,113,0.18) 6px, rgba(248,113,113,0.06) 6px, rgba(248,113,113,0.06) 12px)",
        }}
        title={cell?.error}
      >
        <AlertTriangle className="size-3.5" />
        <span>Retry</span>
        <RotateCw className="size-3" />
      </button>
    );
  }

  const answer = cell?.answer;
  if (!answer) return null;

  const pct = Math.round(answer.normalized * 100);
  const low = isLowConfidence(answer);
  const displayLevelLabel =
    answer.kind === "score" && factor.levels
      ? factor.levels[Math.round(answer.raw)]?.label
      : answer.kind === "noul"
        ? `${Math.round(answer.raw * 100)}% likely`
        : undefined;

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div
          className={cn(
            "flex h-10 w-full cursor-help flex-col justify-center gap-1 rounded px-2 py-1",
            low && "outline outline-1 outline-dashed outline-amber-400/70",
          )}
        >
          <div className="flex items-center justify-between text-[11px] text-neutral-500 dark:text-neutral-400">
            <span className="truncate">{displayLevelLabel}</span>
            <span className="tabular-nums font-medium text-neutral-700 dark:text-neutral-300">{pct}</span>
          </div>
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-neutral-100 dark:bg-neutral-800">
            <div
              className={cn("h-full rounded-full transition-all duration-500", colors.bar)}
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>
      </TooltipTrigger>
      <TooltipContent side="top">
        <ProbabilityBreakdown factor={factor} cell={cell} />
      </TooltipContent>
    </Tooltip>
  );
}

function ProbabilityBreakdown({ factor, cell }: { factor: FactorDef; cell: CellState }) {
  const answer = cell.answer;
  if (!answer) return null;
  const low = isLowConfidence(answer);
  return (
    <div className="space-y-1.5">
      <div className="font-medium text-neutral-900 dark:text-neutral-100">{factor.title}</div>
      <div className="text-neutral-500 dark:text-neutral-400">
        confidence {(answer.confidence * 100).toFixed(0)}%
        {low && <span className="ml-1 text-amber-600 dark:text-amber-400">— split across levels</span>}
      </div>
      <div className="space-y-1">
        {Object.entries(answer.probabilities)
          .sort((a, b) => Number(b[1]) - Number(a[1]))
          .map(([key, p]) => (
            <div key={key} className="flex items-center gap-2">
              <span className="w-20 shrink-0 truncate text-neutral-600 dark:text-neutral-300">
                {answer.legend?.[key] ?? key}
              </span>
              <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-neutral-100 dark:bg-neutral-700">
                <div
                  className="h-full rounded-full bg-neutral-400 dark:bg-neutral-400"
                  style={{ width: `${Math.round(p * 100)}%` }}
                />
              </div>
              <span className="w-8 shrink-0 text-right tabular-nums text-neutral-500">
                {Math.round(p * 100)}%
              </span>
            </div>
          ))}
      </div>
    </div>
  );
}
