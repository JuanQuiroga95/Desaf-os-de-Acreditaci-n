"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";

// --- GESTIÓN DE USUARIOS (ADMIN) ---

export async function createUser(name: string, email: string, pass: string, role: "ADMIN" | "TEACHER" | "STUDENT") {
  try {
    const hashedPassword = await bcrypt.hash(pass, 10);
    const user = await db.user.create({
      data: { name, email, password: hashedPassword, role }
    });
    revalidatePath("/admin");
    return { success: true, user };
  } catch (error) {
    return { success: false, error: "Error al crear usuario" };
  }
}

export async function updateUser(id: string, data: { name?: string, email?: string, role?: "ADMIN" | "TEACHER" | "STUDENT" }) {
  try {
    const user = await db.user.update({
      where: { id },
      data
    });
    revalidatePath("/admin");
    return { success: true, user };
  } catch (error) {
    return { success: false, error: "Error al actualizar usuario" };
  }
}

export async function deleteUser(id: string) {
  try {
    await db.user.delete({ where: { id } });
    revalidatePath("/admin");
    return { success: true };
  } catch (error) {
    return { success: false, error: "Error al eliminar usuario" };
  }
}

// --- GESTIÓN DE MATERIAS & DESAFÍOS ---

export async function createSubject(name: string, description: string, teacherId: string) {
  try {
    const subject = await db.subject.create({
      data: { name, description, teacherId }
    });
    revalidatePath("/admin");
    return { success: true, subject };
  } catch (error) {
    return { success: false, error: "Error al crear materia" };
  }
}

export async function updateSubject(id: string, data: { name?: string, description?: string, teacherId?: string }) {
  try {
    const subject = await db.subject.update({
      where: { id },
      data
    });
    revalidatePath("/admin");
    return { success: true, subject };
  } catch (error) {
    return { success: false, error: "Error al actualizar materia" };
  }
}

export async function deleteSubject(id: string) {
  try {
    await db.subject.delete({ where: { id } });
    revalidatePath("/admin");
    return { success: true };
  } catch (error) {
    return { success: false, error: "Error al eliminar materia" };
  }
}

export async function createChallenge(subjectId: string, title: string, objective: string, content: any, type: "REGULAR" | "DIAGNOSTICO" | "FINAL" = "REGULAR", fileUrl?: string) {
  try {
    const challenge = await db.challenge.create({
      data: { subjectId, title, objective, content, type, fileUrl }
    });
    revalidatePath("/docente");
    revalidatePath(`/subjects/${subjectId}`);
    return { success: true, challenge };
  } catch (error) {
    return { success: false, error: "Error al crear desafío" };
  }
}

export async function updateChallenge(id: string, subjectId: string, data: { title?: string, objective?: string, content?: any, type?: any, fileUrl?: string }) {
  try {
    const challenge = await db.challenge.update({
      where: { id },
      data
    });
    revalidatePath("/docente");
    revalidatePath(`/subjects/${subjectId}`);
    revalidatePath(`/docente/materiales/${subjectId}`);
    return { success: true, challenge };
  } catch (error) {
    return { success: false, error: "Error al actualizar desafío" };
  }
}

export async function deleteChallenge(id: string, subjectId: string) {
  try {
    await db.challenge.delete({ where: { id } });
    revalidatePath("/docente");
    revalidatePath(`/subjects/${subjectId}`);
    revalidatePath(`/docente/materiales/${subjectId}`);
    return { success: true };
  } catch (error) {
    return { success: false, error: "Error al eliminar desafío" };
  }
}

export async function getChallengesBySubject(subjectId: string) {
  try {
    const challenges = await db.challenge.findMany({
      where: { subjectId },
      orderBy: { createdAt: "asc" }
    });
    return { success: true, challenges };
  } catch (error) {
    return { success: false, error: "Error al cargar desafíos" };
  }
}


// --- CONSULTAS GLOBALES ---

export async function getAllUsers() {
  return await db.user.findMany({
    orderBy: { createdAt: "desc" }
  });
}

export async function getAllSubjects() {
  return await db.subject.findMany({
    include: {
      teacher: true,
      challenges: true,
      enrollments: true,
      _count: { select: { challenges: true } }
    }
  });
}
