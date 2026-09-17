import { Loader2 } from "lucide-react";
import type { RunStats } from "@/hooks/use-scoring-run";
import type { DisplayRow } from "@/hooks/use-scoring-run";

export function StatusBar({
  rows,
  stats,
  isRunning,
}: {
  rows: DisplayRow[];
  stats: RunStats;
  isRunning: boolean;
}) {
  const ready = rows.filter((r) => r.rowStatus === "ready").length;

  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 rounded-md border border-neutral-200 bg-neutral-50 px-3 py-1.5 text-[11px] text-neutral-500 dark:border-neutral-800 dark:bg-neutral-900/60 dark:text-neutral-400">
      <span className="flex items-center gap-1.5">
        {isRunning && <Loader2 className="size-3 animate-spin" />}
        {ready}/{rows.length} cities scored
      </span>
      <span>model: {stats.model ?? "—"}</span>
      <span>tokens used: {stats.totalTokens.toLocaleString()}</span>
      <span>requests: {stats.requestCount}</span>
      {stats.errorCount > 0 && <span className="text-red-500">errors: {stats.errorCount}</span>}
      {stats.lastLatencyMs !== null && <span>last cell: {stats.lastLatencyMs}ms</span>}
    </div>
  );
}
