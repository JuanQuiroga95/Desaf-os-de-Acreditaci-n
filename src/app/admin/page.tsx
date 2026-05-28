"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { Plus, Users, BookOpen, X, UserPlus, GraduationCap, Briefcase, TrendingUp, ArrowRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { createUser, createSubject, getAllUsers, getAllSubjects, deleteUser, getDashboardStats } from "@/app/actions/admin";
import Link from "next/link";
import { useToast } from "@/context/ToastContext";

export default function AdminPage() {
  const { user, isLoading: authLoading } = useAuth();
  const { showToast } = useToast();
  const router = useRouter();
  const [users, setUsers] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState<{ subjectStats: any[], retentionIndex: number }>({ subjectStats: [], retentionIndex: 0 });

  // Modals
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [isSubjectModalOpen, setIsSubjectModalOpen] = useState(false);

  // Forms
  const [newUser, setNewUser] = useState({ name: "", email: "", pass: "", role: "STUDENT" });
  const [newSubject, setNewSubject] = useState({ name: "", description: "", teacherId: "" });

  useEffect(() => {
    if (user?.role === "admin") {
      loadData();
    }
  }, [user]);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [u, s, st] = await Promise.all([getAllUsers(), getAllSubjects(), getDashboardStats()]);
      setUsers(u);
      setSubjects(s);
      if (st.success) setStats({ subjectStats: st.subjectStats, retentionIndex: st.retentionIndex });
      if (u.filter(usr => usr.role === "TEACHER").length > 0) {
        setNewSubject(prev => ({ ...prev, teacherId: u.find(usr => usr.role === "TEACHER")?.id || "" }));
      }
    } catch (error) {
      console.error("Error al cargar datos del admin:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await createUser(newUser.name, newUser.email, newUser.pass, newUser.role as any);
    if (res.success) {
      showToast("Usuario creado con éxito", "success");
      setIsUserModalOpen(false);
      setNewUser({ name: "", email: "", pass: "", role: "STUDENT" });
      loadData();
    } else {
      showToast(res.message || "Error al crear usuario", "error");
    }
  };

  const handleCreateSubject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubject.teacherId) {
      showToast("Debes seleccionar un docente", "error");
      return;
    }
    const res = await createSubject(newSubject.name, newSubject.description, newSubject.teacherId);
    if (res.success) {
      showToast("Materia creada con éxito", "success");
      setIsSubjectModalOpen(false);
      setNewSubject({ name: "", description: "", teacherId: "" });
      loadData();
    } else {
      showToast("Error al crear materia", "error");
    }
  };

  const handleDeleteUser = async (id: string, name: string) => {
    if (id === user?.id) {
      showToast("No puedes eliminarte a ti mismo", "error");
      return;
    }
    if (confirm(`¿Eliminar a ${name}?`)) {
      const res = await deleteUser(id);
      if (res.success) {
        showToast("Usuario eliminado", "success");
        loadData();
      } else {
        showToast("Error al eliminar", "error");
      }
    }
  };

  if (authLoading || isLoading) return <div className="p-20 text-center font-bold animate-pulse uppercase tracking-widest text-primary">Accediendo al Panel Maestro...</div>;
  if (!user || user?.role !== "admin") { router.push("/login"); return null; }

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <header className="mb-12 flex justify-between items-end">
        <div>
          <h1 data-tour-id="admin-title" className="text-6xl font-black tracking-tighter mb-2 uppercase italic leading-none">Control <span className="text-primary">Admin</span></h1>
          <p className="text-muted-foreground text-[10px] uppercase font-bold tracking-[0.4em]">Gestión Centralizada • Ciclo 2026</p>
        </div>
        <div data-tour-id="admin-actions" className="flex gap-4">
          <button onClick={() => setIsUserModalOpen(true)} className="bg-secondary text-foreground px-6 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center gap-2 border border-border hover:bg-border transition-all shadow-sm">
            <UserPlus size={18} />
            Nuevo Usuario
          </button>
          <button onClick={() => setIsSubjectModalOpen(true)} className="bg-primary text-primary-foreground px-6 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center gap-2 hover:scale-105 transition-all shadow-xl shadow-primary/20">
            <Plus size={18} />
            Nueva Materia
          </button>
        </div>
      </header>

      <div data-tour-id="admin-stats" className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        {[
          { label: "Docentes Activos", value: users.filter(u => u.role === "TEACHER").length, icon: Briefcase, color: "text-blue-500" },
          { label: "Materias Creadas", value: subjects.length, icon: BookOpen, color: "text-green-500" },
          { label: "Alumnos Registrados", value: users.filter(u => u.role === "STUDENT").length, icon: GraduationCap, color: "text-purple-500" },
        ].map((stat, i) => (
          <div key={i} className="bg-card border border-border p-8 rounded-[2.5rem] shadow-sm relative overflow-hidden group">
            <div className="flex justify-between items-start mb-6">
              <div className={`p-4 rounded-2xl bg-secondary ${stat.color}`}>
                <stat.icon size={24} />
              </div>
              <span className="text-5xl font-black tracking-tighter group-hover:scale-110 transition-transform">{stat.value}</span>
            </div>
            <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">{stat.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Materias List */}
        <section className="bg-card border border-border rounded-[2.5rem] overflow-hidden shadow-sm">
          <div className="p-8 border-b border-border flex justify-between items-center bg-secondary/10">
            <h2 className="font-black flex items-center gap-2 italic uppercase text-xs tracking-widest">
              <BookOpen size={18} className="text-primary" />
              Gestión de Materias
            </h2>
            <Link href="/admin/subjects" className="text-primary text-[10px] font-black uppercase tracking-widest hover:underline">Ver Todas</Link>
          </div>
          <div className="divide-y divide-border">
            {subjects.slice(0, 5).map((sub) => (
              <div key={sub.id} className="p-6 flex items-center justify-between hover:bg-secondary/20 transition-colors">
                <div>
                  <p className="font-bold text-lg">{sub.name}</p>
                  <p className="text-[10px] text-muted-foreground uppercase font-black tracking-widest">Titular: {sub.teacher.name} • {sub._count.challenges} Desafíos</p>
                </div>
                <Link href="/admin/subjects" className="p-2 hover:bg-secondary rounded-lg transition-colors">
                  <ArrowRight size={18} className="text-muted-foreground" />
                </Link>
              </div>
            ))}
          </div>
        </section>

        {/* Usuarios List */}
        <section className="bg-card border border-border rounded-[2.5rem] overflow-hidden shadow-sm">
          <div className="p-8 border-b border-border flex justify-between items-center bg-secondary/10">
            <h2 className="font-black flex items-center gap-2 italic uppercase text-xs tracking-widest">
              <Users size={18} className="text-primary" />
              Usuarios Recientes
            </h2>
            <Link href="/admin/teachers" className="text-primary text-[10px] font-black uppercase tracking-widest hover:underline">Ver Todos</Link>
          </div>
          <div className="divide-y divide-border">
            {users.slice(0, 5).map((u) => (
              <div key={u.id} className="p-6 flex items-center justify-between hover:bg-secondary/20 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center font-bold text-muted-foreground">
                    {u.name.charAt(0)}
                  </div>
                  <div>
                    <p className="font-bold">{u.name}</p>
                    <p className="text-[10px] text-muted-foreground uppercase font-black tracking-widest">{u.role} • {u.email}</p>
                  </div>
                </div>
                <button 
                  onClick={() => handleDeleteUser(u.id, u.name)}
                  className="p-2 hover:bg-red-500 hover:text-white rounded-lg transition-all text-muted-foreground"
                >
                  <X size={18} />
                </button>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* Analytics Section */}
      <section data-tour-id="admin-analytics" className="mt-12 bg-card border border-border rounded-[3rem] p-10 shadow-sm">
        <h2 className="text-xl font-black mb-10 flex items-center gap-3 italic uppercase text-[10px] tracking-[0.2em] text-primary">
          <TrendingUp size={18} />
          Rendimiento Académico Global
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          <div className="space-y-6">
            <h3 className="text-xs font-black uppercase tracking-widest text-muted-foreground">Tasa de Acreditación por Materia</h3>
            {stats.subjectStats.length === 0 ? (
              <p className="text-[10px] text-muted-foreground uppercase font-black italic">Sin datos suficientes...</p>
            ) : stats.subjectStats.map((m, i) => (
              <div key={i} className="space-y-2">
                <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest">
                  <span>{m.name}</span>
                  <span className="text-primary">{m.val}%</span>
                </div>
                <div className="w-full bg-secondary h-3 rounded-full overflow-hidden border border-border/50 shadow-inner">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${m.val}%` }}
                    transition={{ duration: 1, delay: i * 0.2 }}
                    className="h-full bg-primary progress-glow"
                  />
                </div>
              </div>
            ))}
          </div>
          <div className="bg-secondary/20 rounded-[2.5rem] p-8 border border-border flex flex-col justify-center items-center text-center">
            <div className="w-32 h-32 rounded-full border-[12px] border-primary/20 border-t-primary flex items-center justify-center mb-6 shadow-2xl">
              <span className="text-3xl font-black italic">{stats.retentionIndex}%</span>
            </div>
            <h4 className="text-sm font-black uppercase tracking-widest mb-2">Índice de Retención</h4>
            <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-[0.2em]">Basado en desafíos completados</p>
          </div>
        </div>
      </section>

      {/* MODALS */}
      <AnimatePresence>
        {isUserModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-background/80 backdrop-blur-md">
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="bg-card border border-border w-full max-w-md rounded-[2.5rem] shadow-2xl overflow-hidden">
              <div className="p-8 border-b border-border flex justify-between items-center bg-secondary/30">
                <h3 className="font-black uppercase italic tracking-tighter text-xl">Nuevo Usuario</h3>
                <button onClick={() => setIsUserModalOpen(false)} className="w-10 h-10 rounded-full bg-background border border-border flex items-center justify-center hover:bg-red-500 hover:text-white transition-all">✕</button>
              </div>
              <form onSubmit={handleCreateUser} className="p-8 space-y-6">
                <input required value={newUser.name} onChange={e => setNewUser({...newUser, name: e.target.value})} className="w-full bg-secondary/30 border border-border rounded-xl p-4 font-bold outline-none focus:ring-2 focus:ring-primary/50 transition-all" placeholder="Nombre Completo" />
                <input required type="email" value={newUser.email} onChange={e => setNewUser({...newUser, email: e.target.value})} className="w-full bg-secondary/30 border border-border rounded-xl p-4 font-bold outline-none focus:ring-2 focus:ring-primary/50 transition-all" placeholder="Correo Electrónico" />
                <input required type="password" value={newUser.pass} onChange={e => setNewUser({...newUser, pass: e.target.value})} className="w-full bg-secondary/30 border border-border rounded-xl p-4 font-bold outline-none focus:ring-2 focus:ring-primary/50 transition-all" placeholder="Contraseña Temporal" />
                <select 
                  value={newUser.role} 
                  onChange={e => setNewUser({...newUser, role: e.target.value})} 
                  className="w-full bg-secondary/30 border border-border rounded-xl p-4 font-bold outline-none focus:ring-2 focus:ring-primary/50 text-foreground"
                  style={{ colorScheme: 'dark' }}
                >
                  <option value="STUDENT" className="bg-background">ALUMNO</option>
                  <option value="TEACHER" className="bg-background">DOCENTE</option>
                  <option value="ADMIN" className="bg-background">ADMINISTRADOR</option>
                </select>
                <button type="submit" className="w-full py-5 bg-primary text-white rounded-2xl font-black uppercase tracking-[0.3em] text-[10px] shadow-xl hover:scale-[1.02] active:scale-95 transition-all">Crear Usuario</button>
              </form>
            </motion.div>
          </div>
        )}

        {isSubjectModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-background/80 backdrop-blur-md">
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="bg-card border border-border w-full max-w-md rounded-[2.5rem] shadow-2xl overflow-hidden">
              <div className="p-8 border-b border-border flex justify-between items-center bg-secondary/30">
                <h3 className="font-black uppercase italic tracking-tighter text-xl">Nueva Materia</h3>
                <button onClick={() => setIsSubjectModalOpen(false)} className="w-10 h-10 rounded-full bg-background border border-border flex items-center justify-center hover:bg-red-500 hover:text-white transition-all">✕</button>
              </div>
              <form onSubmit={handleCreateSubject} className="p-8 space-y-6">
                <input required value={newSubject.name} onChange={e => setNewSubject({...newSubject, name: e.target.value})} className="w-full bg-secondary/30 border border-border rounded-xl p-4 font-bold outline-none focus:ring-2 focus:ring-primary/50 transition-all" placeholder="Nombre de la Materia" />
                <textarea required value={newSubject.description} onChange={e => setNewSubject({...newSubject, description: e.target.value})} className="w-full bg-secondary/30 border border-border rounded-xl p-4 font-bold outline-none h-24 focus:ring-2 focus:ring-primary/50 transition-all resize-none" placeholder="Descripción..." />
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-2 block">Docente Titular</label>
                  <select 
                    required 
                    value={newSubject.teacherId} 
                    onChange={e => setNewSubject({...newSubject, teacherId: e.target.value})} 
                    className="w-full bg-secondary/30 border border-border rounded-xl p-4 font-bold outline-none focus:ring-2 focus:ring-primary/50 text-foreground"
                    style={{ colorScheme: 'dark' }}
                  >
                    <option value="" className="bg-background">Seleccionar Docente</option>
                    {users.filter(u => u.role === "TEACHER").map(t => (
                      <option key={t.id} value={t.id} className="bg-background">{t.name}</option>
                    ))}
                  </select>
                </div>
                <button type="submit" className="w-full py-5 bg-primary text-white rounded-2xl font-black uppercase tracking-[0.3em] text-[10px] shadow-xl hover:scale-[1.02] active:scale-95 transition-all">Crear Materia</button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
