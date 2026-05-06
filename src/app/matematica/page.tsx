"use client";

import React, { useState } from "react";
import { Calculator, ArrowRight, ShieldCheck, TrendingUp, CheckCircle2, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function MatematicaPage() {
  const [step, setStep] = useState(1);
  const [userInput, setUserInput] = useState("");
  const [feedback, setFeedback] = useState<"success" | "error" | null>(null);

  const checkCalculation = () => {
    // Cálculo: Costo mes 3 = 1200 * (1.15)^3 = 1825.05
    // Precio final = 1825.05 * 1.25 = 2281.31
    const val = parseFloat(userInput.replace(",", "."));
    if (val >= 2280 && val <= 2285) {
      setFeedback("success");
      setTimeout(() => setStep(2), 2000);
    } else {
      setFeedback("error");
    }
  };

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
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-foreground">
              <ShieldCheck className="text-primary" />
              Reto Económico
            </h2>
            <p className="text-muted-foreground leading-relaxed text-lg mb-6">
              "Una empresa mendocina de conservas necesita proyectar sus precios para el próximo trimestre. Debés calcular el **Precio de Venta Sugerido** considerando una inflación proyectada del **15% mensual** y un margen de ganancia del **25%** sobre el costo total proyectado al mes 3."
            </p>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-secondary/50 rounded-2xl border border-border flex flex-col">
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">Costo Base (Mes 0)</span>
                <span className="text-xl font-bold font-mono">$1.200,00</span>
              </div>
              <div className="p-4 bg-secondary/50 rounded-2xl border border-border flex flex-col">
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">Inflación Proyectada</span>
                <span className="text-xl font-bold font-mono">15% mensual</span>
              </div>
            </div>
          </section>

          <div className="space-y-4">
            <div className={`p-6 rounded-[2rem] border transition-all duration-500 ${step === 1 ? "border-primary bg-primary/5 shadow-xl shadow-primary/5" : "border-border opacity-50 bg-secondary/20"}`}>
              <div className="flex items-center gap-6 mb-6">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center font-black text-xl ${step === 1 ? "bg-primary text-white" : "bg-green-500 text-white"}`}>
                  {step > 1 ? "✓" : "1"}
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-lg">Cálculo de Costo Proyectado y Precio Final</h3>
                  <p className="text-sm text-muted-foreground">Calculá el precio de venta final aplicando el interés compuesto (3 meses) y el margen de utilidad.</p>
                </div>
              </div>

              {step === 1 && (
                <div className="pl-16 space-y-4">
                  <div className="flex gap-4">
                    <div className="flex-1 relative">
                      <span className="absolute left-4 top-3.5 text-muted-foreground font-bold">$</span>
                      <input 
                        type="text" 
                        value={userInput}
                        onChange={(e) => setUserInput(e.target.value)}
                        placeholder="Ingresá el resultado final..."
                        className="w-full bg-card border border-border rounded-xl py-3.5 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-primary/50 font-mono"
                      />
                    </div>
                    <button 
                      onClick={checkCalculation}
                      className="px-8 bg-primary text-primary-foreground font-bold rounded-xl hover:bg-primary/90 transition-all shadow-lg shadow-primary/20"
                    >
                      Validar
                    </button>
                  </div>
                  
                  <AnimatePresence>
                    {feedback === "success" && (
                      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-2 text-green-500 text-sm font-bold bg-green-500/10 p-3 rounded-xl border border-green-500/20">
                        <CheckCircle2 size={16} />
                        ¡Cálculo correcto! Acreditando paso...
                      </motion.div>
                    )}
                    {feedback === "error" && (
                      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-2 text-red-500 text-sm font-bold bg-red-500/10 p-3 rounded-xl border border-red-500/20">
                        <AlertCircle size={16} />
                        El resultado no es correcto. Revisá la fórmula del interés compuesto.
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}
            </div>

            <div className={`p-6 rounded-[2rem] border transition-all duration-500 ${step === 2 ? "border-primary bg-primary/5 shadow-xl shadow-primary/5" : "border-border opacity-50 bg-secondary/20"}`}>
              <div className="flex items-center gap-6">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center font-black text-xl ${step === 2 ? "bg-primary text-white" : step > 2 ? "bg-green-500 text-white" : "bg-muted"}`}>
                  {step > 2 ? "✓" : "2"}
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-lg">Informe de Viabilidad</h3>
                  <p className="text-sm text-muted-foreground">Compará tu precio con el promedio de mercado de $2.500.</p>
                </div>
                {step === 2 && (
                  <button onClick={() => setStep(3)} className="p-3 bg-primary text-white rounded-xl shadow-lg shadow-primary/20">
                    <ArrowRight size={20} />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        <aside className="space-y-6">
          <div className="bg-secondary/50 border border-border rounded-[2rem] p-6 shadow-sm">
            <h3 className="font-bold flex items-center gap-2 mb-4 uppercase text-xs tracking-widest text-primary">
              <TrendingUp size={16} />
              Caja de Herramientas
            </h3>
            <div className="space-y-3">
              <button className="w-full p-4 bg-card border border-border rounded-2xl text-xs font-bold uppercase hover:border-primary/50 transition-all text-left flex items-center justify-between group">
                Calculadora Financiera
                <ArrowRight size={14} className="opacity-0 group-hover:opacity-100 transition-all" />
              </button>
              <button className="w-full p-4 bg-card border border-border rounded-2xl text-xs font-bold uppercase hover:border-primary/50 transition-all text-left flex items-center justify-between group">
                Tabla de Índices IPC
                <ArrowRight size={14} className="opacity-0 group-hover:opacity-100 transition-all" />
              </button>
            </div>
          </div>
          
          <div className="bg-primary/5 border border-primary/10 rounded-[2rem] p-6">
            <h4 className="text-sm font-bold mb-2 italic">Dato Útil</h4>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Recordá que para 3 meses el factor es (1 + i)³. Usá 0.15 como tasa decimal.
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}
