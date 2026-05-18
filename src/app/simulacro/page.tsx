"use client";

import React, { useEffect, useRef, useState } from "react";
import {
  Brain,
  BookOpen,
  Play,
  RotateCcw,
  Home,
  Send,
  Loader2,
  GraduationCap,
  CheckCircle2,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { getStudentDashboard } from "@/app/actions/student";
import Link from "next/link";

interface Subject {
  id: string;
  name: string;
}

interface Message {
  role: "user" | "assistant";
  content: string;
}

type Step = "select" | "exam" | "feedback";

const TOTAL_QUESTIONS = 5;

function countAssistantMessages(messages: Message[]): number {
  return messages.filter((m) => m.role === "assistant").length;
}

export default function SimulacroPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loadingSubjects, setLoadingSubjects] = useState(true);
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);

  const [step, setStep] = useState<Step>("select");
  const [messages, setMessages] = useState<Message[]>([]);
  const [userInput, setUserInput] = useState("");
  const [sending, setSending] = useState(false);
  const [feedbackContent, setFeedbackContent] = useState("");
  const [loadingFeedback, setLoadingFeedback] = useState(false);

  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isLoading && (!user || user.role !== "student")) {
      router.push("/login");
    }
  }, [user, isLoading, router]);

  useEffect(() => {
    if (user?.id) {
      getStudentDashboard(user.id).then((res) => {
        if (res.success && res.subjects) {
          setSubjects(res.subjects as Subject[]);
        }
        setLoadingSubjects(false);
      });
    }
  }, [user]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const callSimulateAPI = async (msgs: Message[], mode: "exam" | "feedback") => {
    const res = await fetch("/api/simulate-exam", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-user-id": user?.id ?? "",
      },
      body: JSON.stringify({
        messages: msgs,
        subjectName: selectedSubject?.name ?? "",
        mode,
      }),
    });
    const data = await res.json();
    return (data.content as string) ?? "";
  };

  const handleStart = async () => {
    if (!selectedSubject) return;
    setSending(true);
    setStep("exam");
    setMessages([]);
    setFeedbackContent("");

    const firstMsg = await callSimulateAPI([], "exam");
    const cleanFirst = firstMsg.replace("SIMULACRO_COMPLETO", "").trim();
    setMessages([{ role: "assistant", content: cleanFirst }]);
    setSending(false);
  };

  const handleSend = async () => {
    if (!userInput.trim() || sending) return;
    const newMessages: Message[] = [...messages, { role: "user", content: userInput.trim() }];
    setMessages(newMessages);
    setUserInput("");
    setSending(true);

    const reply = await callSimulateAPI(newMessages, "exam");
    const isComplete = reply.includes("SIMULACRO_COMPLETO");
    const cleanReply = reply.replace("SIMULACRO_COMPLETO", "").trim();

    const updated: Message[] = [...newMessages, { role: "assistant", content: cleanReply }];
    setMessages(updated);
    setSending(false);

    if (isComplete) {
      // Trigger feedback
      setLoadingFeedback(true);
      setStep("feedback");
      const fb = await callSimulateAPI(updated, "feedback");
      setFeedbackContent(fb);
      setLoadingFeedback(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleReset = () => {
    setStep("select");
    setMessages([]);
    setUserInput("");
    setFeedbackContent("");
    setSending(false);
    setLoadingFeedback(false);
  };

  const questionNumber = Math.min(countAssistantMessages(messages), TOTAL_QUESTIONS);

  if (isLoading || loadingSubjects) {
    return (
      <div className="p-8 max-w-4xl mx-auto">
        <div className="animate-pulse space-y-8">
          <div className="h-16 bg-secondary rounded-[2.5rem] w-1/3" />
          <div className="h-64 bg-secondary rounded-[2.5rem]" />
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <header className="mb-12">
        <h1 className="text-6xl font-black tracking-tighter mb-4 uppercase italic leading-none">
          Simulacro <span className="text-primary">IA</span>
        </h1>
        <div className="flex items-center gap-6">
          <p className="text-muted-foreground text-[10px] font-black uppercase tracking-[0.3em]">
            Practicá tu mesa de examen con inteligencia artificial
          </p>
          <div className="h-px flex-1 bg-border/50" />
        </div>
      </header>

      <AnimatePresence mode="wait">
        {/* STEP 1: Select subject */}
        {step === "select" && (
          <motion.div
            key="select"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-10"
          >
            {/* How it works */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { icon: BookOpen, label: "Elegís la materia", desc: "Seleccioná una de tus materias inscriptas." },
                { icon: GraduationCap, label: "La IA te examina", desc: "Te hace 5 preguntas orales como en una mesa real." },
                { icon: CheckCircle2, label: "Recibís devolución", desc: "Al final obtenés una nota estimada y consejos." },
              ].map(({ icon: Icon, label, desc }, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.07 }}
                  className="p-6 bg-card border border-border rounded-[2rem] flex flex-col gap-3"
                >
                  <div className="w-12 h-12 rounded-[1rem] bg-primary/10 flex items-center justify-center text-primary">
                    <Icon size={22} />
                  </div>
                  <div>
                    <p className="text-sm font-black uppercase tracking-tight">{label}</p>
                    <p className="text-xs text-muted-foreground mt-1">{desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Subject selector */}
            <div className="bg-card border border-border rounded-[2.5rem] p-8 space-y-6">
              <h2 className="text-xl font-black uppercase tracking-tighter">Elegí una materia</h2>

              {subjects.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No tenés materias inscriptas. Pedile al administrador que te inscriba.
                </p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {subjects.map((s) => (
                    <button
                      key={s.id}
                      onClick={() => setSelectedSubject(s)}
                      className={`p-5 rounded-[1.5rem] border text-left transition-all duration-200 font-black text-sm uppercase tracking-tighter ${
                        selectedSubject?.id === s.id
                          ? "bg-primary/10 border-primary text-primary"
                          : "bg-secondary/30 border-border hover:border-primary/40 hover:bg-primary/5 text-foreground"
                      }`}
                    >
                      {s.name}
                    </button>
                  ))}
                </div>
              )}

              <button
                onClick={handleStart}
                disabled={!selectedSubject || sending}
                className="w-full py-5 px-8 bg-primary text-primary-foreground font-black uppercase tracking-[0.2em] text-sm rounded-[1.5rem] flex items-center justify-center gap-3 disabled:opacity-40 disabled:cursor-not-allowed hover:opacity-90 transition-opacity"
              >
                {sending ? <Loader2 size={20} className="animate-spin" /> : <Play size={20} />}
                {sending ? "Iniciando..." : "Iniciar Simulacro"}
              </button>
            </div>
          </motion.div>
        )}

        {/* STEP 2: Exam chat */}
        {step === "exam" && (
          <motion.div
            key="exam"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-4"
          >
            {/* Progress bar */}
            <div className="bg-card border border-border rounded-[2rem] p-5 flex items-center gap-4">
              <Brain size={20} className="text-primary shrink-0" />
              <div className="flex-1">
                <div className="flex justify-between text-[9px] font-black uppercase tracking-widest mb-1.5">
                  <span className="text-muted-foreground">Progreso del simulacro</span>
                  <span className="text-primary">{questionNumber}/{TOTAL_QUESTIONS} preguntas</span>
                </div>
                <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary rounded-full transition-all duration-500"
                    style={{ width: `${(questionNumber / TOTAL_QUESTIONS) * 100}%` }}
                  />
                </div>
              </div>
              <div className="shrink-0 px-4 py-2 rounded-full bg-primary/10 text-primary text-[9px] font-black uppercase tracking-widest border border-primary/20">
                {selectedSubject?.name}
              </div>
            </div>

            {/* Chat window */}
            <div className="bg-card border border-border rounded-[2.5rem] overflow-hidden flex flex-col" style={{ minHeight: "420px" }}>
              <div className="flex-1 overflow-y-auto p-6 space-y-4 max-h-[420px]">
                {messages.map((m, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[80%] px-5 py-4 rounded-[1.5rem] text-sm leading-relaxed font-medium whitespace-pre-wrap ${
                        m.role === "user"
                          ? "bg-primary text-primary-foreground rounded-br-md"
                          : "bg-secondary border border-border text-foreground rounded-bl-md"
                      }`}
                    >
                      {m.role === "assistant" && (
                        <span className="text-[8px] font-black uppercase tracking-[0.25em] text-muted-foreground block mb-2">
                          Profesor
                        </span>
                      )}
                      {m.content}
                    </div>
                  </motion.div>
                ))}
                {sending && (
                  <div className="flex justify-start">
                    <div className="px-5 py-4 rounded-[1.5rem] rounded-bl-md bg-secondary border border-border">
                      <Loader2 size={16} className="animate-spin text-muted-foreground" />
                    </div>
                  </div>
                )}
                <div ref={chatEndRef} />
              </div>

              {/* Input */}
              <div className="border-t border-border p-4 flex gap-3 items-end">
                <textarea
                  value={userInput}
                  onChange={(e) => setUserInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  disabled={sending}
                  placeholder="Escribí tu respuesta… (Enter para enviar)"
                  rows={2}
                  className="flex-1 bg-secondary border border-border rounded-[1.25rem] px-4 py-3 text-sm resize-none outline-none focus:border-primary/50 transition-colors placeholder:text-muted-foreground disabled:opacity-50 font-medium"
                />
                <button
                  onClick={handleSend}
                  disabled={!userInput.trim() || sending}
                  className="shrink-0 w-12 h-12 rounded-[1rem] bg-primary text-primary-foreground flex items-center justify-center disabled:opacity-40 disabled:cursor-not-allowed hover:opacity-90 transition-opacity"
                >
                  <Send size={18} />
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {/* STEP 3: Feedback */}
        {step === "feedback" && (
          <motion.div
            key="feedback"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            <div className="bg-card border border-border rounded-[2.5rem] p-10">
              <div className="flex items-center gap-4 mb-8">
                <div className="w-16 h-16 rounded-[1.5rem] bg-primary/10 flex items-center justify-center text-primary">
                  <GraduationCap size={32} />
                </div>
                <div>
                  <h2 className="text-2xl font-black uppercase tracking-tighter leading-tight">
                    Devolución del Examen
                  </h2>
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">
                    {selectedSubject?.name}
                  </p>
                </div>
              </div>

              {loadingFeedback ? (
                <div className="flex items-center gap-3 py-12 justify-center">
                  <Loader2 size={24} className="animate-spin text-primary" />
                  <span className="text-sm font-black uppercase tracking-widest text-muted-foreground">
                    El profesor está evaluando...
                  </span>
                </div>
              ) : (
                <div className="prose prose-sm max-w-none text-foreground">
                  <div className="text-sm leading-relaxed whitespace-pre-wrap font-medium text-foreground">
                    {feedbackContent}
                  </div>
                </div>
              )}
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={handleReset}
                className="flex-1 py-4 px-6 border border-border bg-card rounded-[1.5rem] font-black uppercase tracking-[0.15em] text-sm flex items-center justify-center gap-2 hover:border-primary/40 transition-colors"
              >
                <RotateCcw size={18} />
                Volver a intentar
              </button>
              <Link
                href="/"
                className="flex-1 py-4 px-6 bg-primary text-primary-foreground rounded-[1.5rem] font-black uppercase tracking-[0.15em] text-sm flex items-center justify-center gap-2 hover:opacity-90 transition-opacity"
              >
                <Home size={18} />
                Volver al inicio
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
