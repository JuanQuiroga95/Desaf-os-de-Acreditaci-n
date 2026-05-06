"use server";

import { db } from "@/lib/db";
import bcrypt from "bcryptjs";

export async function loginAction(email: string, pass: string) {
  try {
    const user = await db.user.findUnique({
      where: { email },
    });

    if (!user) {
      return { success: false, message: "Usuario no encontrado" };
    }

    const isMatch = await bcrypt.compare(pass, user.password);

    if (!isMatch) {
      return { success: false, message: "Credenciales inválidas" };
    }

    // In a real app, you'd create a session here (e.g. via NextAuth or cookies)
    return { 
      success: true, 
      user: {
        id: user.id,
        name: user.name,
        role: user.role.toLowerCase(),
        email: user.email
      }
    };
  } catch (error) {
    console.error("Login error:", error);
    return { success: false, message: "Error en el servidor" };
  }
}

export async function validateUserAction(userId: string) {
  try {
    const user = await db.user.findUnique({ where: { id: userId } });
    return { success: !!user };
  } catch (error) {
    return { success: false };
  }
}
