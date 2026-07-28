"use server";

import { db } from "@/lib/db";

/**
 * Registra una acción en el historial de una materia.
 */
export async function logSubjectHistory(
  subjectId: string,
  teacherId: string,
  action: string,
  details?: string
) {
  try {
    await db.subjectHistory.create({
      data: {
        subjectId,
        teacherId,
        action,
        details,
      },
    });
  } catch (error) {
    console.error("Error logging subject history:", error);
  }
}

/**
 * Obtiene el historial de una materia, ordenado por fecha de creación (más reciente primero).
 */
export async function getSubjectHistory(subjectId: string) {
  try {
    const history = await db.subjectHistory.findMany({
      where: { subjectId },
      include: {
        teacher: {
          select: { name: true, email: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });
    return { success: true, history };
  } catch (error) {
    console.error("Error fetching subject history:", error);
    return { success: false, history: [] };
  }
}
