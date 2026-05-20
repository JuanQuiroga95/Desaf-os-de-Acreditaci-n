import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getVerifiedSession } from "@/lib/session";
import { z } from "zod";

const ExportSchema = z.object({
  subjectId: z.string().min(1, "El ID de la materia es requerido")
});

export async function POST(req: Request) {
  const session = await getVerifiedSession();
  if (!session || (session.role !== "teacher" && session.role !== "admin")) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { subjectId } = ExportSchema.parse(body);
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

    if (!subject) return NextResponse.json({ error: "Materia no encontrada" }, { status: 404 });

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

    // Generate CSV
    const headers = ["Apellido y Nombre", "Email", "Desafíos Completados", "Total Desafíos", "Promedio", "Nota Máxima", "Estado", "Última Actividad"];
    const csvRows = [
      `ACTA DE SEGUIMIENTO RAA - ${subject.name.toUpperCase()}`,
      `Docente: ${subject.teacher.name}`,
      `Fecha de emisión: ${new Date().toLocaleDateString("es-AR")}`,
      `Escuela N° 4-012 Ing. Ricardo Videla`,
      ``,
      headers.join(";"),
      ...rows.map(r => [r.nombre, r.email, r.desafiosCompletados, r.totalDesafios, r.promedioNotas, r.notaMaxima, r.estado, r.fechaUltimaActividad].join(";"))
    ].join("\n");

    return new NextResponse(csvRows, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="acta-${subject.name.replace(/\s+/g, "-")}-${new Date().toISOString().slice(0, 10)}.csv"`,
      }
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors[0].message }, { status: 400 });
    }
    console.error("Export error:", error);
    return NextResponse.json({ error: "Error al exportar" }, { status: 500 });
  }
}
