"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { BookOpen, Trophy, LayoutDashboard, MessageSquare, GraduationCap } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "Mis Desafíos", href: "/desafios", icon: BookOpen },
  { name: "Logros", href: "/logros", icon: Trophy },
  { name: "Tutor IA", href: "/tutor", icon: MessageSquare },
];

export function Sidebar() {
  const pathname = usePathname();
  const progress = 35; // Placeholder for logic

  return (
    <aside className="w-64 h-screen border-r border-border bg-card flex flex-col fixed left-0 top-0 z-50">
      <div className="p-6 flex items-center gap-3">
        <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center text-primary-foreground shadow-lg shadow-primary/20">
          <GraduationCap size={24} />
        </div>
        <div className="flex flex-col">
          <span className="font-bold text-lg tracking-tight">Videla-Acredita</span>
          <span className="text-xs text-muted-foreground uppercase tracking-widest">Escuela Ricardo Videla</span>
        </div>
      </div>

      <nav className="flex-1 px-4 py-6 space-y-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group",
                isActive 
                  ? "bg-primary/10 text-primary" 
                  : "text-muted-foreground hover:bg-secondary hover:text-foreground"
              )}
            >
              <Icon size={20} className={cn(isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground")} />
              <span className="font-medium">{item.name}</span>
              {isActive && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-primary" />}
            </Link>
          );
        })}
      </nav>

      <div className="p-6 mt-auto">
        <div className="bg-secondary/50 rounded-2xl p-4 border border-border">
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs font-semibold text-muted-foreground uppercase">Tu Progreso</span>
            <span className="text-xs font-bold text-primary">{progress}%</span>
          </div>
          <div className="w-full bg-muted h-2 rounded-full overflow-hidden">
            <div 
              className="bg-primary h-full transition-all duration-500 ease-out progress-glow"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-[10px] text-muted-foreground mt-3 leading-relaxed">
            Sigue así! Estás a 3 desafíos de completar la **Temporada 1**.
          </p>
        </div>
      </div>
    </aside>
  );
}
