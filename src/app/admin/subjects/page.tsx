"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { Plus, BookOpen, X, Edit2, Trash2, GraduationCap } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { createSubject, updateSubject, deleteSubject, getAllSubjects, getAllUsers } from "@/app/actions/admin";

export default function AdminSubjectsPage() {
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [subjects, setSubjects] = useState<any[]>([]);
  const [teachers, setTeachers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Modals
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSubject, setEditingSubject] = useState<any>(null);

  // Form
  const [formData, setFormData] = useState({ name: "", description: "", teacherId: "" });

  useEffect(() => {
    if (user?.role === "admin") {
      loadData();
    }
  }, [user]);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [s, u] = await Promise.all([getAllSubjects(), getAllUsers()]);
      setSubjects(s);
      const t = u.filter(usr => usr.role === "TEACHER");
      setTeachers(t);
      if (t.length > 0 && !formData.teacherId) {
        setFormData(prev => ({ ...prev, teacherId: t[0].id }));
      }
    } catch (error) {
      console.error("Error al cargar materias:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    let res;
    if (editingSubject) {
      res = await updateSubject(editingSubject.id, formData);
    } else {
      res = await createSubject(formData.name, formData.description, formData.teacherId);
    }

    if (res.success) {
      setIsModalOpen(false);
      setEditingSubject(null);
      setFormData({ name: "", description: "", teacherId: teachers[0]?.id || "" });
      loadData();
    }
  };

  const handleEdit = (sub: any) => {
    setEditingSubject(sub);
    setFormData({ name: sub.name, description: sub.description || "", teacherId: sub.teacherId });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm("¿Estás seguro de eliminar esta materia?")) {
      const res = await deleteSubject(id);
      if (res.success) loadData();
    }
  };

  if (authLoading || isLoading) return <div className="p-20 text-center font-bold animate-pulse uppercase tracking-widest text-primary">Cargando Materias...</div>;

  if (!user || user?.role !== "admin") { router.push("/login"); return null; }

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <header className="mb-12 flex justify-between items-end">
        <div>
          <h1 className="text-6xl font-black tracking-tighter mb-2 uppercase italic leading-none">Gestión de <span className="text-primary">Materias</span></h1>
          <p className="text-muted-foreground text-[10px] uppercase font-bold tracking-[0.4em]">Administración del Curriculum • Ciclo 2026</p>
        </div>
        <button onClick={() => { setEditingSubject(null); setFormData({ name: "", description: "", teacherId: teachers[0]?.id || "" }); setIsModalOpen(true); }} className="bg-primary text-primary-foreground px-6 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center gap-2 hover:scale-105 transition-all shadow-xl shadow-primary/20">
          <Plus size={18} />
          Nueva Materia
        </button>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {subjects.map((sub) => (
          <div key={sub.id} className="bg-card border border-border p-8 rounded-[2.5rem] shadow-sm hover:border-primary/50 transition-all group relative overflow-hidden">
            <div className="mb-6">
              <div className="p-4 w-fit rounded-2xl bg-secondary text-primary mb-4">
                <BookOpen size={24} />
              </div>
              <h3 className="text-2xl font-black mb-2 leading-tight group-hover:text-primary transition-colors">{sub.name}</h3>
              <p className="text-muted-foreground text-xs font-medium line-clamp-2">{sub.description || "Sin descripción disponible."}</p>
            </div>
            
            <div className="flex items-center gap-3 mb-8 p-3 bg-secondary/30 rounded-xl border border-border/50">
              <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center font-bold text-[10px]">
                {sub.teacher.name.charAt(0)}
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest leading-none mb-1">{sub.teacher.name}</p>
                <p className="text-[8px] text-muted-foreground uppercase font-bold">Docente Titular</p>
              </div>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-[10px] font-black uppercase tracking-widest text-primary bg-primary/10 px-3 py-1 rounded-full">
                {sub._count.challenges} Desafíos
              </span>
              <div className="flex gap-2">
                <button onClick={() => handleEdit(sub)} className="p-2 rounded-lg bg-secondary hover:bg-primary hover:text-white transition-all">
                  <Edit2 size={14} />
                </button>
                <button onClick={() => handleDelete(sub.id)} className="p-2 rounded-lg bg-secondary hover:bg-red-500 hover:text-white transition-all">
                  <Trash2 size={14} />
                </button>
              </div>
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
                <h3 className="font-black uppercase italic tracking-tighter text-xl">{editingSubject ? "Editar Materia" : "Nueva Materia"}</h3>
                <button onClick={() => setIsModalOpen(false)} className="w-10 h-10 rounded-full bg-background border border-border flex items-center justify-center hover:bg-red-500 hover:text-white">✕</button>
              </div>
              <form onSubmit={handleSubmit} className="p-8 space-y-6">
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-2 block">Nombre de la Materia</label>
                  <input required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full bg-secondary/30 border border-border rounded-xl p-4 font-bold outline-none" placeholder="Ej: Análisis Matemático" />
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-2 block">Descripción</label>
                  <textarea value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full h-24 bg-secondary/30 border border-border rounded-xl p-4 font-bold outline-none resize-none" placeholder="Breve descripción..." />
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-2 block">Docente Responsable</label>
                  <select value={formData.teacherId} onChange={e => setFormData({...formData, teacherId: e.target.value})} className="w-full bg-secondary/30 border border-border rounded-xl p-4 font-bold outline-none">
                    {teachers.map(t => (
                      <option key={t.id} value={t.id}>{t.name}</option>
                    ))}
                  </select>
                </div>
                <button type="submit" className="w-full py-5 bg-primary text-white rounded-2xl font-black uppercase tracking-[0.3em] text-[10px] shadow-xl">
                  {editingSubject ? "Guardar Cambios" : "Crear Materia"}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
