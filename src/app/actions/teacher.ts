"use server";

import { db } from "@/lib/db";

export async function getTeacherDashboard(teacherId: string) {
  try {
    const subjects = await db.subject.findMany({
      where: { teacherId },
      include: {
        _count: {
          select: { challenges: true }
        },
        challenges: {
          include: {
            progress: {
              where: { status: "COMPLETED" },
              include: { user: true }
            }
          }
        }
      }
    });

    // Extract all pending submissions across subjects
    const pendingSubmissions = subjects.flatMap(s => 
      s.challenges.flatMap(c => 
        c.progress.filter(p => !p.score).map(p => ({
          id: p.id,
          studentName: p.user.name,
          challengeTitle: c.title,
          subjectName: s.name,
          createdAt: p.createdAt
        }))
      )
    );

    return { 
      success: true, 
      subjects: subjects.map(s => ({
        id: s.id,
        name: s.name,
        studentsCount: 25, // Mocking student count for now
        challengesCount: s._count.challenges
      })),
      pendingSubmissions
    };
  } catch (error) {
    console.error("Teacher dashboard error:", error);
    return { success: false, message: "Error al cargar datos" };
  }
}

export async function gradeSubmission(progressId: string, score: number, feedback: string) {
  try {
    await db.progress.update({
      where: { id: progressId },
      data: { score, feedback }
    });
    return { success: true };
  } catch (error) {
    console.error("Grading error:", error);
    return { success: false };
  }
}
