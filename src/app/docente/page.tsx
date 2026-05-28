"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { PlusCircle, BookOpen, Clock, CheckCircle2, TrendingUp, HelpCircle, FolderOpen, ArrowRight, Edit2, Check } from "lucide-react";
import { getTeacherDashboard, updateSubjectName } from "@/app/actions/teacher";
import { motion } from "framer-motion";
import Link from "next/link";

export default function TeacherPage() {
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [data, setData] = useState<{ subjects: any[], pendingSubmissions: any[], metrics?: { promedioGeneral: string, participacion: number } } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [editingSubjectId, setEditingSubjectId] = useState<string | null>(null);
  const [newSubjectName, setNewSubjectName] = useState("");
  
  useEffect(() => {
    if (user?.id) {
      loadData();
    }
  }, [user]);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const result = await getTeacherDashboard(user!.id);
      if (result.success && result.subjects) {
        setData({ subjects: result.subjects || [], pendingSubmissions: result.pendingSubmissions || [], metrics: result.metrics });
      }
    } catch (error) {
      console.error("Error al cargar datos del docente:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRename = async (subjectId: string) => {
    if (!newSubjectName.trim()) return;
    try {
      const res = await updateSubjectName(subjectId, newSubjectName);
      if (res.success) {
        setEditingSubjectId(null);
        loadData();
      }
    } catch (error) {
      console.error("Error al renombrar:", error);
    }
  };

  if (authLoading || isLoading) return <div className="p-20 text-center font-bold animate-pulse uppercase tracking-[0.3em] text-primary">Sincronizando con el Aula Virtual...</div>;

  if (!user) { router.push("/login"); return null; }

  if (user?.role !== "teacher") return <div className="p-20 text-center font-bold">Acceso Denegado</div>;

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <header className="mb-12 flex justify-between items-end">
        <div>
          <h1 data-tour-id="docente-title" className="text-6xl font-black tracking-tighter mb-2 uppercase italic leading-none">Panel <span className="text-primary">Docente</span></h1>
          <p className="text-muted-foreground text-[10px] uppercase font-bold tracking-[0.4em] leading-relaxed">
            Gestión Académica • <span className="text-foreground">{user.name}</span>
          </p>
        </div>
        <Link 
          href="/docente/new-challenge"
          data-tour-id="docente-nuevo-desafio"
          className="bg-primary text-primary-foreground px-8 py-5 rounded-[2rem] font-black text-[10px] uppercase tracking-widest flex items-center gap-3 hover:scale-105 transition-all shadow-2xl shadow-primary/30"
        >
          <PlusCircle size={20} />
          Nuevo Desafío
        </Link>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-12">
        <div className="lg:col-span-8 space-y-8">
          {/* Subjects Section */}
          <section data-tour-id="docente-materias" className="bg-card border border-border rounded-[3rem] p-10 shadow-sm relative overflow-hidden">
            <h2 className="text-xl font-black mb-10 flex items-center gap-3 italic uppercase text-[10px] tracking-[0.2em] text-primary">
              <BookOpen size={18} />
              Tus Materias Asignadas
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {data?.subjects.map((sub, i) => (
                <Link key={i} href={`/docente/materiales/${sub.id}`} className="p-10 rounded-[2.5rem] bg-secondary/10 border border-border hover:border-primary/50 transition-all group shadow-sm relative overflow-hidden flex flex-col">
                  <div className="flex justify-between items-start mb-6">
                    {editingSubjectId === sub.id ? (
                      <div className="flex items-center gap-2 w-full pr-8" onClick={(e) => e.preventDefault()}>
                        <input 
                          autoFocus
                          value={newSubjectName}
                          onChange={(e) => setNewSubjectName(e.target.value)}
                          className="bg-background border border-primary rounded-lg px-3 py-2 text-xl font-black w-full"
                          onClick={(e) => e.stopPropagation()}
                        />
                        <button 
                          onClick={(e) => { e.stopPropagation(); handleRename(sub.id); }}
                          className="p-2 bg-primary text-white rounded-lg hover:bg-primary/90"
                        >
                          <Check size={18} />
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-3 pr-8 w-full group/title">
                        <h3 className="font-black text-2xl group-hover:text-primary transition-colors leading-tight">{sub.name}</h3>
                        <button 
                          onClick={(e) => { 
                            e.preventDefault(); 
                            e.stopPropagation(); 
                            setEditingSubjectId(sub.id); 
                            setNewSubjectName(sub.name); 
                          }}
                          className="p-1.5 text-muted-foreground hover:text-primary opacity-0 group-hover/title:opacity-100 transition-all"
                        >
                          <Edit2 size={14} />
                        </button>
                      </div>
                    )}
                    <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-all shrink-0">
                      <ArrowRight size={14} />
                    </div>
                  </div>
                  <div className="flex gap-10 mb-6">
                    <div className="flex flex-col">
                      <span className="text-[9px] font-black text-muted-foreground uppercase tracking-[0.2em] mb-2">Alumnos</span>
                      <span className="text-4xl font-black tracking-tighter">{sub.studentsCount}</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[9px] font-black text-muted-foreground uppercase tracking-[0.2em] mb-2">Encuentros</span>
                      <span className="text-4xl font-black tracking-tighter">{sub.challengesCount}</span>
                    </div>
                  </div>
                  <span className="text-[9px] font-black uppercase tracking-widest text-primary flex items-center gap-1 mt-auto">
                    <FolderOpen size={12} /> Gestionar materiales
                  </span>
                </Link>
              ))}
              {data?.subjects.length === 0 && (
                <div className="col-span-2 p-16 text-center border-2 border-dashed border-border rounded-[2.5rem] bg-secondary/5">
                  <HelpCircle className="mx-auto mb-6 text-muted-foreground opacity-20" size={48} />
                  <p className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground">No tienes materias asignadas aún.</p>
                </div>
              )}
            </div>
          </section>

          {/* Submissions Section */}
          <section data-tour-id="docente-entregas" className="bg-card border border-border rounded-[3rem] p-10 shadow-sm relative overflow-hidden">
            <h2 className="text-xl font-black mb-10 flex items-center gap-3 italic uppercase text-[10px] tracking-[0.2em] text-primary">
              <Clock size={18} />
              Entregas Pendientes
            </h2>
            <div className="space-y-4">
              {data?.pendingSubmissions.length === 0 ? (
                <div className="p-16 text-center border-2 border-dashed border-border rounded-[2.5rem] bg-secondary/5">
                  <CheckCircle2 className="mx-auto mb-6 text-green-500 opacity-50" size={48} />
                  <p className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground">¡Todo al día!</p>
                </div>
              ) : (
                data?.pendingSubmissions.slice(0, 5).map((entry, i) => (
                  <div key={i} className="flex items-center justify-between p-8 bg-secondary/10 rounded-[2rem] border border-border/50 hover:bg-secondary/30 transition-all group">
                    <div className="flex items-center gap-8">
                      <div className="w-16 h-16 rounded-[1.25rem] bg-primary/10 text-primary flex items-center justify-center font-black text-2xl">
                        {entry.studentName.charAt(0)}
                      </div>
                      <div>
                        <p className="text-xl font-black group-hover:text-primary transition-colors mb-1">{entry.studentName}</p>
                        <p className="text-[10px] text-muted-foreground uppercase font-black tracking-[0.2em]">{entry.challengeTitle}</p>
                      </div>
                    </div>
                    <Link 
                      href="/docente/reviews"
                      className="bg-primary/10 text-primary px-6 py-3 rounded-xl text-[9px] font-black uppercase tracking-[0.3em] hover:bg-primary hover:text-white transition-all shadow-sm"
                    >
                      Corregir Ahora
                    </Link>
                  </div>
                ))
              )}
              {data?.pendingSubmissions && data.pendingSubmissions.length > 5 && (
                <Link href="/docente/reviews" className="block text-center text-[10px] font-black uppercase tracking-widest text-primary hover:underline pt-4">
                  Ver todas las entregas ({data.pendingSubmissions.length})
                </Link>
              )}
            </div>
          </section>
        </div>

        <aside className="lg:col-span-4 space-y-8">
          <div data-tour-id="docente-rendimiento" className="bg-secondary/20 border border-border rounded-[2.5rem] p-8 shadow-sm">
            <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-primary mb-8 flex items-center gap-3">
              <TrendingUp size={16} />
              Rendimiento Grupal
            </h3>
            <div className="space-y-6">
              {[
                { label: "Promedio General", value: data?.metrics?.promedioGeneral || "-", color: "text-green-500" },
                { label: "Participación", value: `${data?.metrics?.participacion || 0}%`, color: "text-blue-500" },
              ].map((stat, i) => (
                <div key={i} className="flex items-center justify-between p-5 bg-card rounded-2xl border border-border">
                  <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">{stat.label}</span>
                  <span className={`text-2xl font-black ${stat.color}`}>{stat.value}</span>
                </div>
              ))}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
