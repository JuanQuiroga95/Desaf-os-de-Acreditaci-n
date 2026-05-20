"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { requireAuth } from "@/lib/session";

export async function getSubjectEnrollments(subjectId: string) {
  try {
    const enrollments = await db.enrollment.findMany({
      where: { subjectId },
      include: { student: { select: { id: true, name: true, email: true } } },
      orderBy: { createdAt: "asc" },
    });
    return { success: true, enrollments };
  } catch {
    return { success: false, error: "Error al cargar inscripciones" };
  }
}

export async function enrollStudent(studentId: string, subjectId: string) {
  await requireAuth(["admin", "teacher"]);
  try {
    await db.enrollment.upsert({
      where: { studentId_subjectId: { studentId, subjectId } },
      update: {},
      create: { studentId, subjectId },
    });
    revalidatePath("/admin/subjects");
    return { success: true };
  } catch {
    return { success: false, error: "Error al inscribir alumno" };
  }
}

export async function unenrollStudent(studentId: string, subjectId: string) {
  await requireAuth(["admin", "teacher"]);
  try {
    await db.enrollment.delete({
      where: { studentId_subjectId: { studentId, subjectId } },
    });
    revalidatePath("/admin/subjects");
    return { success: true };
  } catch {
    return { success: false, error: "Error al desinscribir alumno" };
  }
}

export async function getStudentEnrollments(studentId: string) {
  try {
    const enrollments = await db.enrollment.findMany({
      where: { studentId },
      include: {
        subject: {
          include: {
            teacher: { select: { name: true } },
            challenges: {
              include: { progress: { where: { userId: studentId } } },
            },
          },
        },
      },
    });
    return { success: true, enrollments };
  } catch {
    return { success: false, error: "Error al cargar materias" };
  }
}
