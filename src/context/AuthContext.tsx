"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { loginAction, logoutAction, getSessionAction } from "@/app/actions/auth";

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
  refreshSession: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refreshSession = useCallback(async () => {
    try {
      const res = await getSessionAction();
      if (res.success && res.user) {
        setUser(res.user as User);
      } else {
        setUser(null);
      }
    } catch {
      setUser(null);
    }
  }, []);

  useEffect(() => {
    refreshSession().finally(() => setIsLoading(false));
  }, [refreshSession]);

  const login = async (email: string, password: string): Promise<{ success: boolean; message?: string }> => {
    try {
      const result = await loginAction(email, password);

      if (result.success && result.user) {
        setUser(result.user as User);
        return { success: true };
      }

      return { success: false, message: result.message };
    } catch (err) {
      console.error(err);
      return { success: false, message: "Error de conexión" };
    }
  };

  const logout = async () => {
    await logoutAction();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading, refreshSession }}>
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
