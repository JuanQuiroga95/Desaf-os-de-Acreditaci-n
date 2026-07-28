import { db } from "../src/lib/db";
import bcrypt from "bcryptjs";

async function main() {
  console.log("Reiniciando datos desde reseed.ts...");

  const teacherPass = await bcrypt.hash("docente123", 10);
  const studentPass = await bcrypt.hash("alumno123", 10);

  // 1. Usuarios
  const teacher = await db.user.upsert({
    where: { email: "juan@videla.edu.ar" },
    update: { role: "TEACHER" },
    create: {
      email: "juan@videla.edu.ar",
      name: "Juan Prof",
      password: teacherPass,
      role: "TEACHER",
    },
  });

  const student = await db.user.upsert({
    where: { email: "pedro@videla.edu.ar" },
    update: { role: "STUDENT" },
    create: {
      email: "pedro@videla.edu.ar",
      name: "Pedro Estudiante",
      password: studentPass,
      role: "STUDENT",
    },
  });

  // 2. Materias (Usamos upsert si es posible, pero el modelo no tiene campos únicos para esto)
  // Así que simplemente creamos si no existen o algo similar
  
  const existingMath = await db.subject.findFirst({ where: { name: "Matemática 1", teachers: { some: { id: teacher.id } } } });
  let mathId = existingMath?.id;
  if (!existingMath) {
    const math = await db.subject.create({
      data: {
        name: "Matemática 1",
        description: "Fundamentos de álgebra, geometría y estadística básica.",
        teachers: { connect: { id: teacher.id } },
      },
    });
    mathId = math.id;
  }

  const existingLang = await db.subject.findFirst({ where: { name: "Lengua 1", teachers: { some: { id: teacher.id } } } });
  let langId = existingLang?.id;
  if (!existingLang) {
    const lang = await db.subject.create({
      data: {
        name: "Lengua 1",
        description: "Comprensión lectora, gramática y producción de textos.",
        teachers: { connect: { id: teacher.id } },
      },
    });
    langId = lang.id;
  }

  // 3. Inscripciones
  if (mathId) {
    await db.enrollment.upsert({
      where: { studentId_subjectId: { studentId: student.id, subjectId: mathId } },
      update: {},
      create: { studentId: student.id, subjectId: mathId }
    });
  }

  if (langId) {
    await db.enrollment.upsert({
      where: { studentId_subjectId: { studentId: student.id, subjectId: langId } },
      update: {},
      create: { studentId: student.id, subjectId: langId }
    });
  }

  // 4. Desafíos (Solo si no existen)
  if (mathId) {
    const countMath = await db.challenge.count({ where: { subjectId: mathId } });
    if (countMath === 0) {
      await db.challenge.create({
        data: {
          title: "Diagnóstico: Operaciones Básicas",
          objective: "Evaluar el dominio de suma, resta y multiplicación.",
          subjectId: mathId,
          type: "DIAGNOSTICO",
          content: {
            theory: "Las operaciones básicas son el pilar de la matemática...",
            questions: [
              { id: "q1", question: "¿Cuánto es 12 x 8?", answer: "96", type: "TEXT" },
              { id: "q2", question: "Si tengo 100 y gasto 45, ¿cuánto me queda?", answer: "55", type: "TEXT" }
            ]
          }
        }
      });
    }
  }

  if (langId) {
    const countLang = await db.challenge.count({ where: { subjectId: langId } });
    if (countLang === 0) {
      await db.challenge.create({
        data: {
          title: "Comprensión de Textos I",
          objective: "Identificar ideas principales en un texto narrativo.",
          subjectId: langId,
          type: "REGULAR",
          content: {
            theory: "La idea principal es el mensaje central que el autor quiere transmitir...",
            questions: [
              { id: "q1", question: "¿Cuál es el propósito del autor en un cuento?", answer: "Entretener y dejar una enseñanza", type: "TEXT" },
              { id: "q2", question: "Define qué es un sustantivo propio.", answer: "Palabra que designa nombres de personas, lugares, etc.", type: "TEXT" }
            ]
          }
        }
      });
    }
  }

  console.log("¡Sembrado completado con éxito!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
