"use client";

import React, { useState, useRef, useEffect } from "react";
import { Send, Loader2, User as UserIcon, Bot, CheckCircle2 } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

export function RoleplayChat({ challenge, onFinish }: { challenge: any, onFinish: (chatLog: any[]) => void }) {
  const { user } = useAuth();
  const [messages, setMessages] = useState<{ role: "user" | "assistant", content: string }[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const personaje = challenge.content?.roleplayPersonaje || "Personaje Misterioso";
  const contexto = challenge.content?.roleplayContexto || "";

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  // Initial message
  useEffect(() => {
    if (messages.length === 0) {
      setMessages([
        { role: "assistant", content: `(Te encuentras con ${personaje}. Contexto: ${contexto})\n\n¡Hola! ¿Qué quieres decirme?` }
      ]);
    }
  }, []);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;
    const userMsg = input.trim();
    setInput("");
    
    const newMessages = [...messages, { role: "user" as const, content: userMsg }];
    setMessages(newMessages);
    setIsLoading(true);

    try {
      const response = await fetch("/api/roleplay-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-user-id": user!.id },
        body: JSON.stringify({ 
          messages: newMessages,
          personaje,
          contexto
        }),
      });

      if (!response.ok) throw new Error("Error en el chat");
      
      const data = await response.json();
      setMessages([...newMessages, { role: "assistant", content: data.content }]);
    } catch (error) {
      console.error(error);
      setMessages([...newMessages, { role: "assistant", content: "*Se queda en silencio mirándote confundido...*" }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-card">
      <div className="p-4 border-b border-border bg-secondary/10 shrink-0">
        <h3 className="font-black uppercase tracking-widest text-xs flex items-center gap-2">
          <Bot size={14} className="text-primary" />
          Conversando con: <span className="text-primary">{personaje}</span>
        </h3>
        <p className="text-[9px] text-muted-foreground mt-1 uppercase font-bold tracking-widest line-clamp-1">{contexto}</p>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((m, i) => (
          <div key={i} className={`flex gap-3 ${m.role === "user" ? "justify-end" : "justify-start"}`}>
            {m.role === "assistant" && (
              <div className="w-8 h-8 rounded-full bg-primary/20 text-primary flex items-center justify-center shrink-0">
                <Bot size={14} />
              </div>
            )}
            <div className={`p-4 rounded-2xl max-w-[85%] text-sm leading-relaxed ${
              m.role === "user" 
                ? "bg-primary text-white rounded-tr-sm" 
                : "bg-secondary/30 text-foreground border border-border rounded-tl-sm whitespace-pre-wrap"
            }`}>
              {m.content}
            </div>
            {m.role === "user" && (
              <div className="w-8 h-8 rounded-full bg-foreground text-background flex items-center justify-center shrink-0">
                <UserIcon size={14} />
              </div>
            )}
          </div>
        ))}
        {isLoading && (
          <div className="flex gap-3 justify-start animate-pulse">
            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
              <Bot size={14} className="text-primary opacity-50" />
            </div>
            <div className="p-4 rounded-2xl bg-secondary/30 border border-border rounded-tl-sm text-muted-foreground text-xs italic">
              {personaje} está escribiendo...
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 bg-secondary/10 border-t border-border flex flex-col gap-3 shrink-0">
        <div className="flex gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder={`Escríbele a ${personaje}...`}
            disabled={isLoading}
            className="flex-1 bg-background border border-border rounded-xl px-4 py-3 text-sm font-medium outline-none focus:ring-2 focus:ring-primary/50 disabled:opacity-50"
          />
          <button
            onClick={handleSend}
            disabled={isLoading || !input.trim()}
            className="w-12 h-12 bg-primary text-white rounded-xl flex items-center justify-center shadow-lg hover:bg-primary/90 disabled:opacity-50 transition-all shrink-0"
          >
            <Send size={16} />
          </button>
        </div>
        <button
          onClick={() => onFinish(messages)}
          className="w-full py-3 bg-secondary text-foreground rounded-xl font-black uppercase tracking-widest text-[9px] border border-border hover:bg-border transition-all flex items-center justify-center gap-2"
        >
          <CheckCircle2 size={14} />
          Finalizar Entrevista y Evaluar
        </button>
      </div>
    </div>
  );
}
