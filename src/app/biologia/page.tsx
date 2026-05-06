"use client";

import React, { useState } from "react";
import { Leaf, ArrowRight, ShieldCheck, HelpCircle, Recycle, Globe } from "lucide-react";

export default function BiologiaPage() {
  const [step, setStep] = useState(1);

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <div className="mb-12">
        <div className="flex items-center gap-2 text-primary font-bold text-sm uppercase tracking-widest mb-2">
          <Leaf size={16} />
          Biología y Desarrollo - Nivel 1
        </div>
        <h1 className="text-4xl font-black tracking-tighter italic uppercase">Economía Circular y Sustentabilidad</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <section className="bg-card border border-border rounded-3xl p-8 relative overflow-hidden">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <ShieldCheck className="text-primary" />
              Reto Bio-Económico
            </h2>
            <p className="text-muted-foreground leading-relaxed text-lg">
              "Investigá el impacto de los residuos de la industria textil local. Tu objetivo es proponer un modelo de **Economía Circular** donde los desechos de tela se transformen en materia prima para otra industria, reduciendo costos y huella de carbono."
            </p>
          </section>

          <div className="space-y-4">
            {[
              { id: 1, title: "Ciclo de Vida del Producto", desc: "Analizá desde la obtención de la fibra hasta el desecho final." },
              { id: 2, title: "Identificación de Biopolímeros", desc: "Diferenciá entre fibras naturales degradables y sintéticas." },
              { id: 3, title: "Propuesta de Valor Circular", desc: "Calculá el ahorro estimado al reutilizar el 40% de los descartes." },
            ].map((s) => (
              <div key={s.id} className={`p-6 rounded-2xl border flex items-center gap-6 ${step === s.id ? "border-primary bg-primary/5" : "border-border opacity-50"}`}>
                <div className={`w-12 h-12 rounded-full flex items-center justify-center font-black ${step === s.id ? "bg-primary text-white" : "bg-green-500 text-white"}`}>
                  {step > s.id ? "✓" : s.id}
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
              <Recycle size={18} className="text-primary" />
              Material de Apoyo
            </h3>
            <div className="space-y-2">
              <button className="w-full p-3 bg-card border border-border rounded-xl text-xs font-bold uppercase hover:border-primary/50 text-left">
                Guía de Economía Circular
              </button>
              <button className="w-full p-3 bg-card border border-border rounded-xl text-xs font-bold uppercase hover:border-primary/50 text-left">
                Mapas de Impacto Ambiental
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
