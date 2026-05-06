"use client";

import React from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { Settings, Shield, Bell, Database, Save, User } from "lucide-react";

export default function AdminSettingsPage() {
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();

  if (authLoading) return <div className="p-20 text-center font-bold animate-pulse uppercase tracking-widest text-primary">Cargando Configuración...</div>;

  if (!user || user?.role !== "admin") { router.push("/login"); return null; }

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <header className="mb-12">
        <h1 className="text-6xl font-black tracking-tighter mb-2 uppercase italic leading-none">Configuración del <span className="text-primary">Sistema</span></h1>
        <p className="text-muted-foreground text-[10px] uppercase font-bold tracking-[0.4em]">Panel de Control Global • Videla-Acredita</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <aside className="lg:col-span-4 space-y-4">
          {[
            { name: "Perfil de Administrador", icon: User, active: true },
            { name: "Seguridad y Acceso", icon: Shield, active: false },
            { name: "Notificaciones", icon: Bell, active: false },
            { name: "Mantenimiento de Datos", icon: Database, active: false },
          ].map((item, i) => (
            <button key={i} className={`w-full flex items-center gap-4 p-6 rounded-[2rem] border transition-all ${item.active ? "bg-primary/10 border-primary text-primary" : "bg-card border-border text-muted-foreground hover:bg-secondary hover:text-foreground"}`}>
              <item.icon size={20} />
              <span className="font-black text-[10px] uppercase tracking-widest">{item.name}</span>
            </button>
          ))}
        </aside>

        <main className="lg:col-span-8 space-y-8">
          <section className="bg-card border border-border rounded-[3rem] p-10 shadow-sm">
            <h2 className="text-sm font-black uppercase tracking-[0.2em] mb-10 flex items-center gap-3 italic text-primary">
              <User size={18} />
              Información del Perfil
            </h2>
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-2 block">Nombre del Administrador</label>
                  <input readOnly value={user.name} className="w-full bg-secondary/30 border border-border rounded-xl p-4 font-bold outline-none opacity-70 cursor-not-allowed" />
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-2 block">Correo Electrónico</label>
                  <input readOnly value={user.email} className="w-full bg-secondary/30 border border-border rounded-xl p-4 font-bold outline-none opacity-70 cursor-not-allowed" />
                </div>
              </div>
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-2 block">Rol del Sistema</label>
                <div className="p-4 bg-primary/10 border border-primary/20 rounded-xl w-fit font-black text-[10px] text-primary uppercase tracking-widest">
                  Administrador Maestro
                </div>
              </div>
            </div>
          </section>

          <section className="bg-card border border-border rounded-[3rem] p-10 shadow-sm opacity-50 grayscale pointer-events-none">
            <h2 className="text-sm font-black uppercase tracking-[0.2em] mb-10 flex items-center gap-3 italic text-primary">
              <Shield size={18} />
              Ajustes de Seguridad
            </h2>
            <div className="space-y-6">
              <p className="text-xs text-muted-foreground">Opciones avanzadas deshabilitadas en esta versión.</p>
              <button className="bg-secondary text-foreground px-6 py-4 rounded-xl font-black text-[10px] uppercase tracking-widest flex items-center gap-2 border border-border">
                Cambiar Contraseña
              </button>
            </div>
          </section>

          <div className="flex justify-end pt-4">
            <button className="bg-primary text-primary-foreground px-10 py-5 rounded-[2rem] font-black text-[10px] uppercase tracking-[0.3em] flex items-center gap-3 shadow-xl shadow-primary/30 hover:scale-105 transition-all">
              <Save size={20} />
              Guardar Cambios
            </button>
          </div>
        </main>
      </div>
    </div>
  );
}
