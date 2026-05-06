"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { PlusCircle, BookOpen, Clock, CheckCircle2, TrendingUp, HelpCircle } from "lucide-react";
import { getTeacherDashboard } from "@/app/actions/teacher";
import { motion } from "framer-motion";
import Link from "next/link";

export default function TeacherPage() {
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [data, setData] = useState<{ subjects: any[], pendingSubmissions: any[] } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
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
        setData({ subjects: result.subjects || [], pendingSubmissions: result.pendingSubmissions || [] });
      }
    } catch (error) {
      console.error("Error al cargar datos del docente:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (authLoading || isLoading) return <div className="p-20 text-center font-bold animate-pulse uppercase tracking-[0.3em] text-primary">Sincronizando con el Aula Virtual...</div>;

  if (!user) { router.push("/login"); return null; }

  if (user?.role !== "teacher") return <div className="p-20 text-center font-bold">Acceso Denegado</div>;

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <header className="mb-12 flex justify-between items-end">
        <div>
          <h1 className="text-6xl font-black tracking-tighter mb-2 uppercase italic leading-none">Panel <span className="text-primary">Docente</span></h1>
          <p className="text-muted-foreground text-[10px] uppercase font-bold tracking-[0.4em] leading-relaxed">
            Gestión Académica • <span className="text-foreground">{user.name}</span>
          </p>
        </div>
        <Link 
          href="/docente/new-challenge"
          className="bg-primary text-primary-foreground px-8 py-5 rounded-[2rem] font-black text-[10px] uppercase tracking-widest flex items-center gap-3 hover:scale-105 transition-all shadow-2xl shadow-primary/30"
        >
          <PlusCircle size={20} />
          Nuevo Desafío
        </Link>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-12">
        <div className="lg:col-span-8 space-y-8">
          {/* Subjects Section */}
          <section className="bg-card border border-border rounded-[3rem] p-10 shadow-sm relative overflow-hidden">
            <h2 className="text-xl font-black mb-10 flex items-center gap-3 italic uppercase text-[10px] tracking-[0.2em] text-primary">
              <BookOpen size={18} />
              Tus Materias Asignadas
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {data?.subjects.map((sub, i) => (
                <div key={i} className="p-10 rounded-[2.5rem] bg-secondary/10 border border-border hover:border-primary/50 transition-all group shadow-sm relative overflow-hidden">
                  <h3 className="font-black text-2xl mb-8 group-hover:text-primary transition-colors pr-8 leading-tight">{sub.name}</h3>
                  <div className="flex gap-10">
                    <div className="flex flex-col">
                      <span className="text-[9px] font-black text-muted-foreground uppercase tracking-[0.2em] mb-2">Alumnos</span>
                      <span className="text-4xl font-black tracking-tighter">{sub.studentsCount}</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[9px] font-black text-muted-foreground uppercase tracking-[0.2em] mb-2">Desafíos</span>
                      <span className="text-4xl font-black tracking-tighter">{sub.challengesCount}</span>
                    </div>
                  </div>
                </div>
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
          <section className="bg-card border border-border rounded-[3rem] p-10 shadow-sm relative overflow-hidden">
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
          <div className="bg-secondary/20 border border-border rounded-[2.5rem] p-8 shadow-sm">
            <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-primary mb-8 flex items-center gap-3">
              <TrendingUp size={16} />
              Rendimiento Grupal
            </h3>
            <div className="space-y-6">
              {[
                { label: "Promedio General", value: "8.4", color: "text-green-500" },
                { label: "Participación", value: "92%", color: "text-blue-500" },
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
