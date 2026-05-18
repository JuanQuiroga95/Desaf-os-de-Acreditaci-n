"use client";

import React, { useEffect, useState } from "react";
import {
  Zap,
  TrendingUp,
  Award,
  Trophy,
  BookOpen,
  Star,
  Flame,
  CheckCircle2,
  Lock,
} from "lucide-react";
import { motion } from "framer-motion";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { getUserAchievements } from "@/app/actions/student";

const ICON_MAP: Record<string, React.ElementType> = {
  Zap,
  TrendingUp,
  Award,
  Trophy,
  BookOpen,
  Star,
  Flame,
};

interface Achievement {
  id: string;
  title: string;
  desc: string;
  icon: string;
  color: string;
  unlocked: boolean;
  progress: number;
  total: number;
}

interface Stats {
  totalCompleted: number;
  avgScore: number;
  streak: number;
  subjectsWithProgress: number;
}

export default function LogrosPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [stats, setStats] = useState<Stats>({ totalCompleted: 0, avgScore: 0, streak: 0, subjectsWithProgress: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isLoading && (!user || user.role !== "student")) {
      router.push("/login");
    }
  }, [user, isLoading, router]);

  useEffect(() => {
    if (user?.id) {
      getUserAchievements(user.id).then((res) => {
        if (res.success) {
          setAchievements(res.achievements as Achievement[]);
          setStats(res.stats);
        }
        setLoading(false);
      });
    }
  }, [user]);

  if (isLoading || loading) {
    return (
      <div className="p-8 max-w-7xl mx-auto">
        <div className="animate-pulse space-y-8">
          <div className="h-16 bg-secondary rounded-[2.5rem] w-1/3" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[...Array(7)].map((_, i) => (
              <div key={i} className="h-64 bg-secondary rounded-[2.5rem]" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  const unlockedCount = achievements.filter((a) => a.unlocked).length;

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <header className="mb-16">
        <h1 className="text-6xl font-black tracking-tighter mb-4 uppercase italic leading-none">
          Tus <span className="text-primary">Logros</span>
        </h1>
        <div className="flex items-center gap-6">
          <p className="text-muted-foreground text-[10px] font-black uppercase tracking-[0.3em]">
            Reconocimientos a tu desempeño y competencias
          </p>
          <div className="h-px flex-1 bg-border/50" />
        </div>
      </header>

      {/* Stats bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-14">
        {[
          { label: "Desafíos completados", value: stats.totalCompleted, suffix: "" },
          { label: "Promedio general", value: stats.avgScore, suffix: "/10" },
          { label: "Racha de días", value: stats.streak, suffix: " días" },
          { label: "Logros obtenidos", value: unlockedCount, suffix: `/${achievements.length}` },
        ].map((s, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.07 }}
            className="bg-card border border-border rounded-[2rem] p-6 flex flex-col gap-1"
          >
            <span className="text-3xl font-black tracking-tighter leading-none">
              {s.value}
              <span className="text-base text-muted-foreground">{s.suffix}</span>
            </span>
            <span className="text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground">
              {s.label}
            </span>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {achievements.map((a, i) => {
          const Icon = ICON_MAP[a.icon] ?? Award;
          const pct = a.total > 0 ? Math.round((a.progress / a.total) * 100) : 0;
          return (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              key={a.id}
              className={`group p-8 rounded-[2.5rem] border flex flex-col items-center text-center transition-all duration-500 ${
                a.unlocked
                  ? "bg-card border-border hover:border-primary/50 shadow-sm hover:shadow-2xl hover:shadow-primary/5"
                  : "bg-secondary/10 border-border/50 opacity-50 grayscale shadow-inner"
              }`}
            >
              <div
                className={`w-20 h-20 rounded-[1.75rem] flex items-center justify-center mb-6 transition-transform group-hover:scale-110 ${
                  a.unlocked ? `bg-primary/10 ${a.color}` : "bg-muted text-muted-foreground"
                }`}
              >
                <Icon size={40} strokeWidth={a.unlocked ? 2.5 : 1.5} />
              </div>

              <h3 className="text-lg font-black uppercase tracking-tighter mb-2 leading-tight">
                {a.title}
              </h3>
              <p className="text-xs text-muted-foreground font-medium leading-relaxed mb-6">
                {a.desc}
              </p>

              <div className="mt-auto w-full space-y-2">
                {!a.unlocked && (
                  <>
                    <div className="flex justify-between text-[9px] font-black uppercase tracking-widest text-muted-foreground">
                      <span>Progreso</span>
                      <span>
                        {a.progress}/{a.total}
                      </span>
                    </div>
                    <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary/50 rounded-full transition-all duration-700"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </>
                )}

                {a.unlocked ? (
                  <div className="py-3 px-6 bg-primary/10 text-primary rounded-xl text-[9px] font-black uppercase tracking-[0.2em] border border-primary/20 flex items-center justify-center gap-2">
                    <CheckCircle2 size={14} />
                    Obtenido
                  </div>
                ) : (
                  <div className="py-3 px-6 bg-secondary rounded-xl text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground border border-border/50 flex items-center justify-center gap-2">
                    <Lock size={12} />
                    Bloqueado
                  </div>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>

      <section className="mt-24 p-12 bg-secondary/20 border border-border rounded-[3rem] relative overflow-hidden">
        <div className="absolute top-0 right-0 p-12 opacity-5">
          <Star size={200} />
        </div>
        <div className="max-w-2xl relative z-10">
          <h2 className="text-3xl font-black uppercase italic tracking-tighter mb-6">
            Seguí avanzando
          </h2>
          <p className="text-sm text-muted-foreground leading-relaxed font-medium mb-8">
            Completá más desafíos y mantené tu racha de estudio para desbloquear todos los logros. Cada paso cuenta hacia tu acreditación.
          </p>
          <div className="flex items-center gap-4">
            <div className="flex flex-col">
              <span className="text-[10px] font-black uppercase tracking-widest text-primary">
                {unlockedCount}/{achievements.length} Logros Obtenidos
              </span>
              <span className="text-[9px] text-muted-foreground uppercase font-bold tracking-widest">
                Acreditación Escuela N° 4-012
              </span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
