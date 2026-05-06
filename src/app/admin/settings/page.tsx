"use client";

import React, { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { Settings, Shield, Bell, Database, Save, User, CheckCircle2, AlertCircle } from "lucide-react";
import { useToast } from "@/context/ToastContext";
import { updateUserAction } from "@/app/actions/auth";

export default function AdminSettingsPage() {
  const { user, isLoading: authLoading, login } = useAuth();
  const { showToast } = useToast();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("profile");
  const [isSaving, setIsSaving] = useState(false);
  
  const [profileForm, setProfileForm] = useState({
    name: user?.name || "",
    email: user?.email || ""
  });

  // Update form if user data changes
  React.useEffect(() => {
    if (user) {
      setProfileForm({ name: user.name, email: user.email });
    }
  }, [user]);

  const handleSaveProfile = async () => {
    if (!user) return;
    setIsSaving(true);
    try {
      const res = await updateUserAction(user.id, profileForm);
      if (res.success && res.user) {
        showToast("Perfil actualizado correctamente", "success");
        // We update the context manually since we don't have a broadcast mechanism
        localStorage.setItem("videla_user", JSON.stringify(res.user));
        // Force refresh to update UI everywhere
        window.location.reload();
      } else {
        showToast(res.message || "Error al actualizar", "error");
      }
    } catch (err) {
      showToast("Falla de conexión", "error");
    } finally {
      setIsSaving(false);
    }
  };

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
            { id: "profile", name: "Perfil de Administrador", icon: User },
            { id: "security", name: "Seguridad y Acceso", icon: Shield },
            { id: "notifications", name: "Notificaciones", icon: Bell },
            { id: "data", name: "Mantenimiento de Datos", icon: Database },
          ].map((item) => (
            <button 
              key={item.id} 
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-4 p-6 rounded-[2rem] border transition-all ${activeTab === item.id ? "bg-primary/10 border-primary text-primary shadow-lg shadow-primary/5" : "bg-card border-border text-muted-foreground hover:bg-secondary hover:text-foreground"}`}
            >
              <item.icon size={20} />
              <span className="font-black text-[10px] uppercase tracking-widest">{item.name}</span>
            </button>
          ))}
        </aside>

        <main className="lg:col-span-8">
          {activeTab === "profile" && (
            <div className="space-y-8">
              <section className="bg-card border border-border rounded-[3rem] p-10 shadow-sm">
                <h2 className="text-sm font-black uppercase tracking-[0.2em] mb-10 flex items-center gap-3 italic text-primary">
                  <User size={18} />
                  Información del Perfil
                </h2>
                <div className="space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div>
                      <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-3 block">Nombre Completo</label>
                      <input 
                        value={profileForm.name} 
                        onChange={(e) => setProfileForm({...profileForm, name: e.target.value})}
                        className="w-full bg-secondary/30 border border-border rounded-xl p-4 font-bold outline-none focus:ring-2 focus:ring-primary/50 transition-all" 
                        placeholder="Ej: Administrador General"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-3 block">Correo Institucional</label>
                      <input 
                        value={profileForm.email} 
                        onChange={(e) => setProfileForm({...profileForm, email: e.target.value})}
                        className="w-full bg-secondary/30 border border-border rounded-xl p-4 font-bold outline-none focus:ring-2 focus:ring-primary/50 transition-all" 
                        placeholder="admin@videla.edu.ar"
                      />
                    </div>
                  </div>
                  <div className="p-6 bg-primary/5 border border-primary/20 rounded-2xl flex items-center justify-between">
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-primary mb-1">Rol Jerárquico</p>
                      <p className="text-xs font-bold text-muted-foreground">ADMINISTRADOR MAESTRO (Acceso Total)</p>
                    </div>
                    <CheckCircle2 className="text-primary" size={24} />
                  </div>
                </div>
              </section>

              <div className="flex justify-end pt-4">
                <button 
                  onClick={handleSaveProfile}
                  disabled={isSaving}
                  className="bg-primary text-primary-foreground px-12 py-5 rounded-[2rem] font-black text-[10px] uppercase tracking-[0.3em] flex items-center gap-3 shadow-xl shadow-primary/30 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50"
                >
                  {isSaving ? "Procesando..." : (
                    <>
                      <Save size={20} />
                      Guardar Cambios
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {activeTab !== "profile" && (
            <div className="bg-card border border-border rounded-[3rem] p-20 flex flex-col items-center justify-center text-center opacity-80">
              <div className="w-20 h-20 bg-secondary rounded-full flex items-center justify-center mb-6">
                <Shield className="text-muted-foreground" size={32} />
              </div>
              <h3 className="text-xl font-black uppercase italic tracking-tighter mb-4">Módulo en Desarrollo</h3>
              <p className="text-sm text-muted-foreground max-w-xs font-medium leading-relaxed">
                Esta sección de la configuración está siendo optimizada para la próxima actualización técnica del sistema.
              </p>
              <button 
                onClick={() => setActiveTab("profile")}
                className="mt-8 text-primary text-[10px] font-black uppercase tracking-widest hover:underline"
              >
                Volver a mi Perfil
              </button>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
