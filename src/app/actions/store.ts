"use server";

import { db } from "@/lib/db";
import { requireAuth } from "@/lib/session";
import { PREDEFINED_AVATARS } from "@/lib/avatars";
import { DEFAULT_SKIN_ID, SKINS } from "@/lib/skins";
import { revalidatePath } from "next/cache";

export type StoreData = {
  coins: number;
  avatarId: string | null;
  skin: string;
  ownedSkins: string[];
};

/** Saldo, avatar y skins del alumno para la Tienda. */
export async function getStoreData(): Promise<
  { success: true; data: StoreData } | { success: false }
> {
  try {
    const session = await requireAuth(["student"]);
    const [user, owned] = await Promise.all([
      db.user.findUnique({
        where: { id: session.id },
        select: { coins: true, avatarId: true, worldSkin: true },
      }),
      db.ownedSkin.findMany({ where: { userId: session.id }, select: { skinId: true } }),
    ]);
    if (!user) return { success: false };
    return {
      success: true,
      data: {
        coins: user.coins,
        avatarId: user.avatarId,
        skin: user.worldSkin ?? DEFAULT_SKIN_ID,
        ownedSkins: [DEFAULT_SKIN_ID, ...owned.map((o) => o.skinId)],
      },
    };
  } catch (error) {
    console.error("Error loading store:", error);
    return { success: false };
  }
}

/** Descuenta monedas solo si alcanzan; si no, revierte la transacción. */
class NotEnoughCoins extends Error {}

export async function buyAvatar(avatarId: string) {
  try {
    const session = await requireAuth(["student"]);
    const avatar = PREDEFINED_AVATARS.find((a) => a.id === avatarId);
    if (!avatar) return { success: false, message: "Avatar no encontrado" };

    const user = await db.user.findUnique({
      where: { id: session.id },
      select: { avatarId: true },
    });
    if (!user) return { success: false, message: "Usuario no encontrado" };
    if (user.avatarId === avatar.url) return { success: true, message: "Ya tenés este avatar equipado" };

    const paid = await db.user.updateMany({
      where: { id: session.id, coins: { gte: avatar.price } },
      data: { coins: { decrement: avatar.price }, avatarId: avatar.url },
    });
    if (!paid.count) return { success: false, message: "Monedas insuficientes" };
    return { success: true, message: "Avatar equipado" };
  } catch (error) {
    console.error("Error buying avatar:", error);
    return { success: false, message: "Error en la compra" };
  }
}

/** Compra una skin (una sola vez) y la deja puesta en el Mundo. */
export async function buySkin(skinId: string) {
  try {
    const session = await requireAuth(["student"]);
    const skin = SKINS.find((s) => s.id === skinId);
    if (!skin) return { success: false, message: "Skin no encontrada" };
    if (skin.price === 0) return equipSkin(skinId);

    const result = await db.$transaction(async (tx) => {
      const added = await tx.ownedSkin.createMany({
        data: [{ userId: session.id, skinId }],
        skipDuplicates: true,
      });
      // Ya era suya: no se cobra de nuevo.
      if (added.count) {
        const paid = await tx.user.updateMany({
          where: { id: session.id, coins: { gte: skin.price } },
          data: { coins: { decrement: skin.price } },
        });
        if (!paid.count) throw new NotEnoughCoins();
      }
      await tx.user.update({ where: { id: session.id }, data: { worldSkin: skinId } });
      return added.count ? "bought" : "owned";
    });
    revalidatePath("/mundo");
    return {
      success: true,
      message: result === "bought" ? `¡Compraste ${skin.name}! Ya la tenés puesta en el Mundo.` : `${skin.name} puesta`,
    };
  } catch (error) {
    if (error instanceof NotEnoughCoins) return { success: false, message: "Monedas insuficientes" };
    console.error("Error buying skin:", error);
    return { success: false, message: "Error en la compra" };
  }
}

/** Cambia la skin del Mundo por otra que el alumno ya tenga. */
export async function equipSkin(skinId: string) {
  try {
    const session = await requireAuth(["student"]);
    const skin = SKINS.find((s) => s.id === skinId);
    if (!skin) return { success: false, message: "Skin no encontrada" };
    if (skin.price > 0) {
      const owned = await db.ownedSkin.findUnique({
        where: { userId_skinId: { userId: session.id, skinId } },
        select: { skinId: true },
      });
      if (!owned) return { success: false, message: "Primero tenés que comprar esta skin" };
    }
    await db.user.update({ where: { id: session.id }, data: { worldSkin: skinId } });
    revalidatePath("/mundo");
    return { success: true, message: `${skin.name} puesta` };
  } catch (error) {
    console.error("Error equipping skin:", error);
    return { success: false, message: "No se pudo cambiar la skin" };
  }
}
