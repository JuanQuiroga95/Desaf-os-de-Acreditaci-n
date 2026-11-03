"use server";

import { db } from "@/lib/db";
import { requireAuth } from "@/lib/session";
import { evaluateAnswer, getActivity } from "@/lib/activities";
import { ACTIVITY_ITEM_COINS } from "@/lib/progress";
import { revalidatePath } from "next/cache";

export async function submitWorldAnswer(activityKey: string, itemId: string, value: string) {
  try {
    const session = await requireAuth(["student"]);
    const activity = getActivity(activityKey);
    const item = activity?.items.find((candidate) => candidate.id === itemId);
    if (!item || typeof value !== "string" || !item.options.includes(value))
      return { success: false as const, message: "Respuesta inválida" };
    const result = evaluateAnswer(item, value);
    const coinsEarned = result.correct ? await db.$transaction(async (tx) => {
      const claimed = await tx.gameCompletion.createMany({
        data: [{ userId: session.id, activityKey, itemId }], skipDuplicates: true,
      });
      if (!claimed.count) return 0;
      const previous = await tx.activityAttempt.findFirst({
        where: { userId: session.id, itemId, correct: true, unitActivity: { activityKey } },
        select: { id: true },
      });
      if (previous) return 0;
      await tx.user.update({ where: { id: session.id }, data: { coins: { increment: ACTIVITY_ITEM_COINS } } });
      return ACTIVITY_ITEM_COINS;
    }) : 0;
    revalidatePath("/mundo");
    return { success: true as const, result, coinsEarned };
  } catch {
    return { success: false as const, message: "No se pudo guardar el avance del Mundo" };
  }
}
