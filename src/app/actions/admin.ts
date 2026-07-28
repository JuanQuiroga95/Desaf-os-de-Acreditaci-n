"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";
import { requireAuth } from "@/lib/session";
import { logSubjectHistory } from "./history";

// --- GESTIÓN DE USUARIOS (ADMIN) ---

export async function createUser(name: string, email: string, pass: string, role: "ADMIN" | "TEACHER" | "STUDENT") {
  await requireAuth(["admin"]);
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
  await requireAuth(["admin"]);
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
  await requireAuth(["admin"]);
  try {
    await db.user.delete({ where: { id } });
    revalidatePath("/admin");
    return { success: true };
  } catch (error) {
    return { success: false, error: "Error al eliminar usuario" };
  }
}

export async function getDashboardStats() {
  try {
    const subjects = await db.subject.findMany({
      include: {
        challenges: {
          include: {
            progress: true
          }
        },
        enrollments: true
      }
    });

    const subjectStats = subjects.map(s => {
      const totalEnrolled = s.enrollments.length;
      const totalChallenges = s.challenges.length;
      const possibleSubmissions = totalEnrolled * totalChallenges;
      
      const completedSubmissions = s.challenges.reduce((acc, chall) => {
        return acc + chall.progress.filter(p => p.status === "COMPLETED").length;
      }, 0);

      const rate = possibleSubmissions > 0 
        ? Math.round((completedSubmissions / possibleSubmissions) * 100) 
        : 0;

      return {
        name: s.name,
        val: rate
      };
    });

    // Overall retention index (average of all subjects for now, or total completed vs total possible)
    const totalPossible = subjects.reduce((acc, s) => acc + (s.enrollments.length * s.challenges.length), 0);
    const totalCompleted = subjects.reduce((acc, s) => {
      return acc + s.challenges.reduce((sum, c) => sum + c.progress.filter(p => p.status === "COMPLETED").length, 0);
    }, 0);

    const retentionIndex = totalPossible > 0 ? Math.round((totalCompleted / totalPossible) * 100) : 0;

    return {
      success: true,
      subjectStats: subjectStats.slice(0, 5), // Top 5 subjects
      retentionIndex
    };
  } catch (error) {
    console.error("Dashboard stats error:", error);
    return { success: false, subjectStats: [], retentionIndex: 0 };
  }
}

// --- GESTIÓN DE MATERIAS & DESAFÍOS ---

export async function createSubject(name: string, description: string, teacherIds: string[]) {
  await requireAuth(["admin"]);
  try {
    const subject = await db.subject.create({
      data: { name, description, teachers: { connect: teacherIds.map(id => ({ id })) } }
    });
    revalidatePath("/admin");
    return { success: true, subject };
  } catch (error) {
    return { success: false, error: "Error al crear materia" };
  }
}

export async function updateSubject(id: string, data: { name?: string, description?: string, teacherIds?: string[] }) {
  await requireAuth(["admin"]);
  try {
    const updateData: any = { name: data.name, description: data.description };
    if (data.teacherIds) {
      updateData.teachers = { set: data.teacherIds.map(id => ({ id })) };
    }
    const subject = await db.subject.update({
      where: { id },
      data: updateData
    });
    revalidatePath("/admin");
    return { success: true, subject };
  } catch (error) {
    return { success: false, error: "Error al actualizar materia" };
  }
}

export async function deleteSubject(id: string) {
  await requireAuth(["admin"]);
  try {
    await db.subject.delete({ where: { id } });
    revalidatePath("/admin");
    return { success: true };
  } catch (error) {
    return { success: false, error: "Error al eliminar materia" };
  }
}

export async function createChallenge(subjectId: string, title: string, objective: string, content: any, type: any = "REGULAR", fileUrl?: string, unitId?: string, images?: string[]) {
  await requireAuth(["admin", "teacher"]);
  try {
    const challenge = await db.challenge.create({
      data: { subjectId, title, objective, content, type, fileUrl, unitId, images: images || [] }
    });
    
    // Log history if teacher
    if (challenge) {
      const session = await requireAuth();
      if (session.role === "teacher" || session.role === "admin") {
        await logSubjectHistory(
          subjectId,
          session.id,
          "CREATE_CHALLENGE",
          `Creó desafío: ${title}`
        );
      }
    }

    revalidatePath("/docente");
    revalidatePath(`/subjects/${subjectId}`);
    return { success: true, challenge };
  } catch (error) {
    return { success: false, error: "Error al crear desafío" };
  }
}

export async function updateChallenge(id: string, subjectId: string, data: { title?: string, objective?: string, content?: any, type?: any, fileUrl?: string, unitId?: string, images?: string[] }) {
  await requireAuth(["admin", "teacher"]);
  try {
    const challenge = await db.challenge.update({
      where: { id },
      data
    });
    
    if (challenge) {
      const session = await requireAuth();
      if (session.role === "teacher" || session.role === "admin") {
        await logSubjectHistory(
          subjectId,
          session.id,
          "UPDATE_CHALLENGE",
          `Actualizó desafío: ${challenge.title}`
        );
      }
    }

    revalidatePath("/docente");
    revalidatePath(`/subjects/${subjectId}`);
    revalidatePath(`/docente/materiales/${subjectId}`);
    return { success: true, challenge };
  } catch (error) {
    return { success: false, error: "Error al actualizar desafío" };
  }
}

export async function deleteChallenge(id: string, subjectId: string) {
  await requireAuth(["admin", "teacher"]);
  try {
    const challenge = await db.challenge.findUnique({ where: { id } });
    await db.challenge.delete({ where: { id } });
    
    if (challenge) {
      const session = await requireAuth();
      if (session.role === "teacher" || session.role === "admin") {
        await logSubjectHistory(
          subjectId,
          session.id,
          "DELETE_CHALLENGE",
          `Eliminó desafío: ${challenge.title}`
        );
      }
    }

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
      teachers: true,
      challenges: true,
      enrollments: true,
      _count: { select: { challenges: true } }
    }
  });
}

export async function adminResetUserPassword(userId: string, newPass: string) {
  await requireAuth(["admin"]);
  try {
    const hashedPassword = await bcrypt.hash(newPass, 10);
    await db.user.update({
      where: { id: userId },
      data: { password: hashedPassword }
    });
    return { success: true };
  } catch (error) {
    console.error("Error resetting user password:", error);
    return { success: false, error: "Error al cambiar la contraseña" };
  }
}

