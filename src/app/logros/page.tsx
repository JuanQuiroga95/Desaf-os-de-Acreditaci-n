"use client";

import React from "react";
import { Award, Star, Zap, Target, Shield, Trophy, CheckCircle2 } from "lucide-react";
import { motion } from "framer-motion";

export default function LogrosPage() {
  const achievements = [
    { id: 1, title: "Maestro del Interés", desc: "Completaste tu primer cálculo de inflación sin errores.", icon: Zap, color: "text-yellow-500", locked: false },
    { id: 2, title: "Auditor Junior", desc: "Presentaste 5 informes de viabilidad con éxito.", icon: Shield, color: "text-blue-500", locked: true },
    { id: 3, title: "Líder de Proyecto", desc: "Coordinaste una simulación de micro-empresa.", icon: Target, color: "text-red-500", locked: true },
    { id: 4, title: "Excelencia Videla", desc: "Obtuviste un promedio superior a 9.0 en el trimestre.", icon: Trophy, color: "text-purple-500", locked: true },
  ];

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <header className="mb-16">
        <h1 className="text-6xl font-black tracking-tighter mb-4 uppercase italic leading-none">Tus <span className="text-primary">Logros</span></h1>
        <div className="flex items-center gap-6">
          <p className="text-muted-foreground text-[10px] font-black uppercase tracking-[0.3em]">
            Reconocimientos a tu desempeño y competencias técnicas
          </p>
          <div className="h-px flex-1 bg-border/50" />
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {achievements.map((a, i) => (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            key={a.id} 
            className={`group p-10 rounded-[2.5rem] border flex flex-col items-center text-center transition-all duration-500 ${
              a.locked 
                ? "bg-secondary/10 border-border/50 opacity-40 grayscale shadow-inner" 
                : "bg-card border-border hover:border-primary/50 shadow-sm hover:shadow-2xl hover:shadow-primary/5"
            }`}
          >
            <div className={`w-24 h-24 rounded-[2rem] flex items-center justify-center mb-8 transition-transform group-hover:scale-110 ${
              a.locked ? "bg-muted text-muted-foreground" : "bg-primary/10 " + a.color
            }`}>
              <a.icon size={48} strokeWidth={a.locked ? 1.5 : 2.5} />
            </div>
            
            <h3 className="text-xl font-black uppercase tracking-tighter mb-3 leading-tight">
              {a.title}
            </h3>
            <p className="text-xs text-muted-foreground font-medium leading-relaxed mb-10">
              {a.desc}
            </p>

            <div className="mt-auto w-full">
              {a.locked ? (
                <div className="py-3 px-6 bg-secondary rounded-xl text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground border border-border/50">
                  Bloqueado
                </div>
              ) : (
                <div className="py-3 px-6 bg-primary/10 text-primary rounded-xl text-[9px] font-black uppercase tracking-[0.2em] border border-primary/20 flex items-center justify-center gap-2">
                  <CheckCircle2 size={14} />
                  Obtenido
                </div>
              )}
            </div>
          </motion.div>
        ))}
      </div>

      <section className="mt-24 p-12 bg-secondary/20 border border-border rounded-[3rem] relative overflow-hidden">
        <div className="absolute top-0 right-0 p-12 opacity-5">
          <Star size={200} />
        </div>
        <div className="max-w-2xl relative z-10">
          <h2 className="text-3xl font-black uppercase italic tracking-tighter mb-6">Próximos Desafíos</h2>
          <p className="text-sm text-muted-foreground leading-relaxed font-medium mb-8">
            Completar desafíos de nivel 2 te permitirá desbloquear insignias de "Especialista" en Economía y Administración. Seguí participando en las salas de demo para acumular puntos de competencia.
          </p>
          <div className="flex gap-4">
            <div className="flex -space-x-3">
              {[1,2,3].map(i => (
                <div key={i} className="w-12 h-12 rounded-full border-4 border-card bg-muted flex items-center justify-center text-xs font-black">+</div>
              ))}
            </div>
            <div className="flex flex-col justify-center">
              <span className="text-[10px] font-black uppercase tracking-widest text-primary">Nuevos Logros Próximamente</span>
              <span className="text-[9px] text-muted-foreground uppercase font-bold tracking-widest">Acreditación Trimestre II</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
