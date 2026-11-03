"use server";

import { db } from "@/lib/db";
import { requireAuth } from "@/lib/session";
import { evaluateAnswer, getActivity } from "@/lib/activities";
import { ACTIVITY_ITEM_COINS } from "@/lib/progress";
import { claimGameBonus } from "@/lib/rewards";
import { revalidatePath } from "next/cache";

export async function submitWorldAnswer(activityKey: string, itemId: string, value: string) {
  try {
    const session = await requireAuth(["student"]);
    const activity = getActivity(activityKey);
    const item = activity?.items.find((candidate) => candidate.id === itemId);
    if (!item || typeof value !== "string" || !item.options.includes(value))
      return { success: false as const, message: "Respuesta inválida" };
    const result = evaluateAnswer(item, value);
    const reward = result.correct
      ? await db.$transaction(async (tx) => {
          let coins = 0;
          const claimed = await tx.gameCompletion.createMany({
            data: [{ userId: session.id, activityKey, itemId }],
            skipDuplicates: true,
          });
          if (claimed.count) {
            const previous = await tx.activityAttempt.findFirst({
              where: { userId: session.id, itemId, correct: true, unitActivity: { activityKey } },
              select: { id: true },
            });
            if (!previous) {
              await tx.user.update({
                where: { id: session.id },
                data: { coins: { increment: ACTIVITY_ITEM_COINS } },
              });
              coins = ACTIVITY_ITEM_COINS;
            }
          }
          const bonus = await claimGameBonus(tx, session.id, activityKey);
          return { coins, bonus };
        })
      : { coins: 0, bonus: 0 };
    revalidatePath("/mundo");
    return { success: true as const, result, coinsEarned: reward.coins, bonusCoins: reward.bonus };
  } catch {
    return { success: false as const, message: "No se pudo guardar el avance del Mundo" };
  }
}
