"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getActivity } from "@/lib/activities";
import PercentageLab from "./PercentageLab";
import DataDetectives from "./DataDetectives";
import QuizLab from "./QuizLab";
import { GameModeContext, type UnitContext } from "./shared";

export default function GameSession({ activityKey, unit, initialPractice = true }: {
  activityKey: string; unit?: UnitContext; initialPractice?: boolean;
}) {
  const [practice, setPractice] = useState(initialPractice);
  const activity = getActivity(activityKey)!;
  useEffect(() => {
    const down = (event: KeyboardEvent) => {
      if (event.repeat || event.ctrlKey || event.metaKey || event.altKey ||
        (event.target instanceof HTMLElement && (event.target.isContentEditable || ["INPUT", "TEXTAREA", "SELECT"].includes(event.target.tagName)))) return;
      if (event.code === "KeyJ") setPractice(false);
      if (event.code === "KeyP") setPractice(true);
    };
    window.addEventListener("keydown", down);
    return () => window.removeEventListener("keydown", down);
  }, []);
  const controls = <nav aria-label="Modo de juego" className="flex flex-wrap items-center gap-3 rounded-2xl border border-border bg-card p-4">
    <button className="rounded-xl border border-border px-4 py-3 font-bold" aria-pressed={practice} onClick={() => setPractice(true)}>Practicar (P)</button>
    <button className="rounded-xl bg-primary px-4 py-3 font-bold text-white" aria-pressed={!practice} onClick={() => setPractice(false)}>Jugar (J)</button>
    <span className="text-sm text-muted-foreground">{practice ? "Ensayá sin cambiar tus avances." : "Tus aciertos se guardan y encienden la ciudad."}</span>
    <Link className="font-bold text-primary" href="/mundo">Volver al Mundo</Link>
  </nav>;
  return <GameModeContext.Provider key={practice ? "practice" : "play"} value={{ activityKey, practice, controls }}>
    {activity.kind === "percentages" ? <PercentageLab unit={unit} /> : activity.kind === "statistics" ? <DataDetectives unit={unit} /> : <QuizLab activityKey={activityKey} unit={unit} />}
  </GameModeContext.Provider>;
}
