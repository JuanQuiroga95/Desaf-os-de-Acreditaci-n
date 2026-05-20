"use client";

import React, { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { GraduationCap, ShieldCheck, BookOpen, Users, ArrowRight, X, CheckCircle2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { requestCredentialRecoveryAction } from "@/app/actions/auth";


export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Recovery states
  const [isRecoveryOpen, setIsRecoveryOpen] = useState(false);
  const [recoveryForm, setRecoveryForm] = useState({ name: "", email: "", role: "STUDENT", message: "" });
  const [recoveryError, setRecoveryError] = useState("");
  const [recoverySuccess, setRecoverySuccess] = useState(false);
  const [recoveryLoading, setRecoveryLoading] = useState(false);

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

  const handleRecoverySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setRecoveryError("");
    setRecoveryLoading(true);
    try {
      const res = await requestCredentialRecoveryAction(recoveryForm);
      if (res.success) {
        setRecoverySuccess(true);
        setRecoveryForm({ name: "", email: "", role: "STUDENT", message: "" });
      } else {
        setRecoveryError(res.message || "Error al enviar la solicitud.");
      }
    } catch (err) {
      setRecoveryError("Falla de conexión.");
    } finally {
      setRecoveryLoading(false);
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
            <div className="text-right">
              <button 
                type="button"
                onClick={() => {
                  setIsRecoveryOpen(true);
                  setRecoverySuccess(false);
                  setRecoveryError("");
                }}
                className="text-xs font-bold text-primary hover:underline uppercase tracking-wider"
              >
                ¿No podés ingresar? / Olvidé mis datos
              </button>
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

      <AnimatePresence>
        {isRecoveryOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-background/80 backdrop-blur-md">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }} 
              animate={{ opacity: 1, scale: 1 }} 
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-card border border-border w-full max-w-md rounded-[2.5rem] shadow-2xl overflow-hidden"
            >
              <div className="p-8 border-b border-border flex justify-between items-center bg-secondary/30">
                <h3 className="font-black uppercase italic tracking-tighter text-xl">Recuperar Acceso</h3>
                <button 
                  onClick={() => setIsRecoveryOpen(false)} 
                  className="w-10 h-10 rounded-full bg-background border border-border flex items-center justify-center hover:bg-red-500 hover:text-white transition-all"
                >
                  ✕
                </button>
              </div>

              {recoverySuccess ? (
                <div className="p-8 text-center space-y-6">
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto text-primary">
                    <CheckCircle2 size={32} />
                  </div>
                  <h4 className="text-lg font-black uppercase tracking-tight">¡Solicitud Enviada!</h4>
                  <p className="text-xs text-muted-foreground leading-relaxed uppercase font-semibold">
                    Se ha enviado un aviso a la dirección y preceptoría. Por favor, comunícate en persona para completar el restablecimiento de tus credenciales.
                  </p>
                  <button 
                    onClick={() => setIsRecoveryOpen(false)}
                    className="w-full py-4 bg-primary text-white rounded-2xl font-black uppercase tracking-[0.2em] text-[10px] shadow-xl hover:bg-primary/95 transition-all"
                  >
                    Entendido
                  </button>
                </div>
              ) : (
                <form onSubmit={handleRecoverySubmit} className="p-8 space-y-6">
                  <p className="text-[10px] text-muted-foreground uppercase font-black leading-relaxed tracking-wider">
                    Si no recordás tu usuario o contraseña, completá tus datos a continuación para notificar al administrador del sistema.
                  </p>
                  
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground block ml-1">Nombre Completo</label>
                    <input 
                      required 
                      value={recoveryForm.name} 
                      onChange={e => setRecoveryForm({...recoveryForm, name: e.target.value})} 
                      className="w-full bg-secondary/30 border border-border rounded-xl p-4 font-bold outline-none focus:ring-2 focus:ring-primary/50 text-sm transition-all" 
                      placeholder="Ej: Juan Pérez" 
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground block ml-1">Rol en la Escuela</label>
                    <select 
                      value={recoveryForm.role} 
                      onChange={e => setRecoveryForm({...recoveryForm, role: e.target.value})} 
                      className="w-full bg-secondary/30 border border-border rounded-xl p-4 font-bold outline-none focus:ring-2 focus:ring-primary/50 text-sm text-foreground"
                      style={{ colorScheme: 'dark' }}
                    >
                      <option value="STUDENT" className="bg-background">ALUMNO</option>
                      <option value="TEACHER" className="bg-background">DOCENTE</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground block ml-1">Contacto o DNI (Opcional)</label>
                    <input 
                      value={recoveryForm.email} 
                      onChange={e => setRecoveryForm({...recoveryForm, email: e.target.value})} 
                      className="w-full bg-secondary/30 border border-border rounded-xl p-4 font-bold outline-none focus:ring-2 focus:ring-primary/50 text-sm transition-all" 
                      placeholder="Ej: Celular o DNI" 
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground block ml-1">Detalle del problema</label>
                    <textarea 
                      value={recoveryForm.message} 
                      onChange={e => setRecoveryForm({...recoveryForm, message: e.target.value})} 
                      className="w-full bg-secondary/30 border border-border rounded-xl p-4 font-bold outline-none focus:ring-2 focus:ring-primary/50 text-sm transition-all h-20 resize-none" 
                      placeholder="Ej: No me deja ingresar, creo que escribo mal la contraseña" 
                    />
                  </div>

                  {recoveryError && (
                    <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-500 text-[10px] font-bold rounded-xl text-center uppercase tracking-tight">
                      {recoveryError}
                    </div>
                  )}

                  <button 
                    type="submit" 
                    disabled={recoveryLoading}
                    className="w-full py-4 bg-primary text-white rounded-2xl font-black uppercase tracking-[0.2em] text-[10px] shadow-xl hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50"
                  >
                    {recoveryLoading ? "Enviando..." : "Enviar Solicitud"}
                  </button>
                </form>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

