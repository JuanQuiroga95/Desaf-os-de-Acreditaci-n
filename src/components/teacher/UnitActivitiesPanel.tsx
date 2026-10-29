"use client";

import { useEffect, useState } from "react";
import { Eye, EyeOff, Gamepad2, Loader2 } from "lucide-react";
import {
  getUnitActivitiesForTeacher,
  setUnitActivityVisibility,
} from "@/app/actions/activities";
import { useToast } from "@/context/ToastContext";

type Activities = NonNullable<
  Awaited<ReturnType<typeof getUnitActivitiesForTeacher>>["activities"]
>;

/** Publica actividades del catálogo en la unidad y muestra lo que registraron los alumnos. */
export function UnitActivitiesPanel({ unitId }: { unitId: string }) {
  const { showToast } = useToast();
  const [activities, setActivities] = useState<Activities | null>(null);
  const [error, setError] = useState(false);
  const [saving, setSaving] = useState<string | null>(null);
  const [reload, setReload] = useState(0);

  useEffect(() => {
    let cancelled = false;
    getUnitActivitiesForTeacher(unitId)
      .catch(() => null)
      .then((res) => {
        if (cancelled) return;
        if (res?.success && res.activities) setActivities(res.activities);
        else setError(true);
      });
    return () => {
      cancelled = true;
    };
  }, [unitId, reload]);

  const load = () => {
    setError(false);
    setReload((value) => value + 1);
  };

  const toggle = async (key: string, visible: boolean) => {
    setSaving(key);
    const res = await setUnitActivityVisibility(unitId, key, visible).catch(() => null);
    if (res?.success) {
      showToast(visible ? "Actividad publicada en la unidad" : "Actividad oculta para los alumnos", "success");
      load();
    } else showToast(res?.message || "No se pudo actualizar la actividad", "error");
    setSaving(null);
  };

  return (
    <section
      aria-labelledby="unit-activities-panel"
      className="mb-8 rounded-[2.5rem] border border-border bg-card p-6 sm:p-8"
    >
      <h2
        id="unit-activities-panel"
        className="flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.3em] text-primary"
      >
        <Gamepad2 size={16} /> Actividades interactivas
      </h2>
      <p className="mt-2 text-sm text-muted-foreground">
        Práctica sin nota. Cada respuesta se corrige en el servidor y queda registrada para ver dónde necesitan ayuda tus alumnos.
      </p>

      {error ? (
        <div role="alert" className="mt-6 rounded-2xl border border-border p-5">
          <p className="text-sm">No se pudieron cargar las actividades.</p>
          <button
            onClick={load}
            className="mt-3 rounded-xl bg-primary px-4 py-2 text-xs font-black uppercase tracking-widest text-white"
          >
            Reintentar
          </button>
        </div>
      ) : !activities ? (
        <p role="status" className="mt-6 text-sm text-muted-foreground">
          Cargando actividades…
        </p>
      ) : (
        <div className="mt-6 space-y-6">
          {activities.map((activity) => {
            const status = activity.visible
              ? "Publicada"
              : activity.unitActivityId
                ? "Oculta"
                : "Sin publicar";
            return (
              <article key={activity.key} className="rounded-[2rem] border border-border bg-secondary/10 p-6">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                      {activity.area} · {activity.itemCount} retos · {status}
                    </p>
                    <h3 className="mt-1 text-xl font-black">{activity.title}</h3>
                    <p className="mt-1 text-sm text-muted-foreground">{activity.summary}</p>
                  </div>
                  <button
                    onClick={() => toggle(activity.key, !activity.visible)}
                    disabled={saving === activity.key}
                    className={`flex items-center gap-2 rounded-2xl px-4 py-3 text-[10px] font-black uppercase tracking-widest border transition-all disabled:opacity-60 ${
                      activity.visible
                        ? "bg-secondary/30 border-border hover:bg-secondary"
                        : "bg-primary text-white border-primary hover:bg-primary/90"
                    }`}
                  >
                    {saving === activity.key ? (
                      <Loader2 size={14} className="animate-spin" />
                    ) : activity.visible ? (
                      <EyeOff size={14} />
                    ) : (
                      <Eye size={14} />
                    )}
                    {activity.visible ? "Ocultar" : "Publicar en la unidad"}
                  </button>
                </div>

                {activity.unitActivityId &&
                  (activity.students.length === 0 ? (
                    <p className="mt-5 text-sm text-muted-foreground">
                      Todavía no hay respuestas registradas.
                    </p>
                  ) : (
                    <div className="mt-6 grid gap-6 lg:grid-cols-2">
                      <div>
                        <h4 className="mb-3 text-[10px] font-black uppercase tracking-widest">Por reto</h4>
                        <ul className="space-y-2">
                          {activity.items.map((item) => (
                            <li key={item.id} className="rounded-xl border border-border bg-card p-3 text-sm">
                              <p className="font-bold">{item.title}</p>
                              <p className="mt-1 text-muted-foreground">
                                Resuelto por {item.solvedBy} de {activity.students.length}{" "}
                                {activity.students.length === 1 ? "alumno que participó" : "alumnos que participaron"} ·{" "}
                                {item.wrong} {item.wrong === 1 ? "respuesta incorrecta" : "respuestas incorrectas"}
                              </p>
                              {item.mistakes.length > 0 && (
                                <p className="mt-1 text-xs font-semibold text-amber-500">
                                  Errores frecuentes:{" "}
                                  {item.mistakes.map((m) => `${m.label} (${m.count})`).join(", ")}
                                </p>
                              )}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <h4 className="mb-3 text-[10px] font-black uppercase tracking-widest">Por alumno</h4>
                        <div className="overflow-x-auto rounded-xl border border-border">
                          <table className="w-full text-left text-sm">
                            <thead className="bg-secondary/30 text-[10px] uppercase tracking-widest">
                              <tr>
                                <th scope="col" className="p-3">Alumno</th>
                                <th scope="col" className="p-3">Resueltos</th>
                                <th scope="col" className="p-3">Intentos</th>
                                <th scope="col" className="p-3">Le costó</th>
                              </tr>
                            </thead>
                            <tbody>
                              {activity.students.map((student) => (
                                <tr key={student.id} className="border-t border-border align-top">
                                  <th scope="row" className="p-3 font-bold">{student.name}</th>
                                  <td className="p-3">{student.solved}/{activity.itemCount}</td>
                                  <td className="p-3">{student.attempts}</td>
                                  <td className="p-3 text-muted-foreground">
                                    {student.struggles.length === 0
                                      ? "—"
                                      : student.struggles
                                          .map((s) => `${s.title} (${s.wrong} ${s.wrong === 1 ? "error" : "errores"})`)
                                          .join(", ")}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>
                  ))}
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}
