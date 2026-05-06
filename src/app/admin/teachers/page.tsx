"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { UserPlus, Users, X, Edit2, Trash2, Mail, Briefcase } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { createUser, updateUser, deleteUser, getAllUsers } from "@/app/actions/admin";

export default function AdminTeachersPage() {
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [teachers, setTeachers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Modals
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState<any>(null);

  // Form
  const [formData, setFormData] = useState({ name: "", email: "", pass: "", role: "TEACHER" as const });

  useEffect(() => {
    if (user?.role === "admin") {
      loadData();
    }
  }, [user]);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const u = await getAllUsers();
      setTeachers(u.filter(usr => usr.role === "TEACHER"));
    } catch (error) {
      console.error("Error al cargar docentes:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    let res;
    if (editingTeacher) {
      res = await updateUser(editingTeacher.id, { name: formData.name, email: formData.email });
    } else {
      res = await createUser(formData.name, formData.email, formData.pass, "TEACHER");
    }

    if (res.success) {
      setIsModalOpen(false);
      setEditingTeacher(null);
      setFormData({ name: "", email: "", pass: "", role: "TEACHER" });
      loadData();
    }
  };

  const handleEdit = (t: any) => {
    setEditingTeacher(t);
    setFormData({ name: t.name, email: t.email, pass: "", role: "TEACHER" });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm("¿Estás seguro de eliminar este docente?")) {
      const res = await deleteUser(id);
      if (res.success) loadData();
    }
  };

  if (authLoading || isLoading) return <div className="p-20 text-center font-bold animate-pulse uppercase tracking-widest text-primary">Cargando Cuerpo Docente...</div>;

  if (!user || user?.role !== "admin") { router.push("/login"); return null; }

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <header className="mb-12 flex justify-between items-end">
        <div>
          <h1 className="text-6xl font-black tracking-tighter mb-2 uppercase italic leading-none">Cuerpo <span className="text-primary">Docente</span></h1>
          <p className="text-muted-foreground text-[10px] uppercase font-bold tracking-[0.4em]">Gestión de Personal Académico • Ciclo 2026</p>
        </div>
        <button onClick={() => { setEditingTeacher(null); setFormData({ name: "", email: "", pass: "", role: "TEACHER" }); setIsModalOpen(true); }} className="bg-primary text-primary-foreground px-6 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center gap-2 hover:scale-105 transition-all shadow-xl shadow-primary/20">
          <UserPlus size={18} />
          Nuevo Docente
        </button>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {teachers.map((t) => (
          <div key={t.id} className="bg-card border border-border p-8 rounded-[2.5rem] shadow-sm hover:border-primary/50 transition-all group relative overflow-hidden">
            <div className="flex items-center gap-6 mb-8">
              <div className="w-16 h-16 rounded-[1.5rem] bg-secondary flex items-center justify-center font-black text-2xl text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary transition-all">
                {t.name.charAt(0)}
              </div>
              <div>
                <h3 className="text-xl font-black leading-tight group-hover:text-primary transition-colors">{t.name}</h3>
                <p className="text-[10px] text-muted-foreground uppercase font-black tracking-widest flex items-center gap-2 mt-1">
                  <Briefcase size={12} className="text-primary" />
                  Docente Técnico
                </p>
              </div>
            </div>

            <div className="space-y-4 mb-8">
              <div className="flex items-center gap-3 text-muted-foreground">
                <Mail size={16} />
                <span className="text-xs font-medium truncate">{t.email}</span>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-6 border-t border-border/50">
              <button onClick={() => handleEdit(t)} className="p-3 rounded-xl bg-secondary hover:bg-primary hover:text-white transition-all">
                <Edit2 size={16} />
              </button>
              <button onClick={() => handleDelete(t.id)} className="p-3 rounded-xl bg-secondary hover:bg-red-500 hover:text-white transition-all">
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-background/80 backdrop-blur-md">
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="bg-card border border-border w-full max-w-md rounded-[2.5rem] shadow-2xl overflow-hidden">
              <div className="p-8 border-b border-border flex justify-between items-center bg-secondary/30">
                <h3 className="font-black uppercase italic tracking-tighter text-xl">{editingTeacher ? "Editar Docente" : "Nuevo Docente"}</h3>
                <button onClick={() => setIsModalOpen(false)} className="w-10 h-10 rounded-full bg-background border border-border flex items-center justify-center hover:bg-red-500 hover:text-white">✕</button>
              </div>
              <form onSubmit={handleSubmit} className="p-8 space-y-6">
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-2 block">Nombre Completo</label>
                  <input required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full bg-secondary/30 border border-border rounded-xl p-4 font-bold outline-none" placeholder="Nombre y Apellido" />
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-2 block">Correo Institucional</label>
                  <input required type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full bg-secondary/30 border border-border rounded-xl p-4 font-bold outline-none" placeholder="email@escuelavidela.edu.ar" />
                </div>
                {!editingTeacher && (
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-2 block">Contraseña Temporal</label>
                    <input required type="password" value={formData.pass} onChange={e => setFormData({...formData, pass: e.target.value})} className="w-full bg-secondary/30 border border-border rounded-xl p-4 font-bold outline-none" placeholder="********" />
                  </div>
                )}
                <button type="submit" className="w-full py-5 bg-primary text-white rounded-2xl font-black uppercase tracking-[0.3em] text-[10px] shadow-xl">
                  {editingTeacher ? "Actualizar Datos" : "Registrar Docente"}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
