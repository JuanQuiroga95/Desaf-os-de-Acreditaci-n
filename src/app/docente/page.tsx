"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { PlusCircle, BookOpen, Clock, ArrowRight, CheckCircle2, TrendingUp, Users, X, Send, Award } from "lucide-react";
import { getTeacherDashboard, gradeSubmission } from "@/app/actions/teacher";
import { createChallenge } from "@/app/actions/admin";
import { motion, AnimatePresence } from "framer-motion";

export default function TeacherPage() {
  const { user, isLoading: authLoading } = useAuth();
  const [data, setData] = useState<{ subjects: any[], pendingSubmissions: any[] } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Modals state
  const [isChallengeModalOpen, setIsChallengeModalOpen] = useState(false);
  const [isGradingModalOpen, setIsGradingModalOpen] = useState(false);
  const [selectedSubmission, setSelectedSubmission] = useState<any>(null);
  
  // Form states
  const [newChallenge, setNewChallenge] = useState({ title: "", objective: "", subjectId: "" });
  const [gradingData, setGradingData] = useState({ score: "", feedback: "" });

  useEffect(() => {
    if (user?.id) {
      loadData();
    }
  }, [user]);

  const loadData = async () => {
    setIsLoading(true);
    const result = await getTeacherDashboard(user!.id);
    if (result.success && result.subjects) {
      setData({ subjects: result.subjects || [], pendingSubmissions: result.pendingSubmissions || [] });
      if (result.subjects.length > 0) {
        setNewChallenge(prev => ({ ...prev, subjectId: result.subjects![0].id }));
      }
    }
    setIsLoading(false);
  };

  const handleCreateChallenge = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = await createChallenge(newChallenge.subjectId, newChallenge.title, newChallenge.objective, {});
    if (result.success) {
      setIsChallengeModalOpen(false);
      loadData();
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

  if (authLoading || isLoading) return <div className="p-20 text-center font-bold animate-pulse uppercase tracking-[0.3em] text-primary">Sincronizando con el Aula Virtual...</div>;

  if (user?.role !== "teacher") return <div className="p-20 text-center font-bold">Acceso Denegado</div>;

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <header className="mb-12 flex justify-between items-end">
        <div>
          <h1 className="text-6xl font-black tracking-tighter mb-2 uppercase italic leading-none">Panel <span className="text-primary">Docente</span></h1>
          <p className="text-muted-foreground text-[10px] uppercase font-bold tracking-[0.4em] leading-relaxed">
            Gestión Académica • <span className="text-foreground">{user.name}</span>
          </p>
        </div>
        <button 
          onClick={() => setIsChallengeModalOpen(true)}
          className="bg-primary text-primary-foreground px-8 py-5 rounded-[2rem] font-black text-[10px] uppercase tracking-widest flex items-center gap-3 hover:scale-105 transition-all shadow-2xl shadow-primary/30"
        >
          <PlusCircle size={20} />
          Nuevo Desafío
        </button>
      </header>

      {/* Stats and Lists same as before but dynamic... */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-12">
        <div className="lg:col-span-8 space-y-8">
          {/* Subjects Section */}
          <section className="bg-card border border-border rounded-[3rem] p-10 shadow-sm relative overflow-hidden">
            <h2 className="text-xl font-black mb-10 flex items-center gap-3 italic uppercase text-[10px] tracking-[0.2em] text-primary">
              <BookOpen size={18} />
              Tus Materias Asignadas
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {data?.subjects.map((sub, i) => (
                <div key={i} className="p-10 rounded-[2.5rem] bg-secondary/10 border border-border hover:border-primary/50 transition-all group shadow-sm relative overflow-hidden">
                  <h3 className="font-black text-2xl mb-8 group-hover:text-primary transition-colors pr-8 leading-tight">{sub.name}</h3>
                  <div className="flex gap-10">
                    <div className="flex flex-col">
                      <span className="text-[9px] font-black text-muted-foreground uppercase tracking-[0.2em] mb-2">Alumnos</span>
                      <span className="text-4xl font-black tracking-tighter">{sub.studentsCount}</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[9px] font-black text-muted-foreground uppercase tracking-[0.2em] mb-2">Desafíos</span>
                      <span className="text-4xl font-black tracking-tighter">{sub.challengesCount}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Submissions Section */}
          <section className="bg-card border border-border rounded-[3rem] p-10 shadow-sm relative overflow-hidden">
            <h2 className="text-xl font-black mb-10 flex items-center gap-3 italic uppercase text-[10px] tracking-[0.2em] text-primary">
              <Clock size={18} />
              Entregas Pendientes
            </h2>
            <div className="space-y-4">
              {data?.pendingSubmissions.length === 0 ? (
                <div className="p-16 text-center border-2 border-dashed border-border rounded-[2.5rem] bg-secondary/5">
                  <CheckCircle2 className="mx-auto mb-6 text-green-500 opacity-50" size={48} />
                  <p className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground">¡Todo al día!</p>
                </div>
              ) : (
                data?.pendingSubmissions.map((entry, i) => (
                  <div key={i} className="flex items-center justify-between p-8 bg-secondary/10 rounded-[2rem] border border-border/50 hover:bg-secondary/30 transition-all group">
                    <div className="flex items-center gap-8">
                      <div className="w-16 h-16 rounded-[1.25rem] bg-primary/10 text-primary flex items-center justify-center font-black text-2xl">
                        {entry.studentName.charAt(0)}
                      </div>
                      <div>
                        <p className="text-xl font-black group-hover:text-primary transition-colors mb-1">{entry.studentName}</p>
                        <p className="text-[10px] text-muted-foreground uppercase font-black tracking-[0.2em]">{entry.challengeTitle}</p>
                      </div>
                    </div>
                    <button 
                      onClick={() => { setSelectedSubmission(entry); setIsGradingModalOpen(true); }}
                      className="bg-primary/10 text-primary px-6 py-3 rounded-xl text-[9px] font-black uppercase tracking-[0.3em] hover:bg-primary hover:text-white transition-all shadow-sm"
                    >
                      Corregir Ahora
                    </button>
                  </div>
                ))
              )}
            </div>
          </section>
        </div>

        <aside className="lg:col-span-4 space-y-8">
          {/* Stats Sidebar same as before... */}
          <div className="bg-secondary/20 border border-border rounded-[2.5rem] p-8 shadow-sm">
            <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-primary mb-8 flex items-center gap-3">
              <TrendingUp size={16} />
              Rendimiento Grupal
            </h3>
            <div className="space-y-6">
              {[
                { label: "Promedio General", value: "8.4", color: "text-green-500" },
                { label: "Participación", value: "92%", color: "text-blue-500" },
              ].map((stat, i) => (
                <div key={i} className="flex items-center justify-between p-5 bg-card rounded-2xl border border-border">
                  <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">{stat.label}</span>
                  <span className={`text-2xl font-black ${stat.color}`}>{stat.value}</span>
                </div>
              ))}
            </div>
          </div>
        </aside>
      </div>

      {/* MODAL: CREAR DESAFÍO */}
      <AnimatePresence>
        {isChallengeModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-background/80 backdrop-blur-md">
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="bg-card border border-border w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden">
              <div className="p-8 border-b border-border flex justify-between items-center bg-secondary/30">
                <h3 className="font-black uppercase italic tracking-tighter text-xl">Crear Nuevo Desafío</h3>
                <button onClick={() => setIsChallengeModalOpen(false)} className="w-10 h-10 rounded-full bg-background border border-border flex items-center justify-center hover:bg-red-500 hover:text-white transition-all">✕</button>
              </div>
              <form onSubmit={handleCreateChallenge} className="p-8 space-y-6">
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-2 block">Título del Desafío</label>
                  <input required value={newChallenge.title} onChange={e => setNewChallenge({...newChallenge, title: e.target.value})} className="w-full bg-secondary/30 border border-border rounded-xl p-4 font-bold focus:ring-2 focus:ring-primary/50 outline-none" placeholder="Ej: Balance de Situación" />
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-2 block">Objetivo Pedagógico</label>
                  <textarea required value={newChallenge.objective} onChange={e => setNewChallenge({...newChallenge, objective: e.target.value})} className="w-full h-32 bg-secondary/30 border border-border rounded-xl p-4 font-bold focus:ring-2 focus:ring-primary/50 outline-none resize-none" placeholder="Describe qué debe aprender el alumno..." />
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-2 block">Materia</label>
                  <select value={newChallenge.subjectId} onChange={e => setNewChallenge({...newChallenge, subjectId: e.target.value})} className="w-full bg-secondary/30 border border-border rounded-xl p-4 font-bold outline-none">
                    {data?.subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                </div>
                <button type="submit" className="w-full py-5 bg-primary text-white rounded-2xl font-black uppercase tracking-[0.3em] text-[10px] shadow-xl hover:scale-[1.02] transition-transform">Publicar Desafío</button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL: CALIFICAR ENTREGA */}
      <AnimatePresence>
        {isGradingModalOpen && selectedSubmission && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-background/80 backdrop-blur-md">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-card border border-border w-full max-w-2xl rounded-[2.5rem] shadow-2xl overflow-hidden">
              <div className="p-8 border-b border-border flex justify-between items-center bg-secondary/30">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-primary/20 text-primary flex items-center justify-center font-black">
                    {selectedSubmission.studentName.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-black uppercase italic text-xl">{selectedSubmission.studentName}</h3>
                    <p className="text-[10px] font-bold text-muted-foreground uppercase">{selectedSubmission.challengeTitle}</p>
                  </div>
                </div>
                <button onClick={() => setIsGradingModalOpen(false)} className="w-10 h-10 rounded-full bg-background border border-border flex items-center justify-center hover:bg-red-500 hover:text-white transition-all">✕</button>
              </div>
              <form onSubmit={handleGrade} className="p-8 space-y-6">
                <div className="p-6 bg-secondary/20 rounded-2xl border border-border">
                  <h4 className="text-[10px] font-black uppercase text-primary mb-3">Bitácora del Alumno</h4>
                  <p className="text-sm text-muted-foreground italic leading-relaxed font-medium">"No hay bitácora disponible para esta entrega."</p>
                </div>
                <div className="grid grid-cols-3 gap-6">
                  <div className="col-span-1">
                    <label className="text-[10px] font-black uppercase text-muted-foreground mb-2 block">Calificación (1-10)</label>
                    <input required type="number" min="1" max="10" step="0.5" value={gradingData.score} onChange={e => setGradingData({...gradingData, score: e.target.value})} className="w-full bg-secondary/30 border border-border rounded-xl p-4 font-black text-2xl text-center focus:ring-2 focus:ring-primary/50 outline-none" />
                  </div>
                  <div className="col-span-2">
                    <label className="text-[10px] font-black uppercase text-muted-foreground mb-2 block">Feedback Pedagógico</label>
                    <textarea required value={gradingData.feedback} onChange={e => setGradingData({...gradingData, feedback: e.target.value})} className="w-full h-24 bg-secondary/30 border border-border rounded-xl p-4 font-bold outline-none resize-none" placeholder="Escribe tus observaciones..." />
                  </div>
                </div>
                <button type="submit" className="w-full py-5 bg-primary text-white rounded-2xl font-black uppercase tracking-[0.3em] text-[10px] shadow-xl flex items-center justify-center gap-3">
                  <Award size={18} />
                  Confirmar Calificación
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
