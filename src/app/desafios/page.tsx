"use client";

import React, { useEffect, useState } from "react";
import { BookOpen, Search, Filter, ArrowRight, TrendingUp } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { getAllSubjects } from "@/app/actions/admin";

export default function DesafiosPage() {
  const { user } = useAuth();
  const [subjects, setSubjects] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    const result = await getAllSubjects();
    setSubjects(result);
    setIsLoading(false);
  };

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <header className="mb-12">
        <h1 className="text-6xl font-black tracking-tighter mb-4 uppercase italic leading-none">Explorador de <span className="text-primary">Desafíos</span></h1>
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
            placeholder="Buscar por materia, tema o competencia..."
            className="w-full bg-card border border-border rounded-[2rem] py-5 px-16 focus:outline-none focus:ring-2 focus:ring-primary/50 font-medium shadow-sm"
          />
        </div>
        <button className="px-10 py-5 bg-secondary rounded-[2rem] border border-border font-black text-[10px] uppercase tracking-widest flex items-center gap-3 hover:bg-border transition-all">
          <Filter size={18} />
          Filtros Avanzados
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {subjects.flatMap(s => s.challenges).map((challenge, i) => (
          <div key={challenge.id} className="group bg-card border border-border p-10 rounded-[2.5rem] hover:border-primary/50 transition-all shadow-sm hover:shadow-2xl hover:shadow-primary/5 flex flex-col">
            <div className="flex justify-between items-start mb-8">
              <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all">
                <TrendingUp size={24} />
              </div>
              <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground px-3 py-1 bg-secondary rounded-full">Nivel 1</span>
            </div>
            <h3 className="text-2xl font-black mb-4 leading-tight group-hover:text-primary transition-colors">{challenge.title}</h3>
            <p className="text-sm text-muted-foreground mb-10 leading-relaxed font-medium line-clamp-3">{challenge.objective}</p>
            
            <div className="mt-auto pt-8 border-t border-border/50 flex items-center justify-between">
              <span className="text-[10px] font-black uppercase tracking-widest text-primary">Disponible</span>
              <button className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] group-hover:translate-x-2 transition-transform">
                Comenzar Reto
                <ArrowRight size={14} />
              </button>
            </div>
          </div>
        ))}
        {subjects.flatMap(s => s.challenges).length === 0 && !isLoading && (
          <div className="col-span-full p-20 text-center border-2 border-dashed border-border rounded-[3rem] opacity-50">
            <BookOpen className="mx-auto mb-6 opacity-20" size={60} />
            <p className="text-xl font-black uppercase tracking-widest italic">No hay desafíos publicados</p>
            <p className="text-sm text-muted-foreground mt-4 font-medium">Los docentes aún están diseñando los retos para este ciclo.</p>
          </div>
        )}
      </div>
    </div>
  );
}
