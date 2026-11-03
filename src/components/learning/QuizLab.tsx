"use client";

import { useState } from "react";
import Link from "next/link";
import { getActivity } from "@/lib/activities";
import { ActivityFrame, AnswerFeedback, primaryButton, secondaryButton, useAnswerChecker, type UnitContext } from "./shared";

export default function QuizLab({ activityKey, unit }: { activityKey: string; unit?: UnitContext }) {
  const activity = getActivity(activityKey)!;
  const [index, setIndex] = useState(0);
  const [hint, setHint] = useState(false);
  const { check, clear, result, checking, saveError } = useAnswerChecker(unit);
  const item = activity.items[index];
  return (
    <ActivityFrame unit={unit} title={activity.title} description={activity.summary} total={activity.items.length}
      freeEyebrow="Taller de matemática" gradient="from-teal-950 via-cyan-900 to-blue-800" glyph={activityKey.startsWith("fracciones") ? "½" : "x"}>
      <section className="rounded-3xl border border-border bg-card p-6 sm:p-8">
        {item ? <>
          <p className="text-sm text-muted-foreground">Reto {index + 1} de {activity.items.length}</p>
          <h2 className="mt-3 text-2xl font-black">{item.title}</h2>
          <div className="mt-6 flex flex-wrap gap-3">
            {item.options.map((option) => <button key={option} className={secondaryButton} disabled={checking || result?.correct} onClick={() => check(item, option)}>{option}</button>)}
          </div>
          <button className="mt-5 text-sm font-bold text-primary" onClick={() => setHint(!hint)} aria-expanded={hint}>Ver pista</button>
          {hint && <p className="mt-2 text-sm">{item.hint}</p>}
          <AnswerFeedback result={result} checking={checking} saveError={saveError} />
          {result?.correct && <button className={`${primaryButton} mt-5`} onClick={() => { setIndex(index + 1); setHint(false); clear(); }}>{index + 1 === activity.items.length ? "Terminar" : "Siguiente reto"}</button>}
        </> : <>
          <h2 className="text-2xl font-black">¡Completaste el recorrido!</h2>
          <div className="mt-5 flex flex-wrap gap-3">
            <Link href="/mundo" className={primaryButton}>Ver la ciudad</Link>
            <button className={secondaryButton} onClick={() => { setIndex(0); clear(); }}>Volver a empezar</button>
          </div>
        </>}
      </section>
    </ActivityFrame>
  );
}
