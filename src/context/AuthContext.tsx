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

  const login = (role: Role) => {
    let mockUser: User;
    if (role === "admin") {
      mockUser = { id: "admin-1", name: "Admin General", role: "admin", email: "admin@videla.edu.ar" };
    } else if (role === "teacher") {
      mockUser = { id: "teacher-1", name: "Prof. Juan Quiroga", role: "teacher", email: "juan@videla.edu.ar" };
    } else {
      mockUser = { id: "student-1", name: "Pedro Estudiante", role: "student", email: "pedro@videla.edu.ar" };
    }
    setUser(mockUser);
    localStorage.setItem("videla_user", JSON.stringify(mockUser));
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
