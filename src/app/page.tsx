"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, BookOpen, Gamepad2, Sparkles, Trophy } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { getStudentDashboard } from "@/app/actions/student";
import { activities } from "@/lib/activities";
import { GameCard } from "@/components/learning/GameCard";
import { LearningUniverse } from "@/components/learning/LearningUniverse";

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
    <div className="student-discovery mx-auto max-w-7xl space-y-10 p-5 pb-24 sm:p-8 sm:pb-24">
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
      <section className="discovery-hero relative overflow-hidden rounded-[2rem] p-6 text-white sm:p-10">
        <div className="discovery-grid" aria-hidden="true" />
        <div className="relative grid items-center gap-3 xl:grid-cols-[1.2fr_1fr]">
          <div>
            <span className="discovery-eyebrow">
              <Sparkles size={14} /> TU PRÓXIMA GRAN IDEA EMPIEZA ACÁ
            </span>
            <h2 className="mt-6 max-w-xl text-4xl font-black leading-[1.06] tracking-tight sm:text-6xl">
              Tu curiosidad.<br />
              <span className="discovery-gradient-text">Sin límites.</span>
            </h2>
            <p className="mt-4 max-w-lg leading-relaxed text-blue-100">
              Un desafío, una idea, un nuevo logro. Aprendé a tu ritmo,
              poné a prueba lo que sabés y descubrí hasta dónde podés llegar.
            </p>
            <div className="mt-7 flex flex-wrap gap-3"><a
              href="#materias"
              className="discovery-cta inline-flex items-center gap-2 rounded-full px-5 py-3 text-sm font-bold"
            >
              Explorar mis materias <ArrowRight size={18} />
            </a>
            <Link href="/juegos" className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/5 px-5 py-3 text-sm font-bold hover:bg-white/10"><Gamepad2 size={18} /> Ir a jugar</Link></div>
          </div>
          <LearningUniverse />
        </div>
          <div className="relative mt-6 grid items-center gap-4 rounded-2xl border border-white/15 bg-white/5 p-5 sm:grid-cols-[1fr_1fr]">
            <div>
            <p className="text-sm text-blue-100">
              Tu recorrido de acreditación
            </p>
            <p className="mt-2 text-3xl font-black text-amber-200">
              {data ? `${data.globalProgress}%` : "—"}
              <span className="ml-3 text-xs font-medium text-blue-100">de los desafíos completados</span>
            </p>
            </div><div>
            <div className="my-3 h-2 overflow-hidden rounded-full bg-white/15">
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
      <section aria-labelledby="juegos-title">
        <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
          <h2
            id="juegos-title"
            className="flex items-center gap-3 text-2xl font-black"
          >
            <Gamepad2 className="text-primary" />
            Juegos para practicar
          </h2>
          <Link
            href="/juegos"
            className="flex items-center gap-2 text-sm font-bold text-primary"
          >
            Ver todos <ArrowRight size={16} />
          </Link>
        </div>
        <p className="-mt-2 mb-5 text-sm text-muted-foreground">Elegí una misión. Acá, equivocarse también es aprender.</p>
        <div className="grid gap-5 md:grid-cols-2">
          {activities.map((activity) => (
            <GameCard key={activity.key} activity={activity} />
          ))}
        </div>
      </section>
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
            Todavía no hay materias disponibles. Mientras tanto, podés probar los
            juegos para practicar.
          </p>
        ) : (
          <div
            data-tour-id="subject-card"
            className="grid gap-5 md:grid-cols-2 xl:grid-cols-3"
          >
            {data.subjects.map((s, i) => (
              <article
                key={s.id}
                className="discovery-subject flex flex-col overflow-hidden rounded-3xl border border-border bg-card"
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
