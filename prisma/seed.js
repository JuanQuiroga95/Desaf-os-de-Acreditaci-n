const { PrismaClient } = require("@prisma/client");
const { PrismaPg } = require("@prisma/adapter-pg");
const { Pool } = require("pg");
const bcrypt = require("bcryptjs");

const pool = new Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("Cleaning up previous database seed data to prevent duplicates...");
  await prisma.progress.deleteMany({});
  await prisma.challenge.deleteMany({});
  await prisma.material.deleteMany({});
  await prisma.enrollment.deleteMany({});
  await prisma.subject.deleteMany({});
  await prisma.notification.deleteMany({});

  console.log("Seeding database with secure passwords...");

  // 1. Create Users
  const adminPass = await bcrypt.hash("admin123", 10);
  const teacherPass = await bcrypt.hash("docente123", 10);
  const studentPass = await bcrypt.hash("alumno123", 10);

  const admin = await prisma.user.upsert({
    where: { email: "admin@videla.edu.ar" },
    update: { role: "ADMIN", password: adminPass },
    create: {
      email: "admin@videla.edu.ar",
      name: "Director Ricardo",
      password: adminPass, 
      role: "ADMIN",
    },
  });

  const teacher = await prisma.user.upsert({
    where: { email: "juan@videla.edu.ar" },
    update: { role: "TEACHER", password: teacherPass },
    create: {
      email: "juan@videla.edu.ar",
      name: "Juan Prof",
      password: teacherPass,
      role: "TEACHER",
    },
  });

  const student = await prisma.user.upsert({
    where: { email: "pedro@videla.edu.ar" },
    update: { role: "STUDENT", password: studentPass },
    create: {
      email: "pedro@videla.edu.ar",
      name: "Pedro Estudiante",
      password: studentPass,
      role: "STUDENT",
    },
  });

  // 2. Create Subjects
  const math = await prisma.subject.upsert({
    where: { id: "cl_math_1" }, // We use a fixed ID for seeding consistency if possible, or just find by name
    update: {},
    create: {
      id: "cl_math_1",
      name: "Matemática 1",
      description: "Fundamentos de álgebra, geometría y estadística básica.",
      teacherId: teacher.id,
    },
  });

  const lang = await prisma.subject.upsert({
    where: { id: "cl_lang_1" },
    update: {},
    create: {
      id: "cl_lang_1",
      name: "Lengua 1",
      description: "Comprensión lectora, gramática y producción de textos.",
      teacherId: teacher.id,
    },
  });

  // 3. Enrollments
  await prisma.enrollment.upsert({
    where: { studentId_subjectId: { studentId: student.id, subjectId: math.id } },
    update: {},
    create: { studentId: student.id, subjectId: math.id }
  });

  await prisma.enrollment.upsert({
    where: { studentId_subjectId: { studentId: student.id, subjectId: lang.id } },
    update: {},
    create: { studentId: student.id, subjectId: lang.id }
  });

  // 4. Create Challenges
  const mathChallenge = await prisma.challenge.create({
    data: {
      title: "Diagnóstico: Operaciones Básicas",
      objective: "Evaluar el dominio de suma, resta y multiplicación.",
      subjectId: math.id,
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

  const langChallenge = await prisma.challenge.create({
    data: {
      title: "Comprensión de Textos I",
      objective: "Identificar ideas principales en un texto narrativo.",
      subjectId: lang.id,
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

  console.log("Seeding completed successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
