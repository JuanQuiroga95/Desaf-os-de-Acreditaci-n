"use client";

import React, { useState, useEffect, useRef } from "react";
import { MessageSquare, X, Send, Bot, User, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

interface Message {
  role: "user" | "assistant";
  content: string;
}

export function AITutor() {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "¡Hola, cadete! Soy el Tutor Técnico de la Escuela Videla. ¿En qué parte del taller te has trabado? Recuerda: no te daré el esquema terminado, pero sí el plano para que lo pienses.",
    },
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMsg: Message = { role: "user", content: input };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsLoading(true);

    // Mock AI response for now - In a real app, this would call /api/chat
    setTimeout(() => {
      const assistantMsg: Message = {
        role: "assistant",
        content: "Interesante pregunta. Piénsalo como si estuvieras ajustando la presión de una manguera: si el flujo es demasiado fuerte para la boquilla (el LED), ¿qué tipo de válvula (resistencia) pondrías para que no explote? Revisa la Ley de Ohm.",
      };
      setMessages((prev) => [...prev, assistantMsg]);
      setIsLoading(true);
      
      // Simulate another technical analogy
      setTimeout(() => {
        setIsLoading(false);
      }, 1000);
    }, 1500);
  };

  return (
    <div className="fixed bottom-6 right-6 z-[100]">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="mb-4 w-96 h-[500px] glass rounded-3xl overflow-hidden flex flex-col shadow-2xl border border-primary/20"
          >
            {/* Header */}
            <div className="p-4 bg-primary/10 border-b border-primary/20 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-primary-foreground">
                  <Bot size={18} />
                </div>
                <div>
                  <h3 className="font-bold text-sm">Tutor Técnico Videla</h3>
                  <div className="flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                    <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-tighter">En Línea - Taller Central</span>
                  </div>
                </div>
              </div>
              <button 
                onClick={() => setIsOpen(false)}
                className="p-2 hover:bg-white/10 rounded-full transition-colors text-muted-foreground"
              >
                <X size={18} />
              </button>
            </div>

            {/* Chat Area */}
            <div 
              ref={scrollRef}
              className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-primary/20"
            >
              {messages.map((msg, i) => (
                <div key={i} className={cn("flex", msg.role === "user" ? "justify-end" : "justify-start")}>
                  <div className={cn(
                    "max-w-[85%] p-3 rounded-2xl text-sm leading-relaxed",
                    msg.role === "user" 
                      ? "bg-primary text-primary-foreground rounded-tr-none" 
                      : "bg-secondary/80 text-foreground border border-border rounded-tl-none"
                  )}>
                    {msg.content}
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-secondary/80 p-3 rounded-2xl rounded-tl-none border border-border flex gap-1">
                    <span className="w-1.5 h-1.5 bg-primary/50 rounded-full animate-bounce" />
                    <span className="w-1.5 h-1.5 bg-primary/50 rounded-full animate-bounce [animation-delay:0.2s]" />
                    <span className="w-1.5 h-1.5 bg-primary/50 rounded-full animate-bounce [animation-delay:0.4s]" />
                  </div>
                </div>
              )}
            </div>

            {/* Input Area */}
            <div className="p-4 border-t border-border bg-card">
              <div className="relative">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSend()}
                  placeholder="Haz una pregunta técnica..."
                  className="w-full bg-secondary border border-border rounded-xl py-3 px-4 pr-12 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all text-sm"
                />
                <button 
                  onClick={handleSend}
                  className="absolute right-2 top-1.5 p-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-all"
                >
                  <Send size={16} />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "w-14 h-14 rounded-full flex items-center justify-center transition-all duration-300 shadow-xl",
          isOpen ? "bg-secondary rotate-90" : "bg-primary hover:scale-110 active:scale-95 progress-glow"
        )}
      >
        {isOpen ? <X className="text-foreground" /> : <MessageSquare className="text-primary-foreground" />}
      </button>
    </div>
  );
}
