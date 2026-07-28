"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { requireAuth } from "@/lib/session";
import { logSubjectHistory } from "./history";

export async function getMaterialsBySubject(subjectId: string) {
  try {
    const materials = await db.material.findMany({
      where: { subjectId },
      orderBy: [{ type: "asc" }, { order: "asc" }, { createdAt: "asc" }],
    });
    return { success: true, materials };
  } catch {
    return { success: false, error: "Error al cargar materiales" };
  }
}

export async function createMaterial(data: {
  subjectId: string;
  type: "THEORY" | "VIDEO" | "EXERCISE" | "PROMPT" | "RUBRIC" | "TP_TEMPLATE";
  title: string;
  content: string;
  level?: string;
  fileUrl?: string;
  challengeId?: string;
  unitId?: string;
}) {
  const session = await requireAuth(["teacher", "admin"]);
  try {
    let challengeId = data.challengeId;

    if ((data.type === "EXERCISE" || data.type === "TP_TEMPLATE") && !challengeId) {
      const challenge = await db.challenge.create({
        data: {
          title: data.title,
          objective: 'Resuelve el siguiente ejercicio/TP',
          type: 'REGULAR',
          content: { theory: data.content || "", questions: [] },
          subjectId: data.subjectId,
          unitId: data.unitId || undefined,
          images: data.fileUrl ? [data.fileUrl] : []
        }
      });
      challengeId = challenge.id;
    }

    const material = await db.material.create({ 
      data: {
        ...data,
        challengeId
      }
    });
    await logSubjectHistory(
      data.subjectId,
      session.id,
      "CREATE_MATERIAL",
      `Creó material: ${data.title}`
    );

    revalidatePath(`/docente/materiales/${data.subjectId}`);
    revalidatePath(`/subjects/${data.subjectId}`);
    return { success: true, material };
  } catch (error) {
    console.error(error);
    return { success: false, error: "Error al crear material" };
  }
}

export async function updateMaterial(
  id: string,
  subjectId: string,
  data: { title?: string; content?: string; level?: string; fileUrl?: string; visible?: boolean; unitId?: string }
) {
  const session = await requireAuth(["teacher", "admin"]);
  try {
    const material = await db.material.update({ where: { id }, data });
    
    if (material.challengeId && (data.title !== undefined || data.content !== undefined || data.fileUrl !== undefined)) {
      await db.challenge.update({
        where: { id: material.challengeId },
        data: {
          title: data.title !== undefined ? data.title : material.title,
          content: data.content !== undefined ? { theory: data.content || "", questions: [] } : undefined,
          images: data.fileUrl !== undefined ? (data.fileUrl ? [data.fileUrl] : []) : undefined,
        }
      });
    }

    await logSubjectHistory(
      subjectId,
      session.id,
      "UPDATE_MATERIAL",
      `Actualizó material: ${material.title}`
    );

    revalidatePath(`/docente/materiales/${subjectId}`);
    revalidatePath(`/subjects/${subjectId}`);
    return { success: true, material };
  } catch (error) {
    console.error(error);
    return { success: false, error: "Error al actualizar material" };
  }
}

export async function deleteMaterial(id: string, subjectId: string) {
  const session = await requireAuth(["teacher", "admin"]);
  try {
    const material = await db.material.findUnique({ where: { id } });
    if (material?.challengeId) {
      await db.challenge.delete({ where: { id: material.challengeId } }).catch(() => {});
    }
    await db.material.delete({ where: { id } });
    await logSubjectHistory(
      subjectId,
      session.id,
      "DELETE_MATERIAL",
      `Eliminó material: ${material?.title}`
    );

    revalidatePath(`/docente/materiales/${subjectId}`);
    revalidatePath(`/subjects/${subjectId}`);
    return { success: true };
  } catch (error) {
    console.error(error);
    return { success: false, error: "Error al eliminar material" };
  }
}

export async function reorderMaterials(subjectId: string, orderedIds: string[]) {
  const session = await requireAuth(["teacher", "admin"]);
  try {
    // We update each material with its new index in the orderedIds array
    const updates = orderedIds.map((id, index) =>
      db.material.update({
        where: { id },
        data: { order: index },
      })
    );

    await db.$transaction(updates);

    await logSubjectHistory(
      subjectId,
      session.id,
      "REORDER_MATERIAL",
      `Reordenó materiales`
    );

    revalidatePath(`/docente/materiales/${subjectId}`);
    revalidatePath(`/subjects/${subjectId}`);
    return { success: true };
  } catch (error) {
    console.error(error);
    return { success: false, error: "Error al reordenar materiales" };
  }
}
