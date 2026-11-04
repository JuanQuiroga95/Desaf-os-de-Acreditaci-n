"use server";

import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { requireAuth } from "@/lib/session";

export type NewStudentRow = { name: string; email: string; password?: string };

export type NewStudentResult = {
  email: string;
  name: string;
  status: "created" | "enrolled" | "already" | "error";
  message?: string;
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MAX_ROWS = 200;

/**
 * El docente carga estudiantes en una de sus materias. Si el correo ya
 * existe como estudiante, solo se lo inscribe; si no, se crea la cuenta.
 */
export async function createStudentsForTeacher(
  subjectId: string,
  rows: NewStudentRow[],
  defaultPassword?: string,
): Promise<{ success: boolean; error?: string; results: NewStudentResult[] }> {
  let session;
  try {
    session = await requireAuth(["teacher", "admin"]);
  } catch {
    return { success: false, error: "Tu sesión venció. Volvé a iniciar sesión.", results: [] };
  }

  const subject = await db.subject.findFirst({
    where:
      session.role === "admin"
        ? { id: subjectId }
        : { id: subjectId, teachers: { some: { id: session.id } } },
    select: { id: true },
  });
  if (!subject) return { success: false, error: "No tenés asignada esa materia.", results: [] };
  if (!rows.length) return { success: false, error: "No hay estudiantes para cargar.", results: [] };
  if (rows.length > MAX_ROWS)
    return { success: false, error: `Podés cargar hasta ${MAX_ROWS} estudiantes por vez.`, results: [] };

  const results: NewStudentResult[] = [];
  const seen = new Set<string>();

  for (const raw of rows) {
    const name = raw.name.trim().replace(/\s+/g, " ");
    const email = raw.email.trim().toLowerCase();
    const password = (raw.password || defaultPassword || "").trim();
    const base = { name, email };

    if (!name || !EMAIL_RE.test(email)) {
      results.push({ ...base, status: "error", message: "Falta el nombre o el correo no es válido" });
      continue;
    }
    if (seen.has(email)) {
      results.push({ ...base, status: "error", message: "Correo repetido en la lista" });
      continue;
    }
    seen.add(email);

    try {
      const existing = await db.user.findUnique({ where: { email }, select: { id: true, role: true } });
      if (existing && existing.role !== "STUDENT") {
        results.push({ ...base, status: "error", message: "Ese correo pertenece a un docente o administrador" });
        continue;
      }

      let studentId = existing?.id;
      if (!studentId) {
        if (password.length < 6) {
          results.push({ ...base, status: "error", message: "La contraseña debe tener al menos 6 caracteres" });
          continue;
        }
        const created = await db.user.create({
          data: { name, email, password: await bcrypt.hash(password, 10), role: "STUDENT" },
          select: { id: true },
        });
        studentId = created.id;
      }

      const already = await db.enrollment.findUnique({
        where: { studentId_subjectId: { studentId, subjectId } },
        select: { id: true },
      });
      if (!already) await db.enrollment.create({ data: { studentId, subjectId } });

      results.push({ ...base, status: !existing ? "created" : already ? "already" : "enrolled" });
    } catch (error) {
      console.error("Error cargando estudiante:", error);
      results.push({ ...base, status: "error", message: "No se pudo guardar" });
    }
  }

  revalidatePath("/docente/students");
  revalidatePath("/docente");
  return { success: true, results };
}
