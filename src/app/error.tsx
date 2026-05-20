"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, RotateCcw, Home } from "lucide-react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Optionally log to an error reporting service
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="max-w-md w-full bg-card border border-border rounded-[2.5rem] p-10 text-center shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-2 bg-red-500" />
        
        <div className="w-24 h-24 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-8 border border-red-500/20">
          <AlertTriangle size={48} className="text-red-500" />
        </div>
        
        <h1 className="text-3xl font-black italic uppercase tracking-tighter mb-4">
          ¡Ups! Algo Salió Mal
        </h1>
        
        <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest leading-relaxed mb-10">
          Tuvimos un problema procesando tu solicitud. Por favor intentá de nuevo.
        </p>

        <div className="flex flex-col gap-3">
          <button
            onClick={() => reset()}
            className="w-full bg-primary text-white py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-2"
          >
            <RotateCcw size={16} /> Reintentar
          </button>
          
          <Link
            href="/"
            className="w-full bg-secondary text-foreground border border-border py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-border transition-all flex items-center justify-center gap-2"
          >
            <Home size={16} /> Volver al Inicio
          </Link>
        </div>
      </div>
    </div>
  );
}
