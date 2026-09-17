"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { EditableCell } from "@/components/editable-cell";
import type { Collection, Factor } from "@/lib/types";

const WEIGHTS = [1, 2, 3, 4, 5] as const;

export function Sidebar({
  collections,
  collectionId,
  onCollectionChange,
  noun,
  factors,
  onAddFactor,
  onEditFactor,
  onSetWeight,
  onRemoveFactor,
  scoredCount,
  totalCount,
  errorCount,
}: {
  collections: Collection[];
  collectionId: string;
  onCollectionChange: (id: string) => void;
  noun: string;
  factors: Factor[];
  onAddFactor: (text: string, weight: number) => void;
  onEditFactor: (id: string, text: string) => void;
  onSetWeight: (id: string, weight: number) => void;
  onRemoveFactor: (id: string) => void;
  scoredCount: number;
  totalCount: number;
  errorCount: number;
}) {
  const [newWeight, setNewWeight] = useState<number>(3);

  return (
    <aside className="flex h-full min-h-0 flex-col gap-4 border-r border-neutral-200 bg-white p-4">
      <select
        value={collectionId}
        onChange={(e) => onCollectionChange(e.target.value)}
        className="w-fit rounded border border-neutral-300 bg-white px-2 py-1 text-sm font-medium text-neutral-900"
      >
        {collections.map((c) => (
          <option key={c.id} value={c.id}>
            {c.label}
          </option>
        ))}
      </select>

      <div className="flex min-h-0 flex-1 flex-col gap-0.5 overflow-y-auto">
        <div className="grid grid-cols-[2.5rem_1fr_1.25rem] gap-2 px-1 pb-1 text-[11px] font-semibold uppercase tracking-wide text-neutral-400">
          <span>Wt</span>
          <span>Factor</span>
          <span />
        </div>

        {factors.map((f) => (
          <div
            key={f.id}
            className="group grid grid-cols-[2.5rem_1fr_1.25rem] items-center gap-2 rounded px-1 py-1 hover:bg-neutral-50"
          >
            <WeightSelect value={f.weight} onChange={(w) => onSetWeight(f.id, w)} />
            <EditableCell defaultValue={f.text} onCommit={(text) => onEditFactor(f.id, text)} />
            <button
              onClick={() => onRemoveFactor(f.id)}
              className="invisible text-neutral-300 hover:text-red-500 group-hover:visible"
              aria-label={`Remove ${f.text}`}
            >
              <X className="size-3.5" />
            </button>
          </div>
        ))}

        <div className="grid grid-cols-[2.5rem_1fr_1.25rem] items-center gap-2 px-1 py-1">
          <WeightSelect value={newWeight} onChange={setNewWeight} />
          <EditableCell
            defaultValue=""
            placeholder="Add a factor…"
            onCommit={(text) => onAddFactor(text, newWeight)}
          />
          <span />
        </div>
      </div>

      <div className="flex flex-col gap-2 border-t border-neutral-200 pt-3 text-xs text-neutral-500">
        <p>
          Every factor is one plain question asked to Jev about each {noun}, answered independently and
          combined with the weights above.
        </p>
        <p className="text-neutral-400">
          {scoredCount}/{totalCount} scored
          {errorCount > 0 ? ` · ${errorCount} need a retry` : ""}
        </p>
      </div>
    </aside>
  );
}

function WeightSelect({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(Number(e.target.value))}
      className="rounded border border-neutral-200 bg-white px-1 py-0.5 text-center text-xs text-neutral-700"
      aria-label="Weight"
    >
      {WEIGHTS.map((n) => (
        <option key={n} value={n}>
          {n}
        </option>
      ))}
    </select>
  );
}
