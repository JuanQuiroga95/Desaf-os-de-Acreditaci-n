import React, { useState } from "react";
import { motion } from "framer-motion";
import { X as XIcon, Link2, Copy, Download, FileText } from "lucide-react";
import { MaterialSummaryButton } from "@/components/MaterialSummaryButton";

interface MaterialModalProps {
  material: any;
  user: any;
  onClose: () => void;
}

export function MaterialModal({ material, user, onClose }: MaterialModalProps) {
  const [copiedPrompt, setCopiedPrompt] = useState<string | null>(null);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-background/80 backdrop-blur-md">
      <motion.div initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }}
        className="bg-card border border-border w-full max-w-2xl rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        <div className="p-6 border-b border-border flex justify-between items-center bg-secondary/30 shrink-0">
          <div>
            <p className="text-[9px] font-black uppercase tracking-widest text-primary mb-1">
              {material.type === "THEORY" ? "Teoría" : material.type === "VIDEO" ? "Video" :
               material.type === "EXERCISE" ? `Ejercicio · ${material.level || ""}` :
               material.type === "PROMPT" ? "Prompt IA" : material.type === "TP_TEMPLATE" ? "Plantilla TP" : "Rúbrica"}
            </p>
            <h3 className="font-black uppercase italic text-lg leading-tight">{material.title}</h3>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {material.type === "THEORY" && material.content && (
              <MaterialSummaryButton
                content={material.content}
                title={material.title}
                type={material.type}
                userId={user!.id}
              />
            )}
            <button onClick={onClose} className="w-10 h-10 rounded-full bg-background border border-border flex items-center justify-center hover:bg-red-500 hover:text-white transition-all">
              <XIcon size={16} />
            </button>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-8">
          {material.type === "VIDEO" ? (
            material.fileUrl ? (
              <video src={material.fileUrl} controls preload="auto" controlsList="nodownload" playsInline className="w-full rounded-2xl border border-border" />
            ) : (
              <a href={material.content} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-3 p-6 bg-secondary/20 rounded-2xl border border-border hover:border-primary/50 transition-all group">
                <Link2 size={20} className="text-primary shrink-0" />
                <div>
                  <p className="font-black text-sm group-hover:text-primary transition-colors">Abrir video externo</p>
                  <p className="text-xs text-muted-foreground truncate max-w-xs">{material.content}</p>
                </div>
              </a>
            )
          ) : material.type === "PROMPT" ? (
            <div className="space-y-4">
              <div className="p-6 bg-primary/5 border border-primary/20 rounded-2xl font-mono text-sm leading-relaxed whitespace-pre-wrap">
                {material.content}
              </div>
              <button
                onClick={() => { navigator.clipboard.writeText(material.content); setCopiedPrompt(material.id); setTimeout(() => setCopiedPrompt(null), 2000); }}
                className={`w-full py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] flex items-center justify-center gap-3 transition-all ${copiedPrompt === material.id ? "bg-green-500 text-white" : "bg-secondary border border-border hover:bg-border"}`}
              >
                <Copy size={14} />
                {copiedPrompt === material.id ? "¡Copiado!" : "Copiar para usar con IA"}
              </button>
            </div>
          ) : material.fileUrl ? (
            <div className="space-y-4">
              {/\.(png|jpe?g|gif|webp|svg)(\?|$)/i.test(material.fileUrl) ? (
                <img src={material.fileUrl} alt={material.title} className="w-full h-auto rounded-2xl border border-border object-contain max-h-[70vh]" />
              ) : /\.pdf(\?|$)/i.test(material.fileUrl) ? (
                <iframe
                  src={material.fileUrl}
                  className="w-full h-[70vh] rounded-2xl border border-border bg-white"
                  title={material.title}
                />
              ) : (
                <div className="p-8 bg-secondary/20 rounded-2xl border border-border text-center">
                  <FileText size={48} className="mx-auto mb-4 text-primary" />
                  <p className="font-black uppercase tracking-widest text-sm mb-1">{material.title}</p>
                  <p className="text-xs text-muted-foreground">Este formato no se puede previsualizar en el navegador. Descargalo para verlo.</p>
                </div>
              )}
              <a
                href={material.fileUrl}
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
              <p className="text-sm leading-relaxed whitespace-pre-wrap">{material.content}</p>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
