"use client";

import { CircleHelp } from "lucide-react";
import { useOnboarding } from "@/components/onboarding-provider";

export function HowItWorksButton() {
  const { isOpen, openOnboarding } = useOnboarding();

  return (
    <button
      type="button"
      onClick={openOnboarding}
      aria-label="How it works"
      aria-haspopup="dialog"
      aria-controls="onboarding-dialog"
      aria-expanded={isOpen}
      className="inline-flex size-10 shrink-0 cursor-pointer items-center justify-center gap-2 rounded-lg border border-hairline bg-panel text-[13.5px] font-medium text-main transition-colors hover:border-[#d8d2c7] hover:bg-soft focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent sm:h-[34px] sm:w-auto sm:px-3"
    >
      <CircleHelp className="size-4" aria-hidden />
      <span className="hidden sm:inline">How it works</span>
    </button>
  );
}
