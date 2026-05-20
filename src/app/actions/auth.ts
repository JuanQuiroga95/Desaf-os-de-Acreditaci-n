"use server";

import { db } from "@/lib/db";
import bcrypt from "bcryptjs";
import { createSession, destroySession, getSession } from "@/lib/session";

export async function loginAction(email: string, pass: string) {
  try {
    const user = await db.user.findUnique({ where: { email } });
    
    if (!user) {
      return { success: false, message: "Usuario no encontrado" };
    }

    const isMatch = await bcrypt.compare(pass, user.password);
    if (!isMatch) {
      return { success: false, message: "Credenciales inválidas" };
    }

    const sessionUser = { id: user.id, name: user.name, role: user.role.toLowerCase() as "student" | "teacher" | "admin", email: user.email };
    
    // Create secure HTTP-only cookie session
    await createSession(sessionUser);

    return { 
      success: true, 
      user: sessionUser
    };
  } catch (error) {
    console.error("Login Error:", error);
    return { success: false, message: "Error de servidor" };
  }
}

export async function logoutAction() {
  await destroySession();
  return { success: true };
}

export async function getSessionAction() {
  const session = await getSession();
  if (!session) return { success: false };
  return { success: true, user: session };
}

export async function validateUserAction(userId: string) {
  try {
    const user = await db.user.findUnique({ where: { id: userId }, select: { id: true, role: true } });
    if (!user) return { success: false };
    return { success: true, role: user.role.toLowerCase() };
  } catch {
    return { success: false };
  }
}

export async function updateUserAction(id: string, data: { name?: string, email?: string }) {
  const session = await getSession();
  if (!session || session.id !== id) return { success: false, message: "No autorizado" };

  try {
    const user = await db.user.update({
      where: { id },
      data
    });
    const updatedSession = { id: user.id, name: user.name, role: user.role.toLowerCase() as "student" | "teacher" | "admin", email: user.email };
    await createSession(updatedSession);
    return {
      success: true,
      user: updatedSession
    };
  } catch (error) {
    console.error("Error updating user:", error);
    return { success: false, message: "Error al actualizar perfil" };
  }
}

export async function updatePasswordAction(id: string, currentPassword: string, newPassword: string) {
  const session = await getSession();
  if (!session || session.id !== id) return { success: false, message: "No autorizado" };

  try {
    const user = await db.user.findUnique({ where: { id } });
    if (!user) return { success: false, message: "Usuario no encontrado" };

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) return { success: false, message: "La contraseña actual es incorrecta" };

    const hashed = await bcrypt.hash(newPassword, 10);
    await db.user.update({ where: { id }, data: { password: hashed } });
    return { success: true };
  } catch (error) {
    console.error("Error updating password:", error);
    return { success: false, message: "Error al actualizar contraseña" };
  }
}

export async function requestCredentialRecoveryAction(data: { name: string; email: string; role: string; message: string }) {
  try {
    const admins = await db.user.findMany({
      where: { role: "ADMIN" }
    });

    if (admins.length === 0) {
      return { success: false, message: "No se encontraron administradores registrados en el sistema." };
    }

    // Crear la notificación para cada administrador
    for (const admin of admins) {
      await db.notification.create({
        data: {
          userId: admin.id,
          title: "Recuperación de Credenciales",
          message: `El usuario ${data.name} (${data.role}) solicita recuperar sus credenciales. Contacto/Email provisto: ${data.email || 'No especificado'}. Detalle: ${data.message || 'Sin observaciones'}`,
          type: "RECOVERY",
          link: "/admin/users"
        }
      });
    }

    return { success: true };
  } catch (error) {
    console.error("Error creating recovery notification:", error);
    return { success: false, message: "Error interno al procesar la solicitud." };
  }
}

