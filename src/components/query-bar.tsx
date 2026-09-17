"use client";

import { Loader2, Search, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export function QueryBar({
  value,
  onChange,
  onRun,
  isRunning,
  isDirty,
}: {
  value: string;
  onChange: (v: string) => void;
  onRun: () => void;
  isRunning: boolean;
  isDirty: boolean;
}) {
  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
      <div className="relative flex-1">
        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-neutral-400" />
        <Input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") onRun();
          }}
          placeholder='Try: "cheap and warm for remote work" or "safe city with great nightlife"'
          className="h-11 pl-9 pr-3 text-sm"
        />
      </div>
      <Button onClick={onRun} disabled={isRunning} size="default" className="h-11 gap-2 px-5">
        {isRunning ? <Loader2 className="size-4 animate-spin" /> : <Sparkles className="size-4" />}
        {isRunning ? "Scoring…" : "Run"}
        <kbd className="ml-1 hidden rounded border border-white/20 px-1 text-[10px] opacity-70 sm:inline">⌘⏎</kbd>
      </Button>
      {isDirty && !isRunning && (
        <span className={cn("text-xs font-medium text-amber-600 dark:text-amber-400")}>
          Query changed — run to re-score
        </span>
      )}
    </div>
  );
}
