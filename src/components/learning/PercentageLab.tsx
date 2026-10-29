"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  Lightbulb,
  RotateCcw,
  ShoppingBag,
  Trophy,
} from "lucide-react";
import { evaluateAnswer, getActivity, money, type AnswerResult } from "@/lib/activities";
import { submitActivityAnswer } from "@/app/actions/activities";

type UnitContext = {
  unitActivityId: string;
  subjectId: string;
  subjectName: string;
  unitName: string;
  solvedCount: number;
};

const missions = getActivity("porcentajes-descuentos")!.items;
const title = "lab-stage-title";
const titleClass = "scroll-mt-24 outline-none";
const button =
  "inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3 font-bold text-white hover:brightness-110 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary";

/** Sin `unit` es práctica libre local; con `unit`, cada respuesta se corrige y registra en el servidor. */
export default function PercentageLab({ unit }: { unit?: UnitContext }) {
  const [stage, setStage] = useState(0);
  const [discount, setDiscount] = useState(25);
  const [mission, setMission] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [hint, setHint] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [finished, setFinished] = useState(false);
  const [result, setResult] = useState<AnswerResult | null>(null);
  const [checking, setChecking] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const current = missions[mission];
  const correct = result?.correct === true;
  const savings = (20000 * discount) / 100;
  // Cuando el control que tenía el foco desaparece o se deshabilita,
  // el foco pasa al siguiente punto de la actividad en lugar de perderse.
  const pendingFocus = useRef<string | null>(null);
  useEffect(() => {
    if (!pendingFocus.current) return;
    document.getElementById(pendingFocus.current)?.focus();
    pendingFocus.current = null;
  });

  function goTo(nextStage: number) {
    pendingFocus.current = title;
    setStage(nextStage);
  }

  function reset() {
    pendingFocus.current = title;
    setStage(0);
    setDiscount(25);
    setMission(0);
    setSelected(null);
    setResult(null);
    setSaveError(null);
    setHint(false);
    setAttempts(0);
    setFinished(false);
  }

  async function choose(option: number) {
    if (checking) return;
    setSaveError(null);
    let answer: AnswerResult;
    if (unit) {
      setChecking(true);
      setSelected(option);
      const res = await submitActivityAnswer(
        unit.unitActivityId,
        current.id,
        option,
      ).catch(() => null);
      setChecking(false);
      if (!res?.success) {
        setSelected(null);
        setResult(null);
        setSaveError(
          `${res?.message ?? "No pudimos guardar tu respuesta"}. Probá de nuevo.`,
        );
        return;
      }
      answer = res.result;
    } else answer = evaluateAnswer(current, option);
    if (answer.correct) pendingFocus.current = "lab-next";
    setSelected(option);
    setResult(answer);
    setAttempts((value) => value + 1);
  }

  return (
    <div className="mx-auto max-w-5xl space-y-7 p-5 pb-28 sm:p-8 sm:pb-28">
      <Link
        href={unit ? `/subjects/${unit.subjectId}` : "/"}
        className="inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground hover:text-primary"
      >
        <ArrowLeft size={16} />{" "}
        {unit ? `Volver a ${unit.subjectName}` : "Volver al inicio"}
      </Link>
      <header className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-violet-950 via-indigo-900 to-blue-800 p-7 text-white sm:p-10">
        <span
          aria-hidden="true"
          className="absolute -right-3 top-0 text-[180px] font-black leading-none text-white/10"
        >
          %
        </span>
        <p className="relative text-xs font-bold uppercase tracking-widest text-cyan-200">
          {unit
            ? `${unit.subjectName} · ${unit.unitName}`
            : "Laboratorio de matemática · Práctica libre"}
        </p>
        <h1 className="relative mt-4 text-4xl font-black tracking-tight sm:text-5xl">
          Misión descuentos
        </h1>
        <p className="relative mt-4 max-w-xl leading-relaxed text-blue-100">
          Una oferta, una decisión y un poco de matemática. Descubrí cuánto
          ahorrás y cuánto pagás realmente.
        </p>
        {unit && unit.solvedCount > 0 && (
          <p className="relative mt-4 text-sm font-semibold text-cyan-100">
            Ya resolviste {unit.solvedCount} de {missions.length} retos en
            visitas anteriores. Podés volver a practicarlos.
          </p>
        )}
      </header>
      <nav
        aria-label="Etapas de la actividad"
        className="grid grid-cols-3 gap-2"
      >
        {["Descubrí", "Experimentá", "Resolvé"].map((label, index) => (
          <button
            key={label}
            aria-current={stage === index ? "step" : undefined}
            onClick={() => setStage(index)}
            className={`rounded-xl border px-2 py-3 text-xs font-bold sm:text-sm ${stage === index ? "border-primary bg-primary text-white" : "border-border bg-card hover:bg-secondary"}`}
          >
            <span className="block font-semibold opacity-75">
              Paso {index + 1}
            </span>
            {label}
          </button>
        ))}
      </nav>

      {stage === 0 && (
        <section className="grid gap-6 rounded-3xl border border-border bg-card p-6 sm:p-8 md:grid-cols-2">
          <div>
            <p className="text-sm font-bold text-primary">
              Una idea para llevarte
            </p>
            <h2
              id={title}
              tabIndex={-1}
              className={`mt-2 text-2xl font-black ${titleClass}`}
            >
              Por ciento significa “de cada 100”.
            </h2>
            <p className="mt-4 leading-relaxed text-muted-foreground">
              Si una tienda ofrece un 25% de descuento, te ahorrás 25 de cada
              100 pesos. Pagás los otros 75.
            </p>
            <div className="my-5 rounded-2xl bg-secondary p-4 text-sm leading-relaxed">
              <p>
                <strong>Ahorro</strong> = precio × porcentaje ÷ 100
              </p>
              <p className="mt-2">
                <strong>Precio final</strong> = precio − ahorro
              </p>
            </div>
            <button className={button} onClick={() => goTo(1)}>
              Probar con una mochila <ArrowRight size={18} />
            </button>
          </div>
          <div className="rounded-2xl bg-primary/5 p-5">
            <div
              role="img"
              aria-label="100 cuadrados: 25 representan el ahorro y 75 lo que pagás"
              className="grid grid-cols-10 gap-1.5"
            >
              {Array.from({ length: 100 }, (_, index) => (
                <span
                  key={index}
                  className={`aspect-square rounded-sm ${index < 25 ? "bg-cyan-500" : "bg-indigo-500"}`}
                />
              ))}
            </div>
            <div className="mt-5 flex flex-wrap gap-4 text-sm">
              <span className="flex items-center gap-2">
                <span className="h-3 w-3 rounded bg-cyan-500" />
                25: ahorrás
              </span>
              <span className="flex items-center gap-2">
                <span className="h-3 w-3 rounded bg-indigo-500" />
                75: pagás
              </span>
            </div>
          </div>
        </section>
      )}

      {stage === 1 && (
        <section className="rounded-3xl border border-border bg-card p-6 sm:p-8">
          <h2
            id={title}
            tabIndex={-1}
            className={`text-2xl font-black ${titleClass}`}
          >
            Mové el descuento. Mirá qué cambia.
          </h2>
          <p className="mt-2 text-muted-foreground">
            Probá con 0%, 50% y 100%. ¿Cuándo pagás la mitad? ¿Cuándo no pagás
            nada?
          </p>
          <div className="mt-7 grid gap-8 md:grid-cols-2">
            <div className="rounded-2xl bg-secondary/60 p-6">
              <ShoppingBag size={44} className="mb-4 text-primary" />
              <h3 className="text-xl font-bold">Mochila exploradora</h3>
              <p className="mt-2 text-muted-foreground">
                Precio original: {money(20000)}
              </p>
              <label
                htmlFor="discount"
                className="mt-7 flex justify-between font-bold"
              >
                <span>Descuento</span>
                <span>{discount}%</span>
              </label>
              <input
                id="discount"
                type="range"
                min="0"
                max="100"
                step="5"
                value={discount}
                aria-valuetext={`${discount}% de descuento: pagás ${money(20000 - savings)} y ahorrás ${money(savings)}`}
                onChange={(event) => setDiscount(Number(event.target.value))}
                className="my-5 min-h-8 w-full cursor-pointer accent-blue-500"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Sin descuento</span>
                <span>¡Gratis!</span>
              </div>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Pagás</p>
              <p className="mt-2 text-5xl font-black tracking-tight">
                {money(20000 - savings)}
              </p>
              <p className="mt-3 font-semibold text-primary">
                Ahorrás {money(savings)}
              </p>
              <div
                aria-hidden="true"
                className="my-6 flex h-8 overflow-hidden rounded-full bg-secondary"
              >
                <div
                  style={{ width: `${100 - discount}%` }}
                  className="bg-indigo-500 transition-[width] duration-300 motion-reduce:transition-none"
                />
                <div
                  style={{ width: `${discount}%` }}
                  className="bg-cyan-500 transition-[width] duration-300 motion-reduce:transition-none"
                />
              </div>
              <p className="text-sm leading-relaxed text-muted-foreground">
                {money(20000)} × {discount} ÷ 100 = {money(savings)} de ahorro.
                <br />
                {money(20000)} − {money(savings)} = {money(20000 - savings)} a
                pagar.
              </p>
            </div>
          </div>
          <button className={`${button} mt-7`} onClick={() => goTo(2)}>
            Estoy listo para los retos <ArrowRight size={18} />
          </button>
        </section>
      )}

      {stage === 2 && (
        <section className="rounded-3xl border border-border bg-card p-6 sm:p-8">
          {finished ? (
            <div className="py-6 text-center" role="status">
              <Trophy size={56} className="mx-auto text-amber-500" />
              <h2
                id={title}
                tabIndex={-1}
                className={`mt-5 text-3xl font-black ${titleClass}`}
              >
                ¡Misión cumplida!
              </h2>
              <p className="mx-auto mt-3 max-w-lg text-muted-foreground">
                Resolviste los tres retos en {attempts} intentos. Ya practicaste
                cómo calcular el ahorro y distinguirlo del precio final.
              </p>
              <p className="mt-4 text-sm">
                Tu próxima misión: encontrá una oferta y comprobá cuánto
                pagarías.
              </p>
              <button className={`${button} mt-6`} onClick={reset}>
                <RotateCcw size={18} /> Volver a practicar
              </button>
            </div>
          ) : (
            <>
              <p className="text-sm font-bold text-primary">
                Reto {mission + 1} de {missions.length}
              </p>
              <h2
                id={title}
                tabIndex={-1}
                className={`mt-2 text-2xl font-black ${titleClass}`}
              >
                {current.title}
              </h2>
              <p className="mt-4 text-lg">
                Cuesta <strong>{money(current.price)}</strong> y tiene un{" "}
                <strong>{current.discount}% de descuento</strong>. ¿Cuál es el
                precio final?
              </p>
              <fieldset className="mt-6">
                <legend className="text-sm text-muted-foreground">
                  Elegí cuánto pagarías:
                </legend>
                <div className="mt-3 grid gap-3 sm:grid-cols-3">
                  {current.options.map((option) => (
                    <button
                      key={option}
                      disabled={correct}
                      aria-pressed={selected === option}
                      aria-busy={checking && selected === option}
                      onClick={() => choose(option)}
                      className={`rounded-2xl border-2 p-5 text-xl font-bold disabled:cursor-default ${selected === option ? "border-primary bg-primary/10" : "border-border hover:border-primary disabled:hover:border-border"}`}
                    >
                      {money(option)}
                    </button>
                  ))}
                </div>
              </fieldset>
              <div aria-live="polite" aria-atomic="true" className="mt-5">
                {checking ? (
                  <p className="text-sm text-muted-foreground">
                    Revisando tu respuesta…
                  </p>
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
                      className={`rounded-xl border p-4 ${correct ? "border-emerald-500/40 bg-emerald-500/10" : "border-amber-500/40 bg-amber-500/10"}`}
                    >
                      <p className="font-bold">{result.title}</p>
                      <p className="mt-2 text-sm leading-relaxed">
                        {result.detail}
                      </p>
                    </div>
                  )
                )}
              </div>
              <div className="mt-5 flex flex-wrap gap-3">
                {!correct && (
                  <button
                    className="inline-flex items-center gap-2 rounded-xl border border-border px-4 py-3 font-semibold hover:bg-secondary"
                    aria-expanded={hint}
                    aria-controls="lab-hint"
                    onClick={() => setHint((value) => !value)}
                  >
                    <Lightbulb size={18} />
                    {hint ? "Ocultar pista" : "Necesito una pista"}
                  </button>
                )}
                {correct && (
                  <button
                    id="lab-next"
                    className={button}
                    onClick={() => {
                      pendingFocus.current = title;
                      if (mission === missions.length - 1) setFinished(true);
                      else {
                        setMission((value) => value + 1);
                        setSelected(null);
                        setResult(null);
                        setHint(false);
                      }
                    }}
                  >
                    {mission === missions.length - 1
                      ? "Ver mi recorrido"
                      : "Siguiente reto"}
                    <ArrowRight size={18} />
                  </button>
                )}
              </div>
              {hint && !correct && (
                <p
                  id="lab-hint"
                  className="mt-4 rounded-xl bg-secondary p-4 text-sm leading-relaxed"
                >
                  {current.hint}
                </p>
              )}
            </>
          )}
        </section>
      )}
      <p className="text-center text-xs leading-relaxed text-muted-foreground">
        {unit
          ? "Sin nota de acreditación. Tus respuestas se guardan para que tu docente vea en qué necesitás ayuda."
          : "Práctica libre, sin nota de acreditación. El recorrido se reinicia al salir o recargar la página."}
      </p>
    </div>
  );
}
