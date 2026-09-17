"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { EditableCell } from "@/components/editable-cell";
import { MAX_FACTOR_TEXT_LENGTH } from "@/lib/limits";
import type { Factor } from "@/lib/types";
import { cn } from "@/lib/utils";

const WEIGHT_LABELS = ["Negligible", "Minor", "Moderate", "Important", "Essential"] as const;

const CARD =
  "h-[112px] w-[min(82vw,280px)] shrink-0 rounded-[10px] box-border md:h-[88px] md:w-[240px]";

/** Plain text at rest, an obviously-editable field once focused. */
const TITLE_INPUT =
  "-mx-2 -my-1 w-full rounded-md border border-transparent px-2 py-2 text-[14px] font-medium text-main placeholder:text-dim focus:border-accent focus:bg-white focus:shadow-[0_0_0_2px_var(--accent-ring)] md:py-1";

export function FactorStrip({
  factors,
  maxFactors,
  onAddFactor,
  onEditFactor,
  onSetWeight,
  onRemoveFactor,
}: {
  factors: Factor[];
  maxFactors: number;
  onAddFactor: (text: string, weight: number) => void;
  onEditFactor: (id: string, text: string) => void;
  onSetWeight: (id: string, weight: number) => void;
  onRemoveFactor: (id: string) => void;
}) {
  const [draftWeight, setDraftWeight] = useState(3);
  const [adding, setAdding] = useState(false);
  const full = factors.length >= maxFactors;

  return (
    <section
      aria-label="Ranking factors"
      className="overflow-x-auto border-b border-hairline bg-page px-4 py-4 sm:px-8 sm:py-5"
    >
      <div className="flex min-w-min items-stretch gap-3">
        {factors.map((f) => (
          <FactorCard key={f.id} factor={f} onEdit={onEditFactor} onSetWeight={onSetWeight} onRemove={onRemoveFactor} />
        ))}

        {full ? (
          <div
            className={cn(
              CARD,
              "flex flex-col items-center justify-center gap-[3px] border-2 border-dashed border-hairline px-3 text-center",
            )}
          >
            <span className="text-[13px] font-medium text-muted">
              Limit of {maxFactors} factors
            </span>
            <span className="text-xs text-dim">Remove one to add another</span>
          </div>
        ) : adding ? (
          <div className={cn(CARD, "flex flex-col justify-between border border-hairline bg-panel p-3.5")}>
            <div className="flex h-[22px] items-start gap-2">
              <EditableCell
                autoFocus
                defaultValue=""
                placeholder="Factor…"
                maxLength={MAX_FACTOR_TEXT_LENGTH}
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
          maxLength={MAX_FACTOR_TEXT_LENGTH}
          className={cn(TITLE_INPUT, "truncate")}
          onCommit={(text) => onEdit(factor.id, text)}
        />
        <button
          type="button"
          onClick={() => onRemove(factor.id)}
          aria-label={`Remove ${factor.text}`}
          className="-mt-1.5 -mr-1.5 flex size-8 shrink-0 items-center justify-center rounded-md text-dim transition-colors hover:bg-red-100 hover:text-red-500 md:invisible md:-mt-0.5 md:-mr-0.5 md:size-5 md:group-focus-within:visible md:group-hover:visible"
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
    <div className="flex flex-col items-start gap-0.5 md:flex-row md:items-center md:gap-2.5">
      <div className="flex w-full items-center gap-1 md:w-auto md:gap-[3px]" role="group" aria-label={`Weight ${weight} of 5`}>
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
              "flex h-9 flex-1 cursor-pointer items-center rounded-[3px] md:h-2 md:w-7 md:flex-none",
            )}
          >
            <span
              className={cn(
                "h-2 w-full rounded-[3px] transition-colors",
                n <= weight ? "bg-accent" : "bg-hairline",
              )}
            />
          </button>
        ))}
      </div>
      <span className="text-xs font-medium whitespace-nowrap text-muted">{WEIGHT_LABELS[weight - 1]}</span>
    </div>
  );
}
