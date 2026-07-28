import "dotenv/config";
import { db } from "../src/lib/db";

async function main() {
  console.log("🚀 Starting cleanup...");

  // 1. Delete all existing data
  await db.progress.deleteMany({});
  await db.challenge.deleteMany({});
  await db.subject.deleteMany({});
  
  console.log("✅ Cleanup complete. All Progress, Challenges, and Subjects deleted.");

  // 2. Find the default teacher (Prof. Juan Quiroga)
  const teacher = await db.user.findFirst({
    where: { email: "juan@videla.edu.ar" }
  });

  if (!teacher) {
    throw new Error("Default teacher 'juan@videla.edu.ar' not found!");
  }

  console.log(`👨‍🏫 Found teacher: ${teacher.name} (${teacher.id})`);

  // 3. Create the new "Matemática Aplicada" subject
  const subject = await db.subject.create({
    data: {
      name: "Matemática Aplicada",
      description: "Desafíos de lógica matemática, finanzas y cálculo aplicado al mundo real.",
      teachers: { connect: { id: teacher.id } }
    }
  });

  console.log(`📚 Created Subject: ${subject.name}`);

  // 4. Create the simulation challenge
  const challenge = await db.challenge.create({
    data: {
      subjectId: subject.id,
      title: "Simulación de Interés Real vs Inflación",
      objective: "Acreditar competencia en cálculo financiero aplicado, determinando la viabilidad de un crédito bancario en contextos inflacionarios.",
      content: {
        theory: "Escenario: La empresa 'TecnoVidela' necesita un crédito de $1.000.000 para comprar maquinaria. El banco ofrece una tasa nominal anual (TNA) del 65%. La inflación proyectada para el año es del 72%. \n\nPara acreditar este desafío, debes calcular si la tasa real es positiva o negativa y determinar el costo de oportunidad.",
        questions: [
          { 
            id: Date.now() + 1, 
            question: "¿Cuál es la Tasa Real aproximada (Tasa Nominal - Inflación)?", 
            answer: "-7%" 
          },
          { 
            id: Date.now() + 2, 
            question: "En este escenario, ¿quién se beneficia más del crédito: el banco o el deudor?", 
            answer: "El deudor" 
          },
          { 
            id: Date.now() + 3, 
            question: "¿Cómo se llama el fenómeno donde el valor real de la deuda disminuye por la inflación?", 
            answer: "Licuación de deuda" 
          }
        ]
      }
    }
  });

  console.log(`🔥 Created Challenge: ${challenge.title}`);
  console.log("✨ Simulation setup complete!");
}

main()
  .catch((e) => {
    console.error("❌ Error during setup:", e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
