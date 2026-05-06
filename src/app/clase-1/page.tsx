"use client";

import React, { useState } from "react";
import { Zap, ArrowRight, ShieldCheck, HelpCircle, Terminal, ExternalLink } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

export default function Clase1Page() {
  const [step, setStep] = useState(1);

  return (
    <div className="p-8 max-w-5xl mx-auto">
      {/* Gamified Header */}
      <div className="mb-12 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <div className="flex items-center gap-2 text-primary font-bold text-sm uppercase tracking-widest mb-2">
            <Zap size={16} fill="currentColor" />
            Nivel 1: El Flujo Invisible
          </div>
          <h1 className="text-4xl font-black tracking-tighter italic uppercase">Desafío de Acreditación</h1>
        </div>
        <div className="flex gap-4">
          <div className="px-4 py-2 bg-secondary rounded-2xl border border-border flex flex-col">
            <span className="text-[10px] text-muted-foreground font-bold uppercase">Dificultad</span>
            <span className="text-sm font-bold text-green-500">Principiante</span>
          </div>
          <div className="px-4 py-2 bg-secondary rounded-2xl border border-border flex flex-col">
            <span className="text-[10px] text-muted-foreground font-bold uppercase">XP Recompensa</span>
            <span className="text-sm font-bold text-yellow-500">500 XP</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-8">
          {/* Objective Card */}
          <section className="bg-card border border-border rounded-3xl p-8 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-6 opacity-10">
              <Terminal size={120} />
            </div>
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <ShieldCheck className="text-primary" />
              Situación Problemática
            </h2>
            <p className="text-muted-foreground leading-relaxed text-lg">
              "El banco de pruebas principal del taller está quemando los componentes. Cada vez que conectamos un LED indicador, se destruye instantáneamente. Debes calcular y simular la resistencia de protección adecuada para una fuente de 12V."
            </p>
          </section>

          {/* Gamified Steps */}
          <div className="space-y-4">
            {[
              { id: 1, title: "Análisis de Datos", desc: "Identifica el voltaje de fuente y los requerimientos del LED." },
              { id: 2, title: "Cálculo Técnico", desc: "Aplica la Ley de Ohm para encontrar el valor de R." },
              { id: 3, title: "Simulación en Tinkercad", desc: "Monta el circuito y verifica que el LED no se queme." },
              { id: 4, title: "Acreditación", desc: "Sube tu captura o link del simulador." },
            ].map((s) => (
              <div 
                key={s.id}
                className={cn(
                  "p-6 rounded-2xl border transition-all duration-300 flex items-center gap-6",
                  step === s.id 
                    ? "bg-primary/5 border-primary shadow-lg shadow-primary/5" 
                    : step > s.id 
                      ? "bg-secondary/30 border-green-500/20 opacity-60" 
                      : "bg-secondary/20 border-border opacity-40"
                )}
              >
                <div className={cn(
                  "w-12 h-12 rounded-full flex items-center justify-center font-black text-xl",
                  step === s.id ? "bg-primary text-primary-foreground" : step > s.id ? "bg-green-500 text-white" : "bg-muted text-muted-foreground"
                )}>
                  {step > s.id ? "✓" : s.id}
                </div>
                <div className="flex-1">
                  <h3 className="font-bold">{s.title}</h3>
                  <p className="text-sm text-muted-foreground">{s.desc}</p>
                </div>
                {step === s.id && (
                  <button 
                    onClick={() => setStep(step + 1)}
                    className="p-3 bg-primary/20 text-primary rounded-xl hover:bg-primary hover:text-white transition-all"
                  >
                    <ArrowRight size={20} />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Sidebar Help */}
        <div className="space-y-6">
          <div className="bg-secondary/50 border border-border rounded-3xl p-6">
            <h3 className="font-bold flex items-center gap-2 mb-4">
              <HelpCircle size={18} className="text-primary" />
              Recursos de Taller
            </h3>
            <ul className="space-y-3">
              <li>
                <a href="https://www.tinkercad.com" target="_blank" className="flex items-center justify-between p-3 bg-card border border-border rounded-xl hover:border-primary/50 transition-colors">
                  <span className="text-sm">Tinkercad Circuits</span>
                  <ExternalLink size={14} />
                </a>
              </li>
              <li>
                <div className="p-3 bg-card border border-border rounded-xl">
                  <span className="text-[10px] font-bold text-muted-foreground uppercase block mb-1">Tip Técnico</span>
                  <p className="text-xs italic">"Un LED estándar suele soportar 20mA y tiene una caída de ~2V."</p>
                </div>
              </li>
            </ul>
          </div>

          <div className="bg-primary/10 border border-primary/20 rounded-3xl p-6 relative overflow-hidden group">
            <Sparkles className="absolute -right-2 -top-2 text-primary/20 group-hover:scale-150 transition-transform duration-700" size={80} />
            <h3 className="font-bold mb-2 relative z-10">¿Trabado?</h3>
            <p className="text-xs text-muted-foreground mb-4 relative z-10">
              El Tutor IA está listo para darte una analogía de taller si no sabes por dónde empezar.
            </p>
            <button className="text-primary text-xs font-black uppercase tracking-widest hover:underline relative z-10">
              Llamar al tutor
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Utility for classes (already in lib/utils but need import or copy)
function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(" ");
}
