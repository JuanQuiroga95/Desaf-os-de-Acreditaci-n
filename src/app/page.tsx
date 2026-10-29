"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, BookOpen, Gamepad2, Sparkles, Trophy } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { getStudentDashboard } from "@/app/actions/student";

type Dashboard = {
  subjects: {
    id: string;
    name: string;
    description: string | null;
    progress: number;
  }[];
  globalProgress: number;
};
const colors = [
  "from-blue-600 to-cyan-500",
  "from-violet-600 to-fuchsia-500",
  "from-emerald-600 to-teal-400",
];

export default function StudentDashboard() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [data, setData] = useState<Dashboard | null>(null);
  const [error, setError] = useState(false);
  const [retry, setRetry] = useState(0);
  useEffect(() => {
    if (isLoading) return;
    if (!user) router.replace("/login");
    else if (user.role === "admin") router.replace("/admin");
    else if (user.role === "teacher") router.replace("/docente");
  }, [isLoading, user, router]);
  useEffect(() => {
    if (user?.role !== "student") return;
    let cancelled = false;
    getStudentDashboard(user.id)
      .then((result) => {
        if (cancelled) return;
        if (result.success)
          setData({
            subjects: result.subjects || [],
            globalProgress: result.globalProgress || 0,
          });
        else setError(true);
      })
      .catch(() => {
        if (!cancelled) setError(true);
      });
    return () => {
      cancelled = true;
    };
  }, [user, retry]);
  if (isLoading || user?.role !== "student")
    return (
      <p role="status" className="p-12 text-center">
        Preparando tu aula…
      </p>
    );
  const next =
    data?.subjects.find((s) => s.progress > 0 && s.progress < 100) ||
    data?.subjects.find((s) => s.progress < 100);
  return (
    <div className="mx-auto max-w-7xl space-y-8 p-5 pb-24 sm:p-8 sm:pb-24">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="mb-2 text-sm text-muted-foreground">
            Tu espacio para descubrir y avanzar
          </p>
          <h1
            data-tour-id="dashboard-title"
            className="text-3xl font-black tracking-tight sm:text-4xl"
          >
            Hola, {user.name.split(" ")[0]}
            <br />
            <span className="text-primary">¿Qué aprendemos hoy?</span>
          </h1>
        </div>
        <Link
          href="/logros"
          className="flex items-center gap-2 rounded-full border border-border px-4 py-3 text-sm font-bold hover:bg-secondary"
        >
          <Trophy size={18} /> Mis logros
        </Link>
      </header>
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-950 via-blue-900 to-teal-800 p-7 text-white sm:p-10">
        <div
          aria-hidden="true"
          className="absolute -right-12 -top-16 h-64 w-64 rounded-full border-[35px] border-white/10"
        />
        <div className="relative grid items-center gap-8 md:grid-cols-[1.4fr_1fr]">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-2 text-xs font-bold text-cyan-100">
              <Sparkles size={16} /> Aprendé haciendo
            </span>
            <h2 className="mt-5 max-w-lg text-4xl font-black leading-tight tracking-tight sm:text-5xl">
              Las grandes ideas empiezan con un pequeño desafío.
            </h2>
            <p className="mt-4 max-w-lg leading-relaxed text-blue-100">
              Explorá, probá y volvé a intentar. Cada paso te acerca a tu
              próxima meta.
            </p>
            <a
              href="#materias"
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 font-bold text-blue-950"
            >
              Explorar mis materias <ArrowRight size={18} />
            </a>
          </div>
          <div className="rounded-2xl border border-white/20 bg-white/10 p-6">
            <p className="text-sm text-blue-100">
              Tu recorrido de acreditación
            </p>
            <p className="my-3 text-5xl font-black">
              {data ? `${data.globalProgress}%` : "—"}
            </p>
            <p className="text-sm text-blue-100">de los desafíos completados</p>
            <div className="my-5 h-2 overflow-hidden rounded-full bg-white/15">
              <div
                className="h-full rounded-full bg-cyan-300"
                style={{ width: `${data?.globalProgress || 0}%` }}
              />
            </div>
            {next && (
              <Link
                href={`/subjects/${next.id}`}
                className="flex items-center justify-between gap-3 text-sm font-bold"
              >
                {next.progress > 0 ? "Continuar con" : "Empezar con"}{" "}
                {next.name}
                <ArrowRight size={18} className="shrink-0" />
              </Link>
            )}
          </div>
        </div>
      </section>
      <Link
        href="/explorar/porcentajes"
        className="grid gap-5 rounded-3xl border border-primary/25 bg-primary/5 p-6 hover:bg-primary/10 sm:grid-cols-[auto_1fr_auto] sm:items-center"
      >
        <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-600 to-blue-600 text-white">
          <Gamepad2 size={38} />
        </div>
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-primary">
            Laboratorio · Matemática · Práctica libre
          </p>
          <h2 className="mt-2 text-2xl font-black">Misión descuentos</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Explorá los porcentajes con un simulador y tres retos.
          </p>
        </div>
        <span className="flex items-center gap-2 font-bold text-primary">
          Empezar <ArrowRight size={20} />
        </span>
      </Link>
      <section id="materias" className="scroll-mt-20">
        <h2 className="mb-5 flex items-center gap-3 text-2xl font-black">
          <BookOpen className="text-primary" />
          Mis materias
        </h2>
        {error ? (
          <div role="alert" className="rounded-2xl border border-border p-6">
            <p>No pudimos cargar tus materias.</p>
            <button
              onClick={() => {
                setError(false);
                setRetry((v) => v + 1);
              }}
              className="mt-3 rounded-xl bg-primary px-4 py-2 font-bold text-white"
            >
              Reintentar
            </button>
          </div>
        ) : !data ? (
          <p role="status">Cargando tus materias…</p>
        ) : !data.subjects.length ? (
          <p className="rounded-2xl border border-dashed border-border p-8 text-muted-foreground">
            Todavía no hay materias disponibles. Mientras tanto, podés explorar
            Misión descuentos.
          </p>
        ) : (
          <div
            data-tour-id="subject-card"
            className="grid gap-5 md:grid-cols-2 xl:grid-cols-3"
          >
            {data.subjects.map((s, i) => (
              <article
                key={s.id}
                className="flex flex-col overflow-hidden rounded-3xl border border-border bg-card"
              >
                <div
                  className={`relative overflow-hidden bg-gradient-to-br ${colors[i % colors.length]} p-6 text-white`}
                >
                  <BookOpen size={34} />
                  <span
                    aria-hidden="true"
                    className="absolute -right-3 -top-7 text-9xl font-black text-white/15"
                  >
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <p className="mt-5 text-xs font-bold uppercase tracking-widest">
                    {s.progress === 100
                      ? "Recorrido completado"
                      : s.progress > 0
                        ? "En camino"
                        : "Un nuevo comienzo"}
                  </p>
                </div>
                <div className="flex flex-1 flex-col p-6">
                  <h3 className="text-xl font-bold">{s.name}</h3>
                  <p className="mb-6 mt-2 text-sm leading-relaxed text-muted-foreground">
                    {s.description ||
                      "Descubrí los materiales y desafíos de esta materia."}
                  </p>
                  <div className="mt-auto">
                    <p className="mb-2 text-xs font-semibold">
                      Tu avance: {s.progress}%
                    </p>
                    <div className="h-2 overflow-hidden rounded-full bg-secondary">
                      <div
                        className="h-full rounded-full bg-primary"
                        style={{ width: `${s.progress}%` }}
                      />
                    </div>
                    <Link
                      href={`/subjects/${s.id}`}
                      className="mt-5 flex items-center justify-between rounded-xl bg-secondary px-4 py-3 text-sm font-bold hover:bg-primary hover:text-white"
                    >
                      {s.progress ? "Volver a la materia" : "Explorar materia"}
                      <ArrowRight size={16} />
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
