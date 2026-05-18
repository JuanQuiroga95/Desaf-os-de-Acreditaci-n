"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { AlertTriangle, ArrowLeft, CheckCircle2, TrendingDown, Mail, BookOpen, Activity } from "lucide-react";
import { getAtRiskStudents } from "@/app/actions/teacher";
import { motion } from "framer-motion";
import Link from "next/link";

type RiskLevel = "ALL" | "HIGH" | "MEDIUM" | "LOW";

export default function AlertasPage() {
  const { user, isLoading: authLoading } = useAuth();
  const [atRiskList, setAtRiskList] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<RiskLevel>("ALL");

  useEffect(() => {
    if (user?.role === "teacher") {
      loadData();
    }
  }, [user]);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const res = await getAtRiskStudents(user!.id);
      if (res.success) {
        setAtRiskList(res.atRiskList);
      }
    } catch (error) {
      console.error("Error cargando alertas:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const filtered = filter === "ALL" ? atRiskList : atRiskList.filter(s => s.riskLevel === filter);

  const counts = {
    total: atRiskList.length,
    high: atRiskList.filter(s => s.riskLevel === "HIGH").length,
    medium: atRiskList.filter(s => s.riskLevel === "MEDIUM").length,
    low: atRiskList.filter(s => s.riskLevel === "LOW").length,
  };

  if (authLoading || isLoading) return (
    <div className="p-20 text-center font-black animate-pulse uppercase tracking-widest text-primary">
      Analizando Riesgos...
    </div>
  );
  if (!user || user.role !== "teacher") return (
    <div className="p-20 text-center font-black uppercase tracking-widest text-primary">Acceso Denegado</div>
  );

  const riskConfig = {
    HIGH: { label: "ALTO", bg: "bg-red-500/10", text: "text-red-500", border: "border-red-500/30", dot: "bg-red-500" },
    MEDIUM: { label: "MEDIO", bg: "bg-orange-500/10", text: "text-orange-500", border: "border-orange-500/30", dot: "bg-orange-500" },
    LOW: { label: "BAJO", bg: "bg-yellow-500/10", text: "text-yellow-500", border: "border-yellow-500/30", dot: "bg-yellow-500" },
  };

  const filterButtons: { key: RiskLevel; label: string; count: number }[] = [
    { key: "ALL", label: "Todos", count: counts.total },
    { key: "HIGH", label: "Alto", count: counts.high },
    { key: "MEDIUM", label: "Medio", count: counts.medium },
    { key: "LOW", label: "Bajo", count: counts.low },
  ];

  return (
    <div className="p-8 max-w-7xl mx-auto pb-24">
      <header className="mb-12">
        <Link href="/docente" className="flex items-center gap-2 text-primary font-black text-[10px] uppercase tracking-widest mb-4 hover:underline">
          <ArrowLeft size={14} /> Volver al Panel
        </Link>
        <h1 className="text-5xl font-black tracking-tighter uppercase italic leading-none">
          Alertas de <span className="text-primary">Riesgo</span>
        </h1>
        <p className="text-muted-foreground font-bold text-sm mt-2">
          Alumnos que requieren atención pedagógica prioritaria
        </p>
      </header>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
        {[
          { label: "Total en Riesgo", value: counts.total, color: "text-foreground", bg: "bg-secondary/30" },
          { label: "Riesgo Alto", value: counts.high, color: "text-red-500", bg: "bg-red-500/5" },
          { label: "Riesgo Medio", value: counts.medium, color: "text-orange-500", bg: "bg-orange-500/5" },
          { label: "Riesgo Bajo", value: counts.low, color: "text-yellow-500", bg: "bg-yellow-500/5" },
        ].map((stat, i) => (
          <div key={i} className={`${stat.bg} border border-border rounded-[2rem] p-6`}>
            <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground mb-2">{stat.label}</p>
            <p className={`text-4xl font-black ${stat.color}`}>{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Filter Buttons */}
      <div className="flex gap-3 mb-8 flex-wrap">
        {filterButtons.map(btn => (
          <button
            key={btn.key}
            onClick={() => setFilter(btn.key)}
            className={`px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest border transition-all ${
              filter === btn.key
                ? "bg-primary text-white border-primary shadow-lg shadow-primary/20"
                : "bg-secondary/30 text-muted-foreground border-border hover:border-primary/50"
            }`}
          >
            {btn.label} ({btn.count})
          </button>
        ))}
      </div>

      {/* Empty State */}
      {atRiskList.length === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card border border-border rounded-[2.5rem] p-20 text-center"
        >
          <CheckCircle2 size={64} className="mx-auto mb-6 text-green-500" />
          <h2 className="text-2xl font-black uppercase tracking-widest mb-2">
            ¡Todos los alumnos están en buen ritmo!
          </h2>
          <p className="text-muted-foreground font-bold text-sm">
            No se detectaron señales de riesgo en este momento.
          </p>
        </motion.div>
      )}

      {/* Risk Cards */}
      {filtered.length > 0 && (
        <div className="space-y-4">
          {filtered.map((student, i) => {
            const cfg = riskConfig[student.riskLevel as keyof typeof riskConfig];
            return (
              <motion.div
                key={`${student.studentId}-${student.subjectId}`}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="bg-card border border-border rounded-[2rem] p-8 hover:border-primary/40 transition-all"
              >
                <div className="flex items-start justify-between gap-6">
                  <div className="flex items-start gap-6 flex-1">
                    {/* Avatar */}
                    <div className="w-14 h-14 rounded-full bg-secondary flex items-center justify-center font-black text-xl text-primary shrink-0">
                      {student.studentName.charAt(0)}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-1 flex-wrap">
                        <h3 className="text-xl font-black">{student.studentName}</h3>
                        <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${cfg.bg} ${cfg.text} ${cfg.border} flex items-center gap-1.5`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot} inline-block`} />
                          Riesgo {cfg.label}
                        </span>
                      </div>

                      <div className="flex items-center gap-4 mb-4 flex-wrap">
                        <span className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                          <BookOpen size={12} className="text-primary" />
                          {student.subjectName}
                        </span>
                        <span className="flex items-center gap-1.5 text-[10px] font-bold text-muted-foreground">
                          <Mail size={12} />
                          {student.studentEmail}
                        </span>
                      </div>

                      {/* Risk Flags */}
                      <div className="flex flex-wrap gap-2 mb-4">
                        {student.risks.map((risk: string, ri: number) => (
                          <span
                            key={ri}
                            className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider ${cfg.bg} ${cfg.text} border ${cfg.border}`}
                          >
                            {risk}
                          </span>
                        ))}
                      </div>

                      {/* Progress Bar */}
                      <div className="flex items-center gap-4">
                        <div className="flex-1 bg-secondary rounded-full h-2 overflow-hidden max-w-xs">
                          <div
                            className="h-full bg-primary transition-all duration-500"
                            style={{ width: `${student.progressPercent}%` }}
                          />
                        </div>
                        <span className="text-[10px] font-black text-muted-foreground whitespace-nowrap">
                          {student.completedChallenges}/{student.totalChallenges} desafíos ({student.progressPercent}%)
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Action */}
                  <Link
                    href={`/docente/students/${student.studentId}`}
                    className="shrink-0 px-6 py-3 bg-primary/10 text-primary border border-primary/20 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-primary hover:text-white transition-all flex items-center gap-2"
                  >
                    <Activity size={14} />
                    Ver Legajo
                  </Link>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Filtered empty state */}
      {atRiskList.length > 0 && filtered.length === 0 && (
        <div className="bg-card border border-border rounded-[2.5rem] p-16 text-center">
          <TrendingDown size={40} className="mx-auto mb-4 text-muted-foreground opacity-20" />
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground">
            No hay alumnos con ese nivel de riesgo
          </p>
        </div>
      )}
    </div>
  );
}
