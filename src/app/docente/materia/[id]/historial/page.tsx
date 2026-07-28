"use client";

import React, { useEffect, useState, use } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { getSubjectHistory } from "@/app/actions/history";
import { getAllSubjects } from "@/app/actions/admin";
import Link from "next/link";
import { ArrowLeft, Clock, Activity } from "lucide-react";

export default function HistorialMateriaPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: subjectId } = use(params);
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();

  const [history, setHistory] = useState<any[]>([]);
  const [subject, setSubject] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user?.role === "teacher" || user?.role === "admin") {
      loadData();
    }
  }, [user, subjectId]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [historyRes, subjectsRes] = await Promise.all([
        getSubjectHistory(subjectId),
        getAllSubjects()
      ]);
      
      if (historyRes.success) {
        setHistory(historyRes.history || []);
      }
      
      if (subjectsRes) {
        const found = subjectsRes.find((s: any) => s.id === subjectId);
        setSubject(found || null);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  if (authLoading || isLoading) return <div className="p-20 text-center font-bold animate-pulse uppercase tracking-widest text-primary">Cargando Historial...</div>;
  if (!user || (user.role !== "teacher" && user.role !== "admin")) { router.push("/login"); return null; }

  return (
    <div className="p-8 max-w-5xl mx-auto pb-24">
      <header className="mb-12">
        <Link href={`/docente/materiales/${subjectId}`} className="flex items-center gap-2 text-primary font-black text-[10px] uppercase tracking-widest mb-4 hover:underline">
          <ArrowLeft size={14} /> Volver a Materiales
        </Link>
        <div>
          <h1 className="text-5xl font-black tracking-tighter uppercase italic leading-none mb-2">
            Historial de <span className="text-primary">Cambios</span>
          </h1>
          <p className="text-muted-foreground text-[10px] uppercase font-bold tracking-[0.4em]">
            Materia: {subject?.name || "Cargando..."}
          </p>
        </div>
      </header>

      <section className="bg-card border border-border rounded-[2.5rem] overflow-hidden shadow-sm">
        <div className="p-8 border-b border-border flex items-center gap-3 bg-secondary/10">
          <Clock size={20} className="text-primary" />
          <h2 className="font-black italic uppercase text-xs tracking-widest">
            Registro de Actividad Reciente
          </h2>
        </div>
        
        {history.length === 0 ? (
          <div className="p-16 text-center">
            <Activity className="mx-auto mb-4 opacity-20 text-primary" size={48} />
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground">
              No hay cambios registrados todavía.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {history.map((log) => (
              <div key={log.id} className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-secondary/20 transition-colors">
                <div>
                  <p className="font-bold text-lg mb-1">{log.details}</p>
                  <p className="text-[10px] text-muted-foreground uppercase font-black tracking-widest">
                    Acción por: <span className="text-foreground">{log.teacher.name}</span>
                  </p>
                </div>
                <div className="shrink-0 text-right">
                  <p className="text-[10px] text-muted-foreground uppercase font-black tracking-widest">
                    {new Date(log.createdAt).toLocaleString("es-AR", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit"
                    })}
                  </p>
                  <span className="inline-block mt-2 text-[8px] px-2 py-1 rounded bg-secondary text-muted-foreground border border-border font-black uppercase tracking-widest">
                    {log.action}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
