"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
  type PointerEvent,
  type RefObject,
} from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Box, Castle, Coins, Lock, Map as MapIcon, Shirt, Sparkles, Target, Wrench, Zap } from "lucide-react";
import type { WorldData } from "@/app/actions/world";
import { XP_PER_ACTIVITY_ITEM, XP_PER_CHALLENGE, ACTIVITY_ITEM_COINS } from "@/lib/progress";
import {
  DISTRICTS,
  GENERATOR,
  GUIDE,
  SPAWN,
  TOWER,
  TOWER_KEY,
  WORLD_LIMIT,
  districtEnergy,
  isRepaired,
  placeMachines,
  towerStatus,
  type PlacedMachine,
} from "./layout";
import { getSkin } from "@/lib/skins";
import type { Vec2 } from "./CityScene";

const CityScene = dynamic(() => import("./CityScene"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full items-center justify-center text-sm font-semibold text-slate-300">
      Encendiendo la ciudad…
    </div>
  ),
});

type View = "3d" | "mapa";
const VIEW_KEY = "mundo-vista";

function hasWebGL() {
  try {
    const canvas = document.createElement("canvas");
    return Boolean(canvas.getContext("webgl2") || canvas.getContext("webgl"));
  } catch {
    return false;
  }
}

type ClientEnv = { webgl: boolean; touch: boolean; initialView: View };
// Se calcula una sola vez por pestaña (crear un contexto WebGL no es gratis).
let clientEnv: ClientEnv | null = null;

function readClientEnv(): ClientEnv {
  if (!clientEnv) {
    const webgl = hasWebGL();
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const saved = localStorage.getItem(VIEW_KEY);
    const savedView: View | null = saved === "3d" || saved === "mapa" ? saved : null;
    clientEnv = {
      webgl,
      touch: window.matchMedia("(pointer: coarse)").matches,
      initialView: !webgl ? "mapa" : savedView ?? (reduced ? "mapa" : "3d"),
    };
  }
  return clientEnv;
}

const noSubscribe = () => () => {};

type Tower = ReturnType<typeof towerStatus>;

function towerHowTo(tower: Tower) {
  return `Se abre cuando repares las ${tower.total} máquinas del Barrio Matemática (llevás ${tower.repaired}/${tower.total}).`;
}

function guideMessage(
  data: WorldData,
  placed: PlacedMachine[],
  near: PlacedMachine | null,
  nearTower: boolean,
  tower: Tower,
) {
  if (nearTower)
    return tower.open
      ? `Esta es la Torre de Desafíos. Adentro están los desafíos que publica tu docente: cada uno que entregás suma ${XP_PER_CHALLENGE} de experiencia y 10 monedas.`
      : `La Torre de Desafíos sigue sin energía. ${towerHowTo(tower)}`;
  if (!data.activitiesReady)
    return `Las máquinas están en mantenimiento. Mientras tanto, cada desafío que entregás suma ${XP_PER_CHALLENGE} de experiencia.`;
  if (near) {
    if (isRepaired(near))
      return `¡${near.title} ya funciona! Podés volver a practicar cuando quieras.`;
    return `Practicar no cambia tus avances. Jugar guarda cada acierto nuevo y da ${XP_PER_ACTIVITY_ITEM} de experiencia y ${ACTIVITY_ITEM_COINS} monedas.`;
  }
  const pending = placed.filter((m) => !isRepaired(m));
  if (!pending.length)
    return "¡Volvió la luz al Barrio Matemática y se abrió la Torre de Desafíos! Está al norte de la plaza: seguí la calle hacia arriba.";
  if (data.itemsSolved === 0)
    return "La ciudad se quedó sin energía. Caminá hasta el Barrio Matemática, a la izquierda, y repará las máquinas resolviendo sus retos. Cuando las repares todas se abre la Torre de Desafíos, al norte.";
  return `Vas muy bien. Te falta reparar ${pending.map((m) => m.title).join(" y ")} para abrir la Torre de Desafíos.`;
}

export default function WorldExperience({ data }: { data: WorldData }) {
  const router = useRouter();
  const placed = useMemo(() => placeMachines(data.machines), [data.machines]);
  const energy = useMemo(
    () => Object.fromEntries(DISTRICTS.map((d) => [d.id, districtEnergy(d, placed)])),
    [placed],
  );
  const active = DISTRICTS.filter((d) => !d.comingSoon);
  const hubEnergy = active.length
    ? active.reduce((acc, d) => acc + (energy[d.id] ?? 0), 0) / active.length
    : 0;

  // En el servidor no hay navegador: null hasta hidratar, sin setState en un effect.
  const env = useSyncExternalStore(noSubscribe, readClientEnv, () => null);
  const [chosen, setChosen] = useState<View | null>(null);
  const webgl = env?.webgl ?? true;
  const touch = env?.touch ?? false;
  const view: View | null = env ? (env.webgl ? chosen ?? env.initialView : "mapa") : null;
  const [nearKey, setNearKey] = useState<string | null>(null);
  const inputRef = useRef<Vec2>({ x: 0, z: 0 });
  const posRef = useRef<Vec2>({ ...SPAWN });
  const near = placed.find((m) => m.key === nearKey) ?? null;
  const nearTower = nearKey === TOWER_KEY;
  const tower = useMemo(() => towerStatus(placed, data.activitiesReady), [placed, data.activitiesReady]);
  const skin = getSkin(data.skin);

  const chooseView = (next: View) => {
    setChosen(next);
    setNearKey(null);
    localStorage.setItem(VIEW_KEY, next);
    if (clientEnv) clientEnv.initialView = next;
  };

  // Teclado: WASD o flechas para moverse y E para entrar a la máquina cercana.
  const enter = useCallback((practice = true) => {
    if (nearTower) {
      if (tower.open) router.push("/desafios");
      return;
    }
    if (near) router.push(practice ? near.practiceHref : near.href);
  }, [near, nearTower, tower.open, router]);

  useEffect(() => {
    if (view !== "3d") return;
    const pressed = new Set<string>();
    const update = () => {
      const x = (pressed.has("right") ? 1 : 0) - (pressed.has("left") ? 1 : 0);
      const z = (pressed.has("down") ? 1 : 0) - (pressed.has("up") ? 1 : 0);
      inputRef.current = { x, z };
    };
    const dir = (e: KeyboardEvent) =>
      ({
        KeyW: "up",
        ArrowUp: "up",
        KeyS: "down",
        ArrowDown: "down",
        KeyA: "left",
        ArrowLeft: "left",
        KeyD: "right",
        ArrowRight: "right",
      })[e.code];
    const typing = (e: KeyboardEvent) =>
      e.target instanceof HTMLElement &&
      (e.target.isContentEditable || ["INPUT", "TEXTAREA", "SELECT"].includes(e.target.tagName));
    const down = (e: KeyboardEvent) => {
      if (typing(e) || e.metaKey || e.ctrlKey || e.altKey) return;
      if (e.repeat) return;
      if (e.code === "KeyE") return enter(true);
      if (e.code === "KeyJ" && data.activitiesReady) return enter(false);
      const d = dir(e);
      if (!d) return;
      e.preventDefault();
      pressed.add(d);
      update();
    };
    const up = (e: KeyboardEvent) => {
      const d = dir(e);
      if (!d) return;
      pressed.delete(d);
      update();
    };
    const reset = () => {
      pressed.clear();
      update();
    };
    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);
    window.addEventListener("blur", reset);
    return () => {
      window.removeEventListener("keydown", down);
      window.removeEventListener("keyup", up);
      window.removeEventListener("blur", reset);
      inputRef.current = { x: 0, z: 0 };
    };
  }, [view, enter, data.activitiesReady]);

  const missions = [
    ...placed
      .filter((m) => m.area === "Matemática")
      .map((m) => ({
        id: m.key,
        label: `Reparar ${m.title}`,
        detail: `${m.solved}/${m.total} retos`,
        done: isRepaired(m),
        href: m.href,
      })),
    {
      id: "desafio",
      label: tower.open ? "Torre: entregar un desafío" : "Abrir la Torre de Desafíos",
      detail: !tower.open
        ? `${tower.repaired}/${tower.total} máquinas`
        : data.challengesDone
          ? `${data.challengesDone} entregados`
          : "0/1",
      done: data.challengesDone > 0,
      href: tower.open ? "/desafios" : null,
    },
  ];
  const missionsDone = missions.filter((m) => m.done).length;
  const message = guideMessage(data, placed, near, nearTower, tower);

  return (
    <div className="relative h-[calc(100dvh-4rem)] w-full overflow-hidden bg-[#070b1a] text-white lg:h-dvh">
      <h1 className="sr-only">Mundo: Ciudad sin energía</h1>

      {view === "3d" && (
        <div className="absolute inset-0">
          <CityScene
            machines={placed}
            energy={energy}
            hubEnergy={hubEnergy}
            inputRef={inputRef}
            posRef={posRef}
            onNearChange={setNearKey}
            skin={skin}
            tower={tower}
          />
        </div>
      )}
      {view === "mapa" && (
        <CityMap
          placed={placed}
          energy={energy}
          ready={data.activitiesReady}
          tower={tower}
          challengesAvailable={data.challengesAvailable}
          challengesDone={data.challengesDone}
        />
      )}

      {/* Barra superior: nivel, experiencia y monedas. */}
      <div className="pointer-events-none absolute inset-x-0 top-0 flex flex-wrap items-start justify-between gap-3 p-3 sm:p-4">
        <div className="pointer-events-auto flex items-center gap-3 rounded-2xl bg-slate-950/75 px-4 py-3 shadow-xl backdrop-blur">
          <div className="flex h-11 w-11 flex-col items-center justify-center rounded-xl bg-amber-400 text-slate-950">
            <span className="text-[9px] font-black uppercase leading-none">Nivel</span>
            <span className="text-lg font-black leading-none">{data.level}</span>
          </div>
          <div className="min-w-36">
            <p className="text-sm font-bold">{data.name}</p>
            <div
              role="progressbar"
              aria-label="Experiencia del nivel"
              aria-valuemin={0}
              aria-valuemax={data.xpPerLevel}
              aria-valuenow={data.xpInLevel}
              className="mt-1 h-2 w-full overflow-hidden rounded-full bg-white/15"
            >
              <div
                className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-emerald-400"
                style={{ width: `${(data.xpInLevel / data.xpPerLevel) * 100}%` }}
              />
            </div>
            <p className="mt-1 text-[11px] text-slate-300">
              {data.xpInLevel}/{data.xpPerLevel} de experiencia
            </p>
          </div>
          <div className="flex items-center gap-1.5 rounded-xl bg-yellow-400/15 px-3 py-2 text-sm font-black text-yellow-300">
            <Coins size={16} aria-hidden="true" /> {data.coins}
            <span className="sr-only">monedas Videla</span>
          </div>
          <Link
            href="/tienda#skins"
            className="flex items-center gap-1.5 rounded-xl bg-white/10 px-3 py-2 text-xs font-bold text-slate-100 hover:bg-white/20 focus-visible:outline-2 focus-visible:outline-cyan-300"
          >
            <Shirt size={15} aria-hidden="true" /> Skins
          </Link>
        </div>

        <div className="pointer-events-auto flex gap-1 rounded-2xl bg-slate-950/75 p-1 shadow-xl backdrop-blur">
          {webgl && (
            <button
              onClick={() => chooseView("3d")}
              aria-pressed={view === "3d"}
              className={`flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-bold ${view === "3d" ? "bg-white text-slate-950" : "text-slate-200 hover:bg-white/10"}`}
            >
              <Box size={14} aria-hidden="true" /> Vista 3D
            </button>
          )}
          <button
            onClick={() => chooseView("mapa")}
            aria-pressed={view === "mapa"}
            className={`flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-bold ${view === "mapa" ? "bg-white text-slate-950" : "text-slate-200 hover:bg-white/10"}`}
          >
            <MapIcon size={14} aria-hidden="true" /> Mapa
          </button>
        </div>
      </div>

      {/* Misiones: también sirven para ir directo a cada máquina con teclado. */}
      <section
        aria-labelledby="misiones"
        className="absolute left-3 top-28 hidden w-72 rounded-2xl bg-slate-950/75 p-4 shadow-xl backdrop-blur sm:left-4 md:block"
      >
        <h2 id="misiones" className="flex items-center gap-2 text-sm font-black">
          <Target size={16} className="text-amber-300" aria-hidden="true" /> Misiones{" "}
          <span className="ml-auto text-xs text-slate-300">
            {missionsDone}/{missions.length}
          </span>
        </h2>
        <ul className="mt-3 space-y-2">
          {missions.map((m) => {
            const content = (
              <>
                {m.href || m.done ? (
                  <span
                    aria-hidden="true"
                    className={`h-3 w-3 shrink-0 rounded-full border-2 ${m.done ? "border-emerald-400 bg-emerald-400" : "border-slate-400"}`}
                  />
                ) : (
                  <Lock size={12} className="shrink-0 text-red-300" aria-hidden="true" />
                )}
                <span className={m.done ? "text-slate-400 line-through" : ""}>{m.label}</span>
                <span className="ml-auto text-xs text-slate-400">
                  {m.done ? "Hecho" : m.detail}
                </span>
              </>
            );
            return (
              <li key={m.id}>
                {m.href ? (
                  <Link
                    href={m.href}
                    className="flex items-center gap-2 rounded-xl px-2 py-1.5 text-sm hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-cyan-300"
                  >
                    {content}
                  </Link>
                ) : (
                  <div className="flex items-center gap-2 rounded-xl px-2 py-1.5 text-sm text-slate-300">
                    {content}
                  </div>
                )}
              </li>
            );
          })}
        </ul>
        {!tower.open && (
          <p className="mt-2 rounded-xl bg-red-500/10 px-2 py-1.5 text-[11px] leading-relaxed text-red-100">
            <Castle size={12} className="mr-1 inline" aria-hidden="true" />
            La Torre de Desafíos está al norte de la plaza. {towerHowTo(tower)}
          </p>
        )}
        <p className="mt-3 border-t border-white/10 pt-3 text-[11px] leading-relaxed text-slate-400">
          Desafío entregado: +{XP_PER_CHALLENGE} de experiencia. Reto nuevo en Jugar: +
          {XP_PER_ACTIVITY_ITEM} y {ACTIVITY_ITEM_COINS} monedas la primera vez.
        </p>
      </section>

      {view === "3d" && <MiniMap placed={placed} posRef={posRef} towerOpen={tower.open} />}

      {/* Guía y máquina cercana. */}
      <div
        className={`pointer-events-none absolute inset-x-0 bottom-0 flex flex-col items-center gap-3 p-3 pb-6 pr-20 sm:p-4 sm:pb-6 ${view === "3d" && touch ? "max-sm:bottom-auto max-sm:top-[8.5rem] max-sm:pr-3" : ""}`}
      >
        {view === "3d" && nearTower && (
          <div
            className={`pointer-events-auto w-full max-w-md rounded-2xl border bg-slate-950/85 p-4 shadow-2xl backdrop-blur ${tower.open ? "border-amber-300/50" : "border-red-400/40"}`}
          >
            <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-amber-200">
              <Castle size={14} aria-hidden="true" /> Desafíos de tus docentes
            </p>
            <p className="mt-1 text-lg font-black">Torre de Desafíos</p>
            {tower.open ? (
              <>
                <p className="text-sm text-slate-300">
                  {data.challengesAvailable
                    ? `${data.challengesAvailable} desafíos publicados · ${data.challengesDone} entregados`
                    : "Tu docente todavía no publicó desafíos."}
                </p>
                <Link
                  href="/desafios"
                  className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-amber-300 px-4 py-3 font-black text-slate-950 hover:brightness-110 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
                >
                  Entrar a la torre
                  {!touch && <kbd className="rounded bg-slate-950/20 px-1.5 text-xs">E</kbd>}
                </Link>
              </>
            ) : (
              <>
                <p className="mt-1 flex items-start gap-2 text-sm text-red-100">
                  <Lock size={15} className="mt-0.5 shrink-0" aria-hidden="true" />
                  <span>
                    Cerrada. {towerHowTo(tower)}
                    {tower.pending.length > 0 && ` Te falta: ${tower.pending.map((m) => m.title).join(", ")}.`}
                  </span>
                </p>
                <p className="mt-2 text-[11px] text-slate-400">
                  ¿Tenés una entrega urgente? Los desafíos siguen en el menú, en Desafíos.
                </p>
              </>
            )}
          </div>
        )}
        {view === "3d" && near && (
          <div className="pointer-events-auto w-full max-w-md rounded-2xl border border-cyan-300/40 bg-slate-950/85 p-4 shadow-2xl backdrop-blur">
            <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-cyan-200">
              <Wrench size={14} aria-hidden="true" /> {near.topic}
            </p>
            <p className="mt-1 text-lg font-black">{near.title}</p>
            <p className="text-sm text-slate-300">
              {near.solved}/{near.total} retos resueltos
            </p>
            <Link
              href={near.practiceHref}
              className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-cyan-400 px-4 py-3 font-black text-slate-950 hover:brightness-110 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
            >
              Practicar · sin cambiar avances
              {!touch && <kbd className="rounded bg-slate-950/20 px-1.5 text-xs">E</kbd>}
            </Link>
            {data.activitiesReady && <Link href={near.href} className="mt-2 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-amber-300 px-4 py-3 font-black text-slate-950">
              Jugar · guardar avances {!touch && <kbd className="rounded bg-slate-950/20 px-1.5 text-xs">J</kbd>}
            </Link>}
          </div>
        )}
        <div
          aria-live="polite"
          className="pointer-events-auto flex max-w-xl items-start gap-3 rounded-2xl bg-slate-950/80 p-3 shadow-xl backdrop-blur"
        >
          <span
            aria-hidden="true"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-yellow-300 text-slate-950"
          >
            <Zap size={18} />
          </span>
          <p className="text-sm leading-relaxed">
            <span className="font-black text-yellow-300">Chispa: </span>
            {message}
          </p>
        </div>
        {view === "3d" && !touch && (
          <p className="text-[11px] text-slate-400">
            WASD o flechas para moverte · E practicar o entrar · J jugar
          </p>
        )}
      </div>

      {view === "3d" && touch && <Joystick inputRef={inputRef} />}
    </div>
  );
}

const MAP_SCALE = 100 / (WORLD_LIMIT * 2 + 6);
const toMap = (v: number) => 50 + v * MAP_SCALE;

function MiniMap({
  placed,
  posRef,
  towerOpen,
}: {
  placed: PlacedMachine[];
  posRef: RefObject<Vec2>;
  towerOpen: boolean;
}) {
  const [pos, setPos] = useState<Vec2>({ ...SPAWN });
  useEffect(() => {
    const id = window.setInterval(() => {
      const p = posRef.current;
      if (p) setPos({ x: p.x, z: p.z });
    }, 200);
    return () => window.clearInterval(id);
  }, [posRef]);
  return (
    <div
      aria-hidden="true"
      className="absolute right-4 top-20 hidden h-36 w-36 overflow-hidden rounded-2xl border border-white/15 bg-slate-950/80 shadow-xl backdrop-blur sm:block"
    >
      <svg viewBox="0 0 100 100" className="h-full w-full">
        {DISTRICTS.map((d) => (
          <circle
            key={d.id}
            cx={toMap(d.x)}
            cy={toMap(d.z)}
            r={6.5 * MAP_SCALE}
            fill={d.comingSoon ? "#1f2937" : d.color}
            fillOpacity={d.comingSoon ? 1 : 0.15}
          />
        ))}
        <circle cx={toMap(GENERATOR.x)} cy={toMap(GENERATOR.z)} r={3} fill="#38bdf8" />
        <circle cx={toMap(GUIDE.x)} cy={toMap(GUIDE.z)} r={1.8} fill="#facc15" />
        <polygon
          points={`${toMap(TOWER.x)},${toMap(TOWER.z) - 4} ${toMap(TOWER.x) + 3.5},${toMap(TOWER.z) + 3} ${toMap(TOWER.x) - 3.5},${toMap(TOWER.z) + 3}`}
          fill={towerOpen ? "#facc15" : "#ef4444"}
        />
        {placed.map((m) => (
          <rect
            key={m.key}
            x={toMap(m.x) - 2.5}
            y={toMap(m.z) - 2.5}
            width={5}
            height={5}
            rx={1}
            fill={isRepaired(m) ? m.color : m.solved ? "#f59e0b" : "#ef4444"}
          />
        ))}
        <circle cx={toMap(pos.x)} cy={toMap(pos.z)} r={2.6} fill="#fff" stroke="#f59e0b" strokeWidth={1.2} />
      </svg>
    </div>
  );
}

/** Vista sin 3D: liviana, para teléfonos lentos, teclado o menos movimiento. */
function CityMap({
  placed,
  energy,
  ready,
  tower,
  challengesAvailable,
  challengesDone,
}: {
  placed: PlacedMachine[];
  energy: Record<string, number>;
  ready: boolean;
  tower: Tower;
  challengesAvailable: number;
  challengesDone: number;
}) {
  return (
    <div className="absolute inset-0 overflow-y-auto px-4 pb-48 pt-28 md:pl-80 md:pr-6">
      <div className="mx-auto grid max-w-3xl gap-4 sm:grid-cols-2">
        <section
          aria-labelledby="torre-desafios"
          className={`rounded-3xl border bg-slate-900/80 p-5 sm:col-span-2 ${tower.open ? "border-amber-300/40" : "border-red-400/30"}`}
        >
          <h2 id="torre-desafios" className="flex items-center gap-2 text-lg font-black">
            <Castle size={18} className={tower.open ? "text-amber-300" : "text-red-300"} aria-hidden="true" />
            Torre de Desafíos
            <span
              className={`ml-auto rounded-full px-2 py-0.5 text-[11px] font-bold ${tower.open ? "bg-amber-300/20 text-amber-200" : "bg-red-400/15 text-red-200"}`}
            >
              {tower.open ? "Abierta" : `Cerrada · ${tower.repaired}/${tower.total}`}
            </span>
          </h2>
          <p className="mt-1 text-xs text-slate-400">Al norte de la plaza, al final de la calle central.</p>
          {tower.open ? (
            <>
              <p className="mt-3 text-sm text-slate-300">
                {challengesAvailable
                  ? `${challengesAvailable} desafíos publicados por tus docentes · ${challengesDone} entregados.`
                  : "Tu docente todavía no publicó desafíos."}
              </p>
              <Link
                href="/desafios"
                className="mt-3 inline-flex w-full items-center justify-center rounded-lg bg-amber-300 px-3 py-2 text-sm font-black text-slate-950 sm:w-auto"
              >
                Entrar a la torre
              </Link>
            </>
          ) : (
            <p className="mt-3 text-sm text-red-100">
              {towerHowTo(tower)}
              {tower.pending.length > 0 && ` Te falta: ${tower.pending.map((m) => m.title).join(", ")}.`}
            </p>
          )}
        </section>
        {DISTRICTS.map((d) => {
          const machines = placed.filter((m) => m.area === d.area);
          const e = energy[d.id] ?? 0;
          return (
            <section
              key={d.id}
              aria-labelledby={`barrio-${d.id}`}
              className="rounded-3xl border border-white/10 bg-slate-900/80 p-5"
              style={{ boxShadow: d.comingSoon ? undefined : `0 0 ${10 + e * 40}px ${d.color}33` }}
            >
              <h2 id={`barrio-${d.id}`} className="flex items-center gap-2 text-lg font-black">
                {d.comingSoon ? (
                  <Lock size={18} aria-hidden="true" />
                ) : (
                  <Sparkles size={18} style={{ color: d.color }} aria-hidden="true" />
                )}
                {d.name}
              </h2>
              {d.comingSoon ? (
                <p className="mt-2 text-sm text-slate-400">Próximamente.</p>
              ) : (
                <>
                  <p className="mt-1 text-xs text-slate-400">Energía: {Math.round(e * 100)}%</p>
                  <ul className="mt-4 space-y-3">
                    {machines.map((m) => (
                      <li key={m.key}>
                        <div
                          className="block rounded-2xl border border-white/10 bg-slate-950/60 p-4 hover:border-cyan-300/60 focus-visible:outline-2 focus-visible:outline-cyan-300"
                        >
                          <span className="flex items-center justify-between gap-2">
                            <span className="font-bold">{m.title}</span>
                            <span
                              className={`rounded-full px-2 py-0.5 text-[11px] font-bold ${isRepaired(m) ? "bg-emerald-400/20 text-emerald-300" : "bg-red-400/15 text-red-300"}`}
                            >
                              {isRepaired(m) ? "Reparada" : "Sin energía"}
                            </span>
                          </span>
                          <span className="mt-1 block text-xs text-slate-400">
                            {m.topic} · {m.solved}/{m.total} retos
                            {m.published ? ` · ${m.unitLabel}` : ""}
                          </span>
                          <div className="mt-3 flex flex-col gap-2">
                            <Link href={m.practiceHref} className="rounded-lg border border-white/20 px-3 py-2 text-center text-sm font-bold">Practicar</Link>
                            {ready && <Link href={m.href} className="rounded-lg bg-amber-300 px-3 py-2 text-center text-sm font-black text-slate-950">Jugar · guardar avances</Link>}
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                </>
              )}
            </section>
          );
        })}
      </div>
    </div>
  );
}

/** Joystick en pantalla para celulares. */
function Joystick({ inputRef }: { inputRef: RefObject<Vec2> }) {
  const base = useRef<HTMLDivElement>(null);
  const [knob, setKnob] = useState({ x: 0, y: 0 });
  const RADIUS = 48;

  const move = (e: PointerEvent) => {
    const el = base.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    let x = e.clientX - (rect.left + rect.width / 2);
    let y = e.clientY - (rect.top + rect.height / 2);
    const len = Math.hypot(x, y);
    if (len > RADIUS) {
      x = (x / len) * RADIUS;
      y = (y / len) * RADIUS;
    }
    setKnob({ x, y });
    inputRef.current = { x: x / RADIUS, z: y / RADIUS };
  };
  const release = () => {
    setKnob({ x: 0, y: 0 });
    inputRef.current = { x: 0, z: 0 };
  };

  return (
    <div
      ref={base}
      aria-hidden="true"
      onPointerDown={(e) => {
        e.currentTarget.setPointerCapture(e.pointerId);
        move(e);
      }}
      onPointerMove={(e) => {
        if (e.buttons) move(e);
      }}
      onPointerUp={release}
      onPointerCancel={release}
      className="absolute bottom-6 left-4 h-32 w-32 touch-none rounded-full border-2 border-white/25 bg-white/10 backdrop-blur"
    >
      <div
        className="absolute left-1/2 top-1/2 h-14 w-14 rounded-full bg-white/70 shadow-lg"
        style={{ transform: `translate(calc(-50% + ${knob.x}px), calc(-50% + ${knob.y}px))` }}
      />
    </div>
  );
}
