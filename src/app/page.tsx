// Build trigger: 2026-05-06 22:06
"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Play, BookOpen } from "lucide-react";
import { getStudentDashboard } from "@/app/actions/student";

export default function StudentDashboard() {
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [data, setData] = useState<{ subjects: any[], globalProgress: number } | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user?.role === "student") {
      loadData();
    } else if (user) {
      setIsLoading(false);
    }
  }, [user]);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const result = await getStudentDashboard(user!.id);
      if (result.success) {
        setData({ subjects: result.subjects || [], globalProgress: result.globalProgress || 0 });
      } else {
        console.error("Error al cargar dashboard:", result);
      }
    } catch (error) {
      console.error("Falla crítica en loadData:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const Spinner = () => (
    <div className="p-20 text-center flex flex-col items-center justify-center min-h-[60vh]">
      <div className="font-black animate-pulse uppercase tracking-[0.3em] text-primary mb-8 text-xl italic">
        Cargando tu Aula Virtual...
      </div>
    </div>
  );

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    } else if (!authLoading && user?.role === "admin") {
      router.push("/admin");
    } else if (!authLoading && user?.role === "teacher") {
      router.push("/docente");
    }
  }, [authLoading, user, router]);

  if (authLoading) return <Spinner />;
  if (!user || user.role === "admin" || user.role === "teacher") return <Spinner />;

  if (isLoading) return <Spinner />;

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <header className="mb-12">
        <h1 className="text-6xl font-black tracking-tighter mb-4 italic uppercase leading-none">
          Mis Materias <br /><span className="text-primary">Asignadas</span>
        </h1>
        <div className="flex items-center gap-6">
          <p className="text-muted-foreground text-xs uppercase font-bold tracking-[0.3em]">
            Orientación Economía y Administración • Ciclo 2026
          </p>
          <div className="h-px flex-1 bg-border/50" />
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {data?.subjects.map((sub) => {
          const isLocked = sub.status === "locked";
          return (
            <div
              key={sub.id}
              className={`group relative overflow-hidden rounded-[3rem] border transition-all duration-500 ${
                isLocked
                  ? "border-border/50 bg-secondary/10 grayscale"
                  : "border-border bg-card hover:border-primary/50 hover:shadow-2xl hover:shadow-primary/10 shadow-sm"
              }`}
            >
              <div className="p-10 flex flex-col h-full relative z-10">
                <div className="flex justify-between items-start mb-8">
                  <div className="w-14 h-14 bg-primary/10 rounded-[1.25rem] flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all duration-300">
                    <BookOpen size={28} />
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] font-black text-primary uppercase tracking-widest">{sub.progress}% Completado</span>
                    <div className="w-24 h-1.5 bg-secondary rounded-full mt-2 overflow-hidden">
                      <div className="bg-primary h-full transition-all duration-1000" style={{ width: `${sub.progress}%` }} />
                    </div>
                  </div>
                </div>

                <h2 className="text-2xl font-black tracking-tight mb-4 group-hover:text-primary transition-colors leading-tight">{sub.name}</h2>
                <p className="text-muted-foreground text-sm mb-10 leading-relaxed opacity-80 font-medium h-12 overflow-hidden line-clamp-2">
                  {sub.description || "Iniciando ciclo de acreditación técnica."}
                </p>

                <div className="mt-auto space-y-6">
                  <div className="flex gap-2">
                    <span className="px-3 py-1.5 rounded-xl bg-secondary text-[9px] font-black text-muted-foreground uppercase tracking-widest border border-border/50">
                      Econ-Plus
                    </span>
                    <span className="px-3 py-1.5 rounded-xl bg-secondary text-[9px] font-black text-muted-foreground uppercase tracking-widest border border-border/50">
                      Trimestre I
                    </span>
                  </div>

                  <Link
                    href={`/subjects/${sub.id}`}
                    className="w-full bg-primary text-primary-foreground py-5 rounded-[1.5rem] font-black text-[10px] uppercase tracking-[0.2em] flex items-center justify-center gap-3 hover:scale-[1.02] transition-all shadow-xl shadow-primary/20"
                  >
                    <Play size={16} fill="currentColor" />
                    Ingresar a la Sala
                  </Link>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
