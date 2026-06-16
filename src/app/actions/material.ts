"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { requireAuth } from "@/lib/session";

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
  await requireAuth(["teacher", "admin"]);
  try {
    const material = await db.material.create({ data });
    revalidatePath(`/docente/materiales/${data.subjectId}`);
    revalidatePath(`/subjects/${data.subjectId}`);
    return { success: true, material };
  } catch {
    return { success: false, error: "Error al crear material" };
  }
}

export async function updateMaterial(
  id: string,
  subjectId: string,
  data: { title?: string; content?: string; level?: string; fileUrl?: string; visible?: boolean; unitId?: string }
) {
  await requireAuth(["teacher", "admin"]);
  try {
    const material = await db.material.update({ where: { id }, data });
    revalidatePath(`/docente/materiales/${subjectId}`);
    revalidatePath(`/subjects/${subjectId}`);
    return { success: true, material };
  } catch {
    return { success: false, error: "Error al actualizar material" };
  }
}

export async function deleteMaterial(id: string, subjectId: string) {
  await requireAuth(["teacher", "admin"]);
  try {
    await db.material.delete({ where: { id } });
    revalidatePath(`/docente/materiales/${subjectId}`);
    revalidatePath(`/subjects/${subjectId}`);
    return { success: true };
  } catch {
    return { success: false, error: "Error al eliminar material" };
  }
}
