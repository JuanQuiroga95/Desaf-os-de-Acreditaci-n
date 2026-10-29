import Link from "next/link";
import { ArrowRight, Percent, Search } from "lucide-react";
import type { Activity } from "@/lib/activities";

const look: Record<Activity["kind"], { icon: typeof Percent; gradient: string }> = {
  percentages: { icon: Percent, gradient: "from-violet-600 to-blue-600" },
  statistics: { icon: Search, gradient: "from-emerald-600 to-sky-600" },
};

/** Tarjeta de un juego del catálogo que abre su práctica libre. */
export function GameCard({ activity }: { activity: Activity }) {
  const { icon: Icon, gradient } = look[activity.kind];
  return (
    <Link
      href={activity.practiceHref}
      className="group flex flex-col overflow-hidden rounded-3xl border border-border bg-card hover:border-primary/60"
    >
      <div className={`relative flex h-32 items-center justify-center overflow-hidden bg-gradient-to-br ${gradient} text-white`}>
        <Icon
          aria-hidden="true"
          size={140}
          className="absolute -right-6 -top-4 opacity-15"
        />
        <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/15">
          <Icon size={34} />
        </span>
      </div>
      <div className="flex flex-1 flex-col p-6">
        <p className="text-xs font-bold uppercase tracking-widest text-primary">
          {activity.area} · {activity.topic}
        </p>
        <h3 className="mt-2 text-xl font-black">{activity.title}</h3>
        <p className="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground">
          {activity.summary}
        </p>
        <span className="mt-5 flex items-center gap-2 font-bold text-primary">
          Jugar
          <ArrowRight size={18} className="transition-transform group-hover:translate-x-1 motion-reduce:transition-none" />
        </span>
      </div>
    </Link>
  );
}
