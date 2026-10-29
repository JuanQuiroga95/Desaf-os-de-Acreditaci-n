"use server";

import { db } from "@/lib/db";
import { requireAuth } from "@/lib/session";
import { activities, evaluateAnswer, getActivity } from "@/lib/activities";
import { logSubjectHistory } from "./history";

// Mismo criterio que getStudentDashboard: sin inscripciones, el alumno ve todas las materias.
async function canStudentAccessSubject(studentId: string, subjectId: string) {
  const enrollments = await db.enrollment.findMany({
    where: { studentId },
    select: { subjectId: true },
  });
  return (
    enrollments.length === 0 ||
    enrollments.some((e) => e.subjectId === subjectId)
  );
}

async function requireUnitTeacher(unitId: string) {
  const session = await requireAuth(["teacher", "admin"]);
  const unit = await db.unit.findUnique({
    where: { id: unitId },
    select: {
      id: true,
      name: true,
      subjectId: true,
      subject: { select: { teachers: { select: { id: true } } } },
    },
  });
  if (!unit) throw new Error("NOT_FOUND");
  if (
    session.role === "teacher" &&
    !unit.subject.teachers.some((t) => t.id === session.id)
  )
    throw new Error("FORBIDDEN");
  return { session, unit };
}

async function getStudentUnitActivity(unitActivityId: string) {
  const session = await requireAuth(["student"]);
  const unitActivity = await db.unitActivity.findUnique({
    where: { id: unitActivityId },
    include: {
      unit: { select: { name: true, subject: { select: { id: true, name: true } } } },
    },
  });
  const activity = unitActivity && getActivity(unitActivity.activityKey);
  if (
    !unitActivity ||
    !unitActivity.visible ||
    !activity ||
    !(await canStudentAccessSubject(session.id, unitActivity.unit.subject.id))
  )
    return null;
  return { session, unitActivity, activity };
}

/** Catálogo de actividades con su estado en la unidad y lo registrado por los alumnos. */
export async function getUnitActivitiesForTeacher(unitId: string) {
  try {
    await requireUnitTeacher(unitId);
    const assigned = await db.unitActivity.findMany({
      where: { unitId },
      include: {
        attempts: {
          orderBy: { createdAt: "asc" },
          include: { user: { select: { id: true, name: true } } },
        },
      },
    });

    return {
      success: true,
      activities: activities.map((activity) => {
        const unitActivity = assigned.find((a) => a.activityKey === activity.key);
        const attempts = unitActivity?.attempts ?? [];
        const items = activity.items.map((item) => {
          const own = attempts.filter((a) => a.itemId === item.id);
          const wrong = own.filter((a) => !a.correct);
          return {
            id: item.id,
            title: item.title,
            wrong: wrong.length,
            savingsMistakes: wrong.filter(
              (a) => evaluateAnswer(item, Number(a.answer)).misconception === "savings",
            ).length,
            solvedBy: new Set(own.filter((a) => a.correct).map((a) => a.userId)).size,
          };
        });
        const students = [...new Map(attempts.map((a) => [a.userId, a.user])).values()]
          .map((student) => {
            const own = attempts.filter((a) => a.userId === student.id);
            return {
              id: student.id,
              name: student.name,
              attempts: own.length,
              solved: new Set(own.filter((a) => a.correct).map((a) => a.itemId)).size,
              struggles: activity.items
                .map((item) => ({
                  title: item.title,
                  wrong: own.filter((a) => a.itemId === item.id && !a.correct).length,
                }))
                .filter((s) => s.wrong > 0),
              lastAttempt: own[own.length - 1].createdAt,
            };
          })
          .sort((a, b) => a.name.localeCompare(b.name));

        return {
          key: activity.key,
          title: activity.title,
          area: activity.area,
          summary: activity.summary,
          itemCount: activity.items.length,
          unitActivityId: unitActivity?.id ?? null,
          visible: unitActivity?.visible ?? false,
          items,
          students,
        };
      }),
    };
  } catch (error) {
    console.error("Error loading unit activities:", error);
    return { success: false, message: "No se pudieron cargar las actividades" };
  }
}

/** Muestra u oculta una actividad en la unidad. Ocultarla conserva los intentos registrados. */
export async function setUnitActivityVisibility(
  unitId: string,
  activityKey: string,
  visible: boolean,
) {
  try {
    const activity = getActivity(activityKey);
    if (!activity || typeof visible !== "boolean")
      return { success: false, message: "Actividad inválida" };
    const { session, unit } = await requireUnitTeacher(unitId);

    await db.unitActivity.upsert({
      where: { unitId_activityKey: { unitId, activityKey } },
      update: { visible },
      create: { unitId, activityKey, visible },
    });
    await logSubjectHistory(
      unit.subjectId,
      session.id,
      visible ? "SHOW_ACTIVITY" : "HIDE_ACTIVITY",
      `${visible ? "Publicó" : "Ocultó"} la actividad "${activity.title}" en ${unit.name}`,
    );
    return { success: true };
  } catch (error) {
    console.error("Error updating unit activity:", error);
    return { success: false, message: "No se pudo actualizar la actividad" };
  }
}

/** Datos para que el alumno realice una actividad de una unidad. */
export async function getActivityForStudent(unitActivityId: string) {
  try {
    const found = await getStudentUnitActivity(unitActivityId);
    if (!found) return { success: false as const };
    const { session, unitActivity, activity } = found;
    const solved = await db.activityAttempt.findMany({
      where: { unitActivityId, userId: session.id, correct: true },
      distinct: ["itemId"],
      select: { itemId: true },
    });
    return {
      success: true as const,
      activityKey: activity.key,
      unitName: unitActivity.unit.name,
      subjectId: unitActivity.unit.subject.id,
      subjectName: unitActivity.unit.subject.name,
      solvedItemIds: solved.map((s) => s.itemId),
    };
  } catch (error) {
    console.error("Error loading activity:", error);
    return { success: false as const };
  }
}

/** Registra una respuesta. El servidor decide si es correcta; no hay nota ni monedas. */
export async function submitActivityAnswer(
  unitActivityId: string,
  itemId: string,
  value: number,
) {
  try {
    const found = await getStudentUnitActivity(unitActivityId);
    if (!found) return { success: false as const, message: "Actividad no disponible" };
    const item = found.activity.items.find((i) => i.id === itemId);
    if (!item || typeof value !== "number" || !item.options.includes(value))
      return { success: false as const, message: "Respuesta inválida" };

    const result = evaluateAnswer(item, value);
    await db.activityAttempt.create({
      data: {
        unitActivityId,
        userId: found.session.id,
        itemId,
        answer: String(value),
        correct: result.correct,
      },
    });
    return { success: true as const, result };
  } catch (error) {
    console.error("Error saving activity answer:", error);
    return { success: false as const, message: "No pudimos guardar tu respuesta" };
  }
}
