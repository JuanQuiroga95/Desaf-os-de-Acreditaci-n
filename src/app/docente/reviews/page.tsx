"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { Trophy, ArrowLeft, CheckCircle2, Award, Clock, Search, MessageSquare } from "lucide-react";
import { getTeacherDashboard, gradeSubmission } from "@/app/actions/teacher";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

export default function TeacherReviewsPage() {
  const { user, isLoading: authLoading } = useAuth();
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  
  // Grading Modal
  const [selectedSubmission, setSelectedSubmission] = useState<any>(null);
  const [gradingData, setGradingData] = useState({ score: "", feedback: "" });

  useEffect(() => {
    if (user?.role === "teacher") {
      loadData();
    }
  }, [user]);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const res = await getTeacherDashboard(user!.id);
      if (res.success) {
        setSubmissions(res.pendingSubmissions || []);
      }
    } catch (error) {
      console.error("Error cargando entregas:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenGrade = (sub: any) => {
    setSelectedSubmission(sub);
    setGradingData({ score: "", feedback: "" });
  };

  const handleGrade = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await gradeSubmission(selectedSubmission.id, parseFloat(gradingData.score), gradingData.feedback);
    if (res.success) {
      setSelectedSubmission(null);
      loadData();
    }
  };

  const filteredSubmissions = submissions.filter(s => 
    s.studentName.toLowerCase().includes(searchTerm.toLowerCase()) || 
    s.challengeTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.subjectName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (authLoading || isLoading) return <div className="p-20 text-center font-black animate-pulse uppercase tracking-widest text-primary">Cargando Entregas...</div>;
  if (!user || user.role !== "teacher") return <div className="p-20 text-center font-black uppercase tracking-widest text-primary">Acceso Denegado</div>;

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <header className="mb-12 flex justify-between items-end">
        <div>
          <Link href="/docente" className="flex items-center gap-2 text-primary font-black text-[10px] uppercase tracking-widest mb-4 hover:underline">
            <ArrowLeft size={14} /> Volver al Panel
          </Link>
          <h1 className="text-5xl font-black tracking-tighter uppercase italic leading-none">Centro de <span className="text-primary">Correcciones</span></h1>
        </div>
        
        <div className="relative w-64">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
          <input 
            type="text" 
            placeholder="Buscar por alumno o desafío..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-secondary/30 border border-border rounded-2xl py-4 pl-12 pr-4 font-bold outline-none focus:ring-2 focus:ring-primary/50"
          />
        </div>
      </header>

      <div className="bg-card border border-border rounded-[2.5rem] overflow-hidden shadow-sm">
        <div className="p-8 border-b border-border flex items-center justify-between bg-secondary/10">
          <h2 className="text-xs font-black uppercase tracking-widest flex items-center gap-2">
            <Clock size={16} className="text-primary" />
            Entregas por Calificar
          </h2>
          <span className="text-[10px] font-black text-muted-foreground uppercase bg-secondary px-4 py-2 rounded-full border border-border">
            Total: {filteredSubmissions.length}
          </span>
        </div>
        
        <div className="divide-y divide-border">
          {filteredSubmissions.map((sub) => (
            <div key={sub.id} className="p-8 flex items-center justify-between hover:bg-secondary/20 transition-all group">
              <div className="flex items-center gap-8">
                <div className="w-16 h-16 rounded-[1.25rem] bg-primary/10 text-primary flex items-center justify-center font-black text-2xl group-hover:bg-primary group-hover:text-white transition-all">
                  {sub.studentName.charAt(0)}
                </div>
                <div>
                  <p className="text-xl font-black mb-1 group-hover:text-primary transition-colors">{sub.studentName}</p>
                  <div className="flex gap-4">
                    <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">{sub.subjectName}</span>
                    <span className="text-[10px] font-black uppercase tracking-widest text-primary">{sub.challengeTitle}</span>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-6">
                <div className="text-right">
                  <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">Enviado</p>
                  <p className="text-xs font-bold">{new Date(sub.createdAt).toLocaleDateString()} {new Date(sub.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                </div>
                <button 
                  onClick={() => handleOpenGrade(sub)}
                  className="bg-primary text-white px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-all shadow-lg shadow-primary/20"
                >
                  Corregir
                </button>
              </div>
            </div>
          ))}
          
          {filteredSubmissions.length === 0 && (
            <div className="p-20 text-center">
              <CheckCircle2 size={48} className="mx-auto mb-4 text-green-500 opacity-20" />
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground">¡Sin entregas pendientes!</p>
            </div>
          )}
        </div>
      </div>

      {/* Grading Modal */}
      <AnimatePresence>
        {selectedSubmission && (
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
                <button onClick={() => setSelectedSubmission(null)} className="w-10 h-10 rounded-full bg-background border border-border flex items-center justify-center hover:bg-red-500 hover:text-white transition-all">✕</button>
              </div>
              <form onSubmit={handleGrade} className="p-8 space-y-6">
                <div className="p-6 bg-secondary/20 rounded-2xl border border-border">
                  <h4 className="text-[10px] font-black uppercase text-primary mb-3 flex items-center gap-2">
                    <MessageSquare size={14} /> Bitácora del Alumno
                  </h4>
                  <p className="text-sm text-muted-foreground italic leading-relaxed font-medium">"El alumno ha completado el desafío correctamente. Se adjunta evidencia digital en el repositorio."</p>
                </div>
                <div className="grid grid-cols-3 gap-6">
                  <div className="col-span-1">
                    <label className="text-[10px] font-black uppercase text-muted-foreground mb-2 block tracking-widest">Nota (1-10)</label>
                    <input required type="number" min="1" max="10" step="0.5" value={gradingData.score} onChange={e => setGradingData({...gradingData, score: e.target.value})} className="w-full bg-secondary/30 border border-border rounded-xl p-4 font-black text-2xl text-center focus:ring-2 focus:ring-primary/50 outline-none" />
                  </div>
                  <div className="col-span-2">
                    <label className="text-[10px] font-black uppercase text-muted-foreground mb-2 block tracking-widest">Feedback Pedagógico</label>
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
