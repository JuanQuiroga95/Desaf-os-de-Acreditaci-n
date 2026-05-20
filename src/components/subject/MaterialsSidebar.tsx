import React from "react";
import { FileText, Video, Dumbbell, MessageSquare, ClipboardList, BookMarked, Play, Award } from "lucide-react";

interface MaterialsSidebarProps {
  subject: any;
  onSelectMaterial: (material: any) => void;
}

export function MaterialsSidebar({ subject, onSelectMaterial }: MaterialsSidebarProps) {
  return (
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
                    <button key={mat.id} onClick={() => onSelectMaterial(mat)}
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
  );
}
