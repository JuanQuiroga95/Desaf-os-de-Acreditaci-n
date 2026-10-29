"use client";

import { useState } from "react";
import { MotionConfig, motion } from "framer-motion";
import {
  ArrowDownUp,
  ArrowRight,
  Hash,
  Lightbulb,
  RotateCcw,
  Ruler,
  Search,
  Tag,
} from "lucide-react";
import {
  booksData,
  getActivity,
  variableLabels,
  type CenterItem,
  type StatisticsItem,
  type VariableItem,
} from "@/lib/activities";
import {
  ActivityFrame,
  AnswerFeedback,
  StageNav,
  primaryButton,
  secondaryButton,
  stageTitle,
  stageTitleClass,
  useAnswerChecker,
  useFocusAfterRender,
  type UnitContext,
} from "./shared";

const items = getActivity("estadistica-detectives")!.items as StatisticsItem[];
const variables = items.filter((i): i is VariableItem => i.round === "variables");
const centers = items.filter((i): i is CenterItem => i.round === "centro");

const bins = [
  { key: "cualitativa", icon: Tag, color: "bg-fuchsia-500", rule: "Se responde con una palabra" },
  { key: "discreta", icon: Hash, color: "bg-sky-500", rule: "Se cuenta: 0, 1, 2…" },
  { key: "continua", icon: Ruler, color: "bg-emerald-500", rule: "Se mide: admite decimales" },
];

// Cada dato conserva su posición original como clave para animar el reordenamiento.
const books = booksData.map((value, id) => ({ value, id }));
const sortedBooks = [...books].sort((a, b) => a.value - b.value);
const values = Array.from({ length: Math.max(...booksData) + 1 }, (_, v) => v);
const frequency = (value: number) => booksData.filter((d) => d === value).length;

/** Sin `unit` es práctica libre local; con `unit`, cada respuesta se corrige y registra en el servidor. */
export default function DataDetectives({ unit }: { unit?: UnitContext }) {
  const [stage, setStage] = useState(0);
  const [round, setRound] = useState({ variables: 0, centro: 0 });
  const [classified, setClassified] = useState<VariableItem[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [hint, setHint] = useState(false);
  const [sorted, setSorted] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [finished, setFinished] = useState(false);
  const { result, checking, saveError, check, clear } = useAnswerChecker(unit);
  const focusNext = useFocusAfterRender();
  const correct = result?.correct === true;
  const variable = variables[round.variables];
  const center = centers[round.centro];
  const shownBooks = sorted ? sortedBooks : books;

  function resetQuestion() {
    setSelected(null);
    setHint(false);
    clear();
  }

  function goTo(nextStage: number) {
    focusNext(stageTitle);
    resetQuestion();
    setStage(nextStage);
  }

  function reset() {
    focusNext(stageTitle);
    setStage(0);
    setRound({ variables: 0, centro: 0 });
    setClassified([]);
    setSorted(false);
    setAttempts(0);
    setFinished(false);
    resetQuestion();
  }

  async function choose(item: StatisticsItem, option: string) {
    setSelected(option);
    const answer = await check(item, option);
    if (!answer) {
      setSelected(null);
      return;
    }
    setAttempts((value) => value + 1);
    if (!answer.correct) return;
    focusNext("lab-next");
    if (item.round === "variables" && !classified.some((c) => c.id === item.id))
      setClassified((list) => [...list, item]);
  }

  function next(kind: "variables" | "centro") {
    const total = kind === "variables" ? variables.length : centers.length;
    if (round[kind] < total - 1) {
      focusNext(stageTitle);
      resetQuestion();
      setRound((r) => ({ ...r, [kind]: r[kind] + 1 }));
    } else if (kind === "variables") goTo(2);
    else {
      focusNext(stageTitle);
      setFinished(true);
    }
  }

  const hintBlock = (text: string) => (
    <>
      {!correct && (
        <button
          className={secondaryButton}
          aria-expanded={hint}
          aria-controls="lab-hint"
          onClick={() => setHint((value) => !value)}
        >
          <Lightbulb size={18} />
          {hint ? "Ocultar pista" : "Necesito una pista"}
        </button>
      )}
      {hint && !correct && (
        <p
          id="lab-hint"
          className="basis-full rounded-xl bg-secondary p-4 text-sm leading-relaxed"
        >
          {text}
        </p>
      )}
    </>
  );

  return (
    <MotionConfig reducedMotion="user">
      <ActivityFrame
        unit={unit}
        freeEyebrow="Laboratorio de matemática · Práctica libre"
        title="Detectives de datos"
        description="Toda encuesta deja pistas. Clasificá las variables y descubrí qué cuentan los datos de un curso."
        total={items.length}
        gradient="from-emerald-950 via-teal-900 to-sky-800"
        glyph={<Search size={170} strokeWidth={2.5} />}
      >
        <StageNav
          labels={["Descubrí", "Clasificá", "Investigá"]}
          stage={stage}
          onSelect={(index) => {
            resetQuestion();
            setStage(index);
          }}
        />

        {stage === 0 && (
          <section className="rounded-3xl border border-border bg-card p-6 sm:p-8">
            <p className="text-sm font-bold text-primary">El manual del detective</p>
            <h2
              id={stageTitle}
              tabIndex={-1}
              className={`mt-2 text-2xl font-black ${stageTitleClass}`}
            >
              Una variable es lo que preguntamos en una encuesta.
            </h2>
            <p className="mt-3 leading-relaxed text-muted-foreground">
              Antes de calcular, hay que saber qué tipo de dato tenemos entre
              manos.
            </p>
            <div className="mt-6 grid gap-4 md:grid-cols-3">
              {[
                { ...bins[0], example: "Color favorito: azul, rojo…" },
                { ...bins[1], example: "Cantidad de mascotas: 0, 1, 2…" },
                { ...bins[2], example: "Peso de una mochila: 3,25 kg" },
              ].map(({ key, icon: Icon, color, rule, example }) => (
                <div key={key} className="rounded-2xl bg-secondary/60 p-5">
                  <span className={`flex h-11 w-11 items-center justify-center rounded-xl text-white ${color}`}>
                    <Icon size={22} />
                  </span>
                  <h3 className="mt-4 font-black">{variableLabels[key]}</h3>
                  <p className="mt-1 text-sm font-semibold">{rule}</p>
                  <p className="mt-2 text-sm text-muted-foreground">{example}</p>
                </div>
              ))}
            </div>
            <div className="mt-6 rounded-2xl bg-primary/5 p-5 text-sm leading-relaxed">
              <p className="font-bold">Después vas a investigar con tres medidas:</p>
              <ul className="mt-2 space-y-1">
                <li><strong>Moda:</strong> el valor que más se repite.</li>
                <li><strong>Mediana:</strong> el valor del medio, con los datos ordenados.</li>
                <li><strong>Media:</strong> la suma de todos los datos dividida por la cantidad.</li>
              </ul>
            </div>
            <button className={`${primaryButton} mt-6`} onClick={() => goTo(1)}>
              Empezar a clasificar <ArrowRight size={18} />
            </button>
          </section>
        )}

        {stage === 1 && (
          <section className="rounded-3xl border border-border bg-card p-6 sm:p-8">
            <p className="text-sm font-bold text-primary">
              Variable {round.variables + 1} de {variables.length}
            </p>
            <h2
              id={stageTitle}
              tabIndex={-1}
              className={`mt-2 text-2xl font-black ${stageTitleClass}`}
            >
              {variable.title}
            </h2>
            <fieldset className="mt-6">
              <legend className="text-sm text-muted-foreground">
                ¿En qué caja va esta variable?
              </legend>
              <div className="mt-3 grid gap-3 sm:grid-cols-3">
                {bins.map(({ key, icon: Icon, color, rule }) => (
                  <button
                    key={key}
                    disabled={correct}
                    aria-pressed={selected === key}
                    aria-busy={checking && selected === key}
                    onClick={() => choose(variable, key)}
                    className={`flex items-center gap-3 rounded-2xl border-2 p-4 text-left disabled:cursor-default ${selected === key ? "border-primary bg-primary/10" : "border-border hover:border-primary disabled:hover:border-border"}`}
                  >
                    <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-white ${color}`}>
                      <Icon size={20} />
                    </span>
                    <span>
                      <span className="block font-bold">{variableLabels[key]}</span>
                      <span className="block text-xs text-muted-foreground">{rule}</span>
                    </span>
                  </button>
                ))}
              </div>
            </fieldset>
            <AnswerFeedback result={result} checking={checking} saveError={saveError} />
            <div className="mt-5 flex flex-wrap gap-3">
              {hintBlock(variable.hint)}
              {correct && (
                <button id="lab-next" className={primaryButton} onClick={() => next("variables")}>
                  {round.variables === variables.length - 1
                    ? "Pasar a investigar datos"
                    : "Siguiente variable"}
                  <ArrowRight size={18} />
                </button>
              )}
            </div>

            <h3 className="mt-8 text-xs font-black uppercase tracking-widest text-muted-foreground">
              Tus cajas ({classified.length} de {variables.length})
            </h3>
            <div className="mt-3 grid gap-3 sm:grid-cols-3">
              {bins.map(({ key, color }) => {
                const inBin = classified.filter((c) => c.answer === key);
                return (
                  <div key={key} className="rounded-2xl border border-dashed border-border p-4">
                    <p className="flex items-center gap-2 text-xs font-black uppercase tracking-widest">
                      <span className={`h-2.5 w-2.5 rounded-full ${color}`} />
                      {variableLabels[key]} ({inBin.length})
                    </p>
                    <ul className="mt-3 space-y-2">
                      {inBin.map((c) => (
                        <motion.li
                          key={c.id}
                          initial={{ opacity: 0, y: -12, scale: 0.9 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          className="rounded-lg bg-secondary px-3 py-2 text-xs font-semibold"
                        >
                          {c.title}
                        </motion.li>
                      ))}
                    </ul>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {stage === 2 && (
          <section className="rounded-3xl border border-border bg-card p-6 sm:p-8">
            {finished ? (
              <div className="py-6 text-center" role="status">
                <Search size={56} className="mx-auto text-emerald-500" />
                <h2
                  id={stageTitle}
                  tabIndex={-1}
                  className={`mt-5 text-3xl font-black ${stageTitleClass}`}
                >
                  ¡Caso resuelto!
                </h2>
                <p className="mx-auto mt-3 max-w-lg text-muted-foreground">
                  Respondiste {items.length} preguntas en {attempts} intentos.
                  Clasificaste variables y encontraste la moda (2), la mediana
                  (3) y la media (4) de los libros leídos.
                </p>
                <p className="mt-4 text-sm">
                  Para pensar: ¿cuál de las tres medidas describe mejor a este
                  curso? ¿Por qué?
                </p>
                <button className={`${primaryButton} mt-6`} onClick={reset}>
                  <RotateCcw size={18} /> Jugar de nuevo
                </button>
              </div>
            ) : (
              <>
                <p className="text-sm font-bold text-primary">
                  Pista {round.centro + 1} de {centers.length}
                </p>
                <h2
                  id={stageTitle}
                  tabIndex={-1}
                  className={`mt-2 text-2xl font-black ${stageTitleClass}`}
                >
                  {center.title}
                </h2>
                <p className="mt-2 text-muted-foreground">
                  Le preguntamos a 9 estudiantes cuántos libros leyeron en el año.
                </p>

                <div className="mt-6 grid gap-6 lg:grid-cols-2">
                  <div className="rounded-2xl bg-secondary/60 p-5">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <p className="text-sm font-bold">
                        {sorted ? "Datos ordenados" : "Datos como se registraron"}
                      </p>
                      <button
                        className="inline-flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2 text-xs font-bold hover:bg-secondary"
                        aria-pressed={sorted}
                        onClick={() => setSorted((value) => !value)}
                      >
                        <ArrowDownUp size={14} />
                        {sorted ? "Ver orden original" : "Ordenar de menor a mayor"}
                      </button>
                    </div>
                    <ol
                      aria-label={`Datos: ${shownBooks.map((b) => b.value).join(", ")}`}
                      className="mt-4 grid grid-cols-9 gap-1.5"
                    >
                      {shownBooks.map(({ value, id }, index) => (
                        <motion.li
                          layout
                          key={id}
                          transition={{ type: "spring", stiffness: 300, damping: 26 }}
                          className={`flex aspect-square items-center justify-center rounded-lg text-sm font-black sm:text-base ${index === 4 ? "bg-amber-400 text-amber-950" : "bg-card"}`}
                        >
                          {value}
                        </motion.li>
                      ))}
                    </ol>
                    <p className="mt-2 text-xs text-muted-foreground">
                      En amarillo, el lugar 5: el del medio.
                    </p>
                  </div>

                  <div className="rounded-2xl bg-secondary/60 p-5">
                    <p className="text-sm font-bold">Cuántos estudiantes leyeron cada cantidad</p>
                    <div
                      role="img"
                      aria-label={`Gráfico de puntos: ${values.map((v) => `${v} libros, ${frequency(v)} estudiantes`).join("; ")}`}
                      className="mt-4 flex items-end justify-between gap-1"
                    >
                      {values.map((value) => (
                        <div key={value} className="flex flex-1 flex-col items-center gap-1">
                          <div className="flex h-20 flex-col-reverse items-center gap-1">
                            {Array.from({ length: frequency(value) }, (_, i) => (
                              <span key={i} className="h-5 w-5 rounded-full bg-emerald-500" />
                            ))}
                          </div>
                          <span className="text-xs font-bold">{value}</span>
                        </div>
                      ))}
                    </div>
                    <p className="mt-2 text-center text-xs text-muted-foreground">Libros leídos</p>
                  </div>
                </div>

                <fieldset className="mt-6">
                  <legend className="text-sm text-muted-foreground">Elegí tu respuesta:</legend>
                  <div className="mt-3 grid gap-3 sm:grid-cols-3">
                    {center.options.map((option) => (
                      <button
                        key={option}
                        disabled={correct}
                        aria-pressed={selected === option}
                        aria-busy={checking && selected === option}
                        onClick={() => choose(center, option)}
                        className={`rounded-2xl border-2 p-5 text-xl font-bold disabled:cursor-default ${selected === option ? "border-primary bg-primary/10" : "border-border hover:border-primary disabled:hover:border-border"}`}
                      >
                        {option} libros
                      </button>
                    ))}
                  </div>
                </fieldset>
                <AnswerFeedback result={result} checking={checking} saveError={saveError} />
                <div className="mt-5 flex flex-wrap gap-3">
                  {hintBlock(center.hint)}
                  {correct && (
                    <button id="lab-next" className={primaryButton} onClick={() => next("centro")}>
                      {round.centro === centers.length - 1 ? "Cerrar el caso" : "Siguiente pista"}
                      <ArrowRight size={18} />
                    </button>
                  )}
                </div>
              </>
            )}
          </section>
        )}
      </ActivityFrame>
    </MotionConfig>
  );
}
