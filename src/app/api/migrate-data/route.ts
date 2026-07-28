import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  try {
    // 0. Ensure tables exist before trying to query them
    try {
      await db.$executeRawUnsafe(`
        CREATE TABLE IF NOT EXISTS "_TeacherSubjects" (
            "A" TEXT NOT NULL,
            "B" TEXT NOT NULL
        );
      `);
      await db.$executeRawUnsafe(`CREATE UNIQUE INDEX IF NOT EXISTS "_TeacherSubjects_AB_unique" ON "_TeacherSubjects"("A", "B");`);
      await db.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "_TeacherSubjects_B_index" ON "_TeacherSubjects"("B");`);
      
      // Foreign keys (might fail if they already exist, we wrap in a try-catch for each if needed, but IF NOT EXISTS is not standard for constraints in postgres. We will just ignore errors)
      try { await db.$executeRawUnsafe(`ALTER TABLE "_TeacherSubjects" ADD CONSTRAINT "_TeacherSubjects_A_fkey" FOREIGN KEY ("A") REFERENCES "Subject"("id") ON DELETE CASCADE ON UPDATE CASCADE;`); } catch(e){}
      try { await db.$executeRawUnsafe(`ALTER TABLE "_TeacherSubjects" ADD CONSTRAINT "_TeacherSubjects_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;`); } catch(e){}

      await db.$executeRawUnsafe(`
        CREATE TABLE IF NOT EXISTS "SubjectHistory" (
            "id" TEXT NOT NULL,
            "action" TEXT NOT NULL,
            "details" TEXT,
            "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
            "subjectId" TEXT NOT NULL,
            "teacherId" TEXT NOT NULL,
            CONSTRAINT "SubjectHistory_pkey" PRIMARY KEY ("id")
        );
      `);
      try { await db.$executeRawUnsafe(`ALTER TABLE "SubjectHistory" ADD CONSTRAINT "SubjectHistory_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "Subject"("id") ON DELETE CASCADE ON UPDATE CASCADE;`); } catch(e){}
      try { await db.$executeRawUnsafe(`ALTER TABLE "SubjectHistory" ADD CONSTRAINT "SubjectHistory_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;`); } catch(e){}
      
      console.log("Tables ensured.");
    } catch (dbError) {
      console.error("Error creating tables", dbError);
    }

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
