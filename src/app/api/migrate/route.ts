import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    console.log("Iniciando migración de datos...");
    const subjects = await db.subject.findMany();

    for (const subject of subjects) {
      console.log(`Procesando materia: ${subject.name}`);
      
      let unidad1 = await db.unit.findFirst({
        where: { subjectId: subject.id, name: { startsWith: 'Unidad 1' } }
      });
      
      if (!unidad1) {
        unidad1 = await db.unit.findFirst({
          where: { subjectId: subject.id }
        });
      }

      if (!unidad1) {
        console.log(`  Creando Unidad 1 para ${subject.name}`);
        unidad1 = await db.unit.create({
          data: {
            name: 'Unidad 1: Introducción',
            description: 'Contenidos generales',
            subjectId: subject.id,
            order: 0
          }
        });
      }

      const updatedMaterials = await db.material.updateMany({
        where: { subjectId: subject.id, unitId: null },
        data: { unitId: unidad1.id }
      });

      const updatedChallenges = await db.challenge.updateMany({
        where: { subjectId: subject.id, unitId: null },
        data: { unitId: unidad1.id }
      });

      const updatedEncounters = await db.encounter.updateMany({
        where: { subjectId: subject.id, unitId: null },
        data: { unitId: unidad1.id }
      });
    }

    const materialsToConvert = await db.material.findMany({
      where: {
        type: { in: ['EXERCISE', 'TP_TEMPLATE'] },
        challengeId: null
      }
    });

    for (const mat of materialsToConvert) {
      const challenge = await db.challenge.create({
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

      await db.material.update({
        where: { id: mat.id },
        data: { challengeId: challenge.id }
      });
    }

    return NextResponse.json({ success: true, message: "Migración completada" });
  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
