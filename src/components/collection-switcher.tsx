"use client";

import { useEffect, useRef, useState } from "react";
import { Check, ChevronDown } from "lucide-react";
import type { Collection } from "@/lib/types";
import { cn } from "@/lib/utils";

export function CollectionSwitcher({
  collections,
  collectionId,
  onCollectionChange,
}: {
  collections: Collection[];
  collectionId: string;
  onCollectionChange: (id: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const anchorRef = useRef<HTMLDivElement>(null);
  const current = collections.find((c) => c.id === collectionId) ?? collections[0];

  useEffect(() => {
    if (!open) return;
    function onPointerDown(e: MouseEvent) {
      if (!anchorRef.current?.contains(e.target as Node)) setOpen(false);
    }
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  return (
    <div ref={anchorRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="listbox"
        aria-expanded={open}
        className="inline-flex h-[34px] items-center gap-[7px] rounded-lg border border-hairline bg-panel px-3 text-[14px] font-semibold text-main transition-colors hover:border-[#d8d2c7] hover:bg-soft"
      >
        <span>{current.label}</span>
        <ChevronDown className="size-3 stroke-[2]" />
      </button>

      {open && (
        <div
          role="listbox"
          className="absolute left-0 top-[calc(100%+6px)] z-[100] flex w-[190px] flex-col gap-px rounded-lg border border-hairline bg-panel p-1 shadow-[0_8px_24px_rgba(0,0,0,0.08)]"
        >
          {collections.map((c) => {
            const selected = c.id === current.id;
            return (
              <button
                key={c.id}
                type="button"
                role="option"
                aria-selected={selected}
                onClick={() => {
                  onCollectionChange(c.id);
                  setOpen(false);
                }}
                className={cn(
                  "flex h-[34px] items-center justify-between rounded-md px-2.5 text-left text-[13.5px] font-medium transition-colors",
                  selected
                    ? "bg-accent/8 font-semibold text-accent"
                    : "text-[#44403c] hover:bg-soft hover:text-main",
                )}
              >
                <span>{c.label}</span>
                {selected && <Check className="size-3.5 stroke-[2]" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
