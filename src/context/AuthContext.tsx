"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

type Role = "student" | "teacher" | "admin" | null;

interface User {
  id: string;
  name: string;
  role: Role;
  email: string;
}

interface AuthContextType {
  user: User | null;
  login: (role: Role) => void;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const savedUser = localStorage.getItem("videla_user");
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setIsLoading(false);
  }, []);

  const login = (email: string, password: string): { success: boolean; message?: string } => {
    const mockUsers = [
      { id: "admin-1", name: "Admin General", role: "admin" as Role, email: "admin@videla.edu.ar", pass: "admin123" },
      { id: "teacher-1", name: "Prof. Juan Quiroga", role: "teacher" as Role, email: "juan@videla.edu.ar", pass: "docente123" },
      { id: "student-1", name: "Pedro Estudiante", role: "student" as Role, email: "pedro@videla.edu.ar", pass: "alumno123" },
    ];

    const foundUser = mockUsers.find(u => u.email === email && u.pass === password);

    if (foundUser) {
      const userToSave = { id: foundUser.id, name: foundUser.name, role: foundUser.role, email: foundUser.email };
      setUser(userToSave);
      localStorage.setItem("videla_user", JSON.stringify(userToSave));
      return { success: true };
    }

    return { success: false, message: "Credenciales incorrectas. Revisa el correo y la contraseña." };
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
