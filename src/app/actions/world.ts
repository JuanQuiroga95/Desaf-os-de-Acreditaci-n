"use server";

import { db } from "@/lib/db";
import { requireAuth } from "@/lib/session";
import { activities } from "@/lib/activities";
import { levelFromXp, XP_PER_ACTIVITY_ITEM, XP_PER_CHALLENGE } from "@/lib/progress";
import { DEFAULT_SKIN_ID } from "@/lib/skins";

export type WorldMachine = {
  key: string;
  title: string;
  topic: string;
  area: string;
  total: number;
  solved: number;
  /** Juego publicado en una unidad: las respuestas se registran y suman. */
  href: string;
  practiceHref: string;
  published: boolean;
  unitLabel: string | null;
};

export type WorldData = {
  name: string;
  coins: number;
  challengesDone: number;
  /** Desafíos publicados por los docentes en las materias del alumno. */
  challengesAvailable: number;
  /** Skin del personaje (catálogo en src/lib/skins.ts). */
  skin: string;
  itemsSolved: number;
  xp: number;
  level: number;
  xpInLevel: number;
  xpPerLevel: number;
  machines: WorldMachine[];
  /** false si las tablas de juegos no están disponibles: el mundo sigue con los desafíos. */
  activitiesReady: boolean;
};

/** Estado del mundo para el alumno: experiencia, nivel, monedas y máquinas. */
export async function getWorldData(): Promise<
  { success: true; data: WorldData } | { success: false }
> {
  try {
    const session = await requireAuth(["student"]);
    const userId = session.id;
    // Mismo criterio que el resto del sistema: sin inscripciones, ve todas las materias.
    const enrollments = await db.enrollment.findMany({
      where: { studentId: userId },
      select: { subjectId: true },
    });
    const subjectIds = enrollments.map((e) => e.subjectId);
    const [user, challengesDone, challengesAvailable] = await Promise.all([
      db.user.findUnique({
        where: { id: userId },
        select: { name: true, coins: true, worldSkin: true },
      }),
      db.progress.count({ where: { userId, status: "COMPLETED" } }),
      db.challenge.count({
        where: subjectIds.length ? { subjectId: { in: subjectIds } } : {},
      }),
    ]);
    if (!user) return { success: false };

    let activitiesReady = true;
    const publishedByKey = new Map<string, { id: string; label: string }>();
    const solvedByKey = new Map<string, Set<string>>();
    try {
      const unitFilter = subjectIds.length ? { subjectId: { in: subjectIds } } : {};
      const [published, correct] = await Promise.all([
        db.unitActivity.findMany({
          where: { visible: true, unit: unitFilter },
          orderBy: { createdAt: "desc" },
          select: {
            id: true,
            activityKey: true,
            unit: { select: { name: true, subject: { select: { name: true } } } },
          },
        }),
        db.activityAttempt.findMany({
          where: { userId, correct: true },
          distinct: ["unitActivityId", "itemId"],
          select: { itemId: true, unitActivity: { select: { activityKey: true } } },
        }),
      ]);
      for (const p of published) {
        if (!publishedByKey.has(p.activityKey))
          publishedByKey.set(p.activityKey, {
            id: p.id,
            label: `${p.unit.subject.name} · ${p.unit.name}`,
          });
      }
      for (const c of correct) {
        const key = c.unitActivity.activityKey;
        if (!solvedByKey.has(key)) solvedByKey.set(key, new Set());
        solvedByKey.get(key)!.add(c.itemId);
      }
      const completions = await db.gameCompletion.findMany({ where: { userId } });
      for (const c of completions) {
        if (!solvedByKey.has(c.activityKey)) solvedByKey.set(c.activityKey, new Set());
        solvedByKey.get(c.activityKey)!.add(c.itemId);
      }
    } catch (error) {
      console.error("World: activity tables unavailable:", error);
      activitiesReady = false;
    }

    const machines: WorldMachine[] = activities.map((activity) => {
      const pub = publishedByKey.get(activity.key);
      const validIds = new Set(activity.items.map((i) => i.id));
      const solved = [...(solvedByKey.get(activity.key) ?? [])].filter((id) =>
        validIds.has(id),
      ).length;
      return {
        key: activity.key,
        title: activity.title,
        topic: activity.topic,
        area: activity.area,
        total: activity.items.length,
        solved,
        href: `/mundo/jugar/${activity.key}`,
        practiceHref: `/mundo/jugar/${activity.key}?modo=practicar`,
        published: Boolean(pub),
        unitLabel: pub?.label ?? null,
      };
    });

    const itemsSolved = machines.reduce((acc, m) => acc + m.solved, 0);
    const progress = levelFromXp(
      challengesDone * XP_PER_CHALLENGE + itemsSolved * XP_PER_ACTIVITY_ITEM,
    );
    return {
      success: true,
      data: {
        name: user.name,
        coins: user.coins,
        challengesDone,
        challengesAvailable,
        skin: user.worldSkin ?? DEFAULT_SKIN_ID,
        itemsSolved,
        ...progress,
        machines,
        activitiesReady,
      },
    };
  } catch (error) {
    console.error("Error loading world:", error);
    return { success: false };
  }
}
