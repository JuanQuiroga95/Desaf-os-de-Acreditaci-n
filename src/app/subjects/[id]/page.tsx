/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useEffect, useState, use } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { BookOpen, CheckCircle2, Play, ArrowLeft, Award, HelpCircle, Send, FileText, Target, Video, Dumbbell, MessageSquare, ClipboardList, BookMarked, Link2, Copy, Download, X as XIcon, Sparkles, Clock, Paperclip, FileUp, Loader2 } from "lucide-react";
import { getSubjectChallenges, submitChallengeResponse } from "@/app/actions/student";
import { motion, AnimatePresence } from "framer-motion";
import { useToast } from "@/context/ToastContext";
import { useUI } from "@/context/UIContext";
import Link from "next/link";
import { MathTools } from "@/components/MathTools";

export default function SubjectPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const { user, isLoading: authLoading } = useAuth();
  const { showToast } = useToast();
  const { setAIBlocked } = useUI();
  const router = useRouter();
  const [isUploading, setIsUploading] = useState(false);
  const [subject, setSubject] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedChallenge, setSelectedChallenge] = useState<any>(null);

  useEffect(() => {
    if (selectedChallenge) {
      if (selectedChallenge.type === "DIAGNOSTICO" || selectedChallenge.type === "AUTOEVALUACION") {
        setAIBlocked(true);
      } else {
        setAIBlocked(false);
      }
    } else {
      setAIBlocked(false);
    }
  }, [selectedChallenge, setAIBlocked]);
  const [answers, setAnswers] = useState<{[key: string]: string}>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedMaterial, setSelectedMaterial] = useState<any>(null);
  const [copiedPrompt, setCopiedPrompt] = useState<string | null>(null);
  const [lastFocusedInput, setLastFocusedInput] = useState<string>("notes");

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
      const res = await submitChallengeResponse(selectedChallenge.id, user!.id, answers);
      if (res.success) {
        if (res.score !== undefined && res.score !== null) {
          showToast(`¡Desafío enviado! ${res.feedback} Calificación: ${res.score}/10`, "success");
        } else {
          showToast("¡Desafío enviado! Pendiente de corrección.", "success");
        }
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
            <p className="text-muted-foreground text-[10px] uppercase font-bold tracking-[0.4em] mt-2">
              Docente: {subject?.teacher?.name || "Desconocido"} • Modelo: Recuperación Activa Asistida
            </p>
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
            <h2 className="text-xl font-black mb-8 flex items-center justify-between italic uppercase text-[10px] tracking-[0.2em] text-primary">
              <span className="flex items-center gap-3">
                <BookOpen size={18} />
                Hoja de Ruta: 4 Encuentros Obligatorios
              </span>
              <span className="bg-primary/10 px-3 py-1 rounded-full text-[8px] font-black border border-primary/20">80% Asistencia Requerida</span>
            </h2>
            
            <div className="space-y-4">
              {subject?.challenges?.map((challenge: { id: string; title: string; type: string; progress: any[] }, i: number) => {
                const isCompleted = (challenge.progress?.length || 0) > 0 && challenge.progress[0].status === "COMPLETED";
                const isGraded = isCompleted && (challenge.progress[0]?.score !== null && challenge.progress[0]?.score !== undefined);
                
                let label = `Encuentro ${i + 1}`;
                let colorClass = "bg-secondary text-muted-foreground";
                let icon = <span className="font-black">{i + 1}</span>;

                if (challenge.type === "DIAGNOSTICO") {
                  label = "Diagnóstico Inicial";
                  colorClass = "bg-orange-500/20 text-orange-500 border-orange-500/30";
                  icon = <Sparkles size={20} />;
                } else if (challenge.type === "AUTOEVALUACION") {
                  label = "Autoevaluación (Sin IA)";
                  colorClass = "bg-purple-500/20 text-purple-500 border-purple-500/30";
                  icon = <Award size={20} />;
                }

                if (isGraded) {
                  colorClass = "bg-green-500 text-white";
                  icon = <CheckCircle2 size={24} />;
                } else if (isCompleted) {
                  colorClass = "bg-primary text-white";
                  icon = <CheckCircle2 size={24} />;
                }

                const isPreviousCompleted = i === 0 || (subject.challenges[i-1].progress?.length > 0 && subject.challenges[i-1].progress[0].status === "COMPLETED");
                const isLocked = !isCompleted && !isPreviousCompleted;
                
                // Autoevaluacion special locking: require all regular challenges to be done
                const regularChallenges = subject.challenges.filter((c: any) => c.type === "REGULAR");
                const allRegularCompleted = regularChallenges.every((c: any) => c.progress?.length > 0 && c.progress[0].status === "COMPLETED");
                const isFinalLocked = challenge.type === "AUTOEVALUACION" && !allRegularCompleted;

                return (
                  <div 
                    key={challenge.id} 
                    className={`p-6 rounded-[2rem] border transition-all flex items-center justify-between ${
                      isCompleted ? "bg-secondary/10 border-border" : "bg-card border-border hover:border-primary/50"
                    } ${(isLocked || isFinalLocked) ? "opacity-50 grayscale" : ""}`}
                  >
                    <div className="flex items-center gap-6">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center ${colorClass}`}>
                        {icon}
                      </div>
                      <div>
                        <h3 className="font-bold text-lg">{label}: {challenge.title}</h3>
                        <p className="text-xs text-muted-foreground uppercase font-black tracking-widest">
                          {challenge.type === "REGULAR" ? "Módulo de Aprendizaje" : challenge.type === "AUTOEVALUACION" ? "Autoevaluación Automática" : "Examen Obligatorio (Sin IA)"} • {isGraded ? `Calificación: ${challenge.progress[0]?.score}/10` : isCompleted ? "Pendiente de Calificación" : "Pendiente"}
                        </p>
                      </div>
                    </div>
                    
                    {isCompleted ? (
                      <div className="bg-secondary/30 text-muted-foreground px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest border border-border">
                        Completado
                      </div>
                    ) : (isLocked || isFinalLocked) ? (
                      <div className="bg-secondary/30 text-muted-foreground px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest border border-border flex items-center gap-2">
                        <Clock size={14} /> Bloqueado
                      </div>
                    ) : (
                      <button 
                        onClick={() => handleOpenChallenge(challenge)}
                        className="bg-primary text-white px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-all shadow-lg shadow-primary/20 flex items-center gap-2"
                      >
                        <Play size={14} fill="currentColor" />
                        Comenzar
                      </button>
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
              <FileText size={16} /> Guía Digital del Módulo
            </h3>
            {(!subject?.materials || subject.materials.length === 0) ? (
              <p className="text-[10px] text-muted-foreground uppercase font-black tracking-widest">El docente aún no cargó materiales.</p>
            ) : (
              <div className="space-y-2">
                {[
                  { type: "THEORY", label: "Teoría", icon: FileText, color: "text-blue-400" },
                  { type: "VIDEO", label: "Videos", icon: Video, color: "text-red-400" },
                  { type: "EXERCISE", label: "Ejercicios", icon: Dumbbell, color: "text-green-400" },
                  { type: "PROMPT", label: "Prompts IA", icon: MessageSquare, color: "text-purple-400" },
                  { type: "TP_TEMPLATE", label: "Plantilla TP", icon: ClipboardList, color: "text-orange-400" },
                  { type: "RUBRIC", label: "Rúbrica", icon: BookMarked, color: "text-yellow-400" },
                ].map(({ type, label, icon: Icon, color }) => {
                  const items = subject.materials.filter((m: any) => m.type === type);
                  if (items.length === 0) return null;
                  return (
                    <div key={type}>
                      <p className={`text-[9px] font-black uppercase tracking-widest mb-1 ${color}`}>{label} ({items.length})</p>
                      {items.map((mat: any) => (
                        <button key={mat.id} onClick={() => setSelectedMaterial(mat)}
                          className="w-full p-3 mb-1 bg-card rounded-xl border border-border flex items-center justify-between group hover:border-primary/50 transition-all text-left">
                          <span className="text-[10px] font-bold truncate pr-2">{mat.title}</span>
                          <Play size={10} className="text-primary shrink-0 group-hover:translate-x-0.5 transition-transform" />
                        </button>
                      ))}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="bg-primary/10 border border-primary/20 rounded-[2.5rem] p-8 shadow-sm">
            <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-primary mb-6 flex items-center gap-3">
              <Award size={16} /> Sistema de Bonus
            </h3>
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-8 h-8 rounded-lg bg-primary/20 text-primary flex items-center justify-center font-black text-xs">+10%</div>
                <p className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground">TP Final Prolijo</p>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-8 h-8 rounded-lg bg-primary/20 text-primary flex items-center justify-center font-black text-xs">+10%</div>
                <p className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground">Asistencia Perfecta</p>
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
              className={`bg-card border border-border w-full rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col max-h-[95vh] ${selectedChallenge.fileUrl ? 'max-w-[95vw]' : 'max-w-5xl'}`}
            >
              {/* V2 - 2 Column Layout */}
              <div className="p-8 border-b border-border flex justify-between items-center bg-primary/20 shrink-0">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-primary/20 text-primary flex items-center justify-center font-black">
                    <HelpCircle size={24} />
                  </div>
                  <div>
                    <h3 className="font-black uppercase italic text-xl">{selectedChallenge.title}</h3>
                    <p className="text-[10px] font-bold text-muted-foreground uppercase">
                      {selectedChallenge.type === "REGULAR" ? "Resolución de Desafío" : selectedChallenge.type === "AUTOEVALUACION" ? "Autoevaluación con Autocorrección" : "Diagnóstico Inicial"}
                    </p>
                  </div>
                </div>
                {(selectedChallenge.type === "DIAGNOSTICO" || selectedChallenge.type === "AUTOEVALUACION") && (
                  <div className="bg-red-500 text-white px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-2 animate-pulse">
                    <Sparkles size={12} />
                    Entorno Protegido (IA Desactivada)
                  </div>
                )}
                <button onClick={() => setSelectedChallenge(null)} className="w-10 h-10 rounded-full bg-background border border-border flex items-center justify-center hover:bg-red-500 hover:text-white transition-all">✕</button>
              </div>
              
              <div className="flex-1 overflow-hidden flex flex-col lg:flex-row">
                {/* Left Side: PDF Viewer (Optional) */}
                {selectedChallenge.fileUrl && (
                  <div className="w-full lg:w-1/2 border-r border-border bg-secondary/5 h-full">
                    <iframe 
                      src={selectedChallenge.fileUrl} 
                      className="w-full h-full border-none bg-white"
                      title="PDF Original"
                    />
                  </div>
                )}

                {/* Middle/Left: Questions */}
                <div className={`flex-1 p-8 space-y-8 overflow-y-auto border-r border-border/50 bg-secondary/10 ${selectedChallenge.fileUrl ? 'lg:w-1/4' : ''}`}>
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
                        <label className="text-[10px] font-black uppercase text-muted-foreground block tracking-widest mb-3">
                          {index + 1}. {q.question}
                        </label>
                        {(!q.type || q.type === "TEXT") && (
                          <input 
                            required
                            value={answers[q.id] || ""}
                            onChange={(e) => setAnswers({...answers, [q.id]: e.target.value})}
                            onFocus={() => setLastFocusedInput(q.id)}
                            className="w-full bg-background border border-border rounded-xl p-4 font-bold outline-none focus:ring-2 focus:ring-primary/50 transition-all shadow-inner"
                            placeholder="Tu respuesta..."
                          />
                        )}
                        {(q.type === "TRUE_FALSE" || q.type === "MULTIPLE_CHOICE") && (
                          <div className={`grid gap-3 ${q.type === "TRUE_FALSE" ? "grid-cols-2" : "grid-cols-1"}`}>
                            {q.options?.map((opt: string, optIndex: number) => (
                              <label
                                key={optIndex}
                                className={`flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                                  answers[q.id] === opt 
                                    ? "border-primary bg-primary/10" 
                                    : "border-border hover:border-primary/50 bg-background"
                                }`}
                              >
                                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${
                                  answers[q.id] === opt ? "border-primary" : "border-muted-foreground"
                                }`}>
                                  {answers[q.id] === opt && <div className="w-2.5 h-2.5 bg-primary rounded-full" />}
                                </div>
                                <input
                                  type="radio"
                                  name={`question_${q.id}`}
                                  value={opt}
                                  checked={answers[q.id] === opt}
                                  onChange={(e) => setAnswers({...answers, [q.id]: e.target.value})}
                                  className="hidden"
                                />
                                <span className={`font-bold ${answers[q.id] === opt ? "text-foreground" : "text-muted-foreground"}`}>
                                  {opt}
                                </span>
                              </label>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Right Side: Notepad / Desarrollo */}
                <div className={`w-full p-8 bg-card flex flex-col space-y-4 overflow-y-auto ${selectedChallenge.fileUrl ? 'lg:w-1/4' : 'md:w-[40%]'}`}>
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-[10px] font-black uppercase text-primary tracking-[0.2em] flex items-center gap-2">
                      <FileText size={16} /> Block de Notas y Cálculos
                    </h4>
                  </div>
                  
                  <div className="flex-1 relative group">
                    <MathTools onInsertSymbol={(sym) => setAnswers(prev => ({ ...prev, [lastFocusedInput]: (prev[lastFocusedInput] || "") + sym }))} />
                    <div className="absolute inset-0 bg-[radial-gradient(#3b82f6_1px,transparent_1px)] [background-size:20px_20px] opacity-[0.03] pointer-events-none" />
                    <textarea 
                      value={answers["notes"] || ""}
                      onChange={(e) => setAnswers({...answers, notes: e.target.value})}
                      onFocus={() => setLastFocusedInput("notes")}
                      className="w-full h-full min-h-[300px] bg-secondary/20 border border-dashed border-border rounded-2xl p-8 pt-16 outline-none focus:ring-2 focus:ring-primary/50 font-mono text-sm leading-relaxed resize-none shadow-xl"
                      placeholder="Escribí acá tu razonamiento, cálculos auxiliares o justificaciones..."
                    />
                  </div>

                  <div className="bg-secondary/10 border border-dashed border-border rounded-2xl p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-[9px] font-black uppercase text-muted-foreground tracking-widest flex items-center gap-2">
                        <Paperclip size={14} /> Adjuntar Archivo (Papel, PDF, etc.)
                      </h4>
                      {answers["fileUrl"] && (
                        <span className="text-[8px] font-black uppercase text-green-500 bg-green-500/10 px-2 py-1 rounded">Cargado</span>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-4">
                      <input 
                        type="file" 
                        id="student-file" 
                        className="hidden" 
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (!file) return;
                          setIsUploading(true);
                          try {
                            const response = await fetch(`/api/upload?filename=${file.name}`, {
                              method: 'POST',
                              body: file,
                            });
                            const blob = await response.json();
                            setAnswers(prev => ({ ...prev, fileUrl: blob.url }));
                            showToast("¡Archivo adjuntado con éxito!", "success");
                          } catch (err) {
                            showToast("Error al subir archivo", "error");
                          } finally {
                            setIsUploading(false);
                          }
                        }}
                      />
                      <label 
                        htmlFor="student-file"
                        className={`flex-1 flex items-center justify-center gap-2 py-3 border-2 border-dashed border-border rounded-xl cursor-pointer hover:border-primary/50 transition-all ${isUploading ? 'opacity-50 pointer-events-none' : ''}`}
                      >
                        {isUploading ? <Loader2 size={16} className="animate-spin" /> : <FileUp size={16} className="text-primary" />}
                        <span className="text-[10px] font-bold text-muted-foreground uppercase">
                          {answers["fileUrl"] ? "Cambiar archivo" : "Seleccionar archivo"}
                        </span>
                      </label>
                    </div>
                    {answers["fileUrl"] && (
                      <p className="text-[8px] text-muted-foreground truncate mt-2 font-mono">
                        {answers["fileUrl"]}
                      </p>
                    )}
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

      {/* Material Viewer Modal */}
      <AnimatePresence>
        {selectedMaterial && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-background/80 backdrop-blur-md">
            <motion.div initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }}
              className="bg-card border border-border w-full max-w-2xl rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
              <div className="p-6 border-b border-border flex justify-between items-center bg-secondary/30 shrink-0">
                <div>
                  <p className="text-[9px] font-black uppercase tracking-widest text-primary mb-1">
                    {selectedMaterial.type === "THEORY" ? "Teoría" : selectedMaterial.type === "VIDEO" ? "Video" :
                     selectedMaterial.type === "EXERCISE" ? `Ejercicio · ${selectedMaterial.level || ""}` :
                     selectedMaterial.type === "PROMPT" ? "Prompt IA" : selectedMaterial.type === "TP_TEMPLATE" ? "Plantilla TP" : "Rúbrica"}
                  </p>
                  <h3 className="font-black uppercase italic text-lg leading-tight">{selectedMaterial.title}</h3>
                </div>
                <button onClick={() => setSelectedMaterial(null)} className="w-10 h-10 rounded-full bg-background border border-border flex items-center justify-center hover:bg-red-500 hover:text-white transition-all shrink-0">
                  <XIcon size={16} />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-8">
                {selectedMaterial.type === "VIDEO" ? (
                  selectedMaterial.fileUrl ? (
                    <video src={selectedMaterial.fileUrl} controls className="w-full rounded-2xl border border-border" />
                  ) : (
                    <a href={selectedMaterial.content} target="_blank" rel="noopener noreferrer"
                      className="flex items-center gap-3 p-6 bg-secondary/20 rounded-2xl border border-border hover:border-primary/50 transition-all group">
                      <Link2 size={20} className="text-primary shrink-0" />
                      <div>
                        <p className="font-black text-sm group-hover:text-primary transition-colors">Abrir video externo</p>
                        <p className="text-xs text-muted-foreground truncate max-w-xs">{selectedMaterial.content}</p>
                      </div>
                    </a>
                  )
                ) : selectedMaterial.type === "PROMPT" ? (
                  <div className="space-y-4">
                    <div className="p-6 bg-primary/5 border border-primary/20 rounded-2xl font-mono text-sm leading-relaxed whitespace-pre-wrap">
                      {selectedMaterial.content}
                    </div>
                    <button
                      onClick={() => { navigator.clipboard.writeText(selectedMaterial.content); setCopiedPrompt(selectedMaterial.id); setTimeout(() => setCopiedPrompt(null), 2000); }}
                      className={`w-full py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] flex items-center justify-center gap-3 transition-all ${copiedPrompt === selectedMaterial.id ? "bg-green-500 text-white" : "bg-secondary border border-border hover:bg-border"}`}
                    >
                      <Copy size={14} />
                      {copiedPrompt === selectedMaterial.id ? "¡Copiado!" : "Copiar para usar con IA"}
                    </button>
                  </div>
                ) : selectedMaterial.fileUrl ? (
                  <div className="space-y-4">
                    {/\.pdf(\?|$)/i.test(selectedMaterial.fileUrl) ? (
                      <iframe
                        src={selectedMaterial.fileUrl}
                        className="w-full h-[70vh] rounded-2xl border border-border bg-white"
                        title={selectedMaterial.title}
                      />
                    ) : (
                      <div className="p-8 bg-secondary/20 rounded-2xl border border-border text-center">
                        <FileText size={48} className="mx-auto mb-4 text-primary" />
                        <p className="font-black uppercase tracking-widest text-sm mb-1">{selectedMaterial.title}</p>
                        <p className="text-xs text-muted-foreground">Este formato no se puede previsualizar en el navegador. Descargalo para verlo.</p>
                      </div>
                    )}
                    <a
                      href={selectedMaterial.fileUrl}
                      download
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] flex items-center justify-center gap-3 bg-primary text-white hover:bg-primary/90 transition-all"
                    >
                      <Download size={14} /> Descargar archivo
                    </a>
                  </div>
                ) : (
                  <div className="prose prose-sm max-w-none text-foreground">
                    <p className="text-sm leading-relaxed whitespace-pre-wrap">{selectedMaterial.content}</p>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
