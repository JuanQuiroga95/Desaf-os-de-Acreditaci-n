"use client";

import React, { useState } from "react";
import { Sparkles, X, Copy, Check, Loader2 } from "lucide-react";
import ReactMarkdown from "react-markdown";

interface MaterialSummaryButtonProps {
  content: string;
  title: string;
  type: string;
  userId: string;
}

export function MaterialSummaryButton({ content, title, type, userId }: MaterialSummaryButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [summary, setSummary] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handleGenerate = async () => {
    if (summary) {
      setIsOpen(true);
      return;
    }
    setIsLoading(true);
    setError(null);
    setIsOpen(true);
    try {
      const res = await fetch("/api/summarize-material", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-user-id": userId,
        },
        body: JSON.stringify({ content, title, type }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Error al generar resumen");
      } else {
        setSummary(data.summary);
      }
    } catch {
      setError("Error de conexión");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = () => {
    if (!summary) return;
    navigator.clipboard.writeText(summary);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <>
      <button
        onClick={handleGenerate}
        title="Generar ficha de estudio con IA"
        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-purple-500/10 text-purple-400 border border-purple-500/30 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-purple-500/20 transition-all shrink-0"
      >
        <Sparkles size={11} />
        Ficha IA
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-end p-6 bg-background/60 backdrop-blur-sm">
          <div className="bg-card border border-border w-full max-w-lg rounded-[2.5rem] shadow-2xl flex flex-col max-h-[90vh] animate-in slide-in-from-right-8 duration-300">
            {/* Header */}
            <div className="p-6 border-b border-border flex items-center justify-between bg-purple-500/10 rounded-t-[2.5rem] shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center">
                  <Sparkles size={18} />
                </div>
                <div>
                  <p className="text-[9px] font-black uppercase tracking-widest text-purple-400">Asistente IA</p>
                  <h3 className="font-black uppercase italic text-sm leading-tight truncate max-w-[200px]">{title}</h3>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="w-8 h-8 rounded-lg bg-background border border-border flex items-center justify-center hover:bg-red-500 hover:text-white transition-all"
              >
                <X size={14} />
              </button>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto p-6">
              {isLoading && (
                <div className="flex flex-col items-center justify-center py-16 gap-4">
                  <Loader2 size={32} className="animate-spin text-purple-400" />
                  <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground animate-pulse">
                    Generando ficha de estudio...
                  </p>
                </div>
              )}

              {error && !isLoading && (
                <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-2xl">
                  <p className="text-xs font-bold text-red-400">{error}</p>
                </div>
              )}

              {summary && !isLoading && (
                <div className="prose prose-sm max-w-none text-foreground">
                  <ReactMarkdown
                    components={{
                      h2: ({ children }) => (
                        <h2 className="text-[10px] font-black uppercase tracking-widest text-purple-400 mt-6 mb-2 first:mt-0">
                          {children}
                        </h2>
                      ),
                      p: ({ children }) => (
                        <p className="text-xs leading-relaxed text-foreground mb-3">{children}</p>
                      ),
                      ul: ({ children }) => (
                        <ul className="space-y-1 mb-3 pl-2">{children}</ul>
                      ),
                      li: ({ children }) => (
                        <li className="text-xs leading-relaxed text-foreground flex items-start gap-2">
                          <span className="text-purple-400 mt-0.5 shrink-0">•</span>
                          <span>{children}</span>
                        </li>
                      ),
                      ol: ({ children }) => (
                        <ol className="space-y-1 mb-3 pl-2 list-decimal list-inside">{children}</ol>
                      ),
                      strong: ({ children }) => (
                        <strong className="font-black text-foreground">{children}</strong>
                      ),
                    }}
                  >
                    {summary}
                  </ReactMarkdown>
                </div>
              )}
            </div>

            {/* Footer */}
            {summary && !isLoading && (
              <div className="p-4 border-t border-border shrink-0">
                <button
                  onClick={handleCopy}
                  className={`w-full py-3 rounded-2xl font-black uppercase tracking-widest text-[9px] flex items-center justify-center gap-2 transition-all ${
                    copied
                      ? "bg-green-500 text-white"
                      : "bg-secondary border border-border hover:bg-border"
                  }`}
                >
                  {copied ? <Check size={13} /> : <Copy size={13} />}
                  {copied ? "¡Copiado!" : "Copiar resumen"}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
