"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function createUnit(data: {
  name: string;
  description?: string;
  order: number;
  subjectId: string;
}) {
  try {
    const unit = await db.unit.create({
      data,
    });
    revalidatePath(`/docente/materiales/${data.subjectId}`);
    return { success: true, unit };
  } catch (error: any) {
    console.error("Error creating unit:", error);
    return { success: false, error: error.message };
  }
}

export async function getUnitsBySubject(subjectId: string) {
  try {
    const units = await db.unit.findMany({
      where: { subjectId },
      orderBy: { order: "asc" },
      include: {
        materials: true,
        challenges: true,
        encounters: {
          include: {
            student: {
              select: { name: true, id: true },
            },
          },
        },
      },
    });
    return { success: true, units };
  } catch (error: any) {
    console.error("Error fetching units:", error);
    return { success: false, error: error.message };
  }
}

export async function updateUnit(
  id: string,
  subjectId: string,
  data: {
    name?: string;
    description?: string;
    order?: number;
  }
) {
  try {
    const unit = await db.unit.update({
      where: { id },
      data,
    });
    revalidatePath(`/docente/materiales/${subjectId}`);
    return { success: true, unit };
  } catch (error: any) {
    console.error("Error updating unit:", error);
    return { success: false, error: error.message };
  }
}

export async function deleteUnit(id: string, subjectId: string) {
  try {
    await db.unit.delete({
      where: { id },
    });
    revalidatePath(`/docente/materiales/${subjectId}`);
    return { success: true };
  } catch (error: any) {
    console.error("Error deleting unit:", error);
    return { success: false, error: error.message };
  }
}

export async function getUnitById(unitId: string) {
  try {
    const unit = await db.unit.findUnique({
      where: { id: unitId },
      include: { subject: true }
    });
    return { success: true, unit };
  } catch {
    return { success: false, error: "Error al cargar la unidad" };
  }
}

export async function getMaterialsByUnit(unitId: string) {
  try {
    const materials = await db.material.findMany({
      where: { unitId },
      orderBy: [{ type: "asc" }, { order: "asc" }, { createdAt: "asc" }],
    });
    return { success: true, materials };
  } catch {
    return { success: false, error: "Error al cargar materiales" };
  }
}

export async function getChallengesByUnit(unitId: string) {
  try {
    const challenges = await db.challenge.findMany({
      where: { unitId },
      orderBy: { createdAt: "desc" }
    });
    return { success: true, challenges };
  } catch {
    return { success: false, error: "Error al cargar desafíos" };
  }
}

export async function getEncountersByUnit(unitId: string) {
  try {
    const encounters = await db.encounter.findMany({
      where: { unitId },
      include: {
        student: { select: { id: true, name: true, email: true } },
        teacher: { select: { id: true, name: true } },
      },
      orderBy: { date: "desc" }
    });
    return { success: true, encounters };
  } catch {
    return { success: false, encounters: [] };
  }
}

