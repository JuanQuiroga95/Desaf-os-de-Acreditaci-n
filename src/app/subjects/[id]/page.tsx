/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useEffect, useState, use } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { BookOpen, CheckCircle2, Play, Lock, ArrowLeft, Award, HelpCircle, Send, FileText, Target } from "lucide-react";
import { getSubjectChallenges, submitChallengeResponse } from "@/app/actions/student";
import { motion, AnimatePresence } from "framer-motion";
import { useToast } from "@/context/ToastContext";
import Link from "next/link";

export default function SubjectPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const { user, isLoading: authLoading } = useAuth();
  const { showToast } = useToast();
  const router = useRouter();
  const [subject, setSubject] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedChallenge, setSelectedChallenge] = useState<any>(null);
  const [answers, setAnswers] = useState<{[key: string]: string}>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (user?.id) {
      loadData();
    }
  }, [user, resolvedParams.id]);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const res = await getSubjectChallenges(resolvedParams.id, user!.id);
      if (res.success) {
        setSubject(res.subject);
      }
    } catch (error) {
      console.error("Error cargando materia:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenChallenge = (challenge: any) => {
    setSelectedChallenge(challenge);
    // Initialize answers if needed
    const initialAnswers: {[key: string]: string} = {};
    if (challenge.content?.questions) {
      challenge.content.questions.forEach((q: { id: string }) => {
        initialAnswers[q.id] = "";
      });
    }
    setAnswers(initialAnswers);
  };

  const handleSubmitChallenge = async (e?: React.FormEvent | React.MouseEvent) => {
    if (e) e.preventDefault();
    
    if (!selectedChallenge) return;

    // Validate that all questions are answered
    const questions = selectedChallenge.content?.questions || [];
    const allAnswered = questions.every((q: { id: string }) => answers[q.id]?.trim());
    
    if (!allAnswered) {
      showToast("Por favor responde todas las preguntas", "error");
      return;
    }
    
    setIsSubmitting(true);
    try {
      // Logic: compare answers with expected ones if desired, or just submit
      const res = await submitChallengeResponse(selectedChallenge.id, user!.id, answers);
      if (res.success) {
        showToast("¡Desafío enviado! Pendiente de corrección.", "success");
        setSelectedChallenge(null);
        setAnswers({});
        loadData();
      }
    } catch (error) {
      showToast("Error al enviar el desafío", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    if (!authLoading && !isLoading && !user && typeof window !== "undefined") {
      router.push("/login");
    }
  }, [authLoading, isLoading, user, router]);

  if (authLoading || isLoading) return <div className="p-20 text-center font-black animate-pulse uppercase tracking-widest text-primary">Cargando Materia...</div>;
  if (!user) return null;

  return (
    <div className="p-8 max-w-7xl mx-auto pb-24">
      <header className="mb-12">
        <Link href="/" className="flex items-center gap-2 text-primary font-black text-[10px] uppercase tracking-widest mb-4 hover:underline">
          <ArrowLeft size={14} /> Volver a Mis Materias
        </Link>
        <div className="flex justify-between items-end">
          <div>
            <h1 className="text-5xl font-black tracking-tighter uppercase italic leading-none">{subject?.name || "Materia no encontrada"}</h1>
            <p className="text-muted-foreground text-[10px] uppercase font-bold tracking-[0.4em] mt-2">Docente: {subject?.teacher?.name || "Desconocido"}</p>
          </div>
          <div className="text-right">
            <span className="text-[10px] font-black text-primary uppercase tracking-widest">Estado Académico</span>
            <p className="text-2xl font-black italic uppercase">En Curso</p>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 space-y-6">
          <section className="bg-card border border-border rounded-[2.5rem] p-8 shadow-sm">
            <h2 className="text-xl font-black mb-8 flex items-center gap-3 italic uppercase text-[10px] tracking-[0.2em] text-primary">
              <BookOpen size={18} />
              Hoja de Ruta del Ciclo
            </h2>
            
            <div className="space-y-4">
              {subject?.challenges?.map((challenge: { id: string; title: string; progress: any[] }, i: number) => {
                const isCompleted = (challenge.progress?.length || 0) > 0 && challenge.progress[0].status === "COMPLETED";
                const isGraded = isCompleted && (challenge.progress[0]?.score !== null && challenge.progress[0]?.score !== undefined);
                
                return (
                  <div 
                    key={challenge.id} 
                    className={`p-6 rounded-[2rem] border transition-all flex items-center justify-between ${
                      isCompleted ? "bg-secondary/10 border-border" : "bg-card border-border hover:border-primary/50"
                    }`}
                  >
                    <div className="flex items-center gap-6">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center font-black ${
                        isGraded ? "bg-green-500 text-white" : isCompleted ? "bg-primary text-white" : "bg-secondary text-muted-foreground"
                      }`}>
                        {isCompleted ? <CheckCircle2 size={24} /> : i + 1}
                      </div>
                      <div>
                        <h3 className="font-bold text-lg">{challenge.title}</h3>
                        <p className="text-xs text-muted-foreground uppercase font-black tracking-widest">
                          {isGraded ? `Calificación: ${challenge.progress[0]?.score}/10` : isCompleted ? "Pendiente de Calificación" : "Sin Iniciar"}
                        </p>
                      </div>
                    </div>
                    
                    {!isCompleted ? (
                      <button 
                        onClick={() => handleOpenChallenge(challenge)}
                        className="bg-primary text-white px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-all shadow-lg shadow-primary/20 flex items-center gap-2"
                      >
                        <Play size={14} fill="currentColor" />
                        Comenzar
                      </button>
                    ) : (
                      <div className="bg-secondary/30 text-muted-foreground px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest border border-border">
                        Completado
                      </div>
                    )}
                  </div>
                );
              })}
              
              {(!subject?.challenges || subject?.challenges.length === 0) && (
                <div className="p-16 text-center border-2 border-dashed border-border rounded-[2.5rem] bg-secondary/5">
                  <HelpCircle className="mx-auto mb-4 text-muted-foreground opacity-20" size={48} />
                  <p className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground">No hay desafíos publicados todavía.</p>
                </div>
              )}
            </div>
          </section>
        </div>

        <aside className="lg:col-span-4 space-y-6">
          <div className="bg-secondary/20 border border-border rounded-[2.5rem] p-8 shadow-sm">
            <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-primary mb-6 flex items-center gap-3">
              <Award size={16} /> Logros en esta Materia
            </h3>
            <div className="space-y-4">
              <div className="p-5 bg-card rounded-2xl border border-border flex items-center gap-4 opacity-40">
                <div className="w-10 h-10 rounded-lg bg-yellow-500/20 text-yellow-600 flex items-center justify-center">
                  <Award size={20} />
                </div>
                <div>
                  <p className="text-xs font-black uppercase tracking-widest">Primer Paso</p>
                  <p className="text-[9px] text-muted-foreground uppercase font-bold">Completa 1 desafío</p>
                </div>
              </div>
              <div className="p-5 bg-card rounded-2xl border border-border flex items-center gap-4 opacity-40">
                <div className="w-10 h-10 rounded-lg bg-blue-500/20 text-blue-600 flex items-center justify-center">
                  <Award size={20} />
                </div>
                <div>
                  <p className="text-xs font-black uppercase tracking-widest">Maestría Técnica</p>
                  <p className="text-[9px] text-muted-foreground uppercase font-bold">Obtén un 10 en 3 desafíos</p>
                </div>
              </div>
            </div>
          </div>
        </aside>
      </div>

      {/* Challenge Resolution Modal */}
      <AnimatePresence>
        {selectedChallenge && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-background/80 backdrop-blur-md">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              className="bg-card border border-border w-full max-w-5xl rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
            >
              {/* V2 - 2 Column Layout */}
              <div className="p-8 border-b border-border flex justify-between items-center bg-primary/20 shrink-0">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-primary/20 text-primary flex items-center justify-center font-black">
                    <HelpCircle size={24} />
                  </div>
                  <div>
                    <h3 className="font-black uppercase italic text-xl">{selectedChallenge.title}</h3>
                    <p className="text-[10px] font-bold text-muted-foreground uppercase">Resolución de Desafío</p>
                  </div>
                </div>
                <button onClick={() => setSelectedChallenge(null)} className="w-10 h-10 rounded-full bg-background border border-border flex items-center justify-center hover:bg-red-500 hover:text-white transition-all">✕</button>
              </div>
              
              <div className="flex-1 overflow-hidden flex flex-col md:flex-row">
                {/* Left Side: Questions */}
                <div className="flex-1 p-8 space-y-8 overflow-y-auto border-r border-border/50 bg-secondary/10">
                  <div className="p-6 bg-secondary/20 rounded-2xl border border-border">
                    <h4 className="text-[10px] font-black uppercase text-primary mb-3 flex items-center gap-2">
                      <Target size={14} /> Objetivo a Acreditar
                    </h4>
                    <p className="text-sm text-foreground font-medium leading-relaxed">{selectedChallenge.objective}</p>
                  </div>

                  {selectedChallenge.content?.theory && (
                    <div className="p-6 bg-primary/5 border border-primary/20 rounded-2xl">
                      <h4 className="text-[10px] font-black uppercase text-primary mb-3 flex items-center gap-2">
                        <FileText size={14} /> Contenido Teórico
                      </h4>
                      <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">{selectedChallenge.content.theory}</p>
                    </div>
                  )}

                  <div className="space-y-6 pb-8">
                    <h4 className="text-[10px] font-black uppercase text-muted-foreground tracking-[0.2em]">Cuestionario de Validación</h4>
                    {selectedChallenge.content?.questions?.map((q: { id: string; question: string }, index: number) => (
                      <div key={q.id} className="space-y-3">
                        <label className="text-[10px] font-black uppercase text-muted-foreground block tracking-widest">
                          {index + 1}. {q.question}
                        </label>
                        <input 
                          required
                          value={answers[q.id] || ""}
                          onChange={(e) => setAnswers({...answers, [q.id]: e.target.value})}
                          className="w-full bg-background border border-border rounded-xl p-4 font-bold outline-none focus:ring-2 focus:ring-primary/50 transition-all shadow-inner"
                          placeholder="Tu respuesta..."
                        />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Right Side: Notepad / Desarrollo */}
                <div className="w-full md:w-[40%] p-8 bg-card flex flex-col space-y-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-[10px] font-black uppercase text-primary tracking-[0.2em] flex items-center gap-2">
                      <FileText size={16} /> Block de Notas y Cálculos
                    </h4>
                  </div>
                  
                  <div className="flex-1 relative group">
                    <div className="absolute inset-0 bg-[radial-gradient(#3b82f6_1px,transparent_1px)] [background-size:20px_20px] opacity-[0.03] pointer-events-none" />
                    <textarea 
                      value={answers["notes"] || ""}
                      onChange={(e) => setAnswers({...answers, notes: e.target.value})}
                      className="w-full h-full min-h-[300px] bg-secondary/20 border border-dashed border-border rounded-2xl p-8 outline-none focus:ring-2 focus:ring-primary/50 font-mono text-sm leading-relaxed resize-none shadow-xl"
                      placeholder="Escribí acá tu razonamiento, cálculos auxiliares o justificaciones..."
                    />
                  </div>

                  <div className="pt-4 space-y-4">
                    <div className="flex gap-4">
                      <button 
                        type="button"
                        onClick={() => setSelectedChallenge(null)}
                        className="flex-1 py-4 bg-secondary text-foreground rounded-2xl font-black uppercase tracking-widest text-[9px] border border-border hover:bg-border transition-all"
                      >
                        Cerrar
                      </button>
                      <button 
                        onClick={handleSubmitChallenge}
                        disabled={isSubmitting}
                        className="flex-[2] py-4 bg-primary text-white rounded-2xl font-black uppercase tracking-[0.2em] text-[9px] shadow-xl flex items-center justify-center gap-3 disabled:opacity-50"
                      >
                        <Send size={16} />
                        {isSubmitting ? "Enviando..." : "Enviar para Acreditación"}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
