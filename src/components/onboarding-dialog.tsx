"use client";

import { useEffect, useRef } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { X } from "lucide-react";
import { useOnboarding } from "@/components/onboarding-provider";

const FOCUSABLE_SELECTOR = [
  "a[href]",
  "button:not([disabled])",
  "input:not([disabled])",
  "select:not([disabled])",
  "textarea:not([disabled])",
  '[tabindex]:not([tabindex="-1"])',
].join(",");

export function OnboardingDialog() {
  const { isOpen, dismissOnboarding } = useOnboarding();
  const reduceMotion = useReducedMotion();
  const dialogRef = useRef<HTMLElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const previouslyFocusedRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    previouslyFocusedRef.current =
      document.activeElement instanceof HTMLElement ? document.activeElement : null;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const focusFrame = window.requestAnimationFrame(() => closeButtonRef.current?.focus());

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        event.preventDefault();
        dismissOnboarding();
        return;
      }

      if (event.key !== "Tab") return;

      const dialog = dialogRef.current;
      if (!dialog) return;

      const focusableElements = Array.from(
        dialog.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR),
      ).filter((element) => element.getAttribute("aria-hidden") !== "true");

      if (focusableElements.length === 0) {
        event.preventDefault();
        dialog.focus();
        return;
      }

      const firstElement = focusableElements[0];
      const lastElement = focusableElements.at(-1);
      const activeElement = document.activeElement;

      if (event.shiftKey && (activeElement === firstElement || !dialog.contains(activeElement))) {
        event.preventDefault();
        lastElement?.focus();
      } else if (
        !event.shiftKey &&
        (activeElement === lastElement || !dialog.contains(activeElement))
      ) {
        event.preventDefault();
        firstElement.focus();
      }
    }

    function handleFocusIn(event: FocusEvent) {
      const dialog = dialogRef.current;
      if (dialog && event.target instanceof Node && !dialog.contains(event.target)) {
        closeButtonRef.current?.focus();
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("focusin", handleFocusIn);

    return () => {
      window.cancelAnimationFrame(focusFrame);
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("focusin", handleFocusIn);
      document.body.style.overflow = previousOverflow;

      const previouslyFocused = previouslyFocusedRef.current;
      if (previouslyFocused?.isConnected) previouslyFocused.focus();
      previouslyFocusedRef.current = null;
    };
  }, [dismissOnboarding, isOpen]);

  const immediateTransition = { duration: 0 };

  return (
    <AnimatePresence initial={false}>
      {isOpen && (
        <motion.div
          key="onboarding-backdrop"
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/35 p-3 sm:p-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={reduceMotion ? immediateTransition : { duration: 0.18, ease: "easeOut" }}
          onClick={(event) => {
            if (event.target === event.currentTarget) dismissOnboarding();
          }}
        >
          <motion.section
            ref={dialogRef}
            id="onboarding-dialog"
            role="dialog"
            aria-modal="true"
            aria-labelledby="onboarding-dialog-title"
            tabIndex={-1}
            initial={reduceMotion ? false : { opacity: 0, scale: 0.96, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={reduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.97, y: 8 }}
            transition={
              reduceMotion ? immediateTransition : { duration: 0.22, ease: "easeOut" }
            }
            className="flex max-h-[calc(100dvh-1.5rem)] w-full max-w-[560px] flex-col overflow-hidden rounded-2xl border border-hairline bg-white shadow-[0_24px_80px_rgba(28,25,23,0.24)] outline-none sm:max-h-[calc(100dvh-3rem)]"
          >
            <header className="flex shrink-0 items-center justify-between gap-4 border-b border-hairline px-5 py-4 sm:px-7 sm:py-5">
              <h2
                id="onboarding-dialog-title"
                className="font-display text-[20px] font-semibold tracking-[-0.01em] text-main"
              >
                How it works
              </h2>
              <button
                ref={closeButtonRef}
                type="button"
                onClick={dismissOnboarding}
                aria-label="Close how it works"
                className="flex size-10 shrink-0 items-center justify-center rounded-lg text-muted transition-colors hover:bg-soft hover:text-main focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent sm:size-8"
              >
                <X className="size-4" aria-hidden />
              </button>
            </header>

            <div className="grid overscroll-contain overflow-y-auto px-5 py-6 md:grid-cols-2 md:px-7 md:py-8">
              <IntroSection />
              <FactorSection />
              <OptionSection />
            </div>
          </motion.section>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function IntroSection() {
  return (
    <section className="flex min-w-0 flex-col items-start gap-4 pb-6 md:col-span-2 md:flex-row md:items-center md:gap-6 md:pb-7">
      <RankingIllustration />
      <p className="max-w-[600px] font-display text-[19px] leading-[1.3] font-semibold tracking-[-0.01em] text-main">
        Custom Relevance lets you rank search results using criteria that matter to you.
      </p>
    </section>
  );
}

function FactorSection() {
  return (
    <section className="flex min-w-0 items-center gap-4 border-t border-[#d7e7e2] py-6 md:flex-col md:items-center md:pr-7 md:pt-7 md:pb-0 md:text-center lg:pr-9">
      <FactorIllustration />
      <div className="min-w-0">
        <h3 className="font-display text-[16px] font-semibold text-main">Add a factor</h3>
        <p className="mt-1 max-w-[230px] text-[13px] leading-[1.45] text-muted">
          Choose a factor that matters to you and rate its importance.
        </p>
      </div>
    </section>
  );
}

function OptionSection() {
  return (
    <section className="flex min-w-0 items-center gap-4 border-t border-[#d7e7e2] pt-6 md:flex-col md:items-center md:border-l md:pl-7 md:pt-7 md:text-center lg:pl-9">
      <OptionIllustration />
      <div className="min-w-0">
        <h3 className="font-display text-[16px] font-semibold text-main">Add an option</h3>
        <p className="mt-1 max-w-[230px] text-[13px] leading-[1.45] text-muted">
          Add something to compare and watch the ranking update.
        </p>
      </div>
    </section>
  );
}

function RankingIllustration() {
  return (
    <div
      aria-hidden="true"
      className="flex h-[76px] w-[112px] shrink-0 flex-col justify-center gap-2 rounded-[10px] border border-[#cfe1dc] bg-white p-3 shadow-[0_4px_14px_rgba(15,118,110,0.07)]"
    >
      {["w-full", "w-4/5", "w-3/5"].map((width, index) => (
        <div key={width} className="flex items-center gap-2">
          <span className="w-2 text-[8px] font-semibold text-accent">{index + 1}</span>
          <span
            className={`h-2 ${width} rounded-full bg-accent`}
            style={{ opacity: 1 - index * 0.23 }}
          />
        </div>
      ))}
    </div>
  );
}

function FactorIllustration() {
  return (
    <div
      aria-hidden="true"
      className="flex h-[76px] w-[112px] shrink-0 flex-col justify-between rounded-[10px] border-2 border-dashed border-accent/45 bg-white p-3"
    >
      <div className="flex items-center gap-2">
        <span className="text-[17px] leading-none text-accent">+</span>
        <span className="h-2 w-12 rounded-full bg-[#d7e7e2]" />
      </div>
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((bar) => (
          <span
            key={bar}
            className={`h-2 flex-1 rounded-[2px] ${bar <= 3 ? "bg-accent" : "bg-hairline"}`}
          />
        ))}
      </div>
    </div>
  );
}

function OptionIllustration() {
  return (
    <div
      aria-hidden="true"
      className="h-[76px] w-[112px] shrink-0 overflow-hidden rounded-[10px] border border-[#cfe1dc] bg-white p-2.5"
    >
      <div className="flex h-6 items-center gap-2 border-b border-hairline">
        <span className="w-2 text-[8px] font-semibold text-accent">1</span>
        <span className="h-1.5 w-11 rounded-full bg-[#b8d7cf]" />
        <span className="ml-auto h-3 w-3 rounded-[3px] bg-accent/20" />
      </div>
      <div className="mt-2 flex h-6 items-center gap-2 rounded-[5px] border border-dashed border-accent/45 px-1.5">
        <span className="text-[13px] leading-none text-accent">+</span>
        <span className="h-1.5 w-12 rounded-full bg-[#d7e7e2]" />
      </div>
    </div>
  );
}
