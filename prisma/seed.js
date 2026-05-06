const { PrismaClient } = require("@prisma/client");
const { PrismaPg } = require("@prisma/adapter-pg");
const { Pool } = require("pg");

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("Seeding database...");

  // 1. Create Users
  const admin = await prisma.user.upsert({
    where: { email: "admin@videla.edu.ar" },
    update: {},
    create: {
      email: "admin@videla.edu.ar",
      name: "Admin General",
      password: "admin123", 
      role: "ADMIN",
    },
  });

  const teacher = await prisma.user.upsert({
    where: { email: "juan@videla.edu.ar" },
    update: {},
    create: {
      email: "juan@videla.edu.ar",
      name: "Prof. Juan Quiroga",
      password: "docente123",
      role: "TEACHER",
    },
  });

  const student = await prisma.user.upsert({
    where: { email: "pedro@videla.edu.ar" },
    update: {},
    create: {
      email: "pedro@videla.edu.ar",
      name: "Pedro Estudiante",
      password: "alumno123",
      role: "STUDENT",
    },
  });

  // 2. Create Subjects
  const math = await prisma.subject.create({
    data: {
      name: "Matemática Aplicada",
      description: "Análisis de proyecciones financieras y cálculo de interés real vs inflación.",
      teacherId: teacher.id,
    },
  });

  const lang = await prisma.subject.create({
    data: {
      name: "Lengua y Comunicación",
      description: "Desarrollo de redacción comercial y análisis crítico de discursos económicos.",
      teacherId: teacher.id,
    },
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
