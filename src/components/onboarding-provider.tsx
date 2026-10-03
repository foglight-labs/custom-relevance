"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { usePathname } from "next/navigation";

export type OnboardingVariant = "ranking" | "map";

// The ranking key predates the map page; keeping it means returning visitors
// who already closed the ranking dialog don't see it again.
const DISMISSED_STORAGE_KEYS: Record<OnboardingVariant, string> = {
  ranking: "custom-relevance:onboarding-dismissed:v1",
  map: "custom-relevance:map-onboarding-dismissed:v1",
};

interface OnboardingContextValue {
  variant: OnboardingVariant;
  isOpen: boolean;
  openOnboarding: () => void;
  dismissOnboarding: () => void;
}

const OnboardingContext = createContext<OnboardingContextValue | null>(null);

export function OnboardingProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const variant: OnboardingVariant =
    pathname === "/map" || pathname.startsWith("/map/") ? "map" : "ranking";
  // Start closed for both the server render and hydration. The effect opens the
  // dialog for new visitors only after their saved preference has been read.
  const [isOpen, setIsOpen] = useState(false);
  // Dialogs dismissed this session, so blocked storage can't make one
  // reappear every time the visitor switches pages.
  const dismissedRef = useRef(new Set<OnboardingVariant>());

  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    if (dismissedRef.current.has(variant)) {
      setIsOpen(false);
      return;
    }
    try {
      setIsOpen(window.localStorage.getItem(DISMISSED_STORAGE_KEYS[variant]) !== "true");
    } catch {
      // Storage can be unavailable in privacy modes. Keep onboarding usable
      // for this session even when the dismissal cannot be persisted.
      setIsOpen(true);
    }
  }, [variant]);
  /* eslint-enable react-hooks/set-state-in-effect */

  const openOnboarding = useCallback(() => {
    // Reopening is intentionally session-only: the stored dismissal remains
    // in place unless the visitor explicitly closes the dialog again.
    setIsOpen(true);
  }, []);

  const dismissOnboarding = useCallback(() => {
    setIsOpen(false);
    dismissedRef.current.add(variant);
    try {
      window.localStorage.setItem(DISMISSED_STORAGE_KEYS[variant], "true");
    } catch {
      // The current session still closes correctly when storage is blocked.
    }
  }, [variant]);

  const value = useMemo(
    () => ({ variant, isOpen, openOnboarding, dismissOnboarding }),
    [dismissOnboarding, isOpen, openOnboarding, variant],
  );

  return <OnboardingContext.Provider value={value}>{children}</OnboardingContext.Provider>;
}

export function useOnboarding(): OnboardingContextValue {
  const context = useContext(OnboardingContext);
  if (!context) {
    throw new Error("useOnboarding must be used within an OnboardingProvider");
  }
  return context;
}
