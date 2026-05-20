"use client";

import React, { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { GraduationCap, ShieldCheck, BookOpen, Users, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);
    
    const result = await login(email, password);
    if (result.success) {
      router.push("/");
    } else {
      setError(result.message || "Error al ingresar");
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-6">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(59,130,246,0.05),transparent_50%)]" />
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10"
      >
        <div className="flex flex-col justify-center space-y-8">
          <div>
            <div className="w-24 h-24 bg-white border border-border rounded-full flex items-center justify-center p-1.5 mb-8 shadow-2xl relative z-10 overflow-hidden">
              <img src="/logo.png" alt="Logo Escuela" className="w-full h-full object-contain scale-110" />
            </div>
            <h1 className="text-6xl font-black tracking-tight leading-none uppercase italic">Videla<br /><span className="text-primary">Acredita</span></h1>
            <p className="text-muted-foreground mt-4 uppercase text-xs font-bold tracking-widest leading-relaxed">
              SISTEMA DE GESTIÓN ACADÉMICA<br />
              ESCUELA N° 4-012 "ING. RICARDO VIDELA"<br />
              ORIENTACIÓN ECONOMÍA Y ADMINISTRACIÓN
            </p>
          </div>

          {process.env.NODE_ENV !== "production" && (
          <div className="bg-secondary/30 border border-border p-6 rounded-3xl space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-widest text-primary">Credenciales de Acceso (Demo)</h3>
            <div className="grid grid-cols-2 gap-4 text-[10px]">
              <div>
                <p className="text-muted-foreground mb-1 uppercase">Alumno</p>
                <code className="bg-background p-1 px-2 rounded border border-border block">pedro@videla.edu.ar / alumno123</code>
              </div>
              <div>
                <p className="text-muted-foreground mb-1 uppercase">Docente</p>
                <code className="bg-background p-1 px-2 rounded border border-border block">juan@videla.edu.ar / docente123</code>
              </div>
              <div className="col-span-2">
                <p className="text-muted-foreground mb-1 uppercase">Administrador</p>
                <code className="bg-background p-1 px-2 rounded border border-border block">admin@videla.edu.ar / admin123</code>
              </div>
            </div>
          </div>
          )}
        </div>

        <form onSubmit={handleLogin} className="bg-card border border-border p-8 md:p-10 rounded-[2.5rem] shadow-2xl space-y-6">
          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-bold text-muted-foreground uppercase tracking-wider ml-1">Correo Institucional</label>
              <input 
                type="email" 
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="ejemplo@videla.edu.ar"
                className="w-full bg-secondary border border-border rounded-2xl px-5 py-4 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-muted-foreground uppercase tracking-wider ml-1">Contraseña</label>
              <input 
                type="password" 
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-secondary border border-border rounded-2xl px-5 py-4 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
              />
            </div>
          </div>

          {error && (
            <motion.div 
              initial={{ opacity: 0, x: -10 }} 
              animate={{ opacity: 1, x: 0 }}
              className="p-4 bg-red-500/10 border border-red-500/20 text-red-500 text-xs font-bold rounded-xl text-center uppercase tracking-tight"
            >
              {error}
            </motion.div>
          )}

          <button 
            type="submit"
            disabled={isLoading}
            className="w-full bg-primary text-primary-foreground py-5 rounded-2xl font-bold flex items-center justify-center gap-3 hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 group"
          >
            {isLoading ? "Validando..." : "Acceder al Tablero"}
            <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
          </button>
        </form>
      </motion.div>
    </div>
  );
}
