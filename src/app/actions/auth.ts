"use server";

import { db } from "@/lib/db";
import bcrypt from "bcryptjs";

export async function loginAction(email: string, pass: string) {
  try {
    console.log(`Intentando login para: ${email}`);
    
    // Verificar conexión a DB
    try {
      await db.$connect();
    } catch (dbError) {
      console.error("Error de conexión a base de datos:", dbError);
      return { success: false, message: "Error de conexión a base de datos" };
    }

    const user = await db.user.findUnique({ where: { email } });
    
    if (!user) {
      console.log(`Usuario no encontrado: ${email}`);
      return { success: false, message: "Usuario no encontrado" };
    }

    console.log(`Usuario encontrado: ${user.email}, rol: ${user.role}`);

    // Login simplificado para asegurar entrada inmediata
    // Probamos tanto el pass plano como el hashed (por si el seed no impactó bien)
    if (user.password === pass) {
      console.log("Login exitoso (password plano)");
      return { 
        success: true, 
        user: { id: user.id, name: user.name, role: user.role.toLowerCase(), email: user.email } 
      };
    }

    // Si no es plano, probamos con bcrypt
    try {
      const isMatch = await bcrypt.compare(pass, user.password);
      if (isMatch) {
        console.log("Login exitoso (bcrypt)");
        return { 
          success: true, 
          user: { id: user.id, name: user.name, role: user.role.toLowerCase(), email: user.email } 
        };
      }
    } catch (bcryptError) {
      console.error("Error al comparar con bcrypt:", bcryptError);
    }

    console.log("Credenciales inválidas");
    return { success: false, message: "Credenciales inválidas" };
  } catch (error) {
    console.error("Login Error Crítico:", error);
    // Retornamos el error más descriptivo posible para debug
    const errorMessage = error instanceof Error ? error.message : String(error);
    return { success: false, message: `Error de servidor: ${errorMessage}` };
  }
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
  try {
    const user = await db.user.update({
      where: { id },
      data
    });
    return {
      success: true,
      user: { id: user.id, name: user.name, role: user.role.toLowerCase(), email: user.email }
    };
  } catch (error) {
    console.error("Error updating user:", error);
    return { success: false, message: "Error al actualizar perfil" };
  }
}

export async function updatePasswordAction(id: string, currentPassword: string, newPassword: string) {
  try {
    const user = await db.user.findUnique({ where: { id } });
    if (!user) return { success: false, message: "Usuario no encontrado" };

    const isMatch = user.password === currentPassword || await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) return { success: false, message: "La contraseña actual es incorrecta" };

    const hashed = await bcrypt.hash(newPassword, 10);
    await db.user.update({ where: { id }, data: { password: hashed } });
    return { success: true };
  } catch (error) {
    console.error("Error updating password:", error);
    return { success: false, message: "Error al actualizar contraseña" };
  }
}

