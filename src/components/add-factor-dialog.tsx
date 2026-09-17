"use client";

import { useState, type ReactNode } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FACTOR_COLORS } from "@/lib/factors";
import type { FactorDef, FactorDirection, FactorKind } from "@/lib/types";

function nextColor(taken: string[]): string {
  const free = FACTOR_COLORS.find((c) => !taken.includes(c));
  return free ?? FACTOR_COLORS[taken.length % FACTOR_COLORS.length];
}

export function AddFactorDialog({
  open,
  onOpenChange,
  existingColors,
  onCreate,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  existingColors: string[];
  onCreate: (factor: FactorDef) => void;
}) {
  const [title, setTitle] = useState("");
  const [question, setQuestion] = useState("");
  const [kind, setKind] = useState<FactorKind>("score");
  const [direction, setDirection] = useState<FactorDirection>("higher-is-better");
  const [levelsText, setLevelsText] = useState("Poor\nFair\nGood\nExcellent");
  const [trueDesc, setTrueDesc] = useState("");
  const [falseDesc, setFalseDesc] = useState("");
  const [error, setError] = useState<string | null>(null);

  function reset() {
    setTitle("");
    setQuestion("");
    setKind("score");
    setDirection("higher-is-better");
    setLevelsText("Poor\nFair\nGood\nExcellent");
    setTrueDesc("");
    setFalseDesc("");
    setError(null);
  }

  function handleCreate() {
    const cleanTitle = title.trim();
    const cleanQuestion = question.trim();
    if (!cleanTitle || !cleanQuestion) {
      setError("Give the factor a name and a question.");
      return;
    }
    const id = `custom_${cleanTitle.toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, "")}_${Date.now()
      .toString(36)
      .slice(-4)}`;

    if (kind === "score") {
      const levels = levelsText
        .split("\n")
        .map((l) => l.trim())
        .filter(Boolean);
      if (levels.length < 2) {
        setError("Add at least two rubric levels, one per line, low to high.");
        return;
      }
      if (levels.length > 10) {
        setError("Use at most 10 levels.");
        return;
      }
      onCreate({
        id,
        title: cleanTitle,
        summary: direction === "lower-is-better" ? "Lower is better" : "Higher is better",
        kind: "score",
        direction,
        instructions: cleanQuestion,
        levels: levels.map((label) => ({ label })),
        origin: "custom",
        color: nextColor(existingColors),
      });
    } else {
      onCreate({
        id,
        title: cleanTitle,
        summary: direction === "lower-is-better" ? "Lower is better" : "Higher is better",
        kind: "noul",
        direction,
        instructions: cleanQuestion,
        noulCriteria: {
          true: trueDesc.trim() || "Clearly yes.",
          false: falseDesc.trim() || "Clearly no.",
        },
        origin: "custom",
        color: nextColor(existingColors),
      });
    }
    reset();
    onOpenChange(false);
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        if (!v) reset();
        onOpenChange(v);
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add a custom factor</DialogTitle>
          <DialogDescription>
            This becomes one isolated Jev question, asked the same way for every city.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-3">
          <Field label="Column name">
            <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Pet-friendliness" />
          </Field>

          <Field label="Question sent to Jev">
            <Input
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="e.g. How pet-friendly is this city?"
            />
          </Field>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Type">
              <Select value={kind} onValueChange={(v) => setKind(v as FactorKind)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="score">Score (rubric levels)</SelectItem>
                  <SelectItem value="noul">Yes / No</SelectItem>
                </SelectContent>
              </Select>
            </Field>
            <Field label="Direction">
              <Select value={direction} onValueChange={(v) => setDirection(v as FactorDirection)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="higher-is-better">Higher is better</SelectItem>
                  <SelectItem value="lower-is-better">Lower is better</SelectItem>
                </SelectContent>
              </Select>
            </Field>
          </div>

          {kind === "score" ? (
            <Field label="Rubric levels (one per line, low → high, 2-10)">
              <textarea
                value={levelsText}
                onChange={(e) => setLevelsText(e.target.value)}
                rows={5}
                className="w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm shadow-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-400 dark:border-neutral-700 dark:bg-neutral-900"
              />
            </Field>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              <Field label='What counts as "yes"'>
                <Input value={trueDesc} onChange={(e) => setTrueDesc(e.target.value)} placeholder="Optional" />
              </Field>
              <Field label='What counts as "no"'>
                <Input value={falseDesc} onChange={(e) => setFalseDesc(e.target.value)} placeholder="Optional" />
              </Field>
            </div>
          )}

          {error && <p className="text-xs text-red-600">{error}</p>}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleCreate}>Add factor</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="flex flex-col gap-1">
      <span className="text-xs font-medium text-neutral-500">{label}</span>
      {children}
    </label>
  );
}
