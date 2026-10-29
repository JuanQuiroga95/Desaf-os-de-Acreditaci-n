import Link from "next/link";
import { ArrowRight, Gamepad2 } from "lucide-react";
import { getActivity } from "@/lib/activities";

interface UnitActivitiesProps {
  activities: { id: string; activityKey: string; attempts: { itemId: string }[] }[];
}

/** Actividades interactivas que el docente publicó en la unidad. */
export function UnitActivities({ activities }: UnitActivitiesProps) {
  const items = activities.flatMap((unitActivity) => {
    const activity = getActivity(unitActivity.activityKey);
    if (!activity) return [];
    const solved = new Set(unitActivity.attempts.map((a) => a.itemId)).size;
    return [{ ...unitActivity, activity, solved }];
  });
  if (items.length === 0) return null;

  return (
    <section aria-labelledby="unit-activities-title">
      <h3
        id="unit-activities-title"
        className="text-sm font-black uppercase tracking-widest mb-4"
      >
        Actividades para practicar
      </h3>
      <div className="grid gap-4">
        {items.map(({ id, activity, solved }) => {
          const total = activity.items.length;
          return (
            <Link
              key={id}
              href={`/actividades/${id}`}
              className="grid gap-4 rounded-[2rem] border border-primary/25 bg-primary/5 p-6 hover:bg-primary/10 sm:grid-cols-[auto_1fr_auto] sm:items-center"
            >
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-600 to-blue-600 text-white">
                <Gamepad2 size={28} />
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-primary">
                  {activity.area} · Sin nota
                </p>
                <p className="mt-1 text-xl font-black">{activity.title}</p>
                <p className="mt-1 text-sm text-muted-foreground">{activity.summary}</p>
                <p className="mt-2 text-xs font-semibold">
                  {solved === 0
                    ? `${total} retos para resolver`
                    : solved === total
                      ? `Resolviste los ${total} retos`
                      : `Resolviste ${solved} de ${total} retos`}
                </p>
              </div>
              <span className="flex items-center gap-2 font-bold text-primary">
                {solved === 0 ? "Empezar" : solved === total ? "Repasar" : "Continuar"}
                <ArrowRight size={18} />
              </span>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
