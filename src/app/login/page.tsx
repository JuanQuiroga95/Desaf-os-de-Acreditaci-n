"use client";

import React, { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { GraduationCap, ShieldCheck, BookOpen, Users, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();
  const [selectedRole, setSelectedRole] = useState<"student" | "teacher" | "admin">("student");

  const handleLogin = () => {
    login(selectedRole);
    router.push("/");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-6">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(59,130,246,0.05),transparent_50%)]" />
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md relative z-10"
      >
        <div className="text-center mb-10">
          <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center text-primary-foreground mx-auto mb-4 shadow-xl shadow-primary/20">
            <GraduationCap size={32} />
          </div>
          <h1 className="text-3xl font-black tracking-tight">Videla-Acredita</h1>
          <p className="text-muted-foreground mt-2 uppercase text-xs font-bold tracking-widest">Sistema de Gestión - Orientación Economía</p>
        </div>

        <div className="bg-card border border-border p-8 rounded-3xl shadow-2xl space-y-6">
          <div className="space-y-4">
            <label className="text-sm font-bold text-muted-foreground uppercase tracking-wider">Selecciona tu Perfil</label>
            <div className="grid grid-cols-3 gap-3">
              {[
                { id: "student", icon: BookOpen, label: "Alumno" },
                { id: "teacher", icon: Users, label: "Docente" },
                { id: "admin", icon: ShieldCheck, label: "Admin" },
              ].map((role) => {
                const Icon = role.icon;
                const isActive = selectedRole === role.id;
                return (
                  <button
                    key={role.id}
                    onClick={() => setSelectedRole(role.id as any)}
                    className={`flex flex-col items-center justify-center p-4 rounded-2xl border transition-all duration-200 ${
                      isActive 
                        ? "bg-primary/10 border-primary text-primary" 
                        : "bg-secondary/50 border-border text-muted-foreground hover:bg-secondary hover:text-foreground"
                    }`}
                  >
                    <Icon size={20} className="mb-2" />
                    <span className="text-[10px] font-bold uppercase">{role.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Correo Institucional</label>
              <input 
                type="email" 
                disabled
                placeholder={selectedRole === "student" ? "alumno@videla.edu.ar" : selectedRole === "teacher" ? "docente@videla.edu.ar" : "admin@videla.edu.ar"}
                className="w-full bg-secondary border border-border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/50 opacity-60"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Contraseña</label>
              <input 
                type="password" 
                disabled
                placeholder="••••••••"
                className="w-full bg-secondary border border-border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/50 opacity-60"
              />
            </div>
          </div>

          <button 
            onClick={handleLogin}
            className="w-full bg-primary text-primary-foreground py-4 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 group"
          >
            Acceder al Tablero
            <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
          </button>

          <p className="text-[10px] text-center text-muted-foreground uppercase font-bold tracking-widest">
            Acceso exclusivo para personal y alumnos de la Escuela Videla
          </p>
        </div>
      </motion.div>
    </div>
  );
}
