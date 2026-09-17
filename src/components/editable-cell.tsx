"use client";

import { useState, type KeyboardEvent } from "react";
import { cn } from "@/lib/utils";

/**
 * A spreadsheet-style input: type, commit with Enter or blur, cancel with
 * Escape. Used both for editing an existing value in place and for the
 * trailing "add a row" input (pass defaultValue="" and it resets after commit).
 */
export function EditableCell({
  defaultValue,
  placeholder,
  maxLength,
  onCommit,
  onDeleteWhenEmpty,
  className,
  autoFocus,
}: {
  defaultValue: string;
  placeholder?: string;
  maxLength?: number;
  onCommit: (next: string) => void;
  onDeleteWhenEmpty?: () => void;
  className?: string;
  autoFocus?: boolean;
}) {
  const [draft, setDraft] = useState(defaultValue);

  function commit() {
    const trimmed = draft.trim();
    if (!trimmed) {
      onDeleteWhenEmpty?.();
      setDraft(defaultValue);
      return;
    }
    if (trimmed !== defaultValue.trim()) onCommit(trimmed);
    if (defaultValue === "") setDraft("");
  }

  function handleKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") {
      e.currentTarget.blur();
    } else if (e.key === "Escape") {
      setDraft(defaultValue);
      e.currentTarget.blur();
    } else if (e.key === "Backspace" && draft === "" && onDeleteWhenEmpty) {
      e.preventDefault();
      onDeleteWhenEmpty();
    }
  }

  return (
    <input
      value={draft}
      onChange={(e) => setDraft(e.target.value)}
      onBlur={commit}
      onKeyDown={handleKeyDown}
      placeholder={placeholder}
      maxLength={maxLength}
      autoFocus={autoFocus}
      className={cn("min-w-0 bg-transparent text-main outline-none placeholder:text-dim", className)}
    />
  );
}
