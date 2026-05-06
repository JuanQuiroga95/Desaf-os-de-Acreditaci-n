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
        <h1 className="text-4xl font-extrabold tracking-tight mb-2 italic uppercase">Mis Materias Asignadas</h1>
        <p className="text-muted-foreground text-lg uppercase text-xs font-bold tracking-widest">
          Orientación Economía - Ciclo de Acreditación 2026
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {subjects.map((sub, index) => {
          const Icon = sub.icon;
          const isLocked = sub.status === "locked";
          return (
            <div 
              key={sub.id}
              className={`group relative overflow-hidden rounded-3xl border transition-all duration-300 ${
                isLocked 
                  ? "border-border/50 bg-secondary/20 grayscale" 
                  : "border-border bg-card hover:border-primary/50 hover:shadow-2xl hover:shadow-primary/5 shadow-sm"
              }`}
            >
              <div className="p-8 flex flex-col h-full relative z-10">
                <div className="flex justify-between items-start mb-6">
                  <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                    <Icon size={24} />
                  </div>
                  {isLocked ? <Lock size={18} className="text-muted-foreground" /> : <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />}
                </div>

                <h2 className="text-2xl font-bold tracking-tight mb-2">{sub.titulo}</h2>
                <p className="text-muted-foreground text-sm mb-6 leading-relaxed">
                  {sub.objetivo_tecnico}
                </p>

                <div className="mt-auto space-y-4">
                  <div className="flex gap-2">
                    <span className="px-3 py-1 rounded-full bg-secondary text-[10px] font-bold text-muted-foreground uppercase border border-border">
                      Econ-Plus
                    </span>
                    <span className="px-3 py-1 rounded-full bg-secondary text-[10px] font-bold text-muted-foreground uppercase border border-border">
                      Acreditación
                    </span>
                  </div>

                  <div className="flex gap-3">
                    {isLocked ? (
                      <button disabled className="flex-1 bg-muted text-muted-foreground py-3 rounded-xl font-bold text-xs uppercase cursor-not-allowed">
                        Pendiente Asignación
                      </button>
                    ) : (
                      <>
                        <Link 
                          href={`/${sub.id}`}
                          className="flex-1 bg-primary text-primary-foreground py-3 rounded-xl font-bold text-xs uppercase flex items-center justify-center gap-2 hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20"
                        >
                          <Play size={14} fill="currentColor" />
                          Ingresar Sala
                        </Link>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
