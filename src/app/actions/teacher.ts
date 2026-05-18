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

    const allProgress = subjects.flatMap(s => s.challenges.flatMap(c => c.progress));
    const gradedProgress = allProgress.filter(p => p.score !== null && p.score !== undefined);
    
    let promedioGeneral = "0.0";
    if (gradedProgress.length > 0) {
      const totalScore = gradedProgress.reduce((sum, p) => sum + p.score!, 0);
      promedioGeneral = (totalScore / gradedProgress.length).toFixed(1);
    }

    const enrollments = await db.enrollment.findMany({ 
      where: { subjectId: { in: subjects.map(s => s.id) } }, 
      select: { studentId: true } 
    });
    const uniqueEnrolledStudents = new Set(enrollments.map(e => e.studentId)).size;
    const activeStudents = new Set(allProgress.map(p => p.userId)).size;
    
    let participacion = 0;
    if (uniqueEnrolledStudents > 0) {
      participacion = Math.min(100, Math.round((activeStudents / uniqueEnrolledStudents) * 100));
    }

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
      })),
      pendingSubmissions,
      metrics: {
        promedioGeneral,
        participacion
      }
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

export async function getAtRiskStudents(teacherId: string) {
  try {
    const subjects = await db.subject.findMany({
      where: { teacherId },
      include: {
        enrollments: {
          include: {
            student: {
              include: {
                progress: {
                  include: { challenge: true },
                  orderBy: { updatedAt: "desc" }
                }
              }
            }
          }
        },
        challenges: true
      }
    });

    const atRiskList: any[] = [];
    const now = new Date();

    subjects.forEach(subject => {
      subject.enrollments.forEach(enrollment => {
        const student = enrollment.student;
        const subjectProgress = student.progress.filter(p =>
          subject.challenges.some(c => c.id === p.challengeId)
        );

        const totalChallenges = subject.challenges.length;
        const completedChallenges = subjectProgress.filter(p => p.status === "COMPLETED").length;
        const progressPercent = totalChallenges > 0 ? Math.round((completedChallenges / totalChallenges) * 100) : 0;

        const lastActivity = subjectProgress.length > 0
          ? new Date(subjectProgress[0].updatedAt)
          : null;

        const daysSinceActivity = lastActivity
          ? Math.floor((now.getTime() - lastActivity.getTime()) / (1000 * 60 * 60 * 24))
          : 999;

        const scores = subjectProgress.filter(p => p.score !== null).map(p => p.score as number);
        const avgScore = scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : null;

        const risks: string[] = [];
        if (daysSinceActivity > 7) risks.push(`Sin actividad hace ${daysSinceActivity} días`);
        if (progressPercent === 0 && totalChallenges > 0) risks.push("No inició ningún desafío");
        if (avgScore !== null && avgScore < 5) risks.push(`Promedio bajo: ${avgScore.toFixed(1)}`);
        if (completedChallenges < totalChallenges * 0.3 && totalChallenges > 2) risks.push(`Solo completó ${progressPercent}% de los desafíos`);

        if (risks.length > 0) {
          atRiskList.push({
            studentId: student.id,
            studentName: student.name,
            studentEmail: student.email,
            subjectName: subject.name,
            subjectId: subject.id,
            progressPercent,
            completedChallenges,
            totalChallenges,
            daysSinceActivity,
            avgScore,
            risks,
            riskLevel: risks.length >= 3 ? "HIGH" : risks.length === 2 ? "MEDIUM" : "LOW"
          });
        }
      });
    });

    atRiskList.sort((a, b) => {
      const order = { HIGH: 0, MEDIUM: 1, LOW: 2 };
      return order[a.riskLevel as keyof typeof order] - order[b.riskLevel as keyof typeof order];
    });

    return { success: true, atRiskList };
  } catch (error) {
    console.error("Error getting at-risk students:", error);
    return { success: false, atRiskList: [] };
  }
}

export async function getSubjectGradesPreview(subjectId: string, teacherId: string) {
  try {
    const subject = await db.subject.findUnique({
      where: { id: subjectId },
      include: {
        teacher: true,
        enrollments: {
          include: {
            student: {
              include: {
                progress: {
                  where: { status: "COMPLETED" },
                  include: { challenge: true }
                }
              }
            }
          }
        },
        challenges: true
      }
    });

    if (!subject || subject.teacherId !== teacherId) {
      return { success: false, rows: [] };
    }

    const rows = subject.enrollments.map(enrollment => {
      const student = enrollment.student;
      const subjectProgress = student.progress.filter(p =>
        subject.challenges.some(c => c.id === p.challengeId)
      );

      const scores = subjectProgress.filter(p => p.score !== null).map(p => p.score as number);
      const avgScore = scores.length > 0 ? (scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(1) : "-";
      const maxScore = scores.length > 0 ? Math.max(...scores).toFixed(1) : "-";
      const avg = parseFloat(avgScore);
      const status = !isNaN(avg) && avg >= 6 ? "ACREDITADO" : scores.length > 0 ? "EN PROCESO" : "SIN ACTIVIDAD";

      return {
        nombre: student.name,
        email: student.email,
        desafiosCompletados: subjectProgress.length,
        totalDesafios: subject.challenges.length,
        promedioNotas: avgScore,
        notaMaxima: maxScore,
        estado: status,
        fechaUltimaActividad: subjectProgress.length > 0
          ? new Date(Math.max(...subjectProgress.map(p => new Date(p.updatedAt).getTime()))).toLocaleDateString("es-AR")
          : "—"
      };
    });

    return { success: true, rows, subjectName: subject.name };
  } catch (error) {
    console.error("Error getting grades preview:", error);
    return { success: false, rows: [] };
  }
}

export async function getSubjectStudents(subjectId: string) {
  try {
    const enrollments = await db.enrollment.findMany({
      where: { subjectId },
      include: { student: { select: { id: true, name: true, email: true } } }
    });
    return { success: true, students: enrollments.map(e => e.student) };
  } catch (error) {
    console.error("Error getting subject students:", error);
    return { success: false, students: [] };
  }
}

export async function getTeacherSubjects(teacherId: string) {
  try {
    const subjects = await db.subject.findMany({
      where: { teacherId },
      select: { id: true, name: true }
    });
    return { success: true, subjects };
  } catch (error) {
    console.error("Error getting teacher subjects:", error);
    return { success: false, subjects: [] };
  }
}

export async function getStudentLegajo(studentId: string) {
  try {
    const student = await db.user.findUnique({
      where: { id: studentId },
      include: {
        enrollments: {
          include: {
            subject: {
              include: {
                challenges: {
                  include: {
                    progress: {
                      where: { userId: studentId }
                    }
                  }
                }
              }
            }
          }
        },
        progress: {
          include: {
            challenge: {
              include: {
                subject: true
              }
            }
          },
          orderBy: { createdAt: "desc" }
        }
      }
    });

    if (!student) return { success: false, message: "Alumno no encontrado" };

    return { success: true, student };
  } catch (error) {
    console.error("Error getting student legajo:", error);
    return { success: false, message: "Error al cargar legajo" };
  }
}
