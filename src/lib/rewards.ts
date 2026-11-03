import type { Prisma } from "@prisma/client";
import { getActivity } from "@/lib/activities";
import { GAME_COMPLETE_BONUS } from "@/lib/progress";

/** Marca en GameCompletion de que el premio del juego completo ya se pagó. */
export const GAME_BONUS_ITEM = "__juego-completo__";

/**
 * Si el alumno ya acertó todos los retos del juego, paga el premio una sola vez.
 * Se llama dentro de la misma transacción que guarda el acierto. También sirve
 * para quien completó el juego antes de que existiera el premio: lo recibe la
 * próxima vez que acierte un reto en Jugar.
 */
export async function claimGameBonus(
  tx: Prisma.TransactionClient,
  userId: string,
  activityKey: string,
): Promise<number> {
  const activity = getActivity(activityKey);
  if (!activity) return 0;
  const ids = activity.items.map((i) => i.id);
  const solved = await tx.gameCompletion.count({
    where: { userId, activityKey, itemId: { in: ids } },
  });
  if (solved < ids.length) return 0;
  const claimed = await tx.gameCompletion.createMany({
    data: [{ userId, activityKey, itemId: GAME_BONUS_ITEM }],
    skipDuplicates: true,
  });
  if (!claimed.count) return 0;
  await tx.user.update({
    where: { id: userId },
    data: { coins: { increment: GAME_COMPLETE_BONUS } },
  });
  return GAME_COMPLETE_BONUS;
}
