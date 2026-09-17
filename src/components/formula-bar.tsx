import type { FactorDef } from "@/lib/types";
import { formatFormula } from "@/lib/scoring";

export function FormulaBar({
  factors,
  weights,
}: {
  factors: FactorDef[];
  weights: Record<string, { enabled: boolean; weight: number }>;
}) {
  const formula = formatFormula(factors, weights);
  return (
    <div className="flex items-center gap-2 rounded-md border border-neutral-200 bg-neutral-50 px-3 py-1.5 font-mono text-xs text-neutral-600 dark:border-neutral-800 dark:bg-neutral-900/60 dark:text-neutral-400">
      <span className="rounded bg-neutral-200 px-1.5 py-0.5 text-[10px] font-semibold text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400">
        fx
      </span>
      <span className="truncate">{formula}</span>
    </div>
  );
}
