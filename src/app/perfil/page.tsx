"use client";

import React, { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";
import { User, Lock, Save, ShieldCheck } from "lucide-react";
import { motion } from "framer-motion";
import { updatePasswordAction } from "@/app/actions/auth";

export default function ProfilePage() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [passwords, setPasswords] = useState({ current: "", new: "", confirm: "" });
  const [isUpdating, setIsUpdating] = useState(false);

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwords.new !== passwords.confirm) {
      showToast("Las contraseñas no coinciden", "error");
      return;
    }
    if (passwords.new.length < 6) {
      showToast("La nueva contraseña debe tener al menos 6 caracteres", "error");
      return;
    }
    setIsUpdating(true);
    const res = await updatePasswordAction(user!.id, passwords.current, passwords.new);
    setIsUpdating(false);
    if (res.success) {
      showToast("Contraseña actualizada con éxito", "success");
      setPasswords({ current: "", new: "", confirm: "" });
    } else {
      showToast(res.message || "Error al actualizar contraseña", "error");
    }
  };

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <header className="mb-12">
        <h1 className="text-6xl font-black tracking-tighter mb-4 italic uppercase leading-none">Mi <span className="text-primary">Perfil</span></h1>
        <p className="text-muted-foreground text-[10px] font-black uppercase tracking-[0.3em]">Gestión de Seguridad y Preferencias</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <aside className="space-y-6">
          <div className="bg-card border border-border rounded-[2.5rem] p-10 flex flex-col items-center text-center shadow-sm">
            <div className="w-24 h-24 rounded-[2rem] bg-primary/10 flex items-center justify-center text-primary mb-6 border border-primary/20">
              <User size={48} />
            </div>
            <h3 className="font-black text-xl uppercase tracking-tighter mb-1">{user?.name}</h3>
            <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">{user?.role}</p>
          </div>
          
          <div className="bg-secondary/20 border border-border rounded-2xl p-6 flex items-center gap-4">
            <ShieldCheck className="text-green-500" size={24} />
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest leading-none mb-1">Estado de Cuenta</p>
              <p className="text-xs font-bold text-green-500">Protegida con Bcrypt</p>
            </div>
          </div>
        </aside>

        <div className="md:col-span-2 space-y-8">
          <section className="bg-card border border-border rounded-[3rem] p-10 shadow-sm">
            <h2 className="text-xs font-black uppercase tracking-[0.3em] text-primary mb-8 flex items-center gap-3">
              <Lock size={16} />
              Seguridad: Cambiar Contraseña
            </h2>
            <form onSubmit={handleUpdatePassword} className="space-y-6">
              <div>
                <label className="text-[10px] font-black uppercase text-muted-foreground mb-2 block">Contraseña Actual</label>
                <input required type="password" value={passwords.current} onChange={e => setPasswords({...passwords, current: e.target.value})} className="w-full bg-secondary/30 border border-border rounded-xl p-4 font-bold outline-none focus:ring-2 focus:ring-primary/50" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-black uppercase text-muted-foreground mb-2 block">Nueva Contraseña</label>
                  <input required type="password" value={passwords.new} onChange={e => setPasswords({...passwords, new: e.target.value})} className="w-full bg-secondary/30 border border-border rounded-xl p-4 font-bold outline-none focus:ring-2 focus:ring-primary/50" />
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase text-muted-foreground mb-2 block">Confirmar Nueva</label>
                  <input required type="password" value={passwords.confirm} onChange={e => setPasswords({...passwords, confirm: e.target.value})} className="w-full bg-secondary/30 border border-border rounded-xl p-4 font-bold outline-none focus:ring-2 focus:ring-primary/50" />
                </div>
              </div>
              <button disabled={isUpdating} className="w-full py-5 bg-primary text-white rounded-2xl font-black uppercase tracking-[0.3em] text-[10px] flex items-center justify-center gap-3 hover:scale-[1.02] transition-all shadow-xl shadow-primary/20">
                <Save size={18} />
                {isUpdating ? "Actualizando..." : "Actualizar Seguridad"}
              </button>
            </form>
          </section>
        </div>
      </div>
    </div>
  );
}
