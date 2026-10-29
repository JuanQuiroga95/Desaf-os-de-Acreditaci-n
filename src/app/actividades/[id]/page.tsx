import { notFound } from "next/navigation";
import PercentageLab from "@/components/learning/PercentageLab";
import { getActivityForStudent } from "@/app/actions/activities";

export const metadata = { title: "Actividad de la unidad | Aula virtual" };

export default async function UnitActivityPage(props: PageProps<"/actividades/[id]">) {
  const { id } = await props.params;
  const data = await getActivityForStudent(id);
  // Solo existe una experiencia por ahora; nuevas actividades del catálogo necesitarán su componente.
  if (!data.success || data.activityKey !== "porcentajes-descuentos") notFound();

  return (
    <PercentageLab
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
