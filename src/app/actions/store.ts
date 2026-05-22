"use server";

import { db } from "@/lib/db";
import { requireAuth } from "@/lib/session";

export const PREDEFINED_AVATARS = [
  { id: "avatar-1", url: "https://api.dicebear.com/7.x/bottts/svg?seed=Felix", price: 50, name: "Robot Felix" },
  { id: "avatar-2", url: "https://api.dicebear.com/7.x/bottts/svg?seed=Aneka", price: 50, name: "Robot Aneka" },
  { id: "avatar-3", url: "https://api.dicebear.com/7.x/adventurer/svg?seed=Leo", price: 100, name: "Aventurero" },
  { id: "avatar-4", url: "https://api.dicebear.com/7.x/adventurer/svg?seed=Mia", price: 100, name: "Aventurera" },
  { id: "avatar-5", url: "https://api.dicebear.com/7.x/fun-emoji/svg?seed=Cool", price: 150, name: "Emoji Cool" },
  { id: "avatar-6", url: "https://api.dicebear.com/7.x/fun-emoji/svg?seed=Nerd", price: 150, name: "Emoji Nerd" },
];

export async function getUserCoins() {
  const session = await requireAuth(["student"]);
  try {
    const user = await db.user.findUnique({
      where: { id: session.userId },
      select: { coins: true, avatarId: true }
    });
    return { success: true, coins: user?.coins || 0, avatarId: user?.avatarId };
  } catch (error) {
    return { success: false, coins: 0 };
  }
}

export async function buyAvatar(avatarId: string) {
  const session = await requireAuth(["student"]);
  
  const avatar = PREDEFINED_AVATARS.find(a => a.id === avatarId);
  if (!avatar) return { success: false, message: "Avatar no encontrado" };

  try {
    const user = await db.user.findUnique({ where: { id: session.userId } });
    if (!user) return { success: false, message: "Usuario no encontrado" };

    // Si ya lo tiene equipado o no, en este caso vamos a simplificar y decir que al "comprar", se le descuenta y se equipa.
    // Si ya tiene el mismo, no cobra.
    if (user.avatarId === avatar.url) {
       return { success: true, message: "Ya tienes este avatar equipado" };
    }

    if (user.coins < avatar.price) {
      return { success: false, message: "Monedas insuficientes" };
    }

    await db.user.update({
      where: { id: session.userId },
      data: {
        coins: { decrement: avatar.price },
        avatarId: avatar.url
      }
    });

    return { success: true, message: "Avatar equipado con éxito" };
  } catch (error) {
    console.error("Error buying avatar:", error);
    return { success: false, message: "Error en la compra" };
  }
}
