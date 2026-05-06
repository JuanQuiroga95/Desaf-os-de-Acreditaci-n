"use client";

import React from "react";
import { BookOpen, ExternalLink, Play, Lock, Calculator, MessageSquare, Leaf } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";

const subjects = [
  {
    id: "matematica",
    titulo: "Matemática Aplicada",
    objetivo_tecnico: "Análisis de proyecciones financieras y cálculo de interés real vs inflación.",
    simulador: "https://www.google.com/finance",
    icon: Calculator,
    status: "active"
  },
  {
    id: "lengua",
    titulo: "Lengua y Comunicación",
    objetivo_tecnico: "Desarrollo de redacción comercial y análisis crítico de discursos económicos.",
    simulador: "#",
    icon: MessageSquare,
    status: "active"
  },
  {
    id: "biologia",
    titulo: "Biología y Desarrollo",
    objetivo_tecnico: "Impacto ambiental de modelos económicos y sustentabilidad regional.",
    simulador: "#",
    icon: Leaf,
    status: "locked"
  }
];

export default function StudentDashboard() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  if (isLoading) return null;
  
  if (!user) {
    router.push("/login");
    return null;
  }

  // Redirect teachers and admins to their respective dashboards
  if (user.role === "admin") {
    router.push("/admin");
    return null;
  }
  if (user.role === "teacher") {
    router.push("/docente");
    return null;
  }

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <header className="mb-12">
        <h1 className="text-5xl font-black tracking-tighter mb-3 italic uppercase leading-none">
          Mis Materias <br /><span className="text-primary">Asignadas</span>
        </h1>
        <div className="flex items-center gap-4">
          <p className="text-muted-foreground text-sm uppercase font-bold tracking-[0.2em]">
            Orientación Economía y Administración
          </p>
          <div className="h-px flex-1 bg-border" />
          <p className="text-muted-foreground text-sm font-bold uppercase tracking-widest">
            Ciclo 2026
          </p>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {subjects.map((sub, index) => {
          const Icon = sub.icon;
          const isLocked = sub.status === "locked";
          return (
            <div 
              key={sub.id}
              className={`group relative overflow-hidden rounded-[2.5rem] border transition-all duration-500 ${
                isLocked 
                  ? "border-border/50 bg-secondary/10 grayscale" 
                  : "border-border bg-card hover:border-primary/50 hover:shadow-2xl hover:shadow-primary/5 shadow-sm"
              }`}
            >
              <div className="p-10 flex flex-col h-full relative z-10">
                <div className="flex justify-between items-start mb-8">
                  <div className="w-14 h-14 bg-primary/10 rounded-[1.25rem] flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300">
                    <Icon size={28} />
                  </div>
                  {isLocked ? (
                    <div className="px-3 py-1 rounded-full bg-muted text-[10px] font-bold uppercase text-muted-foreground border border-border">
                      Bloqueado
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold text-green-500 uppercase tracking-widest">Disponible</span>
                      <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                    </div>
                  )}
                </div>

                <h2 className="text-2xl font-bold tracking-tight mb-3 group-hover:text-primary transition-colors">{sub.titulo}</h2>
                <p className="text-muted-foreground text-sm mb-8 leading-relaxed opacity-80">
                  {sub.objetivo_tecnico}
                </p>

                <div className="mt-auto space-y-6">
                  <div className="flex gap-2">
                    <span className="px-3 py-1 rounded-lg bg-secondary text-[10px] font-bold text-muted-foreground uppercase tracking-widest border border-border">
                      Econ-Plus
                    </span>
                    <span className="px-3 py-1 rounded-lg bg-secondary text-[10px] font-bold text-muted-foreground uppercase tracking-widest border border-border">
                      Trimestre I
                    </span>
                  </div>

                  {isLocked ? (
                    <button disabled className="w-full bg-muted/50 text-muted-foreground py-4 rounded-2xl font-bold text-xs uppercase tracking-widest cursor-not-allowed border border-border/50">
                      Pendiente de Asignación
                    </button>
                  ) : (
                    <Link 
                      href={`/${sub.id}`}
                      className="w-full bg-primary text-primary-foreground py-4 rounded-2xl font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-primary/90 transition-all shadow-lg shadow-primary/20"
                    >
                      <Play size={14} fill="currentColor" />
                      Ingresar a la Sala
                    </Link>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
