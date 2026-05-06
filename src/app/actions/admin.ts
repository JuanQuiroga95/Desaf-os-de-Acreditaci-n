"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";

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

export async function createChallenge(subjectId: string, title: string, objective: string, content: any) {
  try {
    const challenge = await db.challenge.create({
      data: { subjectId, title, objective, content }
    });
    revalidatePath("/docente");
    revalidatePath(`/subjects/${subjectId}`);
    return { success: true, challenge };
  } catch (error) {
    return { success: false, error: "Error al crear desafío" };
  }
}

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

// --- CONSULTAS GLOBALES ---

export async function getAllUsers() {
  return await db.user.findMany({
    orderBy: { createdAt: "desc" }
  });
}

export async function getAllSubjects() {
  return await db.subject.findMany({
    include: { teacher: true, _count: { select: { challenges: true } } }
  });
}
