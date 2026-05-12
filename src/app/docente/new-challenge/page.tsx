"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { PlusCircle, ArrowLeft, BookOpen, Target, Settings, HelpCircle, Save, Trash2, Plus } from "lucide-react";
import { getTeacherDashboard } from "@/app/actions/teacher";
import { createChallenge } from "@/app/actions/admin";
import Link from "next/link";
import { useToast } from "@/context/ToastContext";
import { motion, AnimatePresence } from "framer-motion";

export default function TeacherNewChallengePage() {
  const { user, isLoading: authLoading } = useAuth();
  const { showToast } = useToast();
  const router = useRouter();
  const [subjects, setSubjects] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [form, setForm] = useState({
    title: "",
    objective: "",
    subjectId: "",
    type: "REGULAR" as "REGULAR" | "DIAGNOSTICO" | "AUTOEVALUACION",
    content: {
      theory: "",
      questions: [
        { id: Date.now(), question: "", answer: "", type: "TEXT" as "TEXT" | "TRUE_FALSE" | "MULTIPLE_CHOICE", options: [""] }
      ]
    }
  });

  useEffect(() => {
    if (user?.role === "teacher") {
      loadData();
    }
  }, [user]);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const res = await getTeacherDashboard(user!.id);
      if (res.success && res.subjects) {
        setSubjects(res.subjects);
        if (res.subjects.length > 0) {
          setForm(prev => ({ ...prev, subjectId: res.subjects[0].id }));
        }
      }
    } catch (error) {
      console.error("Error cargando materias:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const addQuestion = () => {
    setForm({
      ...form,
      content: {
        ...form.content,
        questions: [...form.content.questions, { id: Date.now(), question: "", answer: "", type: "TEXT", options: [""] }]
      }
    });
  };

  const removeQuestion = (id: number) => {
    if (form.content.questions.length <= 1) return;
    setForm({
      ...form,
      content: {
        ...form.content,
        questions: form.content.questions.filter(q => q.id !== id)
      }
    });
  };

  const updateQuestion = (id: number, field: string, value: any) => {
    setForm({
      ...form,
      content: {
        ...form.content,
        questions: form.content.questions.map(q => {
          if (q.id === id) {
            const updated = { ...q, [field]: value };
            if (field === "type" && value === "TRUE_FALSE") {
              updated.options = ["Verdadero", "Falso"];
              updated.answer = "";
            } else if (field === "type" && value === "MULTIPLE_CHOICE" && q.type !== "MULTIPLE_CHOICE") {
              updated.options = ["Opción 1", "Opción 2"];
              updated.answer = "";
            }
            return updated;
          }
          return q;
        })
      }
    });
  };

  const updateOption = (qId: number, index: number, value: string) => {
    setForm({
      ...form,
      content: {
        ...form.content,
        questions: form.content.questions.map(q => {
          if (q.id === qId) {
            const newOptions = [...q.options];
            newOptions[index] = value;
            return { ...q, options: newOptions };
          }
          return q;
        })
      }
    });
  };

  const addOption = (qId: number) => {
    setForm({
      ...form,
      content: {
        ...form.content,
        questions: form.content.questions.map(q => {
          if (q.id === qId) {
            return { ...q, options: [...q.options, `Opción ${q.options.length + 1}`] };
          }
          return q;
        })
      }
    });
  };

  const removeOption = (qId: number, index: number) => {
    setForm({
      ...form,
      content: {
        ...form.content,
        questions: form.content.questions.map(q => {
          if (q.id === qId && q.options.length > 2) {
            const newOptions = q.options.filter((_, i) => i !== index);
            return { ...q, options: newOptions, answer: q.answer === q.options[index] ? "" : q.answer };
          }
          return q;
        })
      }
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.subjectId) {
      showToast("Debés seleccionar una materia", "error");
      return;
    }
    
    const res = await createChallenge(form.subjectId, form.title, form.objective, form.content, form.type);
    if (res.success) {
      showToast("¡Desafío publicado con éxito!", "success");
      router.push("/docente");
    } else {
      showToast("Error al publicar el desafío", "error");
    }
  };

  if (authLoading || isLoading) return <div className="p-20 text-center font-black animate-pulse uppercase tracking-widest text-primary">Cargando Formulario...</div>;
  if (!user || user.role !== "teacher") return <div className="p-20 text-center font-black uppercase tracking-widest text-primary">Acceso Denegado</div>;

  return (
    <div className="p-8 max-w-5xl mx-auto pb-24">
      <header className="mb-12">
        <Link href="/docente" className="flex items-center gap-2 text-primary font-black text-[10px] uppercase tracking-widest mb-4 hover:underline">
          <ArrowLeft size={14} /> Volver al Panel
        </Link>
        <h1 className="text-5xl font-black tracking-tighter uppercase italic leading-none">Nuevo <span className="text-primary">Desafío</span></h1>
      </header>

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <section className="bg-card border border-border rounded-[2.5rem] p-8 shadow-sm space-y-6">
            <h2 className="text-[10px] font-black uppercase tracking-widest text-primary flex items-center gap-2">
              <Settings size={16} /> Configuración Básica
            </h2>
            
            <div>
              <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-2 block">Materia Asociada</label>
              <select 
                required 
                value={form.subjectId} 
                onChange={e => setForm({...form, subjectId: e.target.value})}
                className="w-full bg-secondary/30 border border-border rounded-xl p-4 font-bold outline-none focus:ring-2 focus:ring-primary/50 text-foreground appearance-none cursor-pointer"
                style={{ colorScheme: 'dark' }}
              >
                {subjects.map(s => (
                  <option key={s.id} value={s.id} className="bg-background text-foreground py-2">
                    {s.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-2 block">Título del Desafío</label>
              <input 
                required 
                value={form.title} 
                onChange={e => setForm({...form, title: e.target.value})}
                className="w-full bg-secondary/30 border border-border rounded-xl p-4 font-bold outline-none focus:ring-2 focus:ring-primary/50"
                placeholder="Ej: Análisis de Balance Patrimonial"
              />
            </div>

            <div>
              <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-2 block">Tipo de Instancia</label>
              <select 
                required 
                value={form.type} 
                onChange={e => setForm({...form, type: e.target.value as any})}
                className="w-full bg-secondary/30 border border-border rounded-xl p-4 font-bold outline-none focus:ring-2 focus:ring-primary/50 text-foreground appearance-none cursor-pointer"
                style={{ colorScheme: 'dark' }}
              >
                <option value="REGULAR">Módulo de Aprendizaje (Con IA)</option>
                <option value="DIAGNOSTICO">Diagnóstico Inicial (Sin IA)</option>
                <option value="AUTOEVALUACION">Autoevaluación (Sin IA)</option>
              </select>
            </div>
          </section>

          <section className="bg-card border border-border rounded-[2.5rem] p-8 shadow-sm space-y-6">
            <h2 className="text-[10px] font-black uppercase tracking-widest text-primary flex items-center gap-2">
              <Target size={16} /> Objetivo Pedagógico
            </h2>
            <textarea 
              required 
              value={form.objective} 
              onChange={e => setForm({...form, objective: e.target.value})}
              className="w-full h-[180px] bg-secondary/30 border border-border rounded-xl p-4 font-bold outline-none focus:ring-2 focus:ring-primary/50 resize-none"
              placeholder="¿Qué competencia técnica va a acreditar el alumno con este desafío?"
            />
          </section>
        </div>

        <section className="bg-card border border-border rounded-[2.5rem] p-8 shadow-sm space-y-8">
          <h2 className="text-[10px] font-black uppercase tracking-widest text-primary flex items-center gap-2">
            <HelpCircle size={16} /> Lógica del Desafío
          </h2>
          
          <div className="space-y-6">
            <div className="p-6 bg-secondary/10 border border-border rounded-2xl">
              <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-3 block">Contenido Teórico / Contexto</label>
              <textarea 
                required
                value={form.content.theory}
                onChange={e => setForm({...form, content: {...form.content, theory: e.target.value}})}
                className="w-full h-32 bg-background border border-border rounded-xl p-4 font-medium outline-none focus:ring-2 focus:ring-primary/50 resize-none"
                placeholder="Describe el escenario o la teoría necesaria..."
              />
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-center px-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground block">Preguntas de Validación</label>
                <button 
                  type="button" 
                  onClick={addQuestion}
                  className="flex items-center gap-2 text-[10px] font-black uppercase text-primary hover:underline"
                >
                  <Plus size={14} /> Añadir Pregunta
                </button>
              </div>

              <AnimatePresence>
                {form.content.questions.map((q, index) => (
                  <motion.div 
                    key={q.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="p-6 bg-secondary/10 border border-border rounded-2xl relative group"
                  >
                    {form.content.questions.length > 1 && (
                      <button 
                        type="button"
                        onClick={() => removeQuestion(q.id)}
                        className="absolute top-4 right-4 p-2 text-muted-foreground hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                    <div className="grid grid-cols-1 gap-4">
                      <div className="flex gap-4">
                        <div className="flex-[3]">
                          <label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground mb-2 block">Pregunta {index + 1}</label>
                          <input 
                            required
                            value={q.question}
                            onChange={e => updateQuestion(q.id, "question", e.target.value)}
                            className="w-full bg-background border border-border rounded-xl p-4 font-bold outline-none focus:ring-2 focus:ring-primary/50"
                            placeholder="Ej: ¿Cuál es el activo corriente total?"
                          />
                        </div>
                        <div className="flex-1">
                          <label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground mb-2 block">Formato</label>
                          <select
                            value={q.type || "TEXT"}
                            onChange={e => updateQuestion(q.id, "type", e.target.value)}
                            className="w-full bg-background border border-border rounded-xl p-4 font-bold outline-none focus:ring-2 focus:ring-primary/50 appearance-none"
                            style={{ colorScheme: 'dark' }}
                          >
                            <option value="TEXT">Texto Libre</option>
                            <option value="TRUE_FALSE">V/F</option>
                            <option value="MULTIPLE_CHOICE">Opciones</option>
                          </select>
                        </div>
                      </div>

                      {(!q.type || q.type === "TEXT") && (
                        <div>
                          <label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground mb-2 block">Respuesta Esperada</label>
                          <input 
                            required
                            value={q.answer}
                            onChange={e => updateQuestion(q.id, "answer", e.target.value)}
                            className="w-full bg-background border border-border rounded-xl p-4 font-mono font-bold outline-none focus:ring-2 focus:ring-primary/50"
                            placeholder="Valor o concepto clave..."
                          />
                        </div>
                      )}

                      {q.type === "TRUE_FALSE" && (
                        <div>
                          <label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground mb-2 block">Respuesta Correcta</label>
                          <div className="flex gap-4">
                            {q.options.map((opt: string) => (
                              <button
                                key={opt}
                                type="button"
                                onClick={() => updateQuestion(q.id, "answer", opt)}
                                className={`flex-1 p-4 rounded-xl font-bold transition-all border ${q.answer === opt ? "bg-primary text-white border-primary" : "bg-background border-border hover:border-primary/50 text-foreground"}`}
                              >
                                {opt}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}

                      {q.type === "MULTIPLE_CHOICE" && (
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground block">Opciones Múltiples</label>
                            <button type="button" onClick={() => addOption(q.id)} className="text-[9px] font-black uppercase text-primary hover:underline flex items-center gap-1">
                              <Plus size={12} /> Añadir
                            </button>
                          </div>
                          {q.options.map((opt: string, optIndex: number) => (
                            <div key={optIndex} className="flex gap-2 items-center">
                              <button
                                type="button"
                                onClick={() => updateQuestion(q.id, "answer", opt)}
                                className={`w-8 h-8 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${q.answer === opt ? "border-primary bg-primary text-white" : "border-border hover:border-primary/50"}`}
                              >
                                {q.answer === opt && <CheckCircle2 size={16} />}
                              </button>
                              <input 
                                required
                                value={opt}
                                onChange={e => {
                                  updateOption(q.id, optIndex, e.target.value);
                                  if (q.answer === opt) updateQuestion(q.id, "answer", e.target.value);
                                }}
                                className="flex-1 bg-background border border-border rounded-xl p-3 font-bold outline-none focus:ring-2 focus:ring-primary/50"
                                placeholder={`Opción ${optIndex + 1}`}
                              />
                              {q.options.length > 2 && (
                                <button type="button" onClick={() => removeOption(q.id, optIndex)} className="p-2 text-muted-foreground hover:text-red-500 shrink-0">
                                  <X size={16} />
                                </button>
                              )}
                            </div>
                          ))}
                          <p className="text-[9px] text-muted-foreground uppercase mt-2">Marcá el círculo para indicar cuál es la opción correcta.</p>
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>
        </section>

        <button 
          type="submit" 
          className="w-full py-6 bg-primary text-white rounded-[2rem] font-black uppercase tracking-[0.4em] text-xs shadow-2xl shadow-primary/30 hover:scale-[1.01] transition-all flex items-center justify-center gap-3"
        >
          <Save size={20} />
          Publicar Desafío en el Aula
        </button>
      </form>
    </div>
  );
}
