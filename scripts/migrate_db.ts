import { db as prisma } from "../src/lib/db";

async function main() {
  console.log("Iniciando migración de datos...");
  const subjects = await prisma.subject.findMany();

  for (const subject of subjects) {
    console.log(`Procesando materia: ${subject.name}`);
    
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

    const updatedMaterials = await prisma.material.updateMany({
      where: { subjectId: subject.id, unitId: null },
      data: { unitId: unidad1.id }
    });

    const updatedChallenges = await prisma.challenge.updateMany({
      where: { subjectId: subject.id, unitId: null },
      data: { unitId: unidad1.id }
    });

    const updatedEncounters = await prisma.encounter.updateMany({
      where: { subjectId: subject.id, unitId: null },
      data: { unitId: unidad1.id }
    });
  }

  const materialsToConvert = await prisma.material.findMany({
    where: {
      type: { in: ['EXERCISE', 'TP_TEMPLATE'] },
      challengeId: null
    }
  });

  for (const mat of materialsToConvert) {
    const challenge = await prisma.challenge.create({
      data: {
        title: mat.title,
        objective: 'Resuelve el siguiente ejercicio/TP',
        type: mat.type === 'TP_TEMPLATE' ? 'REGULAR' : 'REGULAR',
        content: { theory: mat.content || "", questions: [] },
        subjectId: mat.subjectId,
        unitId: mat.unitId || undefined,
        images: mat.fileUrl ? [mat.fileUrl] : []
      }
    });

    await prisma.material.update({
      where: { id: mat.id },
      data: { challengeId: challenge.id }
    });
  }

  console.log("Migración completada");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
