"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { PlusCircle, BookOpen, Send, Layout, FileText, ChevronRight } from "lucide-react";
import { getTeacherDashboard } from "@/app/actions/teacher";
import { createChallenge } from "@/app/actions/admin";
import { motion } from "framer-motion";

export default function NewChallengePage() {
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [subjects, setSubjects] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form
  const [formData, setFormData] = useState({ title: "", objective: "", subjectId: "" });

  useEffect(() => {
    if (user?.id) {
      loadData();
    }
  }, [user]);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const res = await getTeacherDashboard(user!.id);
      if (res.success && res.subjects) {
        setSubjects(res.subjects);
        if (res.subjects.length > 0) {
          setFormData(prev => ({ ...prev, subjectId: res.subjects![0].id }));
        }
      }
    } catch (error) {
      console.error("Error al cargar datos:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    const res = await createChallenge(formData.subjectId, formData.title, formData.objective, {});
    setIsSubmitting(false);
    if (res.success) {
      router.push("/docente");
    }
  };

  if (authLoading || isLoading) return <div className="p-20 text-center font-bold animate-pulse uppercase tracking-widest text-primary">Cargando Editor...</div>;

  if (!user || user?.role !== "teacher") { router.push("/login"); return null; }

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <header className="mb-12">
        <h1 className="text-6xl font-black tracking-tighter mb-2 uppercase italic leading-none">Diseñar <span className="text-primary">Desafío</span></h1>
        <p className="text-muted-foreground text-[10px] uppercase font-bold tracking-[0.4em]">Arquitectura de Aprendizaje Basado en Retos</p>
      </header>

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="bg-card border border-border rounded-[3rem] p-10 shadow-sm">
          <div className="space-y-8">
            <div>
              <label className="text-xs font-black uppercase tracking-widest text-primary mb-4 flex items-center gap-2 italic">
                <Layout size={16} />
                Estructura del Reto
              </label>
              <div className="space-y-6">
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-2 block">Título de la Actividad</label>
                  <input 
                    required 
                    value={formData.title} 
                    onChange={e => setFormData({...formData, title: e.target.value})} 
                    className="w-full bg-secondary/30 border border-border rounded-2xl p-5 font-bold focus:ring-2 focus:ring-primary/50 outline-none text-xl" 
                    placeholder="Ej: Resolución de Fallas en Circuitos de Control" 
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-2 block">Materia Asociada</label>
                  <select 
                    value={formData.subjectId} 
                    onChange={e => setFormData({...formData, subjectId: e.target.value})} 
                    className="w-full bg-secondary/30 border border-border rounded-2xl p-5 font-bold outline-none"
                  >
                    {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                </div>
              </div>
            </div>

            <hr className="border-border/50" />

            <div>
              <label className="text-xs font-black uppercase tracking-widest text-primary mb-4 flex items-center gap-2 italic">
                <FileText size={16} />
                Contenido Pedagógico
              </label>
              <div className="space-y-6">
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-2 block">Objetivo de Acreditación</label>
                  <textarea 
                    required 
                    value={formData.objective} 
                    onChange={e => setFormData({...formData, objective: e.target.value})} 
                    className="w-full h-48 bg-secondary/30 border border-border rounded-2xl p-5 font-bold focus:ring-2 focus:ring-primary/50 outline-none resize-none" 
                    placeholder="Describe las competencias técnicas que el alumno desarrollará y cómo será evaluado..." 
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-6">
          <button 
            type="button" 
            onClick={() => router.back()} 
            className="px-10 py-6 rounded-[2rem] font-black text-[10px] uppercase tracking-widest text-muted-foreground hover:bg-secondary transition-all"
          >
            Cancelar
          </button>
          <button 
            type="submit" 
            disabled={isSubmitting}
            className="bg-primary text-primary-foreground px-12 py-6 rounded-[2rem] font-black text-[10px] uppercase tracking-[0.3em] flex items-center gap-3 shadow-2xl shadow-primary/30 hover:scale-105 transition-all disabled:opacity-50 disabled:scale-100"
          >
            {isSubmitting ? "Publicando..." : "Lanzar Desafío"}
            <Send size={18} />
          </button>
        </div>
      </form>
    </div>
  );
}
