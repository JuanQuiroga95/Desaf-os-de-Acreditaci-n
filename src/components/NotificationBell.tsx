"use client";

import React, { useState, useEffect, useRef } from "react";
import { Bell, Check, ExternalLink } from "lucide-react";
import { getUnreadNotifications, markAsRead, markAllAsRead } from "@/app/actions/notifications";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

export function NotificationBell() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadNotifications();
    const interval = setInterval(loadNotifications, 60000); // Check every minute
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const loadNotifications = async () => {
    const res = await getUnreadNotifications();
    if (res.success && res.notifications) {
      setNotifications(res.notifications);
    }
  };

  const handleRead = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    await markAsRead(id);
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const handleReadAll = async () => {
    await markAllAsRead();
    setNotifications([]);
    setIsOpen(false);
  };

  const handleClickNotification = async (notification: any) => {
    await markAsRead(notification.id);
    setNotifications(prev => prev.filter(n => n.id !== notification.id));
    setIsOpen(false);
    if (notification.link) {
      router.push(notification.link);
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-xl text-muted-foreground hover:bg-secondary hover:text-foreground transition-all"
        title="Notificaciones"
      >
        <Bell size={20} />
        {notifications.length > 0 && (
          <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-card animate-pulse" />
        )}
      </button>

      {isOpen && (
        <div className="absolute top-full right-0 mt-2 w-80 bg-card border border-border rounded-2xl shadow-xl z-50 overflow-hidden flex flex-col max-h-[400px]">
          <div className="p-3 border-b border-border flex justify-between items-center bg-secondary/30">
            <h3 className="text-xs font-bold uppercase tracking-widest text-primary">Notificaciones</h3>
            {notifications.length > 0 && (
              <button 
                onClick={handleReadAll}
                className="text-[10px] text-muted-foreground hover:text-foreground uppercase tracking-wider font-semibold"
              >
                Marcar leídas
              </button>
            )}
          </div>
          
          <div className="overflow-y-auto flex-1 p-2 space-y-1">
            {notifications.length === 0 ? (
              <div className="p-4 text-center text-sm text-muted-foreground italic">
                No hay notificaciones nuevas.
              </div>
            ) : (
              notifications.map(n => (
                <div 
                  key={n.id} 
                  onClick={() => handleClickNotification(n)}
                  className={cn(
                    "p-3 rounded-xl border border-transparent hover:border-border hover:bg-secondary/50 transition-all cursor-pointer group flex gap-3",
                    !n.read && "bg-primary/5"
                  )}
                >
                  <div className="mt-0.5">
                    <div className="w-2 h-2 rounded-full bg-primary" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs font-bold mb-1 line-clamp-1">{n.title}</p>
                    <p className="text-xs text-muted-foreground line-clamp-2">{n.message}</p>
                    {n.link && (
                      <span className="text-[10px] text-primary flex items-center gap-1 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        Ver detalles <ExternalLink size={10} />
                      </span>
                    )}
                  </div>
                  <button 
                    onClick={(e) => handleRead(n.id, e)}
                    className="text-muted-foreground hover:text-green-500 opacity-0 group-hover:opacity-100 transition-all"
                    title="Marcar como leída"
                  >
                    <Check size={14} />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
