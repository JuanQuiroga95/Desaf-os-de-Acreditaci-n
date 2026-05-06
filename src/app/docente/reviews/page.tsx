"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { Clock, CheckCircle2, Award, X, MessageSquare, User, BookOpen } from "lucide-react";
import { getTeacherDashboard, gradeSubmission } from "@/app/actions/teacher";
import { motion, AnimatePresence } from "framer-motion";

export default function TeacherReviewsPage() {
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [pendingSubmissions, setPendingSubmissions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Modal
  const [isGradingModalOpen, setIsGradingModalOpen] = useState(false);
  const [selectedSubmission, setSelectedSubmission] = useState<any>(null);
  const [gradingData, setGradingData] = useState({ score: "", feedback: "" });

  useEffect(() => {
    if (user?.id) {
      loadData();
    }
  }, [user]);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const res = await getTeacherDashboard(user!.id);
      if (res.success) {
        setPendingSubmissions(res.pendingSubmissions || []);
      }
    } catch (error) {
      console.error("Error al cargar correcciones:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGrade = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = await gradeSubmission(selectedSubmission.id, parseFloat(gradingData.score), gradingData.feedback);
    if (result.success) {
      setIsGradingModalOpen(false);
      loadData();
    }
  };

  if (authLoading || isLoading) return <div className="p-20 text-center font-bold animate-pulse uppercase tracking-widest text-primary">Cargando Entregas...</div>;

  if (!user || user?.role !== "teacher") { router.push("/login"); return null; }

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <header className="mb-12">
        <h1 className="text-6xl font-black tracking-tighter mb-2 uppercase italic leading-none">Mesa de <span className="text-primary">Corrección</span></h1>
        <p className="text-muted-foreground text-[10px] uppercase font-bold tracking-[0.4em]">Evaluación y Feedback Académico</p>
      </header>

      {pendingSubmissions.length === 0 ? (
        <div className="p-32 text-center border-2 border-dashed border-border rounded-[4rem] bg-secondary/10 flex flex-col items-center justify-center">
          <div className="w-24 h-24 rounded-full bg-green-500/10 flex items-center justify-center text-green-500 mb-8">
            <CheckCircle2 size={48} />
          </div>
          <h2 className="text-2xl font-black uppercase italic mb-2">¡Bandeja Vacía!</h2>
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground">Has calificado todas las entregas pendientes hasta el momento.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {pendingSubmissions.map((entry, i) => (
            <div key={i} className="bg-card border border-border p-10 rounded-[3rem] shadow-sm hover:border-primary/50 transition-all group flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
              <div className="flex items-center gap-8">
                <div className="w-20 h-20 rounded-[2rem] bg-primary/10 text-primary flex items-center justify-center font-black text-3xl">
                  {entry.studentName.charAt(0)}
                </div>
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <p className="text-2xl font-black group-hover:text-primary transition-colors">{entry.studentName}</p>
                    <span className="text-[8px] font-black uppercase tracking-widest bg-secondary px-3 py-1 rounded-full border border-border">
                      Pendiente
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-6 items-center">
                    <p className="text-[10px] text-muted-foreground uppercase font-black tracking-[0.2em] flex items-center gap-2">
                      <BookOpen size={14} className="text-primary" />
                      {entry.challengeTitle}
                    </p>
                    <p className="text-[10px] text-muted-foreground uppercase font-black tracking-[0.2em] flex items-center gap-2">
                      <Clock size={14} className="text-primary" />
                      Entregado hace 2 días {/* Static for now, would use relative time */}
                    </p>
                  </div>
                </div>
              </div>
              <button 
                onClick={() => { setSelectedSubmission(entry); setIsGradingModalOpen(true); }}
                className="bg-primary text-primary-foreground px-8 py-5 rounded-[2rem] text-[10px] font-black uppercase tracking-[0.3em] hover:scale-105 transition-all shadow-xl shadow-primary/20 flex items-center gap-3"
              >
                Evaluar Entrega
                <Award size={18} />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      <AnimatePresence>
        {isGradingModalOpen && selectedSubmission && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-background/80 backdrop-blur-md">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-card border border-border w-full max-w-2xl rounded-[3rem] shadow-2xl overflow-hidden">
              <div className="p-10 border-b border-border flex justify-between items-center bg-secondary/30">
                <div className="flex items-center gap-6">
                  <div className="w-14 h-14 rounded-2xl bg-primary/20 text-primary flex items-center justify-center font-black text-xl">
                    {selectedSubmission.studentName.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-black uppercase italic text-2xl leading-none mb-2">{selectedSubmission.studentName}</h3>
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{selectedSubmission.challengeTitle}</p>
                  </div>
                </div>
                <button onClick={() => setIsGradingModalOpen(false)} className="w-12 h-12 rounded-full bg-background border border-border flex items-center justify-center hover:bg-red-500 hover:text-white transition-all">✕</button>
              </div>
              <form onSubmit={handleGrade} className="p-10 space-y-8">
                <div className="p-8 bg-secondary/20 rounded-[2rem] border border-border">
                  <h4 className="text-[10px] font-black uppercase text-primary mb-4 flex items-center gap-2">
                    <MessageSquare size={14} />
                    Bitácora del Alumno
                  </h4>
                  <p className="text-sm text-muted-foreground italic leading-relaxed font-medium">"Esta entrega no incluye comentarios adicionales del estudiante."</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  <div className="col-span-1">
                    <label className="text-[10px] font-black uppercase text-muted-foreground mb-3 block">Calificación (1-10)</label>
                    <input required type="number" min="1" max="10" step="0.5" value={gradingData.score} onChange={e => setGradingData({...gradingData, score: e.target.value})} className="w-full bg-secondary/30 border border-border rounded-2xl p-6 font-black text-4xl text-center focus:ring-2 focus:ring-primary/50 outline-none" />
                  </div>
                  <div className="col-span-2">
                    <label className="text-[10px] font-black uppercase text-muted-foreground mb-3 block">Feedback Pedagógico</label>
                    <textarea required value={gradingData.feedback} onChange={e => setGradingData({...gradingData, feedback: e.target.value})} className="w-full h-32 bg-secondary/30 border border-border rounded-2xl p-6 font-bold outline-none resize-none focus:ring-2 focus:ring-primary/50" placeholder="Escribe tus observaciones para el alumno..." />
                  </div>
                </div>
                <button type="submit" className="w-full py-6 bg-primary text-white rounded-[2rem] font-black uppercase tracking-[0.4em] text-[10px] shadow-2xl shadow-primary/30 flex items-center justify-center gap-3 hover:scale-[1.02] transition-all">
                  <Award size={20} />
                  Confirmar Calificación Final
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
