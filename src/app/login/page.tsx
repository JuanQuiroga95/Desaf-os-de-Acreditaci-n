"use client";

import React, { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { Sparkles, ShieldCheck, ArrowRight, CheckCircle2 } from "lucide-react";
import { LearningUniverse } from "@/components/learning/LearningUniverse";
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
    <div className="discovery-login relative isolate min-h-screen overflow-hidden px-5 py-8 sm:px-10">
      <div className="discovery-grid" aria-hidden="true" />
      <header className="relative mx-auto mb-10 flex max-w-6xl items-center justify-between gap-4">
        <a href="/login" className="flex items-center gap-3 font-black tracking-tight text-white">
          <img src="/logo.png" alt="Escuela Ricardo Videla" className="h-11 w-11 rounded-full bg-white object-contain p-1" />
          <span>VIDELA<span className="text-sky-400">.</span><span className="ml-1 font-medium text-blue-200">ACREDITA</span></span>
        </a>
        <span className="hidden text-xs text-blue-200/80 sm:block">Tu espacio. Tu ritmo. Tu futuro.</span>
      </header>
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mx-auto grid w-full max-w-6xl grid-cols-1 items-center gap-8 lg:grid-cols-[1.3fr_1fr] lg:gap-16 relative z-10"
      >
        <div className="flex min-w-0 flex-col justify-center">
          <div>
            <span className="discovery-eyebrow"><Sparkles size={14} /> ACTIVÁ TU CURIOSIDAD</span>
            <h1 className="mt-6 text-5xl font-black tracking-tight leading-[1.05] text-white sm:text-7xl">Aprender es<br /><span className="discovery-gradient-text">ir más allá.</span></h1>
            <p className="mt-5 max-w-md text-base leading-relaxed text-blue-100/85">Transformá tus dudas en descubrimientos. Juegos, desafíos y nuevas ideas para avanzar a tu manera.</p>
            <p className="discovery-school mt-4 uppercase font-bold tracking-widest leading-relaxed">
              SISTEMA DE GESTIÓN ACADÉMICA<br />
              ESCUELA N° 4-012 "ING. RICARDO VIDELA"<br />
              ORIENTACIÓN ECONOMÍA Y ADMINISTRACIÓN
            </p>
          </div>

          <LearningUniverse compact />

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

        <form onSubmit={handleLogin} className="discovery-login-form border p-6 sm:p-9 rounded-[2rem] shadow-2xl space-y-6">
          <div>
            <span className="mb-5 inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-sky-400/25 bg-sky-400/10 text-sky-300"><ShieldCheck size={23} /></span>
            <p className="mb-2 text-xs font-bold uppercase tracking-[0.18em] text-amber-200">TU AVENTURA CONTINÚA</p>
            <h2 className="text-3xl font-black tracking-tight text-white">¡Qué bueno verte!</h2>
            <p className="mt-2 text-sm text-blue-200/80">Ingresá y seguí construyendo tu próximo logro.</p>
          </div>
          <div className="space-y-6">
            <div className="space-y-2">
              <label htmlFor="login-email" className="text-sm font-bold text-muted-foreground ml-1">Correo institucional</label>
              <input 
                id="login-email"
                autoComplete="username"
                type="email" 
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="ejemplo@videla.edu.ar"
                className="w-full bg-secondary border border-border rounded-2xl px-5 py-4 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="login-password" className="text-sm font-bold text-muted-foreground ml-1">Contraseña</label>
              <input
                id="login-password"
                aria-label="Contraseña"
                autoComplete="current-password"
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
            className="discovery-cta w-full py-4 rounded-full font-bold flex items-center justify-center gap-3 transition-all group disabled:opacity-60"
          >
            {isLoading ? "Ingresando..." : "Empezar mi aventura"}
            <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
          </button>
          <p className="text-center text-xs leading-relaxed text-blue-200/70">Cada intento cuenta. Cada paso te acerca.</p>
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

