import React from "react";
import { BookOpen, ExternalLink, Play, Lock } from "lucide-react";
import Link from "next/link";
import fs from "fs";
import path from "path";

export default function DashboardPage() {
  const materiasPath = path.join(process.cwd(), "materias.json");
  const materias = JSON.parse(fs.readFileSync(materiasPath, "utf8"));

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <header className="mb-12">
        <h1 className="text-4xl font-extrabold tracking-tight mb-2">Visualización de Desafíos</h1>
        <p className="text-muted-foreground text-lg">
          Bienvenido, cadete técnico. Tu misión es acreditar las competencias del taller.
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {materias.map((materia: any, index: number) => {
          const isLocked = index > 1; // Simulation: unlock first 2
          return (
            <div 
              key={materia.temporada}
              className={`group relative overflow-hidden rounded-3xl border transition-all duration-300 ${
                isLocked 
                  ? "border-border/50 bg-secondary/20 grayscale" 
                  : "border-border bg-card hover:border-primary/50 hover:shadow-2xl hover:shadow-primary/5 shadow-sm"
              }`}
            >
              {/* Background Glow */}
              <div className="absolute -right-20 -top-20 w-64 h-64 bg-primary/5 rounded-full blur-3xl group-hover:bg-primary/10 transition-colors" />

              <div className="p-8 flex flex-col h-full relative z-10">
                <div className="flex justify-between items-start mb-6">
                  <div className="flex flex-col">
                    <span className="text-primary text-xs font-bold uppercase tracking-widest mb-1">
                      Temporada {materia.temporada}
                    </span>
                    <h2 className="text-2xl font-bold tracking-tight">{materia.titulo}</h2>
                  </div>
                  {isLocked ? (
                    <div className="p-2 bg-muted rounded-xl text-muted-foreground">
                      <Lock size={20} />
                    </div>
                  ) : (
                    <div className="p-2 bg-primary/10 rounded-xl text-primary">
                      <BookOpen size={20} />
                    </div>
                  )}
                </div>

                <p className="text-muted-foreground mb-6 line-clamp-2 leading-relaxed">
                  {materia.objetivo_tecnico}
                </p>

                <div className="mt-auto space-y-4">
                  <div className="flex flex-wrap gap-2">
                    <span className="px-3 py-1 rounded-full bg-secondary text-[10px] font-bold text-muted-foreground uppercase border border-border">
                      Workshop
                    </span>
                    <span className="px-3 py-1 rounded-full bg-secondary text-[10px] font-bold text-muted-foreground uppercase border border-border">
                      Simulación
                    </span>
                  </div>

                  <div className="flex gap-3">
                    {isLocked ? (
                      <button disabled className="flex-1 bg-muted text-muted-foreground py-3 rounded-xl font-bold flex items-center justify-center gap-2 cursor-not-allowed">
                        Bloqueado
                      </button>
                    ) : (
                      <>
                        <Link 
                          href={index === 0 ? "/clase-1" : "#"}
                          className="flex-1 bg-primary text-primary-foreground py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20"
                        >
                          <Play size={18} fill="currentColor" />
                          Iniciar Desafío
                        </Link>
                        <a 
                          href={materia.simulador}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-4 bg-secondary text-foreground py-3 rounded-xl font-bold flex items-center justify-center border border-border hover:bg-muted transition-colors"
                          title="Abrir Simulador"
                        >
                          <ExternalLink size={18} />
                        </a>
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
