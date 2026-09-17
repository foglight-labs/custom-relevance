"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { EditableCell } from "@/components/editable-cell";
import type { Factor } from "@/lib/types";
import { cn } from "@/lib/utils";

const WEIGHT_LABELS = ["Negligible", "Minor", "Moderate", "Important", "Essential"] as const;

const CARD = "h-[88px] w-[240px] shrink-0 rounded-[10px] box-border";

/** Plain text at rest, an obviously-editable field once focused. */
const TITLE_INPUT =
  "-mx-2 -my-1 w-full rounded-md border border-transparent px-2 py-1 text-[14px] font-medium text-main placeholder:text-dim focus:border-accent focus:bg-white focus:shadow-[0_0_0_2px_var(--accent-ring)]";

export function FactorStrip({
  factors,
  onAddFactor,
  onEditFactor,
  onSetWeight,
  onRemoveFactor,
}: {
  factors: Factor[];
  onAddFactor: (text: string, weight: number) => void;
  onEditFactor: (id: string, text: string) => void;
  onSetWeight: (id: string, weight: number) => void;
  onRemoveFactor: (id: string) => void;
}) {
  const [draftWeight, setDraftWeight] = useState(3);
  const [adding, setAdding] = useState(false);

  return (
    <section className="overflow-x-auto border-b border-hairline bg-page px-8 py-5">
      <div className="flex min-w-min items-stretch gap-3">
        {factors.map((f) => (
          <FactorCard key={f.id} factor={f} onEdit={onEditFactor} onSetWeight={onSetWeight} onRemove={onRemoveFactor} />
        ))}

        {adding ? (
          <div className={cn(CARD, "flex flex-col justify-between border border-hairline bg-panel p-3.5")}>
            <div className="flex h-[22px] items-start gap-2">
              <EditableCell
                autoFocus
                defaultValue=""
                placeholder="Factor…"
                className={TITLE_INPUT}
                onCommit={(text) => {
                  onAddFactor(text, draftWeight);
                  setAdding(false);
                }}
                onDeleteWhenEmpty={() => setAdding(false)}
              />
            </div>
            <WeightTrack weight={draftWeight} onChange={setDraftWeight} />
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setAdding(true)}
            className={cn(
              CARD,
              "flex cursor-pointer flex-col items-center justify-center gap-[3px] border-2 border-dashed border-[#d1d5db] transition-colors hover:border-[#9ca3af] hover:bg-soft",
            )}
          >
            <span className="text-2xl leading-none font-normal text-dim">+</span>
            <span className="text-[13px] font-medium text-muted">Add factor</span>
          </button>
        )}
      </div>
    </section>
  );
}

function FactorCard({
  factor,
  onEdit,
  onSetWeight,
  onRemove,
}: {
  factor: Factor;
  onEdit: (id: string, text: string) => void;
  onSetWeight: (id: string, weight: number) => void;
  onRemove: (id: string) => void;
}) {
  return (
    <div
      className={cn(
        CARD,
        "group relative flex flex-col justify-between border border-hairline bg-panel p-3.5 transition-colors hover:border-[#d1d5db] hover:bg-soft",
      )}
    >
      <div className="flex h-[22px] items-start gap-2">
        <EditableCell
          key={factor.text}
          defaultValue={factor.text}
          className={cn(TITLE_INPUT, "truncate")}
          onCommit={(text) => onEdit(factor.id, text)}
        />
        <button
          type="button"
          onClick={() => onRemove(factor.id)}
          aria-label={`Remove ${factor.text}`}
          className="invisible -mt-0.5 -mr-0.5 flex size-5 shrink-0 items-center justify-center rounded text-dim transition-colors group-hover:visible hover:bg-red-100 hover:text-red-500"
        >
          <X className="size-3.5" />
        </button>
      </div>
      <WeightTrack weight={factor.weight} onChange={(w) => onSetWeight(factor.id, w)} />
    </div>
  );
}

function WeightTrack({ weight, onChange }: { weight: number; onChange: (weight: number) => void }) {
  return (
    <div className="flex items-center gap-2.5">
      <div className="flex items-center gap-[3px]" role="group" aria-label={`Weight ${weight} of 5`}>
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            aria-label={`Weight ${n}: ${WEIGHT_LABELS[n - 1]}`}
            aria-pressed={n === weight}
            // Keeps focus (and so the pending edit) on the factor's input when
            // its weight is clicked, instead of blurring and committing it.
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => onChange(n)}
            className={cn(
              "h-2 w-7 cursor-pointer rounded-[3px] transition-colors",
              n <= weight ? "bg-accent" : "bg-hairline",
            )}
          />
        ))}
      </div>
      <span className="text-xs font-medium whitespace-nowrap text-muted">{WEIGHT_LABELS[weight - 1]}</span>
    </div>
  );
}
