"use client";

import { useState } from "react";
import { useScoringRun } from "@/hooks/use-scoring-run";
import { QueryBar } from "@/components/query-bar";
import { FormulaBar } from "@/components/formula-bar";
import { FactorControls } from "@/components/factor-controls";
import { FactorTable } from "@/components/factor-table";
import { StatusBar } from "@/components/status-bar";
import { AddFactorDialog } from "@/components/add-factor-dialog";

export default function Home() {
  const {
    factors,
    weights,
    addFactor,
    removeFactor,
    toggleFactor,
    setWeight,
    queryDraft,
    setQueryDraft,
    isQueryDirty,
    run,
    isRunning,
    rows,
    runStats,
    retryCell,
  } = useScoringRun();

  const [dialogOpen, setDialogOpen] = useState(false);

  return (
    <main className="mx-auto flex w-full max-w-[1400px] flex-1 flex-col gap-4 px-4 py-6 sm:px-6">
      <header className="flex flex-col gap-1">
        <div className="flex items-center gap-2">
          <span className="rounded bg-neutral-900 px-1.5 py-0.5 text-[11px] font-bold tracking-wide text-white dark:bg-neutral-100 dark:text-neutral-900">
            JEV
          </span>
          <h1 className="text-lg font-semibold">City Rerank Playground</h1>
        </div>
        <p className="max-w-2xl text-sm text-neutral-500 dark:text-neutral-400">
          10 hardcoded cities, scored live by Jev on the factors you pick. Type a search
          intent to add a per-query relevance column and watch the ranking reorder in
          real time, compared against a fixed Cost-of-Living + Safety baseline.
        </p>
      </header>

      <QueryBar value={queryDraft} onChange={setQueryDraft} onRun={run} isRunning={isRunning} isDirty={isQueryDirty} />

      <FormulaBar factors={factors} weights={weights} />

      <FactorControls
        factors={factors}
        weights={weights}
        onToggle={toggleFactor}
        onWeight={setWeight}
        onRemove={removeFactor}
        onAddClick={() => setDialogOpen(true)}
      />

      <FactorTable rows={rows} factors={factors} weights={weights} onRetry={retryCell} />

      <StatusBar rows={rows} stats={runStats} isRunning={isRunning} />

      <AddFactorDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        existingColors={factors.map((f) => f.color)}
        onCreate={addFactor}
      />

      <footer className="pb-2 pt-2 text-center text-[11px] text-neutral-400">
        Every column is one isolated Jev question, evaluated independently and combined
        with weights you control — no single prompt, no re-ranking prompt engineering.
      </footer>
    </main>
  );
}
