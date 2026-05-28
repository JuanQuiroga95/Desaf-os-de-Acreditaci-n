"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { usePathname } from "next/navigation";
import { tourSteps, TourStep } from "@/lib/tour-config";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface TourContextType {
  /** The steps for the current page */
  steps: TourStep[];
  /** Current step index (0-based) */
  currentStep: number;
  /** Whether the tour overlay is visible */
  isTourActive: boolean;
  /** Whether the current page has a tour configured */
  hasTour: boolean;
  /** Start or restart the tour for the current page */
  startTour: () => void;
  /** Jump to the next step (or finish if last) */
  nextStep: () => void;
  /** Jump to the previous step */
  prevStep: () => void;
  /** Skip/close the tour and mark as seen */
  skipTour: () => void;
  /** Force restart tour (Instrucciones button) ignoring seen state */
  resetTour: () => void;
}

const TourContext = createContext<TourContextType | undefined>(undefined);

// ---------------------------------------------------------------------------
// LocalStorage helpers
// ---------------------------------------------------------------------------

const STORAGE_KEY = "videla-tours-seen";

function getSeenTours(): Set<string> {
  if (typeof window === "undefined") return new Set();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? new Set(JSON.parse(raw)) : new Set();
  } catch {
    return new Set();
  }
}

function markTourSeen(path: string) {
  const seen = getSeenTours();
  seen.add(path);
  localStorage.setItem(STORAGE_KEY, JSON.stringify([...seen]));
}

// ---------------------------------------------------------------------------
// Provider
// ---------------------------------------------------------------------------

export function TourProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const [steps, setSteps] = useState<TourStep[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [isTourActive, setIsTourActive] = useState(false);
  const [hasTour, setHasTour] = useState(false);

  // Resolve the matching tour key. Exact match first, then prefix match.
  const resolveTourKey = useCallback((path: string): string | null => {
    if (tourSteps[path]) return path;
    // No prefix matching for now — keep it strict.
    return null;
  }, []);

  // When pathname changes → auto-trigger tour if not seen
  useEffect(() => {
    const key = resolveTourKey(pathname);
    const pageSteps = key ? tourSteps[key] : [];

    setSteps(pageSteps);
    setHasTour(pageSteps.length > 0);
    setCurrentStep(0);

    if (pageSteps.length > 0) {
      const seen = getSeenTours();
      if (!seen.has(pathname)) {
        // Small delay so the page renders first and elements mount
        const timer = setTimeout(() => {
          setIsTourActive(true);
        }, 800);
        return () => clearTimeout(timer);
      }
    }

    setIsTourActive(false);
  }, [pathname, resolveTourKey]);

  // ── Actions ────────────────────────────────────────────────────────────

  const startTour = useCallback(() => {
    if (steps.length > 0) {
      setCurrentStep(0);
      setIsTourActive(true);
    }
  }, [steps]);

  const nextStep = useCallback(() => {
    if (currentStep < steps.length - 1) {
      setCurrentStep((prev) => prev + 1);
    } else {
      // Last step → finish
      setIsTourActive(false);
      markTourSeen(pathname);
    }
  }, [currentStep, steps.length, pathname]);

  const prevStep = useCallback(() => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    }
  }, [currentStep]);

  const skipTour = useCallback(() => {
    setIsTourActive(false);
    markTourSeen(pathname);
  }, [pathname]);

  const resetTour = useCallback(() => {
    if (steps.length > 0) {
      setCurrentStep(0);
      setIsTourActive(true);
    }
  }, [steps]);

  return (
    <TourContext.Provider
      value={{
        steps,
        currentStep,
        isTourActive,
        hasTour,
        startTour,
        nextStep,
        prevStep,
        skipTour,
        resetTour,
      }}
    >
      {children}
    </TourContext.Provider>
  );
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

export const useTour = () => {
  const context = useContext(TourContext);
  if (context === undefined) {
    throw new Error("useTour must be used within a TourProvider");
  }
  return context;
};
