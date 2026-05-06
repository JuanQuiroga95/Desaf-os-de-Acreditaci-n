"use server";

import { db } from "@/lib/db";

export async function loginAction(email: string, pass: string) {
  try {
    const user = await db.user.findUnique({
      where: { email },
    });

    if (!user || user.password !== pass) {
      return { success: false, message: "Credenciales incorrectas" };
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
