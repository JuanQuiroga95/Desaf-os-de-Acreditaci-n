"use client";

import React, { useEffect, useState, useRef } from "react";
import { BookOpen, Search, Filter, ArrowRight, TrendingUp, CheckCircle2, ChevronDown } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { getAllSubjects } from "@/app/actions/admin";
import { getAllChallengesWithProgress } from "@/app/actions/student";
import Link from "next/link";

type ChallengeType = "REGULAR" | "DIAGNOSTICO" | "AUTOEVALUACION";

const TYPE_LABELS: Record<ChallengeType, string> = {
  REGULAR: "Regular",
  DIAGNOSTICO: "Diagnóstico",
  AUTOEVALUACION: "Autoevaluación",
};

const TYPE_COLORS: Record<ChallengeType, string> = {
  DIAGNOSTICO: "bg-orange-500/20 text-orange-400 border-orange-500/30",
  AUTOEVALUACION: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  REGULAR: "bg-green-500/20 text-green-400 border-green-500/30",
};

const FILTER_OPTIONS = [
  { value: "ALL", label: "Todos los tipos" },
  { value: "REGULAR", label: "Solo REGULAR" },
  { value: "DIAGNOSTICO", label: "Solo DIAGNOSTICO" },
  { value: "AUTOEVALUACION", label: "Solo AUTOEVALUACION" },
] as const;

export default function DesafiosPage() {
  const { user } = useAuth();
  const [subjects, setSubjects] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadingMessage, setLoadingMessage] = useState("Cargando Desafíos...");
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState<"ALL" | ChallengeType>("ALL");
  const [filterOpen, setFilterOpen] = useState(false);
  const filterRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadData();
  }, [user]);

  useEffect(() => {
    const messages = ["Buscando desafíos...", "Preparando la arena...", "Cargando competencias...", "Afilando los lápices..."];
    let i = Math.floor(Math.random() * messages.length);
    setLoadingMessage(messages[i]);
    const interval = setInterval(() => {
      i = (i + 1) % messages.length;
      setLoadingMessage(messages[i]);
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    if (user?.role === "STUDENT") {
      const result = await getAllChallengesWithProgress(user.id);
      setSubjects(result.subjects);
    } else {
      const result = await getAllSubjects();
      setSubjects(result);
    }
    setIsLoading(false);
  };

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (filterRef.current && !filterRef.current.contains(e.target as Node)) {
        setFilterOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const allChallenges = subjects.flatMap((s) =>
    (s.challenges || []).map((c: any) => ({ ...c, subjectId: s.id, subjectName: s.name }))
  );

  const filtered = allChallenges.filter((c) => {
    const matchesSearch =
      !searchTerm ||
      c.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.objective?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === "ALL" || c.type === typeFilter;
    return matchesSearch && matchesType;
  });

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <header className="mb-12">
        <h1 className="text-6xl font-black tracking-tighter mb-4 uppercase italic leading-none">
          Explorador de <span className="text-primary">Desafíos</span>
        </h1>
        <div className="flex items-center gap-6">
          <p className="text-muted-foreground text-[10px] uppercase font-bold tracking-[0.3em]">
            Encontrá nuevos retos para acreditar tus competencias técnicas
          </p>
          <div className="h-px flex-1 bg-border/50" />
        </div>
      </header>

      <div className="flex gap-4 mb-12">
        <div className="flex-1 relative">
          <Search className="absolute left-6 top-5 text-muted-foreground" size={20} />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por materia, tema o competencia..."
            className="w-full bg-card border border-border rounded-[2rem] py-5 px-16 focus:outline-none focus:ring-2 focus:ring-primary/50 font-medium shadow-sm"
          />
        </div>

        {/* Filter dropdown */}
        <div ref={filterRef} className="relative">
          <button
            onClick={() => setFilterOpen((v) => !v)}
            className="px-10 py-5 bg-secondary rounded-[2rem] border border-border font-black text-[10px] uppercase tracking-widest flex items-center gap-3 hover:bg-border transition-all"
          >
            <Filter size={18} />
            {typeFilter === "ALL" ? "Filtros" : TYPE_LABELS[typeFilter as ChallengeType]}
            <ChevronDown size={14} className={`transition-transform ${filterOpen ? "rotate-180" : ""}`} />
          </button>

          {filterOpen && (
            <div className="absolute right-0 top-full mt-2 z-50 bg-card border border-border rounded-[1.5rem] shadow-2xl overflow-hidden min-w-[220px]">
              {FILTER_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => { setTypeFilter(opt.value as "ALL" | ChallengeType); setFilterOpen(false); }}
                  className={`w-full px-6 py-3 text-left text-[10px] font-black uppercase tracking-widest transition-all hover:bg-secondary ${
                    typeFilter === opt.value ? "text-primary bg-primary/5" : "text-foreground"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filtered.map((challenge: any) => {
          const isCompleted =
            user?.role === "STUDENT" &&
            challenge.progress?.length > 0 &&
            challenge.progress[0].status === "COMPLETED";
          const challengeType: ChallengeType = challenge.type as ChallengeType;

          return (
            <div
              key={challenge.id}
              className="group bg-card border border-border p-10 rounded-[2.5rem] hover:border-primary/50 transition-all shadow-sm hover:shadow-2xl hover:shadow-primary/5 flex flex-col"
            >
              <div className="flex justify-between items-start mb-8">
                <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all">
                  <TrendingUp size={24} />
                </div>
                <div className="flex items-center gap-2 flex-wrap justify-end">
                  {/* Type badge */}
                  <span
                    className={`text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-full border ${
                      TYPE_COLORS[challengeType] || "bg-secondary text-muted-foreground border-border"
                    }`}
                  >
                    {TYPE_LABELS[challengeType] || challenge.type}
                  </span>
                  {/* Completion badge (students only) */}
                  {user?.role === "STUDENT" && (
                    isCompleted ? (
                      <span className="text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-full border bg-green-500/20 text-green-400 border-green-500/30 flex items-center gap-1">
                        <CheckCircle2 size={10} />
                        Completado
                      </span>
                    ) : (
                      <span className="text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-full border bg-secondary text-muted-foreground border-border">
                        Pendiente
                      </span>
                    )
                  )}
                </div>
              </div>
              <h3 className="text-2xl font-black mb-4 leading-tight group-hover:text-primary transition-colors">
                {challenge.title}
              </h3>
              <p className="text-sm text-muted-foreground mb-10 leading-relaxed font-medium line-clamp-3">
                {challenge.objective}
              </p>

              <div className="mt-auto pt-8 border-t border-border/50 flex items-center justify-between">
                <span className={`text-[10px] font-black uppercase tracking-widest ${isCompleted ? "text-green-400" : "text-primary"}`}>
                  {isCompleted ? "Finalizado" : "Disponible"}
                </span>
                <Link
                  href={`/subjects/${challenge.subjectId}`}
                  className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] group-hover:translate-x-2 transition-transform"
                >
                  {isCompleted ? "Ver Materia" : "Comenzar Reto"}
                  <ArrowRight size={14} />
                </Link>
              </div>
            </div>
          );
        })}

        {isLoading && (
          <>
            <div className="col-span-full mb-8 text-center animate-pulse">
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-primary">{loadingMessage}</p>
            </div>
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="bg-card border border-border p-10 rounded-[2.5rem] animate-pulse">
                <div className="w-14 h-14 bg-muted rounded-2xl mb-8" />
                <div className="h-8 bg-muted rounded-lg w-3/4 mb-4" />
                <div className="h-4 bg-muted rounded-lg w-full mb-2" />
                <div className="h-4 bg-muted rounded-lg w-5/6" />
              </div>
            ))}
          </>
        )}

        {!isLoading && filtered.length === 0 && (
          <div className="col-span-full p-20 text-center border-2 border-dashed border-border rounded-[3rem] opacity-50">
            <BookOpen className="mx-auto mb-6 opacity-20" size={60} />
            <p className="text-xl font-black uppercase tracking-widest italic">
              {allChallenges.length === 0 ? "No hay desafíos publicados" : "Sin resultados"}
            </p>
            <p className="text-sm text-muted-foreground mt-4 font-medium">
              {allChallenges.length === 0
                ? "Los docentes aún están diseñando los retos para este ciclo."
                : "Probá con otros términos o quitá los filtros."}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
