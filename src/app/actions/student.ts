/* eslint-disable @typescript-eslint/no-explicit-any */
"use server";

import { db } from "@/lib/db";
import Groq from "groq-sdk";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

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
        materials: { 
          where: { visible: true },
          orderBy: [{ type: "asc" }, { order: "asc" }, { createdAt: "asc" }] 
        },
        challenges: {
          orderBy: [
            { type: "asc" }, // This might not work as intended for custom enums in order by
            { createdAt: "asc" }
          ],
          include: {
            progress: { where: { userId } },
            materials: { orderBy: [{ order: "asc" }, { createdAt: "asc" }] },
          }
        }
      }
    });

    if (!subject) return { success: false, message: "Materia no encontrada" };

    // Sort challenges: DIAGNOSTICO -> REGULAR -> FINAL
    const typeOrder = { DIAGNOSTICO: 0, REGULAR: 1, FINAL: 2 };
    subject.challenges.sort((a: any, b: any) => {
      const orderA = typeOrder[a.type as keyof typeof typeOrder] ?? 99;
      const orderB = typeOrder[b.type as keyof typeof typeOrder] ?? 99;
      if (orderA !== orderB) return orderA - orderB;
      return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    });

    return { success: true, subject };
  } catch (error) {
    console.error("Error fetching subject challenges:", error);
    return { success: false, message: "Error de conexión" };
  }
}

export async function submitChallengeResponse(challengeId: string, userId: string, answers: Record<string, any> | null = null) {
  try {
    const challenge = await db.challenge.findUnique({ where: { id: challengeId } });
    
    let score: number | null = null;
    let feedback: string | null = null;

    if (challenge && challenge.type === "AUTOEVALUACION" && challenge.content && (challenge.content as any).questions && answers) {
      const questions = (challenge.content as any).questions;
      let correctCount = 0;
      
      questions.forEach((q: any) => {
        const studentAns = answers[q.id]?.toString().toLowerCase().trim() || "";
        const expectedAns = q.answer?.toString().toLowerCase().trim() || "";
        if (studentAns === expectedAns) {
          correctCount++;
        }
      });
      
      score = parseFloat(((correctCount / questions.length) * 10).toFixed(1));
      feedback = `Autocorrección completada: ${correctCount} correctas de ${questions.length}.`;
    } else if (challenge && challenge.type === "ROLEPLAY" && answers && answers.chatLog) {
      const objetivo = (challenge.content as any).roleplayObjetivo || "Interactuar con el personaje.";
      const chatLogStr = answers.chatLog.map((m: any) => `${m.role.toUpperCase()}: ${m.content}`).join("\n");
      
      const evaluationPrompt = `Eres un profesor evaluando un roleplay (entrevista a personaje).
      El alumno tenía el siguiente OBJETIVO: "${objetivo}".
      
      A continuación está el registro del chat (USER es el alumno, ASSISTANT es el personaje).
      
      CHAT LOG:
      ${chatLogStr}
      
      Evalúa si el alumno cumplió el objetivo basándote en sus preguntas y argumentos.
      Responde ÚNICAMENTE con un JSON en este formato exacto:
      {
        "score": (número del 1 al 10),
        "feedback": "Comentario constructivo de 2 líneas sobre cómo lo hizo."
      }`;

      try {
        const completion = await groq.chat.completions.create({
          messages: [{ role: "system", content: evaluationPrompt }],
          model: "llama-3.3-70b-versatile",
          temperature: 0.1,
          response_format: { type: "json_object" }
        });
        
        const evaluation = JSON.parse(completion.choices[0]?.message?.content || "{}");
        score = evaluation.score || 5;
        feedback = evaluation.feedback || "Evaluación automática completada.";
      } catch (err) {
        console.error("Error evaluating roleplay:", err);
        score = 5;
        feedback = "Error en la evaluación de la IA. Revisión pendiente por el docente.";
      }
    }

    const progress = await db.progress.upsert({
      where: {
        userId_challengeId: { userId, challengeId }
      },
      update: {
        status: "COMPLETED",
        answers: answers,
        attempts: { increment: 1 },
        ...(score !== null && { score }),
        ...(feedback !== null && { feedback })
      },
      create: {
        userId,
        challengeId,
        status: "COMPLETED",
        answers: answers,
        score,
        feedback
      },
      include: {
        user: true,
        challenge: {
          include: { subject: true }
        }
      }
    });

    // Notify teacher
    if (progress.challenge.subject.teacherId) {
      const { createNotification } = await import("./notifications");
      await createNotification(
        progress.challenge.subject.teacherId,
        "Nueva Entrega",
        `El alumno ${progress.user.name} entregó el desafío "${progress.challenge.title}" de ${progress.challenge.subject.name}.`,
        "SUBMISSION",
        "/docente/reviews"
      );
    }

    return { success: true, progress, score, feedback };
  } catch (error) {
    console.error("Error submitting challenge:", error);
    return { success: false, message: "Error al enviar respuesta" };
  }
}

export async function getUserAchievements(userId: string) {
  try {
    const [progressList, user] = await Promise.all([
      db.progress.findMany({
        where: { userId, status: "COMPLETED" },
        include: { challenge: { include: { subject: true } } },
        orderBy: { createdAt: "asc" }
      }),
      db.user.findUnique({ where: { id: userId }, include: { enrollments: true } })
    ]);

    const totalCompleted = progressList.length;
    const scores = progressList.filter(p => p.score !== null).map(p => p.score as number);
    const avgScore = scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 0;
    const perfectScores = scores.filter(s => s >= 9).length;
    const subjectsWithProgress = new Set(progressList.map(p => p.challenge.subjectId)).size;

    // Calcular racha de días
    const dates = progressList.map(p => new Date(p.createdAt).toDateString());
    const uniqueDates = [...new Set(dates)];
    let streak = 0;
    const today = new Date();
    for (let i = 0; i < 30; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      if (uniqueDates.includes(d.toDateString())) streak++;
      else break;
    }

    const achievements = [
      {
        id: "primer_paso",
        title: "Primer Paso",
        desc: "Completaste tu primer desafío.",
        icon: "Zap",
        color: "text-yellow-500",
        unlocked: totalCompleted >= 1,
        progress: Math.min(totalCompleted, 1),
        total: 1,
      },
      {
        id: "cinco_desafios",
        title: "En Carrera",
        desc: "Completaste 5 desafíos.",
        icon: "TrendingUp",
        color: "text-blue-500",
        unlocked: totalCompleted >= 5,
        progress: Math.min(totalCompleted, 5),
        total: 5,
      },
      {
        id: "diez_desafios",
        title: "Atleta del Saber",
        desc: "Completaste 10 desafíos.",
        icon: "Award",
        color: "text-green-500",
        unlocked: totalCompleted >= 10,
        progress: Math.min(totalCompleted, 10),
        total: 10,
      },
      {
        id: "nota_perfecta",
        title: "Excelencia Videla",
        desc: "Obtuviste una nota mayor a 9 en al menos un desafío.",
        icon: "Trophy",
        color: "text-purple-500",
        unlocked: perfectScores >= 1,
        progress: Math.min(perfectScores, 1),
        total: 1,
      },
      {
        id: "multi_materia",
        title: "Versátil",
        desc: "Avanzaste en 2 o más materias.",
        icon: "BookOpen",
        color: "text-orange-500",
        unlocked: subjectsWithProgress >= 2,
        progress: Math.min(subjectsWithProgress, 2),
        total: 2,
      },
      {
        id: "racha_3",
        title: "Constancia",
        desc: "Estudiaste 3 días seguidos.",
        icon: "Flame",
        color: "text-red-500",
        unlocked: streak >= 3,
        progress: Math.min(streak, 3),
        total: 3,
      },
      {
        id: "promedio_alto",
        title: "Alumno Destacado",
        desc: "Mantuviste un promedio mayor a 7 en tus calificaciones.",
        icon: "Star",
        color: "text-pink-500",
        unlocked: avgScore >= 7 && scores.length >= 3,
        progress: scores.length >= 3 ? Math.round(avgScore * 10) : 0,
        total: 70,
      },
    ];

    return { success: true, achievements, stats: { totalCompleted, avgScore: Math.round(avgScore * 10) / 10, streak, subjectsWithProgress } };
  } catch (error) {
    console.error("Error getting achievements:", error);
    return { success: false, achievements: [], stats: { totalCompleted: 0, avgScore: 0, streak: 0, subjectsWithProgress: 0 } };
  }
}

export async function getAllChallengesWithProgress(userId: string) {
  try {
    const subjects = await db.subject.findMany({
      include: {
        challenges: {
          include: {
            progress: { where: { userId } }
          }
        }
      }
    });
    return { success: true, subjects };
  } catch (error) {
    return { success: false, subjects: [] };
  }
}

export async function getMyExamDates(userId: string) {
  try {
    const enrollments = await db.enrollment.findMany({ where: { studentId: userId }, select: { subjectId: true } });
    const subjectIds = enrollments.map(e => e.subjectId);

    const examDates = await db.examDate.findMany({
      where: subjectIds.length > 0 ? { subjectId: { in: subjectIds } } : {},
      include: { subject: true },
      orderBy: { date: "asc" }
    });

    return { success: true, examDates };
  } catch (error) {
    return { success: false, examDates: [] };
  }
}
