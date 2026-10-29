import { notFound } from "next/navigation";
import PercentageLab from "@/components/learning/PercentageLab";
import DataDetectives from "@/components/learning/DataDetectives";
import { getActivityForStudent } from "@/app/actions/activities";
import { getActivity } from "@/lib/activities";

export const metadata = { title: "Actividad de la unidad | Aula virtual" };

const games = {
  percentages: PercentageLab,
  statistics: DataDetectives,
};

export default async function UnitActivityPage(props: PageProps<"/actividades/[id]">) {
  const { id } = await props.params;
  const data = await getActivityForStudent(id);
  const activity = data.success ? getActivity(data.activityKey) : undefined;
  if (!data.success || !activity) notFound();

  const Game = games[activity.kind];
  return (
    <Game
      unit={{
        unitActivityId: id,
        subjectId: data.subjectId,
        subjectName: data.subjectName,
        unitName: data.unitName,
        solvedCount: data.solvedItemIds.length,
      }}
    />
  );
}
