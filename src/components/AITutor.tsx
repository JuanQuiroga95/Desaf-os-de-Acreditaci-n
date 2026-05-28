"use client";

import React, { useState, useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { MessageSquare, X, Send, Bot, User, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import ReactMarkdown from "react-markdown";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import "katex/dist/katex.min.css";

interface Message {
  role: "user" | "assistant";
  content: string;
}

import { useUI } from "@/context/UIContext";
import { useAuth } from "@/context/AuthContext";

export function AITutor() {
  const { isAIBlocked } = useUI();
  const { user } = useAuth();
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "¡Hola! Soy tu Tutor de Recuperación Activa. Mi objetivo es que aprendas haciendo en cada encuentro. ¿En qué ejercicio o texto te gustaría trabajar hoy? Recordá que puedo explicarte conceptos, corregir tus pasos o crear ejercicios de práctica.",
    },
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const suggestedPrompts = [
    { label: "Corregir ejercicio", prompt: "Corregime este ejercicio paso a paso y explicame en qué me equivoqué y por qué: " },
    { label: "Explicar concepto", prompt: "Explicame qué es un número racional como si tuviera 14 años." },
    { label: "Crear práctica", prompt: "Creame 3 ejercicios similares a este con sus soluciones completas: " },
    { label: "Idea Principal", prompt: "Leé este texto y explicame cuál es la idea principal y las secundarias: " },
  ];

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async (customPrompt?: string) => {
    const textToSend = customPrompt || input;
    if (!textToSend.trim() || isLoading) return;

    const userMsg: Message = { role: "user", content: textToSend };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    if (!customPrompt) setInput("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-user-id": user?.id || "" },
        body: JSON.stringify({ messages: newMessages, currentPath: pathname }),
      });

      const data = await response.json();
      
      if (data.error) throw new Error(data.error);

      setMessages((prev) => [...prev, { role: "assistant", content: data.content }]);
    } catch (error) {
      console.error(error);
      setMessages((prev) => [...prev, { 
        role: "assistant", 
        content: "Se cortó la conexión con el aula (Error de API). Por favor, intenta de nuevo." 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  if (isAIBlocked) return null;

  return (
    <div className="fixed bottom-6 right-6 z-[100]">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="mb-2 w-96 max-h-[calc(100vh-120px)] bg-card rounded-3xl overflow-hidden flex flex-col shadow-2xl border border-primary/20"
          >
            {/* Header */}
            <div className="p-4 bg-primary/25 border-b border-primary/30 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-primary-foreground">
                  <Bot size={18} />
                </div>
                <div>
                  <h3 className="font-bold text-sm">Tutor de Recuperación</h3>
                  <div className="flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                    <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-tighter">En Línea - Escuela Videla</span>
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
                    "max-w-[85%] p-3 rounded-2xl text-sm leading-relaxed prose prose-sm dark:prose-invert prose-p:leading-snug prose-pre:bg-black/50",
                    msg.role === "user" 
                      ? "bg-primary text-primary-foreground rounded-tr-none" 
                      : "bg-secondary text-foreground border border-border rounded-tl-none"
                  )}>
                    <ReactMarkdown 
                      remarkPlugins={[remarkMath]} 
                      rehypePlugins={[rehypeKatex]}
                      className="break-words"
                    >
                      {msg.content}
                    </ReactMarkdown>
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-secondary p-3 rounded-2xl rounded-tl-none border border-border flex gap-1">
                    <span className="w-1.5 h-1.5 bg-primary/50 rounded-full animate-bounce" />
                    <span className="w-1.5 h-1.5 bg-primary/50 rounded-full animate-bounce [animation-delay:0.2s]" />
                    <span className="w-1.5 h-1.5 bg-primary/50 rounded-full animate-bounce [animation-delay:0.4s]" />
                  </div>
                </div>
              )}
            </div>

            {/* Suggested Prompts Area */}
            <div className="px-4 py-2 flex flex-wrap gap-2 border-t border-border bg-secondary/5">
              {suggestedPrompts.map((item, i) => (
                <button
                  key={i}
                  onClick={() => {
                    setInput(item.prompt);
                    // scroll to input
                  }}
                  className="text-[9px] font-black uppercase tracking-wider bg-card border border-border px-3 py-1.5 rounded-full hover:border-primary/50 hover:text-primary transition-all"
                >
                  {item.label}
                </button>
              ))}
            </div>

            {/* Input Area */}
            <div className="p-4 border-t border-border bg-card">
              <div className="relative">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSend()}
                  placeholder="Pegá tu ejercicio o consultá..."
                  className="w-full bg-secondary border border-border rounded-xl py-3 px-4 pr-12 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all text-sm"
                />
                <button 
                  onClick={() => handleSend()}
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
