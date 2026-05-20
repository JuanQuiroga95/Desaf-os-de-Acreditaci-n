"use server";

import { db } from "@/lib/db";
import { requireAuth } from "@/lib/session";
import { revalidatePath } from "next/cache";

export async function getUnreadNotifications() {
  const session = await requireAuth();
  try {
    const notifications = await db.notification.findMany({
      where: { userId: session.id, read: false },
      orderBy: { createdAt: "desc" },
      take: 10
    });
    return { success: true, notifications };
  } catch (error) {
    console.error("Error fetching notifications:", error);
    return { success: false, message: "Error al cargar notificaciones" };
  }
}

export async function markAsRead(notificationId: string) {
  const session = await requireAuth();
  try {
    await db.notification.updateMany({
      where: { id: notificationId, userId: session.id },
      data: { read: true }
    });
    return { success: true };
  } catch (error) {
    console.error("Error marking notification as read:", error);
    return { success: false };
  }
}

export async function markAllAsRead() {
  const session = await requireAuth();
  try {
    await db.notification.updateMany({
      where: { userId: session.id, read: false },
      data: { read: true }
    });
    return { success: true };
  } catch (error) {
    console.error("Error marking all as read:", error);
    return { success: false };
  }
}

// Internal server-only helper, no requireAuth since it's called by other actions
export async function createNotification(userId: string, title: string, message: string, type: string, link?: string) {
  try {
    await db.notification.create({
      data: {
        userId,
        title,
        message,
        type,
        link
      }
    });
  } catch (error) {
    console.error("Error creating notification:", error);
  }
}
