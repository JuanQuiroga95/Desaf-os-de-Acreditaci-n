"use client";

import React from "react";
import { Trophy, Star, Medal } from "lucide-react";

export default function LogrosPage() {
  return (
    <div className="p-8 max-w-7xl mx-auto text-center py-20">
      <div className="w-20 h-20 bg-yellow-500/10 text-yellow-500 rounded-full flex items-center justify-center mx-auto mb-8">
        <Trophy size={40} />
      </div>
      <h1 className="text-4xl font-black tracking-tight mb-4">Tus Logros Académicos</h1>
      <p className="text-muted-foreground max-w-md mx-auto mb-12 uppercase text-xs font-bold tracking-widest leading-relaxed">
        Acá aparecerán todas las insignias y certificaciones que obtengas al completar tus desafíos.
      </p>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto opacity-30 grayscale">
        {[
          { label: "Primer Paso", icon: Star },
          { label: "Analista Pro", icon: Medal },
          { label: "Excelencia", icon: Trophy },
          { label: "Eco-Líder", icon: Star },
        ].map((logro, i) => {
          const Icon = logro.icon;
          return (
            <div key={i} className="bg-card border border-border p-8 rounded-3xl flex flex-col items-center">
              <Icon size={32} className="mb-4" />
              <span className="text-[10px] font-bold uppercase tracking-widest">{logro.label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
