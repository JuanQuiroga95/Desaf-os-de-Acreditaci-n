"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { PlusCircle, ArrowLeft, BookOpen, Target, Settings, HelpCircle, Save } from "lucide-react";
import { getTeacherDashboard } from "@/app/actions/teacher";
import { createChallenge } from "@/app/actions/admin";
import Link from "next/link";
import { useToast } from "@/context/ToastContext";

export default function TeacherNewChallengePage() {
  const { user, isLoading: authLoading } = useAuth();
  const { showToast } = useToast();
  const router = useRouter();
  const [subjects, setSubjects] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [form, setForm] = useState({
    title: "",
    objective: "",
    subjectId: "",
    content: {
      steps: [
        { type: "text", value: "" },
        { type: "question", value: "", answer: "" }
      ]
    }
  });

  useEffect(() => {
    if (user?.role === "teacher") {
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
          setForm(prev => ({ ...prev, subjectId: res.subjects[0].id }));
        }
      }
    } catch (error) {
      console.error("Error cargando materias:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.subjectId) {
      showToast("Debés seleccionar una materia", "error");
      return;
    }
    
    const res = await createChallenge(form.subjectId, form.title, form.objective, form.content);
    if (res.success) {
      showToast("¡Desafío publicado con éxito!", "success");
      router.push("/docente");
    } else {
      showToast("Error al publicar el desafío", "error");
    }
  };

  if (authLoading || isLoading) return <div className="p-20 text-center font-black animate-pulse uppercase tracking-widest text-primary">Cargando Formulario...</div>;
  if (!user || user.role !== "teacher") return <div className="p-20 text-center font-black uppercase tracking-widest text-primary">Acceso Denegado</div>;

  return (
    <div className="p-8 max-w-5xl mx-auto pb-24">
      <header className="mb-12">
        <Link href="/docente" className="flex items-center gap-2 text-primary font-black text-[10px] uppercase tracking-widest mb-4 hover:underline">
          <ArrowLeft size={14} /> Volver al Panel
        </Link>
        <h1 className="text-5xl font-black tracking-tighter uppercase italic leading-none">Nuevo <span className="text-primary">Desafío</span></h1>
      </header>

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <section className="bg-card border border-border rounded-[2.5rem] p-8 shadow-sm space-y-6">
            <h2 className="text-[10px] font-black uppercase tracking-widest text-primary flex items-center gap-2">
              <Settings size={16} /> Configuración Básica
            </h2>
            
            <div>
              <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-2 block">Materia Asociada</label>
              <select 
                required 
                value={form.subjectId} 
                onChange={e => setForm({...form, subjectId: e.target.value})}
                className="w-full bg-secondary/30 border border-border rounded-xl p-4 font-bold outline-none focus:ring-2 focus:ring-primary/50"
              >
                {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>

            <div>
              <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-2 block">Título del Desafío</label>
              <input 
                required 
                value={form.title} 
                onChange={e => setForm({...form, title: e.target.value})}
                className="w-full bg-secondary/30 border border-border rounded-xl p-4 font-bold outline-none focus:ring-2 focus:ring-primary/50"
                placeholder="Ej: Análisis de Balance Patrimonial"
              />
            </div>
          </section>

          <section className="bg-card border border-border rounded-[2.5rem] p-8 shadow-sm space-y-6">
            <h2 className="text-[10px] font-black uppercase tracking-widest text-primary flex items-center gap-2">
              <Target size={16} /> Objetivo Pedagógico
            </h2>
            <textarea 
              required 
              value={form.objective} 
              onChange={e => setForm({...form, objective: e.target.value})}
              className="w-full h-[180px] bg-secondary/30 border border-border rounded-xl p-4 font-bold outline-none focus:ring-2 focus:ring-primary/50 resize-none"
              placeholder="¿Qué competencia técnica va a acreditar el alumno con este desafío?"
            />
          </section>
        </div>

        <section className="bg-card border border-border rounded-[2.5rem] p-8 shadow-sm space-y-8">
          <h2 className="text-[10px] font-black uppercase tracking-widest text-primary flex items-center gap-2">
            <HelpCircle size={16} /> Lógica del Desafío
          </h2>
          
          <div className="space-y-6">
            <div className="p-6 bg-secondary/10 border border-border rounded-2xl">
              <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-3 block">Contenido Teórico / Contexto</label>
              <textarea 
                required
                className="w-full h-32 bg-background border border-border rounded-xl p-4 font-medium outline-none focus:ring-2 focus:ring-primary/50 resize-none"
                placeholder="Describe el escenario o la teoría necesaria..."
              />
            </div>

            <div className="p-6 bg-secondary/10 border border-border rounded-2xl">
              <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-3 block">Pregunta de Validación</label>
              <input 
                required
                className="w-full bg-background border border-border rounded-xl p-4 font-bold outline-none focus:ring-2 focus:ring-primary/50 mb-4"
                placeholder="Pregunta crítica..."
              />
              <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-3 block">Respuesta Correcta (Sistema)</label>
              <input 
                required
                className="w-full bg-background border border-border rounded-xl p-4 font-mono font-bold outline-none focus:ring-2 focus:ring-primary/50"
                placeholder="Valor o palabra exacta para auto-validación..."
              />
            </div>
          </div>
        </section>

        <button 
          type="submit" 
          className="w-full py-6 bg-primary text-white rounded-[2rem] font-black uppercase tracking-[0.4em] text-xs shadow-2xl shadow-primary/30 hover:scale-[1.01] transition-all flex items-center justify-center gap-3"
        >
          <Save size={20} />
          Publicar Desafío en el Aula
        </button>
      </form>
    </div>
  );
}
