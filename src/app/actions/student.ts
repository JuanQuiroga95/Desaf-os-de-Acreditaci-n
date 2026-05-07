/* eslint-disable @typescript-eslint/no-explicit-any */
"use server";

import { db } from "@/lib/db";

export async function getStudentDashboard(userId: string) {
  try {
    // Si el alumno tiene inscripciones, mostrar solo esas materias
    const enrollments = await db.enrollment.findMany({ where: { studentId: userId } });
    const subjectFilter = enrollments.length > 0
      ? { id: { in: enrollments.map((e: { subjectId: string }) => e.subjectId) } }
      : {};

    const subjects = await db.subject.findMany({
      where: subjectFilter,
      include: {
        challenges: {
          include: {
            progress: {
              where: { userId }
            }
          }
        }
      }
    });

    const formattedSubjects = subjects.map(s => {
      const totalChallenges = s.challenges.length;
      const completedChallenges = s.challenges.filter(c => c.progress.length > 0 && c.progress[0].status === "COMPLETED").length;
      const progressPercent = totalChallenges > 0 ? Math.round((completedChallenges / totalChallenges) * 100) : 0;

      return {
        id: s.id,
        name: s.name,
        description: s.description,
        progress: progressPercent,
        status: progressPercent > 0 ? "active" : "locked" // Just an example logic
      };
    });

    // Calculate total global progress
    const totalPossible = subjects.reduce((acc, s) => acc + s.challenges.length, 0);
    const totalDone = subjects.reduce((acc, s) => acc + s.challenges.filter(c => c.progress.length > 0 && c.progress[0].status === "COMPLETED").length, 0);
    const globalProgress = totalPossible > 0 ? Math.round((totalDone / totalPossible) * 100) : 0;

    return { 
      success: true, 
      subjects: formattedSubjects,
      globalProgress
    };
  } catch (error) {
    console.error("Student dashboard error:", error);
    return { success: false, message: "Error al cargar dashboard" };
  }
}

export async function getSubjectChallenges(subjectId: string, userId: string) {
  try {
    const subject = await db.subject.findFirst({
      where: { id: subjectId },
      include: {
        teacher: true,
        materials: { orderBy: [{ type: "asc" }, { order: "asc" }, { createdAt: "asc" }] },
        challenges: {
          include: {
            progress: { where: { userId } },
            materials: { orderBy: [{ order: "asc" }, { createdAt: "asc" }] },
          }
        }
      }
    });

    if (!subject) return { success: false, message: "Materia no encontrada" };

    return { success: true, subject };
  } catch (error) {
    console.error("Error fetching subject challenges:", error);
    return { success: false, message: "Error de conexión" };
  }
}

export async function submitChallengeResponse(challengeId: string, userId: string, answers: Record<string, any> | null = null) {
  try {
    const progress = await db.progress.upsert({
      where: {
        userId_challengeId: { userId, challengeId }
      },
      update: {
        status: "COMPLETED",
        answers: answers
      },
      create: {
        userId,
        challengeId,
        status: "COMPLETED",
        answers: answers
      }
    });

    return { success: true, progress };
  } catch (error) {
    console.error("Error submitting challenge:", error);
    return { success: false, message: "Error al enviar respuesta" };
  }
}
