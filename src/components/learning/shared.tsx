"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { evaluateAnswer, type AnswerResult, type Activity } from "@/lib/activities";
import { submitActivityAnswer } from "@/app/actions/activities";

/** Presente cuando la actividad se hace desde una unidad: las respuestas se registran. */
export type UnitContext = {
  unitActivityId: string;
  subjectId: string;
  subjectName: string;
  unitName: string;
  solvedCount: number;
};

export const stageTitle = "lab-stage-title";
export const stageTitleClass = "scroll-mt-24 outline-none";
export const primaryButton =
  "inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3 font-bold text-white hover:brightness-110 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary";
export const secondaryButton =
  "inline-flex items-center gap-2 rounded-xl border border-border px-4 py-3 font-semibold hover:bg-secondary";

/**
 * Cuando el control que tenía el foco desaparece o se deshabilita, el foco pasa
 * al elemento indicado después del próximo render en lugar de perderse.
 */
export function useFocusAfterRender() {
  const pending = useRef<string | null>(null);
  useEffect(() => {
    if (!pending.current) return;
    document.getElementById(pending.current)?.focus();
    pending.current = null;
  });
  return (id: string) => {
    pending.current = id;
  };
}

/** Corrige localmente en práctica libre y en el servidor (con registro) dentro de una unidad. */
export function useAnswerChecker(unit?: UnitContext) {
  const [result, setResult] = useState<AnswerResult | null>(null);
  const [checking, setChecking] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  async function check(item: Activity["items"][number], value: string) {
    if (checking) return null;
    setSaveError(null);
    if (!unit) {
      const local = evaluateAnswer(item, value);
      setResult(local);
      return local;
    }
    setChecking(true);
    const res = await submitActivityAnswer(unit.unitActivityId, item.id, value).catch(() => null);
    setChecking(false);
    if (!res?.success) {
      setResult(null);
      setSaveError(`${res?.message ?? "No pudimos guardar tu respuesta"}. Probá de nuevo.`);
      return null;
    }
    setResult(res.result);
    return res.result;
  }

  function clear() {
    setResult(null);
    setSaveError(null);
  }

  return { result, checking, saveError, check, clear };
}

export function AnswerFeedback({
  result,
  checking,
  saveError,
}: {
  result: AnswerResult | null;
  checking: boolean;
  saveError: string | null;
}) {
  return (
    <div aria-live="polite" aria-atomic="true" className="mt-5">
      {checking ? (
        <p className="text-sm text-muted-foreground">Revisando tu respuesta…</p>
      ) : saveError ? (
        <p
          role="alert"
          className="rounded-xl border border-red-500/40 bg-red-500/10 p-4 text-sm font-semibold"
        >
          {saveError}
        </p>
      ) : (
        result && (
          <div
            className={`rounded-xl border p-4 ${result.correct ? "border-emerald-500/40 bg-emerald-500/10" : "border-amber-500/40 bg-amber-500/10"}`}
          >
            <p className="font-bold">{result.title}</p>
            {result.detail && (
              <p className="mt-2 text-sm leading-relaxed">{result.detail}</p>
            )}
          </div>
        )
      )}
    </div>
  );
}

/** Enlace de regreso, encabezado y nota final comunes a todas las actividades. */
export function ActivityFrame({
  unit,
  freeEyebrow,
  title,
  description,
  total,
  gradient,
  glyph,
  children,
}: {
  unit?: UnitContext;
  freeEyebrow: string;
  title: string;
  description: string;
  total: number;
  gradient: string;
  glyph: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="mx-auto max-w-5xl space-y-7 p-5 pb-28 sm:p-8 sm:pb-28">
      <Link
        href={unit ? `/subjects/${unit.subjectId}` : "/juegos"}
        className="inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground hover:text-primary"
      >
        <ArrowLeft size={16} />{" "}
        {unit ? `Volver a ${unit.subjectName}` : "Volver a Juegos"}
      </Link>
      <header
        className={`relative overflow-hidden rounded-3xl bg-gradient-to-br ${gradient} p-7 text-white sm:p-10`}
      >
        <span
          aria-hidden="true"
          className="absolute -right-3 top-0 text-[180px] font-black leading-none text-white/10"
        >
          {glyph}
        </span>
        <p className="relative text-xs font-bold uppercase tracking-widest text-cyan-200">
          {unit ? `${unit.subjectName} · ${unit.unitName}` : freeEyebrow}
        </p>
        <h1 className="relative mt-4 text-4xl font-black tracking-tight sm:text-5xl">
          {title}
        </h1>
        <p className="relative mt-4 max-w-xl leading-relaxed text-blue-100">
          {description}
        </p>
        {unit && unit.solvedCount > 0 && (
          <p className="relative mt-4 text-sm font-semibold text-cyan-100">
            Ya resolviste {unit.solvedCount} de {total} retos en visitas
            anteriores. Podés volver a practicarlos.
          </p>
        )}
      </header>
      {children}
      <p className="text-center text-xs leading-relaxed text-muted-foreground">
        {unit
          ? "Sin nota de acreditación. Tus respuestas se guardan para que tu docente vea en qué necesitás ayuda."
          : "Práctica libre, sin nota de acreditación. El recorrido se reinicia al salir o recargar la página."}
      </p>
    </div>
  );
}

/** Navegación por etapas de una actividad. */
export function StageNav({
  labels,
  stage,
  onSelect,
}: {
  labels: string[];
  stage: number;
  onSelect: (index: number) => void;
}) {
  return (
    <nav
      aria-label="Etapas de la actividad"
      className="grid gap-2"
      style={{ gridTemplateColumns: `repeat(${labels.length}, minmax(0, 1fr))` }}
    >
      {labels.map((label, index) => (
        <button
          key={label}
          aria-current={stage === index ? "step" : undefined}
          onClick={() => onSelect(index)}
          className={`rounded-xl border px-2 py-3 text-xs font-bold sm:text-sm ${stage === index ? "border-primary bg-primary text-white" : "border-border bg-card hover:bg-secondary"}`}
        >
          <span className="block font-semibold opacity-75">
            Paso {index + 1}
          </span>
          {label}
        </button>
      ))}
    </nav>
  );
}
