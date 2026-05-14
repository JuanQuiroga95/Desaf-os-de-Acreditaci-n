"use client";

import React, { useEffect, useState, use } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { ArrowLeft, Mail, Calendar, BookOpen, Target, CheckCircle2, Clock, AlertCircle, Award, FileText } from "lucide-react";
import { getStudentLegajo } from "@/app/actions/teacher";
import { motion } from "framer-motion";
import Link from "next/link";

export default function StudentLegajoPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: studentId } = use(params);
  const { user, isLoading: authLoading } = useAuth();
  const [student, setStudent] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    if (user?.role === "teacher") {
      loadData();
    }
  }, [user, studentId]);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const res = await getStudentLegajo(studentId);
      if (res.success) {
        setStudent(res.student);
      }
    } catch (error) {
      console.error("Error cargando legajo:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (authLoading || isLoading) return <div className="p-20 text-center font-black animate-pulse uppercase tracking-widest text-primary">Cargando Legajo...</div>;
  if (!user || user.role !== "teacher") return <div className="p-20 text-center font-black uppercase tracking-widest text-primary">Acceso Denegado</div>;
  if (!student) return <div className="p-20 text-center font-black">Alumno no encontrado</div>;

  const totalChallenges = student.enrollments.reduce((acc: number, e: any) => acc + e.subject.challenges.length, 0);
  const completedChallenges = student.progress.filter((p: any) => p.status === "COMPLETED").length;
  const averageScore = student.progress.filter((p: any) => p.score !== null).reduce((acc: number, p: any) => acc + p.score, 0) / (student.progress.filter((p: any) => p.score !== null).length || 1);

  return (
    <div className="p-8 max-w-7xl mx-auto pb-24">
      <header className="mb-12">
        <Link href="/docente/students" className="flex items-center gap-2 text-primary font-black text-[10px] uppercase tracking-widest mb-4 hover:underline">
          <ArrowLeft size={14} /> Volver a Alumnos
        </Link>
        <div className="flex justify-between items-end">
          <div className="flex items-center gap-8">
            <div className="w-24 h-24 rounded-[2.5rem] bg-secondary flex items-center justify-center text-primary font-black text-4xl shadow-inner">
              {student.name.charAt(0)}
            </div>
            <div>
              <h1 className="text-5xl font-black tracking-tighter uppercase italic leading-none">{student.name}</h1>
              <div className="flex items-center gap-6 mt-3">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Mail size={14} />
                  <span className="text-xs font-bold">{student.email}</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Calendar size={14} />
                  <span className="text-xs font-bold uppercase tracking-widest">Ingreso: {new Date(student.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          </div>
          <div className="text-right">
            <span className="text-[10px] font-black text-primary uppercase tracking-widest">Legajo Académico</span>
            <p className="text-2xl font-black italic uppercase">ACTIVO</p>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Stats and Subject Progress */}
        <div className="lg:col-span-8 space-y-8">
          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-primary/10 border border-primary/20 rounded-[2rem] p-6 shadow-sm">
              <p className="text-[10px] font-black text-primary uppercase tracking-widest mb-2">Desafíos Completos</p>
              <p className="text-4xl font-black italic">{completedChallenges} <span className="text-xl text-primary/60">/ {totalChallenges}</span></p>
            </div>
            <div className="bg-secondary/20 border border-border rounded-[2rem] p-6 shadow-sm">
              <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-2">Promedio Global</p>
              <p className="text-4xl font-black italic">{averageScore.toFixed(1)} <span className="text-xl text-muted-foreground/60">/ 10</span></p>
            </div>
            <div className="bg-secondary/20 border border-border rounded-[2rem] p-6 shadow-sm">
              <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-2">Materias</p>
              <p className="text-4xl font-black italic">{student.enrollments.length}</p>
            </div>
          </div>

          {/* Subject Detail */}
          <section className="bg-card border border-border rounded-[3rem] p-10 shadow-sm">
            <h2 className="text-xl font-black mb-8 flex items-center gap-3 italic uppercase text-[10px] tracking-[0.2em] text-primary">
              <BookOpen size={18} />
              Seguimiento por Materia
            </h2>
            <div className="space-y-6">
              {student.enrollments.map((e: any) => (
                <div key={e.id} className="p-8 rounded-[2.5rem] bg-secondary/10 border border-border">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="font-black text-2xl italic uppercase text-primary">{e.subject.name}</h3>
                    <span className="text-[10px] font-black uppercase tracking-widest bg-primary/10 text-primary px-3 py-1 rounded-full border border-primary/20">
                      En Curso
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {e.subject.challenges.map((c: any, i: number) => {
                      const prog = c.progress[0];
                      const isDone = prog?.status === "COMPLETED";
                      const isGraded = isDone && prog?.score !== null;
                      
                      return (
                        <div key={c.id} className={`p-4 rounded-2xl border flex flex-col items-center text-center ${
                          isGraded ? "bg-green-500/10 border-green-500/20" : 
                          isDone ? "bg-primary/10 border-primary/20" : 
                          "bg-card border-border opacity-50"
                        }`}>
                          <p className="text-[8px] font-black uppercase tracking-widest text-muted-foreground mb-2">Encuentro {i + 1}</p>
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 ${
                            isGraded ? "bg-green-500 text-white" : 
                            isDone ? "bg-primary text-white" : 
                            "bg-secondary text-muted-foreground"
                          }`}>
                            {isGraded ? <Award size={20} /> : isDone ? <CheckCircle2 size={20} /> : <Clock size={20} />}
                          </div>
                          <p className="text-[9px] font-black uppercase leading-tight line-clamp-1">{c.title}</p>
                          {isGraded && <p className="mt-2 text-lg font-black text-green-600">{prog.score}/10</p>}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* Right Column: Activity Feed */}
        <aside className="lg:col-span-4 space-y-8">
          <div className="bg-secondary/20 border border-border rounded-[2.5rem] p-8 shadow-sm">
            <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-primary mb-8 flex items-center gap-3">
              <Clock size={16} />
              Actividad Reciente
            </h3>
            <div className="space-y-6">
              {student.progress.length === 0 ? (
                <p className="text-[10px] text-muted-foreground uppercase font-black text-center py-8">Sin actividad registrada</p>
              ) : (
                student.progress.slice(0, 8).map((p: any) => (
                  <div key={p.id} className="relative pl-6 border-l-2 border-primary/20 pb-2 last:pb-0">
                    <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-primary flex items-center justify-center border-4 border-background shadow-sm" />
                    <p className="text-[9px] font-black uppercase tracking-widest text-primary mb-1">
                      {new Date(p.updatedAt).toLocaleDateString()}
                    </p>
                    <p className="text-sm font-bold leading-tight mb-1">{p.challenge.title}</p>
                    <p className="text-[10px] text-muted-foreground uppercase font-black tracking-widest">
                      {p.status === "COMPLETED" ? (p.score ? `Calificado: ${p.score}/10` : "Enviado / Pendiente") : "En curso"}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="bg-card border border-border rounded-[2.5rem] p-8 shadow-sm">
            <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-primary mb-6 flex items-center gap-3">
              <FileText size={16} />
              Notas del Alumno
            </h3>
            <div className="space-y-4">
              <div className="p-4 bg-secondary/30 rounded-2xl border border-border">
                <p className="text-[10px] font-black uppercase text-muted-foreground mb-2 flex items-center gap-2">
                  <AlertCircle size={12} /> Desafíos Críticos
                </p>
                <p className="text-[9px] font-bold text-muted-foreground">No se registran alertas de bajo rendimiento.</p>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
