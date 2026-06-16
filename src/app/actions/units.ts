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
