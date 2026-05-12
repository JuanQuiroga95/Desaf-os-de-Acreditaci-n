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
          challengeType: c.type,
          challengeContent: c.content,
          subjectName: s.name,
          answers: p.answers,
          createdAt: p.createdAt
        }))
      )
    );

    return { 
      success: true, 
      subjects: await Promise.all(subjects.map(async (s) => {
        // Count from progress
        const uniqueStudents = new Set();
        s.challenges.forEach(c => {
          c.progress.forEach(p => uniqueStudents.add(p.userId));
        });
        
        // Count from enrollments (this is the most accurate for assigned students)
        const enrollments = await db.enrollment.count({
          where: { subjectId: s.id }
        });
        
        return {
          id: s.id,
          name: s.name,
          studentsCount: Math.max(uniqueStudents.size, enrollments),
          challengesCount: s._count.challenges
        };
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

export async function getTeacherStudents(teacherId: string) {
  try {
    const subjects = await db.subject.findMany({
      where: { teacherId },
      include: {
        challenges: {
          include: {
            progress: {
              include: {
                user: true
              }
            }
          }
        }
      }
    });

    const studentsMap = new Map();

    // 1. Get students from enrollments (enrolled but maybe haven't started challenges)
    const subjectEnrollments = await db.subject.findMany({
      where: { teacherId },
      include: {
        enrollments: {
          include: { student: true }
        }
      }
    });

    subjectEnrollments.forEach(subject => {
      subject.enrollments.forEach(enrollment => {
        const student = enrollment.student;
        if (!studentsMap.has(student.id)) {
          studentsMap.set(student.id, {
            id: student.id,
            name: student.name,
            email: student.email,
            subjects: new Set([subject.name])
          });
        } else {
          studentsMap.get(student.id).subjects.add(subject.name);
        }
      });
    });

    // 2. Get students from progress (in case there are progress records without explicit enrollment, though rare)
    const subjectsWithProgress = await db.subject.findMany({
      where: { teacherId },
      include: {
        challenges: {
          include: {
            progress: {
              include: {
                user: true
              }
            }
          }
        }
      }
    });

    subjectsWithProgress.forEach(subject => {
      subject.challenges.forEach(challenge => {
        challenge.progress.forEach(p => {
          if (!studentsMap.has(p.user.id)) {
            studentsMap.set(p.user.id, {
              id: p.user.id,
              name: p.user.name,
              email: p.user.email,
              subjects: new Set([subject.name])
            });
          } else {
            studentsMap.get(p.user.id).subjects.add(subject.name);
          }
        });
      });
    });

    return { 
      success: true, 
      students: Array.from(studentsMap.values()).map(s => ({
        ...s,
        subjects: Array.from(s.subjects)
      }))
    };
  } catch (error) {
    console.error("Error getting teacher students:", error);
    return { success: false, message: "Error al cargar alumnos" };
  }
}
export async function updateSubjectName(subjectId: string, newName: string) {
  try {
    await db.subject.update({
      where: { id: subjectId },
      data: { name: newName }
    });
    return { success: true };
  } catch (error) {
    console.error("Error renaming subject:", error);
    return { success: false };
  }
}
export async function resetChallengeSubmissions(challengeId: string) {
  try {
    await db.progress.deleteMany({
      where: { challengeId }
    });
    return { success: true };
  } catch (error) {
    console.error("Error resetting challenge:", error);
    return { success: false };
  }
}
