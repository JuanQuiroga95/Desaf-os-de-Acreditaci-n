"use client";

import React from "react";
import { MessageSquare, Bot, Sparkles } from "lucide-react";

export default function TutorPage() {
  return (
    <div className="p-8 max-w-7xl mx-auto flex flex-col items-center justify-center min-h-[80vh] text-center">
      <div className="w-24 h-24 bg-primary rounded-[2rem] flex items-center justify-center text-primary-foreground mb-8 shadow-2xl shadow-primary/30 relative">
        <Bot size={48} />
        <div className="absolute -right-2 -top-2 bg-green-500 w-6 h-6 rounded-full border-4 border-background animate-pulse" />
      </div>
      <h1 className="text-5xl font-black tracking-tight mb-6 italic">Asistente Virtual Videla</h1>
      <p className="text-muted-foreground max-w-lg text-lg mb-10 leading-relaxed">
        Soy tu guía técnico para el ciclo de acreditación. Recordá que el chat flotante está disponible en todas las secciones para ayudarte en tiempo real.
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl w-full">
        <div className="p-6 bg-secondary/30 border border-border rounded-3xl text-left">
          <Sparkles className="text-primary mb-3" size={20} />
          <p className="text-sm font-bold mb-1 italic">¿Cómo puedo ayudarte?</p>
          <p className="text-xs text-muted-foreground">Podés consultarme dudas sobre los desafíos de Matemática, Lengua o Biología.</p>
        </div>
        <div className="p-6 bg-secondary/30 border border-border rounded-3xl text-left">
          <MessageSquare className="text-primary mb-3" size={20} />
          <p className="text-sm font-bold mb-1 italic">Método Socrático</p>
          <p className="text-xs text-muted-foreground">No esperes la respuesta directa; te daré pistas y analogías para que vos mismo llegues a la solución.</p>
        </div>
      </div>
    </div>
  );
}
