"use client";

import React, { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bot, ChevronLeft, ChevronRight, X, Sparkles } from "lucide-react";
import { useTour } from "@/context/TourContext";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface TargetRect {
  top: number;
  left: number;
  width: number;
  height: number;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function TourOverlay() {
  const { steps, currentStep, isTourActive, nextStep, prevStep, skipTour } = useTour();
  const [targetRect, setTargetRect] = useState<TargetRect | null>(null);
  const [tooltipStyle, setTooltipStyle] = useState<React.CSSProperties>({});

  const step = steps[currentStep];
  const totalSteps = steps.length;
  const progress = totalSteps > 0 ? ((currentStep + 1) / totalSteps) * 100 : 0;

  // ── Measure target element ───────────────────────────────────────────
  const measureTarget = useCallback(() => {
    if (!step?.targetSelector) {
      setTargetRect(null);
      return;
    }

    const el = document.querySelector(step.targetSelector);
    if (!el) {
      setTargetRect(null);
      return;
    }

    const rect = el.getBoundingClientRect();
    const padding = 8;

    setTargetRect({
      top: rect.top - padding + window.scrollY,
      left: rect.left - padding,
      width: rect.width + padding * 2,
      height: rect.height + padding * 2,
    });

    // Scroll element into view
    el.scrollIntoView({ behavior: "smooth", block: "center" });
  }, [step]);

  useEffect(() => {
    if (!isTourActive || !step) return;

    // Delay measurement to let scroll settle
    const timer = setTimeout(measureTarget, 300);
    window.addEventListener("resize", measureTarget);
    window.addEventListener("scroll", measureTarget, true);

    return () => {
      clearTimeout(timer);
      window.removeEventListener("resize", measureTarget);
      window.removeEventListener("scroll", measureTarget, true);
    };
  }, [isTourActive, step, measureTarget]);

  // ── Calculate tooltip position ───────────────────────────────────────
  useEffect(() => {
    if (!targetRect || !step) return;

    const tooltipWidth = 360;
    const tooltipHeight = 220;
    const gap = 16;
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    let top = 0;
    let left = 0;

    // Adjust targetRect.top for viewport (subtract scrollY for fixed positioning)
    const viewportTop = targetRect.top - window.scrollY;

    switch (step.position) {
      case "bottom":
        top = viewportTop + targetRect.height + gap;
        left = targetRect.left + targetRect.width / 2 - tooltipWidth / 2;
        break;
      case "top":
        top = viewportTop - tooltipHeight - gap;
        left = targetRect.left + targetRect.width / 2 - tooltipWidth / 2;
        break;
      case "right":
        top = viewportTop + targetRect.height / 2 - tooltipHeight / 2;
        left = targetRect.left + targetRect.width + gap;
        break;
      case "left":
        top = viewportTop + targetRect.height / 2 - tooltipHeight / 2;
        left = targetRect.left - tooltipWidth - gap;
        break;
    }

    // Clamp within viewport
    left = Math.max(16, Math.min(left, viewportWidth - tooltipWidth - 16));
    top = Math.max(16, Math.min(top, viewportHeight - tooltipHeight - 16));

    setTooltipStyle({
      position: "fixed",
      top: `${top}px`,
      left: `${left}px`,
      width: `${tooltipWidth}px`,
      zIndex: 10001,
    });
  }, [targetRect, step]);

  // ── Keyboard navigation ──────────────────────────────────────────────
  useEffect(() => {
    if (!isTourActive) return;

    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") skipTour();
      if (e.key === "ArrowRight" || e.key === "Enter") nextStep();
      if (e.key === "ArrowLeft") prevStep();
    };

    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [isTourActive, skipTour, nextStep, prevStep]);

  if (!isTourActive || !step) return null;

  return (
    <AnimatePresence>
      {isTourActive && (
        <>
          {/* ── Dark overlay with spotlight cutout ─────────────────────── */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="tour-overlay"
            onClick={skipTour}
            aria-hidden="true"
          />

          {/* ── Spotlight ring around target ───────────────────────────── */}
          {targetRect && (
            <motion.div
              key={`spotlight-${currentStep}`}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="tour-spotlight"
              style={{
                position: "absolute",
                top: targetRect.top,
                left: targetRect.left,
                width: targetRect.width,
                height: targetRect.height,
                zIndex: 9999,
                pointerEvents: "none",
              }}
            />
          )}

          {/* ── Tooltip ───────────────────────────────────────────────── */}
          <motion.div
            key={`tooltip-${currentStep}`}
            initial={{ opacity: 0, y: 12, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.95 }}
            transition={{ type: "spring", damping: 22, stiffness: 280, delay: 0.15 }}
            style={tooltipStyle}
            className="tour-tooltip"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Neon border pseudo-element is handled via CSS */}

            {/* Header */}
            <div className="flex items-center gap-3 px-5 pt-5 pb-3">
              <div className="w-9 h-9 rounded-xl bg-primary/20 flex items-center justify-center shrink-0 border border-primary/30">
                <Bot size={18} className="text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-[9px] font-black uppercase tracking-[0.2em] text-primary">
                    Brok te guía
                  </span>
                  <Sparkles size={10} className="text-primary animate-pulse" />
                </div>
                <span className="text-[9px] text-muted-foreground uppercase tracking-widest font-bold">
                  Paso {currentStep + 1} de {totalSteps}
                </span>
              </div>
              <button
                onClick={skipTour}
                className="p-1.5 rounded-lg hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors"
                title="Cerrar tour"
              >
                <X size={14} />
              </button>
            </div>

            {/* Progress bar */}
            <div className="mx-5 h-1 rounded-full bg-secondary overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-primary to-cyan-400 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.4, ease: "easeOut" }}
              />
            </div>

            {/* Content */}
            <div className="px-5 pt-4 pb-2">
              <h3 className="font-black text-sm tracking-tight mb-2 leading-tight">
                {step.title}
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed font-medium">
                {step.content}
              </p>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between px-5 pb-5 pt-3">
              <button
                onClick={skipTour}
                className="text-[9px] font-black uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors"
              >
                Omitir Tour
              </button>
              <div className="flex items-center gap-2">
                {currentStep > 0 && (
                  <button
                    onClick={prevStep}
                    className="flex items-center gap-1 px-3 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest bg-secondary hover:bg-border transition-colors"
                  >
                    <ChevronLeft size={12} />
                    Anterior
                  </button>
                )}
                <button
                  onClick={nextStep}
                  className="flex items-center gap-1 px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest bg-primary text-primary-foreground hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20"
                >
                  {currentStep === totalSteps - 1 ? "¡Listo!" : "Siguiente"}
                  {currentStep < totalSteps - 1 && <ChevronRight size={12} />}
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
