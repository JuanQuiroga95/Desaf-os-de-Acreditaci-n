"use client";

import React, { useState, useRef, useEffect } from "react";
import { Send, MessageSquare, GraduationCap, ArrowRight, User, Bot, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function TutorPage() {
  const [messages, setMessages] = useState<{ role: string; content: string }[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = { role: "user", content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: [...messages, userMessage] }),
      });
      const data = await res.json();
      if (data.content) {
        setMessages(prev => [...prev, { role: "assistant", content: data.content }]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-5xl mx-auto h-[calc(100vh-64px)] flex flex-col">
      <header className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-5xl font-black tracking-tighter uppercase italic leading-none flex items-center gap-4">
            Tutor <span className="text-primary">IA</span>
            <Sparkles className="text-primary animate-pulse" size={32} />
          </h1>
          <p className="text-muted-foreground text-[10px] font-black uppercase tracking-[0.3em] mt-3">Mentoria en Economía y Administración</p>
        </div>
        <div className="hidden md:flex items-center gap-3 bg-secondary/30 px-6 py-3 rounded-2xl border border-border">
          <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
          <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Sistema Operativo</span>
        </div>
      </header>

      <div className="flex-1 bg-card border border-border rounded-[3rem] overflow-hidden flex flex-col shadow-2xl relative">
        <div 
          ref={scrollRef}
          className="flex-1 p-8 overflow-y-auto space-y-6 scroll-smooth"
        >
          {messages.length === 0 && (
            <div className="h-full flex flex-col items-center justify-center text-center p-12 opacity-50">
              <div className="w-20 h-20 bg-primary/10 rounded-[2rem] flex items-center justify-center text-primary mb-6">
                <Bot size={40} />
              </div>
              <h3 className="text-2xl font-black uppercase italic mb-4 tracking-tighter">¿En qué puedo orientarte hoy?</h3>
              <p className="max-w-md text-sm leading-relaxed font-medium">
                Podemos conversar sobre tus retos de matemática financiera, contabilidad o gestión administrativa. Recordá que mi objetivo es ayudarte a razonar, no darte la respuesta.
              </p>
            </div>
          )}

          {messages.map((m, i) => (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              key={i} 
              className={`flex items-start gap-4 ${m.role === "user" ? "flex-row-reverse" : ""}`}
            >
              <div className={`w-10 h-10 rounded-[1rem] flex items-center justify-center shrink-0 border ${
                m.role === "user" ? "bg-secondary border-border" : "bg-primary text-white border-primary/20 shadow-lg shadow-primary/20"
              }`}>
                {m.role === "user" ? <User size={18} /> : <Bot size={18} />}
              </div>
              <div className={`max-w-[80%] p-6 rounded-[2rem] text-sm leading-relaxed font-medium shadow-sm ${
                m.role === "user" ? "bg-secondary/50 rounded-tr-none border border-border" : "bg-card border border-border rounded-tl-none"
              }`}>
                {m.content}
              </div>
            </motion.div>
          ))}
          {isLoading && (
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-[1rem] bg-primary text-white flex items-center justify-center animate-pulse">
                <Bot size={18} />
              </div>
              <div className="bg-secondary/30 p-6 rounded-[2rem] rounded-tl-none border border-border flex gap-2">
                <div className="w-2 h-2 bg-primary rounded-full animate-bounce" />
                <div className="w-2 h-2 bg-primary rounded-full animate-bounce delay-100" />
                <div className="w-2 h-2 bg-primary rounded-full animate-bounce delay-200" />
              </div>
            </div>
          )}
        </div>

        <div className="p-8 border-t border-border bg-secondary/10">
          <div className="relative max-w-4xl mx-auto">
            <input 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              placeholder="Hacé una pregunta técnica o planteá una duda..."
              className="w-full bg-card border border-border rounded-[2rem] py-5 px-8 pr-16 focus:outline-none focus:ring-2 focus:ring-primary/50 font-medium text-sm shadow-xl"
            />
            <button 
              onClick={handleSend}
              className="absolute right-3 top-3 w-12 h-12 bg-primary text-white rounded-full flex items-center justify-center hover:scale-105 transition-all shadow-lg shadow-primary/20"
            >
              <Send size={18} />
            </button>
          </div>
          <p className="text-[9px] text-center mt-4 text-muted-foreground uppercase font-bold tracking-widest opacity-50">Tutor IA • Desarrollado por Antigravity para Escuela Ricardo Videla</p>
        </div>
      </div>
    </div>
  );
}
