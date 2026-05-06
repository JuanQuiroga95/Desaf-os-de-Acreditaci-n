"use client";

import React from "react";
import { useAuth } from "@/context/AuthContext";
import { PlusCircle, Users, BookOpen, Clock, CheckCircle, ArrowRight } from "lucide-react";

export default function TeacherPage() {
  const { user } = useAuth();

  if (user?.role !== "teacher") {
    return <div className="p-20 text-center font-bold">Acceso Denegado</div>;
  }

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <header className="mb-12 flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-black tracking-tight mb-2">Panel Docente</h1>
          <p className="text-muted-foreground text-lg uppercase text-xs font-bold tracking-widest">
            Gestión Académica - {user.name}
          </p>
        </div>
        <button className="bg-primary text-primary-foreground px-6 py-3 rounded-2xl font-bold flex items-center gap-2 hover:bg-primary/90 transition-all shadow-lg shadow-primary/20">
          <PlusCircle size={20} />
          Nuevo Desafío
        </button>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
        <div className="lg:col-span-2 space-y-8">
          <section className="bg-card border border-border rounded-3xl p-8">
            <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
              <BookOpen className="text-primary" />
              Tus Materias Asignadas
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { name: "Matemática Aplicada", students: 32, tasks: 4 },
                { name: "Lengua y Comunicación", students: 28, tasks: 3 },
              ].map((sub, i) => (
                <div key={i} className="p-6 rounded-2xl bg-secondary/30 border border-border hover:border-primary/50 transition-all group">
                  <h3 className="font-bold text-lg mb-4">{sub.name}</h3>
                  <div className="flex gap-6">
                    <div className="flex flex-col">
                      <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Alumnos</span>
                      <span className="text-xl font-black">{sub.students}</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Desafíos</span>
                      <span className="text-xl font-black">{sub.tasks}</span>
                    </div>
                  </div>
                  <button className="mt-6 w-full py-2 rounded-xl bg-card border border-border text-xs font-bold uppercase tracking-widest hover:bg-primary hover:text-white transition-all flex items-center justify-center gap-2">
                    Gestionar Clase
                    <ArrowRight size={14} />
                  </button>
                </div>
              ))}
            </div>
          </section>

          <section className="bg-card border border-border rounded-3xl p-8">
            <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
              <Clock className="text-primary" />
              Entregas Pendientes de Corrección
            </h2>
            <div className="space-y-4">
              {[
                { student: "Pedro Estudiante", task: "Cálculo de Inflación", date: "Hace 2 horas" },
                { student: "Lucía García", task: "Informe de Auditoría", date: "Hace 5 horas" },
                { student: "Marcos Ruiz", task: "Cálculo de Inflación", date: "Ayer" },
              ].map((entry, i) => (
                <div key={i} className="flex items-center justify-between p-4 bg-secondary/20 rounded-2xl border border-border/50">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center font-bold text-muted-foreground">
                      {entry.student.charAt(0)}
                    </div>
                    <div>
                      <p className="text-sm font-bold">{entry.student}</p>
                      <p className="text-xs text-muted-foreground">{entry.task}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] text-muted-foreground font-bold uppercase mb-2">{entry.date}</p>
                    <button className="text-primary text-xs font-black uppercase tracking-widest hover:underline">Corregir Now</button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>

        <aside className="space-y-6">
          <div className="bg-secondary/50 border border-border rounded-3xl p-6">
            <h3 className="font-bold flex items-center gap-2 mb-4">
              <Users size={18} className="text-primary" />
              Gestión de Alumnos
            </h3>
            <p className="text-xs text-muted-foreground mb-6">
              Registra nuevos alumnos en tus clases o importa una lista desde Excel.
            </p>
            <button className="w-full py-3 bg-card border border-border rounded-xl text-xs font-bold uppercase tracking-widest hover:border-primary/50 transition-all mb-3">
              Cargar Alumno
            </button>
            <button className="w-full py-3 bg-card border border-border rounded-xl text-xs font-bold uppercase tracking-widest hover:border-primary/50 transition-all">
              Importar Lista
            </button>
          </div>

          <div className="bg-green-500/10 border border-green-500/20 rounded-3xl p-6">
            <CheckCircle className="text-green-500 mb-2" size={24} />
            <h3 className="font-bold mb-1">Acreditaciones</h3>
            <p className="text-xs text-muted-foreground">
              4 alumnos han completado todos los desafíos de este trimestre.
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}
