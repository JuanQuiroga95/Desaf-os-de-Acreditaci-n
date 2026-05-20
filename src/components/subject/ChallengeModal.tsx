import React, { useState } from "react";
import { motion } from "framer-motion";
import { HelpCircle, Target, FileText, Calculator, Paperclip, FileUp, Loader2, Send, ClipboardList } from "lucide-react";
import { MathTools } from "@/components/MathTools";
import { RoleplayChat } from "@/components/RoleplayChat";
import { useToast } from "@/context/ToastContext";

interface ChallengeModalProps {
  challenge: any;
  subject: any;
  onClose: () => void;
  onSubmit: (e?: React.FormEvent | React.MouseEvent | null, isRoleplayFinished?: boolean, chatLog?: any[]) => void;
  answers: Record<string, any>;
  setAnswers: React.Dispatch<React.SetStateAction<Record<string, any>>>;
  isSubmitting: boolean;
}

export function ChallengeModal({ challenge, subject, onClose, onSubmit, answers, setAnswers, isSubmitting }: ChallengeModalProps) {
  const [internalTab, setInternalTab] = useState<"QUESTIONS" | "NOTES" | "THEORY">("QUESTIONS");
  const [lastFocusedInput, setLastFocusedInput] = useState<string>("notes");
  const [isUploading, setIsUploading] = useState(false);
  const { showToast } = useToast();

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-background/80 backdrop-blur-md">
      <motion.div 
        initial={{ opacity: 0, scale: 0.98, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className={`bg-card border border-border w-full rounded-[1.5rem] shadow-[0_0_100px_-20px_rgba(0,0,0,0.5)] overflow-hidden flex flex-col max-h-[98vh] ${challenge.fileUrl ? 'max-w-[99vw]' : 'max-w-4xl'}`}
      >
        <div className="p-8 border-b border-border flex justify-between items-center bg-primary/20 shrink-0">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-primary/20 text-primary flex items-center justify-center font-black">
              <HelpCircle size={24} />
            </div>
            <div>
              <h3 className="font-black uppercase italic text-xl">{challenge.title}</h3>
              <p className="text-[10px] font-bold text-muted-foreground uppercase">
                {challenge.type === "REGULAR" ? "Resolución de Desafío" : challenge.type === "AUTOEVALUACION" ? "Autoevaluación con Autocorrección" : "Diagnóstico Inicial"}
              </p>
              <h2 className="text-sm font-black tracking-widest uppercase italic leading-none">{subject?.name}</h2>
              <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-[0.2em] mt-1">{challenge.title}</p>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-lg bg-background border border-border flex items-center justify-center hover:bg-red-500 hover:text-white transition-all">✕</button>
        </div>
        
        <div className="flex-1 overflow-hidden flex flex-col lg:flex-row bg-background min-h-[500px]">
          {challenge.fileUrl && (
            <div className="w-full lg:w-[60%] border-r border-border bg-white relative flex flex-col">
              <iframe 
                src={challenge.fileUrl} 
                className="flex-1 w-full border-none"
                title="PDF Original"
              />
            </div>
          )}

          <div className="flex-1 flex flex-col overflow-hidden bg-secondary/5">
            {challenge.type === "ROLEPLAY" ? (
              <RoleplayChat 
                challenge={challenge} 
                onFinish={(chatLog) => onSubmit(null, true, chatLog)} 
              />
            ) : (
              <>
            <div className="flex border-b border-border bg-secondary/20 p-1.5 gap-1.5 shrink-0">
              <button 
                onClick={() => setInternalTab("QUESTIONS")}
                className={`flex-1 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${internalTab === "QUESTIONS" ? "bg-primary text-white shadow-md shadow-primary/20" : "hover:bg-secondary text-muted-foreground"}`}
              >
                <Target size={12} /> Resolver
              </button>
              {challenge.content?.theory && (
                <button 
                  onClick={() => setInternalTab("THEORY")}
                  className={`flex-1 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${internalTab === "THEORY" ? "bg-primary text-white shadow-md shadow-primary/20" : "hover:bg-secondary text-muted-foreground"}`}
                >
                  <FileText size={12} /> Teoría
                </button>
              )}
              <button 
                onClick={() => setInternalTab("NOTES")}
                className={`flex-1 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${internalTab === "NOTES" ? "bg-primary text-white shadow-md shadow-primary/20" : "hover:bg-secondary text-muted-foreground"}`}
              >
                <Calculator size={12} /> Cálculos
              </button>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar">
              {internalTab === "QUESTIONS" ? (
                <div className="p-6 space-y-6">
                  {challenge.progress?.length > 0 && (() => {
                    const prog = challenge.progress[0];
                    const isGraded = prog.score !== null && prog.score !== undefined;
                    const isApproved = isGraded && prog.score >= 6;
                    const submittedAt = prog.createdAt ? new Date(prog.createdAt) : null;
                    return (
                      <div className="p-5 bg-secondary/20 border border-border rounded-2xl space-y-3">
                        <h4 className="text-[8px] font-black uppercase tracking-[0.2em] text-muted-foreground flex items-center gap-2">
                          <ClipboardList size={10} /> Tu Historial
                        </h4>
                        <div className="flex items-center gap-3 flex-wrap">
                          {isGraded ? (
                            <span className={`text-[9px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full border ${
                              isApproved
                                ? "bg-green-500/20 text-green-400 border-green-500/30"
                                : "bg-orange-500/20 text-orange-400 border-orange-500/30"
                            }`}>
                              {isApproved ? "Aprobado" : "En Revisión"} · {prog.score}/10
                            </span>
                          ) : (
                            <span className="text-[9px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full border bg-primary/10 text-primary border-primary/30">
                              Enviado · Pendiente de corrección
                            </span>
                          )}
                          {submittedAt && (
                            <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">
                              {submittedAt.toLocaleDateString("es-AR", { day: "2-digit", month: "short", year: "numeric" })}
                            </span>
                          )}
                        </div>
                        {prog.feedback && (
                          <p className="text-xs text-foreground leading-relaxed bg-card border border-border rounded-xl p-3 italic">
                            {prog.feedback}
                          </p>
                        )}
                      </div>
                    );
                  })()}

                  <div className="p-5 bg-primary/5 border border-primary/20 rounded-2xl relative overflow-hidden group">
                    <h4 className="text-[8px] font-black uppercase text-primary mb-2 flex items-center gap-2 tracking-[0.2em]">
                      <Target size={10} /> Objetivo a Acreditar
                    </h4>
                    <p className="text-xs text-foreground font-bold italic leading-relaxed relative z-10">"{challenge.objective}"</p>
                  </div>

                  <div className="space-y-6">
                    {challenge.content?.questions?.map((q: any, index: number) => (
                      <div key={q.id} className="p-6 bg-card border border-border rounded-2xl shadow-sm hover:border-primary/20 transition-all group">
                        <div className="flex items-start gap-3 mb-4">
                          <span className="w-7 h-7 rounded-lg bg-secondary flex items-center justify-center text-[10px] font-black text-primary group-hover:bg-primary group-hover:text-white transition-all shadow-inner shrink-0">
                            {index + 1}
                          </span>
                          <label className="flex-1 text-[11px] font-black uppercase text-foreground leading-relaxed tracking-widest pt-1.5">
                            Punto {index + 1}
                          </label>
                        </div>
                        {(!q.type || q.type === "TEXT") && (
                          <input 
                            required
                            value={answers[q.id] || ""}
                            onChange={(e) => setAnswers({...answers, [q.id]: e.target.value})}
                            onFocus={() => setLastFocusedInput(q.id)}
                            className="w-full bg-background border border-border rounded-xl p-3 text-sm font-bold outline-none focus:ring-2 focus:ring-primary/50 transition-all shadow-inner"
                            placeholder="Tu respuesta..."
                          />
                        )}
                        {(q.type === "TRUE_FALSE" || q.type === "MULTIPLE_CHOICE") && (
                          <div className={`grid gap-2 ${q.type === "TRUE_FALSE" ? "grid-cols-2" : "grid-cols-1"}`}>
                            {q.options?.map((opt: string, optIndex: number) => (
                              <label
                                key={optIndex}
                                className={`flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all ${
                                  answers[q.id] === opt 
                                    ? "border-primary bg-primary/10" 
                                    : "border-border hover:border-primary/50 bg-background"
                                }`}
                              >
                                <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 ${
                                  answers[q.id] === opt ? "border-primary" : "border-muted-foreground"
                                }`}>
                                  {answers[q.id] === opt && <div className="w-2 h-2 bg-primary rounded-full" />}
                                </div>
                                <input
                                  type="radio"
                                  name={`question_${q.id}`}
                                  value={opt}
                                  checked={answers[q.id] === opt}
                                  onChange={(e) => setAnswers({...answers, [q.id]: e.target.value})}
                                  className="hidden"
                                />
                                <span className={`text-[11px] font-bold ${answers[q.id] === opt ? "text-foreground" : "text-muted-foreground"}`}>
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
              ) : internalTab === "THEORY" ? (
                <div className="p-8 space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <div className="max-w-none prose prose-invert">
                    <h3 className="text-base font-black uppercase italic tracking-tighter mb-4 border-b-2 border-primary inline-block">Apunte Teórico</h3>
                    <div className="text-xs text-muted-foreground leading-relaxed whitespace-pre-wrap bg-secondary/10 p-6 rounded-2xl border border-border shadow-inner">
                      {challenge.content?.theory}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-6 h-full flex flex-col space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <div className="flex-1 relative">
                    <MathTools onInsertSymbol={(sym) => setAnswers(prev => ({ ...prev, [lastFocusedInput]: (prev[lastFocusedInput] || "") + sym }))} />
                    <div className="absolute inset-0 bg-[radial-gradient(#3b82f6_1px,transparent_1px)] [background-size:24px_24px] opacity-[0.05] pointer-events-none rounded-2xl" />
                    <textarea 
                      value={answers["notes"] || ""}
                      onChange={(e) => setAnswers({...answers, notes: e.target.value})}
                      onFocus={() => setLastFocusedInput("notes")}
                      className="w-full h-full min-h-[300px] bg-card border-2 border-border rounded-2xl p-6 pt-16 outline-none focus:ring-4 focus:ring-primary/5 font-mono text-sm leading-relaxed resize-none shadow-xl transition-all"
                      placeholder="Escribí acá tu razonamiento o cálculos..."
                    />
                  </div>

                  <div className="bg-primary/5 border border-dashed border-primary/20 rounded-2xl p-6 group hover:border-primary/40 transition-all">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-[9px] font-black uppercase text-primary tracking-[0.2em] flex items-center gap-2">
                        <Paperclip size={14} /> Adjuntar Evidencia
                      </h4>
                      {answers["fileUrl"] && (
                        <div className="flex items-center gap-2 bg-green-500 text-white px-3 py-1 rounded-full shadow-lg">
                          <span className="text-[8px] font-black uppercase">Vinculado</span>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <input type="file" id="student-file" className="hidden" 
                        onChange={async (e) => {
                          const file = e.target.files?.[0]; if (!file) return;
                          setIsUploading(true);
                          try {
                            const response = await fetch(`/api/upload?filename=${file.name}`, { method: 'POST', body: file });
                            const blob = await response.json();
                            setAnswers(prev => ({ ...prev, fileUrl: blob.url }));
                            showToast("¡Archivo adjuntado!", "success");
                          } catch (err) { showToast("Error al subir", "error"); } finally { setIsUploading(false); }
                        }}
                      />
                      <label htmlFor="student-file"
                        className={`flex-1 flex items-center justify-center gap-3 py-4 bg-background border-2 border-dashed border-border rounded-xl cursor-pointer hover:border-primary hover:bg-primary/5 transition-all ${isUploading ? 'opacity-50' : ''}`}
                      >
                        {isUploading ? <Loader2 size={16} className="animate-spin text-primary" /> : <FileUp size={16} className="text-primary" />}
                        <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">
                          {answers["fileUrl"] ? "Cambiar Archivo" : "Subir Escaneos"}
                        </span>
                      </label>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="p-6 border-t border-border bg-secondary/10 shrink-0">
              <div className="flex gap-4">
                <button 
                  type="button"
                  onClick={onClose}
                  className="px-6 py-4 bg-secondary text-foreground rounded-xl font-black uppercase tracking-widest text-[9px] border border-border hover:bg-border transition-all"
                >
                  Abandonar
                </button>
                <button 
                  onClick={(e) => onSubmit(e)}
                  disabled={isSubmitting}
                  className="flex-1 py-4 bg-primary text-white rounded-xl font-black uppercase tracking-[0.3em] text-[10px] shadow-lg shadow-primary/30 flex items-center justify-center gap-3 disabled:opacity-50 hover:scale-[1.01] active:scale-95 transition-all relative overflow-hidden group"
                >
                  <Send size={16} />
                  {isSubmitting ? "Enviando..." : "Enviar a Acreditación"}
                </button>
              </div>
            </div>
              </>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
