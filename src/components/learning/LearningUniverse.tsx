"use client";

import { useState } from "react";
import { BookOpen, Gamepad2, Pause, Play, Rocket, Sparkles } from "lucide-react";

/** Lightweight original motion artwork; no video downloads or autoplay audio. */
export function LearningUniverse({ compact = false }: { compact?: boolean }) {
  const [paused, setPaused] = useState(false);

  return (
    <div className={`learning-universe ${compact ? "universe-compact" : ""}`} data-paused={paused}>
      <div className="universe-art" aria-hidden="true">
        <div className="universe-halo" />
        <div className="universe-orbit orbit-one"><span /></div>
        <div className="universe-orbit orbit-two"><span /></div>
        <div className="universe-orbit orbit-three" />
        <div className="universe-planet">
          <div className="planet-grid" />
          <Rocket size={70} strokeWidth={1.4} />
        </div>
        <span className="universe-star star-one">✦</span>
        <span className="universe-star star-two">✧</span>
        <span className="universe-star star-three">+</span>
        <span className="universe-symbol">π</span>
        <div className="universe-tag tag-play"><Gamepad2 size={20} /><span>Jugá. Probá. Descubrí.</span></div>
        <div className="universe-tag tag-learn"><BookOpen size={19} /><span>Una idea más lejos</span></div>
        <div className="universe-tag tag-spark"><Sparkles size={18} /><span>Tu próximo nivel</span></div>
      </div>
      <button
        type="button"
        onClick={() => setPaused(!paused)}
        className="universe-toggle"
        aria-pressed={paused}
        aria-label={paused ? "Reanudar animación" : "Pausar animación"}
      >
        {paused ? <Play size={13} /> : <Pause size={13} />}
        <span>{paused ? "Reanudar" : "Pausar"} animación</span>
      </button>
    </div>
  );
}
