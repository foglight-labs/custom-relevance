"use client";

import { Plus, X } from "lucide-react";
import { colorClasses } from "@/lib/colors";
import type { FactorDef } from "@/lib/types";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function FactorControls({
  factors,
  weights,
  onToggle,
  onWeight,
  onRemove,
  onAddClick,
}: {
  factors: FactorDef[];
  weights: Record<string, { enabled: boolean; weight: number }>;
  onToggle: (id: string, enabled: boolean) => void;
  onWeight: (id: string, weight: number) => void;
  onRemove: (id: string) => void;
  onAddClick: () => void;
}) {
  return (
    <div className="flex flex-col gap-2 rounded-lg border border-neutral-200 bg-white p-3 dark:border-neutral-800 dark:bg-neutral-950">
      <div className="flex items-center justify-between">
        <h2 className="text-xs font-semibold uppercase tracking-wide text-neutral-500">Factors &amp; weights</h2>
        <Button size="sm" variant="outline" onClick={onAddClick} className="gap-1">
          <Plus className="size-3.5" /> Add factor
        </Button>
      </div>
      <div className="flex flex-col divide-y divide-neutral-100 dark:divide-neutral-900">
        {factors.map((f) => {
          const w = weights[f.id] ?? { enabled: false, weight: 50 };
          const colors = colorClasses(f.color);
          return (
            <div key={f.id} className="grid grid-cols-[auto_1fr_auto_5.5rem_auto] items-center gap-3 py-2">
              <Switch checked={w.enabled} onCheckedChange={(v) => onToggle(f.id, v)} />
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className={cn("size-2 shrink-0 rounded-full", colors.dot)} />
                  <span className="truncate text-sm font-medium">{f.title}</span>
                  {f.origin === "query" && (
                    <span className="rounded bg-blue-50 px-1.5 py-0.5 text-[10px] font-medium text-blue-700 dark:bg-blue-950 dark:text-blue-300">
                      query
                    </span>
                  )}
                </div>
                <p className="truncate text-[11px] text-neutral-400">{f.summary}</p>
              </div>
              <span className="w-8 text-right text-[11px] tabular-nums text-neutral-400">{w.weight}</span>
              <Slider
                value={[w.weight]}
                max={100}
                step={5}
                disabled={!w.enabled}
                onValueChange={([v]) => onWeight(f.id, v)}
              />
              {f.origin === "custom" ? (
                <button
                  onClick={() => onRemove(f.id)}
                  className="text-neutral-300 hover:text-red-500"
                  aria-label={`Remove ${f.title}`}
                >
                  <X className="size-4" />
                </button>
              ) : (
                <span className="size-4" />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
