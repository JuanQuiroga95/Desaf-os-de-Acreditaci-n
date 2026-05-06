"use client";

import React, { useState } from "react";
import { Calculator, ArrowRight, ShieldCheck, TrendingUp, CheckCircle2, AlertCircle, Upload, HelpCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useToast } from "@/context/ToastContext";

export default function MatematicaPage() {
  const { showToast } = useToast();
  const [step, setStep] = useState(1);
  const [userInput, setUserInput] = useState("");
  const [resolution, setResolution] = useState("");
  const [feedback, setFeedback] = useState<"success" | "error" | null>(null);
  const [activeTool, setActiveTool] = useState<"calc" | "ipc" | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const checkCalculation = () => {
    const val = parseFloat(userInput.replace(",", "."));
    if (val >= 2280 && val <= 2285) {
      setFeedback("success");
      showToast("¡Cálculo correcto! Acreditando competencia...", "success");
      setTimeout(() => setStep(2), 2000);
    } else {
      setFeedback("error");
      showToast("El resultado no es correcto. Revisá tu planteo.", "error");
    }
  };

  const handleUpload = () => {
    setIsUploading(true);
    setTimeout(() => {
      setIsUploading(false);
      showToast("Evidencia subida correctamente. El docente podrá revisarla.", "success");
    }, 1500);
  };

  const handleSaveResolution = async () => {
    setIsSaving(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsSaving(false);
    showToast("Progreso guardado en tu Bitácora.", "success");
  };

  return (
    <div className="p-8 max-w-7xl mx-auto pb-24">
      <div className="mb-12">
        <div className="flex items-center gap-2 text-primary font-bold text-sm uppercase tracking-widest mb-2">
          <Calculator size={16} />
          Matemática Aplicada - Nivel 1
        </div>
        <h1 className="text-5xl font-black tracking-tighter italic uppercase text-foreground">Análisis de Inflación y Precios</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 space-y-8">
          <section className="bg-card border border-border rounded-3xl p-8 relative overflow-hidden shadow-sm">
            <div className="absolute top-0 right-0 p-4 opacity-10">
              <TrendingUp size={120} />
            </div>
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-foreground">
              <ShieldCheck className="text-primary" />
              Reto Económico
            </h2>
            <p className="text-muted-foreground leading-relaxed text-lg mb-8 relative z-10">
              "Una empresa mendocina de conservas necesita proyectar sus precios para el próximo trimestre. Debés calcular el **Precio de Venta Sugerido** considerando una inflación proyectada del **15% mensual** y un margen de ganancia del **25%** sobre el costo total proyectado al mes 3."
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 relative z-10">
              <div className="p-6 bg-secondary/30 rounded-2xl border border-border flex flex-col shadow-inner">
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em] mb-2">Costo Base (Mes 0)</span>
                <span className="text-3xl font-black font-mono">$ 1.200,00</span>
              </div>
              <div className="p-6 bg-secondary/30 rounded-2xl border border-border flex flex-col shadow-inner">
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em] mb-2">Inflación Estimada</span>
                <span className="text-3xl font-black font-mono">15% <span className="text-xs text-muted-foreground uppercase">Mensual</span></span>
              </div>
            </div>
          </section>

          {/* Panel de Resolución */}
          <section className="bg-card border border-border rounded-[2.5rem] p-8 shadow-sm">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <CheckCircle2 size={20} className="text-primary" />
                Bitácora de Resolución
              </h2>
              <span className="text-[10px] font-bold text-muted-foreground uppercase bg-secondary px-3 py-1 rounded-full">
                Documentación Técnica
              </span>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              Explicá acá tu planteo, las fórmulas que usaste y los supuestos económicos que considerás para este caso.
            </p>
            <textarea 
              value={resolution}
              onChange={(e) => setResolution(e.target.value)}
              placeholder="Escribí acá tu razonamiento paso a paso..."
              className="w-full h-48 bg-secondary/30 border border-border rounded-2xl p-6 focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm leading-relaxed resize-none font-medium mb-4"
            />
            <div className="flex justify-end gap-4">
              <button 
                onClick={handleUpload}
                disabled={isUploading}
                className="bg-secondary hover:bg-border text-foreground px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 border border-border shadow-sm"
              >
                {isUploading ? "Subiendo..." : "Cargar Evidencia"}
                <Upload size={16} className={isUploading ? "animate-bounce" : ""} />
              </button>
              <button 
                onClick={handleSaveResolution}
                disabled={isSaving}
                className="bg-primary text-white hover:bg-primary/90 px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 shadow-lg shadow-primary/20"
              >
                {isSaving ? "Guardando..." : "Guardar Planteo"}
                <CheckCircle2 size={16} className={isSaving ? "animate-pulse" : ""} />
              </button>
            </div>
          </section>

          <div className="space-y-6">
            {/* STEP 1 */}
            <div className={`p-8 rounded-[2.5rem] border transition-all duration-500 ${step === 1 ? "border-primary bg-primary/5 shadow-2xl shadow-primary/5" : "border-border opacity-50 bg-secondary/20"}`}>
              <div className="flex items-center gap-6 mb-6">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center font-black text-xl ${step === 1 ? "bg-primary text-white" : "bg-green-500 text-white"}`}>
                  {step > 1 ? "✓" : "1"}
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-lg uppercase italic tracking-tighter">Cálculo de Costo Proyectado</h3>
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
                        ¡Cálculo correcto! Acreditando competencia...
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}
            </div>
            
            {/* STEP 2: Quiz */}
            <div className={`p-8 rounded-[2.5rem] border transition-all duration-500 ${step === 2 ? "border-primary bg-primary/5 shadow-2xl shadow-primary/5" : "border-border opacity-50 bg-secondary/20"}`}>
              <div className="flex items-center gap-6 mb-8">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center font-black text-xl ${step === 2 ? "bg-primary text-white" : step > 2 ? "bg-green-500 text-white" : "bg-muted"}`}>
                  {step > 2 ? "✓" : "2"}
                </div>
                <div className="flex-1">
                  <h3 className="font-black text-lg uppercase italic tracking-tighter">Toma de Decisión Estratégica</h3>
                  <p className="text-sm text-muted-foreground">Basado en tu cálculo anterior, ¿cuál es la mejor recomendación para la empresa?</p>
                </div>
              </div>

              {step === 2 && (
                <div className="pl-16 space-y-4">
                  {[
                    "Aumentar el margen al 30% para cubrir riesgos.",
                    "Mantener el precio proyectado y buscar eficiencia en costos.",
                    "Bajar el precio para ganar mercado rápidamente.",
                  ].map((option, i) => (
                    <button 
                      key={i}
                      onClick={() => {
                        showToast("Respuesta registrada. Evaluando criterio...", "info");
                        setTimeout(() => {
                          showToast("¡Criterio aprobado! Has completado el reto.", "success");
                          setStep(3);
                        }, 2000);
                      }}
                      className="w-full text-left p-6 bg-card border border-border rounded-2xl hover:border-primary hover:bg-primary/5 transition-all flex items-center gap-4 group"
                    >
                      <div className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center text-[10px] font-black group-hover:bg-primary group-hover:text-white transition-all">
                        {String.fromCharCode(65 + i)}
                      </div>
                      <span className="text-sm font-medium">{option}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        <aside className="lg:col-span-4 space-y-6">
          <div className="bg-secondary/50 border border-border rounded-[2rem] p-8 shadow-sm sticky top-8">
            <h3 className="font-bold flex items-center gap-2 mb-6 uppercase text-[10px] tracking-[0.2em] text-primary">
              <TrendingUp size={16} />
              Caja de Herramientas
            </h3>
            <div className="space-y-4">
              <button 
                onClick={() => setActiveTool("calc")}
                className="w-full p-5 bg-card border border-border rounded-[1.5rem] text-[10px] font-black uppercase tracking-widest hover:border-primary/50 hover:shadow-xl hover:shadow-primary/5 transition-all text-left flex items-center justify-between group"
              >
                Calculadora Financiera
                <Calculator size={18} className="text-muted-foreground group-hover:text-primary transition-colors" />
              </button>
              <button 
                onClick={() => setActiveTool("ipc")}
                className="w-full p-5 bg-card border border-border rounded-[1.5rem] text-[10px] font-black uppercase tracking-widest hover:border-primary/50 hover:shadow-xl hover:shadow-primary/5 transition-all text-left flex items-center justify-between group"
              >
                Tabla de Índices IPC
                <TrendingUp size={18} className="text-muted-foreground group-hover:text-primary transition-colors" />
              </button>
            </div>

            <div className="mt-10 bg-primary/5 border border-primary/10 rounded-2xl p-6 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-2 opacity-10">
                <AlertCircle size={40} />
              </div>
              <h4 className="text-xs font-black uppercase tracking-widest mb-3 italic">Dato Útil</h4>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Recordá que para 3 meses el factor de capitalización es <span className="font-mono font-bold text-primary">(1 + i)³</span>. <br /><br />
                Usá <span className="font-mono font-bold">0.15</span> como tasa decimal para el cálculo.
              </p>
            </div>
          </div>
        </aside>
      </div>

      {/* MODALES DE HERRAMIENTAS */}
      <AnimatePresence>
        {activeTool && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-background/80 backdrop-blur-md">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-card border border-border w-full max-w-md rounded-[2.5rem] shadow-2xl overflow-hidden"
            >
              <div className="p-8 border-b border-border flex justify-between items-center bg-secondary/30">
                <h3 className="font-black uppercase italic tracking-tighter text-xl">
                  {activeTool === "calc" ? "Calculadora Pro" : "Índices IPC Mendoza"}
                </h3>
                <button onClick={() => setActiveTool(null)} className="w-10 h-10 rounded-full bg-background border border-border flex items-center justify-center hover:bg-red-500 hover:text-white transition-all">
                  ✕
                </button>
              </div>

              <div className="p-8">
                {activeTool === "calc" ? (
                  <div className="space-y-6">
                    <div className="bg-background border border-border p-6 rounded-2xl text-right">
                      <span className="text-muted-foreground text-[10px] font-bold uppercase tracking-widest">Resultado</span>
                      <div className="text-4xl font-black font-mono tracking-tighter">1.825,05</div>
                    </div>
                    <div className="grid grid-cols-4 gap-3">
                      {["7","8","9","/", "4","5","6","*", "1","2","3","-", "0",".","=","+"].map(btn => (
                        <button key={btn} className="h-14 bg-secondary/50 rounded-xl font-bold hover:bg-primary hover:text-white transition-all">
                          {btn}
                        </button>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <table className="w-full text-sm">
                      <thead className="text-[10px] font-black uppercase tracking-widest text-muted-foreground border-b border-border">
                        <tr>
                          <th className="pb-4 text-left">Mes</th>
                          <th className="pb-4 text-right">Variación</th>
                        </tr>
                      </thead>
                      <tbody className="font-mono">
                        {[
                          { m: "Enero", v: "+12.4%" },
                          { m: "Febrero", v: "+15.2%" },
                          { m: "Marzo (Proj)", v: "+15.0%" },
                        ].map((row, i) => (
                          <tr key={i} className="border-b border-border/50">
                            <td className="py-4 font-bold">{row.m}</td>
                            <td className="py-4 text-right text-red-500 font-black">{row.v}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
              
              <div className="p-8 bg-secondary/10 border-t border-border">
                <button 
                  onClick={() => setActiveTool(null)}
                  className="w-full py-4 bg-primary text-white rounded-2xl font-black uppercase tracking-widest text-xs shadow-lg shadow-primary/20"
                >
                  Cerrar Herramienta
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
