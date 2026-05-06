"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { loginAction, validateUserAction } from "@/app/actions/auth";

type Role = "student" | "teacher" | "admin" | null;

interface User {
  id: string;
  name: string;
  role: Role;
  email: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<{ success: boolean; message?: string }>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const savedUser = localStorage.getItem("videla_user");
      if (savedUser) {
        const parsedUser = JSON.parse(savedUser);
        // Verificar si el usuario aún existe en la DB (por si hubo un reset)
        try {
          const validation = await validateUserAction(parsedUser.id);
          if (validation.success) {
            setUser(parsedUser);
          } else {
            localStorage.removeItem("videla_user");
            setUser(null);
          }
        } catch (e) {
          console.error("Error validando sesión:", e);
        }
      }
      setIsLoading(false);
    };
    initAuth();
  }, []);

  const login = async (email: string, password: string): Promise<{ success: boolean; message?: string }> => {
    try {
      const result = await loginAction(email, password);

      if (result.success && result.user) {
        const userToSave = result.user as User;
        setUser(userToSave);
        localStorage.setItem("videla_user", JSON.stringify(userToSave));
        return { success: true };
      }

      return { success: false, message: result.message };
    } catch (err) {
      console.error(err);
      return { success: false, message: "Error de conexión" };
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("videla_user");
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
