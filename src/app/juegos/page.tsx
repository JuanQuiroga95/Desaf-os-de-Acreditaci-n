import { Gamepad2 } from "lucide-react";
import { activities } from "@/lib/activities";
import { GameCard } from "@/components/learning/GameCard";

export const metadata = { title: "Juegos | Aula virtual" };

export default function GamesPage() {
  const areas = [...new Set(activities.map((a) => a.area))];
  return (
    <div className="mx-auto max-w-7xl space-y-8 p-5 pb-24 sm:p-8 sm:pb-24">
      <header>
        <p className="mb-2 flex items-center gap-2 text-sm text-muted-foreground">
          <Gamepad2 size={16} /> Práctica libre, sin nota
        </p>
        <h1 className="text-3xl font-black tracking-tight sm:text-4xl">Juegos</h1>
        <p className="mt-3 max-w-2xl leading-relaxed text-muted-foreground">
          Practicá a tu ritmo: probá, equivocate y volvé a intentar. Lo que
          hagas acá no se registra. Si tu docente publica un juego en una
          unidad, lo vas a encontrar en esa materia.
        </p>
      </header>
      {areas.map((area) => (
        <section key={area} aria-labelledby={`area-${area}`}>
          <h2 id={`area-${area}`} className="mb-5 text-2xl font-black">
            {area}
          </h2>
          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {activities
              .filter((a) => a.area === area)
              .map((activity) => (
                <GameCard key={activity.key} activity={activity} />
              ))}
          </div>
        </section>
      ))}
    </div>
  );
}
