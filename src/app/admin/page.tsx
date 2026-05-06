"use client";

import React from "react";
import { BookOpen, Users, Plus, ArrowRight, ShieldCheck, Settings } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { redirect } from "next/navigation";

export default function AdminPage() {
  const { user } = useAuth();

  if (user?.role !== "admin") {
    return <div className="p-20 text-center font-bold">Acceso Denegado</div>;
  }

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <header className="mb-12 flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-black tracking-tight mb-2 uppercase italic">Panel de Control Admin</h1>
          <p className="text-muted-foreground text-lg uppercase text-xs font-bold tracking-widest leading-relaxed">
            Escuela Ricardo Videla - Gestión de Infraestructura Educativa
          </p>
        </div>
        <div className="flex gap-4">
          <button className="bg-primary text-primary-foreground px-6 py-3 rounded-2xl font-bold flex items-center gap-2 hover:bg-primary/90 transition-all shadow-lg shadow-primary/20">
            <Plus size={20} />
            Nueva Materia
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        {[
          { label: "Docentes Activos", value: "24", icon: Users, color: "text-blue-500" },
          { label: "Materias Creadas", value: "12", icon: BookOpen, color: "text-green-500" },
          { label: "Alumnos Registrados", value: "450", icon: ShieldCheck, color: "text-purple-500" },
        ].map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div key={i} className="bg-card border border-border p-6 rounded-3xl shadow-sm">
              <div className="flex justify-between items-start mb-4">
                <div className={`p-3 rounded-2xl bg-secondary ${stat.color}`}>
                  <Icon size={24} />
                </div>
                <span className="text-3xl font-black">{stat.value}</span>
              </div>
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest leading-none">{stat.label}</p>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <section className="bg-card border border-border rounded-3xl overflow-hidden shadow-sm">
          <div className="p-6 border-b border-border flex justify-between items-center">
            <h2 className="font-bold flex items-center gap-2 italic uppercase text-sm">
              <BookOpen size={18} className="text-primary" />
              Gestión de Materias
            </h2>
            <button className="text-[10px] font-black text-primary hover:underline uppercase tracking-widest">Ver Todas</button>
          </div>
          <div className="divide-y divide-border">
            {[
              { name: "Matemática Aplicada", doc: "Juan Quiroga", status: "Activo" },
              { name: "Lengua y Comunicación", doc: "Sin Asignar", status: "Pendiente" },
              { name: "Biología y Desarrollo", doc: "Ana Martínez", status: "Activo" },
            ].map((item, i) => (
              <div key={i} className="p-4 px-6 flex justify-between items-center hover:bg-secondary/30 transition-colors">
                <div>
                  <p className="font-bold text-sm">{item.name}</p>
                  <p className="text-[10px] text-muted-foreground uppercase font-medium">Docente: {item.doc}</p>
                </div>
                <div className="flex items-center gap-4">
                  <span className={`text-[10px] font-black uppercase px-2 py-1 rounded-md ${item.status === "Activo" ? "bg-green-500/10 text-green-500" : "bg-yellow-500/10 text-yellow-500"}`}>
                    {item.status}
                  </span>
                  <button className="p-2 hover:bg-secondary rounded-lg transition-colors">
                    <Settings size={16} className="text-muted-foreground" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="bg-card border border-border rounded-3xl overflow-hidden">
          <div className="p-6 border-b border-border flex justify-between items-center">
            <h2 className="font-bold flex items-center gap-2">
              <Users size={18} className="text-primary" />
              Docentes Recientes
            </h2>
            <button className="text-xs font-bold text-primary hover:underline uppercase tracking-widest">Gestionar</button>
          </div>
          <div className="p-6 space-y-4">
             {[
              { name: "Prof. Juan Quiroga", mail: "juan@videla.edu.ar", initial: "J" },
              { name: "Dra. Ana Martínez", mail: "ana@videla.edu.ar", initial: "A" },
            ].map((doc, i) => (
              <div key={i} className="flex items-center gap-4 p-3 bg-secondary/30 rounded-2xl border border-border/50">
                <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">
                  {doc.initial}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-bold">{doc.name}</p>
                  <p className="text-xs text-muted-foreground">{doc.mail}</p>
                </div>
                <button className="text-primary hover:bg-primary/10 p-2 rounded-xl transition-all">
                  <ArrowRight size={18} />
                </button>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
