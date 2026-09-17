"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

const DISMISSED_STORAGE_KEY = "custom-relevance:onboarding-dismissed:v1";

interface OnboardingContextValue {
  isOpen: boolean;
  openOnboarding: () => void;
  dismissOnboarding: () => void;
}

const OnboardingContext = createContext<OnboardingContextValue | null>(null);

export function OnboardingProvider({ children }: { children: ReactNode }) {
  // Start closed for both the server render and hydration. The effect opens the
  // dialog for new visitors only after their saved preference has been read.
  const [isOpen, setIsOpen] = useState(false);

  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    try {
      setIsOpen(window.localStorage.getItem(DISMISSED_STORAGE_KEY) !== "true");
    } catch {
      // Storage can be unavailable in privacy modes. Keep onboarding usable
      // for this session even when the dismissal cannot be persisted.
      setIsOpen(true);
    }
  }, []);
  /* eslint-enable react-hooks/set-state-in-effect */

  const openOnboarding = useCallback(() => {
    // Reopening is intentionally session-only: the stored dismissal remains
    // in place unless the visitor explicitly closes the dialog again.
    setIsOpen(true);
  }, []);

  const dismissOnboarding = useCallback(() => {
    setIsOpen(false);
    try {
      window.localStorage.setItem(DISMISSED_STORAGE_KEY, "true");
    } catch {
      // The current session still closes correctly when storage is blocked.
    }
  }, []);

  const value = useMemo(
    () => ({ isOpen, openOnboarding, dismissOnboarding }),
    [dismissOnboarding, isOpen, openOnboarding],
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
