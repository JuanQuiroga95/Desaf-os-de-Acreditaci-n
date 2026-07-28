import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  try {
    // 1. Get all subjects that have a teacherId (from old schema) but not yet linked in _TeacherSubjects
    const subjects = await db.subject.findMany({
      where: {
        teacherId: { not: null },
      },
      include: {
        teachers: true,
      }
    });

    let migrated = 0;

    // 2. Loop through and connect the old teacher to the new many-to-many relationship
    for (const subject of subjects) {
      if (subject.teacherId && subject.teachers.length === 0) {
        // Connect the original teacher
        await db.subject.update({
          where: { id: subject.id },
          data: {
            teachers: {
              connect: { id: subject.teacherId }
            }
          }
        });
        migrated++;
      }
    }

    return NextResponse.json({
      success: true,
      message: `Migrated ${migrated} subjects to the new multi-teacher schema.`,
      totalFound: subjects.length
    });
  } catch (error: any) {
    console.error("Migration error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
