"use client";

import React, { useEffect, useState, useRef } from "react";
import { useAuth } from "@/context/AuthContext";
import { getChatContacts, getConversation, sendMessage } from "@/app/actions/chat";
import { Send, User as UserIcon, Loader2, ArrowLeft } from "lucide-react";

export default function MensajesPage() {
  const { user } = useAuth();
  const [contacts, setContacts] = useState<any[]>([]);
  const [selectedContact, setSelectedContact] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [isLoadingContacts, setIsLoadingContacts] = useState(true);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadContacts();
  }, []);

  useEffect(() => {
    if (selectedContact) {
      loadMessages(selectedContact.id);
      // Opcional: polling cada 10 seg
      const interval = setInterval(() => loadMessages(selectedContact.id, true), 10000);
      return () => clearInterval(interval);
    }
  }, [selectedContact]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const loadContacts = async () => {
    const res = await getChatContacts();
    if (res.success) {
      setContacts(res.contacts);
    }
    setIsLoadingContacts(false);
  };

  const loadMessages = async (contactId: string, background = false) => {
    if (!background) setIsLoadingMessages(true);
    const res = await getConversation(contactId);
    if (res.success) {
      setMessages(res.messages);
      // Limpiar unread
      setContacts(prev => prev.map(c => c.id === contactId ? { ...c, unreadCount: 0 } : c));
    }
    if (!background) setIsLoadingMessages(false);
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedContact) return;

    setIsSending(true);
    const text = newMessage;
    setNewMessage("");

    // Optimistic update
    const tempMsg = {
      id: Date.now().toString(),
      content: text,
      senderId: user?.id,
      createdAt: new Date().toISOString(),
    };
    setMessages(prev => [...prev, tempMsg]);

    const res = await sendMessage(text, selectedContact.id);
    if (!res.success) {
      // Revert if failed
      setMessages(prev => prev.filter(m => m.id !== tempMsg.id));
      setNewMessage(text);
    } else {
      // Re-fetch to get actual ID (or just update tempMsg if we parsed res.message)
      loadMessages(selectedContact.id, true);
    }
    setIsSending(false);
  };

  if (!user) return null;

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto h-[calc(100vh-4rem)] flex gap-6">
      {/* Lista de Contactos */}
      <div className={`w-full md:w-1/3 bg-card border border-border rounded-2xl flex flex-col overflow-hidden shadow-sm ${selectedContact ? 'hidden md:flex' : 'flex'}`}>
        <div className="p-6 border-b border-border bg-secondary/10">
          <h2 data-tour-id="mensajes-title" className="text-lg font-black uppercase tracking-widest italic">Mensajes</h2>
        </div>
        <div data-tour-id="mensajes-contacts" className="flex-1 overflow-y-auto">
          {isLoadingContacts ? (
            <div className="p-8 text-center text-muted-foreground"><Loader2 className="animate-spin mx-auto" /></div>
          ) : contacts.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground text-sm font-bold">No tienes contactos disponibles.</div>
          ) : (
            contacts.map(c => (
              <button
                key={c.id}
                onClick={() => setSelectedContact(c)}
                className={`w-full text-left p-4 border-b border-border hover:bg-secondary/50 transition-colors flex items-center gap-3 ${selectedContact?.id === c.id ? 'bg-primary/5' : ''}`}
              >
                <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary shrink-0 relative overflow-hidden">
                  {c.avatarId ? (
                    <img src={c.avatarId} alt={c.name} className="w-full h-full object-cover" />
                  ) : (
                    <UserIcon size={20} />
                  )}
                  {c.unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-white text-[8px] font-black flex items-center justify-center">
                      {c.unreadCount}
                    </span>
                  )}
                </div>
                <div className="overflow-hidden flex-1">
                  <p className="font-bold text-sm truncate">{c.name}</p>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-widest">{c.role === 'TEACHER' ? 'Profesor' : 'Alumno'}</p>
                </div>
              </button>
            ))
          )}
        </div>
      </div>

      {/* Área de Chat */}
      <div className={`w-full md:w-2/3 bg-card border border-border rounded-2xl flex flex-col overflow-hidden shadow-sm ${!selectedContact ? 'hidden md:flex items-center justify-center bg-secondary/10' : 'flex'}`}>
        {!selectedContact ? (
          <div className="text-center text-muted-foreground">
            <MessageSquareIcon size={48} className="mx-auto mb-4 opacity-20" />
            <p className="font-bold uppercase tracking-widest text-xs">Selecciona un chat</p>
          </div>
        ) : (
          <>
            <div className="p-4 md:p-6 border-b border-border bg-secondary/10 flex items-center gap-4">
              <button onClick={() => setSelectedContact(null)} className="md:hidden p-2 rounded-lg bg-background hover:bg-secondary">
                <ArrowLeft size={20} />
              </button>
              <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary shrink-0 overflow-hidden">
                {selectedContact.avatarId ? (
                  <img src={selectedContact.avatarId} alt={selectedContact.name} className="w-full h-full object-cover" />
                ) : (
                  <UserIcon size={20} />
                )}
              </div>
              <div>
                <h3 className="font-black text-sm uppercase">{selectedContact.name}</h3>
                <p className="text-[10px] text-muted-foreground uppercase tracking-widest">{selectedContact.role === 'TEACHER' ? 'Profesor' : 'Alumno'}</p>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4 bg-background/50">
              {isLoadingMessages ? (
                <div className="text-center p-8"><Loader2 className="animate-spin mx-auto text-primary" /></div>
              ) : messages.length === 0 ? (
                <div className="text-center text-muted-foreground text-xs font-bold p-8">No hay mensajes. ¡Escribe el primero!</div>
              ) : (
                messages.map(msg => {
                  const isMine = msg.senderId === user.id;
                  return (
                    <div key={msg.id} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[80%] rounded-2xl p-4 ${isMine ? 'bg-primary text-primary-foreground rounded-tr-none' : 'bg-secondary text-secondary-foreground rounded-tl-none border border-border'}`}>
                        <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                        <p className={`text-[9px] mt-2 uppercase tracking-widest font-bold ${isMine ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}>
                          {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            <form onSubmit={handleSend} className="p-4 border-t border-border bg-card flex gap-3">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Escribe tu mensaje..."
                className="flex-1 bg-background border border-border rounded-xl px-4 text-sm focus:outline-none focus:border-primary/50"
              />
              <button
                type="submit"
                disabled={isSending || !newMessage.trim()}
                className="w-12 h-12 bg-primary text-white rounded-xl flex items-center justify-center hover:bg-primary/90 disabled:opacity-50 transition-all shrink-0"
              >
                {isSending ? <Loader2 size={20} className="animate-spin" /> : <Send size={20} />}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}

const MessageSquareIcon = ({ size, className }: { size: number; className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
  </svg>
);
