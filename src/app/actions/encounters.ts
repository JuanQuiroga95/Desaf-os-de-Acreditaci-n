"use server";
import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { requireAuth } from "@/lib/session";

export async function createEncounter(data: {
  date: string;
  notes?: string;
  status: string;
  type: string;
  subjectId: string;
  studentId: string;
  teacherId: string;
}) {
  await requireAuth(["teacher", "admin"]);
  try {
    const encounter = await db.encounter.create({
      data: {
        date: new Date(data.date),
        notes: data.notes,
        status: data.status,
        type: data.type,
        subjectId: data.subjectId,
        studentId: data.studentId,
        teacherId: data.teacherId,
      }
    });
    revalidatePath("/docente/encuentros");
    return { success: true, encounter };
  } catch (error) {
    console.error("Error creating encounter:", error);
    return { success: false, message: "Error al crear encuentro" };
  }
}

export async function updateEncounterStatus(id: string, status: string) {
  await requireAuth(["teacher", "admin"]);
  try {
    await db.encounter.update({ where: { id }, data: { status } });
    revalidatePath("/docente/encuentros");
    return { success: true };
  } catch (error) {
    return { success: false };
  }
}

export async function deleteEncounter(id: string) {
  await requireAuth(["teacher", "admin"]);
  try {
    await db.encounter.delete({ where: { id } });
    revalidatePath("/docente/encuentros");
    return { success: true };
  } catch (error) {
    return { success: false };
  }
}

export async function getEncountersBySubject(subjectId: string) {
  try {
    const encounters = await db.encounter.findMany({
      where: { subjectId },
      include: {
        student: { select: { id: true, name: true, email: true } },
        teacher: { select: { id: true, name: true } },
      },
      orderBy: { date: "desc" }
    });
    return { success: true, encounters };
  } catch (error) {
    return { success: false, encounters: [] };
  }
}

export async function getEncountersByStudent(studentId: string, subjectId?: string) {
  try {
    const encounters = await db.encounter.findMany({
      where: { studentId, ...(subjectId ? { subjectId } : {}) },
      include: {
        subject: { select: { id: true, name: true } },
        teacher: { select: { id: true, name: true } },
      },
      orderBy: { date: "desc" }
    });
    return { success: true, encounters };
  } catch (error) {
    return { success: false, encounters: [] };
  }
}

export async function createExamDate(data: {
  date: string;
  time?: string;
  room?: string;
  notes?: string;
  subjectId: string;
}) {
  await requireAuth(["teacher", "admin"]);
  try {
    const examDate = await db.examDate.create({
      data: {
        date: new Date(data.date),
        time: data.time,
        room: data.room,
        notes: data.notes,
        subjectId: data.subjectId,
      }
    });
    revalidatePath("/admin/subjects");
    revalidatePath("/calendario");
    return { success: true, examDate };
  } catch (error) {
    return { success: false, message: "Error al crear fecha" };
  }
}

export async function deleteExamDate(id: string) {
  await requireAuth(["teacher", "admin"]);
  try {
    await db.examDate.delete({ where: { id } });
    revalidatePath("/admin/subjects");
    revalidatePath("/calendario");
    return { success: true };
  } catch (error) {
    return { success: false };
  }
}

export async function getAllExamDates() {
  try {
    const examDates = await db.examDate.findMany({
      include: { subject: { include: { teacher: true } } },
      orderBy: { date: "asc" }
    });
    return { success: true, examDates };
  } catch (error) {
    return { success: false, examDates: [] };
  }
}

export async function getExamDatesBySubject(subjectId: string) {
  try {
    const examDates = await db.examDate.findMany({
      where: { subjectId },
      orderBy: { date: "asc" }
    });
    return { success: true, examDates };
  } catch (error) {
    return { success: false, examDates: [] };
  }
}
