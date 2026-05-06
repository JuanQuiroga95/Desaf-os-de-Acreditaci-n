"use client";

import React, { useState } from "react";
import { MessageSquare, ArrowRight, ShieldCheck, HelpCircle, FileText, PenTool } from "lucide-react";

export default function LenguaPage() {
  const [step, setStep] = useState(1);

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <div className="mb-12">
        <div className="flex items-center gap-2 text-primary font-bold text-sm uppercase tracking-widest mb-2">
          <MessageSquare size={16} />
          Lengua y Comunicación - Nivel 1
        </div>
        <h1 className="text-4xl font-black tracking-tighter italic uppercase">Redacción de Informes Ejecutivos</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <section className="bg-card border border-border rounded-3xl p-8 relative overflow-hidden">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <ShieldCheck className="text-primary" />
              Reto de Comunicación
            </h2>
            <p className="text-muted-foreground leading-relaxed text-lg">
              "Has sido asignado como asistente de comunicación en una cooperativa vitivinícola. Debés redactar un informe ejecutivo dirigido a la asamblea de socios, explicando de manera formal y persuasiva la necesidad de invertir en nuevas tecnologías de riego."
            </p>
          </section>

          <div className="space-y-4">
            {[
              { id: 1, title: "Análisis de Destinatario", desc: "Definí el tono y el registro adecuado para una asamblea de socios." },
              { id: 2, title: "Estructura del Informe", desc: "Organizá la información: Título, Introducción, Desarrollo y Conclusión." },
              { id: 3, title: "Uso de Tecnicismos", desc: "Incorporá términos como 'ROI', 'Eficiencia hídrica' y 'Sustentabilidad'." },
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
              <FileText size={18} className="text-primary" />
              Recursos
            </h3>
            <div className="space-y-2">
              <button className="w-full p-3 bg-card border border-border rounded-xl text-xs font-bold uppercase hover:border-primary/50 text-left">
                Manual de Estilo RAE
              </button>
              <button className="w-full p-3 bg-card border border-border rounded-xl text-xs font-bold uppercase hover:border-primary/50 text-left">
                Glosario de Términos Económicos
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
