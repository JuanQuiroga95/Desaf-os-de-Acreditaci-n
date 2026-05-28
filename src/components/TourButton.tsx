"use client";

import React from "react";
import { Compass } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useTour } from "@/context/TourContext";

export function TourButton() {
  const { hasTour, isTourActive, resetTour } = useTour();

  // Don't show if no tour for this page or tour is already active
  if (!hasTour || isTourActive) return null;

  return (
    <AnimatePresence>
      <motion.button
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.5 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        onClick={resetTour}
        className="fixed bottom-6 left-6 z-[90] w-12 h-12 rounded-full flex items-center justify-center bg-card border border-primary/30 shadow-lg shadow-primary/10 hover:border-primary/60 hover:shadow-primary/20 transition-all duration-300 group"
        title="Ver Instrucciones de esta pantalla"
        aria-label="Reiniciar tour de la página"
      >
        <Compass
          size={20}
          className="text-primary group-hover:rotate-45 transition-transform duration-300"
        />

        {/* Subtle pulse ring */}
        <span className="absolute inset-0 rounded-full border border-primary/20 animate-ping opacity-30" />
      </motion.button>
    </AnimatePresence>
  );
}
