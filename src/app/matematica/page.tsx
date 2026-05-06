"use client";

import React, { useState } from "react";
import { Calculator, ArrowRight, ShieldCheck, HelpCircle, TrendingUp, DollarSign } from "lucide-react";
import { motion } from "framer-motion";

export default function MatematicaPage() {
  const [step, setStep] = useState(1);

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <div className="mb-12">
        <div className="flex items-center gap-2 text-primary font-bold text-sm uppercase tracking-widest mb-2">
          <Calculator size={16} />
          Matemática Aplicada - Nivel 1
        </div>
        <h1 className="text-4xl font-black tracking-tighter italic uppercase">Análisis de Inflación y Precios</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <section className="bg-card border border-border rounded-3xl p-8 relative overflow-hidden">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <ShieldCheck className="text-primary" />
              Reto Económico
            </h2>
            <p className="text-muted-foreground leading-relaxed text-lg">
              "Una empresa mendocina de conservas necesita proyectar sus precios para el próximo trimestre. Debes calcular el Precio de Venta Sugerido considerando una inflación proyectada del 15% mensual y un margen de ganancia del 25% sobre el costo total."
            </p>
            <div className="mt-6 p-4 bg-secondary/50 rounded-2xl border border-border flex gap-6">
              <div className="flex flex-col">
                <span className="text-[10px] font-bold text-muted-foreground uppercase">Costo Base</span>
                <span className="text-lg font-bold font-mono">$1.200,00</span>
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] font-bold text-muted-foreground uppercase">Tasa Inflación</span>
                <span className="text-lg font-bold font-mono">15% mensual</span>
              </div>
            </div>
          </section>

          <div className="space-y-4">
            {[
              { id: 1, title: "Cálculo de Costo Proyectado", desc: "Aplica el interés compuesto para determinar el costo en el mes 3." },
              { id: 2, title: "Margen de Contribución", desc: "Calcula el precio final aplicando el mark-up de ganancia." },
              { id: 3, title: "Análisis de Competencia", desc: "Compara tu precio con el promedio de mercado de $2.500." },
            ].map((s) => (
              <div key={s.id} className={`p-6 rounded-2xl border flex items-center gap-6 ${step === s.id ? "border-primary bg-primary/5" : "border-border opacity-50"}`}>
                <div className={`w-12 h-12 rounded-full flex items-center justify-center font-black ${step === s.id ? "bg-primary text-white" : "bg-muted"}`}>
                  {s.id}
                </div>
                <div className="flex-1">
                  <h3 className="font-bold">{s.title}</h3>
                  <p className="text-sm text-muted-foreground">{s.desc}</p>
                </div>
                {step === s.id && (
                  <button onClick={() => setStep(step + 1)} className="p-3 bg-primary/20 text-primary rounded-xl">
                    <ArrowRight size={20} />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-secondary/50 border border-border rounded-3xl p-6">
            <h3 className="font-bold flex items-center gap-2 mb-4">
              <TrendingUp size={18} className="text-primary" />
              Herramientas
            </h3>
            <div className="space-y-2">
              <button className="w-full p-3 bg-card border border-border rounded-xl text-xs font-bold uppercase hover:border-primary/50 text-left">
                Calculadora Financiera
              </button>
              <button className="w-full p-3 bg-card border border-border rounded-xl text-xs font-bold uppercase hover:border-primary/50 text-left">
                Tabla de Índices IPC
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
