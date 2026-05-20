import React from "react";
import { BookOpen, Sparkles, Award, CheckCircle2, Clock, Play, HelpCircle } from "lucide-react";

interface ChallengeGridProps {
  subject: any;
  onOpenChallenge: (challenge: any) => void;
}

export function ChallengeGrid({ subject, onOpenChallenge }: ChallengeGridProps) {
  return (
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
                  onClick={() => onOpenChallenge(challenge)}
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
  );
}
