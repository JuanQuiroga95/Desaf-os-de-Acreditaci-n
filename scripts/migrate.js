const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log("Iniciando migración de datos...");
  const subjects = await prisma.subject.findMany();

  for (const subject of subjects) {
    console.log(`Procesando materia: ${subject.name}`);
    
    // Buscar o crear Unidad 1
    let unidad1 = await prisma.unit.findFirst({
      where: { subjectId: subject.id, name: { startsWith: 'Unidad 1' } }
    });
    
    if (!unidad1) {
      unidad1 = await prisma.unit.findFirst({
        where: { subjectId: subject.id }
      });
    }

    if (!unidad1) {
      console.log(`  Creando Unidad 1 para ${subject.name}`);
      unidad1 = await prisma.unit.create({
        data: {
          name: 'Unidad 1: Introducción',
          description: 'Contenidos generales',
          subjectId: subject.id,
          order: 0
        }
      });
    }

    // Mover Materiales huérfanos
    const updatedMaterials = await prisma.material.updateMany({
      where: { subjectId: subject.id, unitId: null },
      data: { unitId: unidad1.id }
    });
    if (updatedMaterials.count > 0) {
      console.log(`  Movidos ${updatedMaterials.count} materiales huérfanos a Unidad 1.`);
    }

    // Mover Desafíos huérfanos
    const updatedChallenges = await prisma.challenge.updateMany({
      where: { subjectId: subject.id, unitId: null },
      data: { unitId: unidad1.id }
    });
    if (updatedChallenges.count > 0) {
      console.log(`  Movidos ${updatedChallenges.count} desafíos huérfanos a Unidad 1.`);
    }

    // Mover Encuentros huérfanos
    const updatedEncounters = await prisma.encounter.updateMany({
      where: { subjectId: subject.id, unitId: null },
      data: { unitId: unidad1.id }
    });
    if (updatedEncounters.count > 0) {
      console.log(`  Movidos ${updatedEncounters.count} encuentros huérfanos a Unidad 1.`);
    }
  }

  // 2. Convertir Ejercicios y TPs en Desafíos vinculados
  const materialsToConvert = await prisma.material.findMany({
    where: {
      type: { in: ['EXERCISE', 'TP_TEMPLATE'] },
      challengeId: null
    }
  });

  console.log(`\nEncontrados ${materialsToConvert.length} Ejercicios/TPs que necesitan un Desafío vinculado.`);

  for (const mat of materialsToConvert) {
    console.log(`  Creando desafío para material: ${mat.title}`);
    const challenge = await prisma.challenge.create({
      data: {
        title: mat.title,
        objective: 'Resuelve el siguiente ejercicio/TP',
        type: mat.type === 'TP_TEMPLATE' ? 'REGULAR' : 'REGULAR',
        content: { theory: mat.content || "", questions: [] },
        subjectId: mat.subjectId,
        unitId: mat.unitId,
        images: mat.fileUrl ? [mat.fileUrl] : [] // If it has a file, attach it as image/file
      }
    });

    await prisma.material.update({
      where: { id: mat.id },
      data: { challengeId: challenge.id }
    });
  }

  console.log("\nMigración completada con éxito!");
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
