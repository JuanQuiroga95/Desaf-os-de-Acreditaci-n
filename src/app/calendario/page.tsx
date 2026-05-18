"use client";

import React, { useEffect, useState } from "react";
import { CalendarDays, Clock, MapPin, CalendarX, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { getMyExamDates } from "@/app/actions/student";

interface ExamDate {
  id: string;
  date: string | Date;
  time: string | null;
  room: string | null;
  notes: string | null;
  subject: { id: string; name: string };
}

function getDaysUntil(date: Date): number {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return Math.round((d.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
}

function formatDateES(date: Date): string {
  return date.toLocaleDateString("es-AR", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function getMonthLabel(date: Date): string {
  return date.toLocaleDateString("es-AR", { month: "long", year: "numeric" });
}

function urgencyBadge(daysUntil: number) {
  if (daysUntil < 0) {
    return { label: "Finalizada", classes: "bg-secondary text-muted-foreground border-border/50" };
  }
  if (daysUntil === 0) {
    return { label: "Hoy", classes: "bg-red-500/15 text-red-500 border-red-500/30" };
  }
  if (daysUntil <= 7) {
    return { label: `En ${daysUntil} día${daysUntil === 1 ? "" : "s"}`, classes: "bg-red-500/15 text-red-500 border-red-500/30" };
  }
  if (daysUntil <= 14) {
    return { label: `En ${daysUntil} días`, classes: "bg-yellow-500/15 text-yellow-600 border-yellow-500/30" };
  }
  return { label: `En ${daysUntil} días`, classes: "bg-green-500/15 text-green-600 border-green-500/30" };
}

export default function CalendarioPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [examDates, setExamDates] = useState<ExamDate[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isLoading && (!user || user.role !== "student")) {
      router.push("/login");
    }
  }, [user, isLoading, router]);

  useEffect(() => {
    if (user?.id) {
      getMyExamDates(user.id).then((res) => {
        if (res.success) {
          setExamDates(res.examDates as ExamDate[]);
        }
        setLoading(false);
      });
    }
  }, [user]);

  if (isLoading || loading) {
    return (
      <div className="p-8 max-w-5xl mx-auto">
        <div className="animate-pulse space-y-8">
          <div className="h-16 bg-secondary rounded-[2.5rem] w-1/3" />
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-32 bg-secondary rounded-[2.5rem]" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Group by month
  const grouped: Record<string, ExamDate[]> = {};
  for (const ed of examDates) {
    const date = new Date(ed.date);
    const key = getMonthLabel(date);
    if (!grouped[key]) grouped[key] = [];
    grouped[key].push(ed);
  }
  const months = Object.keys(grouped);

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <header className="mb-16">
        <h1 className="text-6xl font-black tracking-tighter mb-4 uppercase italic leading-none">
          Calendario de <span className="text-primary">Mesas</span>
        </h1>
        <div className="flex items-center gap-6">
          <p className="text-muted-foreground text-[10px] font-black uppercase tracking-[0.3em]">
            Fechas de examen para tus materias inscriptas
          </p>
          <div className="h-px flex-1 bg-border/50" />
        </div>
      </header>

      {months.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center justify-center py-32 gap-6"
        >
          <div className="w-24 h-24 rounded-[2rem] bg-secondary flex items-center justify-center">
            <CalendarX size={48} className="text-muted-foreground" />
          </div>
          <div className="text-center">
            <h2 className="text-2xl font-black uppercase tracking-tighter mb-2">Sin fechas cargadas</h2>
            <p className="text-sm text-muted-foreground font-medium max-w-sm leading-relaxed">
              El docente o administrador aún no cargó las fechas de mesa para tus materias.
            </p>
          </div>
        </motion.div>
      ) : (
        <div className="space-y-14">
          {months.map((month, mi) => (
            <section key={month}>
              <div className="flex items-center gap-4 mb-6">
                <h2 className="text-[11px] font-black uppercase tracking-[0.3em] text-muted-foreground capitalize">
                  {month}
                </h2>
                <div className="h-px flex-1 bg-border/50" />
                <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground border border-border rounded-full px-3 py-1">
                  {grouped[month].length} fecha{grouped[month].length !== 1 ? "s" : ""}
                </span>
              </div>

              <div className="space-y-4">
                {grouped[month].map((ed, i) => {
                  const date = new Date(ed.date);
                  const daysUntil = getDaysUntil(date);
                  const isPast = daysUntil < 0;
                  const badge = urgencyBadge(daysUntil);

                  return (
                    <motion.div
                      key={ed.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: mi * 0.05 + i * 0.06 }}
                      className={`flex items-center gap-6 p-6 rounded-[2rem] border transition-all duration-300 ${
                        isPast
                          ? "bg-secondary/10 border-border/40 opacity-60 grayscale"
                          : "bg-card border-border hover:border-primary/40 hover:shadow-lg hover:shadow-primary/5"
                      }`}
                    >
                      {/* Date block */}
                      <div className="shrink-0 w-20 h-20 rounded-[1.5rem] bg-primary/10 border border-primary/20 flex flex-col items-center justify-center">
                        <span className="text-2xl font-black leading-none text-primary">
                          {date.getDate()}
                        </span>
                        <span className="text-[9px] font-black uppercase tracking-widest text-primary/70">
                          {date.toLocaleDateString("es-AR", { month: "short" })}
                        </span>
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-black uppercase tracking-tighter leading-tight mb-1 truncate">
                          {ed.subject.name}
                        </h3>
                        <p className="text-xs text-muted-foreground font-medium capitalize mb-2">
                          {formatDateES(date)}
                        </p>
                        <div className="flex flex-wrap gap-3">
                          {ed.time && (
                            <span className="flex items-center gap-1 text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                              <Clock size={11} />
                              {ed.time}
                            </span>
                          )}
                          {ed.room && (
                            <span className="flex items-center gap-1 text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                              <MapPin size={11} />
                              {ed.room}
                            </span>
                          )}
                        </div>
                        {ed.notes && (
                          <p className="text-[10px] text-muted-foreground mt-1 leading-relaxed">{ed.notes}</p>
                        )}
                      </div>

                      {/* Badge */}
                      <div className="shrink-0">
                        <span
                          className={`px-4 py-2 rounded-full text-[9px] font-black uppercase tracking-[0.2em] border ${badge.classes}`}
                        >
                          {badge.label}
                        </span>
                      </div>

                      {!isPast && <ChevronRight size={18} className="shrink-0 text-muted-foreground" />}
                    </motion.div>
                  );
                })}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
