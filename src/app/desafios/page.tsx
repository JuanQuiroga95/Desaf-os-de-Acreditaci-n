"use client";

import React from "react";
import { BookOpen, Search, Filter } from "lucide-react";

export default function DesafiosPage() {
  return (
    <div className="p-8 max-w-7xl mx-auto">
      <header className="mb-12">
        <h1 className="text-4xl font-extrabold tracking-tight mb-2 uppercase italic">Explorador de Desafíos</h1>
        <p className="text-muted-foreground text-lg uppercase text-xs font-bold tracking-widest">
          Encontrá nuevos retos para acreditar tus competencias
        </p>
      </header>

      <div className="flex gap-4 mb-8">
        <div className="flex-1 relative">
          <Search className="absolute left-4 top-3.5 text-muted-foreground" size={18} />
          <input 
            type="text" 
            placeholder="Buscar por materia o tema..."
            className="w-full bg-card border border-border rounded-2xl py-3.5 px-12 focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
        </div>
        <button className="px-6 py-3 bg-secondary rounded-2xl border border-border font-bold text-sm flex items-center gap-2">
          <Filter size={18} />
          Filtros
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="bg-card border border-border p-6 rounded-3xl opacity-50 cursor-not-allowed">
            <div className="w-10 h-10 bg-secondary rounded-xl mb-4 flex items-center justify-center text-muted-foreground">
              <BookOpen size={20} />
            </div>
            <h3 className="font-bold mb-2">Desafío Próximamente</h3>
            <p className="text-xs text-muted-foreground">Este contenido estará disponible en la próxima etapa del ciclo lectivo.</p>
          </div>
        ))}
      </div>
    </div>
  );
}
